
var animation = wx.createAnimation({
  duration: 50,
  timingFunction: 'linear',
  delay: 0
})

import regeneratorRuntime from '../../runtime.js'
import {FOLDER_PRIVATE,FOLDER_CREATE,FOLDER_TREE,FILE_MOVE} from '../../utils/api'
import * as request from '../../utils/request.js';
const app = getApp()

Component({
  // options: {
  //   styleIsolation: 'apply-shared'
  // },
  /**
   * 组件的属性列表
   */
  properties: {
    // 组件的初始显隐
    actionShow: {
      type: Boolean,
      value: false,
      observer: function (newVal, oldVal) {
        this.animation = animation
        animation.opacity(0).step()
        // 显示
        if (newVal) {
          this.setData({
            actionVisible: true,
            mask: '',
            animation: 'showAction',
            actionShow:true
          })
          console.log(333333333,this.data.options)
          this.targetParentFileSid = this.data.options.targetParentFileSid
          this.setData({parentFolderId:this.data.options.id,
            isOldPath:this.targetParentFileSid==this.data.options.id,
            pathList:this.data.options.pathList?JSON.parse(this.data.options.pathList):[]})
          this.targetId = this.data.options.targetId
          this.targetName = this.data.options.targetName
          this.getData()

        } else {
          this.setData({
            animation: 'hideAction',
            mask: 'transparent'
          })
          setTimeout(()=>{
            this.setData({
              actionVisible: false,//用来解决直接设置Prop（actionShow），取消动画会失效问题
              actionShow:false
            })
          }, 50)
        }
      }
    },
    options:{
      type:Object,
      value:{},
      observer:function(newVal,oldVal){
        this.setData({options:newVal})
      }
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    mask: '',
    animation: 'showAction',
    actionVisible:false,//用来解决直接设置Prop（actionShow），取消动画会失效问题

    options:{},
    loading:false,
    fileList:[],
    showModal:false,
    modalInputTxt:'',
    operationActionSheetVisible:false,
    currentAction:'',
    modalTitle:'',
    madalPlaceholder:'',
    currentItem:null,
    autoFocus:false,
    modalTip:'',
    pageFrom:'',//区分文件页面来源：空或搜索页面search
    loadingMore:false,
    hasNoMore:false,
    refresherTriggered:false,
    submiting:false,
    pageNo:1,
    searchStatus:false,

    parentFolderId:'',
    isOldPath:false,
    move_submiting:false,
    preFileSid:'',
    isRootSpace:false,
    pathList:[]
  },

  /**
   * 组件的方法列表
   */
  methods: {
    async getData(){
      console.log('getdata.....')
      this.setData({loading:true,pageNo:1,hasNoMore:false})//,fileList:[]
      this.pageSize=20
      let res = await this.loadMore()
      return res
    },
    async loadMore(){
      try{
          if(this.data.hasNoMore){
            return
          }
          if(this.data.pageNo>1){
            this.setData({loadingMore:true})
          }
          let res = await request.post(FOLDER_TREE,{
            parentFileSid:this.data.parentFolderId,
            // type:this.parentFolderType,//0:私有空间的文件夹;1:共享空间的文件夹
            sort:this.sortDesc,
            pageNo:this.data.pageNo,
            pageSize:this.pageSize,
            fileType:'folder'
          })
          this.totalNumber = res.data.totalNumber
          let newList = res.data.list
          if(Array.isArray(newList)&&newList.length){
            //是否有操作权限
            newList.forEach(it=>{
              app.dealFileItem(it)
            })
            if(this.data.pageNo==1){
              this.setData({fileList:newList})
            }
            else{
              let list = [...this.data.fileList,...newList]
              this.setData({fileList:list})
            }
            if(this.pageSize*this.data.pageNo>=this.totalNumber){
              this.setData({hasNoMore:true})
            }
            else{
              this.setData({pageNo:this.data.pageNo+1})
            }
          }
          else{
            if(this.data.pageNo==1){
              this.setData({fileList:[]})
            }
            this.setData({hasNoMore:true})
          }
  
          if(this.data.pageNo==1){
            this.setData({preFileSid:res.data.grandparentFileSid})
            if(!res.data.grandparentFileSid){
              this.getMyFolder()
              this.setData({isOldPath:true})
            }
          }
          return res
      }
      finally{
        this.setData({loading:false,loadingMore:false})
      }
    },
   //下拉刷新
    async onRefresh(){
      if (this._freshing) return
      this._freshing = true
      try{
        await this.getData()
      }
      finally{
        this.setData({refresherTriggered: false})
        this._freshing = false
      }
    },
    goDetail(event){
      let item = event.detail.item
      let currPathList =  JSON.parse(JSON.stringify(this.data.pathList))
      currPathList.push(item.name)
      if(item.type!=='folder'){
      }
      else{
        this.setData({parentFolderId:item.id})
        this.getData()
        // wx.navigateTo({
        //   url: `../fileMove/index?id=${item.id}&name=${item.name}
        //   &targetId=${this.targetId}&targetName=${this.targetName}&targetParentFileSid=${this.targetParentFileSid}
        //   &pathList=${JSON.stringify(currPathList)}
        //   `
        // })
      }
    },
    //排序数据
    sortData(e){
      console.log('sort data....', e.detail.sortDesc)
      this.sortDesc = e.detail.sortDesc
      this.getData()
    },
    //新建文件夹
    showAddFolderModal(){
      this.setData({
        modalInputTxt:'',
        currentAction:'addFoler',
        modalTitle:'新建文件夹',
        madalPlaceholder:'文件夹名',
        showModal: true,
        autoFocus:true,
      })
    },
    bindinputModal(e){
      let val = e.detail.value
      let reg = app.globalData.fileNameRegex
      if(reg.test(val)){
        val=val.replace(reg,'')
      }
      this.setData({modalInputTxt:val})
    },
    clearInput(){
      this.setData({modalInputTxt:''})
    },
    async modalComplete(e){
      if(!this.data.modalInputTxt.trim())return
      if(this.data.submiting)return
      this.setData({submiting:true})
      console.log('modal sure...',this.data.modalInputTxt,e)
      let list = this.data.fileList
      if(this.data.currentAction=="addFoler"){
        try{
          let res = await request.post(FOLDER_CREATE,{
            parentFileSid:this.data.parentFolderId,
            name:this.data.modalInputTxt.trim(),
            // type:this.parentFolderType,//0:私有空间的文件夹;1:共享空间的文件夹
          })
          //追加数据，不直接刷新
          if(res.data){
            app.dealFileItem(res.data)
            list.push({...res.data,type:'folder',isWrite:true,isRead:true})
            this.setData({fileList:list})
          }
          else{
            this.getData()
          }
          this.setData({ showModal: false})
        }
        finally{
          this.setData({submiting:false})
        }
      }
    },
  
    //fileList 操作之后 回调 重置fileList
    reSetList(e){
      this.setData({fileList:e.detail.list})
    },
    search(e){
      this.setData({searchStatus:e.detail.searchStatus})
    },
    async getMyFolder(){
      let userInfo = wx.getStorageSync('userInfo')
      let {data} = await request.post(FOLDER_PRIVATE)
      let myfileName =data.name?data.name:"我的空间("+userInfo.uid+")"
      this.setData({fileList:[{id:data.fileSid,type:'folder',name:myfileName},...this.data.fileList]})
    },
    //确认移动
    async confirmMove(){
      
      console.log({
        name:this.targetName,
        fileSid:this.targetId,
        parentFileSid:this.data.parentFolderId
      })
  
      //显示确认弹框
      let self = this
      wx.showModal({
        content:'移动操作会更改该文件或文件夹的权限，确认移动？',
        confirmColor:"#C95E57",
        confirmText:'确认',
        cancelColor:'#4F79B4',
        async success(res){
          if (res.confirm) {
            try{
              self.setData({move_submiting:true})
              let res = await request.post(FILE_MOVE,{
                name:self.targetName,
                fileSid:self.targetId,
                parentFileSid:self.data.parentFolderId
              })
              if(res.errcode==0){
                  self.exitMove(()=>{
                      wx.showToast({
                        title: '已完成',
                        icon:'success'
                      })
                      //从列表中移除该文件
                      let page = getCurrentPages().pop()
                      console.log(33333333,page)
                      if(page&&page.removeMoveFile){
                        page.removeMoveFile(self.targetId)
                      }
                  })
              }
            }
            finally{
              self.setData({move_submiting:true})
            }
          }
        },
        fail(){
        },
        complete(){}
      })
    },
    goPreMove(){
      let currPathList =  JSON.parse(JSON.stringify(this.data.pathList))
      let currentName='新华三网盘'
      if(currPathList.length){
       currentName = currPathList.pop()
      }
      // wx.navigateTo({
      //   url: `../fileMove/index?id=${this.data.preFileSid}&name=${currentName}
      //   &targetId=${this.targetId}&targetParentFileSid=${this.targetParentFileSid}
      //   &pathList=${JSON.stringify(currPathList)}`
      // })
    },
    exitMove(cb){
      this.setData({
        animation: 'hideAction',
        mask: 'transparent'
      })
      setTimeout(()=>{
        this.setData({
          actionVisible: false,//用来解决直接设置Prop（actionShow），取消动画会失效问题
          actionShow:false
        })
      }, 50)
      this.triggerEvent('cancelMove',{status:false})
      return 
      let pages = getCurrentPages()
      let fileMovePages = pages.filter(it=>it.route=='pages/fileMove/index')
      wx.navigateBack({
        delta:fileMovePages.length,
        success(){
          if(cb && typeof cb == 'function'){
            cb()
          }
        }
      })
    },
    // 防抖
    debounce(fn, wait) {    
      let self=this 
      return (function() {        
        if(self.timerId !== null) clearTimeout(self.timerId);   
        self.timerId=setTimeout(fn, wait)  
      })()
    },
  }
})

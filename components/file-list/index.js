import * as request from '../../utils/request.js';
import regeneratorRuntime from '../../runtime.js'
import {FOLDER_RENAME,FILE_RENAME,FOLDER_DEL,FILE_DEL,FILE_SHARE} from '../../utils/api'
const app = getApp()
Component({
  properties: {
    dataList: {
      type: Array,
      value:[],
      observer: function (newVal, oldVal) {
       // this.setFileGroupList(newVal)
        this.setData({
          fileList: newVal,
        })
      }
    },
    //判断来源，move:移动文件，如果是移动文件则隐藏所有操作按钮
    from:{
      type: String,
      value:false,
      observer: function (newVal, oldVal) {
        this.setData({
          from: newVal,
        })
      }
    },
  },
  data: {
    fileList:[],
    fileGroupList:[],
    showModal:false,
    modalInputTxt:'',
    operationActionSheetVisible:false,
    currentAction:'',
    modalTitle:'',
    madalPlaceholder:'',
    currentItem:null,
    autoFocus:false,
    modalTip:'',
    slideButtons: [{
      type: 'warn',
      text: '删除',
      extClass: 'test',
      data:{action:'del'}
    }],
    currentSliderId:'',
    checkStatus:false,
    submiting:false,
    nameMaxLength:15,
    userIsAdmin:false,
    userIsAppAdmin:false,
  },
  methods: {
    setFileGroupList(newVal){
      let fileGroupList = []
      let fileList = newVal.filter(it=>it.type=='file')
      let folderList = newVal.filter(it=>it.type=='folder')
      if(folderList.length){
        fileGroupList.push({title:'文件夹',list:folderList})
      }
      if(fileList.length){
        fileGroupList.push({title:'文件',list:fileList})
      }
      //首页搜索
      if(this.data.isShare){
        fileGroupList=[{title:'共享',list:newVal}]
      }
      this.setData({
        fileGroupList:fileGroupList,
      })
    },
    goDetail(event){
      //批量选择状态下，点击事件用来操作选择
      if(this.data.checkStatus){
        this.checkBindTap(event.currentTarget.dataset.item)
      }
      //去详情页
      else{
        let item = event.currentTarget.dataset.item
        if(this.data.from=='move'){
          this.triggerEvent('goMove',{item})
        }else{
          this.triggerEvent('goDetail',{item})
        }
      }
    },
    //共享空间详情
    goSpaceInfo(event){
      let item = event.currentTarget.dataset.item
      wx.navigateTo({
        url: `../../pages/spaceInfo/index?id=${item.id}&name=${item.name}`
      })
    },
    //文件操作
    showOperationActionSheet(event){
      let item =event.detail.item?event.detail.item:event.currentTarget.dataset.item
      let admin = item.fileAdmin?item.fileAdmin.split('/')[0].toLocaleLowerCase():''
      let userId = wx.getStorageSync('userInfo').uid
      let appAdmin = wx.getStorageSync('appAdmin')
      console.log('showOperationActionSheet...',event)
      //判断没有任何权限的情况
      if(!item.isWrite&&!item.isRead){
        wx.showToast({
          title: '您没有操作权限',
          icon:'none'
        })
        return
      }
      this.debounce(()=>{
        this.setData({
          currentItem:item,
          operationActionSheetVisible:true ,
          userIsAdmin:admin === userId,
          userIsAppAdmin:appAdmin === userId
        })
      },200)
    },
    //显示重命名弹框
    showRenameModal(){
      let isFolder = this.data.currentItem.type=="folder"
      this.setData({
        modalInputTxt:this.data.currentItem.subName,
        currentAction:'rename',
        modalTitle:'重命名',
        madalPlaceholder:isFolder?'文件夹名':'文件名',
        modalTip:isFolder?'请输入文件夹名':'请输入文件名',
        showModal:true,
        autoFocus:true,
        nameMaxLength:isFolder?15:50
      })
    },
    //文件名输入正则控制
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
    //重命名确认
    async modalComplete(e){
      if(!this.data.modalInputTxt.trim())return
      if(this.data.submiting)return
      //微信内容安全校验
      try{
        await request.wxapi_checkMsg(this.data.modalInputTxt)
      }
      catch(e){
        return
      }
      let list = this.data.fileList
      if(this.data.currentAction=='rename'){
        let item = list.find(it=>it.id==this.data.currentItem.id)
        let oldName = item.name
        item.subName= this.data.modalInputTxt
        item.name= item.subName+(item.ext?'.'+item.ext:'')
        try{
          this.setData({submiting:true})
          if(this.data.currentItem.type=='folder'){
            await request.post(FOLDER_RENAME,{
              fileSid:item.id,
              name:oldName,
              newName:item.name
            })
          }
          else{
            await request.post(FILE_RENAME,{
              fileSid:item.id,
              name:oldName,
              newName:item.name,
              parentFileSid:item.parentFileSid,
              parentFileName:encodeURIComponent(item.parentFileName),
            })
          }
          this.setData({fileList:list,showModal:false})
          this.triggerEvent('reSetList',{list})
        }
        finally{
          this.setData({submiting:false})
        }
      }
    },
    //显示删除确认弹框
    showDelToast(e){
      let self = this
      let currentItem = self.data.currentItem
      let content = self.data.currentItem.type=='folder'?'删除文件夹':'删除文件'
      wx.showModal({
        content:content+'"'+currentItem.name+'"',
        confirmColor:"#C95E57",
        confirmText:'删除',
        cancelColor:'#4F79B4',
        async success(res){
          if (res.confirm) {
            console.log('用户点击确定')
            let res;
            if(currentItem.type=="folder"){
              // wx.showToast({
              //   title: '该功能待开发..',
              //   icon:'none',
              //   duration:4000
              // })
              // return
              res = await request.post(FOLDER_DEL,{
                fileSid:currentItem.id,
                name:currentItem.name,
                space:0,
                parentFileSid:currentItem.parentFileSid,
                parentFileName:encodeURIComponent(currentItem.parentFileName),
              })
            }
            else {
              res = await request.post(FILE_DEL,{
                fileSid:currentItem.id,
                name:currentItem.name,
                parentFileSid:currentItem.parentFileSid,
                parentFileName:encodeURIComponent(currentItem.parentFileName),
              })
            }
            if(res.errcode==0){
              let list = self.data.fileList
              let item = list.find(it=>it.id==currentItem.id)
              list.splice(list.indexOf(item),1)
              self.setData({fileList:list})
              // self.setFileGroupList(self.data.fileList)
              self.triggerEvent('reSetList',{list})
            }
          }
        },
        fail(){ },
        complete(){}
      })
    },
    //左移删除
    slideBindshow(e){
      this.setData({currentSliderId:e.currentTarget.dataset.item.id})
    },
    slideBindhide(e){
      this.setData({currentSliderId:''})
    },
    slideButtonTap(e){
      console.log(222222,e)
      this.setData({currentItem:e.currentTarget.dataset.item})
      if(e.detail.data.action=='del'){
        this.showDelToast()
      }
    },
    //批量删除
    batchDel(){
      let list = this.data.fileList
      let delList = list.filter(it=>it.checked)
      if(delList.length==0){
        return
      }
      let files = delList.filter(it=>it.type=='file')
      let folders = delList.filter(it=>it.type=='folder')
      let msg = files.length>0?`${files.length}个文件`:''
      let msg2 =folders.length>0?`${folders.length}个文件夹(包含文件夹下所有文件)`:''
      let resMsg = msg&&msg2?[msg,msg2].join('和'):(msg?msg:msg2)
      let self = this
      wx.showModal({
        content:'确认删除'+resMsg,
        confirmColor:"#C95E57",
        confirmText:'删除',
        cancelColor:'#4F79B4',
        success(res){
          if (res.confirm) {
            delList.forEach(delItem=>{
              let item = list.find(it=>it.id==delItem.id)
              list.splice(list.indexOf(item),1)
            })
            self.setData({fileList:list})
           // self.setFileGroupList(self.data.fileList)
            self.triggerEvent('reSetList',{list})
            self.setData({checkStatus:false})
            console.log('用户点击确定')
          }
          else if (res.cancel) {
            console.log('用户点击取消')
          }
        },
        fail(){
        },
        complete(){
        }
      })
    },
    //选中
    chooseMutiple(e){
      this.setData({checkStatus:true})
    },
    checkBindTap(item){
      let list = this.data.fileList
      let currentItem = list.find(it=>it.id==item.id)
      currentItem.checked=currentItem.checked==undefined?true:!currentItem.checked
      this.setData({fileList:list})
      //this.setFileGroupList(this.data.fileList)
    },
    cancelCheckStatus(e){
      this.setData({checkStatus:false})
    },
    //分享
    shareFile(){
      app.selectEnterpriseContact(async (userList,deptList)=>{
        console.log('shareFile...',userList,deptList)
        let list = []
        if(userList.length){
          userList.forEach(it=>{
            list.push({bizId:it.id,accessType:0})
          })
        }
        if(deptList.length){
          deptList.forEach(it=>{
            list.push({bizId:it.id,accessType:1})
          })
        }
        // wx.showToast({
        //   title: '该功能待开发..',
        //   icon:'none',
        //   duration:4000
        // })
        // return 
        if(list.length){
          await request.post(FILE_SHARE,{
            fileSid:this.data.currentItem.fileSid,
            name:this.data.currentItem.name,
            user:list
          })
          wx.showToast({
            title: '分享成功！',
            icon:'success'
          })
        }
      })
    },
    goMoveFile(e){
      console.log('goMoveFile....')
      let currentItem = this.data.currentItem
      //从跟目录开始移动
      wx.navigateTo({
        url: `../../pages/fileMove/index?id=&name=&targetId=${currentItem.id}&targetName=${currentItem.name}&targetParentFileSid=${currentItem.parentFileSid}`
      })
    },
     /**
     * 用户点击右上角分享或button 分享
      */
    // from	String	转发事件来源。
    // target	Object	如果 from 值是 button，则 target 是触发这次转发事件的 button，否则为 undefined	1.2.4
    // webViewUrl	String	页面中包含web-view组件时，返回当前web-view的url
    onShareAppMessage: function (e) {
      // if(e.from=='button'){
      //   return {
      //     title: this.data.currentItem.name,
      //     path: `/pages/`
      //   }
      // }
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
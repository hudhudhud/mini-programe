import regeneratorRuntime from '../../runtime.js'
import {FOLDER_PRIVATE,FOLDER_CREATE,FOLDER_TREE,FILE_MOVE} from '../../utils/api'
import * as request from '../../utils/request.js';
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    parentFolderId:'',
    parentFolderName:'',
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

    isOldPath:false,
    move_submiting:false,
    //preFileSid:'',
    targetMoveItem:{},
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad:async function (options) {
    wx.setNavigationBarTitle({
      title:options.name?options.name:'新华三网盘'
    })
    
    this.targetParentFileSid = options.targetParentFileSid
    this.targetId = options.targetId
    this.targetName = options.targetName
    this.setData({
      parentFolderId:options.id,
      parentFolderName:options.name,
      isOldPath:this.targetParentFileSid==options.id,
      targetMoveItem:{id:this.targetId,name:this.targetName,parentFileSid:this.targetParentFileSid}})
   
    this.getData()
  },
  async getData(hideLoading){
    console.log('getdata.....')
    //下拉刷新时该值为true,不需要loading
    if(!hideLoading){
      this.setData({loading:true})
    }
    this.setData({pageNo:1,hasNoMore:false})//,fileList:[]
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
          //this.setData({preFileSid:res.data.grandparentFileSid})
          //如果在空间层，追加私人空间文件夹
          if(!this.data.parentFolderId){
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
      await this.getData(true)
    }
    finally{
      this.setData({refresherTriggered: false})
      this._freshing = false
    }
  },
  goMove(event){
    let item = event.detail.item
    if(item.type!=='folder'){
    }
    else{
      wx.navigateTo({
        url: `../fileMove/index?id=${item.id}&name=${item.name}&targetId=${this.targetId}&targetName=${this.targetName}&targetParentFileSid=${this.targetParentFileSid}`
      })
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
    if(this.data.move_submiting){
      return
    }
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
              parentFileSid:self.data.parentFolderId,
              parentFileName:self.data.parentFolderName,
            })
            if(res.errcode==0){
                self.exitMove(()=>{
                    wx.showToast({
                      title: '已完成',
                      icon:'success'
                    })
                    //从列表中移除该文件,真机上getCurrentPages()层数没有变化，放在setTimeout里才有效
                    setTimeout(() => {
                      let page = getCurrentPages().pop()
                      console.log(33333333,page,getCurrentPages())
                      if(page&&page.removeMoveFile){
                        page.removeMoveFile(self.targetId)
                      }
                    }, 500);
                })
            }
          }
          finally{
            self.setData({move_submiting:false})
          }
        }
      },
      fail(){
      },
      complete(){}
    })
  },
  goPreMove(){
    // wx.navigateTo({
    //   url: `../fileMove/index?id=${this.data.preFileSid}&name=${currentName}
    //   &targetId=${this.targetId}&targetParentFileSid=${this.targetParentFileSid}`
    // })
    wx.navigateBack()
  },
  exitMove(cb){
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
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  },
  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    console.log('onUnload....')
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  },
})
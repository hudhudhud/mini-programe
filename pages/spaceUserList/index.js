import * as request from '../../utils/request.js';
import regeneratorRuntime from '../../runtime.js'
import {FOLDER_MEMBERUPDATE,FOLDER_DETAIL} from '../../utils/api'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    user:'',
    submiting:false,
    fileAdmin:'',
    userIsAdmin:'false',
    oldPermissionsList:[],//原来的权限数据
    permissionsList:[
      //type:0域账号，1部门;permissionType:0只读，1编辑
      // {bizId:1,name:'123',avatar:'',accessType:0,permissionType:1},
    ],
    operateType:'', //add,edit 用来区分是新增人员的设置权限，还是修改人员时设置权限
    actionSheetVisible:false,
    currentActionItem:{},
    actionItems:[],
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let userInfo = wx.getStorageSync('userInfo')
    this.setData({ user:userInfo}) 
    this.fileId= options.id
    this.fileName = options.name
    this.setData({operateType:options.type,fileAdmin:options.admin})
    if(options.type=='add'){
      this.setData({permissionsList:wx.getStorageSync('permissionsList').new})
      this.setData({oldPermissionsList:wx.getStorageSync('permissionsList').old})
    }
    else{
      this.setData({permissionsList:wx.getStorageSync('permissionsList')})
    }
    if(userInfo.uid.toLocaleLowerCase() == options.admin.toLocaleLowerCase()){
      this.setData({userIsAdmin:true})
    }
    else{
      this.setData({userIsAdmin:false})
    }
    //超级管理员只能设置管理员和可编辑
    let appAdmin =  wx.getStorageSync('appAdmin')
    if(appAdmin){
      let permissionsList = this.data.permissionsList
      permissionsList.forEach(it=>{
        if(it.bizId.toLocaleLowerCase()==appAdmin.toLocaleLowerCase()){
          it.isSuper= true
        }
      })
      this.setData({permissionsList})
    }
  },
  setOperateRole(event){
    this.currentActionIndex = event.currentTarget.dataset.index
    let currentActionItem = event.currentTarget.dataset.item
    let actionItems=[
      {key:8,name:'管理员',tip:'可管理空间及成员权限'},
      {key:0,name:'仅浏览',tip:'仅浏览和下载，不能上传'},
      {key:1,name:'可编辑',tip:'仅可上传下载，编辑文件夹'},
      {key:-1,name:'移除'}
    ]
     //管理员无法移除自己
    if(currentActionItem.isAdmin){
      actionItems=[
        {key:8,name:'管理员',tip:'可管理空间及成员权限'},
        {key:0,name:'仅浏览',tip:'仅浏览和下载，不能上传'},
        {key:1,name:'可编辑',tip:'仅可上传下载，编辑文件夹'}
      ]
    }
    //超级管理员只能设置管理员和可编辑
    if(currentActionItem.isSuper){
      actionItems=[
        {key:8,name:'管理员',tip:'可管理空间及成员权限'},
        {key:1,name:'可编辑',tip:'仅可上传下载，编辑文件夹'}
      ]
    }
    // this.debounce(()=>{
    this.setData({actionSheetVisible:true,currentActionItem,actionItems})
    // },200)
    return
    let index = event.currentTarget.dataset.index
    let self = this
    let users = self.data.permissionsList
    let actionList = ['管理员（可管理空间及成员权限）','仅浏览（仅浏览和下载，不能上传）', '可编辑（可上传下载，编辑文件夹）', '移除']
    //管理员无法移除自己
    if(users[index].bizId==self.data.fileAdmin){
      actionList = ['管理员（可管理空间及成员权限）','仅浏览（仅浏览和下载，不能上传）', '可编辑（可上传下载，编辑文件夹）']
    }
    wx.showActionSheet({
      itemList: actionList,
      success (res) {
        if(res.tapIndex==0){
          if(self.data.fileAdmin!==users[index].bizId){
            if(!self.data.fileAdmin){//本来没有管理员则不用弹框确认
              self.setData({fileAdmin:users[index].bizId})
              users[index].permissionType=1
              users[index].isAdmin=true
              self.setData({permissionsList:users})
              return 
            }
            wx.showModal({
              content:'一个分区只有一个管理员，是否将管理员转让给'+users[index].name,
              confirmColor:"#4970D9",
              confirmText:'确定',
              cancelColor:'#4F79B4',
              success(res){
                if (res.confirm) {
                  users.forEach(it=>it.isAdmin=false)
                  self.setData({fileAdmin:users[index].bizId})
                  users[index].permissionType=1
                  users[index].isAdmin=true
                  self.setData({permissionsList:users})
                  console.log('用户点击确定')
                } else if (res.cancel) {
                  console.log('用户点击取消')
                }
              },
              fail(){
              },
              complete(){
              }
            })
          }
        }
        else{
           //管理员设成其他权限，则清空管理员数据
            if(self.data.fileAdmin==users[index].bizId){
              self.setData({fileAdmin:''})
              users[index].isAdmin=false
            }
            //浏览
            if(res.tapIndex==1){
              users[index].permissionType=0
            }
            //编辑
            if(res.tapIndex==2){
              users[index].permissionType=1
            }
            //移除
            if(res.tapIndex==3){
              users.splice(index,1)
            }
            self.setData({permissionsList:users})
        }
        
      },
      fail (res) {
        console.log(res.errMsg)
      }
    })
  },
  actionTap(event){
    this.setData({actionSheetVisible:false})
    let activeItem = event.currentTarget.dataset.item
    let users = this.data.permissionsList
    let currentUser = users[this.currentActionIndex]
    if(!currentUser)return
    if(currentUser.permissionType===activeItem.key)return
    let self = this
    //设置为管理员
    if(activeItem.key==8){
      if(self.data.fileAdmin!==currentUser.bizId){
        if(!self.data.fileAdmin){//本来没有管理员则不用弹框确认
          self.setData({fileAdmin:currentUser.bizId})
          currentUser.permissionType=1
          currentUser.isAdmin=true
          self.setData({permissionsList:users})
          return 
        }
        wx.showModal({
          content:'一个分区只有一个管理员，是否将管理员转让给 '+currentUser.accessorName,
          confirmColor:"#4970D9",
          confirmText:'确定',
          cancelColor:'#4F79B4',
          success(res){
            if (res.confirm) {
              users.forEach(it=>it.isAdmin=false)
              self.setData({fileAdmin:currentUser.bizId})
              currentUser.permissionType=1
              currentUser.isAdmin=true
              self.setData({permissionsList:users})
              console.log('用户点击确定')
            } else if (res.cancel) {
              console.log('用户点击取消')
            }
          },
          fail(){
          },
          complete(){
          }
        })
      }
    }
    //设置其他权限
    else{
       //管理员设成其他权限，则清空管理员数据
        if(self.data.fileAdmin==currentUser.bizId){
          self.setData({fileAdmin:''})
          currentUser.isAdmin=false
        }
        //浏览
        if(activeItem.key===0){
          currentUser.permissionType=0
        }
        //编辑
        if(activeItem.key===1){
          currentUser.permissionType=1
        }
        //移除
        if(activeItem.key===-1){
          users.splice(this.currentActionIndex,1)
        }
        self.setData({permissionsList:users})
    }
  },
  async confirmTap(){
    if(!this.data.fileAdmin){
      wx.showModal({
        content:'你需要指定一个管理员',
        confirmColor:"#4970D9",
        confirmText:'确定',
        showCancel:false
      })
      return
    }
    if(this.data.submiting){
      return
    }
    this.setData({submiting:true})
    // setTimeout(() => {
    //   this.setData({submiting:false})
    //   wx.navigateBack()
    // }, 1000);
   
    let permissionsList = this.data.permissionsList
    if(this.data.operateType==='add'){
      permissionsList.push(...this.data.oldPermissionsList)
    }
    console.log('submit...',permissionsList)
    try{
      let res = await request.post(FOLDER_MEMBERUPDATE,{
        fileSid:this.fileId,
        name:this.fileName,
        fileAdmin:this.data.fileAdmin,
        permissionList:permissionsList
      })
      if(res.errcode==0){
        wx.navigateBack({
          success(){
            //取spaceInfo页面，刷新
            var page = getCurrentPages().pop();
            if (page == undefined || page == null) return
            page.getData();
          }
        })
      }
    }
    finally{
      this.setData({submiting:false})
    }
    
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

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})
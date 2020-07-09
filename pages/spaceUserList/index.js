import * as request from '../../utils/request.js';
import regeneratorRuntime from '../../runtime.js'
import {FOLDER_MEMBERUPDATE,FOLDER_DETAIL} from '../../utils/api'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    user:'',
    fileId:'',
    submiting:false,
    fileAdmin:'hys3032',
    permissionsList:[
      //type:0域账号，1部门;permissionType:0只读，1编辑
      // {accessorSid:1,name:'123',avatar:'',accessType:0,permissionType:1},
    ],
  },
  

  setOperateRole(event){
    let index = event.currentTarget.dataset.index
    let self = this
    let users = self.data.permissionsList
    let actionList = ['管理员（可管理空间及成员权限）','仅浏览（仅浏览和下载，不能上传）', '可编辑（可上传下载，编辑文件夹）', '移除']
    if(users[index].accessorSid==self.data.fileAdmin){
      actionList = ['管理员（可管理空间及成员权限）','仅浏览（仅浏览和下载，不能上传）', '可编辑（可上传下载，编辑文件夹）']
    }
    wx.showActionSheet({
      itemList: actionList,
      success (res) {
        if(res.tapIndex==0){
          if(self.data.fileAdmin!==users[index].accessorSid){
            if(!self.data.fileAdmin){//本来没有管理员则不用弹框确认
              self.setData({fileAdmin:users[index].accessorSid})
              users[index].permissionType=1
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
                  self.setData({fileAdmin:users[index].accessorSid})
                  users[index].permissionType=1
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
            if(self.data.fileAdmin==users[index].accessorSid){
              self.setData({fileAdmin:''})
            }
            if(res.tapIndex==1){
              users[index].permissionType=0
            }
            if(res.tapIndex==2){
              users[index].permissionType=1
            }
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
  confirmTap(){
    if(!this.data.fileAdmin){
      // wx.showToast({
      //   title: "你需要指定一个管理员",
      //   icon: "none",
      //   duration: 4000
      // });
      wx.showModal({
        content:'你需要指定一个管理员',
        confirmColor:"#4970D9",
        confirmText:'确定',
        showCancel:false
      })
      return
    }
    this.setData({submiting:true})
    setTimeout(() => {
      this.setData({submiting:false})
      wx.navigateBack()
    }, 1000);
   
    // request.post(FOLDER_MEMBERUPDATE,{
    //   fileId:this.data.fileId,
    //   fileName:this.data.inputName,
    //   fileAdmin:this.data.fileAdmin,
    //   // parentId:'',共享空间根目录为空
    //   type:1,//0私有空间的文件夹； 1共享空间的文件夹
    //   permissionList:this.data.permissionsList
    // }).then(res=>{
    //   if(res.errcode==0){
    //     wx.navigateBack()
    //   }
    // }).finally(e=>{
    //   this.setData({submiting:false})
    // })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({ user:wx.getStorageSync('userInfo')}) 
    //先放本地缓存，后期通过接口获取
    this.setData({permissionsList:wx.getStorageSync('permissionsList')}) 
    if(options.id){
      this.setData({fileId:options.id})
      // request.post(FOLDER_DETAIL,{
      //   fileId:options.id
      // })
    }
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
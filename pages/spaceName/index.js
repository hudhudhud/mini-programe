import * as request from '../../utils/request.js';
import regeneratorRuntime from '../../runtime.js'
import {FOLDER_RENAME} from '../../utils/api'
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    inputName:"",
    fileId:'',
    oldFileName:'',
    submiting:false,
    userIsAdmin:"false",
    userIsAppAdmin:false,
  },
  bindKeyInput(e){
    let val = e.detail.value
    let reg = app.globalData.fileNameRegex
    if(reg.test(val)){
      val=val.replace(reg,'')
    }
    this.setData({inputName:val})
  },
  clearInput(){
    this.setData({inputName:""})
  },
  async confirmTap(){
    if(!this.data.inputName.trim()){
      wx.showToast({
        title: "请输入空间名称！",
        icon: "none",
        duration: 4000
      });
      return
    }

    if(this.data.submiting){
      return
    }
    this.setData({submiting:true})

    //微信内容安全校验
    try{
      await request.wxapi_checkMsg(this.data.inputName)
    }
    catch(e){
      return
    }
    
    // setTimeout(() => {
    //   wx.navigateBack()
    //   this.setData({submiting:false})
    // }, 1000);

    request.post(FOLDER_RENAME,{
      fileSid:this.data.fileId,
      name:this.data.oldFileName,
      newName:this.data.inputName
    })
    .then(res=>{
      if(res.errcode==0){
        wx.setStorageSync('renameFile',{id:this.data.fileId,name:this.data.inputName})
        wx.navigateBack({
          success(){
            //取spaceInfo页面，刷新
            var page = getCurrentPages().pop();
            if (page == undefined || page == null) return
            page.getData();
          }
        })
      }
    })
    .finally(()=>{
      this.setData({submiting:false})
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({fileId:options.id,inputName:options.name,oldFileName:options.name,userIsAdmin:options.userIsAdmin=="true"?true:false})
    
     //登录人是否为超级管理员
     let appAdmin =  wx.getStorageSync('appAdmin')
     let userInfo =  wx.getStorageSync('userInfo')
     if(appAdmin&&userInfo.uid==appAdmin){
       this.setData({userIsAppAdmin:true})
     }
     else{
       this.setData({userIsAppAdmin:false})
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

})
import * as request from '../../utils/request.js';
import regeneratorRuntime from '../../runtime.js'
import {FOLDER_RENAME} from '../../utils/api'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    inputName:"",
    fileId:'',
    oldFileName:'',
    submiting:false,
  },
  bindKeyInput(e){
    this.setData({
      inputName:e.detail.value
    })
  },
  clearInput(){
    this.setData({inputName:""})
  },
  confirmTap(){
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
    setTimeout(() => {
      wx.navigateBack()
      this.setData({submiting:false})
    }, 1000);

    // request.post(FOLDER_RENAME,{
    //   fileId:this.data.fileId,
    //   fileName:this.data.oldFileName,
    //   newFileName:inputName
    // })
    // .then(res=>{
    //   if(res.errcode==0){
    //     wx.navigateBack()
    //   }
    // })
    // .finally(()=>{
    //   this.setData({submiting:false})
    // })
   
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if(options.id){
      this.setData({fileId:options.id,inputName:options.name,oldFileName:options.name})
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
import {SCREEN_LOG} from '../../utils/api'
import * as request from '../../utils/request'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    color: 'rgba(0,0,0,0.5)',
    rows: [],
    cols: [],
    watermarkstr:'',
    id:'',
    fileName:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // /pages/fileView/index?id=123&name=123&share=1 
    //隐藏当前页面的转发按钮
    wx.hideShareMenu({
      menus: ['shareAppMessage', 'shareTimeline']
    })
  //  this.watermark()
    if(options.name){
      wx.setNavigationBarTitle({
        title:decodeURI(options.name)
      })
    }
    if(options.share){
      //从推送里进，刷权限接口
    }

    //'用户截屏'
    wx.onUserCaptureScreen(function (res) {
      request.post(SCREEN_LOG,{
        fileId:options.id,
        fileName:options.name
      })
    })
  },
 
  bindload(e){
    // wx.hideLoading()
    console.log('bindload...',e)
    this.watermark()
  },
  binderror(e){
    wx.hideLoading()
    console.log('binderror...',e)
  },
  bindmessage(e){
    console.log('bindmessage...',e)
  },
  watermark(){
    let userInfo = wx.getStorageSync('userInfo');
    let txt = userInfo.name+' '+userInfo.uid
    const { windowWidth, windowHeight } = wx.getSystemInfoSync();
    const rows = Math.ceil(windowWidth / (30 * txt.length));
    const cols = Math.ceil(windowHeight / 100);
    this.setData({
      watermarkstr:txt,
      rows: new Array(rows),
      cols: new Array(cols)
    });
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
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

  
})
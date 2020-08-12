import {SCREEN_LOG,FOLDER_DETAIL,FILE_PREVIEW_PERMISSION} from '../../utils/api'
import * as request from '../../utils/request'
import regeneratorRuntime from '../../runtime.js'
const app = getApp()
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
    fileName:'',
    userInfo:{},
    showFileDetail:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
   onLoad:function (options) {
    // /pages/fileView/index?id=123&name=123&share=1 
    //隐藏当前页面的转发按钮
    wx.hideShareMenu({
      menus: ['shareAppMessage', 'shareTimeline']
    })
  //  this.watermark()
    if(options.name){
      wx.setNavigationBarTitle({
        title:decodeURIComponent(options.name)
      })
    }
    //'用户截屏'
    wx.onUserCaptureScreen(function (res) {
      request.post(SCREEN_LOG,{
        fileId:options.id,
        fileName:decodeURIComponent(options.name)
      })
    })
    let userInfo = wx.getStorageSync('userInfo')
    if (userInfo) {
      this.setData({userInfo})
      this.initData(options)
    }
    else{
      app.userInfoReadyCallback = res => {
        let userInfo = wx.getStorageSync('userInfo')
        this.setData({userInfo})
        this.initData(options)
      }
    }
  },
  async initData(options){
    wx.showLoading()
    //从推送里进，刷权限接口,成功才允许打开页面！！
    if(options.share){
      try{
        await request.post(FILE_PREVIEW_PERMISSION,{
          fileSid:options.id,
          name:decodeURIComponent(options.name)
        })
      }
      catch(e){
        console.log('更新权限失败:'+e)
        wx.showToast({
          title: '更新权限失败'+e,
          icon:'none',
          duration:5000,
        })
        return
      }
      finally{
        wx.hideLoading()
      }
    }

    try{
      //为了看文件被分享之后是否赋权
      let res = await request.post(FOLDER_DETAIL,{
        fileSid:options.id,
        name:decodeURIComponent(options.name)
      })
      this.setData({showFileDetail:JSON.stringify(res.data.permissionBindings.map(it=>{return {bizId:it.bizId,name:it.accessorName}}))})

      //后续增加获取预览地址接口
    }
    finally{
      wx.hideLoading()
    }
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
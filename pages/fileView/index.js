Page({

  /**
   * 页面的初始数据
   */
  data: {
    // color: 'rgba(0,0,0,0.03)',
    color: 'rgba(0,0,0,0.5)',
    rows: [],
    cols: [],
    watermarkstr:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
   this.watermark()
    // console.log(333333,options.fileId)
    wx.onUserCaptureScreen(function (res) {
        wx.showToast({
          title: '用户截屏了...',
          icon: 'none',
          duration: 4000
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
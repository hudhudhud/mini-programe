//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    searchStatus:false,
    shareFileList:[
      {name:'testttttttttttttttttttttttttttttttttttttttttttttt1233333333',},
      {name:'管理规范',}
    ]
  },
  goSearch(){
    this.setData({searchStatus:true})
  },
  cancelSearch(){
    this.setData({searchStatus:false})
  },
  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onLoad: function () {
    console.log(33333333)
  },
})

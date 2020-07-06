//app.js
import *  as encryption from 'utils/encryption';
// const {LOGIN}  = require('./utils/api.js')
import {getLoginKey} from './utils/request.js';
App({
  onLaunch: function () {
    // wx.qy.login({
    //   success:(res)=>{
    //     console.log(22222,res)
    //   },
    //   fail:(e)=>{
    //     console.log(3333,JSON.stringify(e))
    //   }
    // })
    // 登录
    //getLoginKey()
    // 获取用户信息
    // wx.getSetting({
    //   success: res => {
    //     if (res.authSetting['scope.userInfo']) {
    //       // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
    //       wx.getUserInfo({
    //         success: res => {
    //           // 可以将 res 发送给后台解码出 unionId
    //           this.globalData.userInfo = res.userInfo
    //           wx.setStorageSync('userInfo', res.userInfo)
    //           encryption.encriUser()
    //           // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
    //           // 所以此处加入 callback 以防止这种情况
    //           if (this.userInfoReadyCallback) {
    //             this.userInfoReadyCallback(res)
    //           }
    //         }
    //       })
    //     }
    //   }
    // })
  },
  // 小程序发生脚本错误或 API 调用报错时触发。也可以使用 wx.onError 绑定监听
  onError(error){
    wx.showToast({
      title: '异常：'+error,
      icon: 'fail',
      duration: 5000
    })
  },
  //小程序要打开的页面不存在时触发
  onPageNotFound(object){
    // wx.redirectTo({
    //   url: 'pages/...'
    // })
  },
  globalData: {
    userInfo: null,
    uidEnc:''
  }
})
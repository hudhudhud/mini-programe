//app.js

// const {LOGIN}  = require('./utils/api.js')
import {login,getSessionKey} from './utils/request.js';
App({
  onLaunch: function () {
    // if(!wx.qy){
    //   let errorInfo= '请用企业微信客户端打开'
    //   wx.showToast({
    //     title: errorInfo,
    //     icon: 'none',
    //     duration: 4000
    //   })
    //   wx.reLaunch({
    //     url: '/pages/error/index?errorInfo='+errorInfo,
    //   })
    //   return
    // }
    // wx.qy.login({
    //   success:(res)=>{
    //     console.log(22222,res)
    //   },
    //   fail:(e)=>{
    //     console.log(3333,JSON.stringify(e))
    //   }
    // })
     // 登录
  // login()
  //  getSessionKey()

   
  },
  // 小程序发生脚本错误或 API 调用报错时触发。也可以使用 wx.onError 绑定监听
  onError(error){
    if(!wx.qy){
      let errorInfo= '请用企业微信客户端打开'
      wx.showToast({
        title: errorInfo,
        icon: 'none',
        duration: 4000
      })
      wx.reLaunch({
        url: '/pages/error/index?errorInfo='+errorInfo,
      })
      return
    }
    wx.showToast({
      title: '异常：'+error,
      icon: 'none',
      duration: 4000
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
  }
})
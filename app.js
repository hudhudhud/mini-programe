//app.js
const encryption = require('utils/encryption')
App({
  onLaunch: function () {
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    // wx.qy.login({
    //   success: res => {
    //     // 发送 res.code 到后台换取 openId, sessionKey, unionId
    //     if (res.code) {
    //       //发起网络请求
    //       wx.request({
    //         url: 'https://api.eos-ts.h3c.com/wxapi/v1.0/api/jscode2session',
    //         data: {
    //           appid:'wx32a1989aaa9c0b5a ',
    //           token:'',//Token（根据getToken接口获取）
    //           wxappkey:'',//微信应用标识
    //           source:'1',//1表示新华三 2表示方舟
    //           code: res.code,
    //         },
    //         success: function (res) {
    //           console.log("return:" + JSON.stringify(res))
    //           // if (res && res.data) {
    //           //   wx.setStorageSync("session_id", res.data.session_id)
    //           //   var userInfo = res.data
    //           //   userInfo.birth = userInfo.birth ? ((new Date(userInfo.birth)).toLocaleDateString()).split('/').join('-') : ""
    //           //   wx.setStorageSync("userInfo", userInfo)
    //           //   if (cb && typeof f == "function") cb(userInfo)
    //           // }
    //         },
    //         fail: function (e) {
    //           console.log("error:" + JSON.stringify(e))
    //         }
    //       })
    //     } else {
    //       console.log('登录失败！' + res.errMsg)
    //     }
    //   }
    // })
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo
              wx.setStorageSync('userInfo', res.userInfo)
              encryption.encriUser()
              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    })
  },
  // 小程序发生脚本错误或 API 调用报错时触发。也可以使用 wx.onError 绑定监听
  onError(error){
    // wx.showToast({
    //   title: '异常：'+error,
    //   icon: 'fail',
    //   duration: 2000
    // })
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
//app.js
import regeneratorRuntime from './runtime.js'//支持async await 
// const {LOGIN}  = require('./utils/api.js')
import {login,getSessionKey} from './utils/request.js';
App({
  onLaunch: function () {
    //获取小程序启动时的参数,返回同arguments
    //console.log(2222222,arguments)
    //wx.getLaunchOptionsSync()  //{path,scene,query,shareTicket,referrerInfo}
    if(!wx.qy){
      //放在index页面展示
      // let errorInfo= '请用企业微信客户端打开'
      // wx.redirectTo({
      //   url: '/pages/error/index?errorInfo='+errorInfo,
      // })
      return
    }
    
    // 正式登录
    // wx.clearStorageSync()
    // this.loginFunc()

    //本地测试
    // wx.qy.login({
    //   success:(res)=>{
    //     console.log(22222,res)
    //   },
    //   fail:(e)=>{
    //     console.log(3333,JSON.stringify(e))
    //   }
    // })
    // getSessionKey().then(res=>{
    //   if (this.userInfoReadyCallback) {
    //     this.userInfoReadyCallback()
    //   }
    // })
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
      title: '异常：'+JSON.stringify(error).substr(0,200),
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
  async loginFunc(){
    let self = this
    try{
      await login()
      // 由于 login 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      if (this.userInfoReadyCallback) {
        this.userInfoReadyCallback()
      }
    }
    catch(e){
      wx.showModal({
        content:'登录失败，点击重新登录！错误信息（'+e.msg+')',
        confirmColor:"#4970D9",
        confirmText:'确定',
        showCancel:false,
        success(res){
          if (res.confirm) {
            self.loginFunc()
          }
        },
        fail(){
        },
        complete(){
        }
      })
    }
  },
  globalData: {
    userInfo: null,
    loginSuccess:0,
  }
})
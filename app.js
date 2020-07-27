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
    //检查更新版本(冷启动时会自动检查，但是只会下载，不会重启),因此需提示用户是否重启更新，否则需要下次打开才会更新
    this.checkVersion()

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
    // getSessionKey('GLOHN0umdWCoF6rh-OquI10cuCJ0ya_24HyMur5xU30').then(res=>{
    //   if (this.userInfoReadyCallback) {
    //     this.userInfoReadyCallback()
    //   }
    // })
  },
  onShow(){
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
  checkVersion(){
    const updateManager = wx.getUpdateManager()
    //监听向微信后台请求检查更新结果事件。微信在小程序冷启动时自动检查更新，不需由开发者主动触发。
    updateManager.onCheckForUpdate(function (res) {
      // 请求完新版本信息的回调
      console.log(111111,res.hasUpdate)
    })
    //监听小程序有版本更新事件。客户端主动触发下载（无需开发者触发），下载成功后回调
    updateManager.onUpdateReady(function () {
      wx.showModal({
        title: '更新提示',
        content: '新版本已经准备好，是否重启应用？',
        success(res) {
          if (res.confirm) {
            // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
            updateManager.applyUpdate()
          }
        }
      })
    })
    updateManager.onUpdateFailed(function () {
      // 新版本下载失败
      wx.showToast({
        title: '小程序有新版本，请删除小程序进程，重新打开！',
        icon:'none',
        duration:4000
      })
    })
  },
  globalData: {
    userInfo: null,
    loginSuccess:0,
  }
})
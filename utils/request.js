import regeneratorRuntime from '../runtime.js'
// require("regenerator-runtime/runtime")
// import  regeneratorRuntime from "../runtime.js"; //支持async await 
export const defaultOptions = {
  header: {
    "content-type": "application/json", // 默认值
  }
};
import { GET_TOCKEN,LOGIN } from "./api";
/**
 *
 * @param url 接口路径
 * @param params 接口参数  params[0] api参数   params[1]配置参数 显示load(load),显示成功信息(successMsg),自定义失败信息(errorMsg)......
 * @param options 接口配置参数  header头
 * @returns {Promise<*>}
 */
export const post = async function(url, params, options = {}) {
  return new Promise((resolve, reject) => {
    // wx.qy.checkSession({
    //   success: function(){ //session_key 未过期，并且在本生命周期一直有效
    //     console.log('session on line ....')
    //   },
    //   fail: async function(){ // session_key 已经失效，需要重新执行登录流程
    //     //重新登录
    //     await getLoginKey();
    //   },
    //   complete:function(){
        options = { ...defaultOptions, ...options };
        wx.request({
            url: url,
            data: params[0],
            method: "POST",
            header: options.header,
            success(res) {
              resolve(res)
              // if (res.data.status === 0) {
              //   resolve(res.data.data);
              // } else {
              //   wx.showToast({
              //     title: res.data.msg,
              //     icon: "none",
              //     duration: 2000
              //   });
              //   reject(res.data);
              // }
            },
            fail(e) {
              wx.showToast({
                title: e.errMsg,
                icon: "none",
                duration: 2000
              });
              reject(e);
            },
            complete() {
      
            }
        });
      // }
    // })
  })
};

export const  getLoginKey = async function(){
  // let {tocken} = await getToken()
  return new Promise((resolve, reject) => {
    wx.qy.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        if (res.code) {
          //发起网络请求
          wx.request({
            url: LOGIN,
            method: "POST",
            header: defaultOptions.header,
            data: {
              appid:'wx32a1989aaa9c0b5a',
              token:tocken,//Token（根据getToken接口获取）
              wxappkey:'',//微信应用标识
              source:'1',//1表示新华三 2表示方舟
              code: res.code,
            },
            success: function (res) {
              console.log('login.....',res)
              resolve(res);
              // if (res1.data.status === 0) {
              // wx.setStorageSync("session_id", res.data.session_id)
              // wx.setStorageSync("userInfo", userInfo)
              //   resolve(res);
              // } else {
              //   wx.showToast({
              //     title: 'error....',
              //     icon: "none",
              //     duration: 2000
              //   });
              //   reject();
              // }
              // if (res && res.data) {
              //   wx.setStorageSync("session_id", res.data.session_id)
              //   var userInfo = res.data
              //   userInfo.birth = userInfo.birth ? ((new Date(userInfo.birth)).toLocaleDateString()).split('/').join('-') : ""
              //   wx.setStorageSync("userInfo", userInfo)
              //   if (cb && typeof f == "function") cb(userInfo)
              // }
            },
            fail: function (e) {
              console.log("error:" + JSON.stringify(e))
              wx.showToast({
                title: "登录异常:" + JSON.stringify(e),
                icon: "none",
                duration: 2000
              });
            }
          })
        } else {
          console.log('登录失败！' + res.errMsg)
        }
      },
      fail:(e)=>{
        wx.showToast({
          title: JSON.stringify(e),
          icon: "none",
          duration: 4000
        });
        console.log('error:'+JSON.stringify(e))
      }
    })
  });
};

export const getToken=()=>{
  return new Promise((resolve, reject) => {
    wx.request({
      url: GET_TOCKEN,
      method: "POST",
      data: {
          appid: 'workflow',//'wx32a1989aaa9c0b5a',
          appsecret: 'd4IgXxWNWrM=0MgjKu2kQE3+0fCtrU/4FWos8o68kpz/ZK3ILfA+0zo='
      },
      success: function (res) {
        resolve(res.data.data)
      },
      fail:function(e){
        console.log(JSON.stringify(e))
        wx.showToast({
          title: "获取tocken失败:"+JSON.stringify(e),
          icon: "none",
          duration: 5000
        });
      }
    })
  })
}
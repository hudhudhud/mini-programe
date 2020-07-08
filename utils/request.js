import regeneratorRuntime from '../runtime.js'//支持async await 
import *  as encryption from './encryption';
export const defaultOptions = {
  header: {
    "content-type": "application/json", // 默认值
  }
};
import { agentId, GET_TOCKEN,LOGIN,GET_USERINOF } from "./api";
/**
 *
 * @param url 接口路径
 * @param params 接口参数  params[0] api参数   params[1]配置参数 显示load(load),显示成功信息(successMsg),自定义失败信息(errorMsg)......
 * @param options 接口配置参数  header头
 * @returns {Promise<*>}
 */
export const post = async function(url, params, options = {}) {
  return new Promise((resolve, reject) => {
    options = { ...defaultOptions, ...options };
    wx.request({
        url: url,
        data: Object.assign({},params,{uid:wx.getStorageSync('uidEnc')}),
        method: "POST",
        header: options.header,
        success(res) {
          if (res.data.errcode === 0) {
            resolve(res.data)
          } else {
            reject(res.data);
            wx.showToast({
              title: res.data.msg,
              icon: "none",
              duration: 4000
            });
          }
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
  })
};

export const  login = async function(){
  wx.showLoading({
    title: '登录中...',
  })
  return new Promise((resolve, reject) => {
    wx.qy.login({
      success: async res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        if (res.code) {
          await getSessionKey(res.code)
        } else {
          wx.showToast({
            title: '获取code失败：' + res.errMsg,
            icon: "none",
            duration: 4000
          });
          console.log('获取code失败：' + res.errMsg)
        }
      },
      fail:(e)=>{
        wx.showToast({
          title: JSON.stringify(e),
          icon: "none",
          duration: 4000
        });
        console.log('error:'+JSON.stringify(e))
      },
      complete(){
        wx.hideLoading()
      }
    })
  });
};

export const  getSessionKey = async function(code='EtSb_DN80bjhZ0hFvUQ_Tg5qp3LagZoVpwAtQXCH0j8'){
  //发起网络请求
  let {token} = await getToken()
  return new Promise((resolve,reject)=>{
    wx.request({
      url: LOGIN,
      method: "POST",
      header: {
        "content-type": "application/x-www-form-urlencoded;charset=UTF-8",
      },
      data: {
        appid:'workflow',
        token:token,//Token（根据getToken接口获取）
        wxappkey:'wx32a1989aaa9c0b5a',//微信应用标识
        source:'1',//1表示新华三 2表示方舟
        code:code,
      },
      success: async function (res) {
        console.log('login.....',res)
        resolve(res.data)
        if(res.data.errcode==0){
          let data = res.data.data
          wx.showToast({
            title: '登录成功'+data.userid,
            icon: "none",
            duration: 2000
          });
          let uidEnc = encryption.encriUser(data.userid)
          wx.setStorageSync('uidEnc', uidEnc)
          wx.setStorageSync('sessionKey', data.session_key)
          //获取姓名头像等用户信息
          // wx.qy.getEnterpriseUserInfo({
          //   success(res){
          //     var name = res.userInfo.name
          //     wx.qy.getAvatar({
          //       success(res){
          //         wx.setStorageSync('userInfo', {uid:data.userid,name:name,avatar:res.avatar})
          //       }
          //     })
          //   }
          // })
          let userInfo = await getUserInfo(token,data.userid)
          wx.setStorageSync('userInfo', {
            uid:data.userid,
            name:userInfo.userame,
            avatar:userInfo.avatar,
            mobile:userInfo.mobile,
            gender:userInfo.gender})
        }
        else{
          reject(res.data)
          wx.showToast({
            title: res.data.message,
            icon: "none",
            duration: 2000
          });
        }
      },
      fail: function (e) {
        reject(e)
        console.log("error:" + JSON.stringify(e))
        wx.showToast({
          title: "登录异常:" + JSON.stringify(e),
          icon: "none",
          duration: 2000
        });
      }
    })
  })
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

export const getUserInfo=(token,userid)=>{
  return new Promise((resolve, reject) => {
    wx.request({
      url: GET_USERINOF,
      method: "POST",
      data: {
        appid:'workflow',
        token:token,
        source:1,
        agentid:agentId,
        userid:userid,
      },
      success: function (res) {
        if(res.data.errcode==0){
          resolve(res.data.data)
        }
        else{
          wx.showToast({
            title: "获取用户信息失败:"+res.data.message,
            icon: "none",
            duration: 4000
          });
          reject(res.data)
        }
      },
      fail:function(e){
        reject(e)
        console.log(JSON.stringify(e))
        wx.showToast({
          title: "获取用户失败:"+JSON.stringify(e),
          icon: "none",
          duration: 4000
        });
      }
    })
  })
}
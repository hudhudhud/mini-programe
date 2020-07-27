import regeneratorRuntime from '../runtime.js'//支持async await 
import *  as encryption from './encryption';
export const defaultOptions = {
  header: {
    "content-type": "application/json", // 默认值
  }
};
import { agentId, GET_TOCKEN,LOGIN,GET_USERINOF ,CHECK_MSG} from "./api";
/**
 *
 * @param url 接口路径
 * @param params 接口参数  params[0] api参数   params[1]配置参数 显示load(load),显示成功信息(successMsg),自定义失败信息(errorMsg)......
 * @param options 接口配置参数  header头
 * @returns {Promise<*>}
 */
export const post = async function(url, params, options = {}) {
  let uid = wx.getStorageSync('uidEnc')
  let userInfo = wx.getStorageSync('userInfo')
  if(!uid||!userInfo){
    wx.showToast({
      title: "没有登录信息！",
      icon: "none",
      duration: 4000
    });
    return
  }
  return new Promise((resolve, reject) => {
    options = { ...defaultOptions, ...options };
    wx.request({
        url: url,
        data: Object.assign({},params,{uid,userName:userInfo.name}),
        method: "POST",
        header: options.header,
        success(res) {
          if(res.statusCode!=200){
            wx.showToast({
              title: res.statusCode+":"+res.data.error+`(${res.data.path})`,
              icon: "none",
              duration: 4000
            })
            reject(res.data) 
            return
          }
          if (res.data.errcode === 0) {
            resolve(res.data)
          } else {
            reject(res.data);
            wx.showToast({
              title: res.data.message,
              icon: "none",
              duration: 4000
            });
          }
        },
        fail(e) {
          wx.showToast({
            title: e.errMsg,
            icon: "none",
            duration: 4000
          });
          reject(e);
        },
        complete() {
  
        }
    });
  })
};
//上传文件
export const uploadFile = async function(url, filePath,fileKey, formData={},options = {}) {
  let uid = wx.getStorageSync('uidEnc')
  let userInfo = wx.getStorageSync('userInfo')
  if(!uid||!userInfo){
    wx.showToast({
      title: "没有登录信息！",
      icon: "none",
      duration: 4000
    });
    return
  }
  return new Promise((resolve, reject) => {
    options = { ...defaultOptions, ...options };
    wx.uploadFile({
      url: url, 
      filePath: filePath,
      name: fileKey,//文件对应的 key，开发者在服务端可以通过这个 key 获取文件的二进制内容
      formData: {
        uid,
        userName:userInfo.name,
        ...formData,
      }, //其他字段
      success (res){
        if(res.statusCode!=200){
          wx.showToast({
            title: res.statusCode+":"+res.data.error+`(${res.data.path})`,
            icon: "none",
            duration: 4000
          })
          reject(res.data) 
          return
        }
        if (res.data.errcode === 0) {
          resolve(res.data)
        } else {
          reject(res.data);
          wx.showToast({
            title: res.data.message,
            icon: "none",
            duration: 4000
          });
        }
      },
      fail(e){
        wx.showToast({
          title: e.errMsg,
          icon: "none",
          duration: 4000
        });
        reject(e);
      }
    })
  })
};

export const  login = async function(){
  wx.showLoading({
    title: '登录中',
  })
  return new Promise((resolve, reject) => {
    wx.qy.login({
      success: async res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        if (res.code) {
          console.log('qy code..',res)
          try{
            await getSessionKey(res.code)
            resolve()
          }
          catch(e){
            reject(e)
          }
        } else {
          let msg = '未获取到code：' + res.errMsg
          reject({msg})
          console.log(msg)
        }
        wx.hideLoading()
      },
      fail:(e)=>{
        wx.hideLoading()
        let msg = '获取code失败：' +e.errMsg
        reject({msg})
        console.log(msg)
      },
      complete(){
      }
    })
  });
};

export const  getSessionKey = async function(code){
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
        if(res.statusCode!=200){
          reject({msg:res.statusCode+":"+res.data.error+`(${res.data.path})`}) 
          return
        }
        if(res.data.errcode==0){
          let data = res.data.data
          // dnYPCnkuF3NmJZYljA7oYxNQBFjEq9x/Im3hupSkkZw=
          // vX2kHNcjQpzXWWnkE9UoqrdKZe2iq40QTA9KFlTLthc=  hys3032
          let uid = 'f04176'// 'c00157' //data.userid
          let uidEnc = encryption.encriUser(uid)
          wx.setStorageSync('uidEnc', uidEnc)
          wx.setStorageSync('sessionKey', data.session_key)
          try{
            let userInfo = await getUserInfo(token,uid)
            wx.setStorageSync('userInfo', {
              uid:uid,
              name:userInfo.username,
              avatar:userInfo.avatar,
              mobile:userInfo.mobile,
              gender:userInfo.gender})
            resolve()
          }
          catch(e){
            reject(e)
          }
          
          //获取姓名头像等用户信息,会弹出用户授权框，因此暂时不用，用接口获取姓名头像
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
        }
        else{
          let msg = '获取sessionKey失败：'+res.data.message
          reject({msg})
        }
      },
      fail: function (e) {
        let msg = '获取sessionKey失败：'+e.errMsg
        reject({msg})
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
          appid: 'workflow',
          appsecret: 'd4IgXxWNWrM=0MgjKu2kQE3+0fCtrU/4FWos8o68kpz/ZK3ILfA+0zo='
      },
      success: function (res) {
        if(res.statusCode!=200){
          reject({msg:res.statusCode+":"+res.data.error+`(${res.data.path})`}) 
          return
        }
        if(res.data.errcode==0){
          resolve(res.data.data)
        }
        else{
          let msg = '获取token失败：'+res.data.message
          reject({msg})
        }
      },
      fail:function(e){
        let msg = '获取token失败：'+e.errMsg
        reject({msg})
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
        if(res.statusCode!=200){
          reject({msg:res.statusCode+":"+res.data.error+`(${res.data.path})`}) 
          return
        }
        if(res.data.errcode==0){
          resolve(res.data.data)
        }
        else{
          let msg = "获取用户信息失败:"+res.data.message
          reject({msg})
        }
      },
      fail:function(e){
        let msg = '获取用户信息失败：'+e.errMsg
        reject({msg})
      }
    })
  })
}

 //微信内容安全校验
 export const wxapi_checkMsg=(content)=>{
  return new Promise((resolve,reject)=>{
    wx.request({
      url: CHECK_MSG,
      data: {
        content:content
      },
      method: "POST",
      success(res) {
        if(res.statusCode!=200){
          wx.showToast({
            title: res.statusCode+":"+res.data.error+`(${res.data.path})`,
            icon: "none",
            duration: 4000
          })
          reject() 
          return
        }
        if(res.data.errcode == 87014){
          wx.showToast({
            title: '内容含有违法违规内容',
            icon: "none",
            duration: 4000
          })
          reject() 
        }
        else{
          resolve()
        }
      },
      fail(e){
        wx.showToast({
          title: e.errMsg,
          icon: "none",
          duration: 4000
        })
        reject() 
      }
    });
  })
 }
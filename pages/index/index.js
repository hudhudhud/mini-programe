//index.js
//获取应用实例
const app = getApp()
import {login} from '../../utils/request.js';
Page({
  data: {
    shareFileList:[],
    user:{},
    loading:true,
    errorInfo:'',
    myfileName:'',
  },
  //事件处理函数
  goAddFloder(){
    wx.navigateTo({
      url: '../addSpace/index'
    })
  },
  goInfo(event){
    let item = event.currentTarget.dataset.item
    wx.navigateTo({
      url: `../spaceInfo/index?id=${item.id}&name=${item.name}`
    })
  },
  goDetail(event){
    let item = event.currentTarget.dataset.item
    if(!item){
      item={id:0,name:this.data.myfileName}
    }
    wx.navigateTo({
      url: '../spaceDetail/index?id='+item.id+'&name='+item.name+`&pathList=${JSON.stringify([item.name])}`
    })
  },
  onLoad: function(option){
    if(!wx.qy){
      this.setData({errorInfo:'请用企业微信客户端打开'})
      return
    }

    let userInfo = wx.getStorageSync('userInfo')
    if (userInfo) {
      setTimeout(()=>{
        let myfileName = userInfo.uid+" "+userInfo.name //'我的文件' //userInfo.uid+" "+userInfo.name
        this.setData({user: userInfo,myfileName:myfileName})
        this.setData({loading:false,shareFileList:[
          {name:'测试',id:'10'},
          {name:'管理规范管理规范管理规范管理规范管理规范管理规范',id:'20'}]})
      },1000)
    }
    else{
      // wx.showLoading()
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        // wx.hideLoading()
        userInfo = wx.getStorageSync('userInfo')
        let myfileName =userInfo.uid+" "+userInfo.name // '我的文件' //userInfo.uid+" "+userInfo.name
        this.setData({user:userInfo,myfileName:myfileName})
        this.setData({loading:false,shareFileList:[
          {name:'测试',id:'10'},
          {name:'管理规范管理规范管理规范管理规范管理规范管理规范',id:'20'}]})
      }
    }
  },
  onShow(){
  },

})

//index.js
//获取应用实例
const app = getApp()
import regeneratorRuntime from '../../runtime.js'
import * as request from '../../utils/request.js';
import {FOLDER_TREE} from '../../utils/api.js';

Page({
  data: {
    shareFileList:[],
    user:{},
    loading:true,
    errorInfo:'',
    myfileName:'',
    loadingMore:false,
    hasNoMore:false,
    refresherTriggered:false,
  },
  onLoad:async function(option){
    if(!wx.qy){
      this.setData({errorInfo:'请用企业微信客户端打开'})
      return
    }
    let userInfo = wx.getStorageSync('userInfo')
    if (userInfo) {
      this.setData({userInfo:userInfo})
      this.getData()
    }
    else{
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        userInfo = wx.getStorageSync('userInfo')
        this.setData({userInfo:userInfo})
        this.getData()
      }
    }
  },
  async getData(){
    let userInfo = this.data.userInfo
    let myfileName = userInfo.uid+" "+userInfo.name //'我的文件' //userInfo.uid+" "+userInfo.name
    this.setData({userInfo: userInfo,myfileName:myfileName,hasNoMore:false})

    let res = await request.post(FOLDER_TREE,{
      type:1,//0:私有空间的文件夹;1:共享空间的文件夹
    })
    if(Array.isArray(res.data)){
      res.data.forEach(it=>it.id=it.fileSid) 
      this.setData({loading:false,shareFileList:res.data})
      // this.setData({loading:false,shareFileList:[
      //   {name:'测试',id:'10'},
      //   {name:'管理规范管理规范管理规范管理规范管理规范管理规范',id:'20'}]})
    }
    return res
  },
  loadMore(){
    console.log('loading more...')
    this.setData({loadingMore:true})
    if(this.data.shareFileList.length>30){
      this.setData({loadingMore:false,hasNoMore:true})
      return
    }
    setTimeout(() => {
      this.setData({loadingMore:false,shareFileList:[...this.data.shareFileList,...[
        {name:'测试',id:'10'},
        {name:'测试',id:'10'},
        {name:'测试',id:'10'},
        {name:'测试',id:'10'},
        {name:'测试',id:'10'},
        {name:'管理规范管理规范管理规范管理规范管理规范管理规范',id:'20'}]]})
    }, 500);
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
    //type 0:私有空间的文件夹;1:共享空间的文件夹
    if(!item){
      item={id:0,type:0,name:this.data.myfileName}
    }
    else{
      Object.assign(item,{type:1})
    }
    wx.navigateTo({
      url: '../spaceDetail/index?id='+item.id+'&name='+item.name+'&type='+item.type+`&pathList=${JSON.stringify([item.name])}`
    })
  },
  async onRefresh(){
    if (this._freshing) return
    this._freshing = true
    try{
      await this.getData()
    }
    finally{
      this.setData({refresherTriggered: false})
      this._freshing = false
    }
  },
  onShow(){
  },
   // "enablePullDownRefresh":false,
  // "onReachBottomDistance":50,
  // async onPullDownRefresh(){
  //    await this.getData()
  //    wx.stopPullDownRefresh({
  //      success: (res) => {},
  //    })
  // },
  pushData(item){
    this.setData({shareFileList:[...this.data.shareFileList,item]})
  }

})
//index.js
//获取应用实例
const app = getApp()
import regeneratorRuntime from '../../runtime.js'
import * as request from '../../utils/request.js';
import {FOLDER_TREE,SYS_ADMIN,SYS_ADMIN_UPDATE,FOLDER_DETAIL,FOLDER_PRIVATE} from '../../utils/api.js';
import *  as encryption from '../../utils/encryption';
Page({
  data: {
    shareFileList:[],
    loading:false,
    errorInfo:'',
    myfileName:'',
    loadingMore:false,
    hasNoMore:false,
    refresherTriggered:false,
    userIsAppAdmin:false,
    pageNo:1,
    searchStatus:false,
  },
  onLoad:async function(option){
    if(!wx.qy){
      this.setData({errorInfo:'请用企业微信客户端打开'})
      return
    }
    let userInfo = wx.getStorageSync('userInfo')
    if (userInfo) {
      this.userInfo=userInfo
      this.getData()
      this.getAppAdmin()
      this.getMyFolder()
    }
    else{
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        userInfo = wx.getStorageSync('userInfo')
        this.userInfo=userInfo
        this.getData()
        this.getAppAdmin()
        this.getMyFolder()
      }
    }
  },
  async getAppAdmin(){
      let {data} = await request.post(SYS_ADMIN)
      if(data.admin){
        if(this.userInfo.uid.toLocaleLowerCase()==data.admin.toLocaleLowerCase()){
          this.setData({userIsAppAdmin:true})
        }
        else{
          this.setData({userIsAppAdmin:false})
        }
        wx.setStorageSync('appAdmin', data.admin.toLocaleLowerCase())
      }
  },
  async getData(hideLoading){
    //下拉刷新时该值为true,不需要loading
    if(!hideLoading){
      this.setData({loading:true})
    }
    this.setData({pageNo:1,hasNoMore:false})
    this.pageSize=20
    let res = await this.loadMore()
    return res
  },
  async loadMore(){
    console.log('loading...more...',this.data.hasNoMore)
    try{
        if(this.data.hasNoMore){
          return
        }
        if(this.data.pageNo>1){
          this.setData({loadingMore:true})
        }
        let res = await request.post(FOLDER_TREE,{
          type:1,//0:私有空间的文件夹;1:共享空间的文件夹
          pageNo:this.data.pageNo,
          pageSize:this.pageSize,
        })
        if(this.data.pageNo==1){
          this.setData({shareFileList:[]})
        }
        this.totalNumber = res.data.totalNumber
        let newList = res.data.list
        if(Array.isArray(newList)&&newList.length){
          //是否有操作权限
          newList.forEach(it=>{
            if(Array.isArray(it.permissions)){
              it.isWrite = it.permissions.indexOf('WRITE')>-1
              it.isRead = it.permissions.indexOf('PREVIEW')>-1
            }
          })
          if(this.data.pageNo==1){
            this.setData({shareFileList:newList})
          }
          else{
            let list = [...this.data.shareFileList,...newList]
            this.setData({shareFileList:list})
          }
          if(this.pageSize*this.data.pageNo>=this.totalNumber){
            this.setData({hasNoMore:true})
          }
          else{
            this.setData({pageNo:this.data.pageNo+1})
          }
        }
        else{
          this.setData({hasNoMore:true})
        }
        return res
    }
    finally{
      this.setData({loading:false,loadingMore:false})
    }
  },
  async getMyFolder(){
    let {data} = await request.post(FOLDER_PRIVATE)
    this.myFileId = data.fileSid
    this.setData({myfileName:data.name?data.name:"我的空间("+this.userInfo.uid+")"})
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
      url: `../spaceInfo/index?id=${item.fileSid}&name=${item.name}`
    })
  },
  goDetail(event){
    let item = event.currentTarget.dataset.item
    //type 0:私有空间的文件夹;1:共享空间的文件夹
    if(!item){
      item={fileSid:this.myFileId,name:this.data.myfileName}
    }
    // else{
    //   Object.assign(item,{type:1})
    // }
    wx.navigateTo({
      url: `../spaceDetail/index?id=${item.fileSid}&name=${item.name}&pathList=${JSON.stringify([item.name])}`
    })
  },
  //下拉刷新
  async onRefresh(){
    if (this._freshing) return
    this._freshing = true
    try{
      // wx.showLoading()
      this.getAppAdmin()
      this.getMyFolder()
      //下拉刷新不需要loading
      await this.getData(true)
    }
    finally{
      this.setData({refresherTriggered: false})
      this._freshing = false
    }
  },
  editAppAdmin(){
    let callback = (userList)=>{
     if(userList.length){
       let admin = encryption.encriUser(userList[0].id)
       request.post(SYS_ADMIN_UPDATE,{
        admin
       })
       .then(res=>{
         if(res.errcode==0){
           wx.showToast({
             title: '修改成功！',
             icon:'success',
             duration:4000
           })
           this.getAppAdmin()
         }
       })
     }
    }
    app.selectEnterpriseContact(callback,{mode:'single',type: ["user"]})
  },
  async refreshDetail(renameFile){
    let {data} = await request.post(FOLDER_DETAIL,{
      fileSid:renameFile.id,
      name:renameFile.name
    })
    if(data){
      let list = this.data.shareFileList
      let item = list.find(it=>it.fileSid===renameFile.id)
      if(item){
        item.name = data.name
        this.setData({shareFileList:list})
      }
    }
  },
  onShow(){
    //重命名之后返回到列表页，需要刷新那条数据
    let renameFile = wx.getStorageSync('renameFile')
    console.log('onShow....',renameFile)
    if(renameFile){
      this.refreshDetail(renameFile)
      wx.removeStorageSync('renameFile')
    }
  },
   // "enablePullDownRefresh":false,
  // "onReachBottomDistance":50,
  // async onPullDownRefresh(){
  //    await this.getData()
  //    wx.stopPullDownRefresh({
  //      success: (res) => {},
  //    })
  // },
  search(e){
    this.setData({searchStatus:e.detail.searchStatus})
  },
  appendData(item){
    this.setData({shareFileList:[...this.data.shareFileList,item]})
  },
  popData(fileId){
    let list = this.data.shareFileList
    let index = -1
    for(let i in list){
      if(list[i].fileSid==fileId){
        index = i
        break
      }
    }
    if(index>-1){
      list.splice(index,1)
    }
    this.setData({shareFileList:list})
  }
})
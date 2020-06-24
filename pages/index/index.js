//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    searchStatus:false,
    shareFileList:[
      {name:'123',},
      {name:'管理规范管理规范管理规范管理规范管理规范管理规范',}
    ],
    searchResList:[],
    searchStr:"",
    loading:false,
  },
  goSearch(){
    this.setData({searchStatus:true})
  },
  cancelSearch(){
    this.setData({searchStatus:false})
    this.setData({searchResList:[]})
    this.setData({searchStr:''})
  },
  search_bindKeyInput(){
    if(this.data.searchStr){
      this.setData({loading:true})
      wx.showLoading({
        title: '加载中',
      })
      this.debounce(this.searchFileFunc,300)()
    }
    else{
      this.setData({loading:false})
      this.setData({searchResList:[]})
    }
  },
  // 防抖
  debounce(fn, wait) {    
      let self=this 
      return function() {        
          if(self.timerId !== null) clearTimeout(self.timerId);        
          self.timerId = setTimeout(fn, wait);    
      }
  },
  searchFileFunc(){
      setTimeout(() => {
        let files = this.data.shareFileList.filter(it=>it.name.indexOf(this.data.searchStr)>-1)
        if(files.length>0){
          this.setData({searchResList:[{title:'共享',files:files}]})
        }
        else{
          this.setData({searchResList:[]})
        }
        this.setData({loading:false})
        wx.hideLoading()
      }, 500);
  },
  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  goAddFloder(){
    wx.navigateTo({
      url: '../addSpace/index'
    })
  },
  goInfo(event){
    let item = event.currentTarget.dataset.item
    wx.navigateTo({
      url: '../spaceInfo/index?id='+item.id
    })
  },
  onLoad: function(option){
    console.log('....loading',option.query)
  },
})

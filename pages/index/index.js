//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    // searchStatus:false,
    shareFileList:[
      {name:'测试',id:'10'},
      {name:'管理规范管理规范管理规范管理规范管理规范管理规范',id:'20'}
    ],
    //searchResList:[],
    //searchStr:"",
    //loading:false,
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
      item={id:0,name:'我的文件'}
    }
    wx.navigateTo({
      url: '../spaceDetail/index?id='+item.id+'&name='+item.name+`&pathList=${JSON.stringify([item.name])}`
    })
  },
  onLoad: function(option){
    console.log('....loading',option.query)
  },
  onShow(){
  },

})

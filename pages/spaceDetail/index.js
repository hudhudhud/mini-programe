// pages/spaceDetail/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    parentFolderId:'',
    fileList:[
      {id:"100",name:'资料',type:'folder'},
      {id:'101',name:'整理',type:'folder'},
      {id:'102',name:'测试',ext:'txt',type:'file'}
    ],
    pathList:[],
    addActionSheetVisible:false,
    showModal:false,
    modalInputTxt:'',
    operationActionSheetVisible:false,
    currentAction:'',
    modalTitle:'',
    madalPlaceholder:'',
    currentItem:null,
    autoFocus:false,
    modalTip:'',
    timerId:'',
    pageFrom:'',//区分文件页面来源：空或搜索页面search
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if(options&&options.name){
      this.setData({parentFolderId:options.id})
      wx.setNavigationBarTitle({
        title:options.name
      })
      this.setData({pathList:JSON.parse(options.pathList)})
      if(options.from){
        this.setData({pageFrom:options.from})
      }
      else{
        this.setData({pageFrom:''})
      }

      // const query = wx.createSelectorQuery()
    }
  },
  goDetail(event){
    let item = event.detail.item
    let currPathList =  JSON.parse(JSON.stringify(this.data.pathList))
    currPathList.push(item.name)
    wx.navigateTo({
      url: '../spaceDetail/index?id='+item.id+'&name='+item.name+`&pathList=${JSON.stringify(currPathList)}&from=${this.data.pageFrom}`
    })
  },

  //新增操作
  showAddAction(){
    this.debounce(()=>{
      this.setData({addActionSheetVisible:true })
    },200)
  },
  showAddFolderModal(){
    this.setData({
      modalInputTxt:'',
      currentAction:'addFoler',
      modalTitle:'新建文件夹',
      madalPlaceholder:'文件夹名',
      showModal: true,
      autoFocus:true,
    })
  },
  addImg(){
    wx.chooseImage({
      count:9,//默认最多9张
      success (res) {
        let fileUrl = res.tempFilePaths
        let file = res.tempFiles
        console.log('imgfile....',res)
        //wx.uploadFile只支持单个单个上传，Promise.all
        // wx.uploadFile({
        //   url: 'https://example.weixin.qq.com/upload', //仅为示例，非真实的接口地址
        //   filePath: tempFilePaths[0],
        //   name: 'file',//文件对应的 key，开发者在服务端可以通过这个 key 获取文件的二进制内容
        //   formData: { //其他字段
        //     'user': 'test'
        //   },
        //   success (res){
        //     const data = res.data
        //     //do something
        //   }
        // })
      }
    })
  },
  addFile(){
    //从聊天对话框里选择文件 企业微信不支持！！！
    wx.chooseMessageFile({
      count: 10,
      type: 'file',//除了图片和视频
      success (res) {
        // tempFilePath可以作为img标签的src属性显示图片
        const tempFilePaths = res.tempFiles
        console.log(22222222,res)
      },
      fail(e){
        wx.showToast({
          title: '失败:'+JSON.stringify(e),
          icon: 'none',
          duration: 4000
        })
      }
    })
  },

  goIndexPage(){
    wx.navigateBack({
      delta:1000
    })
  },
  goSomePage(event){
    //当前路径点击无效
    if(event.currentTarget.dataset.index+1 == this.data.pathList.length){
      return 
    }
    let delta = this.data.pathList.length - event.currentTarget.dataset.index-1
    wx.navigateBack({
      delta:delta
    })
  },
  //返回到搜索页面
  goSearchPage(){
    let delta = this.data.pathList.length
    wx.navigateBack({
      delta:delta
    })
  },
  // 防抖
  debounce(fn, wait) {    
    let self=this 
    return (function() {        
      if(self.data.timerId !== null) clearTimeout(self.data.timerId);   
      self.setData({'timerId':setTimeout(fn, wait)})   
    })()
  },
  modalComplete(e){
    console.log('modal sure...',this.data.modalInputTxt,e)
    this.setData({
      showModal: false,
    })
    let list = this.data.fileList
    if(this.data.currentAction=="addFoler"){
      list.push({name:this.data.modalInputTxt,type:'folder',id:Math.random()})
      this.setData({fileList:list})
      wx.showToast({
        title: '添加成功',
        duration: 2000
      })
    }
  },
  reSetList(e){
    this.setData({fileList:e.detail.list})
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  },
  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    console.log('onUnload....')
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  },
})
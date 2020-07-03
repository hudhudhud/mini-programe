// pages/spaceDetail/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    fileList:[
      {id:1,name:'2',type:'folder'},
      {id:2,name:'1',type:'folder'},
      {id:3,name:'1',ext:'txt',type:'file'}
    ],
    pathList:[
      "我的",
      "测试"
    ],
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
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if(options&&options.name){
      wx.setNavigationBarTitle({
        title:options.name
      })
    }
  },
  goDetail(event){
    let item = event.currentTarget.dataset.item
    wx.navigateTo({
      url: '../spaceDetail/index?id='+item.id+'&name='+item.name
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
    //从聊天对话框里选择文件
    wx.chooseMessageFile({
      count: 10,
      type: 'file',//除了图片和视频
      success (res) {
        // tempFilePath可以作为img标签的src属性显示图片
        const tempFilePaths = res.tempFiles
        console.log(22222222,res)
      }
    })
  },
  //文件操作
  showOperationActionSheet(event){
    this.debounce(()=>{
      this.setData({
        currentItem:event.currentTarget.dataset.item,
        operationActionSheetVisible:true 
      })
    },200)
  },
  showRenameModal(){
    this.setData({
      modalInputTxt:this.data.currentItem.name,
      currentAction:'rename',
      modalTitle:'重命名',
      madalPlaceholder:this.data.currentItem.type=="folder"?'文件夹名':'文件名',
      modalTip:this.data.currentItem.type=="folder"?'请输入文件夹名':'请输入文件名',
      showModal:true,
      autoFocus:true,
    })
  },
  modalComplete(e){
    console.log('modal sure...',this.data.modalInputTxt,e)
    this.setData({
      showModal: false,
    })
    let list = this.data.fileList
    if(this.data.currentAction=="addFoler"){
      list.push({name:this.data.modalInputTxt})
      this.setData({fileList:list})
      wx.showToast({
        title: '添加成功',
        duration: 2000
      })
    }
    else if(this.data.currentAction=='rename'){
      let item = list.find(it=>it.id==this.data.currentItem.id)
      item.name=this.data.modalInputTxt
      this.setData({fileList:list})
      wx.showToast({
        title: '重命名成功',
        duration: 2000
      })
    }
  },
  showDelToast(e){
    let self = this
    let currentItem = self.data.currentItem
    let content = self.data.currentItem.type=='folder'?'删除文件夹':'删除文件'
    wx.showModal({
      content:content+'"'+currentItem.name+'"',
      confirmColor:"#C95E57",
      confirmText:'删除',
      cancelColor:'#4F79B4',
      success(res){
        if (res.confirm) {
          let list = self.data.fileList
          let item = list.find(it=>it.id==currentItem.id)
          list.splice(list.indexOf(item),1)
          self.setData({fileList:list})
          console.log('用户点击确定')
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      },
      fail(){

      },
      complete(){

      }
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
    /**
   * 用户点击右上角分享或button 分享
    */
  // from	String	转发事件来源。
  // target	Object	如果 from 值是 button，则 target 是触发这次转发事件的 button，否则为 undefined	1.2.4
  // webViewUrl	String	页面中包含web-view组件时，返回当前web-view的url
  onShareAppMessage: function (e) {
    if(e.from=='button'){
      return {
        title: this.data.currentItem.name,
        path: `/pages/spaceDetail/index?id=${this.data.currentItem.id}&name=${this.data.currentItem.name}`
      }
    }
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
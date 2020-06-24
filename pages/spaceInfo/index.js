// pages/addFloder/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    inputName:'',
    usersList:[
      {name:'hudan',role:'manager',roleTxt:"管理员"},
      {name:'xiaowang',role:'user',roleTxt:"仅浏览"},
      // {name:'xiaowang',role:'user',roleTxt:"仅浏览"},
      // {name:'xiaowang',role:'user',roleTxt:"仅浏览"},
      // {name:'xiaowang',role:'user',roleTxt:"仅浏览"},
      // {name:'xiaowang',role:'user',roleTxt:"仅浏览"},
      // {name:'xiaowang',role:'user',roleTxt:"仅浏览"},
      // {name:'xiaowang',role:'user',roleTxt:"仅浏览"},
      // {name:'xiaowang',role:'user',roleTxt:"仅浏览"},
      // {name:'xiaowang',role:'user',roleTxt:"仅浏览"},
      // {name:'xiaowang',role:'user',roleTxt:"仅浏览"},
      {name:'123',role:'user',roleTxt:"仅浏览"},
    ]
  },

  setOperateRole(event){
    let index = event.currentTarget.dataset.index
    let self = this
    wx.showActionSheet({
      itemList: ['仅浏览（仅浏览和下载，不能上传）', '可编辑（可上传下载，编辑文件夹）', '移除'],
      // itemColor:"red",
      success (res) {
        let users = self.data.usersList
        
        if(res.tapIndex==0){
          users[index].roleTxt='仅浏览'
        }
        else if(res.tapIndex==1){
          users[index].roleTxt='可编辑'
        }
        else if(res.tapIndex==2){
          users.splice(index,1)
        }
        self.setData({usersList:users})
      },
      fail (res) {
        console.log(res.errMsg)
      }
    })
  },
  confirmTap(){
    wx.navigateBack()
  },
  goEditName(){
    wx.navigateTo({
      url: '../spaceName/index'
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})
import * as request from '../../utils/request.js';
import regeneratorRuntime from '../../runtime.js'
import {FOLDER_DETAIL,FOLDER_DEL} from '../../utils/api'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    fileAdmin:'hys3032',
    inputName:'',
    permissionsList:[
      
      // {name:'hudan',role:'manager',roleTxt:"管理员"},
      // {name:'xiaowang',role:'user',roleTxt:"仅浏览"},
      // {name:'123',role:'user',roleTxt:"仅浏览"},
      {accessType: 0, 
        accessorSid: "hys3032",
        avatar: "https://wework.qpic.cn/bizmail/pcRHXOXiajsBgXicZkaNrQIdq2Yk3zFcKlYyogr5DUB4sJk1IeW8aTjg/0",
        name: "胡丹",
        permissionType: 1},
       //{accessorSid:1,name:'123',avatar:'',accessType:0,permissionType:1})//type:0域账号，1部门;permissionType:0只读，1编辑
    ],
    actionSheetVisible:false,
    fileId:'',
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
      url: `../spaceName/index?id=${this.data.fileId}&name=${this.data.inputName}`
    })
  },
  showDelActionSheet(){
    this.setData({actionSheetVisible:true})
  },
  showExitActionSheet(){
    let self = this
    wx.showModal({
      content:'管理员退出空间，需要给空间设置一个新的管理员',
      confirmColor:"#4970D9",
      confirmText:'去设置',
      cancelColor:'#4F79B4',
      success(res){
        if (res.confirm) {
          //先放本地缓存，后期通过接口获取
          wx.setStorageSync('permissionsList', self.data.permissionsList)
          wx.navigateTo({
            url: '../spaceUserList/index',
          })
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
  delSpace(){
    console.log('删除空间！')
    this.setData({actionSheetVisible:false})
  },
  addUser(){
    let self = this
    wx.qy.checkSession({
      success: (res) => {
        console.log('checkSession',res)
        self.selectUser()
      },
      fail(){
       request.login().then(res=>{
        self.selectUser()
       })
       
      }
    })
  },
  selectUser(){
    let self = this
    let selectdepartIds = self.data.permissionsList.filter(it=>it.accessType==1).map(it=>it.accessorSid)
    let selectuserIds = self.data.permissionsList.filter(it=>it.accessType==0).map(it=>it.accessorSid)
    wx.qy.selectEnterpriseContact({
      fromDepartmentId: 0,// 必填，-1表示打开的通讯录从自己所在部门开始展示, 0表示从最上层开始
      mode: "multi",// 必填，选择模式，single表示单选，multi表示多选
      type: ["user","department"],// 必填，选择限制类型，指定department、user中的一个或者多个
      selectedDepartmentIds: selectdepartIds,// 非必填，已选部门ID列表。用于多次选人时可重入
      selectedUserIds: selectuserIds,// 非必填，已选用户ID列表。用于多次选人时可重入
      success: function(res) {
        console.log('selectEnterpriseContact...',res)
        var selectedDepartmentList = res.result.departmentList;// 已选的部门列表
        let permissionsList = [
          //后续去掉
          {accessType: 0, 
            accessorSid: "hys3032",
            avatar: "https://wework.qpic.cn/bizmail/pcRHXOXiajsBgXicZkaNrQIdq2Yk3zFcKlYyogr5DUB4sJk1IeW8aTjg/0",
            name: "胡丹",
            permissionType: 1}
        ]
        for (var i = 0; i < selectedDepartmentList.length; i++){
          var department = selectedDepartmentList[i];
          permissionsList.push({accessorSid:department.id,name:department.name,accessType:1,permissionType:1})//accessType:0域账号，1部门；permissionType:0只读，1编辑
        }
        var selectedUserList = res.result.userList; // 已选的成员列表
        for (var i = 0; i < selectedUserList.length; i++){
          var user = selectedUserList[i];
          permissionsList.push({accessorSid:user.id,name:user.name,avatar:user.avatar,accessType:0,permissionType:1})//accessType:0域账号，1部门;permissionType:0只读，1编辑
        }
        self.setData({permissionsList:permissionsList})
      }
    })
  },
  goSetUserPage(){
    //先放本地缓存，后期通过接口获取
    wx.setStorageSync('permissionsList', this.data.permissionsList)
    wx.navigateTo({
      url: '/pages/spaceUserList/index?id='+this.data.fileId,
    })
  },
  setUserList(){

  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({user:wx.getStorageSync('userInfo')})
    if(options.id){
      this.setData({fileId:options.id,inputName:options.name})
      // request.post(FOLDER_DETAIL,{
      //   fileId:options.id
      // })
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

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})
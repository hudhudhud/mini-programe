// pages/addFloder/index.js
import * as request from '../../utils/request.js';
import regeneratorRuntime from '../../runtime.js'
import {FOLDER_CREATE} from '../../utils/api'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    inputName:'',
    user:'',
    permissionsList:[
      //{accessorSid:1,name:'123',avatar:'',accessType:0,permissionType:1})//accessType:0域账号，1部门;permissionType:0只读，1编辑
    ],
    submiting:false,
  },
  bindKeyInput(e){
    this.setData({
      inputName:e.detail.value
    })
  },
  setOperateRole(event){
    let index = event.currentTarget.dataset.index
    let self = this
    wx.showActionSheet({
      itemList: ['仅浏览（仅浏览和下载，不能上传）', '可编辑（可上传下载，编辑文件夹）', '移除'],
      success (res) {
        let users = self.data.permissionsList
        if(res.tapIndex==0){
          users[index].permissionType=0
        }
        else if(res.tapIndex==1){
          users[index].permissionType=1
        }
        else if(res.tapIndex==2){
          users.splice(index,1)
        }
        self.setData({permissionsList:users})
      },
      fail (res) {
        console.log(res.errMsg)
      }
    })
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
        let permissionsList = []
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
  //提交
  confirmTap(){
    if(!this.data.inputName.trim()){
      wx.showToast({
        title: "请输入空间名称！",
        icon: "none",
        duration: 4000
      });
      return
    }
    if(this.data.submiting){
      return
    }
    this.setData({submiting:true})
    let resPerList = [
      ...this.data.permissionsList,
      //添加管理员权限数据
      {accessorSid:this.data.user.uid,name:this.data.user.name,avatar:this.data.user.avatar,accessType:0,permissionType:1}
    ]
    setTimeout(() => {
      this.setData({submiting:false})
      wx.navigateBack()
    }, 500);
    console.log('submit...',resPerList,this.data.inputName)
    // request.post(FOLDER_CREATE,{
    //   userName:this.data.user.name,
    //   fileName:this.data.inputName.trim(),
    //   // parentId:'',共享空间根目录为空
    //   type:1,//0私有空间的文件夹； 1共享空间的文件夹
    //   permissionList:resPerList
    // }).then(res=>{
    //   if(res.errcode==0){
    //     wx.navigateBack()
    //   }
    // }).finally(()=>{
    //   this.setData({submiting:false})
    // })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let userInfo = wx.getStorageSync('userInfo')
    this.setData({user:userInfo})
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
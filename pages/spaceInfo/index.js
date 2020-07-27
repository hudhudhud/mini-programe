import * as request from '../../utils/request.js';
import regeneratorRuntime from '../../runtime.js'
import {FOLDER_DETAIL,SPACE_EXIT,FOLDER_DEL} from '../../utils/api'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    fileAdmin:'',
    inputName:'',
    permissionsList:[],
    actionSheetVisible:false,
    fileId:'',
    userIsAdmin:false,
    submiting_exit:false,
    submiting_del:false,
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
  exitSpace(){
    let self = this
    //管理员退出空间，需要给空间设置一个新的管理员
    if(this.data.userIsAdmin){
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
              url: `../spaceUserList/index?id=${self.data.fileId}&name=${self.data.inputName}&admin=${self.data.fileAdmin}`,
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
    }
    else{
      wx.showModal({
        content:'确定退出空间？',
        confirmColor:"#4970D9",
        confirmText:'确定',
        cancelColor:'#A2A2A2',
        success(res){
          if (res.confirm) {
            self.setData({submiting_exit:true})
            request.post(SPACE_EXIT,{
              fileId:self.data.fileId,
              fileName:self.data.inputName
            })
            .then(res=>{
              if(res.errcode==0){
                wx.navigateBack({
                  success(){
                    //取spaceInfo页面，刷新
                    var page = getCurrentPages().pop();
                    if (page == undefined || page == null) return
                    page.getData();
                  }
                })
              }
            })
            .finally(()=>{
              this.setData({submiting_exit:false})
            })
          }
        },
        fail(){
        },
        complete(){
        }
      })
    
    }
  },
  showDelActionSheet(){
    this.setData({actionSheetVisible:true})
  },
  delSpace(){
    console.log('删除空间！')
    this.setData({submiting_del:true})
    setTimeout(() => {
      this.setData({submiting_del:false,actionSheetVisible:false})
      wx.navigateBack({
        success(){
          //取spaceInfo页面，刷新
          var page = getCurrentPages().pop();
          if (page == undefined || page == null) return
          page.getData();
        }
      })
    }, 500);
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
        .catch(e=>{
          wx.showToast({
            title: '登录失败！错误信息（'+e.msg+')',
          })
        })
      }
    })
  },
  selectUser(){
    let self = this
    let selectdepartIds = self.data.permissionsList.filter(it=>it.accessType==1).map(it=>it.bizId)
    let selectuserIds = self.data.permissionsList.filter(it=>it.accessType==0).map(it=>it.bizId)
    wx.qy.selectEnterpriseContact({
      fromDepartmentId: 0,// 必填，-1表示打开的通讯录从自己所在部门开始展示, 0表示从最上层开始
      mode: "multi",// 必填，选择模式，single表示单选，multi表示多选
      type: ["user","department"],// 必填，选择限制类型，指定department、user中的一个或者多个
      selectedDepartmentIds: selectdepartIds,// 非必填，已选部门ID列表。用于多次选人时可重入
      selectedUserIds: selectuserIds,// 非必填，已选用户ID列表。用于多次选人时可重入
      success: function(res) {
        console.log('selectEnterpriseContact...',res)
        var selectedDepartmentList = res.result.departmentList;// 已选的部门列表
        let permissionsList = self.oldPermissionsList //老数据需要一直在，不能被删除
        let newPermissionsList=[]
        for (var i = 0; i < selectedDepartmentList.length; i++){
          var department = selectedDepartmentList[i];
          if(!permissionsList.find(it=>it.bizId==department.id)){
            let item= {bizId:department.id,accessorName:department.name,accessType:1,permissionType:1}//accessType:0域账号，1部门；permissionType:0只读，1编辑
            //permissionsList.push(item)
            newPermissionsList.push(item)
          }
        }
        var selectedUserList = res.result.userList; // 已选的成员列表
        for (var i = 0; i < selectedUserList.length; i++){
          var user = selectedUserList[i];
          if(!permissionsList.find(it=>it.bizId==user.id)){
            let item= {bizId:user.id,accessorName:user.name,imgUrl:user.avatar,accessType:0,permissionType:1}//accessType:0域账号，1部门;permissionType:0只读，1编辑
            //permissionsList.push(item)
            newPermissionsList.push(item)
          }
        }
        //跳转到设置权限页面
        //self.setData({permissionsList:permissionsList})
        wx.setStorageSync('permissionsList', {new:newPermissionsList,old:self.oldPermissionsList})
        wx.navigateTo({
          url: `/pages/spaceUserList/index?id=${self.data.fileId}&name=${self.data.inputName}&admin=${self.data.fileAdmin}&type=add`,
        })
      }
    })
  },
  goSetUserPage(){
    //先放本地缓存，后期通过接口获取
    wx.setStorageSync('permissionsList', this.data.permissionsList)
    wx.navigateTo({
      url: `/pages/spaceUserList/index?id=${this.data.fileId}&name=${this.data.inputName}&admin=${this.data.fileAdmin}&type=edit`,
    })
  },
  setUserList(){

  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    this.userInfo = wx.getStorageSync('userInfo')
    if(options.id){
      this.setData({fileId:options.id,inputName:options.name})
      this.getData()
    }
  },
  
  async getData(){
    wx.showLoading()
    try{
      let {data} = await request.post(FOLDER_DETAIL,{
        fileSid:this.data.fileId,
        name:this.data.inputName
      })
      if(data){
        let fileAdmin = data.fileAdmin.split('/')[0]
        let adminName = data.fileAdmin.split('/')[1]
        this.setData({fileAdmin:fileAdmin})
        let permissionsList = []
        data.permissionBindings.forEach(it=>{
          let item = it 
          if(it.bizId.toLocaleLowerCase()==fileAdmin.toLocaleLowerCase()){
            item.isAdmin = true
            item.accessorName = adminName
            permissionsList.unshift(item)
          }
          else{
            permissionsList.push(item)
          }
        })
        this.oldPermissionsList = data.permissionBindings
        this.setData({fileAdmin:fileAdmin,inputName:data.name,permissionsList:permissionsList})
        //当前登录人是否即为管理员
        if(this.userInfo.uid.toLocaleLowerCase() == fileAdmin.toLocaleLowerCase()){
          this.setData({userIsAdmin:true})
        }
        else{
          this.setData({userIsAdmin:false})
        }
      }
    }
    finally{
      wx.hideLoading()
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
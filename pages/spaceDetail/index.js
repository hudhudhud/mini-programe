import regeneratorRuntime from '../../runtime.js'
import {CHECK_MEDIA,FOLDER_CREATE,CHECK_IMG,FOLDER_TREE,FILE_UPLOAD,FOLDER_DETAIL} from '../../utils/api'
import * as request from '../../utils/request.js';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    loading:false,
    fileList:[],
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
    pageFrom:'',//区分文件页面来源：空或搜索页面search
    loadingMore:false,
    hasNoMore:false,
    refresherTriggered:false,
    submiting:false,
    canAdd:true,//没有写权限 或者 大于20层之后不允许继续创建子文件
    pageNo:1,
    searchStatus:false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad:async function (options) {
    if(options.name){
      wx.setNavigationBarTitle({
        title:options.name
      })
    }    
    // this.parentFolderId = options.id
    // this.parentFolderType = options.type
    this.parentFolderName= options.name

    this.setData({parentFolderId:options.id,pathList:JSON.parse(options.pathList)})
    //区分搜索状态下的路径显示，从搜索结果开始
    if(options.from){
      this.setData({pageFrom:options.from})
    }
    else{
      this.setData({pageFrom:''})
    }
    
    //测试空页面
    // if(options.name=='整理'){
    //   setTimeout(() => {
    //     this.setData({loading:false,fileList:[]})
    //   },400)
    //   return
    // }
    // if(!options.id){
    //   setTimeout(() => {
    //       this.setData({loading:false,fileList:[
    //       {id:"100",name:'资料',type:'folder',isWrite:true},
    //       {id:'101',name:'整理',type:'folder',isWrite:true},
    //       {id:'102',name:'测试.txt',ext:'txt',type:'file',isWrite:true},
    //       {id:'103',name:'icon.png',ext:'png',type:'file',isWrite:true}]})
    //   }, 400);
    //   return
    // }
    this.getData()

    //没有写权限 或者 大于20层之后不允许继续创建子文件
    this.getParentFolderDetail()
    
    /*微信内容安全校验 start 
      this.data.fileList.forEach(it=>{
        if(it.url){
          wx.request({
            url: CHECK_MEDIA,
            data: {
              mediaUrl:it.url,
              mediaType:2 //1:音频;2:图片
            },
            method: "POST",
            success(res) {
              // wx.showToast({
              //   title: JSON.stringify(res),
              //   icon: "none",
              //   duration: 8000
              // })
            }
          });
        }
      })
    */
  },
  async getData(){
    console.log('getdata.....')
    this.setData({loading:true,pageNo:1,hasNoMore:false})//,fileList:[]
    this.pageSize=20
    let res = await this.loadMore()
    return res
  },
  async loadMore(){
    try{
        if(this.data.hasNoMore){
          return
        }
        if(this.data.pageNo>1){
          this.setData({loadingMore:true})
        }
        let res = await request.post(FOLDER_TREE,{
          parentFileSid:this.data.parentFolderId,
          // type:this.parentFolderType,//0:私有空间的文件夹;1:共享空间的文件夹
          sort:this.sortDesc,
          pageNo:this.data.pageNo,
          pageSize:this.pageSize,
        })
        this.totalNumber = res.data.totalNumber
        let newList = res.data.list
        if(Array.isArray(newList)&&newList.length){
          //是否有操作权限
          newList.forEach(it=>{
            this.dealFileItem(it)
          })
          if(this.data.pageNo==1){
            this.setData({fileList:newList})
          }
          else{
            let list = [...this.data.fileList,...newList]
            this.setData({fileList:list})
          }
          if(this.pageSize*this.data.pageNo>=this.totalNumber){
            this.setData({hasNoMore:true})
          }
          else{
            this.setData({pageNo:this.data.pageNo+1})
          }
        }
        else{
          if(this.data.pageNo==1){
            this.setData({fileList:[]})
          }
          this.setData({hasNoMore:true})
        }
        return res
    }
    finally{
      this.setData({loading:false,loadingMore:false})
    }
  },
  //获取父文件详情信息  --没有写权限 或者 大于20层之后不允许继续创建子文件
  async getParentFolderDetail(){
    let {data} = await request.post(FOLDER_DETAIL,{
      fileSid:this.data.parentFolderId,
      name:this.parentFolderName
    })
    if(data){
      if(Array.isArray(data.permissions)&&data.permissions.indexOf('WRITE')>-1&&data.level<20){
        this.setData({canAdd:true})
      }
      else{
        this.setData({canAdd:false})
      }
    }
  },
  //处理文件列表对象
  dealFileItem(it){
    it.id=it.fileSid
    it.subName = it.name
    if(it.fileType=='FOLDER'){
      it.type="folder"
    }
    if(it.fileType!=='FOLDER'&&it.name&&it.name.indexOf('.')>-1){
      it.ext = it.name.split('.')[1]
      it.subName = it.name.split('.')[0]
      it.type=this.fileDetailType(it.ext)
    }
    //是否有操作权限
    if(Array.isArray(it.permissions)){
      it.isWrite = it.permissions.indexOf('WRITE')>-1
      it.isRead = it.permissions.indexOf('PREVIEW')>-1
    }
    return it
  },
  fileDetailType(ext){
    ext = ext.toLocaleLowerCase()
    let type = {
      'jpg':"image",
      'gif':"image",
      'png':"image",
      'txt':'txt',
      'xls':'excel',
      'xlsx':'excel',
      'doc':'doc',
      'docx':'doc',
    }
    return type[ext]?type[ext]:'txt'
  },
 //下拉刷新
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
  goDetail(event){
    let item = event.detail.item
    if(item.type!=='folder'){
      wx.navigateTo({
        url: '../fileView/index?id='+item.id+'&name='+item.name
      })
    }
    else{
      let currPathList =  JSON.parse(JSON.stringify(this.data.pathList))
      currPathList.push(item.name)
      wx.navigateTo({
        url: `../spaceDetail/index?id=${item.id}&name=${item.name}&pathList=${JSON.stringify(currPathList)}&from=${this.data.pageFrom}`
      })
    }
  },
  //排序数据
  sortData(e){
    console.log('sort data....', e.detail.sortDesc)
    this.sortDesc = e.detail.sortDesc
    this.getData()
  },
  //新增操作
  showAddAction(){
    this.debounce(()=>{
      this.setData({addActionSheetVisible:true })
    },200)
  },
  //新建文件夹
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
  bindinputModal(e){
    let val = e.detail.value
    let reg = /[\/\\:*?"<>|]+/gim
    if(reg.test(val)){
      val=val.replace(reg,'')
    }
    this.setData({modalInputTxt:val})
  },
  clearInput(){
    this.setData({modalInputTxt:''})
  },
  async modalComplete(e){
    if(!this.data.modalInputTxt.trim())return
    if(this.data.submiting)return
    this.setData({submiting:true})
    console.log('modal sure...',this.data.modalInputTxt,e)
    let list = this.data.fileList
    if(this.data.currentAction=="addFoler"){
      try{
        let res = await request.post(FOLDER_CREATE,{
          parentFileSid:this.data.parentFolderId,
          name:this.data.modalInputTxt.trim(),
          // type:this.parentFolderType,//0:私有空间的文件夹;1:共享空间的文件夹
        })
        //追加数据，不直接刷新
        if(res.data){
          this.dealFileItem(res.data)
          list.push({...res.data,type:'folder',isWrite:true,isRead:true})
          this.setData({fileList:list})
        }
        else{
          this.getData()
        }
        this.setData({ showModal: false})
      }
      finally{
        this.setData({submiting:false})
      }
    }
  },
  //上传图片
  async addImg(){
    let self = this 
    wx.chooseImage({
      count:1,//默认最多1张
      async success (res) {
        // let fileUrl = res.tempFilePaths[0]
        // let file = res.tempFiles //包括{path,size}
        console.log('imgfile....',res)

       // self.imgCheck(fileUrl)

        // let imgs = res.tempFilePaths.map(it=>{
        //   return {
        //     id:parseInt(10**6*Math.random()),
        //     name:parseInt(10**6*Math.random()),
        //     url:it,
        //     type:'file',
        //     ext:it.substring(it.lastIndexOf('.')+1)
        //   }
        // })
        // self.setData({fileList:[...self.data.fileList,...imgs]})
        //wx.uploadFile只支持单个单个上传，Promise.all
        let params = {
          uid : wx.getStorageSync('uidEnc'),
          userName:wx.getStorageSync('userInfo').name,
          parentFileSid:self.data.parentFolderId
        }
        let promiseAry = res.tempFilePaths.map(it=>{
          console.log(3333333,params,it)
          return new Promise((resolve,reject)=>{
            wx.uploadFile({
              url: FILE_UPLOAD, //仅为示例，非真实的接口地址
              filePath: it,
              name: 'files',//文件对应的 key，开发者在服务端可以通过这个 key 获取文件的二进制内容
              formData: params,
              success (res){
                // const data = res.data
                console.log(222222222,res)
                let data = JSON.parse(res.data)
                if(data.errcode==0){
                  resolve(data)
                }
                else{
                  reject(data.message)
                }
              },
              fail(e){
                reject(e)
              }
            })
          })
        })
        try{
          wx.showLoading({title: '上传中...'})
          let res = await Promise.all(promiseAry)
          console.log(33333333,res)
          //不刷新页面，追加数据
          let items = res[0].data
          if(Array.isArray(items)){
            self.dealFileItem(items[0])
            items[0].isWrite=true
            items[0].isRead=true
            self.setData({fileList:[...self.data.fileList,...items]})
          }
          else{
            self.getData()
          }
        }
        catch(e){
          console.log('上传失败:'+e)
          wx.showToast({
            title: '上传失败：'+e,
            icon:'none',
            duration:5000,
          })
        }
        finally{
          wx.hideLoading()
        }
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
  //返回最顶层网盘页面
  goIndexPage(){
    wx.navigateBack({
      delta:1000
    })
  },
  //path定位到点击页面
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
  //fileList 操作之后 回调 重置fileList
  reSetList(e){
    this.setData({fileList:e.detail.list})
  },
  imgCheck(path){
    let check = (path)=>{
      return new Promise((resolve,reject)=>{
          wx.uploadFile({
            url: CHECK_IMG, 
            filePath: path,
            name: 'media',//文件对应的 key，开发者在服务端可以通过这个 key 获取文件的二进制内容
            success (res){
              wx.showToast({
                title: JSON.stringify(res),
                icon: "none",
                duration: 8000
              })
              if(res.data.errcode == 87014){
                wx.showToast({
                  title: '内容含有违法违规内容',
                  icon: "none",
                  duration: 8000
                })
                reject() 
              }
              else{
                resolve()
              }
            },
            fail(e){
              wx.showToast({
                title: "文件上传异常:"+e.errMsg,
                icon:'none',
                duration:8000
              })
              reject() 
            }
          })
      }) 
    }
    let render = (path, width, height) => {
      // 获取视图层的canvas节点，类似前端的 var xxx = document.getElementById("xxxx");
      wx.createSelectorQuery()
        .select('#compress') // 视图层canvas节点id
        .fields({node: true})
        .exec(res => { // 回调，res是返回的多个节点组成的数组
           console.log(' wx.createSelectorQuery.....')
            let canvas = res[0].node;
            canvas.width = width;
            canvas.height = height;
            let ctx = canvas.getContext('2d'); // canvas2d绘图上下文
            let img = canvas.createImage(); // 创建img对象（类似HTML的img标签）
            img.src = path;
            console.log(' img.src = path...'+path)
            img.onload = () => {
                console.log('img.onload.....')
                ctx.clearRect(0, 0, width, height); // 渲染前将画布清空（强迫症）
                // 新API的drawImage方法接收的第一个参数不再是url，而是img对象
                ctx.drawImage(img, 0, 0, width, height);
                wx.canvasToTempFilePath({
                    canvas,
                    x: 0,
                    y: 0,
                    destWidth: width,
                    destHeight: height,
                    fileType: 'jpg',
                    quality: 0.8,
                    success:res=>{
                      wx.showToast({
                        title: res.tempFilePath,
                        icon: "none",
                        duration: 4000
                      })
                     check(res.tempFilePath); // (重绘后的图片, 原图片)
                    },
                    fail(e){
                      wx.showToast({
                        title: JSON.stringify(e),
                        icon: "none",
                        duration: 4000
                      })
                    }
                })
            };
            img.onerror = ()=>{
              console.log('img.onerror.....'+JSON.stringify(arguments))
            }
        });
    }

    // 读取照片信息，计算压缩后的大小
    wx.getImageInfo({
      src: path ,// 单张照片的临时路径
      success:res=>{
        let aspectRatio = res.width / res.height;
        let width, height;
        if (aspectRatio >= 1) {
            width = 256;
            height = Math.floor(width / aspectRatio);
        } else {
            height = 256;
            width = Math.floor(height * aspectRatio);
        }
        this.setData({
            cWidth: width,   // 画布宽度（WXML）
            cHeight: height  // 画布高度（WXML）
        });
        // 开始绘图
        render(path, width, height);
        console.log(' render(path, width, height)')
      }
    })  
  },
  search(e){
    this.setData({searchStatus:e.detail.searchStatus})
  },
  // 防抖
  debounce(fn, wait) {    
    let self=this 
    return (function() {        
      if(self.timerId !== null) clearTimeout(self.timerId);   
      self.timerId=setTimeout(fn, wait) 
    })()
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
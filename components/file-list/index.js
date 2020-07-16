Component({
  properties: {
    dataList: {
      type: Array,
      value:[],
      observer: function (newVal, oldVal) {
        this.setFileGroupList(newVal)
        this.setData({
          fileList: newVal,
        })
      }
    },
  },
  data: {
    fileList:[],
    fileGroupList:[],
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
    slideButtons: [{
      type: 'warn',
      text: '删除',
      extClass: 'test',
      data:{action:'del'}
    }],
    currentSliderId:'',
    checkStatus:false,
  },
  methods: {
    setFileGroupList(newVal){
      let fileGroupList = []
      let fileList = newVal.filter(it=>it.type=='file')
      let folderList = newVal.filter(it=>it.type=='folder')
      if(folderList.length){
        fileGroupList.push({title:'文件夹',list:folderList})
      }
      if(fileList.length){
        fileGroupList.push({title:'文件',list:fileList})
      }
      this.setData({
        fileGroupList:fileGroupList,
      })
    },
    goDetail(event){
      //批量选择状态下，点击事件用来操作选择
      if(this.data.checkStatus){
        this.checkBindTap(event.currentTarget.dataset.item)
      }
      //去详情页
      else{
        let item = event.currentTarget.dataset.item
        this.triggerEvent('goDetail',{item})
      }
    },
    //文件操作
    showOperationActionSheet(event){
      let item =event.detail.item?event.detail.item:event.currentTarget.dataset.item
      console.log('showOperationActionSheet...',event)
      this.debounce(()=>{
        this.setData({
          currentItem:item,
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
    bindinputModal(e){
      this.setData({modalInputTxt:e.detail.value})
    },
    modalComplete(e){
      if(!this.data.modalInputTxt.trim())return
      console.log('modal sure...',this.data.modalInputTxt,e)
      this.setData({
        showModal: false,
      })
      let list = this.data.fileList
      if(this.data.currentAction=="addFoler"){
        list.push({name:this.data.modalInputTxt,type:'folder',id:Math.random()})
        this.setData({fileList:list})
        this.setFileGroupList(this.data.fileList)
        wx.showToast({
          title: '添加成功',
          duration: 2000
        })
      }
      else if(this.data.currentAction=='rename'){
        let item = list.find(it=>it.id==this.data.currentItem.id)
        item.name=this.data.modalInputTxt
        this.setData({fileList:list})
        this.setFileGroupList(this.data.fileList)
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
            self.setFileGroupList(self.data.fileList)
            self.triggerEvent('reSetList',{list})
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
    slideBindshow(e){
      this.setData({currentSliderId:e.currentTarget.dataset.item.id})
    },
    slideBindhide(e){
      this.setData({currentSliderId:''})
    },
    slideButtonTap(e){
      console.log(222222,e)
      this.setData({currentItem:e.currentTarget.dataset.item})
      if(e.detail.data.action=='del'){
        this.showDelToast()
      }
    },
    //选中
    chooseMutiple(e){
      this.setData({checkStatus:true})
    },
    checkBindTap(item){
      let list = this.data.fileList
      let currentItem = list.find(it=>it.id==item.id)
      currentItem.checked=currentItem.checked==undefined?true:!currentItem.checked
      this.setData({fileList:list})
      this.setFileGroupList(this.data.fileList)
    },
    cancelCheckStatus(e){
      this.setData({checkStatus:false})
    },
    batchDel(){
      let list = this.data.fileList
      let delList = list.filter(it=>it.checked)
      if(delList.length==0){
        return
      }
      let files = delList.filter(it=>it.type=='file')
      let folders = delList.filter(it=>it.type=='folder')
      let msg = files.length>0?`${files.length}个文件`:''
      let msg2 =folders.length>0?`${folders.length}个文件夹(包含文件夹下所有文件)`:''
      let resMsg = msg&&msg2?[msg,msg2].join('和'):(msg?msg:msg2)
      let self = this
      wx.showModal({
        content:'确认删除'+resMsg,
        confirmColor:"#C95E57",
        confirmText:'删除',
        cancelColor:'#4F79B4',
        success(res){
          if (res.confirm) {
            delList.forEach(delItem=>{
              let item = list.find(it=>it.id==delItem.id)
              list.splice(list.indexOf(item),1)
            })
            self.setData({fileList:list})
            self.setFileGroupList(self.data.fileList)
            self.triggerEvent('reSetList',{list})
            self.setData({checkStatus:false})
            console.log('用户点击确定')
          }
          else if (res.cancel) {
            console.log('用户点击取消')
          }
        },
        fail(){
        },
        complete(){
        }
      })
    }
  }
})
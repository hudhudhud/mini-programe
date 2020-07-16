Component({
  options: {
    virtualHost: true,
  },
  properties: {
    searchBarVisible:{
      type: Boolean,
      value:true,
    },
    sortVisible: {
      type: Boolean,
      value:false,
    },
    parentId:{
      type: String,
      value:'',
      observer: function (newVal, oldVal) {
        this.setData({
          parentFolderId: newVal
        })
      }
    }
  },
  data: {
    // 这里是一些组件内部数据
    loading: false,
    searchStr:'',
    searchStatus:false,
    searchResList:[],
    sortActionItems:['按名称降序','按大小降序','按时间降序'],
    parentFolderId:'',

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
  methods: {
    goSearch(){
      console.log('search....',this.data.parentFolderId)
      this.setData({searchStatus:true})
    },
    cancelSearch(){
      this.setData({searchStatus:false})
      this.setData({searchResList:[]})
      this.setData({searchStr:''})
      wx.hideLoading()
    },
    search_bindKeyInput(e){
      this.setData({searchStr:e.detail.value})
      if(e.detail.value){
        this.setData({loading:true})
        wx.showLoading({
          title: '加载中',
        })
        this.debounce(this.searchFileFunc.bind(this),300)
      }
      else{
        this.setData({loading:false})
        this.setData({searchResList:[]})
      }
    },
    searchFileFunc(){
      console.log(222222222,this)
      setTimeout(() => {
        let files = [{id:555,name:'123',type:'folder'},{id:556,name:'123',type:'file',ext:'txt'}]
        this.setData({searchResList:files})
        // this.setData({searchResList:[]})
        this.setData({loading:false})
        wx.hideLoading()
      }, 500);
     // this.triggerEvent('search',this.searchStr)
    },
    // 防抖
    debounce(fn, wait) {    
        let self=this 
        return (function() {        
          if(self.data.timerId !== null) clearTimeout(self.data.timerId);   
          self.setData({'timerId':setTimeout(fn, wait)})   
        })()
    },
    goInfo(event){
      let item = event.currentTarget.dataset.item
      wx.navigateTo({
        url: '/pages/spaceInfo/index?id='+item.id
      })
    },
    showSortAction(){
      let self = this
      wx.showActionSheet({
        itemList: self.data.sortActionItems,
        success (res) {
          wx.showToast({
            title: '成功',
            icon: 'success',
            duration: 2000
          })
          if(res.tapIndex==0){
           self.setData({sortActionItems:['↓ 按名称降序','按大小降序','按时间降序']})
          }
          if(res.tapIndex==1){
            self.setData({sortActionItems:['按名称降序','↓ 按大小降序','按时间降序']})
           }
          if(res.tapIndex==2){
            self.setData({sortActionItems:['按名称降序','按大小降序','↓ 按时间降序']})
          }
        },
        fail (res) {
          console.log(res.errMsg)
        },
        complete(){

        }
      })
    },
    goDetail(event){
      let item = event.detail.item
      let currPathList =  [item.name]
      wx.navigateTo({
        url: '../../pages/spaceDetail/index?id='+item.id+'&name='+item.name+`&pathList=${JSON.stringify(currPathList)}&from=search`
      })
    },

  }
})
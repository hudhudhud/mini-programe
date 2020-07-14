Component({
  properties: {
    dataList: {
      type: Array,
      value:[],
      observer: function (newVal, oldVal) {
        this.setData({
          fileList: newVal
        })
      }
    },
  },
  data: {
    fileList:[],
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
    currentSlidenItem:'',
  },
  methods: {
    goDetail(event){
      let item = event.currentTarget.dataset.item
      this.triggerEvent('goDetail',{item})
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
      this.setData({currentSlidenItem:e.currentTarget.dataset.item})
    },
    slideButtonTap(e){
      console.log(222222,e)
      this.setData({currentItem:e.currentTarget.dataset.item})
      if(e.detail.data.action=='del'){
        this.showDelToast()
      }

    }
  }
})
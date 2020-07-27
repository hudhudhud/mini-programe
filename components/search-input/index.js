import regeneratorRuntime from '../../runtime.js'
import * as request from '../../utils/request.js';
import {FOLDER_TREE} from '../../utils/api.js';
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
    loadingMore:false,
    hasNoMore:false,
    sortName:'',
    sortType:'',
    sortActionSheetVisible:false,
    sortActionActiveItem:'',
    currentSortIndex:-1,
    sortActions:[{
      key:'name',
      name:'名称',
      sortType:''
    },{
      key:'length',
      name:'大小',
      sortType:''
    },{
      key:'createdStamp',
      name:'时间',
      sortType:''
    }]
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
        // wx.showLoading({
        //   title: '加载中',
        // })
        this.debounce(this.searchFileFunc.bind(this),300)
      }
      else{
        this.setData({loading:false})
        this.setData({searchResList:[]})
      }
    },
    async searchFileFunc(){
    //   setTimeout(() => {
    //     let files = [{id:555,name:'123',type:'folder'},{id:556,name:'123',type:'file',ext:'txt'}]
    //     this.setData({searchResList:files})
    //     // this.setData({searchResList:[]})
    //     this.setData({loading:false})
    //     // wx.hideLoading()
    //   }, 500);
    //  // this.triggerEvent('search',this.searchStr)
      
      let {data} = await request.post(FOLDER_TREE,{
        parentFileSid:this.data.parentFolderId,
        type:this.data.parentFolderId?0:1,//0:私有空间的文件夹;1:共享空间的文件夹
        name:this.data.searchStr
      })
      if(Array.isArray(data)){
        data.forEach(it=>it.id=it.fileSid) 
        this.setData({loading:false,searchResList:data})
      }
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
    sortActionTap(e){
      // let item = e.currentTarget.dataset.item
      let index = e.currentTarget.dataset.index
      let list =  this.data.sortActions
      list.forEach((item,i)=>{
        if(i!=index){
          item.sort=''
        }
      })
      let actionItem = list[index]
      if(!actionItem.sort){
        actionItem.sort='-'
      }
      else if(actionItem.sort=='-'){
        actionItem.sort='+'
      }
      else if (actionItem.sort=='+'){
        actionItem.sort=''
      }
      this.setData({sortActions:list,currentSortIndex:actionItem.sort?index:-1})
      let sortDesc=''
      if(actionItem.sort!=''){
        sortDesc =  actionItem.sort+'/'+actionItem.key
      }
      this.triggerEvent('sortData',{sortDesc})
    },
    showSortAction(){
      this.setData({sortActionSheetVisible:true})
    },
    goDetail(event){
      let item = event.detail.item
      let currPathList =  [item.name]
      wx.navigateTo({
        url: '../../pages/spaceDetail/index?id='+item.id+'&name='+item.name+`&pathList=${JSON.stringify(currPathList)}&from=search`
      })
    },
    loadMore(){
      console.log('loading more...',arguments)
      // if(this.data.searchResList.length>30){
      //   this.setData({loadingMore:false,hasNoMore:true})
      //   return
      // }
      // this.setData({loadingMore:true})
      // setTimeout(() => {
      //   this.setData({searchResList:[...this.data.searchResList,...[
      //     {id:1,name:'1',type:'folder'},{id:556,name:'7',type:'file',ext:'txt'},
      //     {id:2,name:'2',type:'folder'},{id:556,name:'8',type:'file',ext:'txt'},
      //     {id:3,name:'3',type:'folder'},{id:556,name:'9',type:'file',ext:'txt'}
      //   ]]})
      //   this.setData({loadingMore:false})
      // }, 500);
    },

  }
})
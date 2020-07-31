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
    },
    parentType:{
      type: String,
      value:'0',
      observer: function (newVal, oldVal) {
        this.setData({
          parentType: newVal
        })
      }
    },
  },
  data: {
    // 这里是一些组件内部数据
    loading: false,
    searchStr:'',
    searchStatus:false,
    searchResList:[],
    sortActionItems:['按名称降序','按大小降序','按时间降序'],
    parentFolderId:'',
    parentType:'',
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
    loadingMore:false,
    hasNoMore:false,
    sortName:'',
    sortType:'',
    sortActionSheetVisible:false,
    sortActionActiveItem:'',
    currentSortIndex:-1,
    pageNo:1,
    sortActions:[{
      key:'name',
      name:'名称',
      sortType:''
    },{
      key:'length',
      name:'大小',
      sortType:''
    },{
      key:'createdTimestamp',
      name:'时间',
      sortType:''
    }]
  },
  methods: {
    goSearch(){
      this.setData({searchStatus:true})
    },
    cancelSearch(){
      this.setData({searchStatus:false,searchResList:[],searchStr:''})
      this.triggerEvent('search',{searchStatus:false})
      wx.hideLoading()
    },
    search_bindKeyInput(e){
      if(!e.detail.value||!e.detail.value.trim()){
        this.setData({loading:false,searchStatus:true,searchResList:[],searchStr:''})
         //触发页面隐藏默认显示
        this.triggerEvent('search',{searchStatus:false})
        return
      }
      this.setData({searchStr:e.detail.value,loading:true})
      this.debounce(this.searchFileFunc.bind(this),300)
      //触发页面隐藏默认显示
      this.triggerEvent('search',{searchStatus:true})
    },
    searchFileFunc(){
      // let {data} = await request.post(FOLDER_TREE,{
      //   parentFileSid:this.data.parentFolderId,
      //   type:this.data.parentType,//0:私有空间的文件夹;1:共享空间的文件夹
      //   name:this.data.searchStr
      // })
      // if(Array.isArray(data)){
      //   data.forEach(it=>{
      //     this.dealFileItem(it)
      //   })
      //   this.setData({loading:false,searchResList:data})
      // }
      this.setData({pageNo:1,hasNoMore:false,searchResList:[]})
      this.pageSize=20
      this.loadMore()
    },
    async loadMore(){
      console.log('loading more...')
      try{
          if(this.data.hasNoMore){
            return
          }
          if(this.data.pageNo>1){
            this.setData({loadingMore:true})
          }
          let res= await request.post(FOLDER_TREE,{
            parentFileSid:this.data.parentFolderId,//--首页搜索的时候是undefined，其余都有值
            type:this.data.parentType,//0:私有空间的文件夹;1:共享空间的文件夹,--首页搜索的时候type是1，其余都是undefined
            name:this.data.searchStr,
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
              this.setData({searchResList:newList})
            }
            else{
              let list = [...this.data.searchResList,...newList]
              this.setData({searchResList:list})
            }
            if(this.pageSize*this.data.pageNo>=this.totalNumber){
              this.setData({hasNoMore:true})
            }
            else{
              this.setData({pageNo:this.data.pageNo+1})
            }
          }
          else{
            this.setData({hasNoMore:true})
          }
          return res
      }
      finally{
        this.setData({loading:false,loadingMore:false})
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
    //去文件列表详情
    goDetail(event){
      let item = event.detail.item
      let currPathList =  [item.name]
      wx.navigateTo({
        url: '../../pages/spaceDetail/index?id='+item.id+'&name='+item.name+`&pathList=${JSON.stringify(currPathList)}&from=search`
      })
      // let item = event.detail.item
      // this.triggerEvent('goDetail',{item})
    },
    //去空间详情
    goInfo(event){
      let item = event.currentTarget.dataset.item
      wx.navigateTo({
        url: '/pages/spaceInfo/index?id='+item.id
      })
    },
    //排序
    showSortAction(){
      this.debounce(()=>{
        this.setData({sortActionSheetVisible:true})
      },300)
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
        sortDesc =  actionItem.sort+actionItem.key
      }
      this.sortDesc = sortDesc
      this.triggerEvent('sortData',{sortDesc})
    },
    // 防抖
    debounce(fn, wait) {    
      let self=this 
      return (function() {        
        if(self.timerId) clearTimeout(self.timerId);   
        self.timerId=setTimeout(fn, wait)
      })()
    },
  }
})
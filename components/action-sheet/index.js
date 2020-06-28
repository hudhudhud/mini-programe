Component({
  properties: {
    show: {
      type: Boolean,
      value:false,
    },
  },
  data: {

  },
  methods: {
    cancel(){
      console.log('action-sheet','取消')
      this.setData({show:false})
      //this.triggerEvent('search',this.searchStr)
    },

  }
})
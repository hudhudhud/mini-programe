Component({
  options: {
    virtualHost: true,
    styleIsolation: 'isolated',//样式隔离，默认值，在自定义组件内外，使用 class 指定的样式将不会相互影响
    externalClasses: ['my-class']
  },
  properties: {
    show: {
      type: Boolean,
      value:false,
      observer: function (newVal, oldVal) {
        // 显示
        console.log('observer...',newVal)
        // if (newVal) {
        //   this.setData({
        //     show: true,
        //   })
        // } else {
        //   this.setData({
        //     show: false
        //   })
        // }
      }
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
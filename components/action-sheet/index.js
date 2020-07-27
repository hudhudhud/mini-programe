
var animation = wx.createAnimation({
  duration: 100,
  timingFunction: 'linear',
  delay: 0
})

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    // 组件的初始显隐
    actionShow: {
      type: Boolean,
      value: false,
      observer: function (newVal, oldVal) {
        this.animation = animation
        animation.opacity(0).step()
        // 显示
        if (newVal) {
          this.setData({
            actionVisible: true,
            mask: '',
            animation: 'showAction'
          })
        } else {
          this.setData({
            animation: 'hideAction',
            mask: 'transparent'
          })
          setTimeout(()=>{
            this.setData({
              actionVisible: false
            })
          }, 510)
        }
      }
    },
    // 取消按钮的文字
    closeText: {
      type: String,
      value: '取消',
      observer: function (newVal, oldVal) {
        this.setData({
          closeText: newVal
        })
      }
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    mask: '',
    animation: 'showAction',
    timerId:'',
    actionVisible:false,
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 取消按钮响应事件
    actionHide: function () {
      console.log('取消...')
      var that = this
      this.setData({
        animation: 'hideAction',
        mask: 'transparent'
      })
      setTimeout(function () {
        that.setData({
          actionVisible: false
        })
      }, 510)
      var myEventDetail = {}
      var myEventOption = {}
      this.triggerEvent('actionHide', myEventDetail, myEventOption)
    },
  }
})

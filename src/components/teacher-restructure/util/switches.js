/**
 * @module 教师遥控器的开关
 */

let uploadslideCrashTimer = null

function sendUploadSocket (slideindex, slideid) {
  let self = this

  let str = JSON.stringify({
    'op': 'uploadslide',
    'lessonid': self.lessonid,
    'presentation': self.presentationid,
    'slideindex': slideindex,
    'slideid': slideid
  })

  self.socket.send(str)
}

export default {
  methods: {
    /**
     * 关闭蒙版
     */
    killMask: function () {
      this.setData({
        isMsgMaskHidden: true,      // 针对初始蒙版
        // TODO 和夺权有潜在冲突
        isToastCtrlMaskHidden: true, // 针对夺权蒙版
        isInitiativeCtrlMaskHidden: true,
        msgMaskTpl: '', // 断网重连蒙版需要遮住工具栏，就是用 isYieldToolbar 判断的，用到了 msgMaskTpl
        initiativeCtrlMaskTpl: ''
      })
    },
    /**
     * 点亮弹幕按钮
     */
    openDanmuBtn: function () {
      this.setData({
        isDanmuOpen: true
      })
    },
    /**
     * 熄灭弹幕按钮
     */
    closeDanmuBtn: function () {
      this.setData({
        isDanmuOpen: false
      })
    },
    /**
     * 打开夺权面板
     *
     * @param {string} str isRobber notRobber
     * @param {Boolean} byself 自己夺自己的权
     */
    openDeprive: function (str, byself = false) {
      this.setData({
        isToastCtrlMaskHidden: false,
        isRobber: str === 'isRobber',
        toastCtrlMaskTpl: 'Deprive',
        initiativeCtrlMaskTpl: '', // 必须置空，防止 isYieldToolbar 为true，从而露出底部工具栏
        byself,
      })
    },
    /**
     * 老版本雨课堂软件，没有二维码控制，显示 '已连接成功\n请在电脑上播放幻灯片'
     */
    showOldHelloMask: function () {
      this.setData({
        isMsgMaskHidden: false,
        msgMaskTpl: 'Errormsg',
        errType: 1
      })
    },
    /**
     * 电脑结束放映，显示 '已退出全屏放映\n或放映正在连接中'
     */
    showEscMask: function () {
      this.setData({
        isMsgMaskHidden: false,
        msgMaskTpl: 'Errormsg',
        initiativeCtrlMaskTpl: '', // 必须置空，防止 isYieldToolbar 为true，从而露出底部工具栏
        errType: 2
      })
    },
    /**
     * 显示 '您的电脑存在连接异常\n请您检查网络连接状况'
     */
    showPcErrorMask: function () {
      this.setData({
        isMsgMaskHidden: false,
        msgMaskTpl: 'Errormsg',
        initiativeCtrlMaskTpl: '', // 必须置空，防止 isYieldToolbar 为true，从而露出底部工具栏
        errType: 3
      })
    },
    /**
     * 跳转到某页，无论是正常翻页、缩略图、还是初次打开遥控器
     *
     * @param {Object} msg WebSocket指令
     */
    showWhichPage: function (msg) {
      let self = this
      self.data = self // hack 复用小程序代码

      // 有可能打开遥控器的时候ppt还没有开始上课，此时hello返回的slideindex可能是0
      let current = msg.slideindex || 1
      // 防止一开始hello的时候数据还没有加载进来
      let isProblem = self.data.pptData.length && typeof self.data.pptData[current - 1].Problem !== 'undefined'
      let isProblemPublished = msg.unlockedproblem.includes(current)// 也是从1开始的页码，但是unlockedproblem是从0开始的

      self.$store.commit('set_current', current)

      self.setData({
        // current: current,
        isPubCheckProblemBtnHidden: !isProblem,
        isProblemPublished: isProblemPublished,
        unlockedproblem: msg.unlockedproblem
      })

      setTimeout(() => {
        self.handleUploadSlide(msg)
      }, 500)
    },
    /**
     * 跳转后，判断是否是坏图，是否需要重传
     *
     * @param {Object} msg WebSocket指令
     */
    handleUploadSlide: function (msg) {
      let self = this
      self.data = self // hack 复用小程序代码
      let current = msg.slideindex || 1

      // 到下一页重新让能够显示2秒的加载中并清除之前的定时器，否则可能不到2秒就 crash 了
      clearTimeout(uploadslideCrashTimer)
      self.setData({
        isUploadSlideCrash: false
      })

      if (self.data.isUpImgError) {
        let si = msg.slideindex
        let sid = msg.slideid

        sendUploadSocket.call(self, si, sid)
      }

      if (self.data.isDownImgError) {
        let si = msg.slideindex + 1
        let sid = self.data.pptData[current].lessonSlideID

        sendUploadSocket.call(self, si, sid)
      }

      if (self.data.isUpImgError || self.data.isDownImgError) {
        uploadslideCrashTimer = setTimeout(() => {
          self.setData({
            isUploadSlideCrash: true
          })
        }, 1500)
      }

    },
    /**
     * 打开二维码控制面板
     *
     */
    showQrcodeMask: function () {
      let self = this

      self.setData({
        isInitiativeCtrlMaskHidden: false,
        initiativeCtrlMaskTpl: 'Qrcode'
      })
    },
  }
}
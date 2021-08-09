/*
 * 教师遥控器 socket服务：开启、断开重连等
 * @author: liujunyang
 * @update: 2017.06.05
 * @desc 课堂与node后端交互，翻页、弹幕等
 *
 */

import socketProcessMessage from './socket-process-message'

const isLocal = location.host.indexOf('localhost') !== -1 || location.host.indexOf('192.168') !== -1

const SOCKET_HOST = isLocal ? 'pre-apple-ykt.xuetangonline.com' : location.host

let xintiaoTimer = null
let isReconnect = false

/*
 * 在连网状态下断网，立即重连3次，还连不上的话之后隔3秒再连第四次，如果还连不上则显示10秒
 * 倒计时重连蒙版，中间用户可以点击立即重连。无论是立即重连还是倒计时到时重连不上，则继续
 * 新一轮的10秒倒计时。
 *
 */
let retryCount = 0                // 断了以后立马重连的次数，正计数，最大是3次
let connectCountDownTimer = null  // 10秒倒计时的定时器，用的setTimeout

let mixin = {
  methods: {
    /*
    * @method 关闭websocket
    */
    closews() {
      let self = this
      let socket = this.socket

      try {
        // socket.close()
        socket.onopen = null
        socket.onmessage = null
        socket.send = null

        self.$store.commit('set_socket', null)
        self.socket = null

        socket.close()

        return this
      } catch(e) {
      }
    },
    /*
    * @method 初始化创建websocket实例
    */
    initws() {
      let self = this
      // 持久化了，所以总是有socket对象
      if (!isReconnect && self.$store.state.socket && self.$store.state.socket.send) {
        // TODO 处理断网重连的socket怎么处理
        // 不用重连了：不是断网重连，并且有连接能力（刷新可能导致只是一个对象而已）
        self.socket = self.$store.state.socket
        return;
      }

      try {
        if (self.$store.state.socket && self.$store.state.socket.send) {

          // 之前反复自己踢自己的可能原因
          // closews 中的 socket.close() 是先执行的，可能它崩了
          // 然后 closews try 中的第一行之后的语句就都没有执行，就进入了 initws 中的
          // 这个 try， 然后本注释所在的这个if上的socket对象还存在，就进入了这个if，
          // 下面的close是走网络的，然后立即执行后面的语句，下面的if应该也会执行，
          // closews 的try 应该就会再崩一回，然后执行下面的 new WebSocket，
          // 这时旧的socket还没有完全close，而 socket.onmessage = null 因为之前崩了没有执行，
          // 新的socket就会导致旧的socket触发 deprived，触发夺权弹窗
          self.$store.state.socket.close()
        }

        if(this.socket) {
          this.closews()
        }

        // 雷上已经全部使用https了，本地调试也使用https
        // let wsProtocol = location.protocol === 'https:' ? 'wss://' : 'ws://'
        let wsProtocol = 'wss://'
        window.socket = this.socket = new WebSocket(wsProtocol + SOCKET_HOST + '/wsapp/')
        socket.socket_id = Date.now()
        self.$store.commit('set_socket', socket)

        // 上报连接 socket 动作


        this.socket.onerror = function(event) {
        }

        // 关闭
        this.socket.onclose = function(event) {

          self.closews()
          self.isSocketConnected = false
          // self.$refs.MsgMask.$emit('socketClosed')
          isReconnect = true

          retryCount++;
          if (retryCount < 3){
            self.initws()
          }else if(retryCount === 3){
            setTimeout(function(){
              self.initws()
            }, 3000);
          }else if(retryCount >= 4){
            self.setData({
              connectCountDown: 10,
              isConnectingHidden: true,
            })
            self.$store.commit('set_msgMaskTpl', 'Reconnect')
            self.$store.commit('set_isMsgMaskHidden', false)
            self.countDown()
          }
        }

        // 接收socket信息
        this.socket.onopen = function(event) {
          isReconnect = false
          self.isSocketConnected = true
          // self.sendXinTiao()

          // 归零 WebSocket 重连
          retryCount = 0;
          clearTimeout(connectCountDownTimer)
          self.connectCountDown = 10

          self.socket.onmessage = function (event) {
            let msg = JSON.parse(event.data)
            msg.addinversion && self.$store.commit('addinversion', msg.addinversion)
            self.socketProcessMessage(msg)
          }

          // 首先去检测，遥控器是否正在被使用
          self.sendDetectlesson();
        }
      } catch (error) {
        Raven.captureException(error)
        // myApp.alert("您的设备在连接服务时出现了错误，请尝试重试...","")
      }
    },
    // 检测夺权
    //  https://www.tapd.cn/50384083/prong/stories/view/1150384083001033588
    sendDetectlesson () {
      const msg = {
        "op": "detectlesson",
        "lessonid": this.lessonid
      };
      this.socket.send(JSON.stringify(msg));
    },
    sayHello () {
      // 握手开始通信
      const userid = this.identityId || this.userid;
      this.socket.send(JSON.stringify({
        'op': 'hello',
        'userid': userid,
        'avatar': this.avatar,
        'role': 'lecturer',
        'auth': this.token,
        'lessonid': this.lessonid
      }));
    },
    // socketProcessMessage 中使用
    // 根据用户返回的消息，做是否做夺权处理的操作
    detectlessonHandle (msg) {
      const { remoteuid, wakeuid } = msg;
      const userid = this.identityId || this.userid;
      // console.log(remoteuid, wakeuid);
      if (!!remoteuid) {
        this.sayHello();
      } else {
        // 当前遥控器没有使用:
        // 当前用户为开课开课老师
        if(wakeuid == userid) {
          this.sayHello();
        } else {
          this.$store.commit('set_isMsgMaskHidden', true);
          this.openDeprive('isRobber');
          this.set_pretendSeizeAuth(true);
        }
      }
    },
    /*
    * @method 发送心跳函数
    */
    sendXinTiao() {
      let self = this

      clearInterval(xintiaoTimer)
      setInterval(()=>{
        self.socket.send(JSON.stringify({ op: 'xintiao', lessonid: self.lessonid }))
      }, 30 * 1000)
    },
    /**
     * 收到WebSocket指令后进行响应
     *
     * @param {Object} data WebSocket指令
     * WebSocket 通信文档 https://tower.im/projects/1a3a5c7ea6ff4a109296d3c5039c9c19/docs/0c842a038c3f41648a25a169f6fd8e46/#7947c5ddeee5464384592b9b285f8cc8
     */
    socketProcessMessage,
    /**
     * WebSocket 重连倒计时
     *
     */
    countDown () {
      let self = this
      clearTimeout(connectCountDownTimer)

      if(self.connectCountDown === 0){
        self.triggerReconnect()
        return
      }

      connectCountDownTimer = setTimeout(() => {
        self.connectCountDown -= 1
        self.countDown()
      }, 1000)
    },
     /**
     * WebSocket 立即重连
     *
     */
    triggerReconnect () {
      let self = this

      clearTimeout(connectCountDownTimer)
      self.isConnectingHidden = false
      self.connectCountDown = 10
      setTimeout(self.initws, 1000)
    },
  }
}

export default mixin

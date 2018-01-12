/*
 * 教师遥控器 socket服务：开启、断开重连等
 * @author: liujunyang
 * @update: 2017.06.05
 * @desc 课堂与node后端交互，翻页、弹幕等
 *
 */

import socketProcessMessage from './socket-process-message'
import request from '@/util/request'

const SOCKET_HOST = location.host.indexOf('192.168') !== -1 ? 'b.yuketang.cn' : location.host
// const SOCKET_HOST  = 'b.xuetangx.com'

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
        socket.close()
        socket.onopen = null
        socket.onmessage = null

        self.$store.commit('set_socket', null)
        self.socket = null

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
        let url = '/reporter/collect'
        if (self.$store.state.socket && self.$store.state.socket.send) {
          request.get(url, {
            'user_id': self.userid,
            'lesson_id': self.lessonid,
            'type': 'vuex-old-socket-still-exist-h5-teacher',
            'dt': Date.now()
          })
          self.$store.state.socket.send.closews()
        }

        if(this.socket) {
          this.closews()
        }

        // 雷上已经全部使用https了，本地调试也使用https
        let wsProtocol = location.protocol === 'https:' || location.host.indexOf('192.168') !== -1 ? 'wss://' : 'ws://'
        window.socket = this.socket = new WebSocket(wsProtocol + SOCKET_HOST + '/wsapp/')
        self.$store.commit('set_socket', socket)

        // 上报连接 socket 动作
        
        request.get(url, {
          'user_id': self.userid,
          'lesson_id': self.lessonid,
          'type': 'connection-h5-teacher',
          'dt': Date.now()
        })

        // 关闭
        this.socket.onclose = function(event) {
          request.get(url, {
            'user_id': self.userid,
            'lesson_id': self.lessonid,
            'type': 'close-h5-teacher',
            'dt': Date.now()
          })

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
            console.log(msg)

            self.socketProcessMessage(msg)
          }

          // 握手开始通信
          self.socket.send(JSON.stringify({
            'op': 'hello',
            'userid': self.userid,
            'avatar': self.avatar,
            'role': 'lecturer',
            'auth': self.auth,
            'lessonid': self.lessonid
          }))
        }
      } catch (error) {
        Raven.captureException(error)
        // myApp.alert("您的设备在连接服务时出现了错误，请尝试重试...","")
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

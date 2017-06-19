/*
 * 教师遥控器 socket服务：开启、断开重连等
 * @author: liujunyang
 * @update: 2017.06.05
 * @desc 课堂与node后端交互，翻页、弹幕等
 *
 */

import socketProcessMessage from '@/util/teacher-util/socket-process-message'

const SOCKET_HOST = 'b.xuetangx.com' || (location.host.indexOf('192.168') !== -1 && 'b.xuetangx.com') || location.host
window.socket = null
let xintiaoTimer = null

let mixin = {
  methods: {
    /*
    * @method 关闭websocket
    */
    closews() {
      let socket = this.socket

      try {
        socket.close()
        socket.onopen = null
        socket.onmessage = null

        return this
      } catch(e) {
      }
    },
    /*
    * @method 初始化创建websocket实例
    */
    initws() {
      let self = this

      try {
        if(this.socket) {
          this.isResetSocket = true
          this.closews()
        }

        let wsProtocol = location.protocol === 'https:' ? 'wss://' : 'ws://'
        window.socket = this.socket = new WebSocket(wsProtocol + SOCKET_HOST + '/wsapp/')

        // 关闭
        this.socket.onclose = function(event) {
          if(!this.isResetSocket) {
            setTimeout(()=>{
              self.initws()
            }, 1000)
          }
        }

        // 接收socket信息
        this.socket.onopen = function(event) {
          self.isResetSocket = false
          self.sendXinTiao()

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
    * @method 重新连接websocket
    */
    reconnect() {

    },
    /*
    * @method 发送心跳函数
    */
    sendXinTiao() {
      clearInterval(xintiaoTimer)
      setInterval(()=>{
        this.socket.send(JSON.stringify({ op: 'xintiao', lessonid: this.lessonID }))
      }, 30 * 1000)
    },
    /**
     * 收到WebSocket指令后进行响应
     *
     * @param {Object} data WebSocket指令
     * WebSocket 通信文档 https://tower.im/projects/1a3a5c7ea6ff4a109296d3c5039c9c19/docs/0c842a038c3f41648a25a169f6fd8e46/#7947c5ddeee5464384592b9b285f8cc8
     */
    socketProcessMessage
  }
}

export default mixin

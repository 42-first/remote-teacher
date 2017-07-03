/*
 * 学生接收器 socket协议
 * @author: chenzhou
 * @update: 2017.5.27
 * @desc 课堂实时进度，课堂实时活动,提醒等
 *
 */


const SOCKET_HOST = location.host || 'b.yuketang.cn'
window.socket = null

var mixin = {
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
    * param force 强制初始化
    */
    initws(force) {
      let self = this

      this.isReconnect = false;

      try {
        if(this.socket&&!force) {
          this.isResetSocket = true
          this.closews()
        }

        let wsProtocol = location.protocol === 'https:' ? 'wss://' : 'ws://'
        window.socket = this.socket = new WebSocket(wsProtocol + SOCKET_HOST + '/wsapp/')

        // 关闭
        this.socket.onclose = function(event) {
          console.log('onclose');
          // 先尝试连接两次
          if(self.reconnectcount > 1) {
            if(!self.isResetSocket) {
              setTimeout(() => {
                self.reconnect();
              }, 1000)
            }
          } else {
            self.reconnectcount++;
            self.initws(true);
          }

          clearInterval(self.xintiaoTimer);
        }

        // 接收socket信息
        this.socket.onopen = function(event) {
          self.isResetSocket = false;
          console.log('onopen');

          // 心跳
          self.sendXinTiao();

          self.socket.onmessage = function (event) {
            let msg = JSON.parse(event.data)
            console.log(msg)

            self.processMessage(msg)
          }

          // 握手开始通信
          self.socket.send(JSON.stringify({
            'op': 'hello',
            'userid': self.userID,
            'avatar': self.avatar,
            'role': 'student',
            'auth': self.userAuth,
            'lessonid': self.lessonID,
            'presentation': self.presentationID
          }))
        }
      } catch (error) {
        Raven.captureException(error)
      }
    },
    /*
    * @method 重新连接websocket
    */
    reconnect() {
      this.isReconnect = true;

      this.reconnectTimer = setInterval(()=>{
        this.countdown--;

        if(!this.countdown) {
          clearInterval(this.reconnectTimer)
          this.countdown = 10;
          this.initws(true);
        }
      }, 1000)

      console.log('reconnect')
    },
    /*
    * @method 发送心跳函数
    */
    sendXinTiao() {
      this.xintiaoTimer = setInterval(()=>{
        this.socket.send(JSON.stringify({ op: 'xintiao', lessonid: this.lessonID }))
      }, 60000)
    },
    /*
    * @method 根据websocket信息策略处理
    */
    processMessage(msg) {
      let timeline;
      let item;
      let hasMsg = true;

      if(msg.op) {
        // 弹幕状态
        msg["danmu"] && (this.danmuStatus = msg["danmu"])

        switch(msg.op) {
          // 建立通信 时间轴事件
          case 'hello':
            timeline = msg['timeline']

            msg['presentation'] && (this.presentationID = msg['presentation'])

            if(timeline && timeline.length === 0) {
              // 服务端没有此presetationID,重新链接发送
              setTimeout(()=>{
              }, 20000)
            } else {
              this.setTimeline(timeline)
            }

            break

          // 翻页
          case 'slidenav':
            item = msg['slide'];

            item && this.addPPT({ type: 2, pageIndex: item['si'], time: item['dt'], presentationid: item['pres'], event: item });
            break

          // 解锁问题
          case 'unlockproblem' :
            item = msg['problem'];

            if(item) {
              this.addProblem({ type: 3, pageIndex: item['si'], time: item['dt'], presentationid: item['pres'], limit: item.limit, event: item });
              this.timeline['problem'][item['prob']] = item;
            }

            break

          // 新的试卷
          case 'newquiz':
            item = msg['quiz'];

            item && this.addPaper({ type: 4, quiz: item['quiz'], title: item['title'], total: item['total'], time: item['dt'], event: item });
            break

          // 换一个PPT
          case 'showpresentation':
            this.presentationID = msg['presentation'];
            timeline = msg['timeline'];

            this.setTimeline(timeline)
            break

          // 开始弹幕
          case 'turnondanmu':
            item = msg['event'];

            this.addMessage({ type: 1, message: item['title'], time: item['dt'] });
            this.danmuStatus = true;
            break

          // 关闭弹幕
          case 'turnoffdanmu':
          // 幻灯片 结束放映
          case 'showfinished':
            item = msg['event'];

            this.addMessage({ type: 1, message: item['title'] });
            // 产品确认 幻灯片切换不处理弹幕状态
            // this.danmuStatus = false;
            break

          // ppt更新
          case 'presentationupdated':
          case 'presentationcreated':

            msg['presentation'] && (this.presentationID = msg['presentation']);

            let presentationID = msg["presentation"]
            this.getUpdatePPTData(presentationID)
            break

          // 试卷结束
          case 'quizfinished':
          case 'callpaused':
            item = msg['event'];
            this.addMessage({ type: 1, message: item['title'] });

            break

           // 下课啦
          case 'lessonfinished':
            item = msg['event'];
            this.addMessage({ type: 1, message: item['title'], time: item['dt'] });

            // 课程状态
            this.lessonStatus = 1;

            break

          // 习题定时开始
          case 'probleminfo':
            let probID = msg['problemid']
            let leaveTime = Math.floor((msg['now'] - msg['dt'])/1000)

            leaveTime = msg['limit'] - leaveTime

            this.calcLeaveTime(leaveTime, probID);

            break

          case 'fetchtimeline':
            timeline = msg['timeline'];
            let msgid = msg['msgid'];

            this.setTimeline(timeline, true)

            break

          // 红包
          case 'redpacket':
          case 'updateredpacket':
            item = msg['event'];

            this.addHongbao({ type: 5, redpacketID: item.redpacket, count: item.count, length: item.detail.length, time: item.dt, event: item });

            break

          default:
            hasMsg = false;
            break
        }

        let timelineEl = document.querySelector('.J_cards')
        let clientRect = timelineEl && timelineEl.getBoundingClientRect()

        if(hasMsg && clientRect && clientRect.top < 0) {
          this.hasMsg = true;
        }
      }
    },

    /*
    * @method 问题启动开始计时
    */
    startTiming(problem) {
      this.socket && this.socket.send(JSON.stringify({
        'op': 'probleminfo',
        'lessonid': this.lessonID,
        'problemid': problem.problemID,
        'msgid': problem.msgid
      }))
    }
  }
}


export default mixin

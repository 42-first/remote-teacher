/*
 * 学生接收器 socket协议
 * @author: chenzhou
 * @update: 2017.5.27
 * @desc 课堂实时进度，课堂实时活动,提醒等
 *
 */



const SOCKET_HOST = location.host.indexOf('192.168') != -1 ? 'b.yuketang.cn' : location.host || location.host || 'b.yuketang.cn'
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
        socket.onclose = null

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

        // 记录socket链接
        // window.Raven && Raven.captureException(`WebSocket connect${SOCKET_HOST} userID:${self.userID} lessonID:${self.lessonID} time:${+new Date()}`);

        // 关闭
        this.socket.onclose = function(event) {
          console.log('onclose');
          // 先尝试连接三次
          if(self.reconnectcount < 3) {
            self.initws(true);
          } else if(self.reconnectcount === 3) {
            setTimeout(() => {
              self.initws(true);
            }, 3000)
          } else if(self.reconnectcount >= 4) {
            if(!self.isResetSocket) {
              setTimeout(() => {
                self.reconnect();
              }, 1000)
            }
          }

          self.reconnectcount++;

          // 记录socket关闭
          // window.Raven && Raven.captureException(`WebSocket onclose userID:${self.userID} lessonID:${self.lessonID} time:${+new Date()}`);
        }

        // 接收socket信息
        this.socket.onopen = function(event) {
          self.isResetSocket = false;
          console.log('onopen');

          self.socket.onmessage = function (event) {
            if(event && event.data) {
              let msg = JSON.parse(event.data)
              self.processMessage(msg)

              console.log(msg)
            } else {
              let errorMsg = `ws onmessage undefined uid:${self.userID} lid:${self.lessonID} dt:${+new Date()}`;
              window.Sentry && window.Sentry.captureMessage(errorMsg);
            }
          }

          // 握手开始通信
          let userId = self.identityId || self.userID;
          self.socket.send(JSON.stringify({
            'op': 'hello',
            'userid': userId,
            'role': 'student',
            'auth': self.token,
            'lessonid': self.lessonID
          }))
        }
      } catch (error) {
        window.Sentry && window.Sentry.captureException(error);
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
          this.reconnectcount = 0;
          this.initws(true);
        }
      }, 1000)

      console.log('reconnect')
    },

    /*
    * @method 根据websocket信息策略处理
    */
    processMessage(msg) {
      let timeline;
      let item;
      let hasMsg = true;
      let userId = this.identityId || this.userID;

      if(msg.op) {
        // 弹幕状态
        msg["danmu"] && (this.danmuStatus = msg["danmu"])

        switch(msg.op) {
          // 建立通信 时间轴事件
          case 'hello':
            timeline = msg['timeline']

            msg['presentation'] && (this.presentationID = msg['presentation']);
            // 协议版本号
            msg['addinversion'] && (this.version = msg['addinversion']);

            // 是否开启了互动 加入会议
            if(msg.interactive) {
              // 学生可自行加入会议
              this.hasMeeting = true;
              // 标记这是一堂直播远程课 方便后面对直播远程课处理
              !this.isLive && (this.isLive = true);
            }

            if(timeline && timeline.length) {
              this.getAllPres(msg);
            }

            break

          // 开启互动 { op: 'startinteractive', lessonid }
          case 'startinteractive':
            if(msg.lessonid) {
              this.hasMeeting = true;

              item = msg['event'];
              this.addMessage({ type: 1, message: item['title'], time: item['dt'], event: item });
            }

            break

          // 结束互动 { op: 'endinteractive', lessonid }
          case 'endinteractive':
            if(msg.lessonid) {
              this.hasMeeting = false;

              item = msg['event'];
              this.addMessage({ type: 1, message: item['title'], time: item['dt'], event: item });
            }

            break

          // 用户加入会议
          // { op: 'userjoin', uid: '101', meetinguid: 2110, name: '', avatar: '', role: 'teacher', video: true/false, audio: true/false  }
          case 'userjoin':
            if(msg.uid !== userId) {
              let meetingcmp = this.$refs.meeting;
              if(meetingcmp) {
                meetingcmp.joinUser(msg, 'ws');
              }
            }

            break

          // 请求关闭/启用音视频
          case 'controldevice':
            // { op: 'controldevice', type: 'audio/video', value: true/false, uid: ['101'] }
            // 是否让我禁言还是全员禁言 老师不需要
            // if(msg.uid && msg.uid.includes(this.user.id)) {
            //   let meeting = this.meeting;
            //   meeting[msg.type] = msg.value;

            //   this.setMeeting(meeting);
            // }

            break

          // 共享桌面
          case 'sharescreen':
            // { op: 'sharescreen', shareid: 0, sharename, type: '', width: 0, height: 0, uid: 0 }
            if(msg.uid && msg.uid != userId) {
              // let meeting = this.meeting;
              // meeting.otherscreen = true;

              // this.setMeeting(meeting);
            }

            break

          // 翻页
          case 'slidenav':
            item = msg['slide'];

            item && this.addPPT({ type: 2, sid: item['sid'], pageIndex: item['si'], time: item['dt'], presentationid: item['pres'], event: item, isTimeline: false });
            break

          // 解锁问题
          case 'unlockproblem' :
            item = msg['problem'];

            if(item) {
              this.addProblem({ type: 3, sid: item['sid'], pageIndex: item['si'], time: item['dt'], presentationid: item['pres'], limit: item.limit, event: item, isPopup: true });
            }

            break

          // 新的试卷
          case 'newquiz':
            item = msg['quiz'];

            item && this.addPaper({ type: 4, quiz: item['quiz'], title: item['title'], total: item['total'], time: item['dt'], event: item, isPopup: true });

            break

          // 换一个PPT
          case 'showpresentation':
            this.presentationID = msg['presentation'];
            timeline = msg['timeline'];

            // this.setTimeline(timeline, true);
            this.setTimeline(timeline);
            this.setPresentationTitle(this.presentationID);
            break

          // 开始弹幕
          case 'turnondanmu':
            item = msg['event'];

            this.addMessage({ type: 1, message: item['title'], time: item['dt'], event: item });
            this.danmuStatus = true;
            break

          // 关闭弹幕
          case 'turnoffdanmu':
            item = msg['event'];

            this.addMessage({ type: 1, message: item['title'], event: item });
            this.danmuStatus = false;
            break

          // 幻灯片 结束放映
          case 'showfinished':
            item = msg['event'];

            this.addMessage({ type: 1, message: item['title'], event: item });
            // 产品确认 幻灯片切换不处理弹幕状态
            // this.danmuStatus = false;
            // 结束放映 老版本大屏是无法展示弹幕 所以这里需要根据版本处理下
            if(this.version < 1.3) {
              this.danmuStatus = false;
            }

            break

          // ppt更新
          case 'presentationupdated':
          case 'presentationcreated':

            msg['presentation'] && (this.presentationID = msg['presentation']);

            let presentationID = msg["presentation"]
            this.updatePresentation(presentationID)
            break

          // 试卷结束
          case 'quizfinished':
          case 'callpaused':
            item = msg['event'];
            this.addMessage({ type: 1, message: item['title'], event: item });

            break

           // 下课啦
          case 'lessonfinished':
            item = msg['event'];
            this.addMessage({ type: 1, message: item['title'], time: item['dt'], event: item });

            // 课程状态 弹幕状态
            this.lessonStatus = 1;
            this.danmuStatus = false;

            break

          // 习题定时开始
          case 'probleminfo':
            let probID = msg['problemid']
            let leaveTime = Math.floor((msg['now'] - msg['dt'])/1000)

            leaveTime = msg['limit'] - leaveTime

            this.calcLeaveTime(leaveTime, probID, msg['limit']);
            hasMsg = false;

            break

          // 延时
          case 'extendtime':
            let problem = msg['problem']
            this.extendTime(problem);

            hasMsg = false;

            break

          // 收题
          case 'problemfinished':
            let problemid = msg['prob']
            this.closedProblem(problemid);

            hasMsg = false;

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

            this.addHongbao({ type: 5, redpacketID: item.redpacket, count: item.count, length: item.detail.length, time: item.dt, event: item, isPopup: true  });

            break

          // 投稿分享20170823
          case 'sendpost':
            item = msg['post'];

            this.addSubmission({ type: 6, postid: item.postid, anon: item.anon, time: item.dt, event: item, isPopup: true  });

            break

          // 主观题分享20171204
          case 'sendsproblem':
            item = msg['problem'];

            this.addSubjective({ type: 7, pid: item.pid, spid: item.spid, anon: item.anon, time: item.dt, event: item, isPopup: true  });

            break

          // 截屏分享20180830
          case 'sendcapture':
            item = msg['share'];

            this.addCapture({ type: 10, cat: item['cat'], url: item['url'], time: item['dt'], event: item });

            break

          // 板书分享20180925
          case 'shareboard':
            item = msg['board'];

            this.addBoard({ type: 11, board: item, time: item['dt'], event: item });

            break

          // 答案解析
          case 'problemremark':
            item = msg['remark'];

            this.addAnalysis({ type: 13, remark: item, time: item['dt'], event: item, isPopup: true });

            break

          // 分组创建分组
          case 'launchgroup':
            item = msg['group'];
            this.launchGroup({ type: 8, teamid: msg['teamid'], groupid: item['groupid'], cat: item['cat'], time: item['dt'], isPopup: true, event: item });

            break;

          // 自由分组取消分组
          case 'cancelgroup':
            item = msg['event'];
            this.addMessage({ type: 1, message: item['title'], event: item });
            this.cancelGroup({ type: 8, groupid: msg['groupid'], event: item });

            break;

          // 完成分组
          case 'finishgroup':
            this.finishGroup({ type: 8, groupid: msg['groupid'], teamid: msg['teamid'], event: item });

            break;

          // 发起互评
          case 'launchreview':
            item = msg['review'];
            this.launchReview({ type: 9, reviewid: item['reviewid'], prob: item['prob'], time: item.dt, isPopup: true, event: item });

          // 开始直播
          case 'startlive':
            // this.startLive(msg['liveurl']);
            this.startLive(msg);

            break;

          // 切换直播
          case 'updateliveurl':
            this.changeLive(msg);

            break;

          // 结束直播
          case 'endlive':
            this.endLive(msg);

            break;

          // 白板信息
          case 'newboard':
            this.setBoardInfo(Object.assign(msg.board, { type: 12 }));

            break;

          // 清屏
          case 'boardclear':
            this.clearBoard(msg.board);

            break;

          // 传输轨迹点
          case 'touchdata':
            this.setBoardline(msg.draw);

            break;

          // 白板翻页
          case 'boardnav':
            this.boardNav(msg.board);

            break;

          // 系统弹幕
          case 'systemdanmu':
          // 接收弹幕
          case 'newdanmu':
            this.receiveDanmu(msg);
            hasMsg = false;

            break;

          // 直播状态
          case 'livestatus':
            this.changeLiveStatusTips(msg.status, msg.voice)
            break;

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

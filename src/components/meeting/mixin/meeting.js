/**
 * 会议操作指令兼容封装和后端交互
 * @author: chenzhou
 * @update: 2020.12.17
 * @desc
 *
 */


import { mapState, mapActions } from 'vuex';


let meetingMixin = {
  watch: {
    'meeting.joined'(newVal, oldVal) {
      if(!newVal) {
        this.handleHangup();
      }
    },
    // 音频控制
    'meeting.audio'(newVal, oldVal) {
      if(this.meetingSDK === 'tencent') {
        this.setAudioByTencent(newVal);
      } else if(this.meetingSDK === 'local') {
        this.setAudioLocal(newVal);
      }
    },
    // 视频控制
    'meeting.video'(newVal, oldVal) {
      if(this.meetingSDK === 'tencent') {
        this.setVideoByTencent(newVal);
      } else if(this.meetingSDK === 'local') {
        this.setVideoLocal(newVal);
      }
    },
    // 我自己开启了屏幕共享
    'meeting.screen'(newVal, oldVal) {
      if(this.meetingSDK === 'tencent') {
        this.setScreenShare(newVal);
      } else if(this.meetingSDK === 'local') {
        this.setShareScreenLocal(newVal);
      }
    },
    // 是否加入共享屏幕
    shareInfo(newVal, oldVal) {
      if(newVal && newVal.uid !== this.user.id) {
        // 收到有人分享命令后判断下自己当前是否正在分享  如果是把自己的分享取消掉
        if(this.localSharing) {
          let meeting = this.meeting
          meeting.screen = 0
          this.setMeeting(meeting)
        }

        setTimeout(() => {
          if(this.meetingSDK === 'tencent') {
            this.joinRemoteScreenSharing(newVal.uid);
          }
        }, 500);
      }
    },
    // 切换布局
    meetingLayout(newVal, oldVal) {
      // 处理共享
      let meeting = this.meeting;
      if(meeting.otherscreen) {
        setTimeout(()=>{
          if(this.meetingSDK === 'tencent') {
            this.joinRemoteScreenSharing();
          } else if(this.meetingSDK === 'local') {
            this.joinRemoteScreenSharingLocal();
          }
        }, 0)
      }

      if(this.meetingSDK === 'tencent') {
        // 九宫格切到其它模式 取消订阅远端流 排除共享和老师流
        // if(oldVal === MeetingMode.JIUGONGGE) {
        //   this.unsubscribeSpeakers();
        // }

        this.unsubscribeSpeakers();
      }

      this.getMembers();
    },
    // 正常说话列表
    speakers(newVal) {
      let activeSpeakers = [];
      // 开课老师
      let teacher = this.teacher;
      // 开课老师或者自己 (Id类型太乱统一转成字符串处理)
      const teacherAndMeIds = [ String(teacher.identityId), String(teacher.userId), String(this.local) ];
      if(newVal && newVal.length) {
        newVal.forEach((member)=>{
          if(teacherAndMeIds.includes(String(member.id))) {
            activeSpeakers.push(member);
          } else if(member.audio) {
            activeSpeakers.push(member);
          }
        })

        // 然后根据音量排序
        activeSpeakers = activeSpeakers.sort((a, b) => { return b.audio - a.audio; })
        // this.activeSpeakers = activeSpeakers;
        this.setActiveSpeakers(activeSpeakers);
      }
    },
  },
  methods: {
    /**
     * @method 挂断
     * @param
     */
    async handleHangup() {
      if(this.meetingSDK === 'tencent') {
        this.exitRoomTencent();
      } else if(this.meetingSDK === 'local') {
        this.stopLocaleeting();
      }

      // 被踢的不用调用后端接口
      if(!this.banned) {
        await this.leavedChanel();
      }

      this.setJoined(false);

      // 恢复默认
      this.setMeetingLayout(MeetingMode.DEFAULT);
    },

    /**
     * @method 修改成员列表中会议状态
     * @param
     */
    updateMeetingStatus(data) {
      let speakers = this.speakers;
      let index = speakers.findIndex((user)=>{
        return user.id == data.id;
      })

      if(~index) {
        let user = speakers[index];

        if(user[data.type] !== data.value) {
          user[data.type] = data.value;

          if(data.type === 'audio') {
            user.active = data.value;
          }

          speakers.splice(index, 1, user);
          this.setSpeakers(speakers);
        }
      }
    },

    /**
     * @method 更新用户
     * @param
     */
    updateUser(data) {
      let speakers = this.speakers;
      let index = speakers.findIndex((user)=>{
        return user.id == data.id;
      })

      if(~index) {
        let user = speakers[index];

        speakers.splice(index, 1, Object.assign(user, data));
        this.setSpeakers(speakers);
      }
    },

    /**
     * @method 强制静音
     * @param
     */
    forceMute(msg) {
      let meeting = this.meeting;
      meeting.audio = false;
      // meeting.video = false;

      this.setMeeting(meeting);

      const message = this.$i18n && this.$i18n.t('meeting.muteall') || '全员静音';
      this.$toast({ type: 1, position: 'top', message: message, duration: 3000 });
    },

    /**
     * @method 强制禁言
    */
    banDevice (msg) {

      let meeting = this.meeting;

      // 获取初始的禁言状态
      let fsState = meeting.bandevice

      let bandeviceTip = false

      // msg.value 取值： 1 禁言(学生+其他教师) 2 禁言禁视频(学生+其他教师) 3 禁言(仅学生) 4 禁言禁视频(仅学生)
  
      // 开启禁言
      if(msg.value) {
        // 协同教师、学生都禁 就都提示
        if(msg.value == 1 || msg.value == 2 || !this.observerMode && (msg.value == 3 || msg.value == 4)) {
          bandeviceTip = true
          meeting['audio'] = false;
          (msg.value == 2 || msg.value == 4) && (meeting['video'] = false)
          meeting['bandevice'] = msg.value
        }
      }else {
        // 取消禁言
        if(fsState == 1 || fsState == 2 || !this.observerMode && (fsState == 3 || fsState == 4)) {
          bandeviceTip = true
        }
        meeting['bandevice'] = msg.value
      }
      this.setMeeting(meeting);

      let bannedSpeaking = this.$i18n && this.$i18n.t('meeting.bannedfromspeaking') || '全员禁言';
      let releaseBannedSpeaking = this.$i18n && this.$i18n.t('meeting.releasebannedspeak') || '老师已解除全员禁言';

      bandeviceTip && this.$toast({ type: 1, message: msg.value ? bannedSpeaking : releaseBannedSpeaking, duration: 3000 })
    },

    /**
     * @method 通过ws命令加入会议更新姓名和头像
     * @param
     */
    joinUser(data, from) {
      let speakers = this.speakers;
      let { uid, name, avatar, role, video, audio, subscribe = false, offline = false } = data;
      let index = speakers.findIndex((user)=>{
        return user.id == uid;
      })

      let user = { id: uid, uid, name, avatar, role, video, audio, active: false,
        subscribe, offline };

      // 存在用户
      if(~index) {
        // SDK远端加入没有name和avatar
        if(from === 'ws') {
          user = speakers[index];
          Object.assign(user, {
            name, avatar, role
          })

          speakers.splice(index, 1, user);
        }
      } else {
        if(this.meetingSDK === 'local') {
          Object.assign(user, { audioConsumer: null, videoConsumer: null });
        }

        // 开课老师
        const teacher = this.teacher;
        // 开课老师或者自己 (Id类型太乱统一转成字符串处理)
        const teacherIds = [ String(teacher.identityId), String(teacher.userId) ];

        // 开课老师放在最前面 'lecturer' || 'collaborator'
        if(teacherIds.includes(String(user.id))) {
          speakers.unshift(user);
        } else {
          speakers.push(user);
        }
      }

      this.setSpeakers(speakers);
    },

    /**
     * @method 通过ws命令加入会议更新姓名和头像
     * @param
     */
    userLeave(data) {
      let uid = data.uid;
      // 移除发言列表中用户
      let speakers = this.speakers;
      let index = speakers.findIndex((user)=>{
        return uid == user.id;
      })

      // 存在用户
      if(~index) {
        speakers.splice(index, 1);
        this.setSpeakers(speakers);
      }
    },

    /**
     * @method 取消订阅远端流
     * @param
     */
    async unsubscribeSpeakers() {
      const rtcEngine = this.rtcEngine;
      const members = rtcEngine.members;
      const client = rtcEngine.client;
      let speakers = this.speakers;

      // 取消订阅流期间（异步的）需要锁定不能订阅播放
      this.setSubscribeLoading(true);

      setTimeout(()=>{
        if(this.subscribeLoading) {
          this.setSubscribeLoading(false);
        }
      }, 1000*10)

      try {
        for(let user of speakers) {
          let uid = user.id;
          // 排除老师流，自己的流
          if(user.role !== 'lecturer' && user.role !== 'collaborator' && uid != this.local) {
            let stream = members.get(String(uid));
            if(stream && user.subscribe) {
              user.subscribe = false;

              // 删除之前的播放结构 否则可能还会显示之前的
              if(stream.audioPlayer_ || stream.videoPlayer_) {
                if(stream.isPlaying_) {
                  // stream.stop();
                }
              }

              await client.unsubscribe(stream);
              // stream.close();
            }
          }
        }

        this.setSpeakers(speakers);
      } catch (error) {
        console.error('unsubscribeSpeakers! ' + error);
      }

      this.setSubscribeLoading(false);
    },

    /**
     * @method 通过ws命令通知有人共享了屏幕
     * @param
     */
    shareScreen(data) {
      let meeting = this.meeting;
      meeting = Object.assign({}, meeting, {
        otherscreen: true,
        shareId: data.uid,
        shareName: data.sharename
      })

      this.setMeeting(meeting);
    },

    /**
     * @method 获取会议基本信息 token channel
     * @param
     */
    getMeeting() {
      let URL = API.lesson.get_meeting_config;

      return request.get(URL).
      then( res => {
        if (res && res.data) {
          let data = res.data;

          return data;
        }
      }).catch(error => {
        return {};
      })
    },

    /**
     * @method 加入会议
     * @param
     */
    joinedMeeting(user) {
      let URL = API.lesson.join_meeting;
      let params = {
        'meetingUserId': user.uid || 0,
        'audio': user.audio,
        'video': user.video
      };

      request.post(URL, params).
      then( res => {
        if (res && res.code === 0) {
          // this.getSpeakers();
          this.getMembers();
          this.getDeviceStatus()
        }
      }).
      catch(error => {
        console.error('join_meeting:', error);
      })
    },

    /**
     * @method 获取当前会议禁言状态
    */
    getDeviceStatus(){
      let URL = API.lesson.get_speech_state
      return request.get(URL).
      then( res => {
        if (res && res.code === 0 && res.data) {
          let data = res.data;
          let meeting = this.meeting
          meeting.bandevice = data.fsState
          this.setMeeting(meeting)
          return data;
        }
      }).catch(error => {
        return false;
      })
    },

    /**
     * @method 读取发言人列表
     * @params
     */
    getSpeakers() {
      let URL = API.lesson.get_talk_list;

      request.get(URL).
      then( res => {
        if (res && res.code === 0 && res.data) {
          let items = res.data.items;

          // 数据是否需要格式化保持一致
          let speakers = this.speakers;
          if(items && items.length) {
            items.forEach((item)=>{
              let { identityId, name, avatar, role, video, audio } = item;
              let active = audio ? true : false;
              let user = { id: identityId, uid: identityId, name, avatar, role, video, audio, active };

              let index = speakers.findIndex((speaker)=>{
                return speaker.id == user.id;
              })

              // 存在用户
              if(~index) {
                speakers.splice(index, 1, user);
              } else {
                speakers.push(user);
              }
            })

            this.setSpeakers(speakers);
          }
        }
      }).catch(error => {
      })
    },

    /**
     * @method 读取成员列表
     * @params
     */
    getMembers() {
      let URL = API.lesson.get_member_list;
      let params = {
        page_size: 100,
        current_page: 1
      };

      request.get(URL, params).
      then( res => {
        if (res && res.code === 0 && res.data) {
          let items = res.data.items;

          // 数据是否需要格式化保持一致
          let speakers = this.speakers;
          if(items && items.length) {
            items.forEach((item)=>{
              let { identityId, name, avatar, role, video, audio } = item;
              let user = { id: identityId, uid: identityId, name, avatar, role,
                video: false, audio: false, active: false, subscribe: false, offline: false };

              let index = speakers.findIndex((speaker)=>{
                return speaker.id == user.id;
              })

              if(avatar && avatar.length < 10 || !avatar) {
                avatar = "http://wx.qlogo.cn/mmopen/OUicWJdJoz3HNVF1oYxOQYibUZicpTD55udhicFPk9RBUuicwxiahv5nUJBx7MZPbl7tTkeZRlptRuhhMpaPNPxyplWQ/96";
              }

              // 存在用户
              if(~index) {
                let originUser = speakers[index];

                speakers.splice(index, 1, Object.assign({}, originUser, { name, avatar, role }));
              } else {
                if(this.meetingSDK === 'local') {
                  Object.assign(user, { audioConsumer: null, videoConsumer: null });
                }

                speakers.push(user);
              }
            })

            this.setSpeakers(speakers);
          }
        }
      }).catch(error => {
      })
    },

    /**
     * @method 更改音视频设配状态
     * @param
     */
    changeDeviceStatus(device) {
      let URL = API.lesson.manage_device;
      let params = device;

      request.post(URL, params).
      then( res => {
        if (res && res.code === 0) {

        }
      }).
      catch(error => {
        console.error('changeDeviceStatus:', error);
      })
    },

    /**
     * @method 分享用户token信息
     * @param
     */
    getShareConfig() {
      let URL = API.lesson.get_share_config;
      let params = {};

      if(window.shareConfig) {
        return window.shareConfig;
      }

      // 防止重复请求
      if(this.requestLoading) {
        return null;
      } else {
        this.requestLoading = true;
      }

      return request.get(URL, params).
      then( res => {
        if (res && res.code === 0) {
          let data = res.data;

          window.shareConfig = data;

          return data;
        } else if(res && res.code === 50029) {
          // 稍后重试
        }

        this.requestLoading = false;
      }).
      catch(error => {
        console.error('getShareConfig:', error);
        this.requestLoading = false;
      })
    },

    /**
     * @method 开启分享
     * @param
     */
    startShare(share) {
      let URL = API.lesson.start_share;
      let params = share;

      request.post(URL, params).
      then( res => {
        if (res && res.code === 0) {
        }
      }).
      catch(error => {
        console.error('start_share:', error);
      })
    },

    /**
     * @method 关闭分享
     * @param
     */
    endShare() {
      let URL = API.lesson.end_share;
      let params = {
      };

      request.post(URL, params).
      then( res => {
        if (res && res.code === 0) {

        }
      }).
      catch(error => {
        console.error('end_share:', error);
      })
    },

    /**
     * @method 离开会议
     */
    leavedChanel(){
      let URL = API.lesson.leave_meeting
      let params = {
      }

      return request.post(URL, params).
      then(res => {
        if(res && res.code === 0){
          return true;
        }
      }).
      catch(error => {
        console.error('leave_meeting:', error);
        return false;
      })
    },

  }
}


export default meetingMixin;

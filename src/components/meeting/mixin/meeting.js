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
    meetingLayout(newVal) {
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

      // this.getSpeakers();
      this.getMembers();
    },
    // 正常说话列表
    speakers(newVal) {
      let activeSpeakers = [];
      // 老师自己
      if(newVal && newVal.length) {
        newVal.forEach((member)=>{
          if(member.role === 'lecturer' || member.role === 'collaborator' || member.id == this.local) {
            activeSpeakers.push(member);
          } else if(member.audio || member.video) {
            activeSpeakers.push(member);
          }
        })

        this.activeSpeakers = activeSpeakers;
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
     * @method 通过ws命令加入会议更新姓名和头像
     * @param
     */
    joinUser(data, from) {
      let speakers = this.speakers;
      let { uid, name, avatar, role, video, audio } = data;
      let index = speakers.findIndex((user)=>{
        return user.id == uid;
      })

      let user = { id: uid, uid, name, avatar, role, video, audio, active: false, tryTimes: 0 };

      if(this.meetingSDK === 'local') {
        Object.assign(user, { audioConsumer: null, videoConsumer: null });
      }

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
        // 教师放在最前面
        if(data.role === 'lecturer' || data.role === 'collaborator') {
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
     * @method 尝试播放
     * @param
     */
    retryPlay() {
      if(this.meetingSDK !== 'tencent') {
        return this;
      }

      let speakers = this.speakers;
      speakers.forEach((member)=>{
        if(member.audio || member.video) {
          member.tryTimes += 1;
        }
      })

      this.setSpeakers(speakers);

      // 移除用户鼠标事件监听
      document.removeEventListener('mousedown', this.replay);
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
        }
      }).
      catch(error => {
        console.error('join_meeting:', error);
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
              // let user = { id: identityId, uid: identityId, name, avatar, role, video, audio, active: false };
              let user = { id: identityId, uid: identityId, name, avatar, role,
                video: false, audio: false, active: false };

              let index = speakers.findIndex((speaker)=>{
                return speaker.id == user.id;
              })

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

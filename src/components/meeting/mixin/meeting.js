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
    'meeting.status'(newVal) {
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
            this.joinRemoteScreenSharing(newVal.uid );
          }
        }, 500);
      }
    },
  },
  methods: {
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
          setTimeout(()=>{
            this.getSpeakers();
          }, 500)
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
              let { identityId, meetingUID, name, avatar, role, video, audio } = item;
              let user = { id: identityId, uid: meetingUID, name, avatar, role, video, audio, active: false };

              let index = speakers.findIndex((speaker)=>{
                return speaker.id == identityId;
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
      request.post(URL, params).
      then(res => {
        if(res && res.code === 0){

        }
      }).
      catch(error => {
        console.error('leave_meeting:', error);
      })
    },

  }
}


export default meetingMixin;


/**
 * 会议操作指令处理 腾讯SDK
 * @author: chenzhou
 * @update: 2020.12.17
 * @desc 初始化SDK 加入频道 音视频控制 屏幕分享
 *
 */


import { mapState, mapActions } from 'vuex';
import TRTC from 'trtc-js-sdk';

let log = console;

let tencentMixin = {
  methods: {
    /**
     * @method 进入会议初始化操作
     * @params
     */
    initTencent(info) {
      let appId = Number(info && info.appId);
      this.appId = appId;
      let token = info && info.token;
      let channel = Number(info && info.channel);
      let privateMapKey = info && info.privateMapKey;

      // 确保当前用户
      this.roomId = Number(info && info.teacherUserId) || channel;
      let uid = this.user && this.user.id;

      // 1、检测
      // 基本参数检测
      if(!appId || !token || !channel || !privateMapKey) {
        return this;
      }

      // 浏览器否则支持检测
      TRTC.checkSystemRequirements().
      then(checkResult => {
        if (!checkResult.result) {
          console.log('checkResult', checkResult.result, 'checkDetail', checkResult.detail);
          // todo: 根据用户设备类型建议用户使用 SDK 支持的浏览器
        }
      })

      // 2、mac授权

      // param.sdkAppId = appId;
      // param.userSig = token;
      // param.roomId = this.roomId;
      // param.userId = uid;
      // param.privateMapKey = privateMapKey || ''; // 房间签名（非必填），7.1.157 版本以上（含），可以忽略此参数，7.1.157 之前的版本建议赋值为空字符串

      console.log('rtcEngine:', rtcEngine);
    },

    /**
     * @method 事件监听
     * @params
     */
    subscribeEvents(rtcEngine) {
      if(!rtcEngine) {
        return this;
      }

      // rtcEngine.on('onStatistics', (statis)=>{logger.log('onStatistics', statis);});
      rtcEngine.on('onEnterRoom', this.onEnterRoom.bind(this));
      rtcEngine.on('onExitRoom', this.onExitRoom.bind(this));
      rtcEngine.on('onUserVideoAvailable', this.onUserVideoAvailable.bind(this));
      rtcEngine.on('onUserAudioAvailable', this.onUserAudioAvailable.bind(this));
      rtcEngine.on('onRemoteUserEnterRoom', this.onRemoteUserEnterRoom.bind(this));
      rtcEngine.on('onRemoteUserLeaveRoom', this.onRemoteUserLeaveRoom.bind(this));
      rtcEngine.on('onUserSubStreamAvailable', this.onUserSubStreamAvailable.bind(this));

      rtcEngine.on('onFirstVideoFrame', this.onFirstVideoFrame.bind(this));

      // 活跃用户
      rtcEngine.on('onUserVoiceVolume', this.onUserVoiceVolume.bind(this));

      // onSendFirstLocalVideoFrame
    },

    /**
     * @method 本地用户加入通道成功
     * @params result - 进房结果， 大于 0 时，为进房间消耗的时间，这表示进进房成功。如果为 -1 ，则表示进房失败。
     */
    onEnterRoom(result) {
      log.info('[onEnterRoom] result:%s', result);

      const rtcEngine = this.rtcEngine;
      // 本地用户进入是否打开音视频
      let { audio, video, active } = this.meeting;
      // 用户视频状态是否支持离线
      let speakers = this.speakers;
      let user = Object.assign({}, this.user, { audio, video, active });
      let index = speakers.findIndex((item)=>{
        return item.id == user.id;
      })

      if(index === -1) {
        speakers.push(user);
        this.setSpeakers(speakers);
      }

      setTimeout(()=>{
        // 1: 老师 2：学生
        user.role = this.role || 2;
        this.joinedMeeting(user);
      }, 0)
    },

    /**
     * 当退出房间时触发的回调
     */
    onExitRoom() {
      log.info('[onExitRoom]',);
    },

    /**
    * 远程用户视频流的状态发生变更时触发。
    * @param {number} uid - 用户标识
    * @param {boolean} available - 画面是否开启
    **/
    onUserVideoAvailable(uid, available) {
      log.info(`onUserVideoAvailable: uid: ${uid}, available: ${available}`);

      let video = false;
      if (available === 1) {
        video = true;
      }

      const user = {
        id: uid,
        type: 'video',
        value: video
      };
      this.updateMeetingStatus(user);

      try {
        const rtcEngine = this.rtcEngine;
        if(uid && available) {
          let videoEl = this.$el.querySelector(`#uid-${uid}`);
          if(videoEl) {
            rtcEngine.startRemoteView(uid, videoEl);
            rtcEngine.setRemoteViewFillMode(uid, TRTCVideoFillMode.TRTCVideoFillMode_Fill);
          }
        } else {
          rtcEngine.stopRemoteView(uid);
        }
      } catch (error) {
        console.error('[onUserVideoAvailable] exception:%s', error.message);
      }
    },

    /**
     * @method 远端用户加入通道成功
     * @params
     */
    onRemoteUserEnterRoom(uid) {
      log.info('[onRemoteUserEnterRoom] uid:%s', uid);

      // websocket 不通暂时模拟用户登录
      let user = {
        id: uid,
        uid: uid,
        name: "R"+uid,
        avatar: "http://wx.qlogo.cn/mmopen/OUicWJdJoz3HNVF1oYxOQYibUZicpTD55udhicFPk9RBUuicwxiahv5nUJBx7MZPbl7tTkeZRlptRuhhMpaPNPxyplWQ/96",
        role: 'student', audio: false, video: false, active: false
      };
      let speakers = this.speakers;
      let index = speakers.findIndex((user)=>{
        return user.id == uid;
      })

      if(index === -1) {
        speakers.push(user);
        this.setSpeakers(speakers);
      }
    },

    /**
     * 当远端用户离开本房间时，关闭对应的画面。
     */
    onRemoteUserLeaveRoom(uid) {
      log.info('onRemoteUserLeaveRoom', uid);

      // 移除发言列表中用户
      let speakers = this.speakers;
      let index = speakers.findIndex((user)=>{
        return uid == user.uid;
      })

      // 存在用户
      if(~index) {
        speakers.splice(index, 1);
        this.setSpeakers(speakers);
      }
    },

    /**
     * 当远程用户屏幕分享的状态发生变化，会根据 available 参数打开或关闭画面
     **/
    onUserSubStreamAvailable(uid, available) {
      log.info(`onUserSubStreamAvailable: ${uid}, ${available}`);
      let meeting = this.meeting;

      if (available) {
        this.switchMeetingToFullscreen();
        setTimeout(() => {
          this.joinRemoteScreenSharing(uid);
        }, 100);

        meeting.otherscreen = true;
      } else {
        if(this.role !== 1) {
          this.switchMeetingToSmall();
        }

        meeting.otherscreen = false;
      }

      this.setMeeting(meeting);
    },

    /**
     * @method 远端用户音频状态改变
     * @params
     */
    onUserAudioAvailable(uid, available) {
      log.info('[onUserAudioAvailable] uid:%s available:%s', uid, available);

      let audio = false;
      if (available === 1) {
        audio = true;
      }

      const user = {
        id: uid,
        type: 'audio',
        value: audio
      };
      this.updateMeetingStatus(user);
    },

    /**
     * @method userId 对应的成员语音音量
     * @params
     */
    onUserVoiceVolume(userVolumes, userVolumesCount, totalVolume) {
      log.info('[onUserVoiceVolume]:', userVolumes, userVolumesCount);

      let speakers = this.speakers;
      speakers.forEach((user)=>{
        let userVolume = userVolumes && userVolumes.find((item)=>{
          // 本地用户找userId为空的 远端用户直接根据userId查找
          return user.id == item.userId || (user.id == this.local && item.userId === '');
        })

        if(userVolume && userVolume.volume) {
          user.active = true;
          user.volume = userVolume.volume;
        } else if(user.active) {
          user.active = false;
          user.volume = 0;
        }
      })

      //然后根据音量排序
      speakers = speakers.sort((a, b) => { return b.volume - a.volume; })
      this.setSpeakers(speakers);
    },

    /**
     * @method 设置音频
     * @params
     */
    setAudioByTencent(audio = false) {
      let rtcEngine = this.rtcEngine;
      // rtcEngine.muteLocalAudio(!audio);
      if(audio) {
        rtcEngine.startLocalAudio();
      } else {
        rtcEngine.stopLocalAudio();
      }

      const user = {
        id: this.user.id,
        type: 'audio',
        value: audio
      };
      this.updateMeetingStatus(user);

      let device = { audio };
      this.changeDeviceStatus(device);

      this.$toast({ type: 1, message: audio ? '麦克风已开启': '麦克风已静音', duration: 2000 });
    },

    /**
     * @method 设置视频
     * @params
     */
    setVideoByTencent(video = false) {
      try {
        let rtcEngine = this.rtcEngine;
        rtcEngine.muteLocalVideo(!video);

        if(!video) {
          rtcEngine.stopLocalPreview();
        }
      } catch(error) {
        log.error('[setVideo] error:%s', JSON.stringify(error.message));
      }

      const user = {
        id: this.user.id,
        type: 'video',
        value: video
      };
      this.updateMeetingStatus(user);

      let device = { video };
      this.changeDeviceStatus(device);
      this.$toast({ type: 1, message: video ? '视频已开启': '视频已关闭', duration: 2000 });
    },

    /**
     * @method 屏幕共享
     * @params
     */
    setScreenShare(screen) {
      console.log('screen:', screen);

      const user = this.user;
      const userId = user.id;

      let rtcEngine = global.rtcEngine;
      if(screen) {
        let source = this.shareInfo;
        let type = source.type === 1 ? source.type : 0;
        let rect = new Rect();
        rect.top = 0;
        rect.left = 0;
        rect.width = 0;
        rect.height = 0;

        // 设置辅流（屏幕分享）的混音音量大小
        rtcEngine.setSubStreamMixVolume(70);

        rtcEngine.selectScreenCaptureTarget(source.type, source.id, source.name, rect, true, true);
        rtcEngine.startScreenCapture(null, TRTCVideoStreamType.TRTCVideoStreamTypeSub);

        this.setLocalSharing(true);

        let msg = { shareId: Number(userId), shareName: user.name, type: String(type), width: 0, height: 0 };
        this.startShare(msg);
      } else {
        rtcEngine.stopScreenCapture();

        this.setLocalSharing(false);
        this.endShare();
      }
    },

    /**
     * @method 用户接收共享屏幕
     * @params
     */
    joinRemoteScreenSharing(uid) {
      let rtcEngine = global.rtcEngine;
      setTimeout(()=>{
        let view = document.querySelector(`#localScreen`)

        if(view) {
          rtcEngine.startRemoteSubStreamView(uid, view);
          rtcEngine.setRemoteSubStreamViewFillMode(uid, TRTCVideoFillMode.TRTCVideoFillMode_Fill);
        }
      }, 100)
    },

    /**
     * @method 退出房间
     */
    exitRoom() {
      try {
        let rtcEngine = this.rtcEngine;
        rtcEngine.exitRoom();
      } catch (error) {
        console.error('[exitRoom] exception:%s', error.message);
      }
    },

    /**
     * @method 退出互动处理
     */
    stopTencentMeeting() {
      try {
        let rtcEngine = this.rtcEngine;
        rtcEngine.exitRoom();
      } catch (error) {
        console.error('[stopMeeting] exception:%s', error.message);
      }

      if (this.localSharing) {
        this.setShareScreen(false);
      }
    },

  }
}


export default tencentMixin;

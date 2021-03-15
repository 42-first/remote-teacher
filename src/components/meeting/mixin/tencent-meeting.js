/**
 * 会议操作指令处理 腾讯SDK
 * @author: chenzhou
 * @update: 2020.12.17
 * @desc 初始化SDK 加入频道 音视频控制 屏幕分享
 *
 */


import { mapState, mapActions } from 'vuex';

import TRTC from 'trtc-js-sdk';
import RTCClient from '../tencent/rtc-client';
import ShareClient from '../tencent/share-client';


// setup logging stuffs
// TRTC.Logger.setLogLevel(TRTC.Logger.LogLevel.DEBUG);
// TRTC.Logger.enableUploadLog();
let log = console;

let shareUserId = null;

let tencentMixin = {
  methods: {
    /**
     * @method 进入会议初始化操作
     * @params
     */
    async initTencent(info) {
      let appId = Number(info && info.appId);
      this.appId = appId;
      let token = info && info.token;
      let roomId = Number(info && info.channel);
      let privateMapKey = info && info.privateMapKey;

      // 确保当前用户
      this.roomId = roomId;
      let uid = this.user && this.user.id;
      // 设置本地分享的UID
      shareUserId = `share-${uid}`;
      this.shareUserId = shareUserId;

      // 1、检测
      // 基本参数检测
      if(!appId || !token || !roomId || !privateMapKey) {
        return this;
      }

      // 浏览器否则支持检测
      TRTC.checkSystemRequirements().
      then(checkResult => {
        if (!checkResult.result) {
          console.log('checkResult', checkResult.result, 'checkDetail', checkResult.detail);
          // 点击之后判断当前浏览器版本是否支持RTC，不支持的话，弹窗提示用户换浏览器或进入直播模式上课
          let msgOptions = {
            confirmButtonText: this.$i18n && this.$i18n.t('confirm') || '确定',
            cancelButtonText: this.$i18n && this.$i18n.t('cancel') || '取消'
          };
          let message = this.$i18n && this.$i18n.t('meeting.webrtcnosupported') || '建议下载最新版Chrome浏览器（http://www.google.cn/chrome/）打开链接或进入直播模式上课';

          this.$messagebox.confirm(message, msgOptions)
          .then( action => {
            if(action === 'confirm') {
              this.setJoined(false);
              this.setHasMeeting(false);

              setTimeout(()=>{
                this.$parent.initKwai();
                this.$parent.initEvent();
              }, 20)
            }
          });
        } else {
          let options = {
            appId,
            token,
            uid,
            roomId,
            privateMapKey
          };
          let rtcEngine = new RTCClient(options);
          this.rtcEngine = rtcEngine;
          window.rtcEngine = rtcEngine;

          console.log('rtcEngine:', rtcEngine);

          if(rtcEngine.client) {
            this.subscribeEvents(rtcEngine.client);
          }

          let joined = rtcEngine.join();
          if(joined) {
            this.enterRoom();
          }
        }
      })

      // 屏幕分享是否支持
      this.isScreenShareSupported = TRTC.isScreenShareSupported();
    },

    /**
     * @method 初始化分享
     * @params
     */
    async initTencentShare() {
      if(this.isScreenShareSupported ) {
        let shareConfig = await this.getShareConfig();

        if(shareConfig && shareConfig.token) {
          let { shareId, token, privateMapKey } = shareConfig;
          let shareOptions = {
            appId: this.appId,
            uid: shareId,
            roomId: this.roomId,
            token,
            privateMapKey
          };

          let shareClient = new ShareClient(shareOptions);
          this.shareClient = shareClient;
          window.shareClient = shareClient;

          return shareClient;
        }
      } else {
        return null;
      }
    },

    /**
     * @method 事件监听
     * @params
     */
    subscribeEvents(client) {
      if(!client) {
        return this;
      }

      client.on('error', this.onError.bind(this));
      client.on('client-banned', this.onBanned.bind(this));

      client.on('peer-join', this.onRemoteUserEnterRoom.bind(this));
      client.on('peer-leave', this.onRemoteUserLeaveRoom.bind(this));

      client.on('mute-audio', this.onUserAudioMuted.bind(this));
      client.on('unmute-audio', this.onUserAudioUnmuted.bind(this));

      client.on('mute-video', this.onUserVideoMuted.bind(this));
      client.on('unmute-video', this.onUserVideoUnmuted.bind(this));

      client.on('stream-added', this.onUserStreamAdded.bind(this));
      client.on('stream-subscribed', this.onUserStreamSubscribed.bind(this));
      client.on('stream-updated', this.onUserStreamUpdated.bind(this));
      // fired when the remote stream is removed, e.g. the remote user called Client.unpublish()
      client.on('stream-removed', this.onUserStreamRemoved.bind(this));

      this.volumeTimer && clearInterval(this.volumeTimer);
      this.volumeTimer = setInterval(()=>{
        this.detectUserVoiceVolume();
      }, 1000*10)
    },

    onError(err) {
      console.error('client onError: ' + err);
    },

    onBanned(evt) {
      // 您已被踢出房间
      console.error('client has been banned for ' + evt);

      this.banned = true;

      this.exitRoomTencent();
      this.setJoined(false);

      const message = this.$i18n && this.$i18n.t('meeting.bannedtips') || '您已被踢出房间';
      this.$toast({ type: 1, message: message, duration: 2000 });
    },

    /**
     * @method 本地用户加入通道成功
     * @params
     */
    async enterRoom() {
      log.info('[onEnterRoom] result:%s');

      const rtcEngine = this.rtcEngine;
      // 本地用户进入是否打开音视频
      let { audio, video, active } = this.meeting;
      // 用户视频状态是否支持离线
      let speakers = this.speakers;
      let user = Object.assign({}, this.user, { role: 'student', audio, video, active });
      let index = speakers.findIndex((item)=>{
        return item.id == user.id;
      })

      if(index === -1) {
        speakers.push(user);

        // todo: test
        // for(let i =1; i<7; i++) {
        //   speakers.push(user);
        // }

        this.setSpeakers(speakers);
      }

      const message = this.$i18n && this.$i18n.t('meeting.joinedtips') || '接入成功，当前已静音';
      this.$toast({ type: 1, message: message, duration: 2000 });

      await rtcEngine.initLocalStream(false);
      setTimeout(()=>{
        this.joinedMeeting(user);
      }, 0)

      // 开始上报
      this.autoReport();
    },

    /**
     * @method 远端用户加入通道成功
     * @params
     */
    onRemoteUserEnterRoom(evt) {
      const uid = evt.userId;
      console.log('peer-join:' + uid);
      if (uid === shareUserId || ~String(uid).indexOf('share')) {
        return this;
      }

      let name = '';
      let avatar = "http://wx.qlogo.cn/mmopen/OUicWJdJoz3HNVF1oYxOQYibUZicpTD55udhicFPk9RBUuicwxiahv5nUJBx7MZPbl7tTkeZRlptRuhhMpaPNPxyplWQ/96";
      let role = 'student';
      let teacher = this.teacher;
      if(uid === teacher.identityId || uid === teacher.userId) {
        role = 'lecturer';
      }

      // subscribe: 远端流是否被订阅
      let user = {
        id: uid,
        uid,
        name,
        avatar,
        role, audio: false, video: false, active: false, subscribe: false
      };

      this.joinUser(user, 'SDK');
    },

    /**
     * 当远端用户离开本房间时，关闭对应的画面。
     */
    onRemoteUserLeaveRoom(evt) {
      const uid = evt.userId;
      console.log('peer-leave ' + uid);

      // 这里不是真正的离开 需要走自己的业务判读是都离开
    },

    /**
     * 当远程用户屏幕分享的状态发生变化，会根据 available 参数打开或关闭画面
     **/
    setSubStreamAvailable(uid, available) {
      log.info(`setSubStreamAvailable: ${uid}, ${available}`);
      let meeting = this.meeting;

      if (available) {
        setTimeout(() => {
          this.joinRemoteScreenSharing();
        }, 0);

        meeting.otherscreen = true;

        this.shareClosedTimer && clearTimeout(this.shareClosedTimer);

        if(this.meetingLayout !== MeetingMode.SPEAKER) {
          this.setMeetingLayout(MeetingMode.SPEAKER)
        }
      } else {
        meeting.otherscreen = false;
        this.shareStream = null;

        // 5s之后再切换布局
        this.shareClosedTimer = setTimeout(()=>{
          this.setMeetingLayout(MeetingMode.DEFAULT)
        }, 5000)
      }

      this.setMeeting(meeting);
    },

    /**
     * @method 远端用户发布流
     * @params
     */
    onUserStreamAdded(evt) {
      const rtcEngine = this.rtcEngine;
      const members = rtcEngine.members;
      const client = rtcEngine.client;
      const remoteStream = evt.stream;
      const id = remoteStream.getId();
      const userId = remoteStream.getUserId();
      const type = remoteStream.getType();

      console.log(`remote stream added: [${userId}] ID: ${id} type: ${type}`);

      if (userId === shareUserId) {
        // don't need screen shared by us
        client.unsubscribe(remoteStream);
      } else {
        // web共享兼容 ~String(stream.userID).indexOf('share')
        if(type === 'auxiliary' || ~String(userId).indexOf('share')) {
          this.shareStream = remoteStream;

          // 共享流需要主动订阅
          client.subscribe(remoteStream);
        } else if(type === 'main') {
          members.set(userId, remoteStream);
          rtcEngine.setMembers(members);

          // 老师的流主动订阅
          let teacher = this.teacher;
          if(userId == teacher.identityId || userId == teacher.userId) {
            client.subscribe(remoteStream);
          } else {
            // 其他远端流等页面展示的时候订阅
            client.unsubscribe(remoteStream);
          }
        }

        // TODO: 订阅的流超过20个就不能再订阅了
        // console.log('subscribe to this remote stream');
        // client.subscribe(remoteStream);
      }
    },

    /**
     * @method 订阅了远端流
     * @params
     */
    onUserStreamSubscribed(evt) {
      console.log('stream-subscribed: ', evt);
      const rtcEngine = this.rtcEngine;
      const client = rtcEngine.client;
      const members = rtcEngine.members;

      const remoteStream = evt.stream;
      const type = remoteStream.getType();
      const streamId = remoteStream.getId();
      let uid = rtcEngine.getUidByStreamId(streamId)||remoteStream.userId_;

      const remoteStreams = rtcEngine.remoteStreams;
      let index = remoteStreams.findIndex((stream)=>{
        return stream.getId() === streamId;
      })

      // 远端流存在
      if(~index) {
        remoteStreams.splice(index, 1, remoteStream);

        // 更新远程流
        members.set(String(uid), remoteStream);
        rtcEngine.setMembers(members);
      } else {
        remoteStreams.push(remoteStream);

        remoteStream.on('player-state-changed', event => {
          console.log(`${event.type} player is ${event.state}`, event);
          // 静音流可能也会有PLAYING 状态 可能会导致状态和远端不一致错乱
          // let user = {
          //   id: uid,
          //   type: event.type,
          //   value: event.state == 'PLAYING' ? true : false
          // };
          // this.updateMeetingStatus(user);

          if (event.type == 'video' && event.state == 'PAUSED') {
            if(type === 'auxiliary') {
              this.joinRemoteScreenSharing();
            }
          }

          if (event.type == 'video' && event.state == 'PLAYING') {
          }

          if (event.type == 'audio' && event.state == 'PAUSED') {
            // remoteStream.resume();
            // remoteStream.play(uid);
          }
        });
      }

      rtcEngine.setRemoteStreams(remoteStreams);

      console.log('stream-subscribed uid: ', uid);

      // 屏幕分享流
      // web共享兼容 ~String(remoteStream.userId_).indexOf('share')
      if(type === 'auxiliary' || ~String(remoteStream.userId_).indexOf('share')) {
        this.setSubStreamAvailable(uid, true);
      } else if(uid) {
        // 更新远端流已订阅状态 可以播放
        const user = {
          id: uid,
          type: 'subscribe',
          value: true
        };
        this.updateMeetingStatus(user);

        try {
          setTimeout(()=>{
            let view = document.getElementById(uid);
            if( (remoteStream.hasVideo() || remoteStream.hasAudio())
              && remoteStream.audioPlayer_ === null
              && remoteStream.videoPlayer_ === null && view) {
              remoteStream.play(uid);
            }
          }, 2000)
        } catch (error) {
          console.error('Stream play exception:%s', error.message);
        }
      }
    },

    /**
     * @method 远端流更新
     * @params
     */
    onUserStreamUpdated(evt) {
      console.log('onUserStreamUpdated: ', evt);

      const rtcEngine = this.rtcEngine;
      const remoteStream = evt.stream;
      const type = remoteStream.getType();
      let hasAudio = remoteStream.hasAudio();
      let hasVideo = remoteStream.hasVideo();
      let uid = rtcEngine.getUidByStreamId(remoteStream.getId());
      if (hasVideo && type === 'main') {
        setTimeout(()=>{
          let view = document.getElementById(uid);
          if(remoteStream.videoPlayer_ === null && uid && view) {
            try {
              // remoteStream.audioPlayer_ && remoteStream.stop();
              // remoteStream.play(uid);
            } catch (error) {
              console.error('Stream play exception:%s', error.message);
            }
          }
        }, 1500)
      }

      // 更新流替换
      if(type === 'main' && (hasAudio || hasVideo)) {
        let members = rtcEngine.members;
        members.set(uid, remoteStream);
        rtcEngine.setMembers(members);
      }

      if (type === 'main') {
        let user = {
          id: uid,
          type: 'video',
          value: hasVideo
        };
        this.updateMeetingStatus(user);
      }

      console.log(
        'type: ' +type +
          ' stream-updated hasAudio: ' +hasAudio +
          ' hasVideo: ' + hasVideo +
          ' uid: ' + uid
      );
    },

    /**
     * @method 远端流删除
     * @params fired when the remote stream is removed, e.g. the remote user called Client.unpublish()
     */
    onUserStreamRemoved(evt) {
      console.log('onUserStreamRemoved: ', evt);

      const rtcEngine = this.rtcEngine;
      const remoteStream = evt.stream;
      const id = remoteStream.getId();
      const userId = remoteStream.getUserId();
      const type = remoteStream.getType();
      remoteStream.stop();

      let remoteStreams = rtcEngine.remoteStreams;
      remoteStreams = remoteStreams.filter(stream => {
        return stream.getId() !== id;
      });
      rtcEngine.setRemoteStreams(remoteStreams);

      // 屏幕分享流
      // web共享兼容 ~String(remoteStream.userId_).indexOf('share')
      if(type === 'auxiliary' || ~String(remoteStream.userId_).indexOf('share')) {
        this.setSubStreamAvailable(userId, false);
      } else {
        // 关闭音视频订阅状态
        let user = {
          id: userId,
          audio: false,
          video: false,
          subscribe: false
        };
        this.updateUser(user);

        let members = rtcEngine.members;
        members.delete(userId);
        rtcEngine.setMembers(members);
      }

      // 删除对声音大小的监听
      rtcEngine.deleteVolumeInterval(userId);
      console.log(`stream-removed ID: ${id}  type: ${type}`);
    },

    /**
     * @method 远端用户音频静音
     * @params
     */
    onUserAudioMuted(evt) {
      let uid = evt.userId;
      log.info('[onUserAudioMuted]', uid);

      const user = {
        id: uid,
        type: 'audio',
        value: false
      };
      this.updateMeetingStatus(user);

      try {
        let rtcEngine = this.rtcEngine;
        rtcEngine.deleteVolumeInterval(uid);
      } catch(error) {
        console.error('onUserAudioMuted:', error);
      }
    },

    /**
     * @method 远端用户音频开启
     * @params
     */
    onUserAudioUnmuted(evt) {
      let uid = evt.userId;
      log.info('[onUserAudioUnmuted]', uid);

      const user = {
        id: uid,
        type: 'audio',
        value: true
      };
      this.updateMeetingStatus(user);

      try {
        let rtcEngine = this.rtcEngine;
        rtcEngine.setVolumeInterval(rtcEngine.remoteStreams.find(stream => stream.getUserId() === uid));
      } catch(error) {

      }
    },

    /**
     * @method 远端用户视频静音
     * @params
     */
    onUserVideoMuted(evt) {
      let uid = evt.userId;
      log.info('[onUserVideoMuted]', uid);

      const user = {
        id: uid,
        type: 'video',
        value: false
      };
      this.updateMeetingStatus(user);
    },

    /**
     * @method 远端用户视频开启
     * @params
     */
    onUserVideoUnmuted(evt) {
      let uid = evt.userId;
      log.info('[onUserVideoUnmuted]', uid);

      const user = {
        id: uid,
        type: 'video',
        value: true
      };
      this.updateMeetingStatus(user);
    },

    /**
     * @method 检测成员语音音量
     * @params
     */
    detectUserVoiceVolume() {
      log.info('[detectUserVoiceVolume]');

      let rtcEngine = this.rtcEngine;
      let userVolumeMap = rtcEngine.getVolumeLevelMap();

      let teacherAndMine = [];
      let others = [];
      let speakers = this.speakers;
      speakers.forEach((user)=>{
        let userVolume = userVolumeMap.get(String(user.id));

        // userVolume 不准确
        if(user.audio && userVolume) {
          user.active = true;
          user.volume = userVolume;
        } else if(user.active && user.id !== this.local) {
          user.active = false;
          user.volume = 0;
        }

        // 老师
        if(user.role === 'lecturer') {
          teacherAndMine.unshift(user);
        } else if(user.role === 'collaborator') {
          teacherAndMine.push(user);
        } else {
          // 自己
          if(user.id === this.local) {
            teacherAndMine.push(user);
          }
        }
      })

      // 然后根据音量排序
      speakers = speakers.sort((a, b) => { return b.audio - a.audio; })

      // 正在说话列表
      // this.activeSpeakers = speakers.filter((user)=>{
      //   return user.audio && user.volume;
      // });

      // 其他学生
      others = speakers.filter((user)=>{
        return user.role !== 'lecturer' && user.role !== 'collaborator' && user.id !== this.local;
      })

      this.setSpeakers([...teacherAndMine, ...others]);
    },

    /**
     * @method 设置音频
     * @params
     */
    async setAudioByTencent(audio = false) {
      let rtcEngine = this.rtcEngine;
      let meeting = this.meeting;

      if(!rtcEngine) {
        return this;
      }

      try {
        if(audio) {
          let result = await rtcEngine.publishAudio();

          console.log('result:', result);
          if(result === false) {
            meeting.audio = false;
            this.setMeeting(meeting);

            return this;
          }
        } else {
          rtcEngine.unpublishAudio();
        }
      } catch(error) {
        console.error('设置音频 audio: ' + audio, error);
        meeting.audio = false;
        this.setMeeting(meeting);

        return this;
      }

      const user = {
        id: this.user.id,
        type: 'audio',
        value: audio
      };
      this.updateMeetingStatus(user);

      let device = { audio };
      this.changeDeviceStatus(device);

      const message = audio ? this.$i18n.t('meeting.micunmuted') : this.$i18n.t('meeting.micmuted');
      this.$toast({ type: 1, message: message, duration: 2000 });
    },

    /**
     * @method 设置视频
     * @params
     */
    async setVideoByTencent(video = false) {
      let rtcEngine = this.rtcEngine;
      let meeting = this.meeting;
      let result = false;

      if(!rtcEngine) {
        return this;
      }

      try {
        if(video) {
          result = await rtcEngine.publishVideo();

          console.log('result:', result);
          if(result === false) {
            meeting.video = false;
            this.setMeeting(meeting);

            return this;
          }
        } else {
          result = await rtcEngine.unpublishVideo();
          if(result === false) {
            return this;
          }
        }
      } catch(error) {
        log.error('[setVideo] error:%s', error.name, JSON.stringify(error.message));

        meeting.video = false;
        this.setMeeting(meeting);

        return this;
      }

      const user = {
        id: this.user.id,
        type: 'video',
        value: video
      };
      this.updateMeetingStatus(user);

      let device = { video };
      this.changeDeviceStatus(device);

      const message = video ? this.$i18n.t('meeting.cameraunmuted') : this.$i18n.t('meeting.cameramuted');
      this.$toast({ type: 1, message: message, duration: 2000 });
    },

    /**
     * @method 屏幕共享
     * @params
     */
    async setScreenShare(screen) {
      console.log('setScreenShare:', screen);
      let shareClient = this.shareClient;

      // 没有实例化分享
      if(!shareClient) {
        shareClient = await this.initTencentShare();
      }

      const user = this.user;
      const userId = user.id;

      if(screen) {
        let source = this.shareInfo;
        let type = 1;

        if(shareClient) {
          await shareClient.join();
          this.setLocalSharing(true);

          if(shareClient.isPublished) {
            let msg = { shareId: Number(userId), shareName: user.name, type: String(type), width: 0, height: 0 };
            this.startShare(msg);
          }
        } else {
          // todo: 不支持
          this.$toast({ type: 1, message: '当前浏览器不支持屏幕共享', duration: 2000 });
        }
      } else {
        shareClient.leave();

        this.endShare();
        this.setLocalSharing(false);
      }
    },

    /**
     * @method 用户接收共享屏幕
     * @params
     */
    joinRemoteScreenSharing() {
      let shareStream = this.shareStream;
      shareStream && shareStream.stop();
      setTimeout(()=>{
        let view = document.querySelector(`#J_screenshare`)

        if(view) {
          try {
            shareStream.play('J_screenshare', { objectFit: 'contain' }).
            then(() => {
              if(shareStream.videoPlayer_ && shareStream.videoPlayer_.element_) {
                shareStream.videoPlayer_.element_.controls = true;
              }
            });
          } catch (error) {
            console.error('Stream play exception:%s', error.message);
          }
        }
      }, 20)
    },

    /**
     * @method 退出互动处理
     */
    exitRoomTencent() {
      try {
        let rtcEngine = this.rtcEngine;
        rtcEngine.leave();
      } catch (error) {
        console.error('[stopMeeting] exception:%s', error.message);
      }

      if (this.localSharing) {
        this.setShareScreen(false);
      }

      this.volumeTimer && clearInterval(this.volumeTimer);

      if(this.reportTimer) {
        clearInterval(this.reportTimer);
        this.reportTimer = null;

        this.report();
      }
    },

  }
}


export default tencentMixin;

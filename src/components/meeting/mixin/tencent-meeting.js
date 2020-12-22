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
      roomId = Number(info && info.teacherUserId) || roomId;
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
          // todo: 根据用户设备类型建议用户使用 SDK 支持的浏览器
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
    },

    onError(err) {
      console.error('client onError: ' + err);
    },

    onBanned(evt) {
      // 您已被踢出房间
      console.error('client has been banned for ' + evt);
    },

    /**
     * @method 本地用户加入通道成功
     * @params result - 进房结果， 大于 0 时，为进房间消耗的时间，这表示进进房成功。如果为 -1 ，则表示进房失败。
     */
    async enterRoom() {
      log.info('[onEnterRoom] result:%s');

      const rtcEngine = this.rtcEngine;
      // 本地用户进入是否打开音视频
      let { audio, video, active } = this.meeting;
      // 用户视频状态是否支持离线
      let speakers = this.speakers;
      let user = Object.assign({}, this.user, { role: 2, audio, video, active });
      let index = speakers.findIndex((item)=>{
        return item.id == user.id;
      })

      if(index === -1) {
        speakers.push(user);
        this.setSpeakers(speakers);
      }

      await rtcEngine.initLocalStream();
      setTimeout(()=>{
        this.joinedMeeting(user);
      }, 0)

      let states = rtcEngine.getRemoteMutedState();
      if(states && states.length) {
        console.log('states:', states);

        states.forEach((item)=>{
          let uid = item.userId;
        })
      }
    },

    /**
     * 当退出房间时触发的回调
     */
    onExitRoom() {
      log.info('[onExitRoom]',);
    },
    /**
     * @method 远端用户加入通道成功
     * @params
     */
    onRemoteUserEnterRoom(evt) {
      const uid = evt.userId;
      console.log('peer-join:' + uid);
      if (uid === shareUserId) {
        return this;
      }

      let name = '';
      let avatar = "http://wx.qlogo.cn/mmopen/OUicWJdJoz3HNVF1oYxOQYibUZicpTD55udhicFPk9RBUuicwxiahv5nUJBx7MZPbl7tTkeZRlptRuhhMpaPNPxyplWQ/96";
      let role = 'student';
      let teacher = this.teacher;
      if(uid === teacher.identityId || uid === teacher.userId) {
        role = 'lecturer';
      }

      let user = {
        id: uid,
        uid,
        name,
        avatar,
        role, audio: false, video: false, active: false
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
          this.joinRemoteScreenSharing(uid);
        }, 0);

        meeting.otherscreen = true;
      } else {
        meeting.otherscreen = false;
        this.shareStream = null;
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
        if(type === 'main') {
          members.set(userId, remoteStream);
          rtcEngine.setMembers(members);
        } else if(type === 'auxiliary') {
          this.shareStream = remoteStream;
        }

        console.log('subscribe to this remote stream');
        client.subscribe(remoteStream);
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

      const remoteStream = evt.stream;
      const type = remoteStream.getType();
      const streamId = remoteStream.getId();
      let uid = rtcEngine.getUidByStreamId(streamId);

      const remoteStreams = rtcEngine.remoteStreams
      remoteStreams.push(remoteStream);
      rtcEngine.setRemoteStreams(remoteStreams);

      console.log('stream-subscribed uid: ', uid);

      remoteStream.on('player-state-changed', event => {
        console.log(`${event.type} player is ${event.state}`, event);
        let user = {
          id: uid,
          type: event.type,
          value: event.state == 'PLAYING' ? true : false
        };
        this.updateMeetingStatus(user);

        if (event.type == 'video' && event.state == 'STOPPED') {
        }

        if (event.type == 'video' && event.state == 'PLAYING') {
        }
      });

      // 屏幕分享流
      if(type === 'auxiliary') {
        // this.shareStream = remoteStream;
        this.setSubStreamAvailable(uid, true);
      } else {
        remoteStream.play(uid);
      }

      if (!remoteStream.hasVideo()) {
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
      if (remoteStream.hasVideo() && type === 'main') {
        // remoteStream.stop();
        // remoteStream.play(uid);
      }

      // 更新流替换
      if(type === 'main' && (hasAudio || hasVideo)) {
        rtcEngine.members.set(uid, remoteStream);
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
      if(type === 'auxiliary') {
        this.setSubStreamAvailable(userId, false);
      } else {

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
      log.info('[onUserAudioMuted]', uid);

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
      if(audio) {
        rtcEngine.unmuteLocalAudio();
      } else {
        rtcEngine.muteLocalAudio();
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
        if(video) {
          rtcEngine.unmuteLocalVideo()
          // .then(()=>{
          // });
        } else {
          rtcEngine.muteLocalVideo();
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

          let msg = { shareId: Number(userId), shareName: user.name, type: String(type), width: 0, height: 0 };
          this.startShare(msg);
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
          shareStream.play('J_screenshare', { objectFit: 'contain' }).
          then(() => {
            shareStream.videoPlayer_.element_.controls = true;
          });
        }
      }, 500)
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
    },

  }
}


export default tencentMixin;

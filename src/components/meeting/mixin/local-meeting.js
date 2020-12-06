/**
 * 会议操作指令处理 本地会议
 * @author: chenzhou
 * @update: 2020.11.15
 * @desc
 *
 */

const events = require('event-emitter');
import bowser from 'bowser';
import RoomClient from './mediasoup-sdk';

try {
  events(RoomClient.prototype);
} catch(error) {
  console.log(error);
}

const log = console;

function getDeviceInfo(){
	const ua = navigator.userAgent;
	const browser = bowser.getParser(ua);
	let flag;

	if (browser.satisfies({ chrome: '>=0', chromium: '>=0' }))
		flag = 'chrome';
	else if (browser.satisfies({ firefox: '>=0' }))
		flag = 'firefox';
	else if (browser.satisfies({ safari: '>=0' }))
		flag = 'safari';
	else if (browser.satisfies({ opera: '>=0' }))
		flag = 'opera';
	else if (browser.satisfies({ 'microsoft edge': '>=0' }))
		flag = 'edge';
	else
		flag = 'unknown';

	return {
		flag,
		name    : browser.getBrowserName(),
		version : browser.getBrowserVersion()
	};
}

let localMeeting = {
  watch: {
    // 音频控制
    'meeting.audio'(newVal, oldVal) {
      this.setAudioLocal(newVal);
    },
    // 视频控制
    'meeting.video'(newVal, oldVal) {
      this.setVideoLocal(newVal);
    },
    // 我自己开启了屏幕共享
    'meeting.screen'(newVal, oldVal) {
      this.setShareScreenLocal(newVal);
    },

  },
  methods: {
    /**
     * @method 进入会议初始化操作
     * @params
     */
    initLocalMeeting(info) {
      // 确保当前用户
      let uid = info && info.id;
      let displayName = info && info.name;
      let avatar = info && info.avatar;
      let roomId = info && info.roomId;

      let device = getDeviceInfo();

      let rtcEngine = new RoomClient({
				roomId,
				peerId: uid,
				displayName,
        avatar,
				device,
				handlerName: '',
				useSimulcast: true,
				useSharingSimulcast: true,
				forceTcp: false,
				forceH264: false,
				forceVP9: false,
				svc: false,
				externalVideo: false
			});

			setTimeout(()=>{
				rtcEngine.join();

        const speakers = this.speakers;
        let { audio, video, active } = this.meeting;
        let user = Object.assign({ audioConsumer: null, videoConsumer: null }, this.user, { audio, video, active });
        speakers.push(user);

        this.setSpeakers(speakers);
			}, 1000)

      this.rtcEngine = rtcEngine;
      window.rtcEngine = rtcEngine;
      console.log('rtcEngine:', rtcEngine);

      this.subEvents(rtcEngine);

      setInterval(() =>{
        if (window.rtcEngine._sendTransport){
          window.PC1 = window.rtcEngine._sendTransport._handler._pc;
        } else {
          delete window.PC1;
        }

        if (window.rtcEngine._recvTransport)
          window.PC2 = window.rtcEngine._recvTransport._handler._pc;
        else
          delete window.PC2;
      }, 2000);
    },

    /**
     * @method 事件监听
     * @params
     */
    subEvents(rtcEngine) {
      rtcEngine.on('joinedChannel', this.onJoinedChannel.bind(this));
      rtcEngine.on('userJoined', this.onUserJoinedLocal.bind(this));

      rtcEngine.on('localVideoAvailable', this.onLocalVideoAvailable.bind(this));

      rtcEngine.on('userVideoAvailable', this.onUserVideoAvailableLocal.bind(this));
      rtcEngine.on('userAudioAvailable', this.onUserAudioAvailableLocal.bind(this));

      // rtcEngine.on('onExitRoom', this.onExitRoom.bind(this));
      rtcEngine.on('userLeaveRoom', this.onUserLeaveRoomLocal.bind(this));
      rtcEngine.on('userScreenAvailable', this.onUserScreenAvailableLocal.bind(this));

      rtcEngine.on('activeSpeaker', this.onActiveSpeaker.bind(this));
    },

    /**
     * @method 本地用户加入通道成功
     * @params
     */
    onJoinedChannel(result) {
      log.info('[onJoinedChannel] result:%s', result);

      const rtcEngine = this.rtcEngine;
      // 本地用户进入是否打开音视频
      let { audio, video, active } = this.meeting;
      // 用户视频状态是否支持离线
      let speakers = this.speakers;
      let user = Object.assign({ audioConsumer: null, videoConsumer: null }, this.user, { audio, video, active });
      let index = speakers.findIndex((item)=>{
        return item.id == user.id;
      })

      if(index === -1) {
        speakers.push(user);
        this.setSpeakers(speakers);
      }

      setTimeout(()=>{
        try {
          // 是否启用音频视频
          // rtcEngine.enableLocalAudio();
          // rtcEngine.enableWebcam();
        } catch(error) {
          log.error('onEnterRoom error:%s', JSON.stringify(error.message));
        }
      }, 0)
    },

    /**
     * @method 远端用户加入
     * @params
     */
    onUserJoinedLocal(peer) {
      log.info('[onUserJoinedForLocal] uid:%s', peer);

      let defaultAvatar = 'http://wx.qlogo.cn/mmopen/OUicWJdJoz3HNVF1oYxOQYibUZicpTD55udhicFPk9RBUuicwxiahv5nUJBx7MZPbl7tTkeZRlptRuhhMpaPNPxyplWQ/96';

      let { id, displayName, avatar } = peer;
      let user = {
        id: id,
        uid: id,
        name: displayName,
        avatar: avatar || defaultAvatar,
        audio: false, video: false, active: false,
        audioConsumer: null, videoConsumer: null
      };
      let speakers = this.speakers;
      let index = speakers.findIndex((user)=>{
        return user.id == id;
      })

      // 不存在 加入
      if(index === -1) {
        speakers.push(user);
        this.setSpeakers(speakers);
      }
    },

    /**
     * @method 远端用户离开
     * @params
     */
    onUserLeaveRoomLocal(peer) {
      log.info('[onUserLeaveRoomLocal] uid:%s', peer);

      let { peerId } = peer;
       // 移除发言列表中用户
      let speakers = this.speakers;
      let index = speakers.findIndex((user)=>{
        return peerId == user.uid;
      })

      // 存在用户
      if(~index) {
        speakers.splice(index, 1);
        this.setSpeakers(speakers);
      }
    },

    /**
     * @method 本地视频打开
     * @params
     */
    onLocalVideoAvailable({available, videoProduce}) {
      console.log('onLocalVideoAvailable:', videoProduce)
      let uid = this.local;

      let speakers = this.speakers;
      let index = speakers.findIndex((user)=>{
        return user.id == uid;
      })

      if(~index) {
        let user = speakers[index];
        user.video = available;

        if(available) {
          user.videoConsumer = videoProduce;
        } else {
          user.videoConsumer = null;
        }

        speakers.splice(index, 1, user);
        this.setSpeakers(speakers);
      }
    },

    /**
     * @method 远端用户音频状态改变
     * @params
     */
    onUserAudioAvailableLocal({uid, available, consumer}) {
      console.log('onUserAudioAvailableLocal:', uid, available, consumer)

      let speakers = this.speakers;
      let index = speakers.findIndex((user)=>{
        return user.id == uid;
      })

      if(~index) {
        let user = speakers[index];
        user.audio = available;

        if(available) {
          user.audioConsumer = consumer;
        } else {
          user.audioConsumer = null;
          user.active = false;
        }

        speakers.splice(index, 1, user);
        this.setSpeakers(speakers);
      }
    },

    /**
     * 当远程用户屏幕分享的状态发生变化，会根据 available 参数打开或关闭画面
     **/
    onUserVideoAvailableLocal({uid, available, consumer}) {
      console.log('onUserVideoAvailableLocal:', uid, available, consumer)

      let speakers = this.speakers;
      console.log('speakers:', speakers)
      let index = speakers.findIndex((user)=>{
        return user.id == uid;
      })

      if(~index) {
        let user = speakers[index];
        user.video = available;

        if(available) {
          user.videoConsumer = consumer;
        } else {
          user.videoConsumer = null;
        }

        speakers.splice(index, 1, user);
        this.setSpeakers(speakers);
      }
    },

    /**
     * @method 屏幕分享
     * @params
     */
    onUserScreenAvailableLocal({uid, available, consumer}) {
      console.log('onUserScreenAvailableLocal:', available, consumer)

      let { id } = consumer;
      let meeting = this.meeting;
      meeting.otherscreen = available;

      if(uid) {
        let user = this.speakers.find((user)=>{
          return user.id == uid;
        })

        meeting.shareName = user && user.name
      }

      this.setMeeting(meeting);

      if(available) {
        setTimeout(()=>{
          // let { id, appData } = consumer;
          let consumers = this.rtcEngine.getConsumers();
          let { track } = consumers.get(id);
          let shareEl = document.querySelector(`#localScreen`)

          console.log('onUserScreen track:', track, shareEl, id)

          if(shareEl && track) {
            const stream = new MediaStream();
            stream.addTrack(track);
            shareEl.srcObject = stream;
            window.shareStream = stream;

            shareEl.oncanplay = () => shareEl.play();
            shareEl.onplay = () =>{
              shareEl.play().catch((error) => console.warn('shareEl.play() failed:%o', error));
            };

            shareEl.play().catch((error) => console.warn('shareEl.play() failed:%o', error));

            console.log('stream track:', stream)
          }
        }, 0)
      } else {

      }
    },

    /**
     * @method 活跃用户
     * @params
     */
    onActiveSpeaker({uid, volume}) {
      let speakers = this.speakers;
      let index = speakers.findIndex((user)=>{
        return user.id == uid;
      })

      if(~index) {
        let user = speakers[index];

        if(volume) {
          user.active = true;
        } else {
          user.active = false;
        }

        speakers.splice(index, 1, user);
        this.setSpeakers(speakers);
      }
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
          speakers.splice(index, 1, user);

          this.setSpeakers(speakers);
        }
      }
    },

    /**
     * @method 设置音频
     * @params
     */
    setAudioLocal(audio = false) {
      let rtcEngine = this.rtcEngine;

      if(audio) {
        rtcEngine && rtcEngine.enableLocalAudio();
      } else {
        rtcEngine && rtcEngine.disableLocalAudio();
      }

      const user = {
        id: this.user.id,
        type: 'audio',
        value: audio
      };
      this.updateMeetingStatus(user);

      // this.$toast({ type: 1, message: audio ? '麦克风已开启': '麦克风已静音', duration: 2000 });
    },

    /**
     * @method 设置视频
     * @params
     */
    setVideoLocal(video = false) {
      let rtcEngine = this.rtcEngine;

      try {
        if(video) {
          rtcEngine.enableWebcam();
        } else {
          rtcEngine.disableWebcam();
        }
      } catch(error) {
        log.error('[setVideo] error:%s', JSON.stringify(error.message));
        return null;
      }

      const user = {
        id: this.user.id,
        type: 'video',
        value: video
      };
      this.updateMeetingStatus(user);

      // this.$toast({ type: 1, message: video ? '视频已开启': '视频已关闭', duration: 2000 });
    },

    /**
     * @method 屏幕共享
     * @params
     */
    setShareScreenLocal(screen) {
      console.log('screen:', screen);

      try {
        let rtcEngine = this.rtcEngine;
        const user = this.user;
        const userId = user.id;

        if(screen) {
          rtcEngine && rtcEngine.enableShare();
        } else {
          rtcEngine && rtcEngine.disableShare();
        }
      } catch (error) {
        console.error('[setShareScreenLocal] error:%s', JSON.stringify(error.message));
      }
    },

    /**
     * @method 退出互动处理
     */
    stopLocaleeting() {
      try {
        let rtcEngine = this.rtcEngine;
        rtcEngine.close();
      } catch (error) {
        console.error('[stopMeeting] exception:%s', error.message);
      }
    },
  }
}


export default localMeeting;


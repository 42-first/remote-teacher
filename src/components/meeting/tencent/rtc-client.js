/**
 * 腾讯云视频通话Web
 * @author: chenzhou
 * @update: 2020.12.17
 * @desc 初始化SDK 加入频道 音视频控制
 */


// 使用requestAnimationFrame重写setInterval，进行性能优化
function setAnimationFrame(render) {
  // 计时器ID
  let timer = {};
  function animeLoop() {
    render();
    timer.id = requestAnimationFrame(animeLoop);
  }
  animeLoop();
  return timer;
}

// 清除AnimationFrame
function clearAnimationFrame(timer) {
  cancelAnimationFrame(timer.id);
}

export default class RtcClient {
  constructor(options) {
    // cameraId/microphoneId 是否取设置中的
    let { appId, token, roomId, uid, privateMapKey } = options;
    this.appId = appId;
    this.uid = uid;
    this.token = token;
    this.roomId = roomId;
    this.privateMapKey = privateMapKey;

    this.isJoined = false;
    this.isPublished = false;
    this.isAudioMuted = false;
    this.isVideoMuted = false;
    this.localStream = null;
    this.remoteStreams = [];
    this.members = new Map();
    this.volumeIntervalMap = new Map();
    this.volumeLevelMap = new Map();

    // create a client for RtcClient
    this.client = TRTC.createClient({
      mode: 'rtc',
      sdkAppId: appId,
      userId: uid,
      userSig: token,
      privateMapKey
    });

    this.handleEvents();
  }

  async join() {
    if (this.isJoined) {
      console.warn('duplicate RtcClient.join() observed');
      return;
    }

    try {
      // join the room
      await this.client.join({
        roomId: this.roomId
      });
      console.log('join room success');
      this.isJoined = true;

      return true;
    } catch (e) {
      console.error('join room failed! ' + e);

      return false;
    }

    // 更新成员状态
    let states = this.client.getRemoteMutedState();
    for (let state of states) {
      if (state.audioMuted) {
        state.userId
      }

      if (state.videoMuted) {
        state.userId
      }
    }
  }

  getRemoteMutedState() {
    let states = this.client.getRemoteMutedState();
    return states;
  }

  /**
   * @method 初始化本地流
   * @params
   */
  initLocalStream() {
    try {
      // not to specify cameraId/microphoneId to avoid OverConstrainedError
      this.localStream = TRTC.createStream({
        audio: true,
        video: false,
        userId: this.uid,
        mirror: true
      });

      // initialize the local stream and the stream will be populated with audio/video
      await this.localStream.initialize();
      console.log('initialize local stream success');

      this.localStream.on('player-state-changed', event => {
        console.log(`local stream ${event.type} player is ${event.state}`);
      });

      // publish the local stream
      await this.publish();

      // this.localStream.play('main-video');
      // 监听自己的声音大小
      this.setVolumeInterval(this.localStream);
    } catch (e) {
      console.error('failed to initialize local stream - ' + e);
    }
  }

  async leave() {
    if (!this.isJoined) {
      console.warn('leave() - please join() firstly');
      return;
    }

    // ensure the local stream is unpublished before leaving.
    await this.unpublish();

    // leave the room
    await this.client.leave();

    // 停止音量的监听及量化
    this.clearVolumeInterval();

    this.localStream.stop();
    this.localStream.close();
    this.localStream = null;
    this.isJoined = false;
    this.volumeLevelMap.clear();
  }

  async publish() {
    if (!this.isJoined) {
      console.warn('publish() - please join() firstly');
      return;
    }
    if (this.isPublished) {
      console.warn('duplicate RtcClient.publish() observed');
      return;
    }
    try {
      await this.client.publish(this.localStream);
    } catch (e) {
      console.error('failed to publish local stream ' + e);
      this.isPublished = false;
    }

    this.isPublished = true;
  }

  async unpublish() {
    if (!this.isJoined) {
      console.warn('unpublish() - please join() firstly');
      return;
    }
    if (!this.isPublished) {
      console.warn('RtcClient.unpublish() called but not published yet');
      return;
    }

    await this.client.unpublish(this.localStream);
    this.isPublished = false;
  }

  muteLocalAudio() {
    this.localStream.muteAudio();
    this.deleteVolumeInterval(this.uid);
  }

  unmuteLocalAudio() {
    this.localStream.unmuteAudio();
    this.setVolumeInterval(this.localStream);
  }

  // muteLocalVideo() {
  //   this.localStream.muteVideo();
  // }

  // unmuteLocalVideo() {
  //   this.localStream.unmuteVideo();
  // }

  muteLocalVideo() {
    let localStream = this.localStream;

    try {
      const videoTrack = localStream.getVideoTrack();
      if (videoTrack) {
        localStream.removeTrack(videoTrack).
        then(() => {
          console.log('remove video call success');
          // 关闭摄像头
          videoTrack.stop();
        });
      }
    } catch (e) {
      console.error('failed to muteLocalVideo ' + e);
    }
  }

  unmuteLocalVideo() {
    // 打开摄像头，增加视频通话
    let localStream = this.localStream;

    try {
      const videoStream = TRTC.createStream({ userId: this.uid, audio: false, video: true });
      videoStream.initialize().
      then(() => {
        console.log('camera video stream init success');

        // 增加视频通话
        localStream.addTrack(videoStream.getVideoTrack()).
        then(() => {
          console.log('add video call success');
        });
      });
    } catch (e) {
      console.error('failed to muteLocalVideo ' + e);
    }
  }

  resumeStreams() {
    this.localStream.resume();

    for (let stream of this.remoteStreams) {
      stream.resume();
    }
  }

  handleEvents() {
    this.client.on('error', err => {
      console.error(err);

    });
    this.client.on('client-banned', err => {
      console.error('client has been banned for ' + err);

      // alert('您已被踢出房间');
    });
    // fired when a remote peer is joining the room
    this.client.on('peer-join', evt => {
      const userId = evt.userId;
      console.log('peer-join ' + userId);
      if (userId !== shareUserId) {
        // addMemberView(userId);
      }
    });
    // fired when a remote peer is leaving the room
    this.client.on('peer-leave', evt => {
      const userId = evt.userId;
      console.log('peer-leave ' + userId);
    });
    // fired when a remote stream is added
    this.client.on('stream-added', evt => {
      const remoteStream = evt.stream;
      const id = remoteStream.getId();
      const userId = remoteStream.getUserId();
      this.members.set(userId, remoteStream);
      console.log(`remote stream added: [${userId}] ID: ${id} type: ${remoteStream.getType()}`);

      if (remoteStream.getUserId() === shareUserId) {
        // don't need screen shared by us
        this.client.unsubscribe(remoteStream);
      } else {
        console.log('subscribe to this remote stream');
        this.client.subscribe(remoteStream);
      }
    });
    // fired when a remote stream has been subscribed
    this.client.on('stream-subscribed', evt => {
      const uid = evt.userId;
      const remoteStream = evt.stream;
      const id = remoteStream.getId();
      this.remoteStreams.push(remoteStream);

      remoteStream.on('player-state-changed', event => {
        console.log(`${event.type} player is ${event.state}`);
        if (event.type == 'video' && event.state == 'STOPPED') {
        }

        if (event.type == 'video' && event.state == 'PLAYING') {
        }
      });

      if (remoteStream.userId_ && remoteStream.userId_.indexOf('share_') > -1) {
        remoteStream.play(id, { objectFit: 'contain' }).then(() => {
          // Firefox，当video的controls设置为true的时候，video-box无法监听到click事件
          // if (getBrowser().browser === 'Firefox') {
          //   return;
          // }
          remoteStream.videoPlayer_.element_.controls = true;
        });
      } else {
        remoteStream.play(id);
      }

      if (!remoteStream.hasVideo()) {

      }
      console.log('stream-subscribed ID: ', id);
    });
    // fired when the remote stream is removed, e.g. the remote user called Client.unpublish()
    this.client.on('stream-removed', evt => {
      const remoteStream = evt.stream;
      const id = remoteStream.getId();
      remoteStream.stop();
      this.remoteStreams = this.remoteStreams.filter(stream => {
        return stream.getId() !== id;
      });

      // 删除对声音大小的监听
      this.deleteVolumeInterval(remoteStream.getUserId());
      console.log(`stream-removed ID: ${id}  type: ${remoteStream.getType()}`);
    });

    this.client.on('stream-updated', evt => {
      const remoteStream = evt.stream;
      let uid = this.getUidByStreamId(remoteStream.getId());
      if (!remoteStream.hasVideo()) {

      }

      console.log(
        'type: ' +
          remoteStream.getType() +
          ' stream-updated hasAudio: ' +
          remoteStream.hasAudio() +
          ' hasVideo: ' +
          remoteStream.hasVideo() +
          ' uid: ' +
          uid
      );
    });

    this.client.on('mute-audio', evt => {
      console.log(evt.userId + ' mute audio');

      this.deleteVolumeInterval(evt.userId);
    });
    this.client.on('unmute-audio', evt => {
      console.log(evt.userId + ' unmute audio');

      this.setVolumeInterval(this.remoteStreams.find(stream => stream.getUserId() === evt.userId));
    });
    this.client.on('mute-video', evt => {
      console.log(evt.userId + ' mute video');

    });
    this.client.on('unmute-video', evt => {
      console.log(evt.userId + ' unmute video');

      const stream = this.members.get(evt.userId);
      if (stream) {
        let streamId = stream.getId();
        if (streamId) {
        }
      }
    });
  }

  showStreamState(stream) {
    console.log('has audio: ' + stream.hasAudio() + ' has video: ' + stream.hasVideo());
  }

  getUidByStreamId(streamId) {
    for (let [uid, stream] of this.members) {
      if (stream.getId() == streamId) {
        return uid;
      }
    }
  }

  // 监听用户的声音大小，每次浏览器刷新时渲染一次
  setVolumeInterval(stream) {
    if (!stream) return;
    let streamUserId = stream.getUserId();
    let volumeLevelInterval = setAnimationFrame(() => {
      const level = stream.getAudioLevel();
      // 获取到的音量大小和上一次记录的音量大小不同时进行更新渲染
      if (level !== this.volumeLevelMap.get(streamUserId)) {
        // console.log(`user ${streamUserId} is speaking ${level}`, Date.now());
        this.volumeLevelMap.set(streamUserId, level);
      }
    });

    this.volumeIntervalMap.set(streamUserId, volumeLevelInterval);
  }

  // 清空监听用户的声音大小
  deleteVolumeInterval(userId) {
    let volumeLevelInterval = this.volumeIntervalMap.get(userId);
    volumeLevelInterval && clearAnimationFrame(volumeLevelInterval);
    this.volumeIntervalMap.delete(userId);
  }

  // 用户离开房间时，清空对所有用户的音量监听
  clearVolumeInterval() {
    this.volumeIntervalMap.forEach(volumeInterval => {
      volumeInterval && clearAnimationFrame(volumeInterval);
    })
    this.volumeIntervalMap.clear();
  }
}

/**
 * 腾讯云视频通话Web
 * @author: chenzhou
 * @update: 2020.12.17
 * @desc 初始化SDK 加入频道 音视频控制
 */


import TRTC from 'trtc-js-sdk';

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

    // audience: 观众 anchor:主播
    this.role = '';
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
      // mode: 'rtc',
      mode: 'live',
      sdkAppId: appId,
      userId: uid,
      userSig: token,
      privateMapKey
    });
  }

  setMembers(members) {
    this.members = members;
  }

  setRemoteStreams(remoteStreams) {
    this.remoteStreams = remoteStreams;
  }

  setRole(role) {
    this.role = role;
  }

  getRole(role) {
    return this.role;
  }

  async join() {
    if (this.isJoined) {
      console.warn('duplicate RtcClient.join() observed');
      return;
    }

    try {
      // join the room
      await this.client.join({
        roomId: this.roomId,
        role: 'audience',
        privateMapKey: this.privateMapKey
      });
      console.log('join room success');
      this.isJoined = true;
      this.setRole('audience');

      return true;
    } catch (e) {
      console.error('join room failed! ' + e);

      return false;
    }
  }

  getRemoteMutedState() {
    let states = this.client.getRemoteMutedState();
    return states;
  }

  /**
   * @method 初始化本地音频流
   * @params
   */
  async initLocalStream() {
    try {
      // not to specify cameraId/microphoneId to avoid OverConstrainedError
      this.localStream = TRTC.createStream({
        audio: true,
        video: false,
        // video: true,
        userId: this.uid,
        mirror: true
      });

      // 使用预定义Profile设置 640*360 15 800
      this.localStream.setVideoProfile('360p');

      // initialize the local stream and the stream will be populated with audio/video
      let initResult = await this.localStream.initialize().
      catch((error) => {
        // 本地流初始化失败
        switch (error.name) {
          case 'NotAllowedError':
            // 提示用户：提示用户不授权摄像头/麦克风访问无法进行音视频通话
            window.$toast && window.$toast({
              type: 1,
              position: 'top',
              message: '请授权摄像头/麦克风访问，否则无法进行音视频通话',
              duration: 5000 })
            break;
          case 'NotReadableError':
            // 提示用户：暂时无法访问摄像头/麦克风，请确保当前没有其他应用请求访问摄像头/麦克风，并重试。
            window.$toast && window.$toast({
              type: 1,
              position: 'top',
              message: '暂时无法访问摄像头/麦克风，请确保当前没有其他应用请求访问摄像头/麦克风，并重试。',
              duration: 5000 })
            break;
          case 'NotFoundError':
            // 找不到摄像头或麦克风设备
            window.$toast && window.$toast({
              type: 1,
              position: 'top',
              message: '找不到摄像头或麦克风设备',
              duration: 5000 })
            return;
          default:
            console.error(error);
            break;
        }

        console.error(error, error.name);

        return false;
      });

      console.log('initResult:', initResult)
      if(initResult === false) {
        return false;
      }

      console.log('initialize local stream success');

      this.localStream.on('player-state-changed', event => {
        console.log(`local stream ${event.type} player is ${event.state}`);
      });

      // publish the local stream
      await this.publish();

      // this.muteLocalAudio();
      // this.muteLocalVideo();

      // 监听自己的声音大小
      this.setVolumeInterval(this.localStream);

      return true;
    } catch (e) {
      console.error('failed to initialize local stream - ' + e);

      return false;
    }
  }

   /**
   * @method 初始化本地视频流
   * @params
   */
  async initLocalVideoStream() {
    try {
      // not to specify cameraId/microphoneId to avoid OverConstrainedError
      this.localStream = TRTC.createStream({
        audio: false,
        video: true,
        userId: this.uid,
        mirror: true
      });

      // 使用预定义Profile设置 640*360 15 800
      this.localStream.setVideoProfile('360p');

      // initialize the local stream and the stream will be populated with audio/video
      let initResult = await this.localStream.initialize().
      catch((error) => {
        // 本地流初始化失败
        switch (error.name) {
          case 'NotAllowedError':
            // 提示用户：提示用户不授权摄像头/麦克风访问无法进行音视频通话
            window.$toast && window.$toast({
              type: 1,
              position: 'top',
              message: '请授权摄像头/麦克风访问，否则无法进行音视频通话',
              duration: 5000 })
            break;
          case 'NotReadableError':
            // 提示用户：暂时无法访问摄像头/麦克风，请确保当前没有其他应用请求访问摄像头/麦克风，并重试。
            window.$toast && window.$toast({
              type: 1,
              position: 'top',
              message: '暂时无法访问摄像头/麦克风，请确保当前没有其他应用请求访问摄像头/麦克风，并重试。',
              duration: 5000 })
            break;
          case 'NotFoundError':
            // 找不到摄像头或麦克风设备
            window.$toast && window.$toast({
              type: 1,
              position: 'top',
              message: '找不到摄像头或麦克风设备',
              duration: 5000 })
            return;
          default:
            console.error(error);
            break;
        }

        console.error(error, error.name);

        return false;
      });

      console.log('localStream initResult:', initResult)
      if(initResult === false) {
        return false;
      }

      console.log('initialize local stream success');

      this.localStream.on('player-state-changed', event => {
        console.log(`local stream ${event.type} player is ${event.state}`);
      });

      // publish the local stream
      await this.publish();

      this.members.set(this.uid, this.localStream);

      // 播放本地视频
      localStream.play(this.uid);

      return true;
    } catch (e) {
      console.error('failed to initialize local stream - ' + e);

      return false;
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
      this.isPublished = true;
    } catch (e) {
      console.error('failed to publish local stream ' + e);
      this.isPublished = false;
    }
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

  /**
   * @method 开启麦克风
   * @params
   */
  async publishAudio() {
    let role = this.getRole();

    if('anchor' === role) {
      return await this.unmuteLocalAudio();
    } else {
      await this.client
      .switchRole('anchor')
      .catch(error => {
        console.error('角色切换失败 ' + error);
        return false;
      })
      .then(() => {
        // 角色切换成功，现在是主播角色
        this.setRole('anchor');

        console.info('角色切换: anchor');

        return true;
      });

      return await this.unmuteLocalAudio();
    }
  }

  /**
   * @method 关闭麦克风
   * @params
   */
  unpublishAudio() {
    if(this.localStream && this.localStream.hasVideo()) {
      this.muteLocalAudio();
    } else {
      this.muteLocalAudio();
      this.unpublish();

      this.client
      .switchRole('audience')
      .then(() => {
        // 角色切换成功，关闭本地流切换到观众角色
        this.setRole('audience');
      });
    }
  }

  /**
   * @method 开启摄像头
   * @params
   */
  async publishVideo() {
    let role = this.getRole();

    if('anchor' === role) {
      return await this.unmuteLocalVideo();
    } else {
      await this.client
      .switchRole('anchor')
      .catch(error => {
        console.error('角色切换失败 ' + error);

        return false;
      })
      .then(() => {
        // 角色切换成功，现在是主播角色
        this.setRole('anchor');

        return true;
      });

      return await this.unmuteLocalVideo();
    }
  }

  /**
   * @method 关闭摄像头
   * @params
   */
  unpublishVideo() {
    if(this.localStream && this.localStream.hasAudio()) {
      this.muteLocalVideo();
    } else {
      this.muteLocalVideo();
      this.unpublish();

      this.client
      .switchRole('audience')
      .then(() => {
        // 角色切换成功，关闭本地流切换到观众角色
        this.setRole('audience');
      });
    }
  }

  muteLocalAudio() {
    this.localStream.muteAudio();
    this.deleteVolumeInterval(this.uid);
  }

  async unmuteLocalAudio() {
    if(!this.isPublished) {
      return await this.initLocalStream();
    } else {
      this.localStream.unmuteAudio();
      this.setVolumeInterval(this.localStream);

      return true;
    }
  }

  muteLocalVideo() {
    let localStream = this.localStream;

    return new Promise((resolve, reject) => {
      try {
        const videoTrack = localStream.getVideoTrack();
        if (videoTrack) {
          localStream.removeTrack(videoTrack).
          then(() => {
            console.log('remove video call success');
            // 关闭摄像头
            videoTrack.stop();

            resolve(true);
          });
        }
      } catch (e) {
        console.error('failed to muteLocalVideo ' + e);

        reject(false);
      }
    });
  }

  async unmuteLocalVideo() {
    if(!this.isPublished) {
      return await this.initLocalVideoStream();
    } else {
      // 打开摄像头，增加视频通话
      let localStream = this.localStream;

      await this.unpublish();

      const videoStream = TRTC.createStream({ userId: this.uid, audio: false, video: true });
      videoStream.setVideoProfile('360p');
      await videoStream.initialize().
      catch((error) => {
        console.error(error.name);

        // 本地流初始化失败
        switch (error.name) {
          case 'NotAllowedError':
            // 提示用户：提示用户不授权摄像头/麦克风访问无法进行音视频通话
            window.$toast && window.$toast({
              type: 1,
              position: 'top',
              message: '请授权摄像头/麦克风访问，否则无法进行音视频通话',
              duration: 5000 })
            break;
          case 'NotReadableError':
            // 提示用户：暂时无法访问摄像头/麦克风，请确保当前没有其他应用请求访问摄像头/麦克风，并重试。
            window.$toast && window.$toast({
              type: 1,
              position: 'top',
              message: '暂时无法访问摄像头/麦克风，请确保当前没有其他应用请求访问摄像头/麦克风，并重试。',
              duration: 5000 })
            break;
          case 'NotFoundError':
          case 'RtcError':
            // 找不到摄像头或麦克风设备
            window.$toast && window.$toast({
              type: 1,
              position: 'top',
              message: '找不到摄像头或麦克风设备',
              duration: 5000 })
            return;
          default:
            console.error(error);
            break;
        }
      });

      await localStream.addTrack(videoStream.getVideoTrack());

      this.publish();

      this.members.set(this.uid, localStream);

      // 播放本地视频
      localStream.stop();
      localStream.play(this.uid);
    }
  }

  resumeStreams() {
    this.localStream.resume();

    for (let stream of this.remoteStreams) {
      stream.resume();
    }
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

  getVolumeLevelMap() {
    return this.volumeLevelMap;
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

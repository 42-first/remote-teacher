/**
 * 腾讯云视频通话Web 分享实例分装
 * @author: chenzhou
 * @update: 2020.12.20
 * @desc 初始化SDK 加入频道 音视频控制
 */
// https://trtc-1252463788.file.myqcloud.com/web/docs/tutorial-06-advanced-screencast.html



import TRTC from 'trtc-js-sdk';

export default class ShareClient {
  constructor(options) {
    let { appId, token, roomId, uid, privateMapKey } = options;
    this.appId = appId;
    this.uid = uid;
    this.token = token;
    this.roomId = roomId;
    this.privateMapKey = privateMapKey;

    this.isJoined = false;
    this.isPublished = false;
    this.localStream = null;

    // create a client for RtcClient
    this.client = TRTC.createClient({
      mode: 'rtc',
      sdkAppId: appId,
      userId: uid,
      userSig: token,
      privateMapKey,
      /**
       * disable receivers to avoid receiving remote streams as we only want to
       * publish the screen stream
       */
      disableReceiver: true
    });

    this.client.setDefaultMuteRemoteStreams(true);
  }

  async join() {
    if (this.isJoined) {
      console.warn('duplicate RtcClient.join() observed');
      return;
    }
    // create a local stream for screen share
    this.localStream = TRTC.createStream({
      // disable audio as RtcClient already enable audio
      audio: true,
      // enable screen share
      screen: true,
      userId: this.uid
    });

    this.localStream.setScreenProfile('720p');

    try {
      // initialize the local stream to populate the screen stream
      await this.localStream.initialize();
      console.log('ShareClient initialize local stream for screen share success');

      this.localStream.on('player-state-changed', event => {
        console.log(`local stream ${event.type} player is ${event.state}`);
      });

      // 当用户通过浏览器自带的按钮停止屏幕分享时，会监听到 screen-sharing-stopped 事件
      this.localStream.on('screen-sharing-stopped', event => {
        console.log('share stream video track ended');
        this.leave();
      });
    } catch (e) {
      // 用户拒绝授予屏幕分享的权限, 导致屏幕分享失败
      if (e.name === 'NotAllowedError') {
        console.log('User refused to share the screen');
      } else {
        console.error('ShareClient failed to initialize local stream - ' + e);
      }

      // 屏幕分享流初始化失败，停止后续进房发布流程
      return;
    }

    try {
      await this.client.join({
        roomId: this.roomId,
        privateMapKey: this.privateMapKey
      });
      console.log('ShareClient join room success');
      this.isJoined = true;
    } catch (e) {
      console.error('ShareClient join room failed! ' + e);
    }

    try {
      // publish the screen share stream
      await this.client.publish(this.localStream);
      this.isPublished = true;
    } catch (e) {
      console.error('ShareClient failed to publish local stream ' + e);
    }
  }

  async leave() {
    if (!this.isJoined) {
      console.warn('leave() - please join() firstly');
      return;
    }
    if (this.isPublished) {
      await this.client.unpublish(this.localStream);
      this.isPublished = false;
    }
    if (this.isJoined) {
      await this.client.leave();
      this.isJoined = false;
    }
    if (this.localStream) {
      this.localStream.close();
      this.localStream = null;
    }
  }

}

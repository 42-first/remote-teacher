/**
 * 会议操作指令处理 本地会议SDK封装
 * @author: chenzhou
 * @update: 2020.11.15
 * @desc https://www.tapd.cn/38730227/documents/show/1138730227001002176?file_type=word
 */


import protooClient from 'protoo-client';
import * as mediasoupClient from 'mediasoup-client';


const VIDEO_CONSTRAINS = {
  qvga: { width: { ideal: 320 }, height: { ideal: 240 }, frameRate: { ideal: 10, max: 15 } },
  vga: { width: { ideal: 640 }, height: { ideal: 480 }, frameRate: { ideal: 10, max: 15 } },
  hd: { width: { ideal: 1280 }, height: { ideal: 720 }, frameRate: { ideal: 10, max: 15 } }
};

const PC_PROPRIETARY_CONSTRAINTS = {
  optional: [{ googDscp: true }]
};

const VIDEO_SIMULCAST_ENCODINGS = [
  { scaleResolutionDownBy: 4 },
  { scaleResolutionDownBy: 2 },
  { scaleResolutionDownBy: 1 }
];

// Used for VP9 webcam video.
const VIDEO_KSVC_ENCODINGS = [
  { scalabilityMode: 'S3T3_KEY' }
];

// Used for VP9 desktop sharing.
const VIDEO_SVC_ENCODINGS = [
  { scalabilityMode: 'S3T3', dtx: true }
];

function getProtooUrl({ roomId = '666666', peerId, token, forceH264, forceVP9 }) {
  // const hostname = 'v3demo.mediasoup.org:4443' || 'b.yuketang.cn/wswebrtc';
  // wss://v3demo.mediasoup.org:4443/?roomId=5agep09w&peerId=lo8b4bkf

  const hostname = 'b.yuketang.cn/wswebrtc';
  let url = `wss://${hostname}/?roomId=${roomId}&peerId=${peerId}&token=${token}`;

  if (forceH264)
    url = `${url}&forceH264=true`;
  else if (forceVP9)
    url = `${url}&forceVP9=true`;

  return url;
}

const logger = console;
let store;

export default class RoomClient {
  /**
   * @param  {Object} data
   * @param  {Object} data.store - The Redux store.
   */
  static init(data) {
    store = data.store;
  }

  constructor({ roomId, peerId, token, displayName, avatar, device, handlerName, useSimulcast,useSharingSimulcast,
    forceTcp,
    forceH264,
    forceVP9,
    svc,
    externalVideo
  }) {
    console.info('constructor() [roomId:"%s", peerId:"%s", token:"%s"]', roomId, peerId, token);

    // super();

    // Closed flag.
    // @type {Boolean}
    this._closed = false;

    // Display name.
    // @type {String}
    this._displayName = displayName;
    this._avatar = avatar;

    // Device info.
    // @type {Object}
    this._device = device;

    // Whether we want to force RTC over TCP.
    // @type {Boolean}
    this._forceTcp = forceTcp;

    // External video.
    // @type {HTMLVideoElement}
    this._externalVideo = null;

    // MediaStream of the external video.
    // @type {MediaStream}
    this._externalVideoStream = null;

    if (externalVideo) {
      this._externalVideo = document.createElement('video');

      this._externalVideo.controls = true;
      this._externalVideo.muted = true;
      this._externalVideo.loop = true;
      this._externalVideo.setAttribute('playsinline', '');
      this._externalVideo.src = EXTERNAL_VIDEO_SRC;

      this._externalVideo.play()
        .catch((error) => logger.warn('externalVideo.play() failed:%o', error));
    }

    // Custom mediasoup-client handler name (to override default browser
    // detection if desired).
    // @type {String}
    this._handlerName = handlerName;

    // Whether simulcast should be used.
    // @type {Boolean}
    this._useSimulcast = useSimulcast;

    // Whether simulcast should be used in desktop sharing.
    // @type {Boolean}
    this._useSharingSimulcast = useSharingSimulcast;

    // Protoo URL.
    // @type {String}
    this._protooUrl = getProtooUrl({ roomId, peerId, token, forceH264, forceVP9 });

    // protoo-client Peer instance.
    // @type {protooClient.Peer}
    this._protoo = null;

    // mediasoup-client Device instance.
    // @type {mediasoupClient.Device}
    this._mediasoupDevice = null;

    // mediasoup Transport for sending.
    // @type {mediasoupClient.Transport}
    this._sendTransport = null;

    // mediasoup Transport for receiving.
    // @type {mediasoupClient.Transport}
    this._recvTransport = null;

    // Local mic mediasoup Producer.
    // @type {mediasoupClient.Producer}
    this._micProducer = null;

    // Local webcam mediasoup Producer.
    // @type {mediasoupClient.Producer}
    this._webcamProducer = null;

    // Local share mediasoup Producer.
    // @type {mediasoupClient.Producer}
    this._shareProducer = null;

    // 远端producer信息 可能需要订阅才能拿到对应的consumer
    this._remoteProducers = new Map();

    // mediasoup Consumers.
    // @type {Map<String, mediasoupClient.Consumer>}
    this._consumers = new Map();

    // 本地流 音频流 视频流 共享流
    this._producer = new Map();

    // Map of webcam MediaDeviceInfos indexed by deviceId.
    // @type {Map<String, MediaDeviceInfos>}
    this._webcams = new Map();

    // Local Webcam.
    // @type {Object} with:
    // - {MediaDeviceInfo} [device]
    // - {String} [resolution] - 'qvga' / 'vga' / 'hd'.
    this._webcam = {
      device: null,
      resolution: 'vga'
    };

    // Set custom SVC scalability mode.
    if (svc) {
      VIDEO_SVC_ENCODINGS[0].scalabilityMode = svc;
      VIDEO_KSVC_ENCODINGS[0].scalabilityMode = `${svc}_KEY`;
    }
  }

  getConsumers() {
    return this._consumers;
  }

  getProducer() {
    return this._producer;
  }

  close() {
    if (this._closed)
      return;

    this._closed = true;

    logger.debug('close()');

    // Close protoo Peer
    this._protoo.close();

    // Close mediasoup Transports.
    if (this._sendTransport)
      this._sendTransport.close();

    if (this._recvTransport)
      this._recvTransport.close();

    // todo: 需要触发退出房间/关闭互动
    this.fire('exitRoom', { });
  }

  /**
   * [发布事件]
   * @param  {[type]}    event [description]
   * @param  {...[type]} args  [description]
   * @return {[type]}          [description]
   */
  fire(event, ...args) {
    setImmediate(() => {
      this.emit(event, ...args);
    });
  };

  async join() {
    // ws业务通信建立
    const protooTransport = new protooClient.WebSocketTransport(this._protooUrl);

    this._protoo = new protooClient.Peer(protooTransport);

    this._protoo.on('open', () => this._joinRoom());

    this._protoo.on('failed', () => {
    });

    this._protoo.on('disconnected', () => {
      // Close mediasoup Transports.
      if (this._sendTransport) {
        this._sendTransport.close();
        this._sendTransport = null;
      }

      if (this._recvTransport) {
        this._recvTransport.close();
        this._recvTransport = null;
      }
    });

    this._protoo.on('close', () => {
      if (this._closed)
        return;

      this.close();
    });

    this._protoo.on('request', async (request, accept, reject) => {
      logger.debug('proto "request" event [method:%s, data:%o]', request.method, request.data);

      switch (request.method) {
        case 'newConsumer':
          {
            const {
              peerId,
              producerId,
              id,
              kind,
              rtpParameters,
              type,
              appData,
              producerPaused
            } = request.data;

            let codecOptions;

            if (kind === 'audio') {
              codecOptions = {
                opusStereo: 1
              };
            }

            try {
              let consumer = await this._recvTransport.consume({
                id,
                producerId,
                kind,
                rtpParameters,
                codecOptions,
                appData: { ...appData, peerId }
              });

              // Store in the map.
              this._consumers.set(consumer.id, consumer);

              console.log('_consumers:', this._consumers);

              consumer.on('transportclose', () => {
                this._consumers.delete(consumer.id);
              });

              const { spatialLayers, temporalLayers } =
              mediasoupClient.parseScalabilityMode(consumer.rtpParameters.encodings[0].scalabilityMode);

              let data = Object.assign({}, consumer, {
                id,
                kind,
                peerId,
                type,
                // locallyPaused          : false,
                remotelyPaused         : producerPaused,
                rtpParameters          : consumer.rtpParameters,
                // spatialLayers          : spatialLayers,
                // temporalLayers         : temporalLayers,
                priority               : 1,
                codec                  : consumer.rtpParameters.codecs[0].mimeType.split('/')[1],
                track                  : consumer.track
              })

              let { share } = appData;
              let available = producerPaused ? false : true;
              if(consumer.kind === 'video') {
                 if(share) {
                  this.fire('userScreenAvailable', { uid: peerId, available: true, consumer: data });
                } else {
                  this.fire('userVideoAvailable', { uid: peerId, available, consumer: data });
                }
              } else if(consumer.kind === 'audio') {
                this.fire('userAudioAvailable', { uid: peerId, available, consumer: data });
              }

              // We are ready. Answer the protoo request so the server will
              // resume this Consumer (which was paused for now if video).
              accept();
            } catch (error) {
              logger.error('"newConsumer" request failed:%o', error);

              throw error;
            }

            break;
          }

      }
    });

    this._protoo.on('notification', (notification) => {
      // logger.debug('proto "notification" event [method:%s, data:%o]', notification.method, notification.data);

      switch (notification.method) {
        case 'producerScore': {
          const { producerId, score } = notification.data;
          break;
        }

        case 'newPeer': {
          const peer = notification.data;

          this.fire('userJoined', peer);

          logger.debug('proto "notification" event [method:%s, data:%o]', notification.method, notification.data);

          // `${peer.displayName} has joined the room`

          break;
        }

        case 'peerClosed': {
            const { peerId } = notification.data;
            this.fire('userLeaveRoom', { peerId });

            break;
          }

        // 远端创建了Producer 也就是远端开启了音频或者视频
        case 'newProducer':
          {
            logger.debug('proto "notification" event [method:%s, data:%o]', notification.method, notification.data);

            const { peerId, producerId, kind } = notification.data;

            // 合并记录到peerId中
            let producers = this._remoteProducers.get(peerId) || [];
            let producerSet = new Set(producers);
            producerSet.add({ peerId, producerId, kind });

            this._remoteProducers.set(peerId, Array.from(producerSet));

            this._protoo.request('wantConsume', { producerId, peerId });

            break;
          }

        case 'consumerClosed':
          {
            const { consumerId } = notification.data;
            const consumer = this._consumers.get(consumerId);

           logger.debug('consumerClosed', consumer);


            if (!consumer)
              break;

            consumer.close();
            this._consumers.delete(consumerId);

            const { peerId, share } = consumer.appData;
            if(consumer.kind === 'video') {
              if(share) {
                this.fire('userScreenAvailable', { uid: peerId, available: false, consumer });
              } else {
                this.fire('userVideoAvailable', { uid: peerId, available: false, consumer });
              }

              // this.fire('userVideoAvailable', { uid: peerId, available: false, consumer });
            } else if(consumer.kind === 'audio') {
              this.fire('userAudioAvailable', { uid: peerId, available: false, consumer });
            }

            break;
          }

        case 'consumerPaused':
          {
            const { consumerId } = notification.data;
            const consumer = this._consumers.get(consumerId);

            if (!consumer)
              break;

            logger.debug('consumerPaused', consumer);

            const { kind } = consumer;
            const { peerId, share } = consumer.appData;
            if(kind === 'video') {
              if(share) {
                this.fire('userScreenAvailable', { uid: peerId, available: false, consumer });
              } else {
                this.fire('userVideoAvailable', { uid: peerId, available: false, consumer });
              }
              // this.fire('userVideoAvailable', { uid: peerId, available: false, consumer });
            } else if(kind === 'audio') {
              this.fire('userAudioAvailable', { uid: peerId, available: false, consumer });
            }

            break;
          }

        case 'consumerResumed':
          {
            const { consumerId } = notification.data;
            const consumer = this._consumers.get(consumerId);

            if (!consumer)
              break;

            logger.debug('consumerResumed', consumer);

            const { kind } = consumer;
            const { peerId, share } = consumer.appData;
            if(kind === 'video') {
              if(share) {
                this.fire('userScreenAvailable', { uid: peerId, available: true, consumer });
              } else {
                this.fire('userVideoAvailable', { uid: peerId, available: true, consumer });
              }
              // this.fire('userVideoAvailable', { uid: peerId, available: true, consumer });
            } else if(kind === 'audio') {
              this.fire('userAudioAvailable', { uid: peerId, available: true, consumer });
            }

            break;
          }

        case 'consumerLayersChanged':
          {
            const { consumerId, spatialLayer, temporalLayer } = notification.data;
            const consumer = this._consumers.get(consumerId);

            if (!consumer)
              break;

            break;
          }

        case 'consumerScore':
          {
            const { consumerId, score } = notification.data;

            break;
          }

        case 'activeSpeaker':
          {
            const { peerId, volume } = notification.data;
            this.fire('activeSpeaker', { uid: peerId, volume });

            // logger.debug('activeSpeaker', notification.data);

            break;
          }

        // 权限变更
        case 'privilegeChanged': {
            const { privilege } = notification.data;
            this.fire('privilegeChanged', { privilege });

            break;
          }

        // 流被终止
        case 'shutProducer': {
            const { producerId } = notification.data;
            let kind = 'audio';

            //  根据producerId获取流类型
            if(this._micProducer && this._micProducer.id === producerId) {
              kind = this._micProducer.kind;
            }

            if(this._webcamProducer && this._webcamProducer.id === producerId) {
              kind = this._webcamProducer.kind;
            }

            // if(this._shareProducer && this._shareProducer.id === producerId) {
            //   kind = 'screenShare';
            // }

            this.fire('shutProducer', { kind });

            break;
          }

        default:
          {
            logger.error('unknown protoo notification.method "%s"', notification.method);
          }
      }
    });
  }

  // 上行指令发送
  requestProtoo(msg) {
    console.log('requestProtoo:', msg);
    this._protoo.request(msg.op, msg.data);
  }

  async enableLocalAudio() {
    logger.debug('enableLocalAudio()');

    if (this._micProducer)
      return;

    if (!this._mediasoupDevice.canProduce('audio')) {
      logger.error('enableLocalAudio() | cannot produce audio');

      return;
    }

    let track;

    try {
      if (!this._externalVideo) {
        logger.debug('enableLocalAudio() | calling getUserMedia()');

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

        track = stream.getAudioTracks()[0];
      } else {
        const stream = await this._getExternalVideoStream();

        track = stream.getAudioTracks()[0].clone();
      }

      this._micProducer = await this._sendTransport.produce({
        track,
        codecOptions: {
          opusStereo: 1,
          opusDtx: 1
        },
        appData: {
          avatar: this._avatar
        }
        // NOTE: for testing codec selection.
        // codec : this._mediasoupDevice.rtpCapabilities.codecs
        //   .find((codec) => codec.mimeType.toLowerCase() === 'audio/pcma')
      }).catch((error)=>{
        console.error('mic produce error:', error);

        return null;
      });

      let audioProduce = this._micProducer;
      if( audioProduce && audioProduce.rtpParameters && audioProduce.rtpParameters.codecs) {
        audioProduce.codec = audioProduce.rtpParameters.codecs[0].mimeType.split('/')[1];
        this._producer.set('audio', audioProduce);
      }

      console.log('_micProducer:', this._micProducer)

      this._micProducer.on('transportclose', () => {
        this._micProducer = null;
      });

      this._micProducer.on('trackended', () => {
        this.disableLocalAudio().catch(() => {});
      });
    } catch (error) {
      logger.error('enableLocalAudio() | failed:%o', error);

      if (track) track.stop();
    }
  }

  async disableLocalAudio() {
    logger.debug('disableLocalAudio()');

    if (!this._micProducer)
        return;

    this._micProducer.close();

    this._producer.set('audio', null);

    try {
      await this._protoo.request(
        'closeProducer', { producerId: this._micProducer.id });
    } catch (error) {
    }

    this._micProducer = null;
  }

  async muteMic() {
    logger.debug('muteMic()');

    this._micProducer.pause();

    try {
      await this._protoo.request('pauseProducer', { producerId: this._micProducer.id });
    } catch (error) {
      logger.error('muteMic() | failed: %o', error);
    }
  }

  async unmuteMic() {
    logger.debug('unmuteMic()');

    this._micProducer.resume();

    try {
      await this._protoo.request('resumeProducer', { producerId: this._micProducer.id });
    } catch (error) {
      logger.error('unmuteMic() | failed: %o', error);
    }
  }

  async enableWebcam() {
    logger.debug('enableWebcam()');

    if (this._webcamProducer)
      return;
    // else if (this._shareProducer)
    //   await this.disableShare();

    if (!this._mediasoupDevice.canProduce('video')) {
      logger.error('enableWebcam() | cannot produce video');

      return;
    }

    let track;
    let device;

    try {
      if (!this._externalVideo) {
        await this._updateWebcams();
        device = this._webcam.device;

        const { resolution } = this._webcam;

        if (!device)
          throw new Error('no webcam devices');

        logger.debug('enableWebcam() | calling getUserMedia()');

        // 视频约束条件
        let videoConstraints = {
          ...VIDEO_CONSTRAINS[resolution]
        };

        // 是否有置顶的设备
        if(device && device.deviceId) {
          videoConstraints.deviceId = device.deviceId;
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: videoConstraints
        });

        // const stream = await navigator.mediaDevices.getUserMedia({
        //   video: {
        //     deviceId: { exact: device.deviceId },
        //     ...VIDEO_CONSTRAINS[resolution]
        //   }
        // });

        track = stream.getVideoTracks()[0];
      } else {
        device = { label: 'external video' };

        const stream = await this._getExternalVideoStream();

        track = stream.getVideoTracks()[0].clone();
      }

      if (this._useSimulcast) {
        // If VP9 is the only available video codec then use SVC.
        const firstVideoCodec = this._mediasoupDevice
          .rtpCapabilities
          .codecs
          .find((c) => c.kind === 'video');

        let encodings;
        if (firstVideoCodec.mimeType.toLowerCase() === 'video/vp9')
          encodings = VIDEO_KSVC_ENCODINGS;
        else
          encodings = VIDEO_SIMULCAST_ENCODINGS;

        this._webcamProducer = await this._sendTransport.produce({
          track,
          encodings,
          codecOptions: {
            videoGoogleStartBitrate: 1000
          },
          appData: {
            avatar: this._avatar
          }
          // NOTE: for testing codec selection.
          // codec : this._mediasoupDevice.rtpCapabilities.codecs
          //   .find((codec) => codec.mimeType.toLowerCase() === 'video/h264')
        });
      } else {
        this._webcamProducer = await this._sendTransport.produce({ track });
      }

      let videoProduce = this._webcamProducer;
      if( videoProduce && videoProduce.rtpParameters && videoProduce.rtpParameters.codecs) {
        let codec = videoProduce.rtpParameters.codecs[0].mimeType.split('/')[1];
        videoProduce = Object.assign({}, videoProduce, {
          track,
          codec: codec,
          deviceLabel: device.label,
          type: this._getWebcamType(device)
        });

        this._producer.set('video', videoProduce);

        this.fire('localVideoAvailable', { available: true, videoProduce });
      }

      this._webcamProducer.on('transportclose', () => {
        this._webcamProducer = null;
      });

      this._webcamProducer.on('trackended', () => {
        this.disableWebcam()
          .catch(() => {});
      });
    } catch (error) {
      logger.error('enableWebcam() | failed:%o', error);

      if (track) track.stop();
    }
  }

  async disableWebcam() {
    logger.debug('disableWebcam()');

    if (!this._webcamProducer)
      return;

    this._webcamProducer.close();

    this._producer.set('video', null);
    this.fire('localVideoAvailable', { available: false, videoProduce: this._webcamProducer });

    try {
      await this._protoo.request('closeProducer', { producerId: this._webcamProducer.id });
    } catch (error) {
    }

    this._webcamProducer = null;
  }

  async changeWebcam() {
    logger.debug('changeWebcam()');

    // store.dispatch(stateActions.setWebcamInProgress(true));

    try {
      await this._updateWebcams();

      const array = Array.from(this._webcams.keys());
      const len = array.length;
      const deviceId = this._webcam.device ? this._webcam.device.deviceId : undefined;
      let idx = array.indexOf(deviceId);

      if (idx < len - 1)
          idx++;
      else
          idx = 0;

      this._webcam.device = this._webcams.get(array[idx]);

      logger.debug('changeWebcam() | new selected webcam [device:%o]', this._webcam.device);

      // Reset video resolution to HD.
      this._webcam.resolution = 'vga';

      if (!this._webcam.device)
        throw new Error('no webcam devices');

      // Closing the current video track before asking for a new one (mobiles do not like
      // having both front/back cameras open at the same time).
      this._webcamProducer.track.stop();

      logger.debug('changeWebcam() | calling getUserMedia()');

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: { exact: this._webcam.device.deviceId },
          ...VIDEO_CONSTRAINS[this._webcam.resolution]
        }
      });

      const track = stream.getVideoTracks()[0];
      await this._webcamProducer.replaceTrack({ track });

      let videoProduce = this._producer.get('video');
      if(videoProduce) {
        videoProduce.track = track;
        this._producer.set('video', videoProduce);
      }
    } catch (error) {
      logger.error('changeWebcam() | failed: %o', error);
    }
  }

  async changeWebcamResolution() {
    logger.debug('changeWebcamResolution()');

    // store.dispatch( stateActions.setWebcamInProgress(true));

    try {
      switch (this._webcam.resolution) {
        case 'qvga':
          this._webcam.resolution = 'vga';
          break;
        case 'vga':
          this._webcam.resolution = 'hd';
          break;
        case 'hd':
          this._webcam.resolution = 'qvga';
          break;
        default:
          this._webcam.resolution = 'hd';
      }

      logger.debug('changeWebcamResolution() | calling getUserMedia()');

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: { exact: this._webcam.device.deviceId },
          ...VIDEO_CONSTRAINS[this._webcam.resolution]
        }
      });

      const track = stream.getVideoTracks()[0];
      await this._webcamProducer.replaceTrack({ track });

      let videoProduce = this._producer.get('video');
      if(videoProduce) {
        videoProduce.track = track;
        this._producer.set('video', videoProduce);
      }
    } catch (error) {
      logger.error('changeWebcamResolution() | failed: %o', error);
    }

    // store.dispatch(stateActions.setWebcamInProgress(false));
  }

  async enableShare() {
    logger.debug('enableShare()');

    if (this._shareProducer)
      return;
    // else if (this._webcamProducer)
    //   await this.disableWebcam();

    if (!this._mediasoupDevice.canProduce('video')) {
      logger.error('enableShare() | cannot produce video');

      return;
    }

    let track;

    try {
      logger.debug('enableShare() | calling getUserMedia()');

      // web版本
      const stream = await navigator.mediaDevices.getDisplayMedia({
        audio: false,
        video: {
          displaySurface: 'monitor',
          logicalSurface: true,
          cursor: true,
          width: { max: 1280 },
          height: { max: 720 },
          frameRate: { max: 15 }
        }
      });

      // May mean cancelled (in some implementations).
      if (!stream) {
        return;
      }

      track = stream.getVideoTracks()[0];

      if (this._useSharingSimulcast) {
        // If VP9 is the only available video codec then use SVC.
        const firstVideoCodec = this._mediasoupDevice
          .rtpCapabilities
          .codecs
          .find((c) => c.kind === 'video');

        let encodings;

        if (firstVideoCodec.mimeType.toLowerCase() === 'video/vp9') {
          encodings = VIDEO_SVC_ENCODINGS;
        } else {
          encodings = VIDEO_SIMULCAST_ENCODINGS
            .map((encoding) => ({ ...encoding, dtx: true }));
        }

        this._shareProducer = await this._sendTransport.produce({
          track,
          encodings,
          codecOptions: {
            videoGoogleStartBitrate: 1000
          },
          appData: {
            share: true,
            avatar: this._avatar
          }
        });
      } else {
        this._shareProducer = await this._sendTransport.produce({ track });
      }

      let screenProduce = this._shareProducer;
      if( screenProduce && screenProduce.rtpParameters && screenProduce.rtpParameters.codecs) {
        let codec = screenProduce.rtpParameters.codecs[0].mimeType.split('/')[1];
        screenProduce = Object.assign({}, screenProduce, {
          codec: codec,
          type: 'share'
        });

        this._producer.set('screen', screenProduce);
        // this.fire('userSubStreamAvailable', { available: true, screenProduce: screenProduce });
      }

      this._shareProducer.on('transportclose', () => {
        this._shareProducer = null;
      });

      this._shareProducer.on('trackended', () => {
        this.disableShare()
        .catch(() => {});
      });
    } catch (error) {
      logger.error('enableShare() | failed:%o', error);

      if (error.name !== 'NotAllowedError') {
      }

      if (track) track.stop();
    }
  }

  async disableShare() {
    logger.debug('disableShare()');

    if (!this._shareProducer)
      return;

    this._shareProducer.close();

    this._producer.set('screen', null);

    try {
      await this._protoo.request('closeProducer', { producerId: this._shareProducer.id });
      this.fire('userSubStreamAvailable', { available: false, screenProduce: this._shareProducer });
    } catch (error) {
    }

    this._shareProducer = null;
  }

  async enableAudioOnly() {
    logger.debug('enableAudioOnly()');

    this.disableWebcam();

    for (const consumer of this._consumers.values()) {
      if (consumer.kind !== 'video')
        continue;

      this._pauseConsumer(consumer);
    }
  }

  async disableAudioOnly() {
    logger.debug('disableAudioOnly()');

    if (
      !this._webcamProducer &&
      this._produce
    ) {
      this.enableWebcam();
    }

    for (const consumer of this._consumers.values()) {
      if (consumer.kind !== 'video')
        continue;

      this._resumeConsumer(consumer);
    }
  }

  async restartIce() {
    logger.debug('restartIce()');

    try {
      if (this._sendTransport) {
        const iceParameters = await this._protoo.request('restartIce', { transportId: this._sendTransport.id });

        await this._sendTransport.restartIce({ iceParameters });
      }

      if (this._recvTransport) {
        const iceParameters = await this._protoo.request('restartIce', { transportId: this._recvTransport.id });

        await this._recvTransport.restartIce({ iceParameters });
      }
    } catch (error) {
      logger.error('restartIce() | failed:%o', error);
    }
  }

  async setMaxSendingSpatialLayer(spatialLayer) {
    logger.debug('setMaxSendingSpatialLayer() [spatialLayer:%s]', spatialLayer);

    try {
      if (this._webcamProducer)
        await this._webcamProducer.setMaxSpatialLayer(spatialLayer);
      else if (this._shareProducer)
        await this._shareProducer.setMaxSpatialLayer(spatialLayer);
    } catch (error) {
      logger.error('setMaxSendingSpatialLayer() | failed:%o', error);
    }
  }

  async setConsumerPreferredLayers(consumerId, spatialLayer, temporalLayer) {
    logger.debug(
        'setConsumerPreferredLayers() [consumerId:%s, spatialLayer:%s, temporalLayer:%s]',
        consumerId, spatialLayer, temporalLayer);

    try {
      await this._protoo.request('setConsumerPreferredLayers', { consumerId, spatialLayer, temporalLayer });
    } catch (error) {
      logger.error('setConsumerPreferredLayers() | failed:%o', error);
    }
  }

  async setConsumerPriority(consumerId, priority) {
    logger.debug('setConsumerPriority() [consumerId:%s, priority:%d]', consumerId, priority);

    try {
      await this._protoo.request('setConsumerPriority', { consumerId, priority });
    } catch (error) {
      logger.error('setConsumerPriority() | failed:%o', error);
    }
  }

  async requestConsumerKeyFrame(consumerId) {
    logger.debug('requestConsumerKeyFrame() [consumerId:%s]', consumerId);

    try {
      await this._protoo.request('requestConsumerKeyFrame', { consumerId });
    } catch (error) {
      logger.error('requestConsumerKeyFrame() | failed:%o', error);
    }
  }


  async getSendTransportRemoteStats() {
    logger.debug('getSendTransportRemoteStats()');

    if (!this._sendTransport)
      return;

    return this._protoo.request('getTransportStats', { transportId: this._sendTransport.id });
  }

  async getRecvTransportRemoteStats() {
    logger.debug('getRecvTransportRemoteStats()');

    if (!this._recvTransport)
      return;

    return this._protoo.request('getTransportStats', { transportId: this._recvTransport.id });
  }

  async getAudioRemoteStats() {
    logger.debug('getAudioRemoteStats()');

    if (!this._micProducer)
      return;

    return this._protoo.request('getProducerStats', { producerId: this._micProducer.id });
  }

  async getVideoRemoteStats() {
    logger.debug('getVideoRemoteStats()');

    const producer = this._webcamProducer || this._shareProducer;

    if (!producer)
      return;

    return this._protoo.request('getProducerStats', { producerId: producer.id });
  }

  async getConsumerRemoteStats(consumerId) {
    logger.debug('getConsumerRemoteStats()');

    const consumer = this._consumers.get(consumerId);

    if (!consumer)
      return;

    return this._protoo.request('getConsumerStats', { consumerId });
  }

  async getSendTransportLocalStats() {
    logger.debug('getSendTransportLocalStats()');

    if (!this._sendTransport) return;

    return this._sendTransport.getStats();
  }

  async getRecvTransportLocalStats() {
      logger.debug('getRecvTransportLocalStats()');

      if (!this._recvTransport)
          return;

      return this._recvTransport.getStats();
  }

  async getAudioLocalStats() {
      logger.debug('getAudioLocalStats()');

      if (!this._micProducer)
          return;

      return this._micProducer.getStats();
  }

  async getVideoLocalStats() {
      logger.debug('getVideoLocalStats()');

      const producer = this._webcamProducer || this._shareProducer;

      if (!producer)
          return;

      return producer.getStats();
  }

  async getConsumerLocalStats(consumerId) {
      const consumer = this._consumers.get(consumerId);

      if (!consumer)
          return;

      return consumer.getStats();
  }

  async _joinRoom() {
    logger.debug('_joinRoom()', this._handlerName);

    try {
      // 1、设置设备
      this._mediasoupDevice = new mediasoupClient.Device({
        handlerName: this._handlerName
      });

      // 2、RTP功能加载设备
      const routerRtpCapabilities = await this._protoo.request('getRouterRtpCapabilities');
      console.info('routerRtpCapabilities:', routerRtpCapabilities)
      await this._mediasoupDevice.load({ routerRtpCapabilities });

      // NOTE: Stuff to play remote audios due to browsers' new autoplay policy.
      //
      // Just get access to the mic and DO NOT close the mic track for a while.
      // Super hack!
      {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const audioTrack = stream.getAudioTracks()[0];
        audioTrack.enabled = false;

        setTimeout(() => audioTrack.stop(), 120000);
      }

      // 3、创建Transport
      let transportInfo = await this._protoo.request('createWebRtcTransport', {
        forceTcp: this._forceTcp,
        producing: true,
        consuming: false,
        sctpCapabilities: undefined
      });

      console.info('transportInfo:', transportInfo)

      // rtc协议
      let {
        id,
        iceParameters,
        iceCandidates,
        dtlsParameters,
        sctpParameters
      } = transportInfo;

      this._sendTransport = this._mediasoupDevice.createSendTransport({
        id,
        iceParameters,
        iceCandidates,
        dtlsParameters,
        sctpParameters,
        iceServers: [],
        proprietaryConstraints: PC_PROPRIETARY_CONSTRAINTS
      });

      this._sendTransport.on('connect', ({ dtlsParameters }, callback, errback) => {
        this._protoo.request('connectWebRtcTransport', {
          transportId: this._sendTransport.id,
          dtlsParameters
        })
        .then(callback)
        .catch(errback);

        // 本地用户加入成功
        // this.fire('joinedChannel', { code: 1});
      });

      this._sendTransport.on('produce', async ({ kind, rtpParameters, appData }, callback, errback) => {
        try {
          const { id } = await this._protoo.request('produce', {
            transportId: this._sendTransport.id,
            kind,
            rtpParameters,
            appData
          });

          callback({ id });
        } catch (error) {
          errback(error);
        }
      });

      // 接收transport
      {
        let transportInfo = await this._protoo.request(
          'createWebRtcTransport',
          {
            forceTcp         : this._forceTcp,
            producing        : false,
            consuming        : true,
            sctpCapabilities : undefined
          });

        let {
          id,
          iceParameters,
          iceCandidates,
          dtlsParameters,
          sctpParameters
        } = transportInfo;

        this._recvTransport = this._mediasoupDevice.createRecvTransport({
          id,
          iceParameters,
          iceCandidates,
          dtlsParameters,
          sctpParameters,
          iceServers: []
        });

        this._recvTransport.on('connect', ({ dtlsParameters }, callback, errback) =>
          {
            this._protoo.request('connectWebRtcTransport', {
              transportId: this._recvTransport.id,
              dtlsParameters
            })
            .then(callback)
            .catch(errback);
          });
      }

      // Join now into the room.
      // NOTE: Don't send our RTP capabilities if we don't want to consume.
      const { peers } = await this._protoo.request('join', {
        displayName: this._displayName,
        avatar: this._avatar,
        device: this._device,
        rtpCapabilities: this._mediasoupDevice.rtpCapabilities,
        sctpCapabilities: this._mediasoupDevice.sctpCapabilities
      });

      // 本地用户加入成功
      this.fire('joinedChannel', { code: 1});

      console.log('peers:', peers);

      for (const peer of peers) {
        console.log('peer:', peer);

        this.fire('userJoined', peer);

        /*
        producers: [ {
          id: String, // producer 的 producerId
          kind: String // 类型，"audio" 或 "video"
        } ]
        */
        if(peer.producers) {
          console.log('joined producers:', peer.producers);

          // 合并记录到peerId中
          let producers = [];
          peer.producers.forEach((producer)=>{
            producers.push({
              peerId: peer.id,
              producerId: producer.id,
              kind: producer.kind,
              // autoPub: peer.autoPub
            })

            // 需要订阅音频
            if(producer.kind === 'audio' && peer.autoPub && !peer.autoPub.autoPubAudio) {
              this._protoo.request('wantConsume', { producerId: producer.id, peerId: peer.id });
            }

            // 需要订阅视频
            if(producer.kind === 'video' && peer.autoPub && !peer.autoPub.autoPubVideo) {
              this._protoo.request('wantConsume', { producerId: producer.id, peerId: peer.id });
            }
          })

          this._remoteProducers.set(peer.id, producers);
        }
      }


      // Enable mic/webcam.
      // TODO：检测麦克 摄像头
    } catch (error) {
      logger.error('_joinRoom() failed:%o', error);

      this.close();
    }
  }

  async _updateWebcams() {
    logger.debug('_updateWebcams()');

    // Reset the list.
    this._webcams = new Map();

    logger.debug('_updateWebcams() | calling enumerateDevices()');

    const devices = await navigator.mediaDevices.enumerateDevices();

    for (const device of devices) {
      if (device.kind !== 'videoinput')
        continue;

      this._webcams.set(device.deviceId, device);
    }

    const array = Array.from(this._webcams.values());
    const len = array.length;
    const currentWebcamId = this._webcam.device ? this._webcam.device.deviceId : undefined;

    logger.debug('_updateWebcams() [webcams:%o]', array);

    if (len === 0)
      this._webcam.device = null;
    else if (!this._webcams.has(currentWebcamId))
      this._webcam.device = array[0];

    // store.dispatch(stateActions.setCanChangeWebcam(this._webcams.size > 1));
  }

  _getWebcamType(device) {
    if (/(back|rear)/i.test(device.label)) {
      logger.debug('_getWebcamType() | it seems to be a back camera');

      return 'back';
    } else {
      logger.debug('_getWebcamType() | it seems to be a front camera');

      return 'front';
    }
  }

  async _pauseConsumer(consumer) {
    if (consumer.paused) return;

    try {
      await this._protoo.request('pauseConsumer', { consumerId: consumer.id });

      consumer.pause();

      // store.dispatch(
      //     stateActions.setConsumerPaused(consumer.id, 'local'));
    } catch (error) {
      logger.error('_pauseConsumer() | failed:%o', error);
    }
  }

  async _resumeConsumer(consumer) {
    if (!consumer.paused) return;

    try {
      await this._protoo.request('resumeConsumer', { consumerId: consumer.id });

      consumer.resume();

      // store.dispatch(stateActions.setConsumerResumed(consumer.id, 'local'));
    } catch (error) {
      logger.error('_resumeConsumer() | failed:%o', error);
    }
  }

  async _getExternalVideoStream() {
    if (this._externalVideoStream)
      return this._externalVideoStream;

    if (this._externalVideo.readyState < 3) {
      await new Promise((resolve) => (
        this._externalVideo.addEventListener('canplay', resolve)
      ));
    }

    if (this._externalVideo.captureStream)
      this._externalVideoStream = this._externalVideo.captureStream();
    else if (this._externalVideo.mozCaptureStream)
      this._externalVideoStream = this._externalVideo.mozCaptureStream();
    else
      throw new Error('video.captureStream() not supported');

    return this._externalVideoStream;
  }
}

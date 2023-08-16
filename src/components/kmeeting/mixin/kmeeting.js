let videoEncoderConfigs = new Map([
    ["vga", {
        width: 640,
        height: 480,
        frameRate: 15,
        bitrateMax: 1000,
        bitrateMin: 100
    }],
    ["vga1", {
        width: 640,
        height: 480,
        frameRate: 15,
        bitrateMax: 800,
        bitrateMin: 100
    }],
    ["qvga", {
        width: 320,
        height: 240,
        frameRate: 15,
        bitrateMax: 200,
        bitrateMin: 50
    }],
    ["hd", {
        width: 1280,
        height: 720,
        frameRate: 15,
        bitrateMax: 1200,
        bitrateMin: 500
    }],
    ["1080p", {
        width: 1920,
        height: 1080,
        frameRate: 15,
        bitrateMax: 2000,
        bitrateMin: 600
    }]
])

let meetingMixin = {
  data() {
    return {
      localMediaStream: null,
      localAudioTrack: null,
      localVideoTrack: null,
      localScreenAudioTrack: null,
      localScreenVideoTrack: null,
      isJoining: false,
      client: null,
      options: null,
      microphoneList: [],
      cameraList: [],
      speakerList: [],
      microphoneSelect: null,
      cameraSelect: null,
      speakerSelect: null,
      supportH264: false,
    }
  },
  watch: {
    // 正常说话列表
    speakers(newVal) {
        let activeSpeakers = [];
        // 开课老师
        let teacher = this.teacher;
        // 开课老师或者自己 (Id类型太乱统一转成字符串处理)
        const teacherAndMeIds = [ String(teacher.identityId), String(teacher.userId), String(this.local) ];
        if(newVal && newVal.length) {
          newVal.forEach((member)=>{
            if(teacherAndMeIds.includes(String(member.id))) {
              activeSpeakers.push(member);
            } else if(member.audio || member.video) {
              activeSpeakers.push(member);
            }
          })
  
          // 然后根据音量排序
          activeSpeakers = activeSpeakers.sort((a, b) => { return b.audio - a.audio; })
          // this.activeSpeakers = activeSpeakers;
          this.setActiveSpeakers(activeSpeakers);
        }
      },

      'kmeeting.audio'(newVal) {
        this.setAudioLocal(newVal);
      },

      'kmeeting.video'(newVal) {
        this.setVideoLocal(newVal);
      },

      'kmeeting.joined'(newVal) {
        if(!newVal) {
          this.handleHangup();
        }
      }
  },

  methods: {
    /**
     * @method 初始化
     * @param {*} data 
     */
    async initMeeting(data) {
      this.options = data
      this.getDevice("all");
      let supportedCodec = await KRTC.getSupportedCodec();
      this.isJoining = false;
      if (Array.isArray(supportedCodec.video) && supportedCodec.video.includes("H264")) {
        console.log("init engine system support 264");
        this.supportH264 = true;
      }
      this.client = KRTC.createClient({
        mode: "rtc",
        codec: "H264"
      });

      // 音频采集设备状态变化回调：该回调提示有麦克风被添加或移除。
      KRTC.onMicrophoneChanged = (deviceInfo) => {
        console.log(`microphone state is changed label:${deviceInfo.device.label} state:${deviceInfo.state}`);
        this.onDeviceChanged(this.microphoneSelect, deviceInfo);
      };

      // 视频采集设备状态变化回调：该回调提示有摄像头被添加或移除。
      KRTC.onCameraChanged = (deviceInfo) => {
        console.log(`camera state is changed label:${deviceInfo.device.label} state:${deviceInfo.state}`);
        this.onDeviceChanged(this.cameraSelect, deviceInfo);
      };

      // 音频播放设备状态变化回调：该回调提示有音频播放设备被添加或移除。
      KRTC.onPlaybackDeviceChanged = (deviceInfo) => {
        console.log(`playback state is changed label:${deviceInfo.device.label} state:${deviceInfo.state}`);
        this.onDeviceChanged(this.speakerSelect, deviceInfo);
      };

      // 音频默认播放设备状态变化回调： 该回调提示有音频播放设备被添加或移除。
      KRTC.onDefaultSpeakerChanged = async (deviceInfo) => {
        console.log(`default speaker state is changed label:${deviceInfo.device.label} state:${deviceInfo.state}`);
      };

      // 音频默认采集设备状态变化回调。 该回调提示有音频播放设备被添加或移除。
      KRTC.onDefaultMicrophoneChanged = async (deviceInfo) => {
        console.log(`default microphone is changed label:${deviceInfo.device.label} state:${deviceInfo.state}`)
      };

      //  音频通讯播放设备状态变化回调。 该回调提示有音频播放设备被添加或移除。
      KRTC.onCommunicationSpeakerChanged = (deviceInfo) => {
        console.log(`communication speaker is changed label:${deviceInfo.device.label} state:${deviceInfo.state}`);
      };

      //   音频通讯播放设备状态变化回调。 该回调提示有音频播放设备被添加或移除。
      KRTC.onCommunicationMicrophoneChanged = (deviceInfo) => {
        console.log(`communication microphone is changed label:${deviceInfo.device.label} state:${deviceInfo.state}`);
      };

      this.inited = true

      setTimeout(() => {
        this.joinRoom()
      }, 1000)
    },

    /**
     * @method 加入房间
     * @returns 
     */
    joinRoom() {
      if (!this.inited) {
        return
      }

      if (this.isJoining) {
        console.log(`user has joined or is joining`);
        return;
      }
      this.isJoining = true;

      this.client.on("user-published", this.onUserPublished);
      this.client.on("user-unpublished", this.onUserUnpublish);
      this.client.on("user-joined", this.onUserJoined);
      this.client.on("user-left", this.onUserLeft);
      this.client.on("connection-state-change", this.onConnectionStateChange);
      this.client.on("content-published", this.onContentPublish);
      this.client.on("content-unpublished", this.onContentUnpublish);
      this.client.on("content-kicked-off", this.onContentKickOff);
      this.client.on("network-quality", this.onNetworkQualityUpdate);

      this.client.join(this.options.appId, this.kmeeting.roomid, this.options.appToken, this.user.id).then((uid) => {
        this.isJoined = true;
        console.log(`userId:${this.user.id} join channel:${this.kmeeting.roomid} success`);
        console.log(`${this.user.id} join channel:${this.kmeeting.roomid} success`);

        // 本地用户进入是否打开音视频
        let { audio, video, active } = this.kmeeting;
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

        this.publish()

        let kmeeting = this.kmeeting
        kmeeting.status = 3
        kmeeting.joined = true
        this.setKMeeting(kmeeting)
        this.setJoined(true)
      }).catch((err) => {
        this.stop();
        console.log(`userId:${this.user.id} join channel:${this.kmeeting.roomid} fail ${err}`);
        console.log(`${this.user.id} join channel:${this.kmeeting.roomid} fail`);
      });
      this.client.on("active-track", this.onActiveTrack);
      this.client.on("error", (event) => {
        console.log(event.msg);
      });
    },

    /**
     * @method 远端用户发布音视频
     * @param {*} user 
     * @param {*} mediaType 
     */
    onUserPublished(user, mediaType) {
      console.log("user-published", user.uid, mediaType);
      this.client.subscribe(user, mediaType).then((track) => {
        console.log(`subscribe userId:${user.uid} mediaType:${mediaType} success`);
        this.updateUserStatus(user.uid, mediaType, true, track)

        setTimeout(() => {
            if (mediaType === "audio") {
                track.play();
              } else {
                this.addRemoteVideoTrack(track);
              }
      
        }, 1000)
        
        track.on("player-state-changed", (event) => {
          console.log(`player-state-changed uid:${user.uid}, mediaType:${mediaType} remotetrack player is ${event.state} because of ${event.reason}`);
        })
      }).catch((error) => {
        console.log(`subscribe errror:${error}`);
      });
    },

    /**
     * @method 远端用户停止发布音视频
     * @param {*} user 
     * @param {*} mediaType 
     */
    onUserUnpublish(user, mediaType) {
      console.log("user-unpublish", user.uid, mediaType);
      console.log(`onUserUnpublish userId`, user.uid, " mediaType:", mediaType);
      this.client.unsubscribe(user, mediaType).then(() => {
        console.log(`unsubscribe userId:${user.uid} mediaType:${mediaType} success`);
        if (mediaType === "video") {
          this.removeRemoteVideoTrack(user.uid, "people");
        }
        if (mediaType === "audio") {

        }

        this.updateUserStatus(user.uid, mediaType, false)
      }).catch((e) => {
        console.log(`unsubscribe userId:${user.uid} mediaType:${mediaType} fail err:${e}`);
      });
    },

    /**
     * @method 远端用户加入
     */
    onUserJoined(user) {
      console.log("user-joined", user,  user.uid);
      let {identityId, name: teacherName, avatar: teacherAvatar } = this.teacher || {}
      let name = identityId == user.uid ? teacherName : '';
      let avatar = identityId == user.uid ? teacherAvatar : "http://wx.qlogo.cn/mmopen/OUicWJdJoz3HNVF1oYxOQYibUZicpTD55udhicFPk9RBUuicwxiahv5nUJBx7MZPbl7tTkeZRlptRuhhMpaPNPxyplWQ/96";
      let role = identityId == user.uid ? 'teacher' : 'student';
      let joinUser = {
        id: user.uid,
        uid: user.uid,
        name,
        avatar,
        role,
        audio: user.hasAudio,
        video: user.hasVideo,
        active: false,
        subscribe: false,
        offline: false,
        hasAudio: user.hasAudio,
        hasVideo: user.hasVideo
      };

      this.joinUser(joinUser);

      this.subScribe_(user.uid, this.liveType == 2 ? 'av' : 'audio')

      this.getVCUsers()
    },

    /**
     * @method 远端用户离开
     */
    onUserLeft(user) {
      console.log("user-left", user.uid);
      // 移除发言列表中用户
      let speakers = this.speakers;
      let index = speakers.findIndex((speaker) => {
        return user.uid == speaker.uid;
      })

      // 存在用户
      if (~index) {
        speakers.splice(index, 1);
        this.setSpeakers(speakers);
      }
      if (user.audioTrack) {
        user.audioTrack.stop();
      }
    },

    /**
     * @method SDK 与服务器的连接状态发生改变回调。
     */
    onConnectionStateChange(curState, revState, reason) {
      console.log(`onConnectionStateChange curState:${curState} revState:${revState} reason:${reason}`);
      if (curState === "disconnected") {
        this.stop();
        this.closeDevice();
        if (reason === "uid_banned") {
          console.log(`${this.user.id} is kicked out`);
        }
      }
    },

    // 远端用户屏幕共享
    onContentPublish(track, mediaType) {
      console.log(`onContentPublish user:${track.getUserId()} mediaType:${mediaType}`);
      track.on("player-state-changed", (event) => {
        console.log(`player-state-changed content mediaType:${mediaType} remotetrack player is ${event.state} because of ${event.reason}`);
      })
      if (mediaType === "audio") {
        this.contentAudioTrack = track;
        this.contentAudioTrack.play();
      } else {
        let kmeeting = this.kmeeting;
        kmeeting.otherscreen = true;

        if (track.getUserId()) {
          let user = this.speakers.find((user) => {
            return user.id == track.getUserId();
          })

          kmeeting.shareName = user && user.name
        }

        this.setKMeeting(kmeeting);

        this.addRemoteVideoTrack(track, true);
      }
    },

    /**
     * @method 远端用户停止屏幕共享
     * @param {*} userId 
     * @param {*} mediaType 
     */
    onContentUnpublish(userId, mediaType) {
      console.log(`onContentUnpublish mediaType:${mediaType}`);
      if (mediaType === "video") {
        this.removeRemoteVideoTrack(userId, "content");
      }
      if (mediaType === "audio") {
        this.contentAudioTrack = undefined;
      }
    },

    onContentKickOff(reason) {
      console.log(`onContentKickedOff reason:${reason}`);
      if (this.localScreenAudioTrack) {
        this.localScreenAudioTrack.close();
        this.localScreenAudioTrack = null;
      }
      if (this.localScreenVideoTrack) {
        this.removeScreenDisplayElement();
        this.localScreenVideoTrack.close();
        this.localScreenVideoTrack = null;
      }
    },

    onNetworkQualityUpdate(state) {
      console.log(`local network quality rx：`, state.downlinkNetworkQuality);
      console.log(`local network quality tx：`, state.uplinkNetworkQuality);
      this.downlinkNetworkQuality = state.downlinkNetworkQuality;
      this.uplinkNetworkQuality = state.uplinkNetworkQuality;
    },

    onActiveTrack(activeTrack) {
      console.log(`onActiveTrack`, activeTrack);
      this.activeTrack = activeTrack;
      this.activeTrack.play();
      this.activeTrackTimerId = setInterval(() => {
        let volumes = this.activeTrack.getVolumeLevels();
        console.log(`onActiveTrack volumes`, volumes);
      }, 2000);
    },

    stop() {
      this.isJoining = false;
      this.uplinkNetworkQuality = 0;
      this.downlinkNetworkQuality = 0;
    //   this.debugInfoText.value = "";
      this.client.off("user-published", this.onUserPublished);
      this.client.off("user-unpublished", this.onUserUnpublish);
      this.client.off("user-joined", this.onUserJoined);
      this.client.off("user-left", this.onUserLeft);
      this.client.off("connection-state-change", this.onConnectionStateChange);
      this.client.off("content-published", this.onContentPublish);
      this.client.off("content-unpublished", this.onContentUnpublish);
      this.client.off("active-track", this.onActiveTrack);
      this.client.off("network-quality", this.onNetworkQualityUpdate);
    //   this.remoteUsers.forEach((user, userId) => {
    //     this.removeRemoteVideoTrack(userId, "people");
    //     this.removeRemoteVideoTrack(userId, "content");
    //   });
    //   this.remoteUsers.clear();
      this.isJoined = false;
    //   this.liveStreaming.innerHTML = "start live";
      this._updateDebugInfoInterval && window.clearInterval(this._updateDebugInfoInterval);
      this._updateDebugInfoInterval = null;
    },


    async getDevice(type) {
      let devices = [];
      try {
        switch (type) {
          case 'all':
            devices = await KRTC.getDevices()
            break;

          case "microphone":
            devices = await KRTC.getMicrophones();
            break;
          case "speaker":
            devices = await KRTC.getPlaybackDevices();
            break;
          case "camera":
            devices = await KRTC.getCameras();
            break;
        }

        devices.forEach(device => {
          switch (device.kind) {
            case 'audioinput':
              this.microphoneList.push(device);
              break;
            case 'videoinput':
              this.cameraList.push(device);
              break;
            case 'audiooutput':
              this.speakerList.push(device);
              break;
          }
        })

        this.cameraSelect = this.cameraList[0]
        this.microphoneSelect = this.microphoneList[0]
        this.speakerSelect = this.speakerList[0]
      } catch (error) {

      }
    },

    onDeviceChanged(devicesArr, deviceInfo) {
      let index = devicesArr.findIndex(device => device.deviceId == deviceInfo.device.deviceId)
      if (~index) {
        devicesArr.splice(index, 1)
      } else {
        devicesArr.push(deviceInfo.device)
      }
    },

    addRemoteVideoTrack(videoTrack, isScreen) {
      console.log(`addRemoteVideoTrack`, videoTrack);
      if (!videoTrack) {
        return;
      }
      let userId = videoTrack.getUserId();
      let sourceType = videoTrack.getSourceType();
      console.log(`addRemoteStream streamId`, userId);
      let fit = sourceType === "people" ? "cover" : "contain";
      let controls = sourceType === "people" ? false : true;

      let remoteVideoElement = isScreen ? document.querySelector(`#J_screenshare`) :  document.querySelector(`#uid-${userId}`)

      try {
        videoTrack.play(remoteVideoElement, {
          mirror: false,
          fit: fit,
          controls: controls
        });
      } catch (error) {
        console.log(`play errror:${error}`);
      }
    },

    removeRemoteVideoTrack(userId, sourceType) {
      console.log(`removeRemoteVideoTrack userId:`, userId);
      if(sourceType == 'content') {
        let kmeeting = this.kmeeting
        kmeeting.otherscreen = false
        this.setKMeeting(kmeeting)
      } else {
        // 修改活跃用户的摄像头状态
        let speakers = this.speakers
        let index = speakers.findIndex(user => user.id == userId)

        if (~index) {
          let user = speakers[index];
          Object.assign(user, {
            video: false
          })

          speakers.splice(index, 1, user);
        }

        this.setSpeakers(speakers)
      }
    },


    joinUser(data) {
      let speakers = this.speakers;
      let index = speakers.findIndex(user => user.id == data.uid)
      if(!~index) {
        let {
            uid,
            name,
            avatar,
            role,
            video,
            audio,
            hasAudio,
            hasVideo,
            subscribe = false,
            offline = false
          } = data;
    
          let user = {
            id: uid,
            uid,
            name,
            avatar,
            role,
            video,
            audio,
            active: false,
            subscribe,
            offline,
            hasAudio,
            hasVideo,
          };
    
          // 开课老师
          const teacher = this.teacher;
          // 开课老师或者自己 (Id类型太乱统一转成字符串处理)
          const teacherIds = [String(teacher.identityId), String(teacher.userId)];
    
          // 开课老师放在最前面 'lecturer' || 'collaborator'
          if (teacherIds.includes(String(user.id))) {
            speakers.unshift(user);
          } else {
            speakers.push(user);
          }
    
          this.setSpeakers(speakers);
      }
      
    },

    /**
     * @method 更新用户音视频状态
     * @param {*} user 
     * @param {*} deviceType 
     * @param {*} status 
     */
    updateUserStatus(uid, deviceType, status) {
      let speakers = this.speakers;

      let index = speakers.findIndex((user) => {
        return user.id == uid;
      })

      if (~index) {
        let user = speakers[index]
        user[deviceType] = status

        speakers.splice(index, 1, user);
      }

      this.setSpeakers(speakers)
    },

    subScribe_(uid, mediaType) {
        let remoteUser = this.speakers.find(user => user.id == uid);
        if (!remoteUser) {
            console.log(`subscribe user is not in channel`);
            return;
        }
        if ((mediaType === "audio" && remoteUser.audio) || (mediaType === "video" && remoteUser.video)) {
            this.client.subscribe(remoteUser, mediaType).then((track) => {
                console.log(`subscribe userId:${remoteUser.uid} mediaType:${mediaType} success`);
                if (mediaType === "audio") {
                    track.play();
                } else {
                    this.addRemoteVideoTrack(track);
                }
            }).catch(e => console.log(`subscribe userId:${uid} mediaType:${mediaType} error:${e}`));
        } else if (mediaType === "av") {
            this.subScribe_(uid, "audio");
            this.subScribe_(uid, "video");
        } else {
            console.log(`subscribe userId:${remoteUser.uid} mediaType:${mediaType} user does not has ${mediaType}`);
        }
    },

    async setAudioLocal(audio) {
        let tracks = null
        if(!this.localAudioTrack) {
          await this.openDevice('audio')
        }

        tracks = this.localAudioTrack

        // if(audio) {
        //   this.client.publish(tracks).then(() => {
        //     console.log(`publish audio track success`)
        //   })
        // } else {
        //   this.client.unpublish(tracks).then(() => {
        //     console.log(`unpublish audio track success`)
        //   })
        // }

        this.localAudioTrack.setEnabled(audio)
        
        this.updateUserStatus(window.user.identityId, 'audio', audio)
        
    },

    async setVideoLocal(video) {
      let tracks = null
      if(!this.localVideoTrack) {
        await this.openDevice('video')
      }

      tracks = this.localVideoTrack

      // if(video) {
      //   this.client.publish(tracks).then(() => {
      //     console.log(`publish video track success`)
      //   })
      // } else {
      //   this.client.unpublish(tracks).then(() => {
      //     console.log(`unpublish video track success`)
      //   })
      // }

      this.localVideoTrack.setEnabled(video)
      this.updateUserStatus(window.user.identityId, 'video', video)
    },



    async openDevice(type) {
        let audioConfig = {
            deviceId: this.microphoneSelect.deviceId,
            AEC: true,
            ANS: true,
            AGC: true,
        };

        let videoEncoderConfig = videoEncoderConfigs.get('1080p');
        let videoConfig = {
            encoderConfig: videoEncoderConfig,
            deviceId: this.cameraSelect.deviceId
        };

        this.localVideoView = document.querySelector(`#uid-${window.user.identityId}`)

        try {
            if (this.localAudioTrack === null && this.localVideoTrack === null && type == 'av') {
                [this.localAudioTrack, this.localVideoTrack] = await KRTC.createMicrophoneAndCameraTracks(audioConfig, videoConfig);
                // this.localAudioTrack.play();
                if (true) {
                    try{
                        await this.localVideoTrack.setBeautyEffect(true);
                    }catch(error){
                        console.log(`set beautyEffect error:${error}`);
                    }
                }
                this.localVideoTrack.setOptimizationMode('motion');
                this.localVideoView && this.localVideoTrack.play(this.localVideoView, { mirror: true });
                // this.beautySelect.removeAttribute('disabled');
            } else {
                if (this.localAudioTrack === null && type == 'audio') {
                    this.localAudioTrack = await KRTC.createMicrophoneAudioTrack(audioConfig);
                    
                }
    
                if (this.localVideoTrack === null && type == 'video') {
                    this.localVideoTrack = await KRTC.createCameraVideoTrack(videoConfig);
                    if (true) {
                        try{
                            await this.localVideoTrack.setBeautyEffect(true);
                        }catch(error){
                            console.log(`set beautyEffect error:${error}`);
                        }
                    }
                    this.localVideoTrack.setOptimizationMode('motion');
                    this.localVideoView && this.localVideoTrack.play(this.localVideoView, { mirror: true });
                    // this.beautySelect.removeAttribute('disabled');
                }
            }
            this.localVideoTrack && this.localVideoTrack.on("player-state-changed", (event)=>{
                console.log(`localVideo player player-state-changed is ${event.state} because of ${event.reason}`);
            })
            this.localAudioTrack && this.localAudioTrack.on("player-state-changed", (event)=>{
                console.log(`localAudio player player-state-changed is ${event.state} because of ${event.reason}`);
            })
        } catch (error) {
            console.log(`openDevice error`);
            throw error;
        }
    },

    async handleHangup() {
      try {
        this.isJoining = false
        this.unpublish()
        await this.client.leave()
        console.log(`user:${this.user.id} leave channel:${this.kmeeting.roomid} success`);
      } catch (error) {
        
      }

      this.stop();
      this.closeDevice();
      
      let kmeeting = this.kmeeting
      kmeeting.status = 0
      this.setKMeeting(kmeeting)

    },

    closeDevice() {
      if (this.localAudioTrack) {
        this.localAudioTrack.close();
        this.localAudioTrack = null;
      }
      if (this.localVideoTrack) {
          this.localVideoTrack.close();
          this.localVideoTrack = null;
      }
      if (this.localScreenVideoTrack) {
          this.removeScreenDisplayElement();
          this.localScreenVideoTrack.close();
          this.localScreenVideoTrack = null;
      }
      if (this.localScreenAudioTrack) {
          this.localScreenAudioTrack.close();
          this.localScreenAudioTrack = null;
      }
      this.activeTrack = null;
      this.activeTrackTimerId && clearInterval(this.activeTrackTimerId);
      console.log(`close devices end`);
    },

    async publish() {
      let tracks = null;

      try {
        await this.openDevice(this.liveType == 2 ? 'av' : 'audio')
        tracks = this.liveType == 2 ? [this.localAudioTrack, this.localVideoTrack] : this.localAudioTrack
      } catch (error) {
        
      }

      this.client.publish(tracks).then(() => {
        console.log('publish video&audio track success')
        this.localVideoView = document.querySelector(`#uid-${window.user.identityId}`)
        this.liveType == 2 && this.localVideoView && this.localVideoTrack.play(this.localVideoView, { mirror: false, controls:true });
      })
    },

    unpublish() {
      let tracks = this.liveType == 2 ? [this.localAudioTrack, this.localVideoTrack] : this.localAudioTrack
      this.client.unpublish(tracks).then(() => {
        console.log('unpublish video&audio track success')
      })
    },


    /**
     * @method 获取已经连麦的用户信息
     */
    getVCUsers() {
      let str = JSON.stringify({
        'op': 'getvcusers',
        'lessonid': this.lesson && this.lesson.lessonID
      })

      this.$parent.socket.send(str)
    }

  },
}

export default meetingMixin;

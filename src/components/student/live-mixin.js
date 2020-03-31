/*
 * 学生接收器 直播处理
 * @author: chenzhou
 * @update: 2018.8.29
 * @desc 加载hls hls处理 播放操作控制
 *
 */

 import { isSupported } from '@/util/util'
 // import flvjs from 'flv.js/dist/flv.min'
 import '@/util/flv.min'


let liveMixin = {
  methods: {
    /*
    * @method 加载hls库
    *
    */
    loadHLS(canplay) {
      let self = this;

      require(['hls.js',], function(Hls) {
        self.Hls = Hls;

        if(self.liveType === 1 || canplay) {
          self.supportHLS(Hls);
        }
      })
    },

    /**
     * @method 检测是否支持httpflv
     * @params
     */
    supportFLV(isStart) {
      let liveEl = document.getElementById('player');

      // 拉流之前先解绑
      if(this.flvPlayer) {
        this.flvPlayer.unload();
        this.flvPlayer.detachMediaElement();
        this.flvPlayer.destroy();
        this.flvPlayer = null;
      }

      if (flvjs && flvjs.isSupported() && liveEl) {
        let flvPlayer = flvjs.createPlayer({
          type: 'flv',
          url: this.liveurl.httpflv,
          hasVideo: this.liveType === 2 ? true : false,
          isLive: true,
          hasAudio: this.isMute ? false : true,
          // 调太小的话会在秒出画面后立刻卡顿 最小缓存 默认384
          stashInitialSize: this.liveType === 2 ? 512 : 128
        });

        this.flvPlayer = flvPlayer;
        // 上报记录直播地址
        this.logLiveurl = this.liveurl.httpflv;

        try {
          // 展开播放模式下才开始拉流
          if(this.liveVisible) {
            flvPlayer.attachMediaElement(liveEl);
            flvPlayer.load();
            flvPlayer.play().then(() => {
              this.liveStatusTips = '';

              if(this.isWeb) {
                setTimeout(()=>{
                  liveEl.currentTime = liveEl.currentTime;
                  liveEl.play();
                }, 5000)
              }
            });
          }
        } catch(evt) {
          setTimeout(()=>{
            this.supportFLV();
          }, 3000)
        }

        this.handleFLVError();

        // 初始化快手SDK 目前支持视频
        setTimeout(()=>{
          this.initKwai(this.liveurl.httpflv);
        }, 0)

        // 心跳检测卡顿 flv只加视频
        this.liveType === 2 && this.checkTimeupdate();

        // 之前直播状态
        setTimeout(()=>{
          this.setLiveTip();
        }, 1000)

        return true;
      } else {
        if(isStart) {
          setTimeout(()=>{
            this.supportHLS(this.Hls)
          }, 1000*10)
        } else {
          if(this.Hls) {
            this.supportHLS(this.Hls);
          } else {
            this.loadHLS(true);
          }
        }

        return false;
      }
    },

    /*
    * @method 直播音频兼容hls
    * @params
    */
    supportHLS(Hls) {
      let liveEl = document.getElementById('player');

      if(this.hls) {
        this.hls.destroy();
      }

      if(Hls.isSupported()) {
        let config = {
          maxBufferLength: 6,
          nudgeMaxRetry: 10
        };
        var hls = new Hls(config);
        hls.loadSource(this.liveURL);
        hls.attachMedia(liveEl);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          liveEl.play().then(()=>{
            this.liveType === 2 && (this.liveVisible = true);
            this.playState = 1;
            this.liveStatusTips = ''
          });
        });

        this.handleerror(hls);
        this.hls = hls;

        this.setLiveTip();
      }
      // hls.js is not supported on platforms that do not have Media Source Extensions (MSE) enabled.
      // When the browser has built-in HLS support (check using `canPlayType`), we can provide an HLS manifest (i.e. .m3u8 URL) directly to the video element throught the `src` property.
      // This is using the built-in support of the plain video element, without using hls.js.
      // Note: it would be more normal to wait on the 'canplay' event below however on Safari (where you are most likely to find built-in HLS support) the video.src URL must be on the user-driven
      // white-list before a 'canplay' event will be emitted; the last video event that can be reliably listened-for when the URL is not on the white-list is 'loadedmetadata'.
      else if (liveEl.canPlayType('application/vnd.apple.mpegurl')) {
        liveEl.src = this.liveURL;
        // iOS不能自动播放
        this.playState = 0;
        this.liveVisible = false;

        setTimeout(() => {
          liveEl.src = this.liveURL;
        }, 1000 * 10)

        // 主要是断流后新推的HLS流要等到十几秒之后才能有流增加这个机制
        if (this.needNew) {
          this.needNew = false

          setTimeout(() => {
            liveEl.src = this.liveURL;
            this.loadNewUrl()
          }, 1000 * 15)
        }

        liveEl.addEventListener('loadedmetadata', ()=> {
          liveEl.play();
          this.liveType === 2 && (this.liveVisible = true);
        });

        // 检测404
        liveEl.addEventListener('error', ()=>{
          setTimeout(()=>{
            this.supportHLS(this.Hls)
          }, 1000*5)
        });

        // iOS不能直接play
        // wx.getNetworkType({
        //   success: (res)=> {
        //     liveEl.play()
        //     .then(() => {
        //       this.liveType === 2 && (this.liveVisible = true);
        //       this.playState = 1;
        //     })
        //   }
        // });

        console.log('loadedmetadata hls supportHLS');
      }

      // 上报记录直播地址
      this.logLiveurl = this.liveURL;

      // 初始化快手SDK 目前支持视频
      setTimeout(()=>{
        this.initKwai(this.liveURL);
      }, 0)

      setTimeout(() => {
        // 心跳检测卡顿
        this.checkTimeupdate();
      }, 1000 * 10)
    },

    /**
     * @method 检测是否出现卡顿
     * @params
     */
    checkTimeupdate() {
      let self = this;
      let liveEl = document.getElementById('player');

      // 防止重复监听
      if(this.timeupdateTimer) {
        return this;
      }

      // 卡主不能播放视频问题
      liveEl.addEventListener('timeupdate', (evt) => {
        console.log('currentTime:', liveEl.currentTime)

        // 删除提示
        if(self.liveStatusTips) {
          self.liveStatusTips = '';
        }

        // 每1分钟对齐一次 过程中视频画面卡主解决方式
        if(self.liveType === 2 && self.isWeb) {
          let currentTime = parseInt(liveEl.currentTime, 10);
          if(currentTime && currentTime%60 === 0 && self.currentTime < currentTime) {
            liveEl.currentTime = currentTime;
            self.currentTime = currentTime;

            console.log('更新进度', self.currentTime);
          }
        }

        // 销毁重新拉流定时
        if(self.loadingTimer) {
          clearTimeout(self.loadingTimer);
          self.loadingTimer = null;
        }

        // 检测卡顿定时
        self.timeupdateTimer && clearTimeout(self.timeupdateTimer);
        self.timeupdateTimer = setTimeout(()=>{
          // 正常播放状态下 能走到这里就是卡了
          if(self.playState === 1 && self.isWeb) {
            liveEl.currentTime = liveEl.currentTime - 0.1;
          }
        }, 3000)
      })

      let handleEvent = (evt) => {
        console.dir && console.dir(evt);

        // 五秒之内定时器没有执行证明 已经确实卡主了
        this.loadingTimer && clearTimeout(this.loadingTimer)
        this.loadingTimer = setTimeout(()=>{
          // 没有播放不用重新拉流
          if(!this.playState) {
            return this;
          }

          // 重新拉流
          if (this.flvPlayer) {
            this.createFlvPlayer();
          } else {
            this.Hls && this.supportHLS(this.Hls);
          }

          console.log('重新拉流');
        }, 10000)
      };

      // liveEl.addEventListener('loadstart', handleEvent);
      // liveEl.addEventListener('seeking', handleEvent);
      liveEl.addEventListener('waiting', handleEvent);

      let stalledEvent = (evt) => {
        if(!this.stalledCount) {
          this.stalledCount = 1;
        } else {
          this.stalledCount += 1;
        }

        if(this.liveType === 2) {
          this.liveStatusTips = '连接中...';

          // 卡顿超过2次就切换hls
          if(this.stalledCount > 2) {
            let flvPlayer = this.flvPlayer;
            if(flvPlayer) {
              flvPlayer.unload();
              flvPlayer.detachMediaElement();
              flvPlayer.destroy();
              this.flvPlayer = null;

              this.userNativePlayer();
            }
          } else {
            handleEvent();
          }
        }
      };

      liveEl.addEventListener('stalled', stalledEvent);
    },

    /*
    * @method 使用原生播放器
    * @params
    */
    userNativePlayer() {
      let liveEl = document.getElementById('player');

      if(liveEl.canPlayType('application/vnd.apple.mpegurl')) {
        liveEl.src = this.liveURL;

        liveEl.addEventListener('loadedmetadata', ()=> {
          liveEl.play();
          this.liveType === 2 && (this.liveVisible = true);
        });
      } else {
        if(this.Hls) {
          this.supportHLS(this.Hls);
        } else {
          this.loadHLS(true);
        }
      }

      console.log('切换原生或者hls 重新拉流');
    },

    /*
    * @method 直播过程错误处理
    * @params
    */
    handleerror(hls) {
      let Hls = this.Hls;

      hls.on(Hls.Events.ERROR, (event, data) => {
        let system = this.system;

        if (data.fatal) {
          switch(data.type) {
          case Hls.ErrorTypes.NETWORK_ERROR:
            // try to recover network error
            console.log("fatal network error encountered, try to recover");
            // hls.startLoad();

            setTimeout(()=>{
              this.supportHLS(Hls);
            }, 3000)

            // 上报
            system['et'] = 'network error';
            break;
          case Hls.ErrorTypes.MEDIA_ERROR:
            console.log("fatal media error encountered, try to recover");
            hls.recoverMediaError();

            // 上报
            system['et'] = 'media error';
            break;
          default:
            // cannot recover
            hls.destroy();

            // 上报
            system['et'] = 'cannot recover';
            break;
          }

          // this.reportLog(system);
          this.reportStrategy(system)
        }
      });
    },

    /**
     * @method 直播过程错误处理
     * @params
     */
    handleFLVError() {
      this.flvPlayer.on(flvjs.Events.ERROR, (errorType, errorDetail, errorInfo) => {
        console.log('errorType:', errorType);
        console.log('errorDetail:', errorDetail);

        let system = this.system;
        system && (system['et'] = errorType);

        if (errorType) {
          setTimeout(()=>{
            this.createFlvPlayer();
          }, 3500)

          // system && this.reportLog(system);
          system && this.reportStrategy(system)
        }
      });

      flvjs.LoggingControl.addLogListener((type, msg) => {
        console.log(type, msg);

        if(msg && ~msg.indexOf('MediaSource onSourceEnded')) {
          let liveEl = document.getElementById('player');
          let flvPlayer = this.flvPlayer;

          flvPlayer.unload();
          flvPlayer.detachMediaElement()

          setTimeout(()=>{
            flvPlayer.attachMediaElement(liveEl);
            flvPlayer.load();
            flvPlayer.play();
          }, 3000)
        }
      });
    },

    createFlvPlayer() {
      let liveEl = document.getElementById('player');
      if (flvjs.isSupported() && liveEl) {
        // 拉流之前先解绑
        if(this.flvPlayer) {
          this.flvPlayer.unload();
          this.flvPlayer.detachMediaElement();
          this.flvPlayer.destroy();
          this.flvPlayer = null;
        }

        let flvPlayer = flvjs.createPlayer({
          type: 'flv',
          url: this.liveurl.httpflv,
          hasVideo: this.liveType === 2 ? true : false,
          isLive: true,
          hasAudio: this.isMute ? false : true
        });

        this.flvPlayer = flvPlayer;

        try {
          // 展开播放模式下才开始拉流
          if(this.liveVisible || this.playState) {
            flvPlayer.attachMediaElement(liveEl);
            flvPlayer.load();
            flvPlayer.play().then(() => {
              if(this.isWeb && this.liveType === 2) {
                setTimeout(()=>{
                  liveEl.currentTime = liveEl.currentTime;
                }, 5000)
              }
            });
          }
        } catch(evt) {
        }

        this.handleFLVError();
      }

      // 快手上报 重试
      if(this.qos) {
        this.qos.retry();
      }
    },

    /*
    * @method 直播音频停止直播
    * @params
    */
    handlestop() {
      let liveEl = document.getElementById('player');

      if(this.playLoading && this.liveType === 1) {
        return this;
      }

      if(this.flvPlayer) {
        try {
          let flvPlayer = this.flvPlayer;
          flvPlayer.pause();
          flvPlayer.unload();
          flvPlayer.detachMediaElement();
        } catch(e) {
        }
      } else {
        liveEl.pause();
      }

      this.playState = 0;
      this.saveLiveStatus(this.playState);

      // 快手上报 用户关闭直播
      if(this.qos && this.logLiveurl) {
        this.qos.sendSummary({
          lessonid: this.lessonID,
          uid: this.userID,
          liveurl: this.logLiveurl
        });

        // 快手上报重置
        this.qos.reset();
      }
    },

    /*
    * @method 直播音频播放
    * @params
    */
    handleplay() {
      let liveEl = document.getElementById('player');

      if(this.flvPlayer) {
        try {
          let flvPlayer = this.flvPlayer;
          flvPlayer.attachMediaElement(liveEl);
          flvPlayer.load();
          flvPlayer.play().then(() => {
            this.playLoading = false;

            if(this.isWeb && this.liveType === 2) {
              setTimeout(()=>{
                liveEl.currentTime = liveEl.currentTime;
                liveEl.play();
              }, 5000)
            }
          });

          // this.playLoading = true;
          // 音频直播提示 防止用户随便点击
          if(this.liveType === 1) {
            this.$toast({
              message: 'Loading...',
              duration: 4500
            });
          }
        } catch(e) {
        }
      } else {
        liveEl.play()
        .then(() => {
          this.playLoading = false;
        })

        // 避免音频没有加载不播放问题
        setTimeout(()=>{
          liveEl.play();
        }, 500)
      }

      this.playLoading = true;
      this.playState = 1;
      this.saveLiveStatus(this.playState);

      // 快手上报 开始加载时间戳
      if(this.qos && this.logLiveurl) {
        this.qos.setLoadTimeOnMSE();
      }

      // 防止没有流的时候无法操作
      setTimeout(()=>{
        if(this.playLoading) {
          this.playLoading = false;
        }
      }, 3000)
    },

    /*
     * @method 是否显示直播提示
     * @params
     */
    setLiveTip() {
      let lessonID = this.lessonID;
      let statusKey = 'live-status-' + lessonID;

      // 网页版手动点击播放
      if(this.isWeb) {
        return this;
      }

      if(isSupported(window.localStorage)) {
        // 是否播放 静音
        let status = localStorage.getItem(statusKey);
        if(status) {
          status = +status;

          if(status === 1) {
            this.handleplay();
            this.liveVisible = true;
          } else if(status === 0) {
            this.handlestop();
          }
        }
      }

    },

    /*
     * @method 本地存储直播状态
     * @params
     */
    saveLiveStatus(status) {
      let lessonID = this.lessonID;
      let key = 'live-status-' + lessonID;

      if(isSupported(window.localStorage)) {
        localStorage.setItem(key, status);
      }
    },

    /*
     * @method 设置直播展开收起
     * @params
     */
    handleLiveVisible(visible) {
      let liveEl = document.getElementById('player');
      let flvPlayer = this.flvPlayer;
      this.liveVisible = visible;

      // if(visible) {
      //   this.handleplay();
      // } else {
      //   this.handlestop();
      // }
    },

    /*
     * @method 关闭视频直播
     * @params
     */
    handleStopVideo() {
      this.liveVisible = false;
      this.handlestop();
    },

    /*
     * @method 关闭视频直播
     * @params
     */
    handlePlayVideo() {
      this.liveVisible = true;
      this.handleplay();
    },

    /*
     * @method 断流后
     * @params
     */
    loadNewUrl(){
      let liveEl = document.querySelector('#player')
      this.loadNewUrlTimer && clearTimeout(this.loadNewUrlTimer)
      this.loadNewUrlTimer = setTimeout(() => {
        if(liveEl.currentTime - this.currentTime < 1){
          liveEl.src = this.liveURL
          // this.loadNewUrl()
        }
      }, 1000 * 10)

      liveEl.addEventListener('timeupdate', () => {
        if(liveEl.currentTime !== 0) {
          clearTimeout(this.loadNewUrlTimer)
        } else {
          this.loadNewUrl()
        }
      })
    },

    /*
     * @method 初始化快手SDK
     * @params
     */
    initKwai(liveurl) {
      // https://tx-xuetangx.pull.yximgs.com/live/6000_kszt=GN=fp4YLg4o.flv
      // let isKwai = liveurl && liveurl.indexOf('pull.yximgs.com');

      let videoEl = document.getElementById('player');
      if(typeof KwaiVideoQosH5 !== 'undefined') {
        let qos = new KwaiVideoQosH5();
        qos.attachMedia(videoEl);

        this.qos = qos;
      }
    }
  }
}


export default liveMixin;

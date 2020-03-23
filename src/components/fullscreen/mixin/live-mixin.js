/*
 * 学生接收器 直播处理
 * @author: chenzhou
 * @update: 2018.8.29
 * @desc 加载hls hls处理 播放操作控制
 *
 */

import { isSupported } from '@/util/util'
import flvjs from 'flv.js/dist/flv.min'
// import '@/util/flv.min'
// import '@/util/flv.min'


let liveMixin = {
  methods: {
    /*
    * @method 加载hls库
    *
    */
    loadHLS() {
      let self = this;

      require(['hls.js',], function(Hls) {
        self.Hls = Hls;

        self.supportHLS(Hls);
      })
    },

    /**
     * @method
     *
     */
    supportFLV() {
      let self = this;
      if(!this.liveURL) {
        return;
      }

      // 拉流之前先解绑
      if(this.flvPlayer) {
        this.flvPlayer.unload();
        this.flvPlayer.detachMediaElement();
        this.flvPlayer.destroy();
        this.flvPlayer = null;
      }

      let audioEl = document.getElementById('player');
      if (flvjs && flvjs.isSupported() && audioEl) {
        let flvPlayer = flvjs.createPlayer({
          type: 'flv',
          url: this.liveURL,
          hasVideo: this.liveType === 2 ? true : false,
          isLive: true,
          // 调太小的话会在秒出画面后立刻卡顿 最小缓存 默认384
          stashInitialSize: this.liveType === 2 ? 512 : 128
        });

        this.flvPlayer = flvPlayer;

        try {
          if(this.liveType === 2) {
            flvPlayer.attachMediaElement(audioEl);
            flvPlayer.load();
            flvPlayer.play().then(()=>{
              this.playState = 1;
              this.liveStatusTips = '';

              setTimeout(()=>{
                audioEl.currentTime = audioEl.currentTime;
              }, 5000)
            });

            this.liveStatusTips = '连接中...';
            setTimeout(()=>{
              this.liveStatusTips = '';
            }, 5000)
          } else {
            this.playState = 0;
          }
        } catch(evt) {
        }

        this.handleFLVError();
        // 心跳检测卡顿
        this.checkTimeupdate();

        // 初始化快手SDK
        setTimeout(()=>{
          this.initKwai(this.liveURL);
        }, 0)
      } else {
        this.loadHLS();
      }
    },

    /*
    * @method 直播音频兼容hls
    * @params
    */
    supportHLS(Hls) {
      let liveEl = document.getElementById('player');

      if(!Hls) {
        this.loadHLS();

        return this;
      }

      if(this.hls) {
        this.hls.destroy();
      }

      if(Hls.isSupported()) {
        var hls = new Hls();
        hls.loadSource(this.liveurl.hls);
        hls.attachMedia(liveEl);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          liveEl.play().then(()=>{
            this.playState = 1;
          });
        });

        this.handleerror(hls);
        this.hls = hls;
      }
      // hls.js is not supported on platforms that do not have Media Source Extensions (MSE) enabled.
      // When the browser has built-in HLS support (check using `canPlayType`), we can provide an HLS manifest (i.e. .m3u8 URL) directly to the video element throught the `src` property.
      // This is using the built-in support of the plain video element, without using hls.js.
      // Note: it would be more normal to wait on the 'canplay' event below however on Safari (where you are most likely to find built-in HLS support) the video.src URL must be on the user-driven
      // white-list before a 'canplay' event will be emitted; the last video event that can be reliably listened-for when the URL is not on the white-list is 'loadedmetadata'.
      else if (liveEl.canPlayType('application/vnd.apple.mpegurl')) {
        liveEl.src = this.liveurl.hls;
        liveEl.addEventListener('loadedmetadata',function() {
          liveEl.play();
        });

        // 检测404
        liveEl.addEventListener('error', ()=>{
          setTimeout(()=>{
            this.supportHLS(this.Hls)
          }, 1000*5)
        });

        // iOS不能直接play
        this.liveType === 2 && wx.getNetworkType({
          success: (res)=> {
            liveEl.play();
          }
        });

        console.log('loadedmetadata hls supportHLS');
      }

      // 心跳检测卡顿
      this.checkTimeupdate();
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
        // 删除提示
        if(self.liveStatusTips) {
          self.liveStatusTips = '';
        }

        // 每1分钟对齐一次 过程中视频画面卡主解决方式
        if(self.liveType === 2) {
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
          if(self.playState === 1) {
            liveEl.currentTime = liveEl.currentTime - 0.1;
          }
        }, 3000)
      })

      //
      let handleEvent = (evt) => {
        console.dir && console.dir(evt);
        // 五秒之内定时器没有执行证明 已经确实卡主了
        if(this.liveType === 2) {
          // this.liveStatusTips = '连接中...';
        }

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
        }, 15000)
      };

      // liveEl.addEventListener('loadstart', handleEvent);
      // liveEl.addEventListener('seeking', handleEvent);
      liveEl.addEventListener('waiting', handleEvent);
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
            hls.startLoad();

            // 上报
            // system['et'] = 'network error';
            break;
          case Hls.ErrorTypes.MEDIA_ERROR:
            console.log("fatal media error encountered, try to recover");
            hls.recoverMediaError();

            // 上报
            // system['et'] = 'media error';
            break;
          default:
            // cannot recover
            hls.destroy();

            // 上报
            // system['et'] = 'cannot recover';
            break;
          }

          // this.reportLog(system);
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

        // let system = this.system;
        // system['et'] = errorType;

        if (errorType) {
          this.createFlvPlayer();

          // this.reportLog(system);
        }
      });

      flvjs.LoggingControl.addLogListener((type, msg) => {
        if(msg && ~msg.indexOf('MediaSource onSourceEnded')) {
          this.createFlvPlayer();
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
          // 调太小的话会在秒出画面后立刻卡顿 最小缓存 默认384
          stashInitialSize: this.liveType === 2 ? 512 : 128
        });

        this.flvPlayer = flvPlayer;

        try {
          // 展开播放模式下才开始拉流
          if(this.liveVisible) {
            flvPlayer.attachMediaElement(liveEl);
            flvPlayer.load();
            flvPlayer.play().then(() => {
              this.playState = 1;

              this.liveType === 2 && setTimeout(()=>{
                liveEl.currentTime = liveEl.currentTime;
              }, 5000)
            });
          }
        } catch(evt) {
        }
      }
    },

    /*
    * @method 直播音频停止直播
    * @params
    */
    handlestop() {
      let audioEl = document.getElementById('player');
      if(this.flvPlayer) {
        try {
          if(this.playLoading && this.liveType === 1) {
            this.$toast({
              message: '连接中...',
              duration: 3000
            });

            return this;
          }

          let flvPlayer = this.flvPlayer;
          flvPlayer.unload();
          flvPlayer.detachMediaElement();
        } catch(e) {
        }
      } else {
        audioEl.pause();
      }

      this.playState = 0;
      this.saveLiveStatus(this.playState);

      // 快手上报
      if(this.qos && this.liveURL) {
        this.qos.sendSummary({
          lessonid: this.lessonID,
          uid: this.userID,
          liveurl: this.liveURL
        });
      }
    },

    /*
    * @method 直播音频播放
    * @params
    */
    handleplay() {
      let audioEl = document.getElementById('player');
      if(this.flvPlayer) {
        try {
          let flvPlayer = this.flvPlayer;
          // flvPlayer.unload();
          flvPlayer.attachMediaElement(audioEl);
          flvPlayer.load();
          flvPlayer.play().then(() => {
            this.playLoading = false;
            this.playState = 1;
          });

          this.playLoading = true;

          // 音频直播提示 防止用户随便点击
          if(this.liveType === 1) {
            this.$toast({
              message: '连接中...',
              duration: 4500
            });
          }

          setTimeout(()=>{
            if(this.playLoading) {
              this.playLoading = false;
            }
          }, 5000)
        } catch(e) {
        }
      } else {
        audioEl.play();
      }

      this.playState = 1;
      this.saveLiveStatus(this.playState);
    },

    /*
     * @method 是否显示直播提示
     * @params
     */
    setLiveTip() {
      let lessonID = this.lessonID;
      let key = 'live' + lessonID;
      let statusKey = 'live-status-' + lessonID;
      let hiddenLiveTip = false;

      if(isSupported(window.localStorage)) {
        hiddenLiveTip = +localStorage.getItem(key);

        if(!hiddenLiveTip) {
          this.showLiveTip = true;
          localStorage.setItem(key, 1);

          setTimeout(()=>{
            this.showLiveTip = false;
          }, 3000)
        }

        // 是否播放 静音
        let status = localStorage.getItem(statusKey);
        if(status) {
          status = +status;

          if(status === 1) {
            this.handleplay();
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
     * @method 初始化快手SDK
     * @params
     */
    initKwai(liveurl) {
      // https://tx-xuetangx.pull.yximgs.com/live/6000_kszt=GN=fp4YLg4o.flv
      let isKwai = liveurl.indexOf('pull.yximgs.com');
      if(~isKwai) {
        let videoEl = document.getElementById('player');

        if(typeof KwaiVideoQosH5 !== 'undefined') {
          let qos = new KwaiVideoQosH5();
          qos.attachMedia(videoEl);

          this.qos = qos;
        }
      }
    }

  }
}


export default liveMixin;

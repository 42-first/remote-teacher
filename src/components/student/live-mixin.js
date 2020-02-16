/*
 * 学生接收器 直播处理
 * @author: chenzhou
 * @update: 2018.8.29
 * @desc 加载hls hls处理 播放操作控制
 *
 */

 import { isSupported } from '@/util/util'
 import flvjs from 'flv.js/dist/flv.min'


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

        self.liveType === 1 && self.supportHLS(Hls);
      })
    },

    /**
     * @method 检测是否支持httpflv
     * @params
     */
    supportFLV(isStart) {
      let liveEl = document.getElementById('player');
      if (flvjs.isSupported() && liveEl) {
        let flvPlayer = flvjs.createPlayer({
          type: 'flv',
          url: this.liveurl.httpflv,
          hasVideo: this.liveType === 2 ? true : false,
          isLive: true,
          // enableStashBuffer: false,
          // lazyLoad: false,
          hasAudio: this.isMute ? false : true
        });

        this.flvPlayer = flvPlayer;

        try {
          this.setLiveTip();

          // 展开播放模式下才开始拉流
          if(this.liveVisible) {
            flvPlayer.attachMediaElement(liveEl);
            flvPlayer.load();
            flvPlayer.play().then(() => {
              this.liveStatusTips = ''
            });
          } else if(this.isWeb && this.liveType === 1) {
            // flvPlayer.attachMediaElement(liveEl);
            // flvPlayer.load();
          }
        } catch(evt) {
          setTimeout(()=>{
            this.supportFLV();
          }, 3000)
        }

        this.handleFLVError();

        return true;
      } else {
        if(isStart) {
          setTimeout(()=>{
            this.supportHLS(this.Hls)
          }, 1000*10)
        } else {
          this.Hls && this.supportHLS(this.Hls);
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

      if(Hls.isSupported()) {
        let config = {
          maxBufferLength: 6,
          nudgeMaxRetry: 5
        };
        var hls = new Hls(config);
        hls.loadSource(this.liveURL);
        hls.attachMedia(liveEl);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          // this.liveType === 2 && liveEl.play();
          liveEl.play().then(()=>{
            this.playState = 1;
            this.liveStatusTips = ''
          });
        });

        this.handleerror(hls);
      }
      // hls.js is not supported on platforms that do not have Media Source Extensions (MSE) enabled.
      // When the browser has built-in HLS support (check using `canPlayType`), we can provide an HLS manifest (i.e. .m3u8 URL) directly to the video element throught the `src` property.
      // This is using the built-in support of the plain video element, without using hls.js.
      // Note: it would be more normal to wait on the 'canplay' event below however on Safari (where you are most likely to find built-in HLS support) the video.src URL must be on the user-driven
      // white-list before a 'canplay' event will be emitted; the last video event that can be reliably listened-for when the URL is not on the white-list is 'loadedmetadata'.
      else if (liveEl.canPlayType('application/vnd.apple.mpegurl')) {
        liveEl.src = this.liveURL;
        if (this.needNew) {
          this.needNew = false
          console.log('needNew');
          console.log(this.currentTime);
          console.log(liveEl.currentTime);
          setTimeout(() => {
            this.loadNewUrl()
          }, 1000 * 30)
        }
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

      this.setLiveTip();

      // this.$toast({
      //   message: '建议使用雨课堂小程序，直播同步效果更好',
      //   duration: 3000
      // });
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

          this.reportLog(system);
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
        system['et'] = errorType;

        if (errorType) {
          setTimeout(()=>{
            this.flvPlayer.unload();
            this.flvPlayer.detachMediaElement();
            this.createFlvPlayer();
          }, 3500)

          this.reportLog(system);
        }
      });

      flvjs.LoggingControl.addLogListener((type, msg) => {
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
        let flvPlayer = flvjs.createPlayer({
          type: 'flv',
          url: this.liveurl.httpflv,
          hasVideo: this.liveType === 2 ? true : false,
          isLive: true,
          // enableStashBuffer: false,
          // lazyLoad: false,
          hasAudio: this.isMute ? false : true
        });

        this.flvPlayer = flvPlayer;

        try {
          // 展开播放模式下才开始拉流
          if(this.liveVisible || this.playState) {
            flvPlayer.attachMediaElement(liveEl);
            flvPlayer.load();
            flvPlayer.play();
          }
        } catch(evt) {
        }

        this.handleFLVError();
      }
    },

    /*
    * @method 直播音频停止直播
    * @params
    */
    handlestop() {
      let audioEl = document.getElementById('player');
      // audioEl.pause();

      if(this.flvPlayer) {
        try {
          if(this.playLoading && this.liveType === 1 && this.isWeb) {
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
          flvPlayer.attachMediaElement(audioEl);
          flvPlayer.load();
          flvPlayer.play().then(() => {
            this.playLoading = false;
          });

          this.playLoading = true;
        } catch(e) {
        }
      } else {
        audioEl.play();

        // 避免音频没有加载不播放问题
        setTimeout(()=>{
          audioEl.play();
        }, 500)
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

      // 网页版手动点击播放
      if(typeof window.WeixinJSBridge == 'undefined') {
        return this;
      }

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

      if(visible) {
        // 开始拉流
        if(flvPlayer) {
          try {
            flvPlayer.attachMediaElement(liveEl);
            flvPlayer.load();
            flvPlayer.play();
          } catch(e) {
          }
        }

        this.handleplay();
      } else {
        this.handlestop();

        // 停止拉流
        flvPlayer && flvPlayer.unload();
        flvPlayer && flvPlayer.detachMediaElement();
      }
    },

    loadNewUrl(){
      let liveEl = document.querySelector('#player')
      this.loadNewUrlTimer && clearTimeout(this.loadNewUrlTimer)
      this.loadNewUrlTimer = setTimeout(() => {
        console.log('ssssssss', liveEl.currentTime , this.currentTime);
        if(liveEl.currentTime - this.currentTime < 1){
          liveEl.src = this.liveURL
          console.log('我重新加载啦', liveEl.currentTime , this.currentTime);
          this.loadNewUrl()
        }
      }, 1000 * 10)
      liveEl.addEventListener('timeupdate', () => {
        if(liveEl.currentTime !== 0){
          clearTimeout(this.loadNewUrlTimer)
        }else {
          this.loadNewUrl()
        }
      })
    }
  }
}


export default liveMixin;

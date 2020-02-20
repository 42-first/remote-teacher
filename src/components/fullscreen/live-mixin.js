/*
 * 学生接收器 直播处理
 * @author: chenzhou
 * @update: 2018.8.29
 * @desc 加载hls hls处理 播放操作控制
 *
 */

import { isSupported } from '@/util/util'
// import flvjs from 'flv.js'
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
     * @method
     *
     */
    supportFLV() {
      if(!this.liveURL) {
        return;
      }

      let audioEl = document.getElementById('player');
      if (flvjs.isSupported() && audioEl) {
        let flvPlayer = flvjs.createPlayer({
          type: 'flv',
          url: this.liveURL,
          hasVideo: this.liveType === 2 ? true : false,
          isLive: true,
        });

        this.flvPlayer = flvPlayer;

        try {
          if(this.liveType === 2) {
            flvPlayer.attachMediaElement(audioEl);
            flvPlayer.load();
            flvPlayer.play().then(()=>{
              this.playState = 1;
            });
          } else {
            this.playState = 0;
          }
        } catch(evt) {
          setTimeout(()=>{
            this.supportFLV();
          }, 3000)
        }

        this.handleFLVError();
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
          let liveEl = document.getElementById('player');
          let flvPlayer = this.flvPlayer;

          flvPlayer.unload();
          flvPlayer.detachMediaElement();
          flvPlayer.attachMediaElement(liveEl);
          flvPlayer.load();
          flvPlayer.play();
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
        });

        this.flvPlayer = flvPlayer;

        try {
          // 展开播放模式下才开始拉流
          if(this.liveVisible) {
            flvPlayer.unload();
            flvPlayer.detachMediaElement();
            flvPlayer.attachMediaElement(liveEl);
            flvPlayer.load();
            flvPlayer.play();
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

  }
}


export default liveMixin;

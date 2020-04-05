/*
 * 学生接收器 直播处理
 * @author: chenzhou
 * @update: 2018.8.29
 * @desc 加载hls hls处理 播放操作控制
 *
 */

 import { isSupported } from '@/util/util'
 // import flvjs from 'flv.js/dist/flv.min'
 // import '@/util/flv.min'

 import KwaiPlayerKernelExternal from '@/util/kwai-player-v1.0.0'

 console.log('kwai isSupport:', KwaiPlayerKernelExternal.isSupport())


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

    /*
     * @method 销毁player
     * @params
     */
    destroyKwai() {
      if(this.qos) {
        this.qos.removeAllListeners();
        this.qos.destroy();
        this.qos = null;
      }
    },

    /*
     * @method 初始化快手SDK
     * @params
     */
    initKwai(isStart) {
      // 拉流之前先销毁之前的实例
      this.destroyKwai();

      let videoEl = document.getElementById('player');

      console.log('kwai isSupport:', KwaiPlayerKernelExternal.isSupport())

      // 不支持尝试hls video直接
      if(!KwaiPlayerKernelExternal.isSupport()) {
        if(this.Hls) {
          this.supportHLS(this.Hls);
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
        }

        return this;
      }

      let config = {
        debug: true,
        box: 'flv',
        isLive: true,
        maxRetry: 10,
        retryDelay: 3000,
        logEnv: process.env.NODE_ENV
      };

      let qos = new KwaiPlayerKernelExternal(config);
      qos.on('error', (e) =>{
        console.log(e);
      });

      qos.attachMedia(videoEl);
      qos.load(this.liveurl.httpflv);

      // 设置业务数据
      qos.setBiz({
        lessonid: this.lessonID,
        uid: this.userID,
        liveurl: this.liveurl.httpflv
      });

      this.qos = qos;

      videoEl.play()
      .then(()=>{
        this.playLoading = false;
        this.playState = 1;
        this.liveStatusTips = '';

        this.liveType === 2 && setTimeout(()=>{
          videoEl.currentTime = videoEl.currentTime;
        }, 5000)

        this.saveLiveStatus(this.playState);
      });

      this.playLoading = true;
      this.liveStatusTips = '连接中...';

      // 上报记录直播地址
      this.logLiveurl = this.liveurl.httpflv;
    },

    /**
     * @method 检测是否支持httpflv
     * @params
     */
    supportFLV(isStart) {
      this.initKwai(isStart);
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
          liveEl.play()
          .then(()=>{
            this.liveType === 2 && (this.liveVisible = true);
            this.playState = 1;
            this.liveStatusTips = ''
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
        liveEl.src = this.liveURL;
        // iOS不能自动播放
        // this.playState = 0;
        // this.liveVisible = false;

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
          if(this.playState) {
            liveEl.play();
            this.liveType === 2 && (this.liveVisible = true);
          }
        });

        // 检测404
        liveEl.addEventListener('error', ()=>{
          setTimeout(()=>{
            this.supportHLS(this.Hls)
          }, 1000*5)
        });

        console.log('loadedmetadata hls supportHLS');
      }

      // 上报记录直播地址
      this.logLiveurl = this.liveURL;
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
    createFlvPlayer() {
      this.initKwai();

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
      liveEl.pause();

      if(this.playLoading && this.liveType === 1) {
        return this;
      }

      if(this.qos) {
        // 快手上报
        this.qos.sendSummary();

        // 销毁播放器
        this.destroyKwai();
      }

      this.playState = 0;
      this.saveLiveStatus(this.playState);
    },

    /*
    * @method 直播音频播放
    * @params
    */
    handleplay() {
      let liveEl = document.getElementById('player');

      if(this.playLoading && this.liveType === 1) {
        this.$toast({
          message: '连接中...',
          duration: 3000
        });
      }

      try {
        this.initKwai();
      } catch(e) {
        liveEl.play()
        .then(()=>{
          this.playState = 1;
          this.playLoading = false;
          this.saveLiveStatus(this.playState);
        })
        .catch((error) => {
          // this.$toast({
          //   message: 'Loading...',
          //   duration: 5000
          // });

          // this.playLoading = true;
          // this.playState = 0;
          // this.saveLiveStatus(this.playState);
        });
      }
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
      this.liveVisible = visible;
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

  }
}


export default liveMixin;

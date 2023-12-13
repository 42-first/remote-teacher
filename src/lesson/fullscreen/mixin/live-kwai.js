/*
 * 学生接收器 直播处理 切换快手SDK
 * @author: chenzhou
 * @update: 2020.4.1
 * @desc 加载hls hls处理 播放操作控制
 *
 */

import { isSupported } from '@/util/util'
import KwaiPlayerKernelExternal from '@/util/kwai-player-v1.0.0'


let liveMixin = {
  methods: {
    /*
    * @method 直播音频停止直播
    * @params
    */
    handlestop() {
      let audioEl = document.getElementById('player');
      audioEl.pause();

      if(this.qos) {
        try {
          if(this.playLoading && this.liveType === 1) {
            this.$toast({
              message: '连接中...',
              duration: 3000
            });

            return this;
          }
        } catch(e) {
        }

        // 快手上报
        this.qos.sendSummary();
      }

      this.playState = 0;
      this.saveLiveStatus(this.playState);

      this.destroyKwai();

      // 停止播放时上报下当前数据
      this.forceReport()
    },

    /*
    * @method 直播音频播放
    * @params
    */
    handleplay() {
      let audioEl = document.getElementById('player');

      if(this.playLoading && this.liveType === 1) {
        this.$toast({
          message: '连接中...',
          duration: 3000
        });
      }

      try {
        this.initKwai();
      } catch(e) {
        audioEl.play()
        .then(()=>{
          this.playState = 1;
          this.playLoading = false;
          this.saveLiveStatus(this.playState);
        });
      }
    },

    /*
    * @method 直播音频停止直播
    * @params
    */
    handlestopVideo() {
      let videoEl = document.getElementById('player');

      if(this.playLoading) {
        return this;
      }

      videoEl.pause();

      this.playState = 0;
      this.saveLiveStatus(this.playState);

      // 快手上报
      if(this.qos && this.liveURL) {
        this.qos.sendSummary();
      }

      this.destroyKwai();

      // 停止播放时上报下当前数据
      this.forceReport()
    },

    /*
    * @method 直播音频播放
    * @params
    */
    handleplayVideo() {
      let videoEl = document.getElementById('player');

      try {
        this.initKwai();
      } catch(e) {
        videoEl.play()
        .then(()=>{
          this.playState = 1;
          this.saveLiveStatus(this.playState);
        });
      }
    },

    /*
     * @method 是否显示直播提示
     * @params
     */
    setLiveTip() {
      let lessonID = this.lessonID;
      let key = 'live' + lessonID;
      let statusKey = 'live-status-' + lessonID;

      if(isSupported(window.localStorage)) {
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
    initKwai() {
      // 拉流之前先销毁之前的实例
      this.destroyKwai();

      let videoEl = document.getElementById('player');

      // 不支持尝试hls
      if(!KwaiPlayerKernelExternal.isSupport()) {
        if(this.Hls) {
          this.supportHLS(this.Hls);
        } else {
          this.loadHLS(true);
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
        console.log('error 断网了', e);

        if(e.type === 'networkError') {
          this.playState = 0;
        }
      });

      qos.attachMedia(videoEl);
      qos.load(this.liveURL);

      // 设置业务数据
      qos.setBiz({
        lessonid: this.lessonID,
        uid: this.userID,
        liveurl: this.liveURL
      });

      this.qos = qos;

      try {
        videoEl.play()
        .then(()=>{
          this.playLoading = false;
          this.playState = 1;
          this.liveStatusTips = '';

          this.saveLiveStatus(this.playState);
        })
        .catch((error) => {
          this.playLoading = false;
          this.liveStatusTips = '';

          // this.$toast({
          //   message: '浏览器禁止自动播放，请手动点击播放按钮',
          //   duration: 5000
          // });
        });
      } catch(e) {
      }

      this.playLoading = true;
      this.liveStatusTips = '连接中...';

      setTimeout(() => {
        // 心跳检测卡顿
        this.checkTimeupdate();
      }, 1000 * 10)
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
     * @method 兼容之前的方式
     * @params
     */
    createFlvPlayer() {
      this.initKwai();
    },

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

            break;
          case Hls.ErrorTypes.MEDIA_ERROR:
            console.log("fatal media error encountered, try to recover");
            hls.recoverMediaError();

            break;
          default:
            // cannot recover
            hls.destroy();

            break;
          }
        }
      });
    },

    checkTimeupdate() {
      let self = this;
      let liveEl = document.getElementById('player');
      let handleEvent = (evt) => {
        console.dir && console.dir(evt);

        // 五秒之内定时器没有执行证明 已经确实卡主了
        this.loadingTimer && clearTimeout(this.loadingTimer)
        this.loadingTimer = setTimeout(()=>{
          // 没有播放不用重新拉流
          if(!this.playState) {
            return this;
          }

          // 如果有清晰度切换 且当前不是最低清晰度的 提示降低清晰度
          if(this.hasDefinition && this.curLevel !== 0) {
            this.definitionTips = this.$t('lowleveltips') || '播放卡顿，建议您降低清晰度~'

            setTimeout(() => {
              this.definitionTips = ''
            }, 5000)
          }
        }, 10000)
      };

      let updateEvent = (evt) => {
        if(self.loadingTimer) {
          clearTimeout(self.loadingTimer);
          self.loadingTimer = null;
        }
      }

      liveEl.removeEventListener('waiting', handleEvent);
      liveEl.removeEventListener('timeupdate', updateEvent);
      liveEl.addEventListener('waiting', handleEvent);
      // 卡主不能播放视频问题
      liveEl.addEventListener('timeupdate', updateEvent)
    }

  }
}


export default liveMixin;

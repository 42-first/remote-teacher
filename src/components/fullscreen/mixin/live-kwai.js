/*
 * 学生接收器 直播处理 切换快手SDK
 * @author: chenzhou
 * @update: 2020.4.1
 * @desc 加载hls hls处理 播放操作控制
 *
 */

import { isSupported } from '@/util/util'
// import flvjs from 'flv.js/dist/flv.min'

import KwaiPlayerKernelExternal from '@/util/kwai-player-v1.0.0'


let liveMixin = {
  methods: {
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

        // 快手上报重置
        this.qos.reset();
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

      // 快手上报 开始加载时间戳
      if(this.qos && this.liveURL) {
        this.qos.setLoadTimeOnMSE();
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

      let flvPlayer = this.flvPlayer;
      flvPlayer.unload();
      flvPlayer.detachMediaElement();

      videoEl.pause();

      this.playState = 0;
      this.saveLiveStatus(this.playState);

      // 快手上报
      if(this.qos && this.liveURL) {
        this.qos.sendSummary({
          lessonid: this.lessonID,
          uid: this.userID,
          liveurl: this.liveURL
        });

        // 快手上报重置
        this.qos.reset();
      }
    },

    /*
    * @method 直播音频播放
    * @params
    */
    handleplayVideo() {
      let videoEl = document.getElementById('player');
      if(this.flvPlayer) {
        try {
          let flvPlayer = this.flvPlayer;
          flvPlayer.attachMediaElement(videoEl);
          flvPlayer.load();
          flvPlayer.play().then(() => {
            this.playLoading = false;
            this.playState = 1;
            this.liveStatusTips = '';

            this.liveType === 2 && setTimeout(()=>{
              videoEl.currentTime = videoEl.currentTime;
            }, 5000)
          });

          this.playLoading = true;
          this.liveStatusTips = '连接中...';

          setTimeout(()=>{
            if(this.playLoading) {
              this.playLoading = false;
            }

            this.liveStatusTips = '';
          }, 5000)
        } catch(e) {
        }
      } else {
        videoEl.play();
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
    initKwai(liveurl) {
      if(!this.liveURL) {
        return;
      }

      // 拉流之前先销毁之前的实例
      if(this.qos) {
        this.qos.destroy();
        this.qos = null;
      }

      let videoEl = document.getElementById('player');
      let config = {
        type: 'flv',
        url: this.liveURL,
        hasVideo: this.liveType === 2 ? true : false,
        isLive: true,
      };

      let qos = new KwaiPlayerKernelExternal(config);
      qos.attachMedia(video);
      qos.load();

      this.qos = qos;
    }

  }
}


export default liveMixin;

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
          url: this.liveurl.httpflv
        });

        try {
          flvPlayer.attachMediaElement(liveEl);
          flvPlayer.load();
          flvPlayer.play();

          this.setLiveTip();
        } catch(evt) {
          setTimeout(()=>{
            this.supportFLV();
          }, 3000)
        }

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
        var hls = new Hls();
        hls.loadSource(this.liveURL);
        hls.attachMedia(liveEl);
        hls.on(Hls.Events.MANIFEST_PARSED,function() {
          this.liveType === 2 && liveEl.play();
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
    },

    /*
    * @method 直播过程错误处理
    * @params
    */
    handleerror(hls) {
      let Hls = this.Hls;

      hls.on(Hls.Events.ERROR, (event, data) => {
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

    /*
    * @method 直播音频停止直播
    * @params
    */
    handlestop() {
      let audioEl = document.getElementById('player');
      audioEl.pause();
      this.playState = 0;

      this.saveLiveStatus(this.playState);
    },

    /*
    * @method 直播音频播放
    * @params
    */
    handleplay() {
      let audioEl = document.getElementById('player');
      audioEl.play();
      this.playState = 1;

      // 避免音频没有加载不播放问题
      setTimeout(()=>{
        audioEl.play();
      }, 500)

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
      this.liveVisible = visible;

      if(visible) {
        this.handleplay();
      } else {
        this.handlestop();
      }
    },

  }
}


export default liveMixin;

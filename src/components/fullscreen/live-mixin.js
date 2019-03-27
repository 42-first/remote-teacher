/*
 * 学生接收器 直播处理
 * @author: chenzhou
 * @update: 2018.8.29
 * @desc 加载hls hls处理 播放操作控制
 *
 */

 import { isSupported } from '@/util/util'
 import flvjs from 'flv.js'

let liveMixin = {
  methods: {
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
          url: this.liveURL
        });

        try {
          flvPlayer.attachMediaElement(audioEl);
          flvPlayer.load();
          flvPlayer.play();
        } catch(evt) {
          setTimeout(()=>{
            this.supportFLV();
          }, 3000)
        }

        setTimeout(()=>{
          audioEl.play();
        }, 3000)

        // this.flvPlayer = flvPlayer;
        this.playState = 1;
      }
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

      // 避免音频没有加载不播放问题
      setTimeout(()=>{
        audioEl.play();
      }, 500)

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

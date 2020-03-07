/*
 * 学生接收器 视频控制条操作
 * @author: chenzhou
 * @update: 2019.9.27
 * @desc
 *
 */


import { isSupported } from '@/util/util'
let screenfull = require('screenfull');
import Danmaku from 'danmaku';

let fullscreenMixin = {
  methods: {
    /**
     * @method 视频全屏
     * @params
     */
    handleVideoFullscreen(evt) {
      let videoWrapEl =  this.$el.querySelector('.J_live');

      this.videoFullscreen = true;
      screenfull.request(videoWrapEl).then(()=>{
        // this.videoFullscreen = true;
        screenfull.on('change', () => {
          console.log('Am I fullscreen?', screenfull.isFullscreen ? 'Yes' : 'No');

          if(!screenfull.isFullscreen) {
            this.videoFullscreen = false;
          }
        });

        // 创建弹幕引擎
        this.visibleDanmu && this.initVideoDanmu();
      });
    },

    /**
     * @method 初始化弹幕
     * @params
     */
    initVideoDanmu() {
      let options = {
        container: this.$el.querySelector('.J_video_danmu'),
        comments: [],
        speed: 144
      };
      let danmaku = new Danmaku(options);

      this.videoDanmaku = danmaku;
    },

    /**
     * @method 退出全屏全屏
     * @params
     */
    handleVideoExitFullscreen() {
      this.videoFullscreen = false;

      if(screenfull.isFullscreen) {
        screenfull.exit()

        // 销毁弹幕库
        if(this.videoDanmaku) {
          this.videoDanmaku.destroy();
        }
      }
    },

    handleClosedTip() {
      this.visibleProblemTip = false;
    },

    handleAnwser() {
      let slide = this.problem;
      this.$router.push({ path: slide.pageURL + slide.index });
      // 提示去掉
      this.visibleProblemTip = false;

      if(screenfull.isFullscreen) {
        screenfull.exit()
      }
    },


     /*
    * @method 直播音频停止直播
    * @params
    */
    handlestopVideo() {
      let audioEl = document.getElementById('player');

      if(this.playLoading) {
        return this;
      }

      let flvPlayer = this.flvPlayer;
      flvPlayer.unload();
      flvPlayer.detachMediaElement();

      audioEl.pause();

      this.playState = 0;
      this.saveLiveStatus(this.playState);
    },

    /*
    * @method 直播音频播放
    * @params
    */
    handleplayVideo() {
      let audioEl = document.getElementById('player');
      if(this.flvPlayer) {
        try {
          let flvPlayer = this.flvPlayer;
          flvPlayer.unload();
          flvPlayer.detachMediaElement();
          flvPlayer.attachMediaElement(audioEl);
          flvPlayer.load();
          flvPlayer.play().then(() => {
            this.playLoading = false;
            this.playState = 1;
            this.liveStatusTips = '';
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
        audioEl.play();
      }

      this.playState = 1;
      this.saveLiveStatus(this.playState);
    },


    handleClosedTopTip() {
      this.visibleTip = false;

      let lessonID = this.lessonID;
      let key = 'lesson-tip-cloesed-' + lessonID;

      if(isSupported(window.localStorage)) {
        localStorage.setItem(key, true);
      }
    }

  }
}


export default fullscreenMixin;

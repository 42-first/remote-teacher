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
      let videoWrapEl =  this.$el.querySelector('.J_live_wrap');

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

    handleClosedTopTip() {
      this.visibleTip = false;

      let lessonID = this.lessonID;
      let key = 'lesson-tip-cloesed-' + lessonID;

      if(isSupported(window.localStorage)) {
        localStorage.setItem(key, true);
      }
    },

    /**
     * @method 显示更多操作
     * @params
     */
    handleVisibleMore(visibleMore) {
      this.visibleMore = visibleMore;
    },

    /**
     * @method 显示发送弹幕
     * @params
     */
    handleVisibleDanmu(evt) {
      this.setVisibleDanmuSend(true);
    },

    /**
     * @method 显示分组
     * @params
     */
    handleVisibleGroup(evt) {
      let src = '/team/student/' + this.classroom.classroomId + '?lessonid=' + this.lessonID;

      this.$router.push({ name: 'team-page', query: { src: encodeURIComponent(src) } });
    },

    /**
     * @method 显示投稿
     * @params
     */
    handleVisibleSubmission(evt) {
      let path = `/${this.lesson.lessonID}/submission`;
      this.$router.push({ path });

      // 将当前页设置为空 否则发投稿的时候可能自动翻页
      this.setCurrSlide(null);
    },

  }
}


export default fullscreenMixin;

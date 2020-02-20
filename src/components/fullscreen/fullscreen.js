/*
 * 学生接收器 视频控制条操作
 * @author: chenzhou
 * @update: 2019.9.27
 * @desc
 *
 */

let screenfull = require('screenfull');


let fullscreenMixin = {
  methods: {
    /**
     * @method 视频全屏
     * @params
     */
    handleVideoFullscreen(evt) {
      let videoWrapEl =  this.$el.querySelector('.J_live');
      screenfull.request(videoWrapEl).then(()=>{
        this.videoFullscreen = true;
      });
    },

    /**
     * @method 退出全屏全屏
     * @params
     */
    handleVideoExitFullscreen() {
      this.videoFullscreen = false;

      if(screenfull.isFullscreen) {
        screenfull.exit()
      }
    }

  }
}


export default fullscreenMixin;

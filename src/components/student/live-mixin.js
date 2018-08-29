/*
 * 学生接收器 直播处理
 * @author: chenzhou
 * @update: 2018.8.29
 * @desc 加载hls hls处理 播放操作控制
 *
 */


let liveMixin = {
  methods: {
    /*
    * @method 加载hls库
    *
    */
    loadHLS() {
      let self = this;

      require(['hls.js',], function(hls) {
        self.hls = hls;

        self.supportHLS(hls);
      })
    },

    /*
    * @method 直播音频兼容hls
    * @params
    */
    supportHLS(Hls) {
      let audioEl = document.getElementById('player');

      if(Hls.isSupported()) {
        var hls = new Hls();
        hls.loadSource(this.liveURL);
        hls.attachMedia(audioEl);
        hls.on(Hls.Events.MANIFEST_PARSED,function() {
          audioEl && audioEl.play();
        });
      }
      // hls.js is not supported on platforms that do not have Media Source Extensions (MSE) enabled.
      // When the browser has built-in HLS support (check using `canPlayType`), we can provide an HLS manifest (i.e. .m3u8 URL) directly to the video element throught the `src` property.
      // This is using the built-in support of the plain video element, without using hls.js.
      // Note: it would be more normal to wait on the 'canplay' event below however on Safari (where you are most likely to find built-in HLS support) the video.src URL must be on the user-driven
      // white-list before a 'canplay' event will be emitted; the last video event that can be reliably listened-for when the URL is not on the white-list is 'loadedmetadata'.
      else if (audioEl.canPlayType('application/vnd.apple.mpegurl')) {
        audioEl.src = this.liveURL;
        audioEl.addEventListener('loadedmetadata',function() {
          audioEl.play();
        });
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
    },

    /*
    * @method 直播音频播放
    * @params
    */
    handleplay() {
      let audioEl = document.getElementById('player');
      audioEl.play();
      this.playState = 1;
    },

  }
}


export default liveMixin;

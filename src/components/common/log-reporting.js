/*
 * 学生接收器 日志上报
 * @author: chenzhou
 * @update: 2020.1.27
 * @desc
 *
 */


let logMixin = {
  methods: {
    /**
     * @method 系统信息
     * @params
     */
    setSystem() {
      let system = {
        u: this.userID,
        lessonid: this.lessonID,
        ua: navigator.userAgent,
        // 直播地址
        liveurl: this.liveURL,
        // 网络环境
        net: 'wifi',
        // 客户端：h5 wx_app
        p: 'h5',
        // 业务线
        lob: 'ykt',
        // 服务商
        n: 'sjy',
        // 直播类型
        t: 'live-video',
        // 事件
        et: ''
      };

      if(this.liveType === 1) {
        system['t'] = 'live-audio';
      }

      typeof wx !== 'undefined' && wx.getNetworkType({
        success: (res) => {
          // 返回网络类型2g，3g，4g，wifi
          system['net'] = res.networkType;
          this.system = system;
        }
      });

      this.system = system;
    },

    /**
     * @method 视频事件监听
     * @params
     */
    handleLogEvent() {
      let liveEl = document.getElementById('player');
      // let events = ['play', 'pause', 'error', 'stalled', 'waiting', 'loadstart', 'loadeddata' ];
      let events = [ 'error', 'stalled', 'waiting' ];

      this.setSystem();

      // 监听事件
      events.forEach((evt)=>{
        liveEl.addEventListener(evt, ()=>{
          let system = this.system;
          system['et'] = evt;

          this.reportLog(system);

          this.detectionWaiting(evt);
        });
      })
    },

    /**
     * @method 检测直播卡顿
     * @params
     */
    detectionWaiting(evt) {
      let liveDetection = this.liveDetection;
      let timers = liveDetection && liveDetection['waiting'] || 0;
      let now = (new Date()).getTime();
      let dt = liveDetection && liveDetection.dt || now;
      let duration = (now - dt)/1000;
      if(evt === 'waiting') {
        timers = timers + 1;
      } else {
        timers = 0;
      }

      // 检测到大于三次 重新拉流
      if(timers > 3 && duration < 15 || evt === 'error') {
        if(this.liveType === 2) {
          setTimeout(()=>{
            this.flvPlayer.unload();
            this.flvPlayer.detachMediaElement();
            this.createFlvPlayer();
          }, 3500)
        } else if(this.liveType === 1) {
          setTimeout(()=>{
            this.Hls && this.supportHLS(this.Hls);
          }, 3000)
        }
      }

      this.liveDetection['waiting'] = timers;

      if(timers === 1) {
        this.liveDetection['dt'] = now;
      }
    },

    /**
     * @method 视频事件监听
     * @params
     */
    reportLog(log) {
      let URL = '/video-log/log/unified/';
      let params = {
        // 'uip': '127.0.0.1',
        'data': log,
        'ts_ms': (new Date()).getTime()
      };

      request.post(URL, params);
    },

  }
}


export default logMixin;

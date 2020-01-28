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
        userid: this.userID,
        lessonid: this.lessonID,
        ua: navigator.userAgent,
        // 网络环境
        net: 'wifi',
        // 客户端：h5 wx_app
        p: 'h5',
        // 业务线
        lob: 'ykt',
        // 服务商
        n: 'sjy',
        // 事件
        et: '',
      };

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
      let events = [ 'play', 'pause', 'error', 'stalled', 'waiting' ];

      this.setSystem();

      // 监听事件
      events.forEach((evt)=>{
        liveEl.addEventListener(evt, ()=>{
          let system = this.system;
          system['et'] = evt;

          this.reportLog(system);
        });
      })
    },

    /**
     * @method 视频事件监听
     * @params
     */
    reportLog(log) {
      let URL = '/video-log/log/unified/';
      let params = {
        // 'ip': '127.0.0.1',
        'log': log,
        'time_stamp': (new Date()).getTime()
      };

      console.dir(params);

      request.post(URL, params)
      .then((res) => {
      });
    },

  }
}


export default logMixin;

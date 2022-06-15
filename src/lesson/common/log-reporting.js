/*
 * 学生接收器 日志上报
 * @author: chenzhou
 * @update: 2020.1.27
 * @desc
 *
 */

// 记录上报事件
let reportMap = new Map();

let logMixin = {
  data() {
    return {
      // 直播打点日志
      liveLogs: {
        // 日志开始时间
        startTime: null,
        // 上次打点打点时间
        lastLogTime: null,
        logs: [],
      },
      // 直播打点结构
      heartLog: {
        // 用户端时间
        ts: 0,
        // 心跳间隔
        i: 20,
        // 打点类型
        et: 'heartbeat',
        // 终端
        p: 'web',
        t: 'live',
        // 用户ID
        u: '',
        // 课程ID
        c: '',
        // 该字段传lessonId(已沟通)
        classroomid: '',
        // 服务商
        n: 'kwai',
        // 业务线
        lob: 'ykt',
        cp: 1,
        fp: 0,
        tp: 0,
        d: 1,
        pg: 1,
        sp: 1,
        sq: 1,
      },
      // 互动直播上报video-log timer
      interactiveLogTimer: null
    }
  },
  methods: {
    /**
     * @method 直播打点
     * @params n 默认都是kwai 互动直播的是kwai_rtmp
     */
    initHeartLog(n = 'kwai') {
      let log = this.heartLog;

      try {
        this.heartLog = Object.assign({}, log, {
          p: (function() {
            var sUserAgent = navigator.userAgent.toLowerCase();
            if(sUserAgent && /flutterapp/i.test(sUserAgent)){
              return 'app-h5'
            }else if(window.__wxjs_environment && window.__wxjs_environment === 'miniprogram'){
              return 'minimp-h5'
            }else if(sUserAgent && /MicroMessenger/i.test(sUserAgent)){
              return 'gzh-h5'
            }else if(sUserAgent && /(ipad|iphone os|midp|rv:1.2.3.4|ucweb|android|windows ce|windows mobile|webview)/i.test(sUserAgent)){
              return 'h5'
            }
            return "web"
          })(),
          u: this.identityId || this.userID,
          t: this.liveType === 1 ? 'ykt_live_audio' : 'ykt_live',
          classroomid: this.classroom && this.classroom.classroomId,
          c: this.classroom && this.classroom.courseId,
          lesson_id: this.lessonID,
          ts: (new Date()).getTime(),
          v: this.liveId || 1,
          n
        });
      } catch(error) {
        console.error('[initHeartLog] exception:%s', error.message);
      }
    },

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
        liveurl: this.logLiveurl || this.liveURL,
        // 网络环境
        net: 'wifi',
        // 客户端：h5 wx_app web
        p: this.isWeb ? 'web': 'h5',
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
        liveEl && liveEl.addEventListener(evt, ()=>{
          let system = this.system;
          system['et'] = evt;

          this.reportStrategy(system)
          // this.reportLog(system);

          this.detectionWaiting(evt);
        });
      })

      // 新增直播打点事件
      if(liveEl) {
        this.initHeartLog();
        liveEl.addEventListener('timeupdate', this.handleTimeupdate)
      }
    },

    /**
     * @method 取消视频事件订阅（多次开关直播）
     * @params
     */
    removeEventListeners() {
      let liveEl = document.getElementById('player');

      if(liveEl) {
        liveEl.removeEventListener('timeupdate', this.handleTimeupdate)
      }

      // 有互动直播的timer 清除掉
      this.interactiveLogTimer && clearInterval(this.interactiveLogTimer)

      // 上报一次打点数据
      let liveLogs = this.liveLogs;
      if(liveLogs && liveLogs.logs && liveLogs.logs.length) {
        this.reportLiveLog(liveLogs.logs);
      }
    },

    /**
     * @method 直播打点进度检测
     * @params
     */
    handleTimeupdate(evt) {
      const dt = (new Date()).getTime();
      let liveLogs = this.liveLogs;

      // console.log('timeupdate:', dt);

      if(!liveLogs) {
        return this;
      }

      if(!liveLogs.startTime) {
        // 记录开始时间
        liveLogs.startTime = dt;
        this.liveLogs = liveLogs;
      } else {
        let heartLog = this.heartLog;
        // 距离上次时间间隔计算
        const lastTime = liveLogs.lastLogTime || liveLogs.startTime;
        let duration = (dt - lastTime)/1000;
        // 20s记录一次上报点
        if(duration >= 20) {
          // 记录本地打点
          liveLogs.logs.push(Object.assign({}, heartLog, { ts: dt }));
          liveLogs.lastLogTime = dt;
          this.liveLogs = liveLogs;

          // 2min上报一次
          const startTime = liveLogs.startTime;
          duration = (dt - startTime)/1000;
          if(duration >= 60*2) {
            // 上报直播打点
            this.reportLiveLog(liveLogs.logs);
          }
        }
      }
    },

    /**
     * @method 直播打点上报
     * @params
     */
    reportLiveLog(log) {
      let URL = API.HEARTBEAT;
      let params = {
        'heart_data': log
      };

      request.post(URL, params);

      // reset
      this.liveLogs = {
        startTime: null,
        lastLogTime: null,
        logs: []
      }
    },

    /**
     * @method 上报策略调整
     * @params
     */
    reportStrategy(system) {
      let now = (new Date()).getTime();
      let lastReportTime = this.reportTime || 0;
      // 距离上次上报的时间多少分钟
      let duration = (now - lastReportTime)/1000/60;
      // 最大阈值10min 低于阈值禁止上报
      let threshold = 10;

      if(!system) {
        return this;
      }

      if(duration < threshold && reportMap.has(system.et)) {
        return this;
      }

      if(system && system.et) {
        // 有直播的时候上报
        this.liveType && this.reportLog(system);

        reportMap.set(system.et, system);
        this.reportTime = now;
      }
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
            this.createFlvPlayer();
          }, 3500)
        } else if(this.liveType === 1) {
          let isWeb = this.isWeb;
          if(isWeb) {
            setTimeout(()=>{
              this.createFlvPlayer();
            }, 3000)
          } else {
            setTimeout(()=>{
              this.Hls && this.supportHLS(this.Hls);
            }, 3000)
          }
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

    /**
     * @method 开启debug模式
     * @params
     */
    openDebug() {
      let vconsoleSrc = 'https://cdn.bootcss.com/vConsole/3.3.2/vconsole.min.js';

      this.loadScript(vconsoleSrc)
      .then(()=>{
        var vConsole = new VConsole();
        console.log('debug mode init');
      })
    },

    loadScript(src) {
      return new Promise((resolve, reject) => {
        let scriptNode = document.createElement("script");
        scriptNode.setAttribute("type", "text/javascript");
        scriptNode.setAttribute("src", src);
        document.body.appendChild(scriptNode);

        scriptNode.onload = (evt) => {
          resolve(evt);
        }

        scriptNode.onerror = (evt)=>{
          reject('加载失败');
        }
      });
    },

    /**
     * @method 互动直播 上报video-log
     * @params
     */
    handleReportInteractiveToVideoLog(){
      this.initHeartLog('kwai_rtmp')
      this.interactiveLogTimer = setInterval(() => {
        this.handleTimeupdate()
      }, 1000)
    }

  }
}


export default logMixin;

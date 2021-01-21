/*
 * 会议互动上报
 * @author: chenzhou
 * @update: 2021.1.20
 * @desc
 *
 */


let reportMixin = {
  data() {
    return {
      // 打点上报数据结构
      logData: {
        teacher_user_id: null,
        // 心跳间隔
        interval: 10,
        event_type: 'heartbeat',
        app_version: '1.0',
        // 终端类型
        terminal_type: 'web',
        user_time: (new Date()).getTime(),
        // 订阅的视频流
        videos: [],
      }
    }
  },
  methods: {
    /**
     * @method 会议打点轮询
     * @params
     */
    autoReport() {
      // 轮询10s上报一次
      let now = (new Date()).getTime();
      let logData = this.logData;
      const teacher = this.teacher;
      const teacherIdentityId = teacher && teacher.identityId;

      // init logData
      this.logData = Object.assign(logData, {
        user_time: now,
        teacher_user_id: teacherIdentityId,
        room_id: this.roomId
      })

      if(this.reportTimer) {
        clearInterval(this.reportTimer);
      }

      this.reportTimer = setInterval(()=>{
        this.report();
      }, 10*1000)
    },

    /**
     * @method 会议打点上报
     * @params
     */
    report() {
      let now = (new Date()).getTime();
      let logData = this.logData;
      let interval = 10;

      // 远程流
      const rtcEngine = this.rtcEngine;
      const remoteStreams = rtcEngine.remoteStreams;
      // user_id stream_type resolution duration
      let steams = [];

      if(logData && logData.user_time) {
        interval = Math.round((now - logData.user_time)/1000);
      }

      // 远程流
      if(remoteStreams) {
        remoteStreams.forEach((item)=>{
          if(item.hasVideo()) {
            steams.push(this.getLogStream(item));
          }
        })
      }

      this.logData = Object.assign(logData, {
        user_time: now,
        videos: steams,
        interval
      })

      console.log('logData:', logData);

      this.reportLog(logData);
    },

    /**
     * @method 上报视频格式化
     * @param
     */
    getLogStream(stream) {
      // 时间默认是
      let duration = 10;
      let now = (new Date()).getTime();

      if(stream.createTime) {
        const interval = Math.round((now - stream.createTime)/1000);
        if(interval < 10) {
          duration = interval;
        }
      }

      let resolution = { width: 640, height: 360 };
      const streamType = stream.getType();
      if(streamType === 'auxiliary') {
        resolution = { width: 1280, height: 720 };
      }

      return {
        user_id: stream.getUserId(),
        stream_type: streamType,
        resolution,
        duration
      }
    },

    /**
     * @method 打点上报
     * @param
     */
    reportLog(log) {
      let URL = API.lesson.report_meeting;

      request.post(URL, log).
      then( res => {
        if (res && res.code === 0) {
        }
      }).
      catch(error => {
        console.error('reportLog:', error);
      })
    },

  }
}


export default reportMixin;


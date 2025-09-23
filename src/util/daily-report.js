/*
 * pageview 日活上报
 * @author: chenzhou
 * @update: 2021.9.1
 * @desc
 */


import axios from 'axios'
import Cookies from 'js-cookie'


function getUUID() {
  let _uuid = null
  if(window.localStorage) {
    _uuid = window.localStorage.getItem('_uuid')
  }

  if(!_uuid) {
    _uuid = 'xxxxxyxxxxxyxx4xxxyxxxxxyxxxxxyxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
      return v.toString(16);
    });

    try {
      window.localStorage.setItem('_uuid', _uuid)
    } catch(error) {
    }
  }

  return _uuid;
}


let dailyReport = {
  options: {
    // 上报数据结构
    log: {
      // 平台 1：学堂 2：雨课堂 3：学堂云 ...
      platform: 2,
      terminal_type: 'h5',
      time: (new Date()).getTime(),
      language: 'zh_CN',
      // 原始ID 默认UUID
      original_id: getUUID(),
      // 用户ID
      distinct_id: '',
      event: 'page_view',
      properties: {
        channel: ''
      }
    }
  },

  /**
   * @method 直播打点
   * @params
   */
  initLog(data = { terminal: 'h5' }) {
    let log = this.options.log;

    try {
      // 各项目需要根据项目store取
      let uid = data && data.userId || window.userId || window.USERID || log.original_id;

      let properties = Object.assign(
        log.properties,
        {
          channel: '',
          user_agent: navigator.userAgent,
          page_name: document.title,
          host: location.host,
          url: location.href,
          referer: document.referrer,
          original_referrer: document.referrer
        },
        data.properties,
      );

      let lng = Cookies.get('django_language') || 'zh-cn';
      lng = lng === 'zh-cn' ? 'zh_CN' : 'en';

      this.options.log = Object.assign({}, log, {
        time: new Date().getTime(),
        distinct_id: uid,
        terminal_type: (data && data.terminal) || "h5",
        properties,
        language: lng,
      });

      return this.options.log;
    } catch(error) {
      console.error('[initLog] exception:%s', error.message);

      return log;
    }
  },

  /**
   * @method 上报
   * @params
   */
  reportLog(data) {
    let URL = '/video-log/log/track/';

    let log = this.initLog(data);
    if(!log) {
      log = this.options.log;
    }

    const params = {
      'uip': '',
      'data': log,
      'ts_ms': (new Date()).getTime()
    };

    axios.post(URL, params);
  },

  /**
   * @method 更新日志数据
   * @params
   */
  updateLog(data, updateProperties) {
    let log = this.options.log;

    if (updateProperties && typeof data === "object") {
      log.properties = Object.assign(log.properties, data);

      console.log(log.properties)
      return;
    }

    if (log && typeof data === "object") {
      Object.assign(log, data);
    }
  },

  /**
   * @method 点击事件上报
   * @params
   */
  reportClickLog(data) {
    let URL = '/video-log/log/track/';
    let commonLog = this.options.log;

    if(data) {
      if(data.properties && commonLog.properties) {
        data.properties = Object.assign({}, commonLog.properties, data.properties);
      }

      let log = Object.assign({}, commonLog, data, {
        event: data.event,
        time: (new Date()).getTime()
      });

      const params = {
        'uip': '',
        'data': log,
        'ts_ms': (new Date()).getTime()
      };
      axios.post(URL, params);
    }
  },

}


export default dailyReport;

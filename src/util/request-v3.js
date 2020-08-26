import axios from 'axios'
import Cookies from 'js-cookie'

// 新版接口状态码定义 https://www.tapd.cn/42030465/documents/show/1142030465001001744
// 错误码翻译 http://git.sys.xuetangx.info/new-backend/grpc/-/blob/master/src/main/proto/error.json
// http status

/*-----------------------------------------------*\
  首先看http状态 是不是200
  200
  30x 40x 50x

  如果是200 看下返回code
  code 0:成功正常  -0(非零)：异常需要定义好异常对应表
\*-----------------------------------------------*/


const handleResponse = (res) => {
  // 从相应头中读取auth, 后面使用
  if(res.headers && res.headers['set-auth']) {
    window.Authorization = res.headers['set-auth'];
  }

  let status = res.status;
  // 正常http status 200, 无权限也是200需要判断code
  if (res.status === 200) {
    // {
    //   "code": 0,
    //   "msg": "",
    //   "data": { ... }
    // }

    // 是否需要过滤 没有权限 session丢失
    if(res.data && res.data.code) {
      catchCode(res.data.code);
    }

    return Promise.resolve(res.data)
  } else {
    // 50X
    if(status) {
      console.log(res);

      switch (status) {
        // 重定向接口不处理(处理需要沟通好)
        case 301:
        case 302:

          break;

        // 输入格式错误
        case 400:
        case 404:
          // 只打印不处理

          break;

        case 500:
        case 502:
          // TODO：需要上报

          break;

        default:
          break;
      }
    }

    return Promise.reject(res)
  }
}

/**
 * @method 状态码处理
 * @desc 非正常状态码提示
 *       国际化，上报
 */
const catchCode = (code) => {
  if(code && window.$toast) {
    $toast({
      message: window.i18n && window.i18n.t(`code.${code}`) + `(${code})`,
      duration: 3000
    });

    // todo: 后面可能上报
  }
}


// 超时默认60s避免造成阻塞卡顿
axios.defaults.timeout = 60000;

export default {
  get (url, params = {}, headers = {}) {
    params = params || {}

    let queryString = []

    // Object.keys(params).forEach(key => params[key] && queryString.push(`${key}=${params[key]}`))
    Object.keys(params).forEach(key => queryString.push(`${key}=${params[key]}`))

    if (queryString.length > 0) {
      queryString = queryString.join('&')
      url += `?${queryString}`
    }

    if (process.env.NODE_ENV === 'development') {
      axios.defaults.withCredentials = true;
    }

    // app h5 web desktop miniprogram
    axios.defaults.headers['X-Client'] = 'h5';

    // todo: test 正式联调后删除
    // Cookies.set('sid', '1c5db47f09c19ae187f3f126773cfa01');
    // console.log(axios.defaults.headers['Cookie'])

    // 课上接收器 遥控器使用
    if(window.Authorization) {
      axios.defaults.headers['Authorization'] = 'Bearer ' + window.Authorization;
    }

    // 灰度发布需要
    if(window.userid) {
      axios.defaults.headers['X-UID'] = window.userid;
    }

    return axios
      .get(url, {
        headers
      })
      .then(function (response, data) {
        return response
      })
      .then(handleResponse)
      .catch(error => {
        return Promise.reject(error)
      })
  },

  post (url, params, headers = {}) {
    params = params || {}

    // 新版接口 不需要csrftoken （如果是老接口 建议使用另外一个request模块）
    // axios.defaults.headers['X-CSRFToken'] = Cookies.get('csrftoken') || ''
    if (process.env.NODE_ENV === 'development') {
      axios.defaults.withCredentials = true;
    }

    return axios
      .post(url, params, {
        headers
      })
      .then(function (response, data) {
        return response
      })
      .then(handleResponse)
      .catch(error => {
        return Promise.reject(error)
      })
  }
}

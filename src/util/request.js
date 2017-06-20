import axios from 'axios'
// import Promise from 'bluebird'
import Cookies from 'js-cookie'

// Promise
// window.Promise = window.Promise || Promise;

!Promise && require(['bluebird'], function(Promise) {
  window.Promise = window.Promise || Promise;
})

const handleResponse = (res) => {
  // 支付接口使用的 status 判断
  if (res.data.success || res.data.status === 0) {
    return Promise.resolve(res.data)
  } else {
    // 没有权限
    if(res.data.status_code === 2) {
      location.href = '/v/index/course/normalcourse/error/2';
    }

    // 没有填写信息 跳转个人信息完善页
    if(res.data.status_code === 5) {
      location.href = '/v/index/edituserinfo_simple?next_url=back';
    }

    return Promise.reject(res.data)
  }
}
export default {
  get (url, params) {
    params = params || {}
    let queryString = []

    Object.keys(params).forEach(key => params[key] && queryString.push(`${key}=${params[key]}`))

    if (queryString.length > 0) {
      queryString = queryString.join('&')
      url += `?${queryString}`
    }

    return axios
      .get(url)
      .then(function (response, data) {
        return response
      })
      .then(handleResponse)
      .catch(error => {
        return Promise.reject(error)
      })
  },

  post (url, params) {
    params = params || {}

    // post统一csrftoken
    axios.defaults.headers['X-CSRFToken'] = Cookies.get('csrftoken') || ''

    return axios
      .post(url, params)
      .then(function (response, data) {
        return response
      })
      .then(handleResponse)
      .catch(error => {
        return Promise.reject(error)
      })
  }
}

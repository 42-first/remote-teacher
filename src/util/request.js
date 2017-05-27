import axios from 'axios'
import Promise from 'bluebird'

const handleResponse = (res) => {
  console.log('handleResponse', res.data)

  if (res.data.success) {
    // 成功只返回data数据
    return Promise.resolve(res.data.data)
  } else {
    // status不为0为失败或错误情况
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
        // 日志收集
        console.log(error)
        return Promise.reject(error)
      })
  },

  post (url, params) {
    params = params || {}

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

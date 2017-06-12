import axios from 'axios'
import Promise from 'bluebird'
import Cookies from 'js-cookie'

// Promise
window.Promise = window.Promise || Promise;

// require('bluebird', function(Promise) {
//   window.Promise = window.Promise || Promise;
// })

const handleResponse = (res) => {
  if (res.data.success) {
    return Promise.resolve(res.data)
  } else {
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

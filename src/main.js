// created by liujunyang 2017-05-24

// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.

import Vue from 'vue'
import App from './App'
import router from './router/teacher'
let VueTouch = require('vue-touch') // 不是ES6模块，而是CommonJs模块
Vue.use(VueTouch, {name: 'v-touch'})

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  template: '<App/>',
  components: { App }
})

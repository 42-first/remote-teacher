// created by liujunyang 2017-11-17

// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from '@/pages/teacher/teacher.vue'
import router from '@/router/index-teacher'
import store from '@/pages/teacher/store';
import('pubsub-js').then(res => {
	window.T_PUBSUB = res
})

let VueTouch = require('vue-touch') // 不是ES6模块，而是CommonJs模块
Vue.use(VueTouch, {name: 'v-touch'})

Vue.config.productionTip = false
window.Vue = Vue // 设为全局变量，有时调用其 nextTick 方法
window.STORE = store // 在 router 中判断是否刷新页面倒是 socket 无效

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  template: '<App/>',
  components: { App }
})

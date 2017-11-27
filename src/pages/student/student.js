// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from '@/pages/student/student.vue'
import router from '@/router/index-student'
// 引入订阅发布解决路由子组件和父组件通信问题
import('pubsub-js').then(res => {
  window.PubSub = res
})

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  template: '<App/>',
  components: { App }
})

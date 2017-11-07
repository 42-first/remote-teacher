// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import VueI18n from 'vue-i18n'

import App from '@/pages/student/student.vue'
import router from '@/router/index-student'

// 通过插件的形式挂载
Vue.use(VueI18n)

const i18n = new VueI18n({
  // 语言标识
  locale: 'en',
  messages: {
    'zh_CN': resolve => require(['@/language/zh_CN'], resolve),
    'en': resolve => require(['@/language/en'], resolve)
  }
})

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  i18n,
  el: '#app',
  router,
  template: '<App/>',
  components: { App }
})

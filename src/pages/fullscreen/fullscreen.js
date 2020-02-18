// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import VueI18n from 'vue-i18n'
import Cookies from 'js-cookie'

import App from '@/pages/fullscreen/fullscreen.vue'
import router from '@/router/fullscreen'
// 引入订阅发布解决路由子组件和父组件通信问题
import('pubsub-js').then(res => {
  window.PubSub = res
})

import EnLanguage from '@/language/en'
import ChLanguage from '@/language/zh_CN'

// 通过插件的形式挂载
Vue.use(VueI18n)

let lng = Cookies.get('django_language') || 'zh-cn';
lng = lng === 'zh-cn' ? 'zh_CN' : 'en';

const i18n = new VueI18n({
  // 语言标识
  locale: lng,
  messages: {
    'zh_CN': ChLanguage,
    'en': EnLanguage
  }
})

window.i18n = i18n;


Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  i18n,
  el: '#app',
  router,
  template: '<App/>',
  components: { App }
})

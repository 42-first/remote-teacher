// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import VueI18n from 'vue-i18n'
import Cookies from 'js-cookie'

import App from '@/pages/student/student.vue'
import router from '@/router/index-student'
import store from './store'
// 引入订阅发布解决路由子组件和父组件通信问题
import('pubsub-js').then(res => {
  window.PubSub = res
})

import EnLanguage from '@/language/en'
import ChLanguage from '@/language/zh_CN'

import { loadScript, isFlutterApp, isRainclassroomApp } from '@/util/util'

setTimeout(() => {
  if (window.__wxjs_environment === 'miniprogram' || isFlutterApp() || isRainclassroomApp()) {
    return
  } else {
    let youmengSrc = 'https://v1.cnzz.com/z.js?id=1281406241&async=1'
    loadScript(youmengSrc) 
    // let jiguangSrc = 'https://web-stat.jiguang.cn/web-janalytics/scripts/janalytics-web.min.js'
    // loadScript(jiguangSrc)
    // .then(() => {
    //   (function () {
    //     if (window.JAnalyticsInterface) {
    //       window.JAnalyticsInterface.init({
    //         appkey: 'fcdf8e635093adde6bef4265',
    //         debugMode: false,
    //         channel: 'rainH5',
    //         loc: false, // 设置是否尝试获取位置信息上报，默认为 true
    //         singlePage: true // 设置是否为单页面，默认为 false
    //       })
    //     }
    //   })()
    // })
  }
}, 3000)

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
  store,
  template: '<App/>',
  components: { App }
})

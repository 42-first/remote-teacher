// created by liujunyang 2017-11-17

// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from '@/pages/teacher/teacher.vue'
import router from '@/router/index-teacher'
import store from '@/pages/teacher/store';
// 检测是否https
import {initProtocal, loadScript} from '@/util/util'
import('pubsub-js').then(res => {
	window.T_PUBSUB = res
})

setTimeout(() => {
  if (window.__wxjs_environment === 'miniprogram') {
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

let VueTouch = require('vue-touch') // 不是ES6模块，而是CommonJs模块
Vue.use(VueTouch, {name: 'v-touch'})

import Cookies from 'js-cookie'
import VueI18n from 'vue-i18n'
// 通过插件的形式挂载
Vue.use(VueI18n)

import EnLanguage from '@/language/en'
import ChLanguage from '@/language/zh_CN'

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

window.i18n = i18n
window.document.title = i18n.t('remotectrl')

Vue.config.productionTip = false
window.Vue = Vue // 设为全局变量，有时调用其 nextTick 方法
window.STORE = store // 在 router 中判断是否刷新页面导致 socket 无效

Vue.component('ykt-toast', () => import('@/components/teacher-restructure/common/toast'))
Vue.component('ykt-modal', () => import('@/components/teacher-restructure/common/modal'))
Vue.component('ykt-tips-modal', () => import('@/components/teacher-restructure/common/tipsModal'))

/* eslint-disable no-new */
new Vue({
	i18n,
  el: '#app',
  router,
  store,
  template: '<App/>',
  components: { App }
})

// 检测http协议改成https
initProtocal();

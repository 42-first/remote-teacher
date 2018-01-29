// created by liujunyang 2017-11-17

// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from '@/pages/teacher/teacher.vue'
import router from '@/router/index-teacher'
import store from '@/pages/teacher/store';
// 检测是否https
import {initProtocal} from '@/util/util'
import('pubsub-js').then(res => {
	window.T_PUBSUB = res
})

let VueTouch = require('vue-touch') // 不是ES6模块，而是CommonJs模块
Vue.use(VueTouch, {name: 'v-touch'})

import Cookies from 'js-cookie'
import VueI18n from 'vue-i18n'
// 通过插件的形式挂载
Vue.use(VueI18n)

import EnLanguage from '@/language/en'
import ChLanguage from '@/language/zh_CN'

let lng = Cookies.get('django_language') || 'zh_CN';
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

Vue.config.productionTip = false
window.Vue = Vue // 设为全局变量，有时调用其 nextTick 方法
window.STORE = store // 在 router 中判断是否刷新页面导致 socket 无效

Vue.component('ykt-toast', () => import('@/components/teacher-restructure/common/toast'))
Vue.component('ykt-modal', () => import('@/components/teacher-restructure/common/modal'))

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

// created by liujunyang 2017-05-24

// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.

import Vue from 'vue'
import App from './App'
import router from './router/teacher'
let VueTouch = require('vue-touch') // 不是ES6模块，而是CommonJs模块
Vue.use(VueTouch, {name: 'v-touch'})

import VueI18n from 'vue-i18n'
// 通过插件的形式挂载
Vue.use(VueI18n)

import EnLanguage from '@/language/en'
import ChLanguage from '@/language/zh_CN'

const i18n = new VueI18n({
  // 语言标识
  locale: 'zh_CN',
  messages: {
    'zh_CN': ChLanguage,
    'en': EnLanguage
  }
})

Vue.config.productionTip = false
window.Vue = Vue // 设为全局变量，有时调用其 nextTick 方法

/* eslint-disable no-new */
new Vue({
	i18n,
  el: '#app',
  router,
  template: '<App/>',
  components: { App }
})

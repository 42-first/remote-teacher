import 'mint-ui/lib/loadmore/style.css';

import Vue from 'vue'
import Router from 'vue-router'
import FastClick from 'fastclick'
import Loadmore from 'mint-ui/lib/loadmore';
import StudentPresentation from '@/components/student/student-presentation'
import PPT from '@/components/student/ppt'

Vue.use(Router)
Vue.component('loadmore', Loadmore);

FastClick.attach(document.body)

export default new Router({
  base: process.env.NODE_ENV == 'production' ? "/remote" : "/",
  // history
  mode: 'hash',
  routes: [
    {
      path: '/',
      name: 'onfound',
      component: PPT,
    },
    {
      path: '/:lessonID',
      name: 'student-presentation-page',
      component: StudentPresentation,
      children: [
        {
          // 当 /:lessonID/ppt 匹配成功，
          // UserProfile 会被渲染在 User 的 <router-view> 中
          path: 'ppt/:id',
          component: PPT
        },
        {
          // 当 /:lessonID/exercise 匹配成功
          // UserPosts 会被渲染在 User 的 <router-view> 中
          path: 'exercise/:id',
          component: PPT
        }
      ]
    }
  ]
})

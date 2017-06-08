import 'mint-ui/lib/loadmore/style.css'

import Vue from 'vue'
import Router from 'vue-router'
// import FastClick from 'fastclick'
import Loadmore from 'mint-ui/lib/loadmore'
import StudentPresentation from '@/components/student/student-presentation'
import HongBao from '@/components/student/hongbao'
import Exercise from '@/components/student/exercise'
import Submission from '@/components/student/submission'

Vue.use(Router)
Vue.component('loadmore', Loadmore);

// FastClick.attach(document.body)

export default new Router({
  base: process.env.NODE_ENV == 'production' ? "/remote" : "/",
  // history
  mode: 'hash',
  routes: [
    {
      path: '/',
      name: 'onfound',
      component: HongBao,
    },
    {
      path: '/:lessonID',
      name: 'student-presentation-page',
      component: StudentPresentation,
      children: [
        {
          // 当 /:hongbao/ppt 匹配成功，
          // hongbao 会被渲染在 User 的 <router-view> 中
          path: 'hongbao/:index',
          component: HongBao
        },
        {
          path: 'exercise/:index',
          component: Exercise
        },
        {
          path: 'submission',
          component: Submission
        }
      ]
    }
  ]
})

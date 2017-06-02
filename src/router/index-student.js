import Vue from 'vue'
import Router from 'vue-router'
import StudentPresentation from '@/components/student/student-presentation'
import PPT from '@/components/student/ppt'

Vue.use(Router)

export default new Router({
  base: process.env.NODE_ENV == 'production' ? "/remote" : "/",
  // history
  mode: 'hash',
  routes: [
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

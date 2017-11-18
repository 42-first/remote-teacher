import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/components/teacher-restructure/home'

const Collumresult = () => import('@/components/teacher-restructure/collumresult')
const Submission = () => import('@/components/teacher-restructure/submission')
const RemoteList = () => import('@/components/teacher-restructure/remote-list')

Vue.use(Router)

const router = new Router({
  base: process.env.NODE_ENV === 'production' ? '/lesson/teacher' : '/',
  mode: process.env.NODE_ENV === 'production' ? 'history' : 'hash',
  routes: [
    {
      path: '/',
      name: 'remote-list',
      component: RemoteList
    },
    {
      path: '/:lessonid',
      name: 'home',
      component: Home
    },
    {
      path: '/collumresult/:problemid',
      name: 'collumresult',
      component: Collumresult
    },
    {
      path: '/submission',
      name: 'submission',
      component: Submission
    },
    {
      path: '*',
      name: 'remote-fallback',
      component: RemoteList
    }
  ]
})

router.beforeEach((to, from, next) => {
  // 订阅发布重置
  let pubSub = window.parent && window.parent.PubSub || null;
  pubSub && pubSub.publish( 'reset', { msg: 'reset' } );
  next()
})

export default router

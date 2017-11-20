import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/components/teacher-restructure/home'

const Collumresult = () => import('@/components/teacher-restructure/collumresult')
const Subjectiveresult = () => import('@/components/teacher-restructure/subjectiveresult')
const Paper = () => import('@/components/teacher-restructure/paper')
const Danmu = () => import('@/components/teacher-restructure/danmu')
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
      path: '/subjectiveresult/:problemid',
      name: 'subjectiveresult',
      component: Subjectiveresult
    },
    {
      path: '/paper',
      name: 'paper',
      component: Paper
    },
    {
      path: '/danmu',
      name: 'danmu',
      component: Danmu
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

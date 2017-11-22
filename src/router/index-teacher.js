import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/components/teacher-restructure/home'

const RemoteList = () => import('@/components/teacher-restructure/remote-list')
const Randomcall = () => import('@/components/teacher-restructure/randomcall')
const Collumresult = () => import('@/components/teacher-restructure/collumresult')
const CollumresultDetail = () => import('@/components/teacher-restructure/collumresult-detail')
const Redpacket = () => import('@/components/teacher-restructure/redpacket')
const Redpacketlist = () => import('@/components/teacher-restructure/redpacketlist')
const Subjectiveresult = () => import('@/components/teacher-restructure/subjectiveresult')
const Member = () => import('@/components/teacher-restructure/member')
const Paper = () => import('@/components/teacher-restructure/paper')
const Danmu = () => import('@/components/teacher-restructure/danmu')
const Submission = () => import('@/components/teacher-restructure/submission')
const Quizresult = () => import('@/components/teacher-restructure/quizresult')
const Quizresultdetail = () => import('@/components/teacher-restructure/quizresultdetail')


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
      path: '/collumresult-detail/:problemid',
      name: 'collumresult-detail',
      component: CollumresultDetail
    },
    {
      path: '/redpacket/:problemid',
      name: 'redpacket',
      component: Redpacket
    },
    {
      path: '/redpacketlist/:problemid',
      name: 'redpacketlist',
      component: Redpacketlist
    },
    {
      path: '/subjectiveresult/:problemid',
      name: 'subjectiveresult',
      component: Subjectiveresult
    },
    {
      // 随便加个后缀，避免刷新页面时“/member”匹配到 /:lessonid
      path: '/member/xxx',
      name: 'member',
      component: Member
    },
    {
      path: '/randomcall/xxx',
      name: 'randomcall',
      component: Randomcall
    },
    {
      path: '/paper/xxx',
      name: 'paper',
      component: Paper
    },
    {
      path: '/danmu/xxx',
      name: 'danmu',
      component: Danmu
    },
    {
      path: '/submission/xxx',
      name: 'submission',
      component: Submission
    },
    {
      path: '/quizresult/:quizid',
      name: 'quizresult',
      component: Quizresult
    },
    {
      path: '/quizresultdetail/:quizid',
      name: 'quizresultdetail',
      component: Quizresultdetail
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

  // socket 无法使用的话，功能不正常，回根页面
  if (to.name !== 'home' && (!STORE.state.socket || !STORE.state.socket.send)) {
    next({name: 'home', params: {lessonid: STORE.state.lessonid}})
    return;
  }
  next()
})

export default router

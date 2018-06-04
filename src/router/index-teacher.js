import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/components/teacher-restructure/home'
import {setSize} from '@/components/teacher-restructure/util/util'

const RemoteList = () => import('@/components/teacher-restructure/remote-list')
const Randomcall = () => import('@/components/teacher-restructure/randomcall')
const Collumresult = () => import('@/components/teacher-restructure/collumresult')
const CollumresultDetail = () => import('@/components/teacher-restructure/collumresult-detail')
const Redpacket = () => import('@/components/teacher-restructure/redpacket')
const Redpacketlist = () => import('@/components/teacher-restructure/redpacketlist')
const Subjectiveresult = () => import('@/components/teacher-restructure/subjectiveresult')
const Member = () => import('@/components/teacher-restructure/member')
const Paper = () => import('@/components/teacher-restructure/paper2')
const Paperfolder = () => import('@/components/teacher-restructure/paper-folder')
const Danmu = () => import('@/components/teacher-restructure/danmu')
const Submission = () => import('@/components/teacher-restructure/submission')
const StateSet = () => import('@/components/teacher-restructure/stateSet')
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
      // 解决微信确认支付路径的时候，ios 取 Landing Page， Android 取 Current Page 导致微信支付合法url认定不一致的问题
      // 微信会把 ? 后面的全给忽略掉，所以多长都不会占用路径层级了
      // http://get.ftqq.com/8572.get
      // path: '/redpacket?/:problemid',

      // 但是华为 p9 p10 手机却支付不了，干脆为了苹果的landing page 全都改为和landing page一样的一层路由好了，problemid 用 query 的方式传入
      // 而且为了华为 P9 P10 要在下面 afterEach 中异步进行微信config
      // https://github.com/vuejs/vue-router/issues/481
      path: '/redpacketqueryproblemid',
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
      path: '/paperfolder/:folderid',
      name: 'paperfolder',
      component: Paperfolder
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
    // 课堂动态设置
    {
      path: '/stateSet/xxx',
      name: 'stateSet',
      component: StateSet
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
  // 试卷页进入试卷详情页，不关闭试卷投屏，进入其他页面时候都关闭投屏
  if (from.name === 'quizresult' && to.name !== 'quizresultdetail') {
    let str = JSON.stringify({
      'op': 'closequizresult',
      'lessonid': STORE.state.lessonid,
      'quizid': from.params.quizid
    })
    localStorage['isTouping'+from.params.quizid] = false

    STORE.state.socket.send(str)
  }

  // 柱状图页进入试题详情页、课堂红包页，不关闭试卷投屏，进入其他页面时候都关闭柱状图投屏
  if (from.name === 'collumresult' && to.name !== 'collumresult-detail' && to.name !== 'redpacket' && to.name !== 'redpacketlist') {
    let str = JSON.stringify({
      'op': 'closeproblemresult',
      'lessonid': STORE.state.lessonid,
      'problemid': from.params.problemid
    })

    STORE.state.socket.send(str)
  }
  next()
})

router.afterEach(function (to, from){
  setTimeout(()=>{
      // 解决 android手机字体缩放
      setSize();
  }, 1050);

})

// 解决 android手机字体缩放
setSize();

export default router

import 'mint-ui/lib/toast/style.css'
import 'mint-ui/lib/message-box/style.css'

import Vue from 'vue'
import Router from 'vue-router'
import Toast from 'mint-ui/lib/toast'
import MessageBox from 'mint-ui/lib/message-box'

import Home from '@/components/teacher-restructure/home'
import {setSize} from '@/components/teacher-restructure/util/util'

const RemoteList = () => import('@/components/teacher-restructure/remote-list')
const Randomcall = () => import('@/components/teacher-restructure/randomcall')
const Objectiveresult = () => import('@/components/teacher-restructure/objectiveresult')
const Collumresult = () => import('@/components/teacher-restructure/collumresult')
const CollumresultDetail = () => import('@/components/teacher-restructure/collumresult-detail')
const Fillblankresult = () => import('@/components/teacher-restructure/fillblankresult')
const FillblankresultDetail = () => import('@/components/teacher-restructure/fillblankresult-detail')
const Redpacket = () => import('@/components/teacher-restructure/redpacket')
const Redpacketlist = () => import('@/components/teacher-restructure/redpacketlist')
const Subjectiveresult = () => import('@/components/teacher-restructure/subjectiveresult')
const Member = () => import('@/components/teacher-restructure/member')
const Paper = () => import('@/components/teacher-restructure/paper2')
const Paperfolder = () => import('@/components/teacher-restructure/paper-folder')
const Danmu = () => import('@/components/teacher-restructure/danmu')
const Submission = () => import('@/components/teacher-restructure/submission')
const PostSubmission = () => import('@/components/student/submission')
const SubmissionList = () => import('@/components/student/submission-list')
const StateSet = () => import('@/components/teacher-restructure/stateSet')
const Quizresult = () => import('@/components/teacher-restructure/quizresult')
const Quizresultdetail = () => import('@/components/teacher-restructure/quizresultdetail')
// 白板列表
const BoardList = () => import('@/components/teacher-restructure/board-list')
const StudentExpression = () => import('@/components/teacher-restructure/student_expression')
const SearchStudent = () => import('@/components/teacher-restructure/search_student')

Vue.use(Router)
Vue.$messagebox = Vue.prototype.$messagebox = MessageBox;
Vue.$toast = Vue.prototype.$toast = Toast;


let meta = {
      keepAlive: true // 不需要缓存
    }

const router = new Router({
  base: process.env.NODE_ENV === 'production' ? '/lesson/teacher' : '/',
  mode: process.env.NODE_ENV === 'production' ? 'history' : 'hash',
  routes: [
    {
      path: '/',
      name: 'remote-list',
      component: RemoteList,
      meta
    },
    {
      path: '/:lessonid',
      name: 'home',
      component: Home,
      meta
    },
    {
      path: '/objectiveresult/:problemid',
      name: 'objectiveresult',
      component: Objectiveresult,
      meta

    },
    {
      path: '/collumresult/:problemid',
      name: 'collumresult',
      component: Collumresult,
      meta
    },
    {
      path: '/collumresult-detail/:problemid',
      name: 'collumresult-detail',
      component: CollumresultDetail,
      meta
    },
    {
      path: '/fillblankresult/:problemid',
      name: 'fillblankresult',
      component: Fillblankresult,
      meta
    },
    {
      path: '/fillblankresult-detail/:problemid',
      name: 'fillblankresult-detail',
      component: FillblankresultDetail,
      meta
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
      component: Redpacket,
      meta
    },
    {
      path: '/redpacketlist/:problemid',
      name: 'redpacketlist',
      component: Redpacketlist,
      meta
    },
    {
      path: '/subjectiveresult/:problemid',
      name: 'subjectiveresult',
      component: Subjectiveresult,
      meta
    },
    {
      // 随便加个后缀，避免刷新页面时“/member”匹配到 /:lessonid
      path: '/member/xxx',
      name: 'member',
      component: Member,
      meta
    },
    {
      path: '/randomcall/xxx',
      name: 'randomcall',
      component: Randomcall,
      meta
    },
    {
      path: '/paper/xxx',
      name: 'paper',
      component: Paper,
      meta
    },
    {
      path: '/paperfolder/:folderid',
      name: 'paperfolder',
      component: Paperfolder,
      meta
    },
    {
      path: '/danmu/xxx',
      name: 'danmu',
      component: Danmu,
      meta
    },
    {
      path: '/submission/xxx',
      name: 'submission',
      component: Submission,
      meta
    },
    {
      path: '/postsubmission/:lessonID',
      name: 'postsubmission',
      component: PostSubmission,
      meta
    },
    {
      path: '/:lessonID/submission_list',
      name: 'student-submissionlist-page',
      component: SubmissionList
    },
    // 课堂动态设置
    {
      path: '/stateSet/xxx',
      name: 'stateSet',
      component: StateSet,
      meta: {
        keepAlive: false
      }
    },
    {
      path: '/quizresult/:quizid',
      name: 'quizresult',
      component: Quizresult,
      meta
    },
    {
      path: '/quizresultdetail/:quizid',
      name: 'quizresultdetail',
      component: Quizresultdetail,
      meta
    },
    {
      path: '/boardlist/:lessonid',
      name: 'boardlist',
      component: BoardList,
      meta
    },
    {
      path: '/stuexpression/:classroomid/:lessonid/:userid',
      name: 'stuexpression',
      component: StudentExpression,
      meta
    },
    {
      path: '/search/:classroomid/:lessonid',
      name: 'search',
      component: SearchStudent,
      meta
    },
    {
      path: '*',
      name: 'remote-fallback',
      component: RemoteList,
      meta
    },
    {
      path: '/v3/:lessonid',
      name: 'teacher-v3',
      component: () => import('@/lesson/teacher/home'),
      meta,
      children: [
        {
          path: 'objectiveresult/:problemid',
          name: 'objectiveresult_v3',
          component: () => import('@/lesson/teacher/objectiveresult'),
          meta
    
        },
        {
          path: 'collumresult-detail/:problemid',
          name: 'collumresult-detail_v3',
          component: () => import('@/lesson/teacher/collumresult-detail'),
          meta
        },
        {
          path: 'fillblankresult-detail/:problemid',
          name: 'fillblankresult-detail_v3',
          component: () => import('@/lesson/teacher/fillblankresult-detail'),
          meta
        },
        {
          path: 'redpacketlist/:problemid',
          name: 'redpacketlist_v3',
          component: () => import('@/lesson/teacher/redpacketlist'),
          meta
        },
        {
          path: 'subjectiveresult/:problemid',
          name: 'subjectiveresult_v3',
          component: () => import('@/lesson/teacher/subjectiveresult'),
          meta
        },
        {
          // 随便加个后缀，避免刷新页面时“/member”匹配到 /:lessonid
          path: 'member/xxx',
          name: 'member_v3',
          component: () => import('@/lesson/teacher/member'),
          meta
        },
        {
          path: 'randomcall/xxx',
          name: 'randomcall_v3',
          component: () => import('@/lesson/teacher/randomcall'),
          meta
        },
        {
          path: 'paper/xxx',
          name: 'paper_v3',
          component: () => import('@/lesson/teacher/paper2'),
          meta
        },
        {
          path: 'paperfolder/:folderid',
          name: 'paperfolder_v3',
          component: () => import('@/lesson/teacher/paper-folder'),
          meta
        },
        {
          path: 'danmu/xxx',
          name: 'danmu_v3',
          component: () => import('@/lesson/teacher/danmu'),
          meta
        },
        {
          path: 'submission/xxx',
          name: 'submission_v3',
          component: () => import('@/lesson/teacher/submission'),
          meta
        },
        {
          path: 'postsubmission/:lessonID',
          name: 'postsubmission_v3',
          component: () => import('@/lesson/student/submission'),
          meta
        },
        {
          path: 'submission_list',
          name: 'student-submissionlist-page_v3',
          component: () => import('@/lesson/student/submission-list')
        },
        // 课堂动态设置
        {
          path: 'stateSet/xxx',
          name: 'stateSet_v3',
          component: () => import('@/lesson/teacher/stateSet'),
          meta: {
            keepAlive: false
          }
        },
        {
          path: 'quizresult/:quizid',
          name: 'quizresult_v3',
          component: () => import('@/lesson/teacher/quizresult'),
          meta
        },
        {
          path: 'quizresultdetail/:quizid',
          name: 'quizresultdetail_v3',
          component: () => import('@/lesson/teacher/quizresultdetail'),
          meta
        },
        {
          path: 'boardlist',
          name: 'boardlist_v3',
          component: () => import('@/lesson/teacher/board-list'),
          meta
        },
        {
          path: 'stuexpression/:userid',
          name: 'stuexpression_v3',
          component: () => import('@/lesson/teacher/student_expression'),
          meta
        },
        {
          path: 'search',
          name: 'search_v3',
          component: () => import('@/lesson/teacher/search_student'),
          meta
        }
      ]
    },
    {
      path: '/v3/redpacketqueryproblemid',
      name: 'redpacket_v3',
      component: () => import('@/lesson/teacher/redpacket'),
      meta
    }
    
  ]
})

router.beforeEach((to, from, next) => {
  // 订阅发布重置
  let pubSub = window.parent && window.parent.PubSub || null;
  pubSub && pubSub.publish( 'reset', { msg: 'reset' } );

  // socket 无法使用的话，功能不正常，回根页面
  console.log(to);
  
  if(to.name.indexOf('v3') == -1){
    if (to.name !== 'home' && (!STORE.state.socket || !STORE.state.socket.send) || (to.name == 'home' && to.path.indexOf('redpacketqueryproblemid') != -1)) {
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
    let isObjectiveresultClose = from.name === 'objectiveresult' && to.name !== 'collumresult-detail' && to.name !== 'fillblankresult-detail' && to.name !== 'redpacket' && to.name !== 'redpacketlist'
    // let isFillblankresultClose = from.name === 'objectiveresult' && to.name !== 'fillblankresult-detail' && to.name !== 'redpacket' && to.name !== 'redpacketlist'
    if (isObjectiveresultClose) {
      let str = JSON.stringify({
        'op': 'closeproblemresult',
        'lessonid': STORE.state.lessonid,
        'problemid': from.params.problemid
      })
  
      STORE.state.socket.send(str)
    }
    next()
  }else {
    // app进入的遥控器  直接进入
    if(to.query.app) {
      next()
      return
    } else if(to.name !== 'teacher-v3'  && (!STORE.state.socket || !STORE.state.socket.send) || (to.name == 'teacher-v3' && to.path.indexOf('redpacketqueryproblemid') != -1)){
      next({name: 'teacher-v3', params: {lessonid: STORE.state.lessonid}})
      return;
    }
    // 试卷页进入试卷详情页，不关闭试卷投屏，进入其他页面时候都关闭投屏
    if (from.name === 'quizresult_v3' && to.name !== 'quizresultdetail_v3') {
      let str = JSON.stringify({
        'op': 'closequizresult',
        'lessonid': STORE.state.lessonid,
        'quizid': from.params.quizid
      })
      localStorage['isTouping'+from.params.quizid] = false
  
      STORE.state.socket.send(str)
    }
  
    // 柱状图页进入试题详情页、课堂红包页，不关闭试卷投屏，进入其他页面时候都关闭柱状图投屏
    let isObjectiveresultClose = from.name === 'objectiveresult_v3' && to.name !== 'collumresult-detail_v3' && to.name !== 'fillblankresult-detail_v3' && to.name !== 'redpacket_v3' && to.name !== 'redpacketlist_v3'
    // let isFillblankresultClose = from.name === 'objectiveresult' && to.name !== 'fillblankresult-detail' && to.name !== 'redpacket' && to.name !== 'redpacketlist'
    if (isObjectiveresultClose) {
      let str = JSON.stringify({
        'op': 'closeproblemresult',
        'lessonid': STORE.state.lessonid,
        'problemid': from.params.problemid
      })
  
      STORE.state.socket.send(str)
    }
    next()
  }
})

router.afterEach(function (to, from){
  setTimeout(()=>{
      // 解决 android手机字体缩放
      setSize();

      // mta pv单页面统计
      typeof MtaH5 !== 'undefined' && typeof MtaH5.pgv === 'function' && MtaH5.pgv();
  }, 1050);

})

// 解决 android手机字体缩放
setSize();

export default router

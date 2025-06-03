import 'mint-ui/lib/loadmore/style.css'
import 'mint-ui/lib/toast/style.css'
import 'mint-ui/lib/message-box/style.css'

import {getPlatformKey} from '@/util/util'
// 日活上报
import dailyReport from '@/util/daily-report'

import Vue from 'vue'
import Router from 'vue-router'
import Loadmore from 'mint-ui/lib/loadmore'
import Toast from 'mint-ui/lib/toast'
import MessageBox from 'mint-ui/lib/message-box';

import { mConfirm } from '@/lesson/common/rain-element';

import StudentPresentation from '@/components/student/student-presentation'
import HongBao from '@/components/student/hongbao'
import Exercise from '@/components/student/exercise'

const Subjective = resolve => require(['@/components/student/subjective'], resolve)
const Submission = resolve => require(['@/components/student/submission'], resolve)
const SubmissionList = resolve => require(['@/components/student/submission-list'], resolve)
const Danmu = resolve => require(['@/components/student/danmu'], resolve)
const SubmissionDetail = resolve => require(['@/components/student/submission-detail'], resolve)
const SubjectiveShare = resolve => require(['@/components/student/subjective-share'], resolve)
const MutualEvaluation = resolve => require(['@/components/student/mutual-evaluation'], resolve)
const FillBlank = resolve => require(['@/components/student/blank'], resolve)
// 问题解析
const ProblemAnalysis = resolve => require(['@/components/student/problem-analysis'], resolve)


Vue.use(Router)
Vue.component('loadmore', Loadmore);
Vue.$messagebox = Vue.prototype.$messagebox = MessageBox;
Vue.$toast = Vue.prototype.$toast = Toast;
window.$toast = Toast;

Vue.use(mConfirm);

let key = getPlatformKey()
if(key === 'thu'){
    Vue.prototype.isThu = true
}else if(key === 'changjiang'){
    Vue.prototype.isChangjiang = true
}else if(key === 'huanghe'){
    Vue.prototype.isHuanghe = true
}else if(key === 'rain'){
    Vue.prototype.isRain = true
}else if(key === 'protest'){
    Vue.prototype.isPro = true
}else if(key === "g"){
  Vue.prototype.isG = true
}else if(key === "thunder"){
  Vue.prototype.isThunder = true
}else if(key === 'pre-apple-ykt'){
  Vue.prototype.isWind = true
}

document.addEventListener('touchstart', function(){},false);

const studentRouter = new Router({
  base: process.env.NODE_ENV === 'production' ? '/lesson/student' : '/',
  mode: process.env.NODE_ENV === 'production' ? 'history' : 'hash',
  routes: [
    {
      path: '/v3/:lessonID',
      name: 'student-v3',
      component: () => import('@/lesson/student/presentation'),
      children: [
        {
          path: 'hongbao/:index',
          name: 'student-hongbao',
          component: () => import('@/lesson/student/hongbao')
        },
        {
          path: 'exercise/:index',
          name: 'student-exercise',
          component: () => import('@/lesson/student/exercise')
        },
        {
          path: 'subjective/:index',
          name: 'student-subjective',
          component: () => import('@/lesson/student/subjective')
        },
        {
          path: 'blank/:index',
          name: 'student-blank',
          component: () => import('@/lesson/student/blank')
        },
        {
          path: 'subjective_share/:index',
          name: 'subjective-share',
          component: () => import('@/lesson/student/subjective-share')
        },
        {
          path: 'submission2/:index',
          name: 'submission-detail',
          component: () => import('@/lesson/student/submission-detail')
        },
        {
          path: 'submission',
          name: 'submission',
          component: () => import('@/lesson/student/submission')
        },
        {
          path: 'submission_list',
          name: 'submissionlist',
          component: () => import('@/lesson/student/submission-list')
        },
        {
          path: 'danmu',
          name: 'danmu',
          component: () => import('@/lesson/student/danmu')
        },
        {
          path: 'evaluation/:index',
          name: 'mutual-evaluation',
          component: () => import('@/lesson/student/mutual-evaluation')
        },
        {
          path: 'analysis/:index',
          name: 'analysis',
          component: () => import('@/lesson/student/problem-analysis')
        },
        // 腾讯会议引导绑定
        {
          path: 'bind',
          name: 'bind-txmeet',
          component: () => import('@/lesson/student/txmeet-bind')
        },
        // 加入班级
        {
          path: 'join',
          name: 'join',
          component: () => import('@/lesson/student/join')
        },
        // 分组活动-分组讨论
        {
          path: 'groupdiscuss/:eventid/:index',
          name: 'group-discuss',
          component: () => import('@/lesson/student/group-discuss')
        }
      ]
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
          name: 'student-hongbao-page',
          component: HongBao
        },
        {
          path: 'exercise/:index',
          name: 'student-exercise-page',
          component: Exercise
        },
        {
          path: 'subjective/:index',
          name: 'student-subjective-page',
          component: Subjective
        },
        {
          path: 'blank/:index',
          name: 'student-blank-page',
          component: FillBlank
        },
        {
          path: 'subjective_share/:index',
          name: 'student-subjective-share-page',
          component: SubjectiveShare
        },
        {
          path: 'submission2/:index',
          name: 'student-submission-detail-page',
          component: SubmissionDetail
        },
        {
          path: 'submission',
          name: 'student-submission-page',
          component: Submission
        },
        {
          path: 'submission_list',
          name: 'student-submissionlist-page',
          component: SubmissionList
        },
        {
          path: 'danmu',
          name: 'student-danmu-page',
          component: Danmu
        },
        {
          path: 'evaluation/:index',
          name: 'mutual-evaluation-page',
          component: MutualEvaluation
        },
        {
          path: 'analysis/:index',
          name: 'analysis-page',
          component: ProblemAnalysis
        },
      ]
    },
    {
      path: '/subscribe/index',
      name: 'subscribe',
      component: () => import('@/lesson/subscribe/index')
    }
  ]
})

studentRouter.beforeEach((to, from, next) => {
  // 订阅发布重置
  let pubSub = window.parent && window.parent.PubSub || null;
  pubSub && pubSub.publish( 'reset', { msg: 'reset' } );
  next()
})

studentRouter.afterEach(route=>{
  // 统计
  setTimeout(() => {
    if (typeof dailyReport !== 'undefined') {
      const key = 'Report.Daily.Cid';
      let cid = window.sessionStorage.getItem(key)
      if (cid) {
        dailyReport.updateLog({classroom_id: +cid}, true)
      } else {
        dailyReport.updateLog({classroom_id: undefined}, true)
      }

      // pv单页面统计
      dailyReport.reportLog();
    }
  }, 2000);
});

export default studentRouter;

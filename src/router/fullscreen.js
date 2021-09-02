import 'mint-ui/lib/toast/style.css'
import 'mint-ui/lib/message-box/style.css'

import Vue from 'vue'
import Router from 'vue-router'
import Toast from 'mint-ui/lib/toast'
import MessageBox from 'mint-ui/lib/message-box';

import {getPlatformKey} from '@/util/util'
// 日活上报
import dailyReport from '@/util/daily-report'

import Index from '@/components/fullscreen/index'

// 问题解析
const Exercise = resolve => require(['@/components/fullscreen/exercise'], resolve)
const Subjective = resolve => require(['@/components/fullscreen/subjective'], resolve)
const FillBlank = resolve => require(['@/components/fullscreen/blank'], resolve)

const PPT = resolve => require(['@/components/fullscreen/ppt'], resolve)
const HongBao = resolve => require(['@/components/fullscreen/hongbao'], resolve)
const SubmissionDetail = resolve => require(['@/components/fullscreen/submission-detail'], resolve)
const SubjectiveShare = resolve => require(['@/components/fullscreen/subjective-share'], resolve)
const MutualEvaluation = resolve => require(['@/components/fullscreen/mutual-evaluation'], resolve)
// 问题解析
const ProblemAnalysis = resolve => require(['@/components/fullscreen/problem-analysis'], resolve)

const Webview = resolve => require(['@/components/fullscreen/webview'], resolve)

// 白板
const Board = resolve => require(['@/components/fullscreen/board'], resolve)
// 投稿
const Submission = resolve => require(['@/components/fullscreen/submission'], resolve)
// 分组
const Team = resolve => require(['@/components/fullscreen/team'], resolve)

Vue.use(Router)
Vue.$messagebox = Vue.prototype.$messagebox = MessageBox;
Vue.$toast = Vue.prototype.$toast = Toast;
window.$toast = Toast;

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



// FastClick.attach(document.body)
document.addEventListener('touchstart', function(){},false);

const isProd = process.env.NODE_ENV === 'production' ? true : false;
const fullscreenRouter = new Router({
  base: isProd ? '/lesson/fullscreen' : '/',
  mode: isProd ? 'history' : 'hash',
  routes: [
    {
      path: '/v3/:lessonID',
      name: 'fullscreen',
      component: () => import('@/lesson/fullscreen/index'),
      children: [
        {
          path: 'ppt/:index',
          name: 'ppt',
          component: () => import('@/lesson/fullscreen/ppt')
        },
        {
          path: 'hongbao/:index',
          name: 'hongbao',
          component: () => import('@/lesson/fullscreen/hongbao')
        },
        {
          path: 'webview/:index',
          name: 'webview',
          component: () => import('@/lesson/fullscreen/webview')
        },
        {
          path: 'exercise/:index',
          name: 'exercise',
          component: () => import('@/lesson/fullscreen/exercise')
        },
        {
          path: 'subjective/:index',
          name: 'subjective',
          component: () => import('@/lesson/fullscreen/subjective')
        },
        {
          path: 'blank/:index',
          name: 'blank',
          component: () => import('@/lesson/fullscreen/blank')
        },
        {
          path: 'subjective_share/:index',
          name: 'subjective-share',
          component: () => import('@/lesson/fullscreen/subjective-share')
        },
        {
          path: 'submission',
          name: 'submission',
          component: () => import('@/lesson/fullscreen/submission')
        },
        {
          path: 'submission_share/:index',
          name: 'submission-detail',
          component: () => import('@/lesson/fullscreen/submission-detail')
        },
        {
          path: 'evaluation/:index',
          name: 'evaluation',
          component: () => import('@/lesson/fullscreen/mutual-evaluation')
        },
        {
          path: 'analysis/:index',
          name: 'analysis',
          component: () => import('@/lesson/fullscreen/problem-analysis')
        },
        {
          path: 'board/:index',
          name: 'board-v3',
          component: () => import('@/lesson/fullscreen/board')
        },
        {
          path: 'team',
          name: 'team-v3',
          component: () => import('@/lesson/fullscreen/team')
        }
      ]
    },
    {
      path: '/:lessonID',
      name: 'student-fullscreen',
      component: Index,
      children: [
        {
          path: 'ppt/:index',
          name: 'ppt-page',
          component: PPT
        },
        {
          path: 'hongbao/:index',
          name: 'hongbao-page',
          component: HongBao
        },
        {
          path: 'webview/:index',
          name: 'webview',
          component: Webview
        },
        {
          path: 'exercise/:index',
          name: 'exercise-page',
          component: Exercise
        },
        {
          path: 'subjective/:index',
          name: 'subjective-page',
          component: Subjective
        },
        {
          path: 'blank/:index',
          name: 'blank-page',
          component: FillBlank
        },
        {
          path: 'subjective_share/:index',
          name: 'subjective-share-page',
          component: SubjectiveShare
        },
        {
          path: 'submission',
          name: 'submission-page',
          component: Submission
        },
        {
          path: 'submission_share/:index',
          name: 'submission-detail-page',
          component: SubmissionDetail
        },
        {
          path: 'evaluation/:index',
          name: 'evaluation-page',
          component: MutualEvaluation
        },
        {
          path: 'analysis/:index',
          name: 'analysis-page',
          component: ProblemAnalysis
        },
        {
          path: 'board/:index',
          name: 'board',
          component: Board
        },
        {
          path: 'team',
          name: 'team-page',
          component: Team
        },
      ]
    }
  ]
})

fullscreenRouter.beforeEach((to, from, next) => {
  // 订阅发布重置
  let pubSub = window.parent && window.parent.PubSub || null;
  pubSub && pubSub.publish( 'reset', { msg: 'reset' } );
  next()
})

fullscreenRouter.afterEach(route=>{
  // 统计
  setTimeout(() => {
    // pv单页面统计
    typeof dailyReport !== 'undefined' && dailyReport.reportLog({ terminal: 'Web' });
  }, 1000);
});

export default fullscreenRouter;

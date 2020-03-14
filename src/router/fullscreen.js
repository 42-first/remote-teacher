import 'mint-ui/lib/toast/style.css'
import 'mint-ui/lib/message-box/style.css'

import Vue from 'vue'
import Router from 'vue-router'
import Toast from 'mint-ui/lib/toast'
import MessageBox from 'mint-ui/lib/message-box';

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

// FastClick.attach(document.body)
document.addEventListener('touchstart', function(){},false);

const isProd = process.env.NODE_ENV === 'production' ? true : false;
const fullscreenRouter = new Router({
  base: isProd ? '/lesson/fullscreen' : '/',
  mode: isProd ? 'history' : 'hash',
  routes: [
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
  // mta统计
  setTimeout(() => {
    typeof MtaH5 !== 'undefined' && typeof MtaH5.pgv === 'function' && MtaH5.pgv();
  }, 1000);
});

export default fullscreenRouter;

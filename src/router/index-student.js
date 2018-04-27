import 'mint-ui/lib/loadmore/style.css'
import 'mint-ui/lib/toast/style.css'
import 'mint-ui/lib/message-box/style.css'

import Vue from 'vue'
import Router from 'vue-router'
// import FastClick from 'fastclick'
import Loadmore from 'mint-ui/lib/loadmore'
import Toast from 'mint-ui/lib/toast'
import MessageBox from 'mint-ui/lib/message-box';

import StudentPresentation from '@/components/student/student-presentation'
import HongBao from '@/components/student/hongbao'
import Exercise from '@/components/student/exercise'

const Subjective = resolve => require(['@/components/student/subjective'], resolve)
const Submission = resolve => require(['@/components/student/submission'], resolve)
const SubmissionList = resolve => require(['@/components/student/submission-list'], resolve)
const Danmu = resolve => require(['@/components/student/danmu'], resolve)
const SubmissionDetail = resolve => require(['@/components/student/submission-detail'], resolve)
const SubjectiveShare = resolve => require(['@/components/student/subjective-share'], resolve)


// 国际化
// import language from '@/util/language'
// window.language = language;
// setTimeout(() => {
//   language.requireRes('zh_CN');
// }, 0)

Vue.use(Router)
Vue.component('loadmore', Loadmore);
Vue.$messagebox = Vue.prototype.$messagebox = MessageBox;
Vue.$toast = Vue.prototype.$toast = Toast;

// FastClick.attach(document.body)
document.addEventListener('touchstart', function(){},false);

const studentRouter = new Router({
  base: process.env.NODE_ENV === 'production' ? '/lesson/student' : '/',
  mode: process.env.NODE_ENV === 'production' ? 'history' : 'hash',
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
        }
      ]
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
  // google统计
  setTimeout(() => {
    typeof ga === 'function' && ga('send', 'pageview', location.pathname);
  }, 1000);
});

export default studentRouter;

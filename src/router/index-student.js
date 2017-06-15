// import 'mint-ui/lib/loadmore/style.css'
// import 'mint-ui/lib/radio/toast.css';
import 'mint-ui/lib/style.css';

import Vue from 'vue'
import Router from 'vue-router'
// import FastClick from 'fastclick'
import Loadmore from 'mint-ui/lib/loadmore'
import Toast from 'mint-ui/lib/toast';
import MessageBox from 'mint-ui/lib/message-box';

import StudentPresentation from '@/components/student/student-presentation'
import HongBao from '@/components/student/hongbao'
import Exercise from '@/components/student/exercise'
import Submission from '@/components/student/submission'
import Danmu from '@/components/student/danmu'

// 国际化
import language from '@/util/language'
window.language = language;
setTimeout(() => {
  // language.requireRes('en');
  language.requireRes('zh_CN');
}, 0)

Vue.use(Router)
Vue.component('loadmore', Loadmore);
Vue.$messagebox = Vue.prototype.$messagebox = MessageBox;
Vue.$toast = Vue.prototype.$toast = Toast;

// FastClick.attach(document.body)
document.addEventListener('touchstart', function(){},false);

export default new Router({
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
          component: HongBao
        },
        {
          path: 'exercise/:index',
          component: Exercise
        },
        {
          path: 'submission',
          component: Submission
        },
        {
          path: 'danmu',
          component: Danmu
        }
      ]
    }
  ]
})

import 'mint-ui/lib/toast/style.css'
import 'mint-ui/lib/message-box/style.css'

import Vue from 'vue'
import Router from 'vue-router'
import Toast from 'mint-ui/lib/toast'
import MessageBox from 'mint-ui/lib/message-box';

import Index from '@/components/fullscreen/index'


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
        // {
        //   path: 'danmu',
        //   name: 'student-danmu-page',
        //   component: Danmu
        // },
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
  // google统计
  setTimeout(() => {
    typeof ga === 'function' && ga('send', 'pageview', location.pathname);
  }, 1000);
});

export default fullscreenRouter;

import Vue from 'vue'
import Router from 'vue-router'
import RemoteList from '@/components/teacher-restructure/remote-list'
import Home from '@/components/teacher-restructure/home'

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

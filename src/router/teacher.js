import Vue from 'vue'
import Router from 'vue-router'
import RemoteList from '@/components/teacher/remote-list'
import Remote from '@/components/teacher/remote'

Vue.use(Router)

export default new Router({
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
      name: 'remote',
      component: Remote
    },
    {
      path: '*',
      name: 'remote-list',
      component: RemoteList
    }
  ]
})

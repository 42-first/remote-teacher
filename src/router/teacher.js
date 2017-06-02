import Vue from 'vue'
import Router from 'vue-router'
import RemoteList from '@/components/teacher/remote-list'
import Remote from '@/components/teacher/remote'

Vue.use(Router)

export default new Router({
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

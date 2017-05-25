import Vue from 'vue'
import Router from 'vue-router'
import RemoteList from '@/components/remote-list'
import Remote from '@/components/remote'

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
      name: 'remote-list'
    }
  ]
})

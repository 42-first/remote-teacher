import Vue from 'vue'
import Router from 'vue-router'
import Index from '@/components/market/Index'

Vue.use(Router)

export default new Router({
  base: process.env.NODE_ENV === 'production' ? '/lesson/yukejian' : '/',
  mode: process.env.NODE_ENV === 'production' ? 'history' : 'hash',
  routes: [
    {
      path: '/',
      name: 'market',
      component: Index
    }
  ]
})

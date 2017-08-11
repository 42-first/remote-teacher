import Vue from 'vue'
import Router from 'vue-router'
import Index from '@/components/market/Index'
import Verification from '@/components/market/verification'

Vue.use(Router)

export default new Router({
  base: process.env.NODE_ENV === 'production' ? '/lesson/market' : '/',
  mode: process.env.NODE_ENV === 'production' ? 'history' : 'hash',
  routes: [
    {
      path: '/',
      name: 'market',
      component: Index
    },
    {
      path: '/Verification',
      name: 'Verification',
      component: Verification
    }
  ]
})

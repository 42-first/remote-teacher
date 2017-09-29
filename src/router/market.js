import Vue from 'vue'
import Router from 'vue-router'
import Index from '@/components/market/Index'
import verification from '@/components/market/verification'
import mobileMarket from '@/components/market/mobile_market'
import courseware from '@/components/market/courseware'

Vue.use(Router)

export default new Router({
  base: process.env.NODE_ENV === 'production' ? '/lesson/market' : '/',
  mode: process.env.NODE_ENV === 'production' ? 'history' : 'hash',
  routes: [
    {
      path: '/',
      name: 'market',
      component: courseware
    },
    {
      path: '/index',
      name: 'index',
      component: Index
    },
    {
      path: '/verification',
      name: 'verification',
      component: verification
    },
    {
      path: '/courseware',
      name: 'courseware',
      component: courseware
    },
    {
      path: '/mobile_market',
      name: 'mobile_market',
      component: mobileMarket
    },
    {
      path: '/mobile/courseware',
      name: 'mobile_courseware',
      component: mobileMarket
    }
  ]
})

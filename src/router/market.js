import Vue from 'vue'
import Router from 'vue-router'
import Index from '@/components/market/Index'
import verification from '@/components/market/verification'
import mobileMarket from '@/components/market/mobile_market'
import courseware from '@/components/market/courseware'

// 日活上报
import dailyReport from '@/util/daily-report'

Vue.use(Router)

var browser = {
  versions: (function () {
    var u = navigator.userAgent
    return {
      trident: u.indexOf('Trident') > -1,
      presto: u.indexOf('Presto') > -1,
      webKit: u.indexOf('AppleWebKit') > -1,
      gecko: u.indexOf('Gecko') > -1 && u.indexOf('KHTML') == -1,
      mobile: !!u.match(/AppleWebKit.*Mobile.*/),
      ios: !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/),
      android: u.indexOf('Android') > -1 || u.indexOf('Linux') > -1,
      iPhone: u.indexOf('iPhone') > -1,
      iPad: u.indexOf('iPad') > -1,
      webApp: u.indexOf('Safari') === -1
    }
  })()
}

var router = new Router({
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

router.beforeEach((to, from, next) => {
  if (to.name === 'market' || to.name === 'courseware') {
    if (browser.versions.mobile || browser.versions.ios || browser.versions.android || browser.versions.iPhone || browser.versions.iPad){
      next({path: '/mobile/courseware'})
    }
  }
  if (to.name === 'mobile_courseware' || to.name === 'mobile_market') {
    if (!(browser.versions.mobile || browser.versions.ios || browser.versions.android || browser.versions.iPhone || browser.versions.iPad)){
      next({path: '/'})
    }
  }
  next()
})

router.afterEach(route=>{
  // 统计
  setTimeout(() => {
    // pv单页面统计
    typeof dailyReport !== 'undefined' && dailyReport.reportLog({ terminal: 'web' });
  }, 1000);
});


export default router

<template>
  <!-- 导航模块 -->
  <div class="nav">
    <a class="logo-wrapper" href="/"><img class="logo" src="https://qn-sfe.yuketang.cn/o_1bpfrptlcaflochlas11h1s1c9.png" alt="logo"></a>
    <div class="nav-menus" v-bind:class="{ios: isIos}">
      <a class="join-us" href="/presenter">翻页笔</a>
      <a class="join-us curr" href="/lesson/market/mobile_market">雨课件</a>
      <a class="download" href="/bindmobile/download/app">下载</a>
      <a class="help" href="/help" >帮助</a>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'page-header',
    data () {
      return {
        isIos: !1
      }
    },
    created: function () {
      this.init()
    },
    components: {},
    methods: {
      init: function () {
        var browser = {
          versions: (function () {
            var u = navigator.userAgent
            return {
              trident: u.indexOf('Trident') > -1,
              presto: u.indexOf('Presto') > -1,
              webKit: u.indexOf('AppleWebKit') > -1,
              gecko: u.indexOf('Gecko') > -1 && u.indexOf('KHTML') === -1,
              mobile: !!u.match(/AppleWebKit.*Mobile.*/),
              ios: !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/),
              android: u.indexOf('Android') > -1 || u.indexOf('Linux') > -1,
              iPhone: u.indexOf('iPhone') > -1,
              iPad: u.indexOf('iPad') > -1,
              webApp: u.indexOf('Safari') === -1
            }
          })()
        }
        this.isIos = browser.versions.ios
      }
    }
  }
</script>
<style lang="scss" scoped>
  .nav {
    z-index: 1;
    position: fixed; left: 0; top: 0;
    display: flex; align-items: center; justify-content: space-between;
    width: 100%;
    color: #9B9B9B;
    background: #282C2F;
    -webkit-font-smoothing: subpixel-antialiased;
    line-height: 40px;
    height: 40px;
    overflow: hidden;
    clear: both;
    box-sizing: border-box;
  }

  .nav .logo-wrapper {
    margin-left: 15px;
  }
  .nav .logo {
    display: block;
    width: 65px;
  }

  .nav-menus {
    display: block;
    display: flex; align-items: center; justify-content: flex-end;
  }

  .nav a {
    margin-right: 10px;
    line-height: 40px;
    font-size: 12px;
    color: #C8C8C8;
    vertical-align: bottom;
  }
  .nav-menus.ios{
    margin-top: 2px;
  }
  .nav  a.curr { color: #fff; }
</style>

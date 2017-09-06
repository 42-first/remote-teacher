<template>
  <nav id="nav" class="nav">
    <div id="navbg" class="bg"></div>
    <div class="box clearfix">
      <a href="/">
        <img class="logo" src="http://ykt.io/static/images/home/logo.png?dt=20160914" alt="logo">
      </a>
      <a href="/join_us" class="right">加入我们</a>
      <a href="/help" class="right">帮助中心</a>
      <a href="/download" class="right">下载</a>
    </div>
  </nav>
</template>

<script>
  export default {
    name: 'header',
    data () {
      return {
      }
    },
    created: function () {
      this._init()
    },
    components: {},
    methods: {
      _init: function () {
      }
    }
  }
</script>
<style lang="scss" scoped>
  @import "~@/style/market/insert.css";
  .nav {position: fixed; z-index: 50; width: 100%; left: 0; top: 0; color: #fff;}
  .nav .bg {position: absolute; left: 0; top: 0; width: 100%; height: 100%; background-color: #282C2F; display: none;}
  .nav .box {position: relative; margin: 0 auto; height: 45px;}
  .nav .box .logo {float: left; width: 100px; margin-left: 10px; margin-top: 10px;}
  .nav .box .right {float: right; margin-right: 15px; line-height: 45px; font-size: 14px;}
  .nav .box a {color: #fff;}
</style>

<template>
  <nav id="nav" class="nav">
    <div id="navbg" class="bg"></div>
    <div class="box clearfix">
      <a href="/">
        <img class="logo" src="~images/market/icon/logo.png" alt="logo">
      </a>
      <a href="/help" class="right">帮助</a>
      <a class="right" onclick="javascript:alert('请在电脑上打开 \n ykt.io \n下载雨课堂软件');">下载</a>
      <a href="/lesson/market/mobile_market" class="right active">雨课件</a>
      <a href="/presenter" class="right">翻页笔</a>
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
  .nav {
    position: fixed;
    z-index: 50;
    width: 100%;
    left: 0;
    top: 0;
    color: #fff;
    background-color: #282C2F;
    height: .8rem;
    line-height: .8rem;
    font-size: .24rem;
    -webkit-font-smoothing: subpixel-antialiased;
  }
  .nav .bg {position: absolute; left: 0; top: 0; width: 100%; height: 100%; background-color: #282C2F; display: none;}
  .nav .box {position: relative; margin: 0 auto; height: .8rem;line-height: .8rem;}
  .nav .box .logo { width: 1.3rem; margin-left: .3rem; vertical-align: middle;}
  .nav .box .right {float: right; margin-right: .2rem;}
  .nav .box a {color: #c8c8c8;display: inline-block;height: 100%;line-height: .8rem;}
  .nav .box a.active{
    color: #fff;
  }
</style>

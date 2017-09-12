<template>
  <nav id="nav" class="nav">
    <div class="box clearfix">
      <a href="/">
        <img class="logo" src="http://sfe.ykt.io/o_1bpfrptlcaflochlas11h1s1c9.png" alt="logo">
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
    font-size: 0;
    -webkit-font-smoothing: subpixel-antialiased;
  }
  .nav .box {position: relative; margin: 0 auto;
    padding-top:1px;
  }
  .nav .box .logo { width: 1.3rem; margin-left: .3rem;line-height: .8rem;vertical-align: middle;}
  .nav .box .right {float: right; margin-right: .2rem;font-size: .24rem;}
  .nav .box a {color: #c8c8c8;display: inline-block;height: 100%;vertical-align:bottom;}
  .nav .box a.active{
    color: #fff;
  }
</style>

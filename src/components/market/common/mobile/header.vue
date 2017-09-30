<template>
  <!-- 导航模块 -->
  <div class="nav">
    <a class="logo-wrapper" href="/"><img class="logo" src="http://sfe.ykt.io/o_1bpfrptlcaflochlas11h1s1c9.png" alt="logo"></a>
    <div class="nav-menus">
      <a class="join-us" href="/presenter">翻页笔</a>
      <a class="join-us curr" href="/lesson/market/mobile_market">雨课件</a>
      <a class="download" onclick="javascript:alert('请在电脑上打开 \n ykt.io \n下载雨课堂软件');">下载</a>
      <a class="help" href="/help" >帮助</a>
    </div>
  </div>
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
  .nav {
    z-index: 1;
    position: fixed; left: 0; top: 0;
    display: flex; align-items: center; justify-content: space-between;
    width: 100%;
    color: #9B9B9B;
    background: #282C2F;
    -webkit-font-smoothing: subpixel-antialiased;
    line-height: 40px;
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
  .nav  a.curr { color: #fff; }
</style>

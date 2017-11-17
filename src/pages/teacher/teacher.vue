<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
  export default {
    name: 'remote'
  }
</script>

<style lang="scss">
  @import "~@/style/base.css";
  @import "~@/style/font/iconfont/iconfont.css";

  html * {
    box-sizing: border-box;
    text-size-adjust: 100%;
    -webkit-touch-callout: none;
    -webkit-user-select: none;
  }

  #app {
    width: 100%;
    /*min-height: 100%;*/
  }
</style>

<template>
  <router-view keep-alive>
    <template slot="ykt-msg">
      <ykt-toast></ykt-toast>
      <ykt-modal></ykt-modal>
    </template>
  </router-view>
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
    // -webkit-user-select: none;
  }
  html,body {
    min-height: 100%;
    overflow: auto;
  }
</style>

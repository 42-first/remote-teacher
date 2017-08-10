<template>
  <div id="app">
    <page-header></page-header>
    <router-view></router-view>
    <page-footer></page-footer>
  </div>
</template>

<script>
  import PageHeader from '@/components/market/common/header.vue'
  import PageFooter from '@/components/market/common/footer.vue'
  export default {
    name: 'market',
    components: {
      PageHeader,
      PageFooter
    }
  }
</script>

<style lang="scss">
  @import "~@/style/market/nomalize.css";
  @import "~@/style/market/common.scss";

  #app {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
</style>

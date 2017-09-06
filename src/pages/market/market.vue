<template>
  <div id="app">
    <page-header v-if="!isMobile"></page-header>
    <mobile-header v-if="isMobile"></mobile-header>
    <router-view></router-view>
    <page-footer v-if="!isMobile"></page-footer>
    <mobile-footer v-if="isMobile"></mobile-footer>
  </div>
</template>

<script>
  import PageHeader from '@/components/market/common/header.vue'
  import PageFooter from '@/components/market/common/footer.vue'
  import mobileHeader from '@/components/market/common/mobile/header.vue'
  import mobileFooter from '@/components/market/common/mobile/footer.vue'
  export default {
    name: 'market',
    data: function () {
      return {
        isMobile: navigator.userAgent.toLowerCase().indexOf('mobile') > -1
      }
    },
    components: {
      PageHeader,
      PageFooter,
      mobileHeader,
      mobileFooter
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

<template>
  <footer>
    <div class="cont clearfix">
      <div class="left">
        © 2017 清华大学 & 学堂在线<br>
        京ICP证140571号 | 京公网安备 11010802017721
      </div>
    </div>
  </footer>
</template>

<script>
  export default {
    name: 'footer',
    data: function () {
      return {
      }
    },
    created: function () {
    }
  }
</script>
<style lang="scss" scoped>
  @import "~@/style/market/insert.css";
  footer {position: absolute; width: 100%; background: #282C2F;max-width: 12rem;}
  footer .cont {}
  footer .left {text-align: center; font-size: 12px; line-height: 20px; padding-top: 10px; color: #9B9B9B;}
</style>

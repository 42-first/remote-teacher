<template>
  <footer>
      <div class="left">
        2017 清华大学&学堂在线<br>
        © 京ICP证140571号 | 京公网安备 11010802017721
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
  footer {position: absolute; width: 100%; background: #282C2F;font-size: .24rem;height: 1.5rem;box-sizing: border-box;padding-top: .3rem;
    -webkit-font-smoothing: subpixel-antialiased;letter-spacing: 0;}
  footer .left {text-align: center; line-height: .4rem; color: #979797;}
</style>

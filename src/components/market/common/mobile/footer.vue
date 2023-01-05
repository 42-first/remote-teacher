<template>
  <footer>
      <div class="left">
        <p>©{{year}} 清华大学&学堂在线</p>
        <a target="_blank" href="https://beian.miit.gov.cn" style="display:inline-block;vertical-align: middle;color: #666;text-decoration: none;vertical-align: middle;">京ICP备14019655号</a> | <a target="_blank" href="http://www.beian.gov.cn/portal/registerSystemInfo?recordcode=11010802033052" style="display:inline-block;vertical-align: middle;color: #666;text-decoration: none;vertical-align: middle;"><img src="https://qn-sfe.yuketang.cn/o_1ek0bqrhrrj69vi1q681h091k069.png" style="vertical-align: middle;"/>&nbsp;<span>京公网安备 11010802033052号</span></a>
      </div>
  </footer>
</template>

<script>
  export default {
    name: 'page-footer',
    data: function () {
      return {
        year: new Date().getFullYear()
      }
    },
    created: function () {
    }
  }
</script>
<style lang="scss" scoped>
  @import "~@/style/market/insert.css";
  footer {position: absolute; width: 100%; background: #282C2F;font-size: .24rem;box-sizing: border-box;padding-top: .3rem;
    -webkit-font-smoothing: subpixel-antialiased;letter-spacing: 0;}
  footer .left {text-align: center; line-height: .4rem; color: #979797;}
</style>

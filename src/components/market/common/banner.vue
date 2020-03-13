<template>
  <div class="banner">
    <img src="https://qn-sfe.yuketang.cn/o_1bq1tobqec6b9slj8m17cu6r3e.png" v-if="type === 0"/>
    <img src="https://qn-sfe.yuketang.cn/o_1bq1tobqe1vklsj3ino1r1n1tnkc.png" v-if="type === 1"/>
    <div class="text-center courseware" v-if="type == 2">
      <img src="https://qn-sfe.yuketang.cn/o_1bq1tobqeogi1hrb13c71n071eond.png"/>
    </div>
    <div class="text-center font48 colorf text" v-if="type !== 2">
      <div>{{text}}</div>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'banner',
    data: function () {
      return {
      }
    },
    props: ['type', 'text']
  }
</script>
<style lang="scss" scoped>
  @import "~@/style/market/common";
  .banner {
    width: 100%;
    margin: 0 auto;
    font-size: 0px;
    position: relative;
    overflow: hidden;
    img {
      width: 100%;
    }
    .text{
      position: absolute;
      top:0;
      left: 0;
      height: 100%;
      width: 100%;
      div{
        width: 100%;
        height: 48px;
        line-height: 48px;
        position: absolute;
        top:50%;
        margin-top: -24px;
      }
    }
    .courseware{
      background-color: #fff;
      width: 100%;
      height: 407px;
      overflow: hidden;
      img{
        height: 100%;
        width: auto;
      }
    }
  }
</style>

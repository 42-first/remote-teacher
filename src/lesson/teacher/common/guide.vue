<!-- 教师遥控器新手引导 被父组件 home.vue 引用 -->
<template>
  <div class="guide-mask dontcallback">
    <v-touch tag="i" class="iconfont icon-ykq-shiti-guanbi f40" v-on:tap="next(3)"></v-touch>
    <v-touch v-show="step === 1" v-on:tap="next(2)">
      <img class="guide-jt-ykq xiedong" src="~images/teacher/guide-jt-ykq.png" alt="">
      <img class="guide-ykq" :src="ykqImg" alt="">
    </v-touch>
    <v-touch v-show="step === 0"  v-on:tap="next(1)">
      <img class="guide-jt-dongtai updown" src="~images/teacher/guide-jt-dongtai.png" alt="">
      <img class="guide-dongtai" :src="dongtaiImg" alt="">
    </v-touch>
  </div>
</template>

<script>

  export default {
    name: 'Guide',
    props: [],
    data () {
      return {
        step: 0,           // 引导状态 0 课堂动态；1 遥控器；2 结束
        dongtaiImg: require(`images/teacher/guide-dongtai${i18n.t('imgafterfix')}.png`),
        ykqImg: require(`images/teacher/guide-ykq${i18n.t('imgafterfix')}.png`)
      }
    },
    created () {
    },
    methods: {
      /**
       * 点击箭头或按钮进入下一步
       *
       * @event bindtap
       * @param {number} num 要走到哪一步
       */
      next (num) {
        let self = this

        self.step = num
        self.$emit('guideNext', self.step)
      },
    }
  }
</script>

<style lang="scss" scoped>
  @import "~@/style/_variables";
  .guide-mask {
    position: absolute;
    z-index: 100;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background: rgba(0,0,0,0.28);
    overflow: auto;

    .icon-ykq-shiti-guanbi {
      position: absolute;
      right: 0.533333rem;
      top: 0.266667rem;
      color: $white;
    }

    .guide-jt-ykq {
      position: absolute;
      bottom: 2.0rem;
      left: 0.52rem;
      width: 1.56rem;
    }

    .guide-ykq {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 2.4rem;
    }

    .guide-jt-dongtai {
      position: absolute;
      bottom: 2.2rem;
      left: 5.28rem;
      width: 1.56rem;
    }

    .guide-dongtai {
      position: absolute;
      bottom: 0;
      left: 5.04rem;
      width: 2.4rem;
    }

    @-webkit-keyframes updown {
      0% {transform: translateY(0px);}
      50% {transform: translateY(-0.533333rem);}
      100% {transform: translateY(0px);}
    }
    .updown {
      animation: updown 1s infinite;
      -webkit-animation: updown 1s infinite;
    }

    @-webkit-keyframes xiedong {
      0% {transform: translate(0, 0);}
      50% {transform: translate(0.08rem, -0.3rem);}
      100% {transform: translate(0, 0);}
    }
    .xiedong {
      animation: xiedong 1s infinite;
      -webkit-animation: xiedong 1s infinite;
    }
  }
</style>

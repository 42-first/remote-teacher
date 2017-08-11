<!-- 打分的星星弹出层 目前被父组件主观题 rc-mask-problemresult-subjective.vue 引用 -->
<template>
  <v-touch class="star-panel dontcallback f18" :class="!isStarPanelHidden ? 'animateMobileTextIn' : 'animateMobileTextOut'" v-on:tap="decide">
    <i v-for="i in fullstars" :data-score="i" class="iconfont icon-fill-star f40"></i>
    <i v-for="i in total - fullstars" :data-score="fullstars + i" class="iconfont icon-star f40"></i>
  </v-touch>
</template>

<script>
  const STAR_TOTAL = 5  // 总星星数目

  export default {
    name: 'StarPanel',
    props: [],
    data () {
      return {
        isStarPanelHidden: true,      // 打星星面板隐藏
        total: STAR_TOTAL,
        fullstars: 3,                 // 实心星星的数目
      }
    },
    created () {
      let self = this

      // 父组件呼出本子组件
      self.$on('enter', function (oldFullStars) {
        self.enter(oldFullStars)
      })

      // 父组件交互成功后隐去本子组件
      self.$on('leave', function () {
        self.leave()
      })
    },
    methods: {
      /**
       * 父组件呼出面板
       *
       * @event bindtap
       * @param {string} oldFullStars 之前的星级
       */
      enter (oldFullStars = 0) {
        let self = this

        self.isStarPanelHidden = false
        self.fullstars = +oldFullStars
      },
      /**
       * 点击空白处或星星决定放弃或星级
       *
       * @event bindtap
       * @param {object} evt event 对象
       */
      leave (evt) {
        let self = this
        
        self.isStarPanelHidden = true
      },
      /**
       * 点击空白处或星星决定放弃或星级
       *
       * @event bindtap
       * @param {object} evt event 对象
       */
      decide (evt) {
        let self = this
        let isScore = $(evt.target).hasClass('iconfont')
        let score = isScore ? $(evt.target).data('score') : -1

        self.$emit('giveScore', score)
      },
    }
  }
</script>

<style lang="scss" scoped>
  @import "~@/style/_variables";
  .star-panel {
    position: fixed;
    z-index: 100;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    transform-origin: 0 0;
    width: 7.586667rem;
    height: 3.453333rem;
    line-height: 3.453333rem;
    border-radius: 0.066667rem;
    background: rgba(0,0,0,0.6);
    color: $white;
    text-align: center;

    .iconfont {
      color: #F5A623;
    }
  }

  //参考微信文字淡入http://weread.qq.com/
  @keyframes animateMobileTextIn {
      0% {
          transform: scale(0.5, 0.5) translate(-50%, -50%);
          opacity: 0;
      }
      90% {
          opacity: 1;
      }
      100% {
          transform: scale(1, 1) translate(-50%, -50%);
          opacity: 1;
      }
  }
  .animateMobileTextIn {
      -webkit-animation: animateMobileTextIn 0.4s;
      animation: animateMobileTextIn 0.4s;
  //    -webkit-animation-fill-mode: forwards;
  //    animation-fill-mode: forwards;
      -webkit-animation-timing-function: ease;
      animation-timing-function: ease;
  }
  @keyframes animateMobileTextOut {
      0% {
          transform: scale(1, 1) translate(-50%, -50%);
          opacity: 1;
      }
      90% {
          opacity: 0;
      }
      100% {
          transform: scale(0.5, 0.5) translate(-50%, -50%);
          opacity: 0;
      }
  }
  .animateMobileTextOut {
      -webkit-animation: animateMobileTextOut 0.4s;
      animation: animateMobileTextOut 0.4s;
      -webkit-animation-fill-mode: forwards;
      animation-fill-mode: forwards;
      -webkit-animation-timing-function: ease;
      animation-timing-function: ease;
  }
  
</style>

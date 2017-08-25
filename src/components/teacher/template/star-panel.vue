<!-- 打分的星星弹出层 目前被父组件主观题 rc-mask-problemresult-subjective.vue 引用 -->
<template>
  <v-touch
    class="star-panel dontcallback f18"
    :class="{'animateMobileTextIn': !isStarPanelHidden, 'animateMobileTextOut': isStarPanelHidden, 'none': !isSummoned}" v-on:tap="decide"
    >
    <i v-for="i in fullstars" :data-score="i" class="iconfont icon-fill-star f40"></i>
    <i v-for="i in starTotal - fullstars" :data-score="fullstars + i" class="iconfont icon-star f40"></i>
  </v-touch>
</template>

<script>
  export default {
    name: 'StarPanel',
    props: ['starTotal'],
    data () {
      return {
        isSummoned: false,       // 标记本组件是用户点击呼出的，
                                 // hack 用户点开父组件时本组件自己淡出下

        isStarPanelHidden: true, // 打星星面板隐藏
        fullstars: 3,            // 实心星星的数目
        answerid: -1,            // 当前正在打分的 answer 的 id
      }
    },
    created () {
      let self = this

      // 父组件呼出本子组件
      self.$on('enter', function (answerid, oldFullStars) {
        self.enter(...arguments)
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
       * @params {number, number} answerid 将要打分的主观题答案的id, oldFullStars 当前星级
       */
      enter (answerid, oldFullStars = 0) {
        let self = this

        self.isSummoned = true
        self.isStarPanelHidden = false
        self.answerid = answerid
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

        setTimeout(() => {
          self.isSummoned = false
        }, 500)
      },
      /**
       * 点击空白处或星星决定放弃或星级
       *
       * @event bindtap
       * @param {object} evt event 对象
       */
      decide (evt) {
        let self = this
        let score = +(evt.target.dataset.score || -1) // 取数字

        self.$emit('giveScore', self.answerid, score)
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

  .none {
    display: none;
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

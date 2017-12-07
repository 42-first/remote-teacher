<!-- 教师遥控器引导查看答案、续时 被父组件 home.vue 引用 -->
<template>
  <div class="guide-mask dontcallback">
     <v-touch v-show="stepGuideDelay === 0"  v-on:tap="next(1)">
      <img class="guide-jt-chakandaan updown" src="~images/teacher/guide-jt-chakandaan.png" alt="">
      <img class="guide-chakandaan" src="~images/teacher/guide-chakandaan.png" alt="">
    </v-touch>

    <div v-show="stepGuideDelay === 1">
      <div class="yanshi-box f15">
        <div class="tbtn green">延时</div>
        <img class="guide-wanqujt" src="~images/teacher/guide-wanqujt.png" alt="">
      </div>
    </div>

    <div v-show="stepGuideDelay === 2">
      <div class="shouti-box f15">
        <div class="tbtn red">收题</div>
        <img class="guide-wanqujt" src="~images/teacher/guide-wanqujt.png" alt="">
      </div>
    </div>

    <div class="hint f25" v-show="stepGuideDelay === 1">
      给学生延长答题时间
    </div>
    <div class="hint f25" v-show="stepGuideDelay === 2">
      立即结束，结束后仍可延时
    </div>

    <v-touch class="action f18" v-show="stepGuideDelay === 1" v-on:tap="next(2)">
      下一步
    </v-touch>
    <v-touch class="action f18" v-show="stepGuideDelay === 2" v-on:tap="next(3)">
      知道了
    </v-touch>
  </div>
</template>

<script>
  import {mapGetters} from 'vuex'

  export default {
    name: 'GuideDelay',
    props: [],
    data () {
      return {
        step: 0,           // 引导状态 0 课堂动态；1 遥控器；2 结束
      }
    },
    computed: {
      ...mapGetters([
        'stepGuideDelay',
      ])
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
        self.$emit('guideDelayNext', self.step)
        self.$store.commit('set_stepGuideDelay', num)
        if (num === 3) {
          setTimeout(() => {
            self.$store.commit('set_isGuideDelayHidden', true)
          }, 100)
        }
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
    background: rgba(0,0,0,0.8);
    overflow: auto;
    text-align: center;

    .icon-ykq-shiti-guanbi {
      position: absolute;
      right: 0.533333rem;
      top: 0.266667rem;
      color: $white;
    }

    .yanshi-box, .shouti-box {
      position: absolute;
      top: 1.066667rem;
      width: 2.666667rem;
      height: 1.333333rem;
      border: 1px dashed $white;
      border-radius: 0.1rem;
      display: flex;
      align-items: center;
      justify-content: center;

      .guide-wanqujt {
        position: absolute;
        top: 1.4rem;
        width: 2.866667rem;
      }
    }

    .yanshi-box{
      left: 0.133333rem;

      .guide-wanqujt {
        left: 1.2rem;
      }
    }

    .shouti-box {
      right: 0.133333rem;

      .guide-wanqujt {
        right: 1.2rem;
        transform: scale(-1,1);
      }
    }

    .tbtn {
      width: 1.733333rem;
      height: 0.8rem;
      line-height: 0.8rem;
      border: 1px solid #CCCCCC;
      border-radius: 0.4rem;
      color: $white;
    }

    .green {
      border-color: #08BC72;
      background-color: rgba(8, 188, 114, 0.2)
    }
    .red {
      border-color: #F84F41;
      background-color: rgba(248, 79, 65, 0.2)
    }

    .hint {
      position: absolute;
      top: 7.2rem;
      color: $white;
      width: 100%;
    }

    .action {
      position: absolute;
      left: 50%;
      bottom: 2.146667rem;
      transform: translateX(-50%);
      width: 3.293333rem;
      height: 1.373333rem;
      line-height: 1.3rem;
      color: #000000;
      background: url(~images/teacher/guide-btnbg.png) 0 0 no-repeat;
      background-size: cover;
    }

    .guide-jt-chakandaan {
      position: absolute;
      right: 1.2rem;
      top: 3.0rem;
      width: 1.56rem;
    }

    .guide-chakandaan {
      position: absolute;
      right: 0;
      top: 0;
      width: 3.066667rem;
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

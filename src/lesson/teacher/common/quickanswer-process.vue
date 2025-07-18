<template>
  <section class="jumpin__process__wrapper">
    <p class="signin f13" v-html="$t('quickanswersignedin', {signin: signin})">当前共有<span class="f24 num">{{ signin }}</span>位学生进入课堂</p>
    <p class="label f17" v-if="status == QuickAnswerState.INIT"><!-- 举手发言太常规?开启抢答点燃学生热情，轻松把控课堂节奏～ -->{{ $t('quickanswertips') }} </p>
    <div class="empty" v-else>
      <img src="~images/teacher/jumpin-empty.png" alt="">
      <p class="f17"> <!-- 抢答席位暂空，谁来破局？ -->{{ $t('nostudentjumpin') }}</p>
    </div>

    <div class="control-btn box-center">
      <div class="bg" :class="{'ani': isAnswering}"></div>
      <div class="line" :class="{'ani': isAnswering}"></div>
     
      <div class="btn-inner box-center f21 bold" :class="{'being': isAnswering}" @click="handleStart" v-html="btnText">{{ btnText}}</div>
    </div>
  </section>
</template>

<script>
const QuickAnswerState = {
  // 
  INIT: 0,
  PREPARE: 1,
  COUNTDOWN: 2,
  ENDED: 3
}
export default {
  name: "quickanswer-process",
  data() {
    return {
      QuickAnswerState
    }
  },
  props: {
    status: Number,
    waiting: Number,
    countdown: Number,
    user: Object,
    signin: Number,
  },
  computed: {
    btnText: function() {
      if(this.status === QuickAnswerState.INIT) {
        return this.$t('startquickanswer') || '开始抢答'
      } else if(this.status === QuickAnswerState.PREPARE) {
        return this.$t('quickanswerprepare', {count: this.waiting}) || `${this.waiting}s <br/> 后开始抢答`
      } else if(this.status === QuickAnswerState.COUNTDOWN) {
        return this.$t('quickanswering', {count: this.countdown}) || `${this.countdown}s <br/> 抢答中...`
      } else {
        return this.$t('continuequickanswer') || '继续抢答'
      }
    },

    isAnswering: function() {
      return this.status == QuickAnswerState.COUNTDOWN || this.status == QuickAnswerState.PREPARE
    }
  },

  methods: {
    handleStart() {
      if(this.status == QuickAnswerState.INIT || this.status == QuickAnswerState.ENDED) {
        this.$emit('start')
      }
    }
  },

  created() {
  },

  beforeDestroy() {
    
  },
}
</script>

<style lang="scss" scoped>
@import "~@/style/common_rem";
.jumpin__process__wrapper {
  text-align: center;

  .bold {
    font-weight: bold;
  }

  .signin {
    line-height: px2rem(80px);

    .num {
      margin: 0 px2rem(16px);
    }
  }

  .label {
    padding: px2rem(40px) px2rem(60px);
  }

  .empty {
    margin: px2rem(72px) auto;

    img {
      height: px2rem(136px);
    }
  }

  .control-btn {
    position: absolute;
    bottom: px2rem(184px);
    left: 50%;
    transform: translateX(-50%);
    width: px2rem(520px);
    height: px2rem(520px);

    .bg {
      position: absolute;
      width: 100%;
      height: 100%;
      background: url(~images/teacher/jumpin-btn-bg.png)no-repeat center center/contain;

      &.ani {
        animation: anim 2s linear infinite .3s;
      }
    }

    .line {
      width: 100%;
      height: 100%;
      background: url(~images/teacher/jumpin-btn-line.png)no-repeat center center/contain;

      &.ani {
        animation: anim 2s linear infinite;
      }
    }

    @keyframes anim {
      0%  { transform: scale(1) ;   opacity: 0;  }
      50% { opacity: 1; }
      100% { transform: scale(1.5) ;  opacity: 0;  }
    }

    .btn-inner {
      background: linear-gradient(224.03deg, rgba(45, 114, 232, 0.8) 8.38%, rgba(67, 25, 130, 0.8) 89.03%);
      position: relative;
      border-radius: 50%;
      width: px2rem(312px);
      height: px2rem(312px);
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      flex-direction: column;

      &.being {
        background: linear-gradient(224.03deg, rgba(45, 114, 232, 0.3) 8.38%, rgba(67, 25, 130, 0.3) 89.03%);
      }

      // &::before {
      //   content: "";
      //   position: absolute;
      //   top: 50%;
      //   left: 50%;
      //   transform: translate(-50%, -50%);
      //   width: px2rem(320px);
      //   height: px2rem(320px);
      //   border-radius: 50%;
      //   background: linear-gradient(224.03deg, rgba(45, 114, 232, 0.6) 8.38%, rgba(67, 25, 130, 0.6) 89.03%);
      //   z-index: -1;
      // }
    }
  }
}

</style>

<style lang="scss">
@import "~@/style/common_rem";
.jumpin__process__wrapper {
  .signin {
    .num {
      margin: 0 px2rem(16px);
    }
  }
}
</style>
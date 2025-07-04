<template>
  <div class="jumpin__wrapper box-between">
    <div class="text">
      <p class="f18">Hi,老师发起了抢答</p>
      <p class="f15">快点击参与~</p>
    </div>
    <div class="jumpin box-center f28" :class="{'disabled': !isStart}" @click="handleJumpIn">抢</div>
  </div>
</template>

<script>
export default {
  name: 'jumpin',
  data() {
    return {
      isStart: false,
      waiting: 0,
      timer: null
    }
  },
  props: {
    info: Object
  },

  watch: {
    info(newVal) {
      if(newVal) {
        this.init()
      }
    }
  },

  computed: {
  },

  methods: {
    init() {
      if(!this.info) return
      let { now, start } = this.info
      if(now >= start) {
        console.log(2222)
        this.isStart = true
      } else {
        this.timer && clearInterval(this.timer)
        this.timer = setInterval(() => {
          now += 1000
          console.log(now, start)
          if(now >= start) {
            clearInterval(this.timer) 
            this.isStart = true
          }
        }, 1000)
      }
    },

    handleJumpIn() {
      if(!this.isStart) return
      if(this.$parent.role == 6) {
        this.$toast({
          message: this.$i18n.t('gueststudentnotquickanswer') || '旁听生无法抢答',
          duration: 3000
        })

        return
      }

      let URL = API.lesson.student_quick_answer
      let params = {
        id: this.info.id
      }

      return request.post(URL, params)
      .then(res => {
        if(res && res.code == 0 && res.data) {
          let { status } = res.data
          if(status == 1) {
            this.$toast({
              message: '抢答成功',
              duration: 3000
            });
          } else if(status == 2) {
            this.$toast({
              message: '抢答已结束',
              duration: 3000
            });
          } else {
            this.$toast({
              message: '抢答失败',
              duration: 3000
            })
          }
        }
      })
    }
  },
  created() {
  },

  mounted() {
    this.init()
  },

  beforeDestroy() {
    
  },
}
</script>

<style lang="scss" scoped>
@import "~@/style/common_rem";
.jumpin__wrapper {
  margin: px2rem(30px) px2rem(34px);
  padding: px2rem(30px);
  background: url('https://fe-static-yuketang.yuketang.cn/fe/static/assets/remote/stu-jumpin-btn.png') no-repeat center center/contain;
  color: #fff;

  .text {
    text-align: left;
  }

  .jumpin {
    width: px2rem(128px);
    height: px2rem(128px);
    color: #2A498A;
    background: url('https://fe-static-yuketang.yuketang.cn/fe/static/assets/remote/stu-jumpin-yellow.png') no-repeat center center/contain;
    animation: shake 0.5s linear infinite;

    &.disabled {
      color: #919196;
      background-image: url('https://fe-static-yuketang.yuketang.cn/fe/static/assets/remote/stu-jumpin-gray.png');
      animation: none;
    }
  }

  @keyframes shake {
    0% { transform: translateZ(1px, 1px) rotate(0deg); }
    10% { transform: translate(-1px, -2px) rotate(-1deg); }
    20% { transform: translate(-3px, 0px) rotate(1deg); }
    30% { transform: translate(3px, 2px) rotate(0deg); }
    40% { transform: translate(1px, -1px) rotate(1deg); }
    50% { transform: translate(-1px, 2px) rotate(-1deg); }
    60% { transform: translate(-3px, 1px) rotate(0deg); }
    70% { transform: translate(3px, 1px) rotate(-1deg); }
    80% { transform: translate(-1px, -1px) rotate(1deg); }
    90% { transform: translate(1px, 2px) rotate(0deg); }
    100% { transform: translate(1px, -2px) rotate(-1deg); }
  }
}
</style>
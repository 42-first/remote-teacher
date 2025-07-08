<template>
  <div class="jumpin__wrapper box-between" :class="{'disabled': !isStart}">
    <div class="text">
      <p class="f18"><!-- Hi,老师发起了抢答 --> {{ $t('newquickanswer') }} </p>
      <p class="f15"><!-- 快点击参与~ --> {{ $t('clicktojump') }} </p>
    </div>
    <div class="jumpin box-center bold" :class="lang == 'en' ? 'f15' : 'f30'"  @click="handleJumpIn"><!-- 抢~ --> {{ $t('jumpin') }} </div>
  </div>
</template>

<script>
export default {
  name: 'jumpin',
  data() {
    return {
      isStart: false,
      waiting: 0,
      timer: null,
      lang: i18n.locale
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
              message: this.$i18n.t('quickanswersuccess') || '抢答成功',
              duration: 3000
            });
          } else if(status == 2) {
            this.$toast({
              message: this.$i18n.t('quickanswerend') || '抢答已结束',
              duration: 3000
            });
          } else {
            this.$toast({
              message: this.$i18n.t('quickanswerfail') || '抢答失败',
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
  background: url('https://fe-static-yuketang.yuketang.cn/fe/static/assets/remote/stu-jumpin-bg.jpg') no-repeat center center/cover;
  color: #fff;
  border-radius: px2rem(32px);
  overflow: hidden;
  height: px2rem(188px);
  position: relative;

  &.disabled {
    background-image: url('https://fe-static-yuketang.yuketang.cn/fe/static/assets/remote/stu-jumpin-bg-gray.jpg') ;

    .jumpin {
      color: #B8B6CC;
      background-image: url('https://fe-static-yuketang.yuketang.cn/fe/static/assets/remote/jumpin-btn-gray.png');
      animation: none;
    }
  }

  .text {
    text-align: left;
  }

  .jumpin {
    position: absolute;
    top: 0;
    right: 0;
    width: px2rem(188px);
    height: px2rem(188px);
    color: #B06823;
    background: url('https://fe-static-yuketang.yuketang.cn/fe/static/assets/remote/jumpin-btn.png') no-repeat center center/contain;
    animation: shake 0.5s ease-in-out infinite;
  }

  @keyframes shake {
    0% { transform: scale(1); }
    50% { transform: scale(.9); }
    100% { transform: scale(1); }
  }
}
</style>
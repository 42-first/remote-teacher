<template>
  <div class="jumpin__wrapper box-between">
    <p>老师发起了抢答，快来参与吧</p>
    <div class="jumpin" :class="{'disabled': !isStart}" @click="handleJumpIn">抢</div>
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

<style>

</style>
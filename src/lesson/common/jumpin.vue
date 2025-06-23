<template>
  <div class="jumpin__wrapper box-between">
    <p>老师发起了抢答，快来参与吧</p>
    <div class="jumpin" :class="{'disabled': !isStart}" @click="handleJumpIn">抢</div>
  </div>
</template>

<script>
import { param } from 'jquery'
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

  computed: {
  },

  methods: {
    init() {
      let { prepare, now, limit, start } = this.info
      if(now - start >= prepare) {
        this.isStart = true
      } else {
        this.waiting = Math.ceil((prepare - (now - start)) / 1000)
        this.timer = setInterval(() => {
          if(this.waiting > 1) {
            this.waiting--
          } else {
            clearInterval(this.timer)
            this.isStart = true
          }
        }, 1000)
      }
    },

    handleJumpIn() {
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
    this.init()
  },

  beforeDestroy() {
    
  },
}
</script>

<style>

</style>
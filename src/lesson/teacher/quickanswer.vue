<template>
  <div class="quickanswer__wrapper" @click="handleCloseModal">
    <div class="records-btn box-center f13" @click.stop="handleToggleRecords" v-if="records.length">
      <!-- 已抢答 -->{{ $t('quickanswerrecords') }}
      <i class="iconfont icon-jiantoudan-xiangyou f12"></i>
    </div>
    <component
      :is="curComponent"
      :status="status"
      :waiting="waiting"
      :countdown="countdown"
      :user="jumpInUser"
      :signin="signin"
      @start="handleJumpIn"
      @updateScore="addScore"
      @toggleEdit="handleToggleEdit"
    ></component>

    <footer class="footer box-center">
      <div class="btn box-center" @click="handleClose"><!-- 继续上课 --> {{ $t('backtoclass') }}</div>
      <div class="btn box-center continue" v-if="jumpInUser" @click="handleJumpIn"><!-- 继续抢答 --> {{ $t('continuequickanswer') }}</div>
    </footer>

    <QuickAnswerScore
      v-if="visibleEdit"
      :editUser="editUser"
      @toggleEdit="handleToggleEdit"
      @updateScore="addScore"
    />

    <QuickAnswerRecords
      v-if="visibleRecords"
      :records="records"
      @toggleRecords="handleToggleRecords"
      @toggleEdit="handleToggleEdit"
      @updateScore="addScore"
    />
  </div>
</template>

<script>
import {mapGetters} from 'vuex'
import request from '@/util/request-v3'
import API from '@/util/api'
import QuickAnswerRecords from './common/quickanswer-records.vue'
import QuickAnswerProcess from './common/quickanswer-process.vue'
import QuickAnswerResult from './common/quickanswer-result.vue'
import QuickAnswerScore from './common/quickanswer-score.vue'

const QuickAnswerState = {
  // 
  INIT: 0,
  PREPARE: 1,
  COUNTDOWN: 2,
  ENDED: 3
}

let prepareTimer = null
let countdownTimer = null

export default {
  name: 'quickanswer',
  data() {
    return {
      status: QuickAnswerState.INIT,
      waiting: 5,
      countdown: 10,
      records: [],
      quickAnswerId: '',
      jumpInUser: null,
      isAnswering: false,
      signin: 0,
      editUser: null,
      visibleEdit: false,
      visibleRecords: false,
      noSend: false
    }
  },
  components: {
    QuickAnswerProcess,
    QuickAnswerResult,
    QuickAnswerScore,
    QuickAnswerRecords
  },
  computed: {
    ...mapGetters([
      'lessonid',
      'classroomid',
      'socket',
    ]),

    btnText() {
      if(this.status === QuickAnswerState.INIT) {
        return this.$t('startquickanswer') || '开始抢答'
      } else if(this.status === QuickAnswerState.PREPARE) {
        return this.$t('quickanswerprepare', {count: this.waiting}) || `${this.waiting}s 后开始抢答`
      } else if(this.status === QuickAnswerState.COUNTDOWN) {
        return `${this.countdown}s`
      } else {
        return this.$t('continuequickanswer') || '继续抢答'
      }
    },

    curComponent() {
      if(this.status == QuickAnswerState.ENDED && this.jumpInUser) {
        return QuickAnswerResult
      } else {
        return QuickAnswerProcess
      }
    }
  },

  methods: {
    init() {
      this.signin = +this.$route.query.sc
      this.handlePubSub()

      this.getRecords()
    },
    
    /**
     * 处理发布订阅
     *
     */
    handlePubSub () {
      let self = this

      // 订阅前清掉之前可能的订阅，避免多次触发回调
      T_PUBSUB.unsubscribe('jumpin-msg')

      T_PUBSUB.subscribe('jumpin-msg.closedmask', (_name, msg) => {
        if(self.noSend) return
        self.noSend = true
        self.handleClose()
        self.$router.back()
      })

      T_PUBSUB.subscribe('jumpin-msg.jumpinstart', (_name, msg) => {
        self.handleStarted(msg)
      })

      T_PUBSUB.subscribe('jumpin-msg.jumpinend', (_name, msg) => {
        self.handleEnded(msg)
      })
      
    },

    /**
     * @method 关闭通知
     */
    handleClose() {
      let self = this

      let str = JSON.stringify({
        'op': 'closemask',
        'lessonid': self.lessonid,
        'type': 'jumpin'
      })

      self.socket.send(str)
    },

    /**
     * @method 获取抢答记录
     */
    getRecords() {
      let URL = API.lesson.get_quick_answer_records
      return request.get(URL)
      .then(res => {
        if(res && res.code == 0 && res.data) {
          this.records = res.data.list
        }
      })
    },

    /**
     * @method 开始抢答
     */
    handleJumpIn() {
      if([QuickAnswerState.INIT, QuickAnswerState.ENDED].includes(this.status)) {
        this.startQuickAnswer()
        this.jumpInUser = null
      }
    },

    /**
    * @method 发起抢答
    */
    startQuickAnswer() {
      let URL = API.lesson.start_quick_answer
      return request.post(URL)
      .then(res => {
        if(res && res.code == 0) {
          this.quickAnswerId = res.data.id
        }
      })
    },


    /**
    * @method 结束抢答
    */
    endQuickAnswer() {
      let URL = API.lesson.end_quick_answer
      let params = {
        id: this.quickAnswerId
      }
      return request.post(URL, params)
      .then(res => {
        if(res && res.code == 0) {
          return res.data.id
        }
      })
    },

    /**
     * @method 抢答加分
     */
    addScore(id, score) {
      let URL = API.lesson.set_quick_answer_score
      let params = {
        id,
        score
      }
      return request.post(URL, params)
      .then(res => {
        if(res && res.code == 0) {
          this.$toast({
            message: '加分成功',
            duration: 3000
          })
          this.getRecords()

          if(this.jumpInUser.id == id) {
            this.jumpInUser.score = score
          }
          return res.code
        }
      })
    },


    /**
     * @method 抢答开始 准备倒计时
     */
    handleStarted(val) {
      let { id, prepare, limit, now, start } = val
      this.quickAnswerId = id
      this.status = QuickAnswerState.PREPARE
      this.waiting = prepare
      this.countdown = limit
      this.handleStartPrepare()
      this.isAnswering = true
    },


    /**
     * @method 开始准备倒计时
     */
    handleStartPrepare() {
      prepareTimer = setInterval(() => {
        if(this.waiting > 1) {
          this.waiting--
        }else {
          clearInterval(prepareTimer)
          this.status = QuickAnswerState.COUNTDOWN
          this.handleStartCountdown()
        }
      }, 1000)
    },

    /**
     * @method 开始倒计时
     */
    handleStartCountdown() {
      countdownTimer = setInterval(() => {
        if(this.countdown > 1) {
          this.countdown--
        } else {
          clearInterval(countdownTimer)
          this.status = QuickAnswerState.ENDED
        }
      }, 1000)
    },

    handleEnded(msg) {
     countdownTimer && clearInterval(countdownTimer)
      this.status = QuickAnswerState.ENDED
      if(msg.uid) {
        this.jumpInUser = Object.assign(msg, {id: this.quickAnswerId, score: 0})
      }

      this.getRecords()
    },

    handleToggleEdit(user) {
      this.visibleEdit = !this.visibleEdit
      this.editUser = user
    },

    handleToggleRecords() {
      this.visibleRecords = !this.visibleRecords
    },

    handleCloseModal() {
      this.visibleEdit = false
      this.visibleRecords = false
    }

  },

  created() {
    this.init()

    this.handlePubSub()
  },

  beforeDestroy() {
    T_PUBSUB.unsubscribe('jumpin-msg')
    if(this.isAnswering) {
      this.endQuickAnswer()
    }
  },

}
</script>

<style lang="scss" scoped>
@import "~@/style/common_rem";
.quickanswer__wrapper {
  width: 100%;
  height: 100%;
  background: radial-gradient(119.74% 255.75% at 133.33% -2.71%, #04006B 0%, #0E0E17 100%);
  padding-top: px2rem(180px);
  color: #fff;

  .yellow {
    color: #F78600;
  }

  .records-btn {
    position: absolute;
    top: px2rem(16px);
    left: 0;
    padding: px2rem(16px);
    border-radius: 0 px2rem(32px) px2rem(32px) 0;
    border-width: 1px, 1px, 1px, 0px;
    border-style: solid;
    border-color: #FFFFFF66;
  }

  .footer {
    position: absolute;
    bottom: px2rem(60px);
    left: 0;
    width: 100%;
    padding: 0 px2rem(60px);

    .btn {
      flex: 1;
      height: px2rem(88px);
      max-width: px2rem(600px);
      border-radius: px2rem(64px);
      border: 1px solid var(--text-text-pri-02, #3D7BFF);
      color: #3D7BFF;
      background: transparent;
      position: relative;

      &.continue {
        background: linear-gradient(224.03deg, rgba(45, 114, 232, 0.8) 8.38%, rgba(67, 25, 130, 0.8) 89.03%);
        color: #fff;
        margin-left: px2rem(32px);

        &::before {
          content: "";
          width: calc(100% + 2px);
          height: calc(100% + 2px);
          position: absolute;
          top: -1px;
          left: -1px;
          background: linear-gradient(224.03deg, rgba(248, 251, 255, 0.1) 8.38%, rgba(191, 148, 255, 0.1) 89.03%);
          border-radius: px2rem(64px);
          z-index: -1;
        }
      }
    }
  }
}
</style>
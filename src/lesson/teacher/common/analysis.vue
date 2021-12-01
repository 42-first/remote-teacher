/*
 * @page：答案解析组件 遥控器使用
 * @author: chenzhou
 * @update: 2018.12.11
 * @desc 主观题客观题对应答案解析和交互
 *
 */


<template>
  <!-- 解析页面 -->
  <section class="analysis__page mask-analysis">

    <article class="analysis-content">
      <h3 class="title f18">
        <span class="title-content">{{ $t('answerkey') }}</span>
        <i class="iconfont icon-guanbi1 color6" @click="handleclosed"></i>
      </h3>
      <!-- 解析内容 -->
      <section class="analysis-container">
        <analysis :problem.sync="problem"></analysis>
      </section>
      <!-- 底部操作 -->
      <div class="analysis__footer">
        <!-- 投屏/取消投屏 -->
        <div class="item">
          <p class="analysis--closed f17" @click="handleScreen">
            <template v-if="!hasThrownScreen">{{ $t('screenmode') }}</template>
            <template v-else>{{ $t('screenmodeoff') }}</template>
          </p>
        </div>
        <div class="item">
          <p v-if="sendStatus<2" class="analysis--closed f17" :class="[ sendStatus ? 'c9b' : '' ]" @click="handleSendToStu"><!-- 发送给学生 -->{{ $t('sendtostus') }}</p>
          <p v-else class="analysis--closed f17 c9b" ><!-- 已发给学生 -->{{ $t('hasbeensend') }}</p>
        </div>
      </div>
    </article>

    
  </section>

</template>

<style lang="scss" scoped>
@import "~@/style/common_rem";
  .analysis__page {
    z-index: 1000;
    position: fixed;
    top: 0;
    left: 0;

    width: 100%;
    height: 100%;

    background: rgba(0, 0, 0, 0.7);
  }

  .analysis__footer {
    position: relative;
    display: flex;
    align-items: center;
    height: px2rem(98px);
    line-height: px2rem(98px);
    text-align: center;
    color: #639EF4;
    background-color: #fff;
    .item{
      width: 50%;
      position: relative;
    }
    .item:nth-of-type(2n)::before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      height: 100%;
      border-left: px2rem(2px) solid #eee;
      transform: scaleX(0.5);
    }
  }
  .analysis__footer::before{
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    border-top: px2rem(2px) solid #eee;
    transform: scaleY(0.5);
  }

  .analysis--closed {
  }

  .analysis-content {
    position: absolute;
    top: 0.533333rem;
    left: 0.533333rem;
    right: 0.533333rem;
    bottom: 0.533333rem;
    
    background-color: #fff;
    border-radius: 0.106667rem;
    box-shadow: 0 0.106667rem 0.16rem rgba(0,0,0,0.2);
    overflow: hidden;
    
    display: flex;
    flex-direction: column;

    .title {
      font-weight: normal;
      color: #333;
      text-align: center;
      display: flex;
      align-items: center;
      height: px2rem(100px);
      padding: 0 px2rem(24px);
      background-color: #f8f8f8;
      .title-content{
        flex: 1;
      }
      .iconfont{
        font-size: px2rem(48px);
      }
    }

    .analysis-container {
      padding: 0 0.453333rem;
      flex: 1;
      overflow: auto;
      -webkit-overflow-scrolling: touch;
    }
  }

</style>
<script>
  import {mapGetters} from 'vuex'
  import request from '@/util/request-v3'
  import API from '@/util/api'
  import { isSupported } from '@/util/util'


  export default {
    props: {
      problem: {
        type: Object,
        default: null
      },
      hideAnalysis: {
        type: Function
      }
    },
    data() {
      return {
        // 锁定发送 发送状态 0：未发送 1：发送中 2：已发送 3：发送失败
        sendStatus: 0,
        hasThrownScreen: false
      }
    },
    watch: {
      // problem(newVal, oldVal) {
      // }
    },
    computed: {
      ...mapGetters([
        'lessonid',
        'isCloneClass',
        'socket',
        'presentationid',
        'current',
        'pptData'
      ]),
      problemid() {
        return typeof this.problem === "object" && this.problem.problemId
      }
    },
    components: {
      analysis: () => import('@/lesson/common/analysis.vue'),
    },
    methods: {
      /**
       * @method 组件初始化
       */
      init() {
        let key = 'analysis-sendstatus-' + this.problem.problemId;
        if(isSupported(window.localStorage)) {
          this.sendStatus = +localStorage.getItem(key);
        }
        if (this.analysisRemarkId === this.problemid) {
          this.handleScreen(2)
        }

        this.msgHandle()
      },

      /** 
       * @method 处理发布订阅
      */
      initPubSub(){
        PubSub.unsubscribe('problem-remark')

        PubSub.subscribe('remark-msg.send', (msg, data) => {
          // 发送成功
          
          this.sendStatus = 2
          
          // 这里记录是否发送
          let key = 'analysis-sendstatus-' + this.problem.problemId;
          if(isSupported(window.localStorage)) {
            localStorage.setItem(key, this.sendStatus);
          }
        })
      },

      /**
       * 状态消息接收
       */
      msgHandle() {
        let self = this
        this.socket.onmessage = e => {
          try {
            const data = typeof e.data === "string" ? JSON.parse(e.data) : e.data
            if (data.op === 'problemremarkshown') {
              self.hasThrownScreen = true
            }
            if (data.op === 'closedmask') {
              self.hasThrownScreen = false
            }
            if(data.op === 'problemremark') {
              const { remark } = data
              if (remark.prob === self.problemid) {
                // 发送成功
                self.sendStatus = 2;
                // 这里记录是否发送
                let key = 'analysis-sendstatus-' + self.problemid;
                if(isSupported(window.localStorage)) {
                  localStorage.setItem(key, self.sendStatus);
                }
              }
            }
          } catch (error) {
            console.log(error)
          }
        }
      },

      /**
       * @method 答案解析投屏和取消投屏
       */
      handleScreen(type) {
        let params = null
        const lessonid = this.lessonid
        if (this.hasThrownScreen || type === 1) {
          params = {
            'op': 'closemask',
            lessonid,
            'type': 'remark',
            'msgid': 1
          }
          this.$store.commit('set_analysisRemarkId', 0)
        } else if(!this.hasThrownScreen || type === 2) {
          params = {
            op: "showproblemremark",
            lessonid: this.lessonid,
            prob: this.problemid,
            msgid: 1
          }
        }
        this.socket.send(JSON.stringify(params))
      },

      /**
       * @method 关闭答案解析页面
       */
      handleclosed() {
        this.handleScreen(1)
        if(typeof this.hideAnalysis === 'function') {
          this.hideAnalysis();
        }
      },

      /**
       * @method 发送给全班
       */
      handleSendToStu() {

        // 克隆班不能执行当前操作
        if (!!this.isCloneClass) {
          this.$toast({
            message: this.$t('cloneTips'),
            duration: 3e3
          });
          return
        }

        if(this.sendStatus > 0) {
          return this;
        }

        // 禁止重复发送
        this.sendStatus = 1;

        let str = JSON.stringify({
          'op': 'sendremark',
          'lessonid': this.lessonid,
          'prob': this.problem.problemId,
          'pres': this.presentationid,
          'sid': this.pptData[this.current-1].id
        })

		    self.socket.send(str)
      }

    },
    created() {
      // this.initPubSub()
      this.init();
    }
  }
</script>

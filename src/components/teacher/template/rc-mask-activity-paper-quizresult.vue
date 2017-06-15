<!-- 已发试卷饼图页 被父组件 rc-mask-activity-paper.vue 引用 -->
<template>
	<div class="quizresult-box">
    <!-- 关闭按钮 -->
    <v-touch tag="i" class="iconfont icon-close f24" v-on:tap="closeQuizresult"></v-touch>

    <!-- 上部时钟 -->
    <section class="upper">
      <div class="f60">
        <i class="iconfont icon-clock f40"></i>
        <span class="time">00:45</span>
      </div>
      <div class="f18">
        已有 <span>1</span> / <span>5TODO</span> 位同学提交了试卷
      </div>
    </section>

    <!-- 中间饼图 -->
    <section class="chart-box">
      分数分布
    </section>

    <!-- 下方按钮 -->
    <section class="group-btns">
      <v-touch class="btn-item" v-on:tap="tapRedpacketHandler">
        <img src="http://sfe.ykt.io/o_1bb62m7q7i8t1c6q1cn4150u1v8vj.png" />
        <div class="btn-desc f15">收卷</div>
      </v-touch>

      <v-touch class="btn-item" v-on:tap="postQuizresult">
        <img src="http://sfe.ykt.io/o_1bb62k4e41s1i1r0b1is3nf11tku9.png" />
        <div class="btn-desc f15">投屏</div>
      </v-touch>

      <v-touch class="btn-item" v-on:tap="showQuizresultDetail">
        <img src="http://sfe.ykt.io/o_1bb62l9qvf141gio1q86g6i1pdee.png" />
        <div class="btn-desc f15">查看详情</div>
      </v-touch>
    </section>
  </div>
</template>

<script>
  import request from '@/util/request'
  import API from '@/config/api'

  export default {
    name: 'RcMaskActivityPaperQuizresult',
    props: ['lessonid', 'socket'],
    data () {
      return {
        quizid: -1,     // 已发试卷的id
      }
    },
    created () {
      let self = this

      // 点击 已发试卷 或 发布了一个试卷 父组件发送事件给本子组件，显示已发试卷饼图等信息
      self.$on('showQuizResult', function (quizid) {
        self.quizid = quizid
      })
    },
    methods: {
      /**
       * 查看试卷结果饼图页(发布试卷后或查看历史发布)
       *
       */
      showQuizResult(){
        let self = this

        return

        quizTimeBellCount = 1;

        self.setData({
          isQuizResultHidden: false,
          // HACK 小程序中如果赋予的新值是undefined的话，根本不会进行赋值，也不会覆盖之前的值
          isPaperCollected: finishedQuizList['id'+quizid] || false
        })

        if(!self.data.isPaperCollected){
          refPaperTimer = setInterval(function(){
            self.getPaperResult(quizid);
          }, 3000);

          quizTimeBellTimer = setInterval(function(){
              self.setData({
                paperTimePassed: self.sec2str(quizTimeBellCount++)
              })
          }, 1000);
        }
        
        self.getPaperResult(quizid);
      },
      /**
       * 点击关闭试卷结果饼图页的按钮
       *
       * @event bindtap
       */
      closeQuizresult () {
        let self = this

        self.endTimers()

        let str = JSON.stringify({
          'op': 'closequizresult',
          'lessonid': self.data.lessonid,
          'quizid': QUIZID
        })

        wx.sendSocketMessage({
          data: str
        })

        this.setData({
          isQuizResultHidden: true,
          paperTimePassed: '--:--'
        })
      },
      /**
       * 试题柱状图页面中的 投屏 按钮
       *
       * @event bindtap
       */
      postQuizresult () {
        let self = this

        let str = JSON.stringify({
          'op': 'postproblemresult',
          'lessonid': self.lessonid,
          'problemid': self.problemid
        })

        self.socket.send(str)
      },
      /**
       * 显示试题详情的按钮：查看详情
       *
       * @event bindtap
       */
      showQuizresultDetail () {
        // 数据都是在 remote.vue
        let self = this

        self.isQuizresultDetailHidden = false
        self.$refs.RcMaskQuizresultDetail.$emit('refreshProblemResultDetail')
      },
      /**
       * 关闭试题详情的按钮
       *
       * @event bindtap
       */
      closeProblemresultdetail () {
        this.setData({
          isProblemResultDetailHidden: true
        })
      },
      
      /**
       * 在柱状图页面中点击按钮显示设置红包页面
       * 被 rc-mask-problemresult.vue 引用
       *
       * @event bindtap
       */
      tapRedpacketHandler () {
        let self = this

        let REDID = self.problemResultData.RedEnvelopeID
        let PROBLEMID = self.problemResultData.problemID

        if (!REDID) {
          self.showRedpacket()
        } else {
          self.showRedpacketList()
        }
      },
    }
  }
</script>

<style lang="scss" scoped>
  @import "~@/style/_variables";
  .quizresult-box {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    background: #000000;
    color: $white;
    text-align: center;

    .icon-close {
      position: absolute;
      right: 0.4rem;
      top: 0.4rem;
      vertical-align: middle;
    }

    /* 上部 */
    .upper {
      margin: 0 auto;
      width: 8.8rem;
      min-height: 3.466667rem;
      padding-top: 0.8rem;
      border-bottom: 1px solid #cccccc;
    }

    /* 中间饼图 */
    .histogram-box {
      margin: 0 auto;
      padding-top: 1rem;
      width: 8.8rem;
      height: 6rem;
      display: flex;
      justify-content: space-between;
      align-items: bottom;
      
    }
    
    /* 下方按钮 */
    .group-btns {
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 7.466667rem;
      padding-top: 1.866667rem;

      .btn-item {
        width: 1.6rem; 
        text-align: center;
        font-size: 30rpx;
        color: #fff;

        img {
          margin-bottom: 0.4rem;
        }
      }
    }
  }
</style>

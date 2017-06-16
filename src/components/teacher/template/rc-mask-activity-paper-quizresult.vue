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
      <v-touch class="btn-item" v-on:tap="collectQuiz">
        <img src="http://sfe.ykt.io/o_1bb62m7q7i8t1c6q1cn4150u1v8vj.png" />
        <div class="btn-desc f15">收卷文案TODO</div>
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

    <RcMaskActivityPaperQuizresultDetail
      ref="RcMaskActivityPaperQuizresultDetail"
      v-show="!isQuizresultDetailHidden"
      :quizid="quizid"
      @closeQuizresultDetail="closeQuizresultDetail"
    ></RcMaskActivityPaperQuizresultDetail>
  </div>
</template>

<script>
  import request from '@/util/request'
  import API from '@/config/api'

  // 已发试卷详情页
  import RcMaskActivityPaperQuizresultDetail from '@/components/teacher/template/rc-mask-activity-paper-quizresult-detail'

  export default {
    name: 'RcMaskActivityPaperQuizresult',
    props: ['lessonid', 'socket'],
    data () {
      return {
        quizid: -1,                       // 已发试卷的id
        isQuizresultDetailHidden: true,   // 已发试卷详情页隐藏
      }
    },
    components: {
      RcMaskActivityPaperQuizresultDetail
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

        // self.endTimers()

        let str = JSON.stringify({
          'op': 'closequizresult',
          'lessonid': self.lessonid,
          'quizid': self.quizid
        })

        self.socket.send(str)
        // TODO
        // paperTimePassed = '--:--'
        self.$emit('closeQuizresult')
      },
      /**
       * 收卷
       *
       * @event bindtap
       */
      collectQuiz () {
        let self = this
        let url = API.quiz_finish

        let postData = {
          'quizID': self.quizid
        }

        request.post(url, postData)
          .then(jsonData => {
            console.log('quiz_finish', jsonData)
            // 不需要判断success，在request模块中判断如果success为false，会直接reject
            let data = DATA.data

            let str = JSON.stringify({
              'op': 'quizfinished',
              'lessonid': self.lessonid,
              'quizid': self.quizid,
              'title': jsonData.title
            })

            self.socket.send(str)

            // TODO
            // self.endTimers()
            // self.setData({
            //   isPaperCollected: true
            // })
            //记录已经收卷的quizID
            // finishedQuizList['id'+QUIZID] = true
          })
      },
      /**
       * 公布至屏幕
       *
       * @event bindtap
       */
      postQuizresult () {
        let self = this

        let str = JSON.stringify({
          'op': 'postquizresult',
          'lessonid': self.lessonid,
          'quizid': self.quizid
        })

        self.socket.send(str)
      },
      /**
       * 显示试题详情的按钮：查看详情
       *
       * @event bindtap
       */
      showQuizresultDetail () {
        let self = this

        self.isQuizresultDetailHidden = false
        self.$refs.RcMaskActivityPaperQuizresultDetail.$emit('showQuizresultDetail')
      },
      /**
       * 关闭已发试卷详情页
       *
       * @event bindtap
       */
      closeQuizresultDetail () {
        let self = this

        self.isQuizresultDetailHidden = true
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

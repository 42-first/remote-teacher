<!-- 已发试卷饼图页 -->
<template>
	<div class="quizresult-box">
    <!-- 上部时钟 -->
    <section class="upper">
      <div class="f50">
        <!-- <i class="iconfont icon-timing f40"></i> -->
        <img class="jishi" src="~images/teacher/jishi-zheng.png" alt="">
        <span class="time">{{paperTimePassed}}</span>
      </div>
      <div class="f18" v-show="!isSVGHidden || isAllPoll">
        已有 <span>{{stuCommited}}</span> / <span>{{stuTotal}}</span> 位同学提交了试卷
      </div>
    </section>

    <!-- 中间饼图 -->
    <section class="chart-box">
      <div class="fsfb f18">分数分布</div>
      <div v-show="isSVGHidden && !isAllPoll" class="hmy f18">还没有学生提交</div>
      <div v-show="isAllPoll" class="hmy f18">此试卷全部为投票题~</div>
      <div id="pieSolid" class="pie-solid">
        <svg v-show="!isSVGHidden" id="quizpie" class="f16" width="100%" height="4.0rem" xml:space="preserve"></svg>
    </div>
    </section>

    <!-- 下方按钮 -->
    <section class="group-btns">
      <v-touch class="btn-item" v-on:tap="collectQuiz">
        <div class="iconbox" style="background: #14C4E9;">
          <i class="iconfont icon-shiti_shijuan f28"></i>
        </div>
        <div class="btn-desc f14">{{isPaperCollected ? '已收卷' : '收卷'}}</div>
      </v-touch>

      <v-touch class="btn-item" v-on:tap="postQuizresult">
        <div class="iconbox" style="background: #28CF6E;">
          <i class="iconfont icon-shiti_touping f28"></i>
        </div>
        <div class="btn-desc f14">投屏</div>
      </v-touch>

      <router-link tag="div" class="btn-item" :to="{name: 'quizresultdetail', params: { quizid: quizid }}">
        <div class="iconbox" style="background: #EEBC28;">
          <i class="iconfont icon-shiti_chakanxiangqing f28"></i>
        </div>
        <div class="btn-desc f14">查看详情</div>
      </router-link>
    </section>

  </div>
</template>

<script>
  let quizTimeBellTimer = null  // 试卷饼图正计时的定时器
  let refPaperTimer = null      // 刷新试卷饼图的定时器
  let quizTimeBellCount = 1     // 刷新试卷饼图的辅助数字
  let isCollecting = false      // 当前正在收卷，此时频繁点击收卷按钮应无效

  import {mapGetters} from 'vuex'
  import {sec2str} from './util/util'
  import {drawRingSolid} from './util/drawsvg'
  import request from '@/util/request'
  import API from '@/pages/teacher/config/api'

  export default {
    name: 'Quizresult',
    data () {
      return {
        quizid: -1,                       // 已发试卷的id
        isQuizresultDetailHidden: true,   // 已发试卷详情页隐藏
        isPaperCollected: false,          // 已收卷
        paperTimePassed: '--:--',         // 已经过去的时间
        stuCommited: '--',                // 已经交卷学生个数
        stuTotal: '--',                   // 总学生数目
        isSVGHidden: true,                // 饼图svg隐藏
        isAllPoll: false,                 // 全部为投票题
      }
    },
    computed: {
      ...mapGetters([
        'lessonid',
        'socket',
        'finishedQuizList',
      ])
    },
    components: {
    },
    created () {
      this.init()
    },
    beforeDestroy(){
      this.closeQuizresult()
    },
    watch: {
      '$route' () {
        this.init()
      }
    },
    methods: {
      /**
       * 复用页面，需要watch route
       *
       */
      init () {
        let self = this

        self.quizid = +self.$route.params.quizid
        self.showQuizResult()
        self.handlePubSub()
      },
      /**
       * 处理发布订阅
       *
       */
      handlePubSub () {
        let self = this

        // 订阅前清掉之前可能的订阅，避免多次触发回调
        T_PUBSUB.unsubscribe('quiz-msg')

        T_PUBSUB.subscribe('quiz-msg.quizfinished', (_name, msg) => {
          // socket通知收卷了，有可能是pc发的，也有可能是手机遥控器自己发的
          if (self.quizid === msg.quizid) {
            self.isPaperCollected = true
            self.endTimers()
          } 
        })
      },
      /**
       * 归零、结束定时器等
       *
       */
      endTimers () {
        let self = this

        //归零饼图
        clearInterval(refPaperTimer)
        clearInterval(quizTimeBellTimer)
      },
      /**
       * 将秒数转换成 MM:SS 格式
       *
       * @param {number} sec 秒数
       */
      sec2str,
      /**
       * 查看试卷结果饼图页(发布试卷后或查看历史发布)
       *
       */
      showQuizResult () {
        let self = this

        self.endTimers()
        self.isSVGHidden = true
        self.paperTimePassed = '--:--'
        quizTimeBellCount = 1

        // finishedQuizList 数据是在 paper.vue 中获取后 commit 给 store 的
        self.isPaperCollected = self.finishedQuizList['id'+self.quizid] || false

        if (!self.isPaperCollected) {
          refPaperTimer = setInterval(function () {
            self.getPaperResult();
          }, 3000);

          quizTimeBellTimer = setInterval(function () {
              self.paperTimePassed = self.sec2str(quizTimeBellCount++)
          }, 1000);
        }
        
        self.getPaperResult();
      },
      /**
       * 获取试卷结果数据
       *
       */
      getPaperResult(){
        let self = this
        let url = API.quiz_results_statistics

        if (process.env.NODE_ENV === 'production') {
          url = API.quiz_results_statistics + '/' + self.quizid + '/'
        }

        // 单次刷新
        request.get(url)
          .then(jsonData => {
            // 时间更新处理
            jsonData.time = Math.floor(jsonData.time)
            // quizTimeBellCount跟上真实计时
            if (Math.abs(quizTimeBellCount - jsonData.time) > 2) {
              quizTimeBellCount = jsonData.time
            }
            // 如果已经收卷就直接塞时间
            if (self.isPaperCollected) {
              self.paperTimePassed = self.sec2str(quizTimeBellCount)
            }
            
            self.stuCommited = jsonData.total
            self.stuTotal = jsonData.members

            //没人做题就不画饼图
            if(jsonData.total === 0){
              self.isSVGHidden = true
              return
            }

            //全部为投票题就不画饼图
            if(jsonData.total_score === 0){
              self.isAllPoll = true
              self.isSVGHidden = true
              return
            }

            // 设置试卷详情数据
            self.isSVGHidden = false
            
            var range = [];
            var arr1 = [];

            for (var i = 0; i < jsonData.data.length; i++) {
                var item = jsonData.data[i];
                range.push(item.from + '~' + item.to);
                arr1.push(item.count);
            };

            drawRingSolid('#quizpie', range,arr1);
          })
      },
      /**
       * 点击关闭试卷结果饼图页的按钮
       *
       * @event bindtap
       */
      closeQuizresult () {
        let self = this


        let str = JSON.stringify({
          'op': 'closequizresult',
          'lessonid': self.lessonid,
          'quizid': self.quizid
        })

        self.socket.send(str)
        self.endTimers()
      },
      /**
       * 收卷
       *
       * @event bindtap
       */
      collectQuiz () {
        let self = this
        let url = API.quiz_finish

        if (isCollecting || self.isPaperCollected) {
          return
        }
        isCollecting = true

        let postData = {
          'quizID': self.quizid
        }

        request.post(url, postData)
          .then(jsonData => {
            console.log('quiz_finish', jsonData)
            // 不需要判断success，在request模块中判断如果success为false，会直接reject

            isCollecting = false
            self.isPaperCollected = true
            self.endTimers()
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
    }
  }
</script>

<style lang="scss" scoped>
  @import "~@/style/_variables";
  .quizresult-box {
    position: relative;
    min-height: 100%;
    background: #000000;
    color: $white;
    text-align: center;

    /* 上部 */
    .upper {
      margin: 0 auto;
      width: 8.8rem;
      min-height: 3.466667rem;
      padding-top: 0.8rem;

      .jishi {
        margin-top: -0.24rem;
        width: 1.2rem;
        vertical-align: middle;
      }
      
    }

    /* 中间饼图 */
    .chart-box {
      margin: 0 auto;
      padding-top: 0.266667rem;
      width: 8.8rem;
      height: 6.533333rem;
      border-top: 1px solid #C8C8C8;
      border-bottom: 1px solid #C8C8C8;
      
      .fsfb {
        text-align: center;
        margin-bottom: 1.0rem;
      }

      .hmy {
        margin-top: 2rem;
        color: $blue;
      }

      .pie-solid {
        width: 90%;
        margin: 0 auto;
      }
    }
    
    /* 下方按钮 */
    .group-btns {
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 7.466667rem;
      padding-top: 1.2rem;

      .btn-item {
        width: 1.75rem; 
        text-align: center;
        color: #fff;

        .iconbox {
          margin: 0 auto 0.4rem;
          width: 1.493333rem;
          height: 1.493333rem;
          line-height: 1.493333rem;
          text-align: center;
          border-radius: 50%;

          .iconfont {
            color: $white;
          }
        }
      }
    }
  }
</style>

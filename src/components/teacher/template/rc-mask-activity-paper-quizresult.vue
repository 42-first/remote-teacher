<!-- 已发试卷饼图页 被父组件 rc-mask-activity-paper.vue 引用 -->
<template>
	<div class="quizresult-box">
    <!-- 关闭按钮 -->
    <v-touch class="close-box"  v-on:tap="closeQuizresult">
      <i class="iconfont icon-ykq-shiti-guanbi f24"></i>
    </v-touch>

    <!-- 上部时钟 -->
    <section class="upper">
      <div class="f50">
        <!-- <i class="iconfont icon-timing f40"></i> -->
        <img class="jishi" src="~images/teacher/jishi-zheng.png" alt="">
        <span class="time">{{paperTimePassed}}</span>
      </div>
      <div class="f18" v-show="!isSVGHidden">
        已有 <span>{{stuCommited}}</span> / <span>{{stuTotal}}</span> 位同学提交了试卷
      </div>
    </section>

    <!-- 中间饼图 -->
    <section class="chart-box">
      <div class="fsfb f18">分数分布</div>
      <div v-show="isSVGHidden" class="hmy f18">还没有学生提交</div>
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

      <v-touch class="btn-item" v-on:tap="showQuizresultDetail">
        <div class="iconbox" style="background: #EEBC28;">
          <i class="iconfont icon-shiti_chakanxiangqing f28"></i>
        </div>
        <div class="btn-desc f14">查看详情</div>
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
  let quizTimeBellTimer = null  // 试卷饼图正计时的定时器
  let refPaperTimer = null      // 刷新试卷饼图的定时器
  let quizTimeBellCount = 1     // 刷新试卷饼图的辅助数字

  import request from '@/util/request'
  import API from '@/config/api'
  import {drawRingSolid} from '@/util/teacher-util/drawsvg'

  // 已发试卷详情页
  import RcMaskActivityPaperQuizresultDetail from '@/components/teacher/template/rc-mask-activity-paper-quizresult-detail'

  export default {
    name: 'RcMaskActivityPaperQuizresult',
    props: ['lessonid', 'socket', 'finishedQuizList'],
    data () {
      return {
        quizid: -1,                       // 已发试卷的id
        isQuizresultDetailHidden: true,   // 已发试卷详情页隐藏
        isPaperCollected: false,          // 已收卷
        paperTimePassed: '--:--',         // 已经过去的时间
        stuCommited: '--',                // 已经交卷学生个数
        stuTotal: '--',                   // 总学生数目
        isSVGHidden: true,                // 饼图svg隐藏
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
        self.showQuizResult()
      })
    },
    methods: {
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
      sec2str (sec) {
        if(sec == 0){
            return '时间到';
        }

        var str = '';
        var fen = Math.floor(sec/60);
        var miao = sec%60;//
        miao = (miao<10) ? ('0'+miao) : miao;

        str += fen + ':' + miao;
        return str;
      },
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

            //没人做题就不画饼图
            if(jsonData.total === 0){
              self.isSVGHidden = true
              return
            }

            // 设置试卷详情数据
            self.isSVGHidden = false
            self.stuCommited = jsonData.total
            self.stuTotal = jsonData.members
            
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
        self.$emit('closeQuizresult')
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

        let postData = {
          'quizID': self.quizid
        }

        request.post(url, postData)
          .then(jsonData => {
            console.log('quiz_finish', jsonData)
            // 不需要判断success，在request模块中判断如果success为false，会直接reject

            let str = JSON.stringify({
              'op': 'quizfinished',
              'lessonid': self.lessonid,
              'quizid': self.quizid,
              'title': jsonData.title
            })

            self.socket.send(str)

            // TODO
            self.endTimers()
            self.isPaperCollected = true
            // 记录已经收卷的quizID
            self.$emit('collectQuiz', self.quizid)
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
    position: fixed;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    background: #000000;
    color: $white;
    text-align: center;
    
    .close-box {
      position: absolute;
      right: 0.386667rem;
      top: 0.44rem;
      width: 1.066667rem;
      height: 1.066667rem;
    }

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

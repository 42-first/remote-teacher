<!-- 试卷列表 被父组件 rc-mask-activity.vue 引用 -->
<template>
	<div class="paper-box allowscrollcallback">
    <!-- 没有试卷 -->
    <div v-show="!paperList.length" class="no-paper-box">
      <img src="~images/teacher/no-paper.png" alt="">
      <div class="hint f12">试试从雨课堂桌面端制作并上传试卷吧</div>
    </div>
    <div v-show="paperList.length">
      <!-- 已发试卷 -->
      <section class="list upper" v-show="quizList.length">
        <div class="title f17">已发试卷</div>
        <v-touch class="item" v-for="quiz in quizList" :key="quiz.quiz_id" v-on:tap="showQuizResult(quiz.quiz_id)">
          <div class="desc f18">
            {{quiz.title}} <br>
            <span class="f14"> {{quiz.time}}</span>
          </div>
          <i class="iconfont icon-dakai f14"></i>
        </v-touch>
      </section>
      
      <!-- 试卷库 -->
      <section class="list downer">
        <div class="title f17">我的试卷库</div>
        
        <v-touch :class="['item', {'active': paperChosen.index === index}]" v-for="(paper, index) in paperList" :key="paper.paper_id" v-on:tap="choosePaper(index, paper.paper_id, paper.title, paper.total)">
          <div class="desc f18">
            {{paper.title}} <br>
            <span class="f14">{{paper.time}}</span>
          </div>
          <i class="iconfont icon-dakai f14"></i>
        </v-touch>
      </section>
    </div>
    
    <div class="rc-mask pub-modal" v-show="!isPubmodalHidden">
      <div class="pub-inner">
        <div class="title f20">发布试卷</div>
        <div class="paper-title f18">{{paperChosen.title}}</div>
        <div class="pub-btns f18">
          <v-touch class="cancel" v-on:tap="closePubmodal">取消</v-touch>
          <div class="bar"></div>
          <v-touch class="confirm" v-on:tap="publishPaper">发布</v-touch>
        </div>
      </div>
    </div>

    <v-touch class="back-btn f18" v-on:tap="closePaper">返回</v-touch>

    <RcMaskActivityPaperQuizresult
      ref="RcMaskActivityPaperQuizresult"
      v-show="!isQuizresultHidden"
      :lessonid="lessonid"
      :socket="socket"
      :finished-quiz-list="finishedQuizList"
      @closeQuizresult="closeQuizresult"
      @collectQuiz="collectQuiz"
    ></RcMaskActivityPaperQuizresult>
  </div>
</template>

<script>
  import request from '@/util/request'
  import API from '@/config/api'

  // 已发试卷饼图页
  import RcMaskActivityPaperQuizresult from '@/components/teacher/template/rc-mask-activity-paper-quizresult'

  export default {
    name: 'RcMaskActivityPaper',
    props: ['lessonid', 'socket'],
    data () {
      return {
        paperList: [],            // 试卷库
        quizList: [],             // 已发试卷
        paperChosen: {            // 选中的未发试卷
          index: -1,
          id: -1,
          title: '',
          total: -1
        },
        isPubmodalHidden: true,   // 发布模态框隐藏
        isQuizresultHidden: true, // 已发试卷饼图页隐藏
        finishedQuizList: {},     // 给已经收卷的试卷做标记
      }
    },
    components: {
      RcMaskActivityPaperQuizresult
    },
    created () {
      let self = this

      // 点击 试卷 按钮 父组件发送事件给本子组件，获取已发、未发试卷
      self.$on('showPaper', function () {
        self.fetchPaperData()
      })
    },
    methods: {
      /**
       * 点击 返回 按钮关闭试卷列表
       *
       * @event bindtap
       */
      closePaper () {
        this.$emit('closePaper')
      },
      /**
       * 获取试卷数据
       *
       */
      fetchPaperData () {
        let self = this

        let url = API.lesson_quiz_list

        if (process.env.NODE_ENV === 'production') {
          url = API.lesson_quiz_list + '/' + self.lessonid + '/'
        }

        request.get(url)
          .then(jsonData => {
            console.log('lesson_quiz_list', jsonData)
            self.paperList = jsonData.data.quiz_data.paper_list
            self.quizList = jsonData.data.quiz_data.quiz_list

            let quizList =self.quizList

            // 有可能老师刷新了遥控器，而之前已经有已经收卷的试卷
            for (let i = 0; i < quizList.length; i++) {
              let tmpID = quizList[i].quiz_id;
              self.finishedQuizList['id'+tmpID] = quizList[i].quiz_end;
            }
          })
      },
      /**
       * 试卷列表点击某条试卷选择它
       *
       * @event bindtap
       * @param {number, number, string, number} index paperid papertitle papertotal
       */
      choosePaper (index, paperid, papertitle, papertotal) {
        let self = this

        self.paperChosen.index = index
        self.paperChosen.id = paperid
        self.paperChosen.title = papertitle
        self.paperChosen.total = papertotal
        self.isPubmodalHidden = false
      },
      /**
       * 点击 取消 按钮关闭发布试卷模态框
       *
       * @event bindtap
       */
      closePubmodal () {
        let self = this

        self.isPubmodalHidden = true
        self.paperChosen = {
          index: -1,
          id: -1,
          title: '',
          total: -1
        }
      },
      /**
       * 试卷列表选择好某条试卷后点击“确认发布”
       *
       * @event bindtap
       */
      publishPaper () {
        let self = this
        let url = API.publish_lesson_paper

        if (process.env.NODE_ENV === 'production') {
          url = API.publish_lesson_paper + '/' + self.lessonid + '/'
        }

        let postData = {
          'paperID': self.paperChosen.id
        }

        request.post(url, postData)
          .then(jsonData => {
            // 不需要判断success，在request模块中判断如果success为false，会直接reject
            //维护试题列表的发布记录
            let thePaper = self.paperList[self.paperChosen.index]

            thePaper.quiz_id = jsonData.quizID;
            self.quizList.unshift(thePaper);

            // 显示饼图页
            self.showQuizResult(jsonData.quizID);

            let str = JSON.stringify({
              'op': 'newquiz',
              'lessonid': self.lessonid,
              'quizid': jsonData.quizID,
              'title': self.paperChosen.title,
              'total': self.paperChosen.total
            })

            self.socket.send(str)
            self.closePubmodal()
          })
      },
      /**
       * 查看试卷结果饼图页(发布试卷后或查看历史发布)
       *
       * @param {number} quizid 发布的试卷的id
       */
      showQuizResult(quizid){
        let self = this

        self.isQuizresultHidden = false
        self.$refs.RcMaskActivityPaperQuizresult.$emit('showQuizResult', quizid)
      },
      /**
       * 点击关闭试卷结果饼图页的按钮
       *
       */
      closeQuizresult () {
        let self = this

        self.isQuizresultHidden = true
      },
      /**
       * 记录已经收卷的quizID
       *
       * @param {number} quizid 收卷试卷的id
       */
      collectQuiz (quizid) {
        let self = this
        self.finishedQuizList['id'+quizid] = true
      },
    }
  }
</script>

<style lang="scss" scoped>
  @import "~@/style/_variables";
  .paper-box {
    position: absolute;
    z-index: 20; /* 遮盖toolbar */
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    background: #EDF2F6;
    color: #000000;
    overflow: auto;
    -webkit-overflow-scrolling: touch;

    .no-paper-box {
      box-sizing: border-box;
      height: 100%;
      background: $white;
      text-align: center;
      
      img {
        display: inline-block;
        width: 5.88rem;
        transform: translateY(50%);
      }
      .hint {
        position: absolute;
        left: 0;
        bottom: 2rem;
        width: 100%;
        color: #9B9B9B;
      }
    }

    .list {
      padding-top: 0.4rem;

      .title {
        padding-left: 0.613333rem;
        height: 0.773333rem;
      }

      .item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        height: 2.133333rem;
        padding: 0 0.613333rem;
        background: $white;
        border-bottom: 1px solid #C8C8C8;

        .desc {
          span {
            color: #9B9B9B;
          }
        }
      }
      .active {
        border: 1px solid $blue;
        background: $blue;
        color: $white;

        .desc {
          span {
            color: $white;
          }
        }
      }
    }

    .upper {
      margin-bottom: 0.266667rem;
    }
    .downer {
      padding-bottom: 1.466667rem;
    }
    
    /* 发布试卷模态框 */
    .pub-modal {
      position: fixed;
      z-index: 10;

      .pub-inner {
        position: absolute;
        left: 1.066667rem;
        right: 1.066667rem;
        top: 50%;
        transform: translateY(-50%);
        height: 5.186667rem;
        text-align: center;
        background: $white;
        border-radius: 0.08rem;

        .title {
          height: 1.973333rem;
          line-height: 1.973333rem;
          color: #9B9B9B;
        }

        .paper-title {
          color: #333333;
        }

        .pub-btns {
          display: flex;
          align-items: center;
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          height: 1.32rem;
          border: 0.013333rem solid #C8C8C8;

          .cancel, .confirm {
            flex: 1;
          }
          .cancel {
            color: #9B9B9B;
          }
          .confirm {
            color: $blue;
          }
          .bar {
            width: 0.013333rem;
            min-width: 1px;
            height: 100%;
            background: #C8C8C8;
          }
        }
      }
    }

    .back-btn {
      position: fixed;
      left: 0;
      right: 0;
      bottom: 0;
      height: 1.466667rem;
      line-height: 1.466667rem;
      text-align: center;
      background: $blue;
      color: $white;
    }
  }
</style>

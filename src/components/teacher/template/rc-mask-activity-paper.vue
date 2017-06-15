<!-- 试卷列表 被父组件 rc-mask-activity.vue 引用 -->
<template>
	<div class="paper-box allowscrollcallback">
    <!-- 已发试卷 -->
    <section class="list upper">
      <div class="title f17">已发试卷</div>
      <v-touch class="item" v-for="quiz in quizList" v-on:tap="showQuizResult(quiz.quiz_id)">
        <div class="desc f18">
          {{quiz.title}} <br>
          <span class="f14"> {{quiz.time}}</span>
        </div>
        <i class="iconfont icon-forward f14"></i>
      </v-touch>
    </section>
    
    <!-- 试卷库 -->
    <section class="list downer">
      <div class="title f17">我的试卷库</div>
      <v-touch :class="['item', {'active': paperChosen.index === index}]" v-for="(paper, index) in paperList" v-on:tap="choosePaper(index, paper.paper_id, paper.title, paper.total)">
        <div class="desc f18">
          {{paper.title}} <br>
          <span class="f14">{{paper.time}}</span>
        </div>
        <i class="iconfont icon-forward f14"></i>
      </v-touch>
    </section>

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
  </div>
</template>

<script>
  import request from '@/util/request'
  import API from '@/config/api'

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
      }
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

            return
            let quiz_data = data.data.data.quiz_data
            let _quiz_list = quiz_data.quiz_list
            console.log('success', quiz_data);

            self.setData({
              paperData: quiz_data
            })

            // 有可能老师刷新了遥控器，而之前已经有已经收卷的试卷
            // finishedQuizList['id'+quizID];
            for (var i = 0, _len = _quiz_list.length; i < _len; i++) {
              var _tmpID = _quiz_list[i].quiz_id;
              finishedQuizList['id'+_tmpID] = _quiz_list[i].quiz_end;
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

        request.post(API.publish_lesson_paper, postData)
          .then(jsonData => {
            console.log('publish_lesson_paper', jsonData)
            // TODO
            // 不需要判断success，在request模块中判断如果success为false，会直接reject
            //维护试题列表的发布记录
            let _paperData = self.paperList
            let thePaper = _paperData[self.paperChosen.index]

            thePaper.quiz_id = jsonData.quizID;
            self.quizList.unshift(thePaper);
            self.closePubmodal()

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
          })
      },
      /**
       * 查看试卷结果饼图页(发布试卷后或查看历史发布)
       *
       * @param {number} quizid 发布的试卷的id
       */
      showQuizResult(quizid){
        console.log('进入查看饼图页TODO')
        return
        QUIZID = quizid

        let self = this

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
          border: 1px solid #C8C8C8;

          .cancel, .confirm {
            flex: 1;
          }
          .cancel {
            color: #C8C8C8;
          }
          .confirm {
            color: $blue;
          }
          .bar {
            width: 1px;
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

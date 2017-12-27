<!-- 试卷列表 -->
<template>
	<div class="paper-box">
    <slot name="ykt-msg"></slot>
    <div class="isFetching f21" v-show="isFetching">{{ $t('loading') }}...</div>
    <!-- 没有试卷 -->
    <div v-show="!isFetching && !paperList.length && !quizList.length" class="no-paper-box">
      <img src="~images/teacher/no-paper.png" alt="">
      <div class="hint f12">试试从雨课堂桌面端制作并上传试卷吧</div>
    </div>
    <div v-show="!isFetching && paperList.length || quizList.length">
      <!-- 已发试卷 -->
      <section class="list upper" v-show="quizList.length">
        <div class="title f17">{{ $t('publishedquiz') }}</div>
        <v-touch class="item" v-for="quiz in quizList" :key="quiz.quiz_id" v-on:tap="showQuizResult(quiz.quiz_id)">
          <div class="desc f18 ellipsis">
            {{quiz.title}} <br>
            <span class="f14"> {{quiz.time}}</span>
          </div>
          <i class="iconfont icon-dakai f14"></i>
        </v-touch>
      </section>
      
      <!-- 试卷库 -->
      <section class="list downer">
        <div class="title f17">{{ $t('myquiz') }}</div>
        
        <v-touch :class="['item', {'active': paperChosen.index === index}]" v-for="(paper, index) in paperList" :key="paper.paper_id" v-on:tap="choosePaper(index, paper.paper_id, paper.title, paper.total)">
          <div class="desc f18 ellipsis">
            {{paper.title}} <br>
            <span class="f14">{{paper.time}}</span>
          </div>
          <i class="iconfont icon-dakai f14"></i>
        </v-touch>
      </section>
    </div>
    
    <div class="rc-mask pub-modal" v-show="!isPubmodalHidden">
      <div class="pub-inner">
        <div class="title f20">{{ $t('publishquiz') }}</div>
        <div class="paper-title f18">{{paperChosen.title}}</div>
        <div class="pub-btns f18">
          <v-touch class="cancel" v-on:tap="closePubmodal">{{ $t('cancel') }}</v-touch>
          <div class="bar"></div>
          <v-touch class="confirm" v-on:tap="publishPaper">{{ $t('publish') }}</v-touch>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
  // 将arr2中有arr1元素特征的元素去除，并返回arr2
  function removeSame (arr1, arr2) {
    arr1.forEach(item1 => {
      let index = arr2.findIndex(item2 => {
        return item2.paper_id === item1.paper_id
      })

      ~index && arr2.splice(index, 1)
    })
  }

  import {mapGetters} from 'vuex'
  import request from '@/util/request'
  import Moment from 'moment'
  import API from '@/pages/teacher/config/api'

  export default {
    name: 'Paper',
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
        isFetching: true,             // 正在获取数据
      }
    },
    computed: {
      ...mapGetters([
        'lessonid',
        'socket',
      ])
    },
    components: {
    },
    created () {
      let self = this

      self.fetchPaperData()
      self.handlePubSub()
    },
    beforeDestroy(){
      T_PUBSUB.unsubscribe('quiz-msg')
    },
    methods: {
      /**
       * 处理发布订阅
       *
       */
      handlePubSub () {
        let self = this

        // 订阅前清掉之前可能的订阅，避免多次触发回调
        T_PUBSUB.unsubscribe('quiz-msg')

        T_PUBSUB.subscribe('quiz-msg.newquiz', (_name, msg) => {
          // socket通知发新的试卷了，有可能是pc发的，也有可能是手机遥控器自己发的
          self.handleSocketNewquiz(msg)
        })
      },
      /**
       * 获取试卷数据
       *
       */
      fetchPaperData () {
        let self = this

        // 如果已经有内容了就不要显示正在加载中了
        if (!self.paperList.length) {
          self.isFetching = true
        }

        let url = API.lesson_quiz_list

        if (process.env.NODE_ENV === 'production') {
          url = API.lesson_quiz_list + '/' + self.lessonid + '/'
        }

        request.get(url)
          .then(jsonData => {
            self.isFetching = false
            let paper_list = jsonData.data.quiz_data.paper_list
            let quiz_list = jsonData.data.quiz_data.quiz_list

            removeSame(quiz_list, paper_list)

            self.paperList = paper_list
            self.quizList = quiz_list

            let quizList =self.quizList

            // 有可能老师刷新了遥控器，而之前已经有已经收卷的试卷
            let finishedQuizList = {}
            for (let i = 0; i < quizList.length; i++) {
              let tmpID = quizList[i].quiz_id;
              finishedQuizList['id'+tmpID] = quizList[i].quiz_end;
            }

            self.$store.commit('set_finishedQuizList', finishedQuizList)
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
        self.paperChosen.index = -1
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

        self.isPubmodalHidden = true

        request.post(url, postData)
          .then(jsonData => {
            // 不需要判断success，在request模块中判断如果success为false，会直接reject

            // 显示饼图页
            self.showQuizResult(jsonData.quizID);
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

        let to = {
          name: 'quizresult',
          params: {
            quizid,
          }
        }

        self.$router.push(to)
      },
      /**
       * 处理socket发过来的 newquiz 通知，如果是自己发的则不作处理，如果是pc发的就处理下？
       *
       * @param {object} msg websocket 信息
       */
      handleSocketNewquiz (msg) {
        let self = this

        let index = self.paperList.findIndex(item => {
          return item.paper_id === msg.quiz.paperid
        })

        self.paperList.splice(index, 1)
        self.quizList.unshift({
          "quiz_id": msg.quiz.quiz,
          "paper_id": msg.quiz.paperid,
          "time": Moment(msg.quiz.time).format('YYYY-MM-DD HH:mm:ss'),
          "quiz_end": false,
          "title": msg.quiz.title
        })
      },
    }
  }
</script>

<style lang="scss" scoped>
  @import "~@/style/_variables";
  .paper-box {
    position: relative;
    background: #EDF2F6;
    min-height: 100%;
    color: #000000;
    overflow: auto;
    -webkit-overflow-scrolling: touch;

    .isFetching {
      position: relative;
      z-index: 10;
      padding-top: 7.0rem;
      text-align: center;
    }

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
        color: $graybg;
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
            color: $graybg;
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
          color: $graybg;
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
            color: $graybg;
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
  }
</style>

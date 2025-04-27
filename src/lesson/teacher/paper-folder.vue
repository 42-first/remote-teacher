<!-- 试卷列表 -->
<template>
	<div class="paper-box">
   
    
    <div>
      <!-- 试卷文件夹 -->
      <section class="list downer">
        <div class="title f20 ellipsis">{{folderTitle}}</div>
        
        <v-touch :class="['item', {'active': paperChosen.index === index}]" v-for="(paper, index) in paperList" :key="paper.paper_id" v-on:tap="choosePaper(index, paper.paperId, paper.title, paper.slideCount)">
          <div class="box-start overhidden">
            <img v-if="paper.version" class="papericon" src="~images/teacher/exam-icon.png" alt="">
            <img v-else class="papericon" src="~images/teacher/quiz-icon.png" alt="">
            <div class="desc f18 ellipsis">
              {{paper.title}} <br>
              <span class="f14">{{paper.createTime | formatTime}}</span>
            </div>
          </div>
          
          <!-- <i class="iconfont icon-dakai f14"></i> -->
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

  import {mapGetters} from 'vuex'
  import request from '@/util/request-v3'
  import Moment from 'moment'
  import API from '@/util/api'

  export default {
    name: 'Paperfolder',
    data () {
      return {
        folderid: -1,
        folderTitle: '',
        paperList: [],            // 试卷库
        paperChosen: {            // 选中的未发试卷
          index: -1,
          id: -1,
          title: '',
          total: -1
        },
        isPubmodalHidden: true,   // 发布模态框隐藏
      }
    },
    computed: {
      ...mapGetters([
        'lessonid',
        'isCloneClass'
      ])
    },
    components: {
    },
    filters: {
      /**
       * 处理发布订阅
       *
       */
      formatTime (value) {
        let self = this

        return Moment(value).format('YYYY-MM-DD HH:mm:ss')
      },
    },
    created () {
      let self = this

      self.folderid = self.$route.params.folderid

      self.fetchPaperData()
      self.handlePubSub()

    },
    beforeDestroy(){
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

        let url = API.lesson.quiz_dir

        let params = {
          dir_id: this.folderid
        }

        request.get(url, params)
          .then(res => {
            if(res && res.code === 0 && res.data){
              self.folderTitle = res.data.title
              self.paperList = res.data.paper
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
        // 克隆班不能执行当前操作
        if (!!this.isCloneClass) {
          this.$toast({
            message: this.$t('cloneTips'),
            duration: 3e3
          });
          return
        }
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
        let url = API.lesson.publish_quiz


        let postData = {
          'paperId': self.paperChosen.id
        }

        self.isPubmodalHidden = true

        request.post(url, postData)
          .then(res => {
            if(res && res.code === 0 && res.data){
              // 显示饼图页
              self.showQuizResult(res.data.quizId);
              self.closePubmodal()
            }
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
          name: 'quizresult_v3',
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
          return item.paper_id === msg.quiz.paperid || item.paper_id === msg.paper.paperid
        })

        self.paperList.splice(index, 1)
      },
    }
  }
</script>

<style lang="scss" scoped>
  @import "~@/style/_variables";
  .paper-box {
    position: relative;
    background: #FFF;
    min-height: 100%;
    color: #000000;
    overflow: auto;
    -webkit-overflow-scrolling: touch;

    .list {

      .title {
        padding-left: 0.613333rem;
        height: 1.32rem;
        line-height: 1.32rem;
        font-weight: 500;
        color: #333333;
        border-bottom: 0.026667rem solid #EEEEEE;
      }

      .overhidden {
        overflow: hidden;
      }

      .item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        height: 2.133333rem;
        padding: 0 0.613333rem;
        background: $white;  

        .desc {
          span {
            color: $graybg;
          }
        }

        .papericon {
          width: 0.8533rem;
          margin-right: 0.266667rem;
        }
      }

      .item:hover, .active {
        background: #F8F8F8;
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
          overflow : hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          word-break: break-all;
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
          border-radius: 0 0 0.08rem 0.08rem;

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

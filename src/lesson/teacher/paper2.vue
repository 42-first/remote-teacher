<!-- 试卷列表 -->
<template>
	<div class="paper-box">
    
    <div class="isFetching f21" v-show="isFetching">{{ $t('loading') }}...</div>
    <!-- 没有试卷 -->
    <div v-show="!isFetching && !paperList.length && !quizList.length && !dirList.length" class="no-paper-box">
      <img :src="nopaperImg" />
      <div class="hint f12"><!-- 试试从雨课堂桌面端制作并上传试卷吧 -->{{ $t('ttmtobrc') }}</div>
    </div>
    <div v-show="!isFetching && paperList.length || quizList.length || dirList.length">
      <section class="navtab f17">
        <v-touch :class="['tabitm', {'active f20': activeTab === 0}]" v-on:tap="switchTab(0)"><!-- 我的试卷库 -->{{ $t('myquiz') }}</v-touch>
        <v-touch :class="['tabitm', {'active f20': activeTab === 1}]" v-on:tap="switchTab(1)"><!-- 已发试卷 -->{{ $t('publishedquiz') }}</v-touch>
      </section>

      <!-- 已发试卷 -->
      <section class="list upper" v-show="quizList.length && activeTab === 1">
        <!-- <div class="title f17">{{ $t('publishedquiz') }}</div> -->
        <v-touch class="item" v-for="quiz in quizList" :key="quiz.quizId" v-on:tap="showQuizResult(quiz.quizId)">
          <div class="box-start">
            <img v-if="quiz.version" class="papericon" src="~images/teacher/exam-icon.png" alt="">
            <img v-else class="papericon" src="~images/teacher/quiz-icon.png" alt="">
            <div class="desc f18 ellipsis">
              {{quiz.title}} <br>
              <span class="f14"> {{quiz.publishTime | formatTime}}</span>
            </div>
          </div>
          <i class="iconfont icon-dakai f14"></i>
        </v-touch>
      </section>
      
      <!-- 试卷库 -->
      <section class="list downer" v-show="activeTab === 0">
        <!-- <div class="title f17">{{ $t('myquiz') }}</div> -->

        <router-link tag="div" :to="{name: 'paperfolder_v3', params: {folderid: folder.dirId}, query: {nojump: 1}}" class="folder f15" v-for="(folder, index) in dirList" :key="index">
          <div class="left ellipsis">
            <img class="foldericon" src="~images/teacher/folder.png" alt="">
            {{folder.title}}
          </div>
          <div class="right">{{folder.count}} <i class="iconfont icon-dakai f14"></i></div>
        </router-link>
        
        <v-touch :class="['item', 'box-start', {'active': paperChosen.index === index}]" v-for="(paper, index) in paperList" :key="paper.paper_id" v-on:tap="choosePaper(index, paper.paperId, paper.title, paper.slideCount)">
          <img v-if="paper.version" class="papericon" src="~images/teacher/exam-icon.png" alt="">
          <img v-else class="papericon" src="~images/teacher/quiz-icon.png" alt="">
          <div class="desc f18 ellipsis">
            {{paper.title}} <br>
            <span class="f14">{{paper.createTime | formatTime}}</span>
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
    name: 'Paper',
    data () {
      return {
        dirList: [],              // 文件夹列表
        paperList: [],            // 不再文件夹中的根目录未发试卷
        quizList: [],             // 已发试卷
        activeTab: 0,
        paperChosen: {            // 选中的未发试卷
          index: -1,
          id: -1,
          title: '',
          total: -1
        },
        isPubmodalHidden: true,   // 发布模态框隐藏
        isFetching: true,         // 正在获取数据
        nopaperImg: require(`images/teacher/no-paper${i18n.t('imgafterfix')}.png`),
      }
    },
    computed: {
      ...mapGetters([
        'lessonid',
        'socket',
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

      self.fetchPaperData()
      self.handlePubSub()

      self.activeTab = localStorage.getItem('papernavtab') === '1' ? 1 : 0
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

        // 如果已经有内容了就不要显示正在加载中了
        if (!self.paperList.length) {
          self.isFetching = true
        }

        let url = API.lesson.get_quiz_list

        request.get(url)
          .then(res => {
            if(res && res.code === 0 && res.data){
              self.isFetching = false
              self.dirList = res.data.dir
              self.paperList = res.data.paper
              self.quizList = res.data.quiz

              let quizList = self.quizList

              // 有可能老师刷新了遥控器，而之前已经有已经收卷的试卷
              let finishedQuizList = {}
              for (let i = 0; i < quizList.length; i++) {
                let tmpID = quizList[i].quizId;
                finishedQuizList['id'+tmpID] = quizList[i].end;
              }

              self.$store.commit('set_finishedQuizList', finishedQuizList)
            }
          })
      },
      /**
       * 切换我的试卷库和已发试卷
       *
       * @event bindtap
       * @param {number} index 当前高亮选择的tab
       */
      switchTab (index) {
        let self = this

        self.activeTab = index
        localStorage.setItem('papernavtab', index)
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
          },
          query: {nojump: 1}
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

        self.fetchPaperData()
      },
    }
  }
</script>

<style lang="scss" scoped>
  @import "~@/style/_variables";
  .router-link-active {
    background: red!important;
  }
  .paper-box {
    position: relative;
    background: #FFF;
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

    .navtab {
      display: flex;
      padding-left: 0.613333rem;
      height: 1.32rem;
      line-height: 1.32rem;
      border-bottom: 0.026667rem solid #EEEEEE;

      .tabitm {
        margin-right: 0.533333rem;
        color: #666666;
      }
      .active {
        border-bottom: 0.053333rem solid #4F95F5;
        color: #333333;
        font-weight: 500;
      }
    }

    .box-start {
      display: flex;
      align-items: center;
      justify-content: flex-start !important;
    }

    .list {
      .title {
        padding-left: 0.613333rem;
        height: 0.773333rem;
        margin-bottom: 0.533333rem;
      }

      .folder {
        margin: 0.533333rem;
        height: 1.866667rem;
        padding: 0.266667rem;
        display: flex;
        align-items: center;
        justify-content: space-between;
        box-shadow: 0 0.026667rem 0.16rem rgba(0,0,0,.1);
        border-radius: 0.106667rem;

        .left {
          // width: 7.166667rem;
          flex: 1;
          .foldericon {
            width: 0.8rem;
            vertical-align: middle;
            margin-right: 0.266667rem;
          }
        }
        .right .iconfont {
          margin-left: 0.4rem;
        }
      }

      .item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        height: 2.133333rem;
        padding: 0 0.613333rem;
        background: $white;

        .papericon {
          width: 0.8533rem;
          margin-right: 0.266667rem;
        }

        .desc {
          span {
            color: $graybg;
          }
        }
      }
      .folder:hover {
        background: #F8F8F8;
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

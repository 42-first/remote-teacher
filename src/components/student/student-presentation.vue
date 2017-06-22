/*
 * @page：学生接收器页面级组件
 * @author: chenzhou
 * @update: 2017.5.27
 * @desc 课堂ppt接收，课堂习题，课堂试卷，课堂红包和老师遥控器实时通信等
 *
 */

<template>
  <section class="page" @click="handleFilter">
    <section class="page-fixed">
      <!-- header 返回 弹幕 投稿 标题 -->
      <header class="student__header">
        <p class="student__header--back" @click="handleBack"><i class="iconfont icon-back f25"></i></p>
        <h3 class="header-title f18">{{ title }}</h3>
        <div class="student__header--more J_more" @click.stop.prevent="handleMoreActions">
          <i class="iconfont icon-add f25"></i>
          <div :class="['more-actions', 'animated', isMore == 1 ? 'slideInDown' : 'slideInUp']" v-show="isMore">
            <p class="action f17 line" @click="handleOpenDanmu"><i class="iconfont icon-danmu1 f21"></i>发送弹幕</p>
            <router-link :to="'/'+lessonID+'/submission/'" tag="p" class="action f17" v-if="version > 0.8"><i class="iconfont icon-submission f25"></i>发送投稿</router-link>
          </div>
        </div>
      </header>

      <!-- tab  -->
      <ul class="student__tabs f15" @click="handleShowTab">
        <li :class="['tab-item', currTabIndex == 1 ? 'curr' : '']" data-index="1" data-language-key="student.nav.all">全部</li>
        <li :class="['tab-item', currTabIndex == 2 ? 'curr' : '']" data-index="2" data-language-key="student.nav.ppt">PPT</li>
        <li :class="['tab-item', currTabIndex == 3 ? 'curr' : '']" data-index="3" data-language-key="student.nav.problem">习题</li>
        <li :class="['tab-item', currTabIndex == 4 ? 'curr' : '']" data-index="4" data-language-key="student.nav.quiz">试卷</li>
        <li :class="['tab-item', currTabIndex == 5 ? 'curr' : '']" data-index="5" data-language-key="student.nav.hongbao">红包</li>
      </ul>
    </section>


    <!-- 接收器 时间轴 -->
    <section class="student__timeline-wrapper">
      <loadmore class="J_timeline" :top-method="refeshLoad" @translate-change="translateChange" :top-status.sync="topStatus" :top-distance.sync="topDistance" ref="loadmore">

        <section class="student__timeline J_cards">
          <!-- 时间轴内容列表 -->
          <div class="timeline-wrapper" v-for="(item, index) in cards">
            <Card-Item-Component :item="item" :index="index" :lessonid="lessonID" :tabindex='currTabIndex' v-if="currTabIndex===item.type||currTabIndex===1"></Card-Item-Component>
          </div>
        </section>

        <!--  <div slot="top" class="mint-loadmore-top">
          <span v-show="topStatus !== 'loading'" :class="{ 'rotate': topStatus === 'drop' }">↓</span>
          <span v-show="topStatus === 'loading'">Loading...</span>
        </div> -->

      </loadmore>
    </section>


    <!-- 接收器 新消息提醒 -->
    <section class="student__msg f16" v-show="hasMsg" @click="handleScrollToTop">
      <p class="">您有新的课堂动态</p>
    </section>

    <!-- 图片放大结构 -->
    <section class="pswp J_pswp" tabindex="-1" role="dialog" aria-hidden="true">

      <div class="pswp__bg"></div>

      <div class="pswp__scroll-wrap">

        <div class="pswp__container">
            <div class="pswp__item"></div>
            <div class="pswp__item"></div>
            <div class="pswp__item"></div>
        </div>

        <div class="pswp__ui pswp__ui--hidden">

          <div class="pswp__top-bar">

            <div class="pswp__counter"></div>

              <div class="pswp__preloader">
                    <div class="pswp__preloader__icn">
                      <div class="pswp__preloader__cut">
                        <div class="pswp__preloader__donut"></div>
                      </div>
                    </div>
              </div>
            </div>

            <div class="pswp__caption">
                <div class="pswp__caption__center"></div>
            </div>

        </div>

      </div>

    </section>

    <!-- 网络不好 重新连接弹层 -->
    <section class="student__net-mask" v-if="isReconnect">
      <div class="content-block">
        <p class=" f16">连接异常，<span class="countTime">{{ countdown }}</span>秒后尝试重连</p>
        <p class="connect-btn f18" @click="handleReconnect">立即重连</p>
      </div>
    </section>

    <router-view></router-view>
  </section>

</template>
<script>
  import request from '@/util/request'
  import API from '@/util/Api'

  import CardItemComponent from '@/components/common/card-item.vue'

  import wsmixin from '@/components/student/student-socket'
  import actionsmixin from '@/components/student/actions-mixin'
  import exercisemixin from '@/components/student/exercise-mixin'

  // 子组件不需要引用直接使用
  window.request = request;
  if (process.env.NODE_ENV !== 'production') {
    request.post = request.get
  }

  export default {
    name: 'student-page',
    props: {
    },
    data() {
      return {
        isResetSocket: false,
        socket: null,
        // socket重连
        isReconnect: false,
        // socket重连次数
        reconnectcount: 0,
        // socket重连倒计时
        countdown: 10,
        topStatus: '',
        topDistance: 120,
        //
        title: '雨课堂',
        courseName: '',
        // 课程ID
        lessonID: 0,
        // pptID
        presentationID: 0,

        // 权限相关
        userID: 0,
        avatar: '',
        userAuth: 0,

        // 当前tab下标
        currTabIndex: 1,

        // 是否有新消息
        hasMsg: false,
        // 是否观看模式
        observerMode: false,
        // 是否开启弹幕
        danmuStatus: false,
        // 课程是否结束
        lessonStatus: 0,
        presentationList: null,
        presentationMap: new Map(),
        quizList: null,
        quizMap: new Map(),

        // 习题map
        problemMap: new Map(),

        // timeline列表
        cards: [],
        // 记录全部的事件
        allEvents: [],
        // 时间轴数据
        timeline: {
          'problem': {}
        },
        // 弹幕投稿是否展开
        isMore: false,
        // todo: 是否新版本 隐藏功能
        version: 0.9,
        commitDiffURL: '/lesson/lesson_submit_difficulties',
        backURL: ''
      };
    },
    components: {
      CardItemComponent
    },
    computed: {
    },
    watch: {
      '$route' (to, from) {
        // 对路由变化作出响应...
        console.log(from.name);
        console.log(to.name);

        if(from.name == 'student-danmu-page' || from.name == 'student-submission-page') {
          document.title = this.courseName && this.courseName;
          setTimeout(() => {
            typeof this.handleScrollToTop === 'function' && this.handleScrollToTop();
          }, 300)
        }
      },
      lessonStatus (newValue, oldValue) {
        // 下课啦
        if(newValue === 1) {
          this.backURL = '/v/index/course/normalcourse/learning_lesson_detail/' + this.lessonID;
        }
      }
    },
    filters: {
    },
    mixins: [ wsmixin, actionsmixin, exercisemixin ],
    methods: {
      /*
       * @method 接收器初始化
       */
      init() {
        let self = this;

        this.lessonID = this.$route.params.lessonID || 3049;
        this.observerMode = this.$route.query && this.$route.query.force === 'lecture' ? true : false;

        this.iniTimeline(this.lessonID);
        this.getSoftVersion(this.lessonID);
      },

      /*
       * @method 直播悬停反面等事件
       */
      iniTimeline(lessonID) {
        let self = this;

        Promise.all([this.getPresentationList()]).then((res) => {
          self.initws();

          if (process.env.NODE_ENV !== 'production') {
            // self.testTimeline();
          }

          setTimeout(()=>{
            require(['photoswipe', 'photoswipe/dist/photoswipe-ui-default', 'photoswipe/dist/photoswipe.css'], function(PhotoSwipe, PhotoSwipeUI_Default) {
              window.PhotoSwipe = PhotoSwipe;
              window.PhotoSwipeUI_Default = PhotoSwipeUI_Default;
            })
          }, 1500)

          setTimeout(()=>{
            require(['moment'], function(moment) {
              window.moment = moment;
            })
          }, 2500)

          // 设置自动提交
          setInterval(() => {
            self.autoSendAnswers();
          }, 10000)

          self.bindTouchEvents();

          // sentry 配置
          this.setSentry();
        });
      },

      /*
      * @method sentry ga 配置
      */
      setSentry() {
        if(typeof Raven !== 'undefined') {
          Raven.config('http://1a033df516274a349716c21d7d4ce6b2@rain-sentry.xuetangx.com/4').install();
          Raven.setUserContext({ userid: this.userID });
        } else {
          setTimeout(() => {
            Raven.config('http://1a033df516274a349716c21d7d4ce6b2@rain-sentry.xuetangx.com/4').install();
            Raven.setUserContext({ userid: this.userID });
          }, 1500)
        }

        typeof ga === 'function' && ga('set', 'userId', this.userID);
      },

      /*
      * @method 测试环境初始化timeline
      */
      testTimeline() {
        this.addMessage({ type: 1, message:"开课啦" });

        this.addPPT({ type: 2, pageIndex:1, time: 1497431046048, presentationid: this.presentationID });
        this.addPPT({ type: 2, pageIndex:2, time: 1497431406048, presentationid: this.presentationID });
        this.addPPT({ type: 2, pageIndex:3, time: 1497431046048, presentationid: this.presentationID });
        this.addPPT({ type: 2, pageIndex:3, time: 1497431446048, presentationid: this.presentationID });

        this.addPaper({ type: 4, title:"xxx", total: 10, quiz: 1, time: 1497431446048 });
        this.addPaper({ type: 4, title:"试卷测试数据", total: 12, quiz: 12, time: 1497431440048 });

        this.addProblem({ type: 3, pageIndex: 4, time: 1497431446048, presentationid: this.presentationID, limit: 60 });
        this.addProblem({ type: 3, pageIndex: 5, time: 1497431446048, presentationid: this.presentationID, limit: 60 });

        let event = {
          "type": "redpacket",
          "prob": 123,
          "redpacket": "234",
          "total": 500,
          "count": 5,
          "detail": [
            {"uid": 45, "earning": 50, "dt": 1453348609053}, // earning以分为单位
            {"uid": 46, "earning": 50, "dt": 1453358609053},
            {"uid": 48, "earning": 50, "dt": 1453368609053},
            {"uid": 41, "earning": 50, "dt": 1453378609053}
          ],
          "dt": 1453348609053  // Datetime 时间戳
        };

        this.addHongbao({ type: 5, redpacketID: 5, time: 1497431446048, count: 9, length: 6, event: event, userID: this.userID || 46 });
      },

      /*
       * @method 用户权限
       * @param  lessonID
       */
      getUserInfo(lessonID) {
        let self = this;
        let URL = API.GET_USER_INFO;
        let param = {
          'lesson_id': lessonID
        }

        return request.get(URL, param)
          .then((res) => {
            if(res && res.data) {
              let data = res.data;

              self.userID = data.user_id;
              self.avatar = data.avatar;
              self.userAuth = data.user_auth;

              return data;
            }
          });
      },

      /*
       * @method 软件版本号
       * @param  lessonID
       */
      getSoftVersion(lessonID) {
        let self = this;
        let URL = API.GET_SOFT_VERSION;
        let param = {
          'lesson_id': lessonID
        }

        return request.get(URL, param)
          .then((res) => {
            if(res && res.data) {
              let data = res.data;

              self.version = +data.ppt_version;

              return data;
            }
          });
      },

      /*
      * @method 读取直播的课程列表和auth信息
      * @param  init: 是否初始化socket
      */
      getPresentationList() {
        let self = this;
        let URL = API.student.GET_PRESENTATION_LIST;
        let param = {
          'lesson_id': this.lessonID
        }

        // lessons
        return request.get(URL, param)
          .then((res) => {
            if(res && res.data) {
              let data = res.data;

              // auth
              self.userID = data.userID;
              self.avatar = data.avatar;
              self.userAuth = data.userAuth;

              self.presentationList = data.presentationList;
              self.quizList = data.quizList;
              self.presentationID = data.activePresentationID;

              // set presentation map
              if(self.presentationList.length) {
                for(let i = 0; i < self.presentationList.length; i++) {
                  let presentation = self.presentationList[i];

                  self.formatPresentation(presentation, presentation.presentationID);
                }
              }

              // set quiz map
              if(self.quizList.length) {
                self.quizList.forEach( function(quiz, index) {
                  self.quizMap.set(quiz.quizID, quiz);
                });
              }

              // set title
              let presentationData = self.presentationMap.get(self.presentationID);
              presentationData.Title && (self.title = presentationData.Title);
              // 课程title
              document.title = self.courseName = data.classroom && data.classroom.courseName;

              return presentationData;
            }
          })
          .catch(error => {
            console.log(error);

            if(error && error.status_code === 601) {
              // 课程结束
              console.log('课程结束');
              location.href = '/v/index/course/normalcourse/learning_lesson_detail/' + this.lessonID;
            } else if(error && error.status_code === 603) {
              // 没有权限
              console.log('没有权限');
            }
          });
      },

      /*
      * @method 获取实时更新的数据
      * @param presentationID
      */
      getUpdatePPTData(presentationID) {
        let self = this;
        let URL = API.student.FETCH_PRESENTATION_DATA;
        let param = {
          lessonID: this.lessonID,
          presentationID: presentationID,
          userAuth: this.userAuth,
          userID: this.userID
        };

        if (process.env.NODE_ENV === 'production') {
          URL = URL + presentationID;
        }

        self.presentationID = presentationID;

        return request.get(URL, param).
          then(function (res) {
            if(res) {
              let data = res;
              let presentation = data.presentationData;

              // set presentation map
              self.formatPresentation(presentation, presentationID);

              // set title
              presentation.Title && (self.title = presentation.Title);

              return presentation;
            }
          });

      },

      /*
      * @method 格式化ppt数据
      * @param
      */
      formatPresentation(presentation, presentationID) {
        if(presentation) {
          let pptData = presentation['Slides'];

          if(pptData.length) {
            pptData.forEach( (slide, index) => {
              // 收藏 不懂
              if( slide['tag'] && slide['tag'].length ) {
                slide['tag'].forEach((tag)=>{
                  tag === 1 && (slide['question'] = 1);
                  tag === 2 && (slide['store'] = 1);
                })
              }

              // 问题结果
              if (slide['Problem'] && slide['Result']) {
                slide['Problem']['Result'] = slide['Result'];
              }
            });

            presentation['Slides'] = pptData;
          }

          this.presentationMap.set(presentationID || presentation.presentationID, presentation);
        }
      },

      /*
      * @method 下拉刷新回调
      * @param
      */
      refeshLoad(id) {
        setTimeout(()=>{
          this.$refs.loadmore.onTopLoaded();

          this.socket.send(JSON.stringify({
            'op': 'fetchtimeline',
            'lessonid': this.lessonID,
            'msgid': this.msgid++
           }));
        }, 1500)
      },

      /*
      * @method 下拉刷新touchend 回调
      * @param
      */
      translateChange(translate) {
        // console.log(translate);
        if(this.$refs.loadmore.topStatus === 'loading') {
          this.$refs.loadmore.translate = 100;
        }
      },

      /*
      * @method handleTimeline滚动检测
      * @param
      */
      handleTouchMove() {
        let target = event.currentTarget;

        if(this.hasMsg && target.scrollTop < 200) {
          this.hasMsg = false;
        }
      },

      /*
      * @method 绑定滚动事件
      * @param
      */
      bindTouchEvents() {
        this.$el.querySelector('.J_timeline').addEventListener('touchmove', this.handleTouchMove);
        this.$el.querySelector('.J_timeline').addEventListener('touchend', this.handleTouchMove);
      },
      unbindTouchEvents() {
        this.$el.querySelector('.J_timeline').removeEventListener('touchmove', this.handleTouchMove);
        this.$el.querySelector('.J_timeline').removeEventListener('touchend', this.handleTouchMove);
      },

      /*
      * @method 展示tab选项
      * @param
      */
      handleShowTab() {
        let target = event.target;
        let tabIndex = +target.dataset['index'];

        if(tabIndex) {
          this.currTabIndex = tabIndex;
        }
      },

      /*
       * @method more
       *
       */
      handleMoreActions() {
        if(this.isMore) {
          this.isMore = false;
        } else {
          this.isMore = true;
        }
      },

      /*
       * @method 开启弹幕
       *
       */
      handleOpenDanmu() {
        if(this.danmuStatus) {
          this.$router.push({ path: '/'+ this.lessonID +'/danmu' });
        } else {
          this.$messagebox('提示', '老师暂时还未开放弹幕，等等吧～');
        }
      },

      /*
       * @method 滚动到最顶部
       *
       */
      handleScrollToTop() {
        let timelineEl = this.$el.querySelector('.J_cards')

        // timelineEl.scrollIntoView({block: 'start', behavior: 'smooth'});
        timelineEl.scrollIntoView();
        this.hasMsg = false;
      },

      /*
       * @method 立即重连
       *
       */
      handleReconnect() {
        clearInterval(this.reconnectTimer)
        this.countdown = 10;
        this.initws(true);
      },

      /*
       * @method 页面事件过滤
       *
       */
      handleFilter() {
        let targetEl = event.target;

        this.isMore = false;
      },

      /*
       * @method 返回上一页
       *
       */
      handleBack(){
        if(this.backURL) {
          location.href = this.backURL;
        } else {
          history.go(-1);
        }
      }
    },
    created() {
      this.init();
    },
    mounted() {
    },
    updated() {
      window.language && window.language.translate(this.$el);
    },
    beforeDestroy() {
      this.unbindTouchEvents();
    }
  };
</script>

<style lang="scss">
  @import "~@/style/font/iconfont/iconfont.css";
  @import "~@/style/animate.css";
  @import "~@/style/mintui.css";

  .page {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  .page-fixed {
    z-index: 1;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
  }



  /*-------------------*\
    $ header
  \*-------------------*/


  .student__header {
    display: flex;
    align-items: center;
    justify-content: center;

    height: 1.33rem;
    color: #2A2A2A;
    background: #EDF2F6;
    /* box-shadow: 0 4px 6px rgba(0,0,0, 0.2); */

    .student__header--back, .student__header--more {
      width: 1.0rem;
    }

    .header-title {
      flex: 1;

      color: #2a2a2a;

      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }

    .student__header--more {
      position: relative;
      width: 1.2rem;

      .more-actions {
        position: absolute;
        top: 1.33rem;
        right: 0.1rem;

        padding: 0 0.28rem;
        width: 4.0rem;
        /*height: 3.12rem;*/

        color: #fff;

        background: rgba(51,51,51, 0.9);
        border-radius: 0.106667rem;

        animation-duration: 0.3s;

        .line {
          border-bottom: 1px solid #C8C8C8;
        }

        .action {
          padding: 0.266667rem 0;

          line-height: 0.933333rem;
          text-align: center;

          .iconfont {
            padding-right: 0.186667rem;
            vertical-align: -0.05rem;
          }
        }
      }

      .more-actions:before {
        position: absolute;
        top: -0.399rem;
        right: 0.28rem;

        content: '';
        border: 0.2rem solid rgba(51,51,51, 0.9);
        border-color: transparent transparent rgba(51,51,51, 0.9) transparent;
      }

    }

  }




  /*-------------------*\
    $ header
  \*-------------------*/


  .student__tabs {
    display: flex;
    align-items: center;
    justify-content: space-around;

    height: 1rem;
    background: #fff;
    box-shadow: 0 4px 6px rgba(0,0,0, 0.2);

    .tab-item {
      height: 100%;
      line-height: 1rem;
      padding: 0 0.5rem;
    }

    .curr {
      color: #639EF4;
      border-bottom: 4px solid #639EF4;
    }

  }



  /*-------------------*\
    $ 时间轴 列表
  \*-------------------*/


  .student__timeline-wrapper {
    position: absolute;
    top: 2.33rem;
    left: 0;
    right: 0;
    bottom: 0;
    /*overflow-y: scroll;*/

    -webkit-overflow-scrolling: touch;
  }

  .student__timeline {
    display: flex;
    flex-direction: column-reverse;
    align-items: center;
    justify-content: center;

    min-width: 10rem;
    width: 100%;

    .timeline-wrapper {
      width: 100%;
    }
  }

  .student__msg {
    position: absolute;
    top: 2.5rem;
    left: 50%;
    transform: translateX(-50%);

    margin: auto;
    padding: 0 .4rem;
    height: .8rem;
    line-height: .8rem;
    text-align: center;
    color: #fff;
    background: rgba(155, 155, 155, 0.75);
    border-radius: .4rem/50%;
  }



  /*-------------------*\
    $ 网络超时重连
  \*-------------------*/

  .student__net-mask {
    z-index: 2;
    position: fixed;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.55);

    .content-block {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 100%;
      color: #fff;

      transform: translate(-50%, -50%);

      .connect-btn {
        margin: 0.4rem auto;
        width: 2.666667rem;
        height: 0.933333rem;
        line-height: 0.933333rem;
        color: #fff;
        border: 1px solid #fff;
        border-radius: 10px;
      }
    }
  }


</style>

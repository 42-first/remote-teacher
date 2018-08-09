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
        <p class="student__header--back" @click="handleBack"><i class="iconfont icon-fanhui f25"></i></p>
        <h3 class="header-title f18">{{ title }}</h3>
        <div class="student__header--more J_more" @click.stop.prevent="handleMoreActions">
          <i class="iconfont icon-add f25"></i>
          <div :class="['more-actions', 'animated', isMore == 1 ? 'slideInDown' : 'slideInUp']" v-show="isMore">
            <p class="action f17 line" @click="handleOpenDanmu">
              <i class="iconfont icon-ykq_tab_danmu f25"></i>
              <span>{{ $t('sendbullet') }}</span>
            </p>
            <router-link :to="'/'+lessonID+'/submission/'" tag="p" class="action line f17" v-if="version > 0.8">
              <i class="iconfont icon-ykq_tab_tougao f25"></i>
              <span>{{ $t('sendpost') }}</span>
            </router-link>
            <p class="action f17" @click="handleenterTeam" v-if="classroom &&classroom.classroomId">
              <i class="iconfont icon-fenzu f25"></i>
              <span><!-- 我的分组 -->{{ $t('team.mygroup') }}</span>
            </p>
          </div>
        </div>
      </header>

      <!-- tab  -->
      <ul class="student__tabs f15" @click="handleShowTab">
        <li :class="['tab-item', currTabIndex == 1 ? 'curr' : '']" data-index="1">{{ $t('total') }}</li>
        <li :class="['tab-item', currTabIndex == 2 ? 'curr' : '']" data-index="2">{{ $t('slide2') }}</li>
        <li :class="['tab-item', currTabIndex == 3 ? 'curr' : '']" data-index="3">{{ $t('prob2') }}</li>
        <li :class="['tab-item', currTabIndex == 4 ? 'curr' : '']" data-index="4">{{ $t('quiz2') }}</li>
      </ul>
    </section>


    <!-- 接收器 时间轴 -->
    <section class="student__timeline-wrapper">
      <loadmore class="J_timeline" :top-method="refeshLoad" @translate-change="translateChange" :top-status.sync="topStatus" :top-distance.sync="topDistance" :top-loading-text="$t('toploading')" :top-pull-text="$t('pullrefresh')" :top-drop-text="$t('toprelease')" ref="loadmore">

        <section class="student__timeline J_cards">
          <!-- 小程序二维码 -->
           <div class="timeline-wrapper" v-if="classroom && !classroom.isPro">
            <section class="timeline-item">
              <div class="f15 timeline__ppt">
                <p class="pb15"><!-- 雨课堂小程序上线啦 -->{{ $t('minilaunchpush') }}<br><!-- 长按识别图中小程序码开始体验 -->{{ $t('entermini') }}</p>
                <img class="qr-code" src="http://sfe.ykt.io/o_1bt6o8jqh1iv7ci71pk91ad3st19.jpeg" alt="雨课堂小程序" />
              </div>
            </section>
          </div>
          <!-- 时间轴内容列表 -->
          <div class="timeline-wrapper" v-for="(item, index) in cards">
            <Card-Item-Component :item="item" :index="index" :lessonid="lessonID" :tabindex='currTabIndex' v-if="currTabIndex===item.type||currTabIndex===1"></Card-Item-Component>
          </div>
          <!-- 各类型中的空状态 -->
          <div class="timeline__msg f15" v-if="currTabIndex===2 && !hasPPT">{{ $t('noslides') }}</div>
          <div class="timeline__msg f15" v-if="currTabIndex===3 && !hasProblem">{{ $t('noquestions') }}</div>
          <div class="timeline__msg f15" v-if="currTabIndex===4 && !hasQuiz">{{ $t('noquizzes') }}</div>
        </section>

      </loadmore>
    </section>


    <!-- 接收器 新消息提醒 -->
    <section class="student__msg f16" v-show="hasMsg" @click="handleScrollToTop">
      <p class="" data-language-key="newfeed">{{ $t('newfeed') }}</p>
    </section>

    <!-- 习题试卷弹框 -->
    <section class="student__msgbox">
      <div class="" v-for="(item, index) in msgBoxs">
        <Popup-Component :item="item" :index="index" :lessonid="lessonID" ></Popup-Component>
      </div>
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
        <!-- <p class=" f16" data-language-complex="connerr" :data-second="countdown">连接异常，<span class="countTime">{{ countdown }}</span>秒后尝试重连</p> -->
         <p class=" f16" v-html="$t('connerr', {second: countdown})"></p>
        <p class="connect-btn f18" @click="handleReconnect">{{ $t('connnow') }}</p>
      </div>
    </section>

    <router-view></router-view>
    <identity :type="pro_perm_info.no_perm_type" :is_can_audit="pro_perm_info.is_can_audit" :university_name="pro_perm_info.university_name" :url="pro_perm_info.bind_number_url" v-if="pro_perm_info && pro_perm_info.no_perm_type"></identity>

    <!-- 填写个人信息 -->
    <information :show-info.sync="showInfo" :gostep="gostep" v-if="showInfo"></information>

    <!-- 新用户引导 -->
    <guide :step.sync="step" :cover.sync="pptCover" :name.sync="teacherName" :hide-guide="hideGuide" v-if="showGuide"></guide>

    <!-- 语言切换 -->
    <Lang-Component></Lang-Component>
  </section>
</template>
<script>
  import request from '@/util/request'
  import API from '@/util/api'
  import '@/util/util'
  import { configWX } from '@/util/wx-util'

  import CardItemComponent from '@/components/common/card-item.vue'
  import PopupComponent from '@/components/common/popup-box.vue'
  import LangComponent from '@/components/common/change_lang_dialog.vue'

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
        title: this.$i18n.t('ykt') || '雨课堂',
        courseName: '',
        // 课程ID
        lessonID: 0,
        // pptID
        presentationID: 0,
        // fetchTimeline send websocket msgid
        msgid: 1,

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
        // 分组map
        groupMap: new Map(),
        // 互评map
        groupReviewMap: new Map(),

        // 习题map
        problemMap: new Map(),

        // timeline列表
        cards: [],

        // 消息box数据
        msgBoxs: [],

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
        backURL: '',
        pro_perm_info: {},

        // 是否存在ppt
        hasPPT: true,
        // 是否存在习题
        hasProblem: true,
        // 是否存在试卷
        hasQuiz: true,

        // 是否需要完善个人信息
        showInfo: false,
        // 显示引导
        showGuide: false,
        // 引导初始化步骤
        step: 1,
        // 第一张ppt
        pptCover: '',
        // 老师名称
        teacherName: '',
        // 尝试拉取数据的次数
        fetchPresentationCount: 0,
        // 是否更新ppt开关
        updatingPPT: false
      };
    },
    components: {
      CardItemComponent,
      PopupComponent,
      information: () => import('@/components/common/information.vue'),
      guide: () => import('@/components/common/guide.vue'),
      LangComponent,
      identity: () => import('@/components/student/identityBinding.vue')
    },
    computed: {
    },
    watch: {
      '$route' (to, from) {
        // 对路由变化作出响应...
        console.log(from.name);
        console.log(to.name);

        if (process.env.NODE_ENV !== 'production') {
          return this;
        }

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

        // 要隐藏的菜单项，只能隐藏“传播类”和“保护类”按钮，所有menu项见附录3
        configWX();
        wx && wx.ready(() => {
          wx.hideMenuItems({
            menuList: [
              'menuItem:share:appMessage', 'menuItem:share:timeline',
              'menuItem:share:qq', 'menuItem:share:weiboApp',
              'menuItem:favorite', 'menuItem:share:QZone']
          });
        });
      },

      /*
       * @method 直播悬停反面等事件
       */
      iniTimeline(lessonID) {
        let self = this;

        Promise.all([this.getPresentationList()]).then((res) => {
          // self.initws();

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
      * @method 隐藏引导
      */
      hideGuide() {
        this.showGuide = false;
        let URL = API.student.SET_GUIDE;
        let param = {
          'lesson_id': this.lessonID
        }

        request.post(URL, param)
          .then((res) => {
            if(res && res.data) {
            }
          });
      },

      /*
      * @method 显示引导步骤3
      */
      gostep() {
        this.step = 3;

        this.init();
        // 隐藏信息完善
        this.showInfo = false;
      },

      /*
      * @method 测试环境初始化timeline
      */
      testTimeline() {
        this.addMessage({ type: 1, message: "开课啦", event: { code: "LESSON_START" } });

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
       * @method 获取老师信息
       * @param  lessonID
       */
      getTeacherName(lessonID) {
        let URL = API.student.GET_TEACHER;
        let param = {
          'lesson_id': lessonID
        }

        request.get(URL, param)
          .then((res) => {
            if(res && res.data) {
              let data = res.data;

              this.teacherName = data.teacher_name;
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

        this.fetchPresentationCount++;

        // lessons
        return request.get(URL, param)
          .then((res) => {
            if(res && res.data) {
              let data = res.data;
              self.pro_perm_info = data.pro_perm_info
              // auth
              self.userID = data.userID;
              self.avatar = data.avatar;
              self.userAuth = data.userAuth;

              self.presentationList = data.presentationList;
              self.quizList = data.quizList;
              self.presentationID = data.activePresentationID;
              self.groupList = data.groupList;
              self.groupReviewList = data.groupReviewList;

              // classroom
              self.classroom = data.classroom;

              // set presentation map
              if(self.presentationList.length) {
                for(let i = 0; i < self.presentationList.length; i++) {
                  let presentation = self.presentationList[i];

                  self.formatPresentation(presentation, presentation.presentationID);
                }
              }

              // set quiz map
              if(self.quizList && self.quizList.length) {
                self.quizList.forEach( function(quiz, index) {
                  self.quizMap.set(quiz.quizID, quiz);
                });
              }

              // set groupMap
              if(self.groupList && self.groupList.length) {
                self.groupList.forEach( (group, index) => {
                  self.groupMap.set(group.group_id, group);
                });
              }

              // set groupReviewMap
              if(self.groupReviewList && self.groupReviewList.length) {
                self.groupReviewList.forEach( (review) => {
                  self.groupReviewMap.set(review.group_review_id, review);
                });
              }

              // set title
              let presentationData = null;

              if(self.presentationID) {
                presentationData = self.presentationMap.get(self.presentationID);
                presentationData && presentationData.Title && (self.title = presentationData.Title);
              } else {
                // presentation没有数据 重新初始化
                self.fetchPresentationCount < 2 && setTimeout(() => {
                  self.getPresentationList();
                }, 5000)

                return presentationData;
              }

              // 课程title
              document.title = self.courseName = data.classroom && data.classroom.courseName;

              // 初始化websocket
              setTimeout(() => {
                self.initws();
              }, 20)

              // 用户引导 老用户从第三页开始
              if(data.need_read_guide) {
                this.showGuide = true;
                this.step = 3;
              }

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
            } else if(error && error.status_code === 5) {
              // 显示引导
              this.showGuide = true;
              this.getTeacherName(this.lessonID);
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

        // 是否正在更新ppt, 防止重复请求压力
        if(this.updatingPPT) {
          return this;
        } else {
          this.updatingPPT = true;
        }

        self.presentationID = presentationID;

        return request.get(URL, param).
          then(function (res) {
            if(res) {
              let data = res;
              let presentation = data.presentationData;

              // set presentation map
              let oldPresentation = self.presentationMap.get(presentationID);
              self.formatUpdatePresentation(presentation, presentationID, oldPresentation);

              // set title
              presentation.Title && (self.title = presentation.Title);

              // 更新ppt刷新timeline
              self.socket.send(JSON.stringify({
                'op': 'fetchtimeline',
                'lessonid': self.lessonID,
                'msgid': self.msgid++
              }));

              // 更新完成
              self.updatingPPT = false;

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
       * @method 格式化ppt更新数据
       * @param
       */
      formatUpdatePresentation(presentation, presentationID, oldPresentation) {
        if(presentation) {
          let pptDataResult = [];
          let pptData = presentation['Slides'];
          let oldSildes = oldPresentation && oldPresentation['Slides'];

          if(pptData.length) {
            pptDataResult = pptData.map( (slide, index) => {
              // 是否存在旧的数据
              if(oldSildes) {
                let oldSlide = this.getSlideData(oldSildes, index + 1, slide.lessonSlideID);
                oldSlide && (slide = Object.assign({}, oldSlide, slide));
              }

              return slide;
            });

            // 有可能存在更新的情况
            presentation['Slides'] = pptDataResult;
          }

          this.presentationMap.set(presentationID || presentation.presentationID, presentation);
        }
      },

      /*
      * @method 下拉刷新回调
      * @param
      */
      refeshLoad(id) {
        setTimeout(() => {
          this.$refs.loadmore.onTopLoaded();

          if (this.socket && this.socket.readyState === 1) {
            // console.log('readyState' + this.socket.readyState);
            this.socket.send(JSON.stringify({
              'op': 'fetchtimeline',
              'lessonid': this.lessonID,
              'msgid': this.msgid++
            }));
          }
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
      handleTouchMove(evt) {
        let target = typeof event !== 'undefined' && event.currentTarget || evt.currentTarget;

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
      handleShowTab(evt) {
        let target = typeof event !== 'undefined' && event.target || evt.target;
        let tabIndex = +target.dataset['index'];

        if(tabIndex) {
          this.currTabIndex = tabIndex;

          // 检测ppt 习题 试卷是否为空
          if(tabIndex > 1) {
            let hasData = this.cards.find((item) => {
              return item.type === tabIndex;
            })

            switch (tabIndex) {
              case 2:
                this.hasPPT = hasData;
                break;
              case 3:
                this.hasProblem = hasData;
                break;
              case 4:
                this.hasQuiz = hasData;
                break;
              default:
                break;
            }
          }

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
        // 国际化confirm options改造
        let msgOptions = {
          confirmButtonText: this.$i18n.t('gopost'),
          cancelButtonText: this.$i18n.t('cancel')
        }

        if(this.danmuStatus) {
          this.$router.push({ path: '/'+ this.lessonID +'/danmu' });
        } else {
          // 引导学生去投稿
          let title = this.$i18n.t('bulletban') || '老师暂时未开放弹幕';
          let message = this.$i18n.t('canposttips') || '温馨提示：您可以随时发送投稿<br>与老师互动';

          this.$messagebox.confirm(message, title, msgOptions).then(action => {
            if(action === 'confirm') {
              this.$router.push({ path: '/'+ this.lessonID +'/submission' });
            }
          });
        }
      },

      /*
       * @method 进入分组
       *
       */
      handleenterTeam(evt) {
        location.href = '/team/student/' + this.classroom.classroomId + '?lessonid=' + this.lessonID;
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
      handleFilter(evt) {
        let targetEl = typeof event !== 'undefined' && event.target || evt.target

        this.isMore = false;
      },

      /*
       * @method 返回上一页
       *
       */
      handleBack() {
        if(this.backURL) {
          location.href = this.backURL;
        } else if(this.classroom && this.classroom.courseId) {
          // 学习日志 /v/index/course/normalcourse/manage_classroom/{{classroom.course_id}}/{{classroom.id}}
          location.href = '/v/index/course/normalcourse/manage_classroom/'+ this.classroom.courseId + '/' + this.classroom.classroomId;
        } else {
          this.$router.back();
        }
      }
    },
    created() {
      this.init();
    },
    mounted() {
    },
    updated() {
      // window.language && window.language.translate(this.$el);
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

  .pb15 {
    padding-bottom: 0.2rem;
  }

  .qr-code {
    width: 5rem;
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
          display: block;
          padding: 0.266667rem 0;

          line-height: 0.933333rem;
          text-align: center;
          white-space: nowrap;

          .iconfont {
            padding-right: 0.186667rem;
            vertical-align: -0.08rem;
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
    background: rgba(51, 51, 51, 0.6);
    border-radius: .4rem/50%;
  }


  /*-------------------*\
    $ 消息box 超过图片弹层
  \*-------------------*/

  .student__msgbox {
    z-index: 3;
    position: fixed;
    top: 0;
    width: 100%;
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

/*
 * @page：学生接收器页面级组件
 * @author: chenzhou
 * @update: 2017.5.27
 * @desc 课堂ppt接收，课堂习题，课堂试卷，课堂红包和老师遥控器实时通信等
 *
 */

<template>
  <section class="page" :class="[ liveType ? 'live__view' : '' ]" @click="handleFilter">
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
            <router-link :to="'/v3/'+lessonID+'/submission/?classroomid=' + (classroom && classroom.classroomId)" tag="p" class="action f17">
              <i class="iconfont icon-ykq_tab_tougao f25"></i>
              <span>{{ $t('sendpost') }}</span>
            </router-link>
            <!-- <p class="action f17" @click="handleenterTeam" v-if="classroom && classroom.classroomId">
              <i class="iconfont icon-fenzu f25"></i>
              <span>{{ $t('team.mygroup') }}</span>
            </p> -->
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

    <!-- 直播 -->
    <section class="live__wrap" v-if="liveType">
      <!-- 视频直播 -->
      <section v-if="liveType === 2">
        <section class="player__box" v-show="liveVisible">
          <video id="player" class="video__live" x5-video-player-fullscreen="true" x5-video-player-type="h5-page" webkit-playsinline playsinline autobuffer controls controlslist="nodownload" ></video>
          <div class="live__status f14" v-show="liveStatusTips">{{liveStatusTips}}</div>
          <section class="live__unfold box-end f14">
            <!-- 展开状态 只听声音 关闭直播 -->
            <p class="box-center" @click="handleLiveVisible(false)">
              <i class="iconfont icon-zhitingshengyin f18 pr10"></i>
              <span class=""><!-- 只听声音 -->{{ $t('liveonlyvoice') }}</span>
            </p>
            <div class="line"></div>
            <p class="box-center" @click="handleStopVideo">
              <i class="iconfont icon-tuichuzhibo f18 pr10"></i>
              <span class=""><!-- 关闭直播 -->{{ $t('liveoff') }}</span>
            </p>
          </section>
        </section>
        <!-- 收起 -->
        <template v-if="!liveVisible">
          <section class="live__fold blue" v-if="playState" @click="handleLiveVisible(true)">
            <p class="box-center">
              <img class="icon-laba" src="~images/student/voice.gif" >
              <span class="f12"><!-- 视频直播收听中… -->{{ $t('livevideolisten') }}</span>
            </p>
            <p class="box-center">
              <span class="f12 pr10"><!-- 展开画面 -->{{ $t('liveunfold') }}</span>
              <i class="iconfont icon-zhankaihuamian f20"></i>
            </p>
          </section>
          <section class="live__fold blue" v-else @click="handlePlayVideo">
            <p class="box-center">
              <i class="iconfont icon-zhibo pr10 f30 red"></i>
              <span class="f12"><!-- 视频直播中… -->{{ $t('livevideoing') }}</span>
            </p>
            <p class="box-center">
              <span class="f12 pr10"><!-- 点击观看 -->{{ $t('liveon') }}</span>
              <i class="iconfont icon-dakai f18"></i>
            </p>
          </section>
        </template>
      </section>
      <!-- 音频直播 -->
      <section class="blue" v-if="liveType === 1">
        <audio id="player" class="live__container" autobuffer></audio>
        <section class="live__fold" v-if="playState" @click="handlestop">
          <p class="box-center">
            <img class="icon-laba" src="~images/student/voice.gif" >
            <span class="f12"><!-- 语音直播收听中… -->{{ $t('liveaudiolisten') }}</span>
          </p>
          <p class="box-center">
            <span class="f12 pr10" v-if="playLoading"><!-- 加载中 -->{{ $t('liveloading') }}</span>
            <span class="f12 pr10" v-else><!-- 点击关闭 -->{{ $t('liveaudiooff') }}</span>
          </p>
        </section>
        <section class="live__fold" v-else @click="handleplay">
          <p class="box-center">
            <i class="iconfont icon-yuyinzhibo f24 red pr10"></i>
            <span class="f12"><!-- 语音直播中… -->{{ $t('liveaudioing') }}</span>
          </p>
          <p class="box-center">
            <span class="f12 pr10"><!-- 点击收听 -->{{ $t('liveaudioon') }}</span>
          </p>
        </section>
      </section>
    </section>

    <!-- 接收器 时间轴 -->
    <section class="student__timeline-wrapper">
      <loadmore class="J_timeline" :top-method="refeshLoad" @translate-change="translateChange" :top-status.sync="topStatus" :top-distance.sync="topDistance" :top-loading-text="$t('toploading')" :top-pull-text="$t('pullrefresh')" :top-drop-text="$t('toprelease')" ref="loadmore">

        <section class="student__timeline J_cards">
          <!-- 小程序二维码 -->
           <div class="timeline-wrapper" v-if="classroom && !classroom.isPro && !weappConfig" v-show="visibleMiniCode">
            <section class="timeline-item">
              <div class="f15 timeline__ppt">
                <p class="pb15"><!-- 雨课堂小程序上线啦 -->{{ $t('minilaunchpush') }}<br><!-- 长按识别图中小程序码开始体验 -->{{ $t('entermini') }}</p>
                <!-- 雨课堂 -->
                <!-- 其它定制 例如清华 -->
                <img class="qr-code" :src="miniCode" alt="雨课堂小程序" v-if="miniCode" />
                <!-- 雨课堂 -->
                <img class="qr-code" src="https://qn-sfe.yuketang.cn/o_1bt6o8jqh1iv7ci71pk91ad3st19.jpeg" alt="雨课堂小程序" v-else />
              </div>
            </section>
          </div>
          <!-- 时间轴内容列表 -->
          <div class="timeline-wrapper" v-for="(item, index) in cards" :key="index">
            <Card-Item-Component :item="item" :index="index" :tabindex='currTabIndex' v-if="currTabIndex===item.type||currTabIndex===1"></Card-Item-Component>
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
      <p class="">{{ $t('newfeed') }}</p>
    </section>

    <!-- 习题试卷弹框 -->
    <section class="student__msgbox">
      <div class="" v-for="(item, index) in msgBoxs" :key="index">
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
         <p class=" f16" v-html="$t('connerr', {second: countdown})"></p>
        <p class="connect-btn f18" @click="handleReconnect">{{ $t('connnow') }}</p>
      </div>
    </section>

    <router-view></router-view>
    <auditor-tips v-if="role===6"></auditor-tips>

    <!-- 填写个人信息 -->
    <information :show-info.sync="showInfo" :gostep="gostep" v-if="showInfo"></information>

    <!-- 新用户引导 -->
    <guide :step.sync="step" :cover.sync="pptCover" :name.sync="teacherName" :hide-guide="hideGuide" v-if="showGuide"></guide>

    <!-- 语言切换 -->
    <Lang-Component></Lang-Component>

    <!-- 停服务通知 -->
    <notice position="bottom"></notice>

    <!-- 打开小程序 -->
    <div class="weapp__wrap" :class="[ danmuStatus ? 'moveup' : '' ]" ref="openweapp" v-show="weappConfig">
      <a href="javascript:;" ontouchstart class="open-btn"><!-- 小程序内打开 -->{{ $t('openmini') }}</a>
    </div>

    <!-- 弹幕直播 -->
    <danmu-live :danmu-status="danmuStatus" :danmus.sync="danmus" :clear-danmus="clearDanmus" v-if="danmuStatus"></danmu-live>

    <!-- 加入会议 -->
    <div class="meeting__join box-center" @click="handleJoin" v-if="hasMeeting">
      <i class="iconfont icon-48-jieru f28 cfff"></i>
    </div>

    <!-- 停服务通知 -->
    <!-- <livetip :id="lessonID" v-if="liveURL"></livetip> -->
  </section>
</template>
<script>
  import { mapState, mapActions } from 'vuex';

  import request from '@/util/request-v3'
  import API from '@/util/api'
  import { compareVersion } from '@/util/util'
  import { configWX } from '@/util/wx-util'

  import '@/util/directive-util'

  import CardItemComponent from '@/lesson/common/card-item.vue'
  import PopupComponent from '@/lesson/common/popup-box.vue'
  import LangComponent from '@/lesson/common/change_lang_dialog.vue'

  import wsmixin from '@/lesson/student/student-socket'
  import actionsmixin from '@/lesson/student/actions-mixin'
  import exercisemixin from '@/lesson/student/exercise-mixin'
  import lessonmixin from '@/lesson/student/mixin/lesson-mixin'

  import livemixin from '@/lesson/student/live-mixin'
  import boardmixin from '@/lesson/common/board-mixin'

  import logmixin from '@/lesson/common/log-reporting'
  import localstoragemixin from '@/lesson/common/localstorage-mixin'


  // 子组件不需要引用直接使用
  window.request = request;
  window.API = API;
  window.compareVersion = compareVersion;
  if (process.env.NODE_ENV !== 'production') {
    // request.post = request.get
  }

  const host = {
    'www.yuketang.cn': 'https://qn-sfe.yuketang.cn/o_1bt6o8jqh1iv7ci71pk91ad3st19.jpeg',
    'b.yuketang.cn': 'https://qn-sfe.yuketang.cn/o_1e24ml9tq18rd1d201m3gd3q1mul9.jpg',
    'pro.yuketang.cn': 'https://qn-sfe.yuketang.cn/o_1e0s17it5bgm1tc1162g1v1q3ik9.jpg',
    'changjiang.yuketang.cn': 'https://qn-sfe.yuketang.cn/o_1e1mahsin1302iubd1e94difd9.png',
    'huanghe.yuketang.cn': 'https://qn-sfe.yuketang.cn/o_1e24ml9tq18rd1d201m3gd3q1mul9.jpg',
    'pre-apple-ykt.xuetangonline.com': 'https://qn-sfe.yuketang.cn/o_1eobsniqm9om1da4g2h1k591q8e9.jpg',
    'rain.xuetangonline.com': 'https://qn-sfe.yuketang.cn/o_1f0kreooe16b6mh9k618ep1a4j9.jpeg',
  }

  const miniAppIds = {
    'www.yuketang.cn': 'gh_01b0a27d2e24',
    'b.yuketang.cn': 'gh_8c9a30cf152f',
    'pro.yuketang.cn': 'gh_b8eff085064f',
    'changjiang.yuketang.cn': 'gh_731c9c765693',
    'huanghe.yuketang.cn': 'gh_67c3b8305643',
    'pre-apple-ykt.xuetangonline.com': 'gh_b82950979ac8',
    'rain.xuetangonline.com': 'gh_8ebceaef4044',
  }

  export default {
    name: 'student',

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
        classroom: {},
        // 课程ID
        lessonID: 0,
        // pptID
        presentationID: 0,
        // fetchTimeline send websocket msgid
        msgid: 1,

        // 权限相关
        userID: 0,
        // 5: 学生 6：旁听生
        role: 5,

        // 当前tab下标
        currTabIndex: 1,

        // 是否有新消息
        hasMsg: false,
        // 是否开启弹幕
        danmuStatus: false,
        // 课程是否结束
        lessonStatus: 0,
        presentationMap: new Map(),
        quizList: null,
        quizMap: new Map(),
        // 分组map
        groupMap: new Map(),
        // 互评map
        groupReviewMap: new Map(),
        // 习题map
        problemMap: new Map(),

        // 消息box数据
        msgBoxs: [],

        // 弹幕投稿是否展开
        isMore: false,
        // 是否新版本 隐藏功能
        version: 1.4,
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
        updatingPPT: false,
        // 直播信息
        liveInfo: null,
        // 直播地址 http://vdn-snap.xuetangx.com/hls/RainLive-44c862d6-39260d78.m3u8
        liveURL: '',
        // 播放状态 1: 播放  0：停止
        playState: 0,
        // 音频加载中
        playLoading: false,
        // 是否提示语音直播
        showLiveTip: false,
        // 版本基本信息 宽高
        boardInfo: {
          width: 0,
          height: 0
        },
        // 白板map
        boardMap: new Map(),
        // 白板不懂收藏
        boardList: null,
        // 弹幕直播
        danmus: [],
        // 是否直播课
        isLive: false,
        liveurl: null,
        // 直播类型 0：默认值 1:audio  2:video
        liveType: 0,
        liveVisible: false,
        // 是否web开课
        isWebLesson: false,
        // 直播下默认显示动画
        visibleAnimation: false,
        returnRemote: false,
        liveStatusTips: '',
        isMute: false,  //静音播放
        lastStatus: 1,
        needNew: false,
        currentTime: 0,
        loadNewUrlTimer: null,
        voice: 1,   // -1静音 1非静音
        // 直播卡顿检测
        liveDetection: {},
        // 小程序码
        miniCode: '',
        visibleMiniCode: false,
        // 小程序分享信息
        weappConfig: null,
        // 是都有会议
        hasMeeting: false
      };
    },
    components: {
      CardItemComponent,
      PopupComponent,
      information: () => import('@/lesson/common/information.vue'),
      guide: () => import('@/lesson/common/guide.vue'),
      LangComponent,
      auditorTips: () => import('@/lesson/student/auditor_tips.vue'),
      notice: () => import('@/lesson/common/service-notice.vue'),
      danmuLive: () => import('@/lesson/common/danmu-live.vue'),
      livetip: () => import('@/lesson/common/live-tip.vue'),
    },
    computed: {
      ...mapState([
        'cards',
        'observerMode'
      ])
    },
    watch: {
      '$route' (to, from) {
        if (process.env.NODE_ENV !== 'production') {
          return this;
        }

        if(from.name == 'student-danmu' || from.name == 'student-submission') {
          document.title = this.courseName && this.courseName;
          setTimeout(() => {
            typeof this.handleScrollToTop === 'function' && this.handleScrollToTop();
          }, 300)
        }

        // 打开小程序path变化需要重新授权
        if(this.weappConfig && this.platform === 'android') {
          configWX();
        }
      },
      lessonStatus (newValue, oldValue) {
        // 下课啦
        if(newValue === 1) {
          // this.backURL = '/v/index/course/normalcourse/learning_lesson_detail/' + this.lessonID;
          this.backURL = '/v/index/lessonend'
        }
      },
      cards(newVal, oldVal) {
        this.cachecardsTimer && clearTimeout(this.cachecardsTimer);
        this.cachecardsTimer = setTimeout(()=>{
          this.setLocalData('cards', newVal);
        }, 1500)
      },
    },
    filters: {
    },
    mixins: [ wsmixin, actionsmixin, exercisemixin, livemixin, boardmixin, logmixin, localstoragemixin, lessonmixin ],
    methods: {
      ...mapActions([
        'setCards',
        'setLessonId',
        'setObserverMode',
      ]),

      /*
       * @method 接收器初始化
       */
      init() {
        let self = this;
        this.lessonID = this.$route.params.lessonID;
        this.setLessonId(this.lessonID);

        let query = this.$route.query;
        let observerMode = query && query.force === 'lecture' ? true : false;
        this.setObserverMode(observerMode);

        this.returnRemote = query && query.remote ? true : false
        this.returnRemote && (this.title = this.$i18n.t('viewasstudent'))

        if(query.source) {
          this.source = query.source;
        }

        this.iniTimeline(this.lessonID);

        // 要隐藏的菜单项，只能隐藏“传播类”和“保护类”按钮，所有menu项见附录3
        configWX();
        window.wx && wx.ready(() => {
          wx.hideMenuItems({
            menuList: [
              'menuItem:share:appMessage', 'menuItem:share:timeline',
              'menuItem:share:qq', 'menuItem:share:weiboApp',
              'menuItem:favorite', 'menuItem:share:QZone']
          });
        });

        // 是否开启debug模式
        if(query && query.debug) {
          setTimeout(()=>{
            this.openDebug();
          }, 1000*10)
        }
      },

      /*
       * @method 直播悬停反面等事件
       */
      iniTimeline(lessonID) {
        let self = this;

        Promise.all([this.initLesson(lessonID)]).
        then((res) => {

          setTimeout(()=>{
            require(['photoswipe', 'photoswipe/dist/photoswipe-ui-default', 'photoswipe/dist/photoswipe.css'], function(PhotoSwipe, PhotoSwipeUI_Default) {
              window.PhotoSwipe = PhotoSwipe;
              window.PhotoSwipeUI_Default = PhotoSwipeUI_Default;
            })

            // 直播hls格式初始化
            let isWeb = this.isWeb;
            !isWeb && this.loadHLS();

            // sentry 配置
            // this.setSentry();
          }, 1500)

          setTimeout(()=>{
            require(['moment'], function(moment) {
              window.moment = moment;
            })
          }, 2500)

          // 设置自动提交
          setInterval(() => {
            this.autoSendAnswers();
          }, 10000)

          this.bindTouchEvents();

          // 时间动态显示 每分钟更新一次
          setInterval(() => {
            this.cards.forEach((item) => {
              item.time && (item.time = item.time - 1);
            })
          }, 60000)

          // 订阅发布重置
          let pubSub = window.parent && window.parent.PubSub || null;
          pubSub && pubSub.publish('fullscreen', {
            msg: 'fullscreen',
            lessonID: this.lessonID,
            type: 'v3',
            teacher: this.observerMode
          });

        });
      },

      /*
      * @method sentry ga 配置
      */
      setSentry() {
        if(window.Sentry) {
          window.Sentry.init({ dsn: 'https://27f98c41f6584529b30068fe12a71241@mobile-sentry.xuetangonline.com/5' });
          window.Sentry.configureScope((scope) => {
            scope.setUser({ 'id': this.userID });
          });
        }
      },

      /*
      * @method 隐藏引导
      */
      hideGuide() {
        this.showGuide = false;
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
      * @method 下拉刷新回调
      * @param
      */
      refeshLoad(id) {
        setTimeout(() => {
          this.$refs.loadmore.onTopLoaded();

          if (this.socket && this.socket.readyState === 1) {
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
          this.$router.push({ path: '/v3/'+ this.lessonID +'/danmu' });
        } else {
          // 引导学生去投稿
          let title = this.$i18n.t('bulletban') || '老师暂时未开放弹幕';
          let message = this.$i18n.t('canposttips') || '温馨提示：您可以随时发送投稿<br>与老师互动';

          this.$messagebox.confirm(message, title, msgOptions).then(action => {
            if(action === 'confirm') {
              this.$router.push({ path: '/v3/'+ this.lessonID +'/submission' });
            }
          });
        }
      },

      /**
       * @method 检测是否在window客户端
       */
      checkInWindowsApp(ua, isWeixin) {
        let isInWindowApp = ~ua.indexOf('windowswechat');
        if(isInWindowApp && isWeixin) {
          let msgOptions = {
            confirmButtonText: this.$i18n.t('gotit') || '知道了'
          };
          let message = this.$i18n.t('windowapptip') || '由于微信电脑端尚不完善，雨课堂的直播、互动等使用体验无法保证。<br>建议您在浏览器中打开雨课堂网页版继续参与教学。';
          this.$messagebox.alert(message, msgOptions).then(action => {
            if(action === 'confirm') {
            }
          });
        }
      },

      /**
       * @method 检测微信版本
       */
      checkWechat(ua) {
        ua = ua || window.navigator.userAgent;

        let lessonid = this.lessonID;
        let config = {
          id: miniAppIds[location.host] || '',
          path: `/lesson/student/presentation/presentation.html?id=${lessonid}&source=5`
        };

        // 检测微信版本号 iOS android系统
        // 微信版本要求为：7.0.12及以上。 系统版本要求为：iOS 10.3及以上、Android 5.0及以上
        let version = ua.replace(/^.*micromessenger\/([\d.]+).*$/, "$1");
        let iOS = !!ua.match(/\(i[^;]+;( u;)? cpu.+mac os x/);
        this.platform = iOS ? 'ios' : 'android';

        // 特殊版本禁止跳到小程序
        let specialVersion = iOS && version === '7.0.18';
        if(specialVersion) {
          return this;
        }

        if(version !== ua && compareVersion(version, '7.0.12') >= 0 && !this.observerMode) {
          this.weappConfig = config;

          setTimeout(()=>{
            var weappEl = document.getElementById('J_launch-weapp');

            weappEl.addEventListener('launch', (e) => {
              console.log('success');
              // 如果有直播关闭
              if(this.liveType) {
                this.handleStopVideo();
              }
            });

            weappEl.addEventListener('error', (e) => {
              console.log('fail', e.detail);
            });
          }, 1000)

          let openmini = this.$i18n.t('openmini') || '小程序内打开';
          let rem2px = window.lib && window.lib['flexible'] && window.lib['flexible']['rem2px'];
          let height = rem2px && rem2px(1) || 35;
          let script = document.createElement('script');
          script.type = 'text/wxtag-template';
          script.text = `<div id="J_weapp_btn" style="width:100%;height:${height}px;display:flex;justify-content:center;align-items: center;font-size:24px;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</div>`;

          let weappEl = document.createElement('wx-open-launch-weapp');
          weappEl.setAttribute('id', 'J_launch-weapp');
          weappEl.setAttribute('class', 'weapp__container');
          weappEl.setAttribute('username', config.id);
          weappEl.setAttribute('path', config.path);
          weappEl.innerHTML = script.outerHTML;
          this.$refs.openweapp.appendChild(weappEl);
        } else {
          this.visibleMiniCode = true;
        }
      },

      /*
       * @method 加入会议
       */
      handleJoin(evt) {
        this.$toast({
          message: this.$i18n.t('interactiontip'),
          duration: 2000
        });

        // 打开小程序
        var weappEl = document.getElementById('J_weapp_btn');
        if(weappEl) {
          weappEl.click();
        }
      },

      /*
       * @method 进入分组
       *
       */
      handleenterTeam(evt) {
        location.href = '/team/student/' + this.classroom.id + '?lessonid=' + this.lessonID;
      },

      /*
       * @method 滚动到最顶部
       *
       */
      handleScrollToTop() {
        let timelineEl = this.$el.querySelector('.J_cards')

        timelineEl.scrollIntoView();
        this.hasMsg = false;
      },

      /*
       * @method 立即重连
       *
       */
      handleReconnect() {
        this.reconnectTimer && clearInterval(this.reconnectTimer)
        this.countdown = 10;
        this.initws(true);
      },

      /*
       * @method 页面事件过滤
       */
      handleFilter(evt) {
        this.isMore = false;
      },

      /*
       * @method 返回上一页
       *
       */
      handleBack() {
        if(this.backURL) {
          location.href = this.backURL;
        } else if(this.returnRemote){
          this.$router.back();
        } else if(this.classroom && this.classroom.courseId) {
          // 学习日志
          location.href = '/v/index/course/normalcourse/manage_classroom/'+ this.classroom.courseId + '/' + this.classroom.classroomId;
        } else {
          this.$router.back();
        }
      }
    },
    created() {
      this.init();

      // 关闭 刷新页面 上报快手 window.onbeforeunload
      window.onunload = (evt) => {
        // 快手上报
        if(this.qos && this.logLiveurl) {
          this.qos.sendSummary();
        }
      };
    },
    mounted() {
      // 是否网页版
      let ua = navigator.userAgent.toLowerCase();
      let isWeixin = ~ua.indexOf('micromessenger');
      this.isWeb = !isWeixin;

      this.miniCode = host[location.host] || '';

      setTimeout(()=>{
        this.checkInWindowsApp(ua, isWeixin);
        // 是否可以直接使用小程序打开
        isWeixin && this.checkWechat(ua);
      }, 500)
    },
    updated() {
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

  .pt15 {
    padding-top: 0.2rem;
  }

  .pb15 {
    padding-bottom: 0.2rem;
  }

  .pr15 {
    padding-right: 0.2rem;
  }
  .pr10 {
    padding-right: 0.133333rem;
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
      z-index: 2;
      position: relative;
      width: 1.2rem;

      .more-actions {
        z-index: 2;
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


  .live__view {
    display: flex;
    flex-flow: column;

    .live__wrap {
      position: relative;
      padding: 2.33rem 0 0;

      .player__box {
        position: relative;
        .video__live {
          width: 100%;
          min-height: 5rem;
          background: rgba(0,0,0,0.45);
        }
        .live__status {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-family: PingFangSC-Medium;
          color: #FFFFFF;
          letter-spacing: 0;
          text-align: center;
          padding: 0.13333333rem 0.26666667rem;
          background: rgba(68,68,68,.4);
          border-radius: 0.05333333rem;
        }
      }

      .live__unfold {
        margin-top: -0.266667rem;
        width: 100%;
        height: 1.066667rem;
        padding: 0 0.4rem;

        color: #c8c8c8;
        background: #333;

        .line {
          margin: 0 0.266667rem;
          height: 0.4rem;
          border-right: 1px solid #fff;
        }
      }

      .live__fold {
        display: flex;
        justify-content: space-between;
        align-items: center;

        margin: 0.266667rem auto;
        padding: 0 0.266667rem;
        width: 9.066667rem;
        height: 1.066667rem;
        background: rgba(80, 150, 245, 0.1);
        border-radius: 0.053333rem;

        .icon-laba {
          margin-right: 0.133333rem;
          width: 0.64rem;
          height: 0.64rem;
        }
      }
    }

    .student__timeline-wrapper {
      flex: 1;
      overflow-y: auto;

      position: relative;
      top: 0;
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


  /*--------------------*\
    $ 直播入口
  \*--------------------*/


  .live {
    z-index: 2;
    position: absolute;
    bottom: 0.4rem;
    right: 0.4rem;

    width: 1.28rem;
    height: 1.28rem;

    background: rgba(0, 0, 0, 0.7);
    box-shadow: 0 0.04rem 0.24rem rgba(0,0,0,0.5);
    border-radius: 50%;
    box-sizing: border-box;
  }

  .live__audio {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    width: 1.28rem;
    height: 1.28rem;

    display: flex;
    justify-content: center;
    align-items: center;
    box-sizing: border-box;
  }

  .live__audio .iconfont {
    padding-right: 0.066667rem;
    padding-bottom: 0.026667rem;
    color: #fff;
  }

  .live__container {
    opacity: 0;
  }


  video::-webkit-media-controls-timeline {
    visibility: hidden;
  }
  video::-webkit-media-controls-current-time-display {
    visibility: hidden;
  }

  .weapp__wrap {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0.8rem;
    text-align: center;

    margin: 0 auto;
    width: 3rem;
    height: 1rem;

    &.moveup {
      bottom: 1.5rem;
    }

    .open-btn {
      display: flex;
      justify-content: center;
      align-items: center;

      width: 3rem;
      height: 1rem;
      font-size: 0.35rem;
      color: #fff;
      background: -webkit-linear-gradient(left, #4294ea 0, #52b4eb 100%);
      background: linear-gradient(to right, #4294ea 0, #52b4eb 100%);
      border: 0 solid transparent;
      border-radius: 50%/1.5rem;

      text-decoration: none;
    }
  }

  .weapp__container {
    position: absolute;
    top: 0;
    left: 0;

    opacity: 1;

    display: flex;
    justify-content: center;
    align-items: center;

    width: 3rem;
    height: 1rem;
  }

  .meeting__join {
    position: fixed;
    bottom: 0.8rem;
    right: 0.133333rem;

    width: 1.333333rem;
    height: 1.333333rem;

    border-radius: 50%;
    background: #08BC72;
  }

</style>

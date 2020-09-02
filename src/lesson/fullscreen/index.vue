/*
 * @page：学生接收器全屏
 * @author: chenzhou
 * @update: 2019.3.27
 * @desc
 *
 */

<template>
  <section class="page">
    <!-- PPT 展示 -->
    <section class="ppt__wrapper J_ppt">
      <!-- 提示 -->
      <!--  <p class="lesson--tip" v-if="visibleTip">
        <span><i class="iconfont icon--weilianjie f14"></i> 网页直播延迟较大，推荐使用手机/平板微信小程序观看直播，体验更佳</span><i class="iconfont icon-guanbi1 f15 close" @click="handleClosedTopTip"></i>
      </p> -->

      <!-- 消息通知 -->
      <msgbox></msgbox>

      <!-- 这里布局要改成 pad版 -->
      <lesson ref="lessoncmp" ></lesson>
    </section>

    <!-- 直播入口 音频直播 -->
    <section class="live" v-if="liveURL && liveType === 1">
      <div class="live__audio">
        <i class="iconfont icon-quxiaojingyinx" v-if="playState" @click="handlestop"></i>
        <i class="iconfont icon-jingyin" v-else @click="handleplay"></i>
      </div>
      <!-- live-player作为音频直播的容器 -->
      <audio id="player" class="live__container" autobuffer >
      </audio>
    </section>

    <!-- 直播入口 视频直播 -->
    <section class="live__video J_live_wrap" :class="{ 'fullscreen': videoFullscreen }"  v-if="liveURL && liveType === 2">
      <!-- 定制video -->
      <div class="live__video_box J_live">
        <video id="player" class="live__container video__container" webkit-playsinline playsinline autobuffer ></video>
        <div class="live__status_tip" v-if="liveStatusTips">{{liveStatusTips}}</div>
      </div>
      <!-- 自定义控制条 因为全屏要展示提示信息和弹幕发送 -->
      <div class="video__controls cfff f18">
        <div class="ponter">
          <i class="iconfont icon-zanting2" @click="handlestopVideo" v-if="playState"></i>
          <i class="iconfont icon-bofang4" @click="handleplayVideo" v-else></i>
        </div>
        <div class="controls__right" :class="danmuStatus && videoFullscreen ? 'halfWidth' : ''">
          <!-- 弹幕发送 -->
          <danmu-cmp v-if="danmuStatus && videoFullscreen" :videoFullscreen="videoFullscreen" @showtips="handleShowTips" :visible-danmu="visibleDanmu"></danmu-cmp>
          <div class="ponter">
            <volume @setvolume="handleSetVolume"></volume>
            <i class="iconfont icon-suoxiao" @click="handleVideoExitFullscreen" v-if="videoFullscreen"></i>
            <i class="iconfont icon-quanping1" @click="handleVideoFullscreen" v-else></i>
          </div>
        </div>

      </div>

      <!-- resize 控制点 -->
      <section class="video__anchors" v-show="!videoFullscreen" >
        <div class="video--anchor J_anchor" data-direction="north-west"></div>
        <div class="video--anchor J_anchor" data-direction="north-east"></div>
        <div class="video--anchor J_anchor" data-direction="south-east"></div>
        <div class="video--anchor J_anchor" data-direction="south-west"></div>
      </section>

      <!-- 消息提醒 新版 -->
      <videomsg :videoFullscreen="videoFullscreen" v-show="videoFullscreen" ></videomsg>

      <!-- 实时弹幕列表 -->
      <section class="danmu-live J_video_danmu" v-show="videoFullscreen && visibleDanmu"></section>
    </section>

    <!-- 实时弹幕列表 -->
    <section class="danmu-live J_danmu_live" v-show="visibleDanmu"></section>

    <!-- 更多操作 -->
    <section class="actions__wrap blue" :class="{ 'only': !danmuStatus && !visibleMore }" >
      <div class="" v-show="danmuStatus" >
        <p class="action-btn action-tip" @click="setVisibleDanmu(false)" data-tip="弹幕：开" v-if="visibleDanmu">
          <i class="iconfont icon-danmukai f32"></i>
        </p>
        <p class="action-btn action-tip" @click="setVisibleDanmu(true)" data-tip="弹幕：关" v-else >
          <i class="iconfont icon-danmuguan f32 c666"></i>
        </p>
        <p class="action-btn action-tip" @click="handleVisibleDanmu" data-tip="发弹幕">
          <i class="iconfont icon-fadanmu f32"></i>
        </p>
      </div>
      <div class="" v-if="visibleMore">
        <p class="line" v-show="danmuStatus" ></p>
        <p class="action-btn action-tip" @click="handleVisibleSubmission" data-tip="投稿">
          <i class="iconfont icon-ykq_tab_tougao f32"></i>
        </p>
        <!-- <p class="action-btn action-tip" @click="handleVisibleGroup" data-tip="分组">
          <i class="iconfont icon-fenzu1 f32"></i>
        </p> -->
      </div>
      <p class="action-btn action-tip" @click="handleVisibleMore(false)" data-tip="收起" v-if="visibleMore">
        <i class="iconfont icon--shuangjiantouxiangxia f24"></i>
      </p>
      <p class="action-btn action-tip" @click="handleVisibleMore(true)" data-tip="更多" v-else>
        <i class="iconfont icon--gengduocaozuo f24"></i>
      </p>
    </section>

    <!-- 弹幕控制组件 -->
    <danmu-cmp v-if="danmuStatus && !videoFullscreen" :videoFullscreen="videoFullscreen" :visible-danmu="visibleDanmu"></danmu-cmp>

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

  </section>
</template>
<script>
  import { mapState, mapActions } from 'vuex';

  import request from '@/util/request-v3'
  import API from '@/util/api'
  import { isSupported } from '@/util/util'

  import wsmixin from '@/lesson/fullscreen/mixin/socket-mixin'
  import actionsmixin from '@/lesson/fullscreen/mixin/actions-mixin'
  import livemixin from '@/lesson/fullscreen/mixin/live-kwai'
  import eventmixin from '@/lesson/fullscreen/mixin/event-mixin'

  import lessonmixin from '@/lesson/fullscreen/mixin/lesson-mixin'

  import logmixin from '@/lesson/common/log-reporting'
  import fullscreenMixin from '@/lesson/fullscreen/mixin/fullscreen'


  let screenfull = require('screenfull');
  import Danmaku from 'danmaku';

  import danmuCmp from './components/danmu.vue'
  import volume from './components/video_volume.vue'

  import lesson from './components/lesson';
  import msgbox from './components/msg-box';
  import videomsg from './components/video-msg';


  // 子组件不需要引用直接使用
  window.request = request;
  window.API = API;

  export default {
    name: 'fullscreen',
    data() {
      return {
        // 弹幕引擎
        danmaku: null,
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
        // fetchTimeline send websocket msgid
        msgid: 1,

        // 权限相关
        userID: 0,
        avatar: '',
        userAuth: 0,

        // 是否有新消息
        hasMsg: false,
        // 是否开启弹幕
        danmuStatus: false,
        // 是否显示弹幕
        visibleDanmu: true,
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

        // 插件版本号
        version: 1.5,
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
        // 当前正在播放的ppt
        // currSlide: { src: 'https://qn-sfe.yuketang.cn/o_1d6vdogohj6tnt712ra1a2s1q0u9.png' },
        isFullscreen: false,
        liveurl: null,
        // 直播类型 0：默认值 1:audio  2:video
        liveType: 0,
        liveVisible: true,
        // 是否web开课
        isWebLesson: false,
        // 显示提示
        visibleTip: true,
        isWeb: true,
        // 直播卡顿检测
        liveDetection: {},
        // 视频是否全屏
        videoFullscreen: false,
        // 是否播放
        // playState
        liveStatusTips: '',
        // 显示更多操作
        visibleMore: false,
        currentTime: 0
      };
    },
    components: {
      lesson,
      danmuCmp,
      volume,
      msgbox,
      videomsg
    },
    computed: {
      // 使用对象展开运算符将 getter 混入 computed 对象中
      ...mapState([
        'lesson',
        'cards',
        'lines',
      ])
    },
    watch: {
      '$route' (to, from) {
        // 对路由变化作出响应...
        console.log(from.name);
        console.log(to.name);
      },
      cards(newVal, oldVal) {
        let slide = null;

        newVal.forEach( (item, index) => {
          if(item.type === 2 || item.type === 3 || item.type === 12) {
            slide = item;
          }
        });

        // 过滤当前放映PPT
        if(slide && (slide.type === 2 || slide.type === 3 || slide.type === 12)) {
          setTimeout(()=>{
            this.setCurrSlide(slide);
          }, 100)
        }

        // 更新接收器展示timeline
        this.setLines(newVal);
      },
      liveURL(newVal, oldVal) {
        setTimeout(()=>{
          // newVal && this.supportFLV();
          newVal && this.initKwai();

          this.liveType === 2 && this.initEvent();
        }, 1000)
      },
      danmus(newVal, oldVal) {
        if(newVal && newVal.length) {
          let danmu = newVal.shift();
          if(danmu) {
            this.emitDanmu(danmu.danmu)
          }
        }
      },
      visibleDanmu(newVal, oldVal) {
        // 视频全屏开启弹幕
        if(newVal && this.videoFullscreen) {
          setTimeout(()=>{
            this.initVideoDanmu();
          }, 500)
        } else if(newVal) {
          setTimeout(()=>{
            // this.initDanmu();
          }, 200)
        }
      }
    },
    filters: {
    },
    mixins: [ wsmixin, actionsmixin, livemixin, eventmixin, logmixin, fullscreenMixin, lessonmixin ],
    methods: {
      ...mapActions([
        // 将 `this.setCards()` 映射为 `this.$store.dispatch('setCards')`
        'setLesson',
        'setCards',
        'setLines',
        'reset',
        'setObserverMode',
        'setSlideIndex',
        'setMsg',
        'setCurrSlide',
        'setBoardMsg',
        'setVisibleDanmuSend',
      ]),

      /*
       * @method 接收器初始化
       */
      init() {
        this.lessonID = this.$route.params.lessonID;
        // 签到方式
        this.source = this.$route.query && this.$route.query.source || 5;

        this.iniTimeline(this.lessonID);
      },

      /**
       * @method 初始化弹幕
       * @params
       */
      initDanmu() {
        let options = {
          container: this.$el.querySelector('.J_danmu_live'),
          comments: [],
          speed: this.speed || 180
        };
        let danmaku = new Danmaku(options);

        this.danmaku = danmaku;
      },

      /**
       * @method 发射弹幕
       * @params
       */
      emitDanmu(msg) {
        let bgcolors = [ '#F84F41', '#F84F41', '#FEA300', '#F5C900', '#62D793', '#9C81FA', '#FA7AD3',];
        let bgcolor = bgcolors[Math.floor(Math.random() * 6)];
        let danmu = {
          text: msg,
          style: {
            margin: '10px',
            padding: '0 15px',
            fontSize: '16px',
            // color: color,
            // background: 'rgba(0,0,0,0.15)',
            color: '#fff',
            background: bgcolor,
            borderRadius: '13px/50%',
          },
        };

        // this.danmaku.emit(danmu);

        // 视频全屏使用
        if(this.videoFullscreen && this.videoDanmaku) {
          this.videoDanmaku.emit(danmu);
        } else {
          this.danmaku.emit(danmu);
        }
      },

      /**
       * @method 是否显示弹幕
       * @params
       */
      setVisibleDanmu(visible) {
        this.visibleDanmu = visible;
      },

      /*
       * @method 直播悬停反面等事件
       */
      iniTimeline(lessonID) {
        // Promise.all([this.getPresentationList()]).
        Promise.all([this.initLesson(lessonID)]).
        then((res) => {
          setTimeout(()=>{
            // sentry 配置
            this.setSentry();

            require(['photoswipe', 'photoswipe/dist/photoswipe-ui-default', 'photoswipe/dist/photoswipe.css'], function(PhotoSwipe, PhotoSwipeUI_Default) {
              window.PhotoSwipe = PhotoSwipe;
              window.PhotoSwipeUI_Default = PhotoSwipeUI_Default;
            })
          }, 1000)

          setTimeout(()=>{
            require(['moment'], function(moment) {
              window.moment = moment;
            })
          }, 2500)
        });
      },

      /*
      * @method sentry ga 配置
      */
      setSentry() {
        if(window.Sentry) {
          window.Sentry.init({ dsn: 'https://3d89296280c84e499c8022dc77217999@mobile-sentry.xuetangonline.com/3' });
          window.Sentry.configureScope((scope) => {
            scope.setUser({ 'id': this.userID });
          });
        }
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

        // 是否有明确的签到方式
        if(this.source) {
          param['source'] = this.source;
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
              self.liveInfo = data.liveList || null;
              // 白板不懂收藏
              self.boardList = data.share_board_track || null;

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

              // set boardMap
              if(self.boardList && self.boardList.length) {
                self.boardList.forEach( (board) => {
                  self.boardMap.set(board.board_id, board);
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

              // 直播处理 1为直播中，2为已结束
              if(self.liveInfo && self.liveInfo.status === 1) {
                self.liveType = self.liveInfo.type || 1;
                self.liveURL = self.liveInfo.live_url.httpflv;
                self.liveurl = self.liveInfo.live_url;

                // 日志上报
                setTimeout(() => {
                  self.handleLogEvent();
                }, 30000)
              }

              // 课程title
              document.title = self.courseName = data.classroom && data.classroom.courseName;

              // 初始化websocket
              setTimeout(() => {
                self.initws();
              }, 20)

              // 课程基本信息
              self.setLesson({
                lessonID: self.lessonID,
                presentationID: self.presentationID,
                title: presentationData && presentationData.Title,
                userID: data.userID,
                avatar: data.avatar,
                userAuth: data.userAuth
              })

              return presentationData;
            }
          })
          .catch(error => {
            console.log(error);

            if(error && error.status_code === 601) {
              // 课程结束
              console.log('课程结束');
              location.href = '/v/index/lessonend';
            } else if(error && error.status_code === 603) {
              // 没有权限
              console.log('没有权限');
            } else if(error && error.status_code === 5) {
              // 显示引导
              // this.showGuide = true;
              // this.getTeacherName(this.lessonID);
            }
          });
      },

      /**
       * @method 弹幕发送toast
      */
      handleShowTips(text){
        this.liveStatusTips = text
        setTimeout(() => {
          this.liveStatusTips = ''
        }, 3000)
      },
      /**
       * @member 设置音量
      */
      handleSetVolume(volume){
        document.querySelector('#player').volume = volume
      }
    },
    created() {
      this.init();

      // 关闭 刷新页面 上报快手 window.onbeforeunload
      window.onunload = (evt) => {
        // 快手上报
        if(this.qos && this.liveURL) {
          this.qos.sendSummary({
            lessonid: this.lessonID,
            uid: this.userID,
            liveurl: this.liveURL
          });
        }
      };
    },
    mounted() {
      setTimeout(()=>{
        this.initDanmu();
      }, 1000)
    },
    updated() {
    },
    beforeDestroy() {
    }
  };
</script>

<style lang="scss">

  .page {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;

    background: #2F3963;
  }

  .ppt__wrapper {
    display: flex;
    justify-content: center;
    align-items: center;

    width: 100vw;
    height: 100vh;

    padding: 20px;

    background: #2F3963;
  }

  .cover__container {
    position: relative;

    .answer-btn {
      position: absolute;
      right: 100px;
      bottom: 50px;

      width: 180px;
      height: 44px;
      line-height: 44px;
      background: #639EF4;
      border-radius: 4px;
      cursor: pointer;
    }
  }

  .cover {
    width: 100%;
  }


  .live {
    z-index: 2;
    position: absolute;
    top: 55px;
    right: 15px;

    width: 52px;
    height: 52px;

    background: #fff;
    box-shadow: 0 0 20px rgba(0,0,0,0.3);
    border-radius: 50%;
    box-sizing: border-box;

    .live__container {
      opacity: 0;
    }
  }

  .live__audio {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    width: 52px;
    height: 52px;

    display: flex;
    justify-content: center;
    align-items: center;
    box-sizing: border-box;
  }

  .live__audio .iconfont {
    font-size: 28px;
    color: #5096F5;
  }


  .live__video {
    position: absolute;
    top: 5px;
    right: 5px;

    width: 400px;

    &:hover {
      .video__controls {
        opacity: 1;
        transition: opacity ease-in 0.35s;
      }
    }

    &.fullscreen {
      width: 100vw;
      top: 0;
      bottom: 0;
      right: 0;
      left: 0;

      display: flex;
      align-items: center;
      justify-content: center;

      .live__video_box {
        display: flex;
        align-items: center;
      }

      .live__container {
        width: 100vw;
        max-height: 100vh;

        cursor: move;
      }

      .video__controls {
        height: 56px;
        padding: 5px 30px;
        background: rgba(0,0,0, 0.7);

        .iconfont {
          font-size: 25px;
        }

      }

    }

    .live__video_box {
      width: 100%;
      height: 100%;
      position: relative;

      .live__status_tip {
        position: absolute;
        top: 50%;
        left: 50%;
        width: 300px;
        height: 84px;
        font-size: 20px;
        line-height: 84px;
        text-align: center;
        border-radius: 2px;
        transform: translate(-50%, -50%);
        color: #fff;
        background: rgba(0,0,0,.3);
      }

    }

    .live__container {
      // width: 400px;
      width: 100%;
      background: rgba(0, 0, 0, 0.7);
    }

    .video__anchors {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;

      .video--anchor {
        z-index: 1;
        position: absolute;
        pointer-events: none;

        width: 30px;
        height: 30px;

        opacity: 0;
      }

      .video--anchor[data-direction="north-west"] {
        top: -10px;
        left: -10px;
        cursor: nw-resize;
      }

      .video--anchor[data-direction="north-east"] {
        top: -10px;
        right: -10px;
        cursor: ne-resize;
      }

      .video--anchor[data-direction="south-east"] {
        bottom: -10px;
        right: -10px;
        cursor: se-resize;
      }

      .video--anchor[data-direction="south-west"] {
        bottom: -10px;
        left: -10px;
        cursor: sw-resize;
      }

    }

    &:hover {
      .video--anchor {
        opacity: 1;
        pointer-events: auto;
      }
    }
  }


  .video__controls {
    opacity: 0;
    z-index: 1;
    position: absolute;
    bottom: 0;

    display: flex;
    align-items: center;
    justify-content: space-between;

    width: 100%;
    height: 30px;
    padding: 5px 20px;
    background: rgba(0,0,0, 1);

    transition: opacity ease-in 0.5s 0.5s;

    &:hover {
      opacity: 1;
      transition: opacity ease-in 0.35s;
    }
    .controls__right {
      display: flex;
      &.halfWidth {
        width: 50%;
        min-width: 550px;
      }
      .danmu-control-cmp {
        flex: 1;
        margin-right: 34px;
      }
      .ponter {
        display: flex;
        align-items: center;
      }
    }
  }

  .danmu-live {
    z-index: 1;
    pointer-events: none;
    position: fixed;
    top: 50px;
    left: 0;

    width: 100vw;
    height: 50vh;
  }



  .lesson--tip {
    z-index: 1;
    position: absolute;
    top: 2px;
    left: 0;
    right: 0;

    margin: 0 auto;
    width: 600px;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: space-between;

    // width: fit-content;
    padding: 0 8px 0 12px;

    font-size: 16px;
    text-align: center;
    color: #fff;
    background: #5096f5;
    border-radius: 2px;
    box-shadow: 0 2px 10px 0 rgba(0,0,0,.1);

    .close {
      cursor: pointer;
    }
  }



  /*------------------*\
    $ 更多操作
  \*------------------*/

  .actions__wrap {
    position: absolute;
    // bottom: 55px;
    bottom: 30px;
    right: 15px;

    width: 52px;
    min-height: 52px;
    padding: 15px 0;

    background: #fff;
    box-shadow: 0 0 20px rgba(0,0,0,0.3);
    border-radius: 50%/26px;
    box-sizing: border-box;

    &.only {
      padding: 0;

      .action-btn {
        height: 52px;
      }
    }

    .line {
      margin: 5px auto;
      width: 30px;
      height: 1px;
      border-bottom: 1px solid #ddd;
    }

    .action-btn {
      position: relative;
      display: flex;
      justify-content: center;
      align-items: center;

      height: 42px;
      cursor: pointer;
    }

    .action-tip:hover:before {
      content: '';
      position: absolute;
      right: 100%;

      border: 5px solid transparent;
      border-left-color: #333;
    }

    .action-tip:hover:after {
      content: attr(data-tip);
      position: absolute;
      right: calc(100% + 10px);

      display: block;
      padding: 0 5px;
      min-width: 50px;
      height: 30px;
      line-height: 30px;
      text-align: center;
      white-space: nowrap;

      color: #fff;
      background: #333;
      border-radius: 4px;
    }
  }



  /*------------------*\
    $ 习题定时
  \*------------------*/

  .exercise__tips {
    margin: 5px auto 25px;
    width: 360px;
    height: 60px;
    line-height: 60px;

    background: #212121;
    color: #fff;
    opacity: 0.8;

    border-radius: 2px;
    box-shadow: 0 2.5px 5px rgba(0,0,0,0.2);

    .timing {
      display: flex;
      align-items: center;
      justify-content: center;

      .timing--icon {
        margin-right: 17px;
        width: 32px;
        height: 32px;
      }

      .over.timing--number {
        color: #F84F41;
      }
    }
  }

  /*------------------*\
    $ 习题内容
  \*------------------*/

  .exercise-content {
    position: relative;
    margin: 15px 17px 0;
    padding-bottom: 15px;


    border-top: 1px solid #C8C8C8;
    border-bottom: 1px solid #C8C8C8;
    overflow: hidden;
    .page-no {
      position: absolute;
      top: 0;
      right: 0;

      padding: 0 12px;
      height: 25px;
      line-height: 25px;
      color: #fff;

      background: rgba(0,0,0,0.5);
    }

    .cover {
      display: block;
      width: 100%;

      box-shadow: 0 0 4px rgba(0,0,0,0.2);
    }
  }


  .submit-btn {
    margin: 30px auto 45px;

    width: 275px;
    height: 40px;

    line-height: 40px;

    color: #fff;
    background: #999999;

    border-radius: 4px;
    cursor: pointer;
  }

  .submit-btn.can {
    background: #639EF4;
  }

  .submit-btn.can:active {
    background: rgba(99,158,244,0.7);
  }




</style>
<style>
  .live__video {
    --x: 0px;
    --y: 0px;

    transform: translate(var(--x), var(--y));
  }


</style>

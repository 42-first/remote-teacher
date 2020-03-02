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
      <p class="lesson--tip" v-if="visibleTip">
        <span><i class="iconfont icon--weilianjie f14"></i> 网页直播延迟较大，推荐使用手机/平板微信小程序观看直播，体验更佳</span><i class="iconfont icon-guanbi1 f15 close" @click="handleClosedTopTip"></i>
      </p>

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
      <audio id="player" class="live__container" autobuffer :src="liveURL">
      </audio>
    </section>

    <!-- 直播入口 视频直播 -->
    <section class="live__video J_live" :class="{ 'fullscreen': videoFullscreen }"  v-if="liveURL && liveType === 2">
      <!-- 定制video -->
      <div class="live__video_box">
        <video id="player" class="live__container video__container" webkit-playsinline playsinline autobuffer :src="liveURL" ></video>
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

      <!-- 提示信息 v-if="visibleProblemTip" -->
      <div class="problem__tip f16" v-if="visibleProblemTip && problem">
        <span class="cfff">{{ problem.caption}}</span>
        <span class="blue anwser--tip ponter" @click="handleAnwser">去作答</span>
        <i class="iconfont icon-guanbi2 cfff f25 ponter" @click="handleClosedTip"></i>
      </div>

      <!-- 实时弹幕列表 -->
      <section class="danmu-live J_video_danmu" v-show="videoFullscreen && visibleDanmu"></section>
    </section>

    <!-- 实时弹幕列表 -->
    <section class="danmu-live J_danmu_live" v-show="visibleDanmu"></section>

    <!-- 弹幕控制组件 -->
    <danmu-cmp v-if="danmuStatus && !videoFullscreen" :videoFullscreen="videoFullscreen" :visible-danmu="visibleDanmu"></danmu-cmp>

    <!-- 子页面 -->
    <!-- <router-view></router-view> -->
  </section>
</template>
<script>
  import { mapState, mapActions } from 'vuex';

  import request from '@/util/request'
  import API from '@/util/api'
  import { isSupported } from '@/util/util'

  import wsmixin from '@/components/fullscreen/mixin/socket-mixin'
  import actionsmixin from '@/components/fullscreen/mixin/actions-mixin'
  import livemixin from '@/components/fullscreen/mixin/live-mixin'
  import eventmixin from '@/components/fullscreen/mixin/event-mixin'

   import lessonmixin from '@/components/fullscreen/mixin/lesson-mixin'

  import logmixin from '@/components/common/log-reporting'
  import fullscreenMixin from '@/components/fullscreen/mixin/fullscreen'


  let screenfull = require('screenfull');
  import Danmaku from 'danmaku';

  import danmuCmp from './components/danmu.vue'
  import volume from './components/video_volume.vue'

  import lesson from './components/lesson';
  import msgbox from './components/msg-box';


  // 子组件不需要引用直接使用
  window.request = request;
  window.API = API;
  if (process.env.NODE_ENV !== 'production') {
    // request.post = request.get
  }

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
        playState: 1,
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
        // 当前正在播放的ppt
        currSlide: { src: 'http://sfe.ykt.io/o_1d6vdogohj6tnt712ra1a2s1q0u9.png' },
        isFullscreen: false,
        liveurl: null,
        // 直播类型 0：默认值 1:audio  2:video
        liveType: 0,
        liveVisible: true,
        // 是否web开课
        isWebLesson: false,
        // 显示提示
        visibleTip: true,
        // 显示题目提示
        visibleProblemTip: false,
        isWeb: true,
        // 直播卡顿检测
        liveDetection: {},
        // 视频是否全屏
        videoFullscreen: false,
        // 是否播放
        // playState
        liveStatusTips: '',
        // 问题
        problem: null
      };
    },
    components: {
      lesson,
      danmuCmp,
      volume,
      msgbox
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
        let prev = this.currSlide;

        newVal.forEach( (item, index) => {
          if(item.type === 2 || item.type === 3 || item.type === 10) {
            slide = item;

            if(item.type === 3) {
              slide.src = item.cover;
            }
          }
        });

        // 问题处理宽高
        if(slide && slide.type === 3) {
          let presentation = this.presentationMap.get(slide.presentationid);

          if(presentation) {
            slide.Width = presentation.Width;
            slide.Height = presentation.Height;
            slide.rate = presentation.Width / presentation.Height;
          }

          if(prev && prev.problemID !== slide.problemID) {
            this.visibleProblemTip = true;

            this.problem = slide;
          }
        }

        if(slide && slide.src) {
          this.currSlide = slide;
        }

        // 更新接收器展示timeline
        this.setLines(newVal);
      },
      liveURL(newVal, oldVal) {
        setTimeout(()=>{
          newVal && this.supportFLV();

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
        }
      }
    },
    filters: {
      setStyle(slide) {
        let oStyle = {};

        let innerHeight = window.innerHeight - 40;
        let innerWidth = window.innerWidth - 40;
        let screenRate = innerWidth/innerHeight;
        let width = slide.Width;
        let height = slide.Height;
        let rate = slide.rate;

        // 截图
        if(slide.type === 10 ) {
          return oStyle;
        }

        // 正常宽高比屏幕的宽高
        if(rate > screenRate) {
          oStyle['width'] = innerWidth + 'px';
          oStyle['height'] = innerWidth/rate + 'px';
        } else {
          oStyle['width'] = innerHeight*rate + 'px';
          oStyle['height'] = innerHeight + 'px';
        }

        return oStyle;
      }
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
      ]),

      /*
       * @method 接收器初始化
       */
      init() {
        this.lessonID = this.$route.params.lessonID || 3049;
        this.iniTimeline(this.lessonID);

        let key = 'lesson-tip-cloesed-' + this.lessonID;
        let visibleTip = true;
        if(isSupported(window.localStorage)) {
          visibleTip = !localStorage.getItem(key);
        }

        this.visibleTip = visibleTip;
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
        let self = this;

        Promise.all([this.getPresentationList()]).then((res) => {
          // sentry 配置
          this.setSentry();
        });
      },

      /*
      * @method sentry ga 配置
      */
      setSentry() {
        if(typeof Raven !== 'undefined') {
          Raven.config('http://9f7d1b452e5a4457810f66486e6338c0@rain-sentry.xuetangx.com/12').install();
          Raven.setUserContext({ userid: this.userID });
        } else {
          setTimeout(() => {
            Raven.config('http://9f7d1b452e5a4457810f66486e6338c0@rain-sentry.xuetangx.com/12').install();
            Raven.setUserContext({ userid: this.userID });
          }, 1500)
        }

        typeof ga === 'function' && ga('set', 'userId', this.userID);
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
              // location.href = '/v/index/course/normalcourse/learning_lesson_detail/' + this.lessonID;
              location.href = '/v/index/lessonend';
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
  // @import "~@/style/font/iconfont/iconfont.css";
  // @import "~@/style/mintui.css";

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
    top: 30px;
    right: 30px;
    // visibility: hidden;

    width: 60px;
    height: 60px;

    background: #fff;
    box-shadow: 0 3px 18px rgba(0,0,0,0.5);
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
    width: 60px;
    height: 60px;

    display: flex;
    justify-content: center;
    align-items: center;
    box-sizing: border-box;
  }

  .live__audio .iconfont {
    // padding-right: 5px;
    // padding-bottom: 5px;
    font-size: 45px;
    color: #5096F5;
  }


  .live__video {
    position: absolute;
    top: 5px;
    right: 5px;

    &:hover {
      .video__controls {
        opacity: 1;
        transition: opacity ease-in 0.35s;
      }
    }

    &.fullscreen {
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
      }

      .video__controls {
        height: 56px;
        padding: 5px 30px;
        background: rgba(0,0,0, 0.7);

        .iconfont {
          font-size: 25px;
        }

      }

      .problem__tip {
        // width: 100vw;
        height: 56px;
        padding: 0 35px;

        left: 50%;
        right: initial;
        bottom: 96px;
        transform: translateX(-50%);

        .anwser--tip  {
          margin: 0 20px;
          padding: 3px 10px;
          color: #fff;
          background: #5096F5;
          border-radius: 15px/50%;
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
      width: 400px;
      // min-height: 225px;
      // max-height: 300px;
      background: rgba(0, 0, 0, 0.7);
    }
  }


  .video__controls {
    opacity: 0;
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


  .problem__tip {
    position: absolute;
    right: 10px;
    bottom: 50px;

    display: flex;
    align-items: center;

    height: 44px;
    padding: 0 18px;

    background: rgba(0,0,0, 0.5);
    border-radius: 4px;

    .anwser--tip {
      padding: 0 20px;
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

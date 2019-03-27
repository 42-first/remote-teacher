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
    <section class="ppt__wrapper J_ppt" @click="handleFullscreen" >
      <img class="cover" :src="currSlide.src" :style="currSlide|setStyle" alt="" />
    </section>

    <!-- 直播入口 -->
    <section class="live" v-if="liveURL">
      <!-- live-player作为音频直播的容器 -->
      <audio id="player" class="live__container" autobuffer :src="liveURL">
      </audio>
    </section>

  </section>
</template>
<script>
  import request from '@/util/request'
  import API from '@/util/api'
  import '@/util/util'

  import wsmixin from '@/components/student/student-socket'
  import actionsmixin from '@/components/student/actions-mixin'
  import livemixin from '@/components/fullscreen/live-mixin'


  // 子组件不需要引用直接使用
  window.request = request;
  window.API = API;
  if (process.env.NODE_ENV !== 'production') {
    request.post = request.get
  }

  export default {
    name: 'fullscreen',

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
        // fetchTimeline send websocket msgid
        msgid: 1,

        // 权限相关
        userID: 0,
        avatar: '',
        userAuth: 0,

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
      };
    },
    components: {
    },
    computed: {
    },
    watch: {
      cards(newVal, oldVal) {
        console.info('cards', newVal, newVal.length);
        let slide = null;

        newVal.forEach( (item, index) => {
          if(item.type === 2) {
            slide = item;
          }
        });

        if(slide && slide.src) {
          this.currSlide = slide;
        }
      },
      liveURL(newVal, oldVal) {
        setTimeout(()=>{
          newVal && this.supportFLV();
        }, 500)
      }
    },
    filters: {
      setStyle(slide) {
        let oStyle = {};

        let innerHeight = window.innerHeight - 40;
        let innerWidth = window.innerWidth - 40;
        let width = slide.Width;
        let height = slide.Height;
        let rate = slide.rate;

        // 正常宽比较大
        if(rate > 1) {
          oStyle['widht'] = innerWidth + 'px';
          oStyle['height'] = innerWidth/rate + 'px';
        } else {
          oStyle['widht'] = innerWidth*rate + 'px';
          oStyle['height'] = innerWidth + 'px';
        }

        return {};
      }
    },
    mixins: [ wsmixin, actionsmixin, livemixin ],
    methods: {
      /*
       * @method 接收器初始化
       */
      init() {
        let self = this;

        this.lessonID = this.$route.params.lessonID || 3049;
        this.iniTimeline(this.lessonID);
        this.getSoftVersion(this.lessonID);
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
                // self.liveURL = self.liveInfo.live_url.hls;
                // self.Hls && self.supportHLS(self.Hls);
                self.liveURL = self.liveInfo.live_url.httpflv;
                // this.liveURL && this.supportFLV();
              }

              // 课程title
              document.title = self.courseName = data.classroom && data.classroom.courseName;

              // 初始化websocket
              setTimeout(() => {
                self.initws();
              }, 20)

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

      /**
       * @method 全屏展示
       * @params
       */
      handleFullscreen(evt) {
        let element = this.$el.querySelector('.J_ppt');

        if(this.isFullscreen) {
          this.exitFullscreen(element);
        } else {
          this.launchIntoFullscreen(element);
        }

        this.isFullscreen = !this.isFullscreen;

        let silde = this.currSlide;
        if(silde) {
          silde.time = +new Date();
          this.currSlide = silde;
        }

        this.liveURL && this.handleplay();
      },

      /**
       * @method 全屏展示
       * @params
       */
      launchIntoFullscreen(element) {
        if(element.requestFullscreen) {
          element.requestFullscreen();
        } else if(element.webkitRequestFullscreen) {
          element.webkitRequestFullscreen();
        } else if(element.msRequestFullscreen) {
          element.msRequestFullscreen();
        }
      },

      /**
       * @method 退出全屏展示
       * @params
       */
      exitFullscreen() {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.msExitFullscreen) {
          document.msExitFullscreen();
        } else if (document.mozCancelFullScreen) {
          document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        }
      },
    },
    created() {
      this.init();
    },
    mounted() {
    },
    updated() {
    },
    beforeDestroy() {
    }
  };
</script>

<style lang="scss">
  // @import "~@/style/font/iconfont/iconfont.css";
  // @import "~@/style/animate.css";
  @import "~@/style/mintui.css";

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

  .cover {
    width: 100%;
  }


  .live {
    position: absolute;
    bottom: 0;
    right: 0;
    visibility: hidden;
  }

</style>

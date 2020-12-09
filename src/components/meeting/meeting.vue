/**
 * @page：会议模式演讲者模式
 * @author: chenzhou
 * @update: 2020.11.24
 * @desc 互动课主页面 浮窗模式 九宫格布局等
 */


<template>
  <!-- 主页面布局 -->
  <section class="meeting__wrap J_meeting" :class="{ 'preview': visibleFullscreen || visibleFullVideo }" tabindex="1">
    <fullscreen v-if="visibleFullscreen"></fullscreen>
    <!-- 会议悬浮框 -->
    <section class="meeting__container" v-else >
      <!-- 最小化 列表模式 可以切到全屏模式 模式浮窗模式 -->
      <header class="meeting__header box-between">
        <!-- 展开收起 -->
        <div></div>
        <div class="action__full box-center" @click="handleVisibleFullScreen(true)">
          <svg class="icon f28 cc8" aria-hidden="true">
            <use xlink:href="#icon20-bofangqi-quanping"></use>
          </svg>
        </div>
      </header>
      <!-- 演讲者模式 -->
      <section class='speakers__container'>
        <!-- 共享 -->
        <section class="member__container" v-show="meeting.otherscreen">
          <video class="video" id="J_screenshare" @click="handlePreviewVideo"></video>
          <div class="share-info box-between">
            <div class="share-name cfff f12" v-if="meeting.shareName">{{meeting.shareName}}的共享窗口</div>
          </div>
        </section>
        <!-- 会议成员列表 -->
        <section class="member__container mt10" v-for="member in speakers">
          <avatar :member="member"></avatar>
        </section>
      </section>
      <!-- 操作栏 -->
      <footer class="meeting__actions box-between">
        <section class="box-center" >
          <section class="actions__item line " @click="handleSetAudio">
            <div class="actions__btn box-center">
              <svg class="icon f24 ccc" aria-hidden="true">
                <use xlink:href="#icon20-yuyin" v-if="meeting.audio"></use>
                <use xlink:href="#icon20-yuyin-jingyin-01" v-else></use>
              </svg>
            </div>
            <!-- 提示信息 -->
            <p class="action-tip c666">{{ meeting.audio ? "关闭声音" : "开启声音" }}</p>
          </section>
          <section class="actions__item line" @click="handleSetVideo">
            <div class="actions__btn box-center">
              <svg class="icon f24 ccc" aria-hidden="true">
                <use xlink:href="#icon20-shipin" v-if="meeting.video"></use>
                <use xlink:href="#icon20-guanbishipin-01" v-else></use>
              </svg>
            </div>
            <!-- 提示信息 -->
            <p class="action-tip c666">{{ meeting.video ? "关闭视频" : "开启视频" }}</p>
          </section>
          <section class="actions__item" @click="handleShareScreen">
            <div class="actions__btn box-center">
              <svg class="icon f24 ccc" aria-hidden="true">
                <use xlink:href="#icon20-gongxiangpingmu" ></use>
              </svg>
            </div>
            <!-- 提示信息 -->
            <p class="action-tip c666">{{ meeting.screen ? "关闭共享" : "共享屏幕" }}</p>
          </section>
        </section>
        <section class="hangup__btn box-center" @click="handleEnd">
          <svg class="icon f20 ccc" aria-hidden="true">
            <use xlink:href="#icon20-jieshu"></use>
          </svg>
        </section>
      </footer>
    </section>

    <!-- 点击视频 大屏显示 -->
    <section class="fullscreen__video" v-if="visibleFullVideo">
      <div class="fullscreen__closed" @click="handleClosedPreviewVideo">
        <svg class="icon f24 cfff" aria-hidden="true">
          <use xlink:href="#icon16-guanbi"></use>
        </svg>
      </div>
      <section class="video__wrap box-center">
        <video class="fullscreen--video" id="J_fullvideo"></video>
      </section>
    </section>
  </section>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import avatar from './avatar-local'
import fullscreen from './fullscreen'

// 本地视频
import localMeeting from './mixin/local-meeting'
import move from './mixin/move'


export default {
  name: "meeting",
  data() {
    return {
      // 显示全屏模式
      visibleFullscreen: false,
      visibleFullVideo: false,
      //

    };
  },
  components: {
    avatar,
    fullscreen
  },
  mixins: [ localMeeting, move ],
  computed: {
    ...mapState([
      'baseInfo',
      'lesson',
    ]),

    ...mapState('meeting', [
      'user',
      // 会议状态
      'meeting',
      // 会议成员
      'speakers',
    ]),
  },
  created() {
  },
  mounted() {
    setTimeout(()=>{
      this.init();
    }, 1000)
  },
  updated() {},
  beforeDestroy() {
    window.rtcEngine && window.rtcEngine.close();
  },
  filters: {
  },
  watch: {
    visibleFullscreen(newVal) {

    },
    visibleFullVideo(newVal) {

    }
  },
  methods: {
    ...mapActions([
      'setEnableInteractive'
    ]),

    ...mapActions('meeting', [
      'setLocal',
      'setUser',
      'setSpeakers',
      'setMeeting',
    ]),

    /**
     * @method 互动课初始化
     * @params
     */
    init() {
      // 获取会议基本信息 token 房间号等
      // let { userid, avatar, userName } = this.baseInfo;
      let { id, avatar, name } = window.user;
      let { audio, video, active } = this.meeting;
      let user = {
        id: id,
        name: name,
        avatar, audio, video, active
      };

      this.setUser(user);
      this.setLocal(id);
      this.setSpeakers([]);

      // let roomId = this.lesson && this.lesson.lessonid;
      let roomId = this.lesson && this.lesson.lessonID;
      console.log('lesson:', this.lesson)
      this.initLocalMeeting(Object.assign(user, { roomId }));

      this.initEvent();
    },

    /**
     * @method 屏幕共享
     * @params
     */
    handleShareScreen(evt) {
      let meeting = this.meeting;
      meeting.screen = !meeting.screen;
      this.setMeeting(meeting);
    },

    /**
     * @method 设置音频
     * @params
     */
    handleSetAudio(evt) {
      let meeting = this.meeting;
      let audio = !meeting.audio;

      meeting.audio = audio;
      this.setMeeting(meeting);
    },

    /**
     * @method 设置视频
     * @params
     */
    handleSetVideo(evt) {
      let meeting = this.meeting;
      let video = !meeting.video;

      meeting.video = video;
      this.setMeeting(meeting);
    },

    /**
     * @method 结束互动
     * @params
     */
    handleEnd() {
      this.setEnableInteractive(false);
    },

    /**
     * @method 预览视频
     * @params
     */
    handlePreviewVideo(evt) {
      let target = evt.target || evt.srcElement;
      this.visibleFullVideo = true;

      if(target) {
        setTimeout(()=>{
          let fullVideoEl = this.$el.querySelector('#J_fullvideo');
          if(fullVideoEl) {
            fullVideoEl.srcObject = target.srcObject;

            fullVideoEl.oncanplay = () => fullVideoEl.play();
            fullVideoEl.onplay = () =>{
              fullVideoEl.play().catch((error) => console.warn('fullVideoEl.play() failed:%o', error));
            };
            fullVideoEl.play().catch((error) => console.warn('fullVideoEl.play() failed:%o', error));

            console.log('shareStream:', target.srcObject)
          }
        }, 0)
      }
    },

    /**
     * @method 关闭预览视频
     * @params
     */
    handleClosedPreviewVideo() {
      this.visibleFullVideo = false;
    },

    /**
     * @method 显示全屏模式
     * @params
     */
    handleVisibleFullScreen(visible) {
      this.visibleFullscreen = visible;

      // 处理共享
      let meeting = this.meeting;
      if(meeting.otherscreen) {
        setTimeout(()=>{
          let shareEl = document.querySelector('#J_screenshare');

          if(shareEl && window.shareStream) {
            shareEl.srcObject = window.shareStream;

            shareEl.oncanplay = () => shareEl.play();
            shareEl.onplay = () =>{
              shareEl.play().catch((error) => console.warn('shareEl.play() failed:%o', error));
            };
            shareEl.play().catch((error) => console.warn('shareEl.play() failed:%o', error));
          }
        }, 0)
      }
    },
  }
};
</script>

<style lang="scss" scoped>
  .meeting__wrap {
    z-index: 2;
    position: fixed;
    top: 45px;
    right: 24px;

    &.preview {
      // position: static;
      top: 0;
      left: 0;
      transform: translate(0, 0);

      .meeting__container {
        opacity: 0;
      }
    }
  }

  .meeting__container {
    display: flex;
    flex-flow: column;

    width: 264px;
    background: #18191A;
  }

  .meeting__header {
    padding: 0 16px;
    width: 100%;
    height: 44px;

    background: #18191A;
    cursor: move;

    .action__full {
      cursor: pointer;
      .icon {
        // color: rgba(0, 0, 0, 0.2);
      }
    }
  }

  .meeting__actions {
    padding-right: 8px;
    width: 100%;
    height: 48px;
    background: #18191A;
    border-top: 1px solid #3a3a3a;

    .actions__item {
      position: relative;
      cursor: pointer;
      width: 62px;

      &.line {
        border-right: 1px solid #ddd;
      }

      .action-tip {
        opacity: 0;
        z-index: 2;
        position: absolute;
        bottom: 25px;
        left: 50%;
        transform: translateX(-50%);

        padding: 3px 10px;
        border-radius: 2px;
        background: #eee;

        white-space: nowrap;
      }

      &:hover .action-tip {
        opacity: 1;
      }
    }

    .hangup__btn {
      position: relative;
      width: 52px;
      height: 28px;
      background: #F34848;
      cursor: pointer;
    }
  }

  .speakers__container {
    display: flex;
    flex-flow: column;

    width: 100%;
    // height: 100%;
    min-height: 124px;
    max-height: 80vh;

    overflow-y: auto;

    .member__container {
      position: relative;
      width: 264px;
      height: 170px;

      // box-shadow: 0 1px 3px rgba(0,0,0,0.5);
      // border-bottom: 1px solid #3a3a3a;

      .video {
        width: 100%;
        object-fit: cover;
      }

      .share-info {
        position: absolute;
        bottom: 0;
        left: 0;

        .share-name {
          padding: 0 3px;
          background: rgba(0, 0, 0, 0.7);
        }
      }
    }
  }


  .fullscreen__video {
    position: fixed;
    top: 0;
    left: 0;

    width: 100vw;
    height: 100vh;

    background: rgba(0,0,0,0.5);

    .fullscreen__closed {
      z-index: 1;
      position: absolute;
      top: 15px;
      right: 15px;
    }

    .video__wrap {
      width: 100%;
      height: 100%;
    }

    .fullscreen--video {
      max-height: 100%;
      max-width: 100%;
      object-fit: cover;
    }
  }

</style>
<style>
  .meeting__wrap {
    --x: 0px;
    --y: 0px;

    transform: translate(var(--x), var(--y));
  }

  .icon {
    width: 1em;
    height: 1em;
    vertical-align: -0.15em;
    fill: currentColor;
    overflow: hidden;
  }
</style>

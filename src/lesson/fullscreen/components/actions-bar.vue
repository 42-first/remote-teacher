/**
 * @page：接收器操作栏
 * @author: chenzhou
 * @update: 2020.12.24
 * @desc 默认只显示更多
 *    1、有弹幕显示弹幕开关
 *    2、有会议显示加入会议的入口
 *    3、已加入会议 居中展示
 */


<template>
  <!-- 操作栏 -->
  <section class="actions__cmp" :class="{ 'center': hasMeeting && joined }" tabindex="1">
    <section class="actions__container box-center" :class="{ 'only': !danmuStatus && !hasMeeting }">
      <!-- 会议基本操作 -->
      <section class="meeting__actions box-center" v-if="hasMeeting && joined">
        <section class="actions__item" @click="handleSetAudio">
          <div class="actions__btn box-center action__tips" :data-tips="meeting.audio ? '点击静音' : '点击解除静音'">
            <svg class="icon f28 c666" aria-hidden="true">
              <use xlink:href="#icon20-yuyin" v-if="meeting.audio"></use>
              <use xlink:href="#icon48-yuyin-jingyin" v-else></use>
            </svg>
          </div>
        </section>
        <section class="actions__item" @click="handleSetVideo">
          <div class="actions__btn box-center action__tips" :data-tips="meeting.video ? '点击关闭摄像头' : '点击开启摄像头'">
            <svg class="icon f28 c666" aria-hidden="true">
              <use xlink:href="#icon20-shipin" v-if="meeting.video"></use>
              <use xlink:href="#icon48-guanbishipin" v-else></use>
            </svg>
          </div>
        </section>
        <section class="actions__item" @click="handleShareScreen">
          <div class="actions__btn box-center">
            <svg class="icon f28 c666" aria-hidden="true">
              <use xlink:href="#icon20-gongxiangpingmu" ></use>
            </svg>
          </div>
        </section>
        <div class="line"></div>
      </section>

      <!-- 弹幕 -->
      <section class="action box-center" v-if="danmuStatus" @click="handleEnableDanmu">
        <p class="action__danmu box-center f12 cfff" :class="{ 'active': visibleDanmu }" title="弹幕">弹</p>
      </section>

      <!-- 更多 -->
      <section class="action action-tip box-center" title="更多" >
        <i class="iconfont icon--gengduocaozuo f24 c666"></i>

        <!-- 更多操作 -->
        <section class="action__more">
          <section class="action__menu box-start c333" @click="handleVisibleSubmission">
            <i class="iconfont icon-ykq_tab_tougao f20"></i>
            <p class="pl10 f14">投稿</p>
          </section>
          <!--  <section class="action__menu box-start c333" data-tip="分组">
            <i class="iconfont icon-fenzu1 f20"></i>
            <p class="pl10 f14">分组</p>
          </section> -->
        </section>
      </section>

      <!-- 会议 -->
      <template v-if="hasMeeting">
        <div class="line"></div>
        <section class="actions__item" @click="handleHangup" v-if="joined">
          <div class="actions__btn over meeting__exit box-center f12 cfff">退出互动</div>
        </section>
        <section class="action box-center join__wrap" v-else>
          <div class="meeting__join box-center" @click="handleJoin">
            <i class="iconfont icon-48-jieru f28 cfff"></i>
          </div>

          <!-- 互动加入提示 -->
          <section class="meeting__tips box-start" v-if="visibleMeetingTips">
            <div class="tips__content f16 cfff">老师开启了课堂互动快来加入吧</div>
            <p class="tips__closed box-center" @click="handleClosedTips">
              <i class="iconfont icon-guanbi1 f12 cfff"></i>
            </p>
          </section>
        </section>
      </template>

    </section>

    <!-- 弹幕直播 -->
    <danmu ref="danmu"  v-if="danmuStatus && visibleDanmu"></danmu>

  </section>
</template>

<script>
  import { mapState, mapActions } from 'vuex';
  import { isSupported } from '@/util/util'
  import danmu from './danmu-live';

  // 会议模式
  const MeetingMode = {
    // 默认 default
    DEFAULT: 0,
    // 九宫格 Jiugongge
    JIUGONGGE: 1,
    // 发言者模式
    SPEAKER: 2
  };

  export default {
    name: "actions-bar",
    data() {
      return {
        // 会议加入提示
        visibleMeetingTips: true,
      };
    },
    components: {
      danmu
    },
    mixins: [ ],
    computed: {
      ...mapState([
        'lesson',
        // 是否开启弹幕
        'danmuStatus',
        // 是否显示弹幕
        'visibleDanmu',
        // 是否有会议
        'hasMeeting',
        // 是否已进入会议
        'joined',
      ]),

      ...mapState('meeting', [
        // 会议状态
        'meeting',
        'meetingLayout',
      ]),
    },
    created() {
    },
    mounted() {
      this.init();
    },
    updated() {},
    beforeDestroy() {
    },
    filters: {
    },
    watch: {
      joined(newVal) {
        const lessonId = this.lesson && this.lesson.lessonID;

        const key = 'lesson-metting-joined'+lessonId;
        if(newVal) {
          localStorage.setItem(key, newVal)
        } else {
          localStorage.removeItem(key);

          // 修正弹幕位置
          let danmucmp = this.$refs.danmu;
          if(danmucmp) {
            danmucmp.translateContent({ x: 0, y: 0 });
          }
        }
      }
    },
    methods: {
      ...mapActions([
        'setDanmuStatus',
        'setVisibleDanmu',
        'setJoined',
      ]),

      ...mapActions('meeting', [
        'setMeeting',
        'setMeetingLayout',
      ]),

      /**
       * @method 初始化
       * @param
       */
      init() {
        let key = 'lesson-mettingtips-cloesed';
        if(isSupported(window.localStorage)) {
          let hasClosedMeetignTips = !!localStorage.getItem(key);
          if(hasClosedMeetignTips) {
            this.visibleMeetingTips = false;
          }

          // 自否自动加入会议
          setTimeout(()=>{
            this.autoJoin();
          }, 2000)
        }
      },

      /**
       * @method 是否可以自动加入
       * @param
       */
      autoJoin() {
        const lessonId = this.lesson && this.lesson.lessonID;
        const joinedKey = 'lesson-metting-joined'+lessonId;
        const joined = !!localStorage.getItem(joinedKey);
        if(joined) {
          this.handleJoin();
        }
      },

      /**
       * @method 打开投稿
       * @param
       */
      handleEnableDanmu() {
        let visibleDanmu = this.visibleDanmu;
        this.setVisibleDanmu(!visibleDanmu);
      },

      /**
       * @method 打开投稿
       * @param
       */
      handleVisibleSubmission(evt) {
        if(this.meetingLayout !== MeetingMode.DEFAULT) {
          this.setMeetingLayout(MeetingMode.DEFAULT);
        }

        this.$parent.handleVisibleSubmission();
      },

      /**
       * @method 加入会议
       * @param
       */
      handleJoin() {
        this.setJoined(true);
      },

      /**
       * @method 挂断
       * @param
       */
      handleHangup(evt) {
        let meeting = this.meeting;
        meeting.joined = false;

        this.setMeeting(meeting);

        this.setJoined(false);
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

        // todo: 没有音频权限
        if(audio && !meeting.hasAudioAuth) {
          return this;
        }

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

        // todo: 没有视频权限
        if(video && !meeting.hasVideoAuth) {
          return this;
        }

        meeting.video = video;
        this.setMeeting(meeting);
      },

      /**
       * @method 关闭会议加入提示
       * @params
       */
      handleClosedTips(evt) {
        this.visibleMeetingTips = false;

        let key = 'lesson-mettingtips-cloesed';
        if(isSupported(window.localStorage)) {
          localStorage.setItem(key, true);
        }
      }
    }
  };
</script>

<style lang="scss" scoped>
  .actions__cmp {
    z-index: 10;

    position: fixed;
    bottom: 20px;
    right: 34px;

    user-select: none;

    &.center {
      right: 50%;
      transform: translateX(50%);
    }

    outline: none;
  }

  .actions__container {
    z-index: 1;
    position: relative;
    box-sizing: border-box;

    padding: 0 15px;
    height: 52px;
    border-radius: 26px/50%;

    background: #fff;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.2);

    &.only {
      padding: 0;

      .action {
        width: 52px;
      }
    }

    .action {
      position: relative;
      width: 52px;
      height: 52px;

      cursor: pointer;

      &:hover {
        .icon--gengduocaozuo {
          color: #5096f5;
        }
      }

      &.action-tip:hover {
        &:before {
          content: '';
          position: absolute;
          bottom: 100%;

          width: 120px;
          height: 20%;
        }

        .action__more {
          display: block;
          opacity: 1;
          transition: opacity ease-in 0.35s;
        }
      }
    }

    .action__danmu {
      width: 22px;
      height: 20px;

      border-radius: 4px;

      background: #666;

      &.active {
        background: #5096f5;
      }
    }

    .meeting__join {
      width: 36px;
      height: 36px;

      border-radius: 50%;
      background: #08BC72;
    }

  }

  .line {
    margin: 0 15px;
    width: 1px;
    height: 20px;

    background: #ddd;
  }

  .action__more {
    display: none;
    opacity: 0;
    position: absolute;
    bottom: 120%;
    right: -34px;

    padding: 10px 0;
    width: 120px;

    background: #fff;
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);

    border-radius: 4px;

    transition: opacity ease-in 0.5s 0.5s;

    &:hover {
      opacity: 1;
      transition: opacity ease-in 0.35s;
    }

    .action__menu {
      padding-left: 20px;
      height: 40px;
      cursor: pointer;

      &:hover {
        background: #EDF4FE;
      }
    }

  }


  .meeting__actions {

  }

  .actions__item {
    cursor: pointer;
    position: relative;

    .actions__btn {
      position: relative;
      width: 52px;
      height: 34px;

      &.over {
        background: #F34848;
      }

      &.meeting__exit {
        width: 72px;
        border-radius: 17px;
        background: #F34848;
      }
    }

    .action__tips {
      &:hover:before {
        content: '';
        position: absolute;
        bottom: 100%;

        border: 5px solid transparent;
        border-top-color: #333;
      }

      &:hover:after {
        content: attr(data-tips);
        position: absolute;
        bottom: calc(100% + 10px);

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
  }


  .meeting__tips {
    position: absolute;
    bottom: calc(100% + 15px);
    right: -10px;

    padding: 15px 0;
    width: 220px;
    height: 77px;

    border-radius: 8px;
    background: #5096F5;
    box-shadow: 0 2px 10px rgba(80, 150, 245, 0.5);

    &:before {
      content: '';
      position: absolute;
      bottom: -18px;
      right: 27px;

      border: 9px solid transparent;
      border-top-color: #5096F5;
    }

    .tips__content {
      padding: 0 18px;
      width: 184px;

      text-align: left;

      border-right: 1px solid rgba(255, 255, 255, 0.5);
    }

    .tips__closed {
      flex: 1;
    }
  }


</style>

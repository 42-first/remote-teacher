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
          <div class="actions__btn box-center action__tips" :data-tips="meeting.audio ? $t('meeting.muteaudio') : $t('meeting.unmuteaudio')">
            <svg class="icon f28 c666" aria-hidden="true">
              <use xlink:href="#icon20-yuyin" v-if="meeting.audio"></use>
              <use xlink:href="#icon48-yuyin-jingyin" v-else></use>
            </svg>
          </div>
        </section>
        <section class="actions__item" @click="handleSetVideo">
          <div class="actions__btn box-center action__tips" :data-tips="meeting.video ? $t('meeting.mutecamera') : $t('meeting.unmutecamera')">
            <svg class="icon f28 c666" aria-hidden="true">
              <use xlink:href="#icon20-shipin" v-if="meeting.video"></use>
              <use xlink:href="#icon48-guanbishipin" v-else></use>
            </svg>
          </div>
        </section>
        <!-- 这一期 不上线 -->
        <!-- <section class="actions__item" @click="handleShareScreen">
          <div class="actions__btn box-center">
            <svg class="icon f28 c666" aria-hidden="true">
              <use xlink:href="#icon20-gongxiangpingmu" ></use>
            </svg>
          </div>
        </section> -->
        <div class="line"></div>
      </section>

      <!-- 弹幕 -->
      <section class="action box-center" v-if="danmuStatus" @click="handleEnableDanmu">
        <p class="action__danmu box-center f12 cfff" :class="{ 'active': visibleDanmu }" title="弹幕">弹</p>
      </section>

      <!-- 更多 -->
      <section class="action action-tip box-center" :title="$t('meeting.showing')" >
        <i class="iconfont icon--gengduocaozuo f24 c666"></i>

        <!-- 更多操作 -->
        <section class="action__more">
          <section class="action__menu box-start c333" @click="handleVisibleSubmission">
            <i class="iconfont icon-ykq_tab_tougao f20"></i>
            <p class="pl10 f14"><!-- 投稿 -->{{ $t('meeting.post') }}</p>
          </section>
           <section class="action__menu box-start c333" @click="handleVisibleGroup">
            <i class="iconfont icon-fenzu1 f20"></i>
            <p class="pl10 f14"><!--分组 --> {{$t('group')}}</p>
          </section>
        </section>
      </section>

      <!-- 会议 -->
      <template v-if="hasMeeting">
        <div class="line"></div>
        <section class="actions__item" @click="handleHangup" v-if="joined">
          <div class="actions__btn over meeting__exit box-center f12 cfff"><!-- 退出互动 -->{{ $t('meeting.hangup') }}</div>
        </section>
        <section class="action box-center join__wrap" v-else>
          <div class="meeting__join box-center" @click="handleJoin">
            <i class="iconfont icon-48-jieru f28 cfff"></i>
          </div>

          <!-- 互动加入提示 -->
          <section class="meeting__tips box-start" v-if="visibleMeetingTips">
            <div class="tips__content f16 cfff"><!-- 老师开启了课堂互动快来加入吧 -->{{ $t('meeting.jointips') }}</div>
            <p class="tips__closed box-center" @click="handleClosedTips">
              <i class="iconfont icon-guanbi1 f12 cfff"></i>
            </p>
          </section>
        </section>
      </template>

    </section>

    <!-- 弹幕直播 -->
    <danmu ref="danmu" v-if="danmuStatus && visibleDanmu"></danmu>

    <!-- webrtc不支持 提示框 -->
    <section class="dialog" v-if="visibleWebRTCNoSupported">
      <section class="dialog__wrap">
        <section class="dialog__content">
          <div class="f16 c666" v-html="$t('meeting.rtcnosupported')"></div>
        </section>
        <footer class="dialog__actions f14 pointer">
          <button class="actions-btn" @click="handleCancel"><!-- 取消 -->{{ $t('cancel') }}</button>
          <button class="actions-btn active" @click="handleSwitchLive"><!-- 切换到直播 -->{{ $t('meeting.switchtolive') }}</button>
        </footer>
      </section>
    </section>

  </section>
</template>

<script>
  import TRTC from 'trtc-js-sdk';
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
        // 是否支持webrtc
        isWebRTCSupported: true,
        visibleWebRTCNoSupported: false,
      };
    },
    components: {
      danmu
    },
    mixins: [ ],
    computed: {
      ...mapState([
        'lesson',
        'teacher',
        // 是否开启弹幕
        'danmuStatus',
        // 是否显示弹幕
        'visibleDanmu',
        // 是否有会议
        'hasMeeting',
        // 是否已进入会议
        'joined',
        'observerMode'
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
          localStorage.setItem(key, newVal);
        } else {
          localStorage.removeItem(key);
        }

        // 修正弹幕位置 否则可能超出视图
        let danmucmp = this.$refs.danmu;
        if(danmucmp) {
          danmucmp.translateContent({ x: 0, y: 0 });
        }
      },
      hasMeeting(newVal) {
        if(newVal) {
          this.checWebRTCSupported();
        }
      },
      isWebRTCSupported(newVal) {
        if(!newVal) {
          this.visibleWebRTCNoSupported = true;
        }
      }
    },
    methods: {
      ...mapActions([
        'setDanmuStatus',
        'setVisibleDanmu',
        'setJoined',
        'setHasMeeting',
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

        if(this.hasMeeting) {
          this.checWebRTCSupported();
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
       * @method 检测是否支持webrtc
       * @param
       */
      checWebRTCSupported() {
        // 浏览器否则支持检测
        TRTC.checkSystemRequirements().
        then(checkResult => {
          if (!checkResult.result) {
            console.log('checkResult', checkResult.result, 'checkDetail', checkResult.detail);
            // 点击之后判断当前浏览器版本是否支持RTC，不支持的话，弹窗提示用户换浏览器或进入直播模式上课
            this.isWebRTCSupported = false;
          }
        })
      },

      handleCancel() {
        this.visibleWebRTCNoSupported = false;
      },

      /**
       * @method 切换到直播
       * @param
       */
      handleSwitchLive() {
        this.setHasMeeting(false);

        setTimeout(()=>{
          this.$parent.initKwai();
          this.$parent.initEvent();
          this.handleCancel();
        }, 20)
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
        // 不能是授课老师
        const uid = window.identityId;
        const teacher = this.teacher;
        const teacherIdentityId = teacher && teacher.identityId;

        if(uid && teacherIdentityId && (uid === teacherIdentityId)) {
          const message = this.$i18n && this.$i18n.t('meeting.joinoncomputer') || '您是开课老师，请在电脑端加入互动';
          this.$toast({ type: 1, message: message, duration: 2000 });
          return this;
        }

        if(this.isWebRTCSupported) {
          this.setJoined(true);
        } else {
          this.visibleWebRTCNoSupported = true;
        }
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

        // 全员禁言中
        if(meeting.bandevice){
          const message = this.$i18n && this.$i18n.t('meeting.bannedspeaking') || '全员禁言中';
          this.$toast({ type: 1, message: message, duration: 2000 });
          return this
        }

        // todo: 没有音频权限
        if(audio && !meeting.hasAudioAuth) {
          return this;
        }

        // 处理连击问题
        if(this.audioPending) {
          return this;
        } else {
          this.audioPending = true;

          setTimeout(()=>{
            this.audioPending = false;
          }, 1000)
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

        // 处理连击问题
        if(this.videoPending) {
          return this;
        } else {
          this.videoPending = true;

          setTimeout(()=>{
            this.videoPending = false;
          }, 1000)
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
      },

      /**
       * @method 显示分组
       * @params
       */
      handleVisibleGroup(evt) {
        if(this.observerMode) {
          this.$toast({
            message: this.$i18n.t('watchmodenotintoteam') || '观看者模式下无法参与分组',
            duration: 3000
          });
          return this;
        }
        let src = '/team/student/' + this.lesson.classroomId + '?lessonid=' + this.lesson.lessonID;

        this.$router.push({ name: 'team-v3', query: { src: encodeURIComponent(src) } });
      },
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


  .dialog {
    position: fixed;
    top: 0;
    left: 0;

    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.5);

    .dialog__wrap {
      z-index: 1;
      position: absolute;
      top: 50%;
      left: 50%;

      padding: 30px 0 0;
      width: 350px;
      min-height: 222px;

      transform: translate(-50%, -50%);

      border-radius: 4px;
      box-shadow: 0 2px 4px rgba(229, 213, 213, 0.2);

      background: #fff;

      .dialog__content {
        padding: 30px 0;
        margin: 0 30px;

        border-bottom: 1px solid #ddd;
      }

      .dialog__actions {
        display: flex;
        justify-content: space-around;
        align-items: center;

        padding: 30px 50px;

        .actions-btn {
          width: 100px;
          height: 34px;

          color: #5096F5;
          border: 1px solid #5096F5;
          border-radius: 17px/50%;
          transition: all 0.35s ease-in;

          cursor: pointer;

          &:hover,
          &.active {
            color: #fff;
            background: #5096F5;
          }
        }
      }
    }
  }


</style>

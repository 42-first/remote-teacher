/**
 * @page：会议模式演讲者模式
 * @author: chenzhou
 * @update: 2020.11.24
 * @desc 互动课主页面 浮窗模式 九宫格布局等
 */


<template>
  <!-- 主页面布局 -->
  <section class="meeting__wrap J_meeting" :class="{ 'preview': meetingLayout }" tabindex="1">
    <fullscreen v-if="meetingLayout === MeetingMode.JIUGONGGE"></fullscreen>
    <speaker v-if="meetingLayout === MeetingMode.SPEAKER"></speaker>
    <!-- 会议悬浮框 -->
    <section class="meeting__container" v-else-if="meetingLayout === MeetingMode.DEFAULT" >
      <!-- 最小化 列表模式 可以切到全屏模式 模式浮窗模式 -->
      <header class="meeting__header box-between" :class="{ 'bbl': tab === 'mini' }">
        <!-- 展开收起 -->
        <div class="box-center">
          <div class="action box-center J_action action__tips" :class="{ 'active': tab === 'mini' }" @click="handleSetTab('mini')" data-tips="最小化">
            <svg class="icon f24 c666" aria-hidden="true">
              <use xlink:href="#iconyincangshipinsuolvetu2x1"></use>
            </svg>
          </div>
          <div class="action box-center pl5 J_action action__tips" :class="{ 'active': tab === 'default' }" @click="handleSetTab('default')" data-tips="展示正在发言的人">
            <svg class="icon f24 c666" aria-hidden="true">
              <use xlink:href="#iconkandanren2x"></use>
            </svg>
          </div>
        </div>
        <!-- 全屏展开 -->
        <div class="action box-center J_action" @click="setMeetingLayout(MeetingMode.JIUGONGGE)">
          <svg class="icon f28 c666" aria-hidden="true">
            <use xlink:href="#icon16-quanping1"></use>
          </svg>
        </div>
      </header>
      <!-- 浮窗模式 -->
      <section class='speakers__container box-start' v-show="tab === 'default'">
        <!-- 共享 -->
        <section class="member__container share__container" v-show="meeting.otherscreen">
          <template v-if="meetingSDK === 'local'">
            <video class="video" id="J_screenshare"></video>
          </template>
          <div class="video" id="J_screenshare" v-else></div>
          <div class="share-info box-between">
            <div class="share-name cfff box-center" v-if="meeting.shareName">
              <svg class="icon f20 blue" aria-hidden="true">
                <use xlink:href="#icon20-gongxiangpingmu"></use>
              </svg>
              <span class="pl5 f12">{{meeting.shareName}}的共享窗口</span>
            </div>
          </div>
        </section>
        <!-- 会议成员列表 -->
        <section class="member__container" :class="{ 'none': meeting.otherscreen && index > 1 || !meeting.otherscreen && index > 2 }" v-for="(member, index) in activeSpeakers" >
          <avatar :member="member" :mode="1"></avatar>
        </section>
      </section>
      <!-- 浮窗最小化 -->
      <section class="speakers__mini box-start" v-if="tab === 'mini'">
        <section class="line-scale-pulse-out" >
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </section>
        <section class="box-center f14 c333">
          <span class="pl5">正在发言:</span>
          <span class="active__names">{{ activeNames }}</span>
        </section>
      </section>
    </section>
  </section>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import avatar from './avatar-local'
// 九宫格
import fullscreen from './fullscreen'
// 演讲者
import speaker from './speaker'

import meeting from './mixin/meeting'
// 本地视频
import localMeeting from './mixin/local-meeting'
// 腾讯
import tencentMeeting from './mixin/tencent-meeting'
import move from './mixin/move'

// 会议模式
const MeetingMode = {
  // 默认 default
  DEFAULT: 0,
  // 九宫格 Jiugongge
  JIUGONGGE: 1,
  // 发言者模式
  SPEAKER: 2
};
window.MeetingMode = MeetingMode;


export default {
  name: "meeting",
  data() {
    return {
      MeetingMode,
      // 正在说话的列表 包含老师和自己
      activeSpeakers: [],
      // 浮窗操作 mini default
      tab: 'default',
    };
  },
  components: {
    avatar,
    fullscreen,
    speaker
  },
  mixins: [ meeting, localMeeting, tencentMeeting, move ],
  computed: {
    ...mapState([
      'baseInfo',
      'lesson',
      'teacher',
      // 是否已进入会议
      'joined',
    ]),

    ...mapState('meeting', [
      'local',
      'user',
      // 会议状态
      'meeting',
      // 会议成员
      'speakers',
      // SDK类型
      'meetingSDK',
      'localSharing',
      'meetingLayout',
    ]),

    activeNames() {
      let names = [];

      this.activeSpeakers.forEach((user)=>{
        if(user.audio && user.name){
          names.push(user.name);
        }
      })

      return names.join(',')
    },
  },
  created() {
  },
  mounted() {
    setTimeout(()=>{
      this.init();
    }, 0)
  },
  updated() {},
  beforeDestroy() {
    this.handleHangup();
  },
  filters: {
  },
  watch: {

  },
  methods: {
    ...mapActions([
      'setJoined',
      'setHasMeeting',
    ]),

    ...mapActions('meeting', [
      'setLocal',
      'setUser',
      'setSpeakers',
      'setMeeting',
      'setMeetingSDK',
      'setLocalSharing',
      'setMeetingLayout',
    ]),

    /**
     * @method 互动课初始化
     * @params
     */
    async init() {
      let { id, avatar, name } = window.user;
      let meeting = this.meeting;
      let { audio, video, active } = meeting;
      let uid = window.identityId || id;
      let user = {
        id: uid,
        name: name,
        avatar, audio, video, active,
        hasAudioAuth: true,
        hasVideoAuth: true,
      };

      this.setUser(user);
      this.setLocal(uid);
      this.setSpeakers([]);

      // 获取会议基本信息 token 房间号等
      let data = await this.getMeeting();
      if(data) {
        console.log('joinMeeting:', data);

        if(data.provider === 2) {
          this.setMeetingSDK('tencent');
        } else if(data.provider === 3) {
          this.setMeetingSDK('local');
        }

        // this.setMeetingSDK('local');

        // 目前如果有人在分享
        if(data.shareInfo && data.shareInfo.shareId) {
          if(uid != data.shareInfo.identityId) {
            meeting.otherscreen = true;
          }

          let shareInfo = data.shareInfo;
          shareInfo.uid = shareInfo.identityId;
        }

        this.setMeeting(Object.assign(this.meeting, data, data.shareInfo, {
          joined: true,
          audio: false,
          video: false,
          hasAudioAuth: true,
          hasVideoAuth: true,
        }));

        setTimeout(()=>{
          // 初始化视频通话SDK
          if(this.meetingSDK === 'tencent') {
            this.initTencent(this.meeting);
          } else if(this.meetingSDK === 'local') {
            let roomId = this.lesson && this.lesson.lessonID;
            this.initLocalMeeting(Object.assign(user, this.meeting, { roomId }));
          }
        }, 0)
      }

      this.initEvent();
    },

    /**
     * @method 浮窗最小化
     * @params
     */
    handleSetTab(tab) {
      this.tab = tab;
    },

    /**
     * @method 显示全屏模式
     * @params
     */
    handleVisibleFullScreen(visible) {
      this.visibleFullscreen = visible;
    },

  }
};
</script>

<style lang="scss" scoped>
  .none {
    display: none !important;
  }

  .meeting__wrap {
    z-index: 1;
    position: fixed;
    top: 45px;
    right: 34px;
    outline: none;

    &.preview {
      top: 0;
      left: 0;
      transform: translate(0, 0) !important;

      .meeting__container {
        opacity: 0;
      }
    }
  }

  .meeting__container {
    display: flex;
    flex-flow: column;

    max-width: 450px;
    background: #fff;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.2);

    &:hover {
      .meeting__header {
        height: 44px;
        transition: height ease-in 0.35s;

        > * {
          opacity: 1;
          transition: opacity ease-in 0.1s 0.35s;
        }
      }
    }
  }

  .meeting__header {
    padding: 0 16px;
    width: 100%;
    height: 0;

    cursor: move;

    transition: height ease-out 0.15s 0.5s;

    &.bbl {
      border-bottom: 1px solid #ddd;
    }

    > * {
      opacity: 0;
      transition: opacity ease-out 0.35s;
    }

    .action {
      position: relative;
      cursor: pointer;

      &.active,
      &:hover {
        .icon {
          color: #5096f5;
        }
      }
    }

    .action__tips {
      &:hover:before {
        content: '';
        position: absolute;
        bottom: 80%;

        border: 5px solid transparent;
        border-top-color: #333;
      }

      &:hover:after {
        content: attr(data-tips);
        position: absolute;
        bottom: calc(80% + 10px);

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


  .speakers__container {
    padding: 5px 0;
    width: 100%;
    max-width: 450px;
    height: 128px;

    overflow: hidden;

    .member__container {
      position: relative;
      padding: 0 3px;
      width: 150px;
      height: 118px;

      &.share__container {
        margin: 0 3px;
        padding: 0;
        background: #333;
      }

      .video {
        width: 100%;
        object-fit: cover;
      }

      .share-info {
        position: absolute;
        bottom: 0;
        left: 0;
        height: 26px;

        .share-name {
          padding: 0 3px;
          // background: rgba(0, 0, 0, 0.7);
        }
      }
    }
  }

  .speakers__mini {
    padding: 15px;
    width: 264px;
    height: 40px;

    cursor: move;

    .active__names {
      padding: 0 5px;
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

  .line-scale-pulse-out {
    font-size: 0;
  }

  .line-scale-pulse-out > div {
    background-color: #08BC72;
    margin: 0 1px;
    width: 2px;
    height: 15px;
    border-radius: 2px;
    animation-fill-mode: both;
    display: inline-block;
    animation: line-scale-pulse-out 0.9s -0.6s infinite cubic-bezier(0.85, 0.25, 0.37, 0.85);
  }
  .line-scale-pulse-out > div:nth-child(2), .line-scale-pulse-out > div:nth-child(4) {
    animation-delay: -0.4s !important;
  }
  .line-scale-pulse-out > div:nth-child(1), .line-scale-pulse-out > div:nth-child(5) {
    animation-delay: -0.2s !important;
  }

  @keyframes line-scale-pulse-out {
    0% {
      transform: scaley(1); }
    50% {
      transform: scaley(0.4); }
    100% {
      transform: scaley(1); }
  }
</style>

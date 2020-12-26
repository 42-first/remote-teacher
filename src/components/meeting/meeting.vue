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
    <!-- 会议悬浮框 -->
    <section class="meeting__container" v-else-if="meetingLayout === MeetingMode.DEFAULT" >
      <!-- 最小化 列表模式 可以切到全屏模式 模式浮窗模式 -->
      <header class="meeting__header box-between">
        <!-- 展开收起 -->
        <div></div>
        <div class="action__full box-center" @click="setMeetingLayout(MeetingMode.JIUGONGGE)">
          <svg class="icon f28 c666" aria-hidden="true">
            <use xlink:href="#icon20-bofangqi-quanping"></use>
          </svg>
        </div>
      </header>
      <!-- 浮窗模式 -->
      <section class='speakers__container box-start'>
        <!-- 共享 -->
        <section class="member__container" v-show="meeting.otherscreen">
          <template v-if="meetingSDK === 'local'">
            <video class="video" id="J_screenshare"></video>
          </template>
          <div class="video" id="J_screenshare" v-else></div>
          <div class="share-info box-between">
            <div class="share-name cfff f12" v-if="meeting.shareName">{{meeting.shareName}}的共享窗口</div>
          </div>
        </section>
        <!-- 会议成员列表 -->
        <section class="member__container " v-for="member in activeSpeakers">
          <avatar :member="member" :mode="1"></avatar>
        </section>
      </section>
      <!-- 浮窗最小化 -->
    </section>
  </section>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import avatar from './avatar-local'
import fullscreen from './fullscreen'

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



export default {
  name: "meeting",
  data() {
    return {
      MeetingMode,
      // 正在说话的列表 包含老师和自己
      activeSpeakers: [],
    };
  },
  components: {
    avatar,
    fullscreen
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
    if(this.meetingSDK === 'tencent') {
      this.exitRoomTencent();
    } else if(this.meetingSDK === 'local') {
      window.rtcEngine && window.rtcEngine.close();
    }
  },
  filters: {
  },
  watch: {

  },
  methods: {
    ...mapActions([
      'setJoined',
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
        avatar, audio, video, active
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

        // 目前如果有人在分享
        if(data.shareInfo && data.shareInfo.shareId) {
          meeting.otherscreen = true;
          let shareInfo = data.shareInfo;
          shareInfo.uid = shareInfo.identityId;
        }

        this.setMeeting(Object.assign(this.meeting, data, { joined: true }));

        setTimeout(()=>{
          // 初始化视频通话SDK
          if(this.meetingSDK === 'tencent') {
            this.initTencent(this.meeting);
          } else if(this.meetingSDK === 'local'){
            let roomId = this.lesson && this.lesson.lessonID;
            this.initLocalMeeting(Object.assign(user, this.meeting, { roomId }));
          }
        }, 0)
      }

      this.initEvent();
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
  .meeting__wrap {
    z-index: 1;
    position: fixed;
    top: 45px;
    right: 34px;

    &.preview {
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

    max-width: 450px;
    background: #fff;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.2);

    &:hover {
      .meeting__header {
        display: flex;
      }
    }
  }

  .meeting__header {
    display: none;
    padding: 0 16px;
    width: 100%;
    height: 44px;

    // background: #18191A;
    cursor: move;

    .action__full {
      cursor: pointer;
    }
  }


  .speakers__container {
    width: 100%;
    max-width: 450px;
    height: 150px;

    overflow: hidden;

    .member__container {
      position: relative;
      padding: 0 3px;
      width: 150px;
      height: 150px;

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

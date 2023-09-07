/**
 * @author [tuqiushuang]
 * @email [tuqiushuang@xuetangx.com]
 * @create date 2023-08-08 11:01:06
 * @modify date 2023-08-08 11:01:06
 * @desc [直播连麦]
 */

<template>
  <!-- 主页面布局 -->
  <section class="meeting__wrap J_meeting" >
    <!-- 会议悬浮框 -->
    <section class="meeting__container" v-if="kmeeting.status == 3">
      <!-- 最小化 列表模式 可以切到全屏模式 模式浮窗模式 -->
      <header class="meeting__header box-between" :class="{ 'bbl': tab === 'mini' }">
        <!-- 展开收起 -->
        <div class="box-center">
          <div class="action box-center J_action action__tips" :class="{ 'active': tab === 'mini' }" @click="handleSetTab('mini')" :data-tips="$t('meeting.minimize')">
            <svg class="icon f24 c666" aria-hidden="true">
              <use xlink:href="#iconyincangshipinsuolvetu2x1"></use>
            </svg>
          </div>
          <div class="action box-center pl5 J_action action__tips" :class="{ 'active': tab === 'default' }" @click="handleSetTab('default')" :data-tips="$t('meeting.unfoldspeaker')">
            <svg class="icon f24 c666" aria-hidden="true">
              <use xlink:href="#iconkandanren2x"></use>
            </svg>
          </div>
        </div>
      </header>
      <!-- 浮窗模式 -->
      <section class='speakers__container box-start' v-show="tab === 'default'">
        <!-- 共享 -->
        <section class="member__container share__container" v-show="kmeeting.otherscreen">
          <div class="video" id="J_screenshare"></div>
          <div class="share-info box-between">
            <div class="share-name cfff box-center" v-if="kmeeting.shareName">
              <svg class="icon f20 blue" aria-hidden="true">
                <use xlink:href="#icon20-gongxiangpingmu"></use>
              </svg>
              <span class="name pl5 f12 ellipsis">{{ $t('meeting.screenshare', { name: kmeeting.shareName }) }}</span>
            </div>
          </div>
        </section>
        <!-- 会议成员列表 -->
        <section class="member__container" v-for="(member, index) in activeSpeakers.slice(0, 3)" v-if="activeSpeakers && activeSpeakers.length" :key="member.id">
          <avatar :member="member" :mode="1" v-if="!subscribeLoading"></avatar>
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
          <span class="pl5"><!-- 正在发言 -->{{ $t('meeting.speaking') }}:</span>
          <span class="active__names ellipsis">{{ activeNames }}</span>
        </section>
      </section>
    </section>
  </section>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import avatar from './avatar-local'

import meeting from './mixin/kmeeting'
import move from './mixin/move'
// 上报打点
// import report from './mixin/report'



export default {
  name: "meeting",
  data() {
    return {
      tab: 'default',
    };
  },
  components: {
    avatar,
  },
  props: {
    liveType: Number
  },
  mixins: [ meeting, move ],
  computed: {
    ...mapState([
      'baseInfo',
      'lesson',
      'teacher',
      // 是否已进入会议
      'joined',
      'observerMode',
    ]),

    ...mapState('kmeeting', [
      'local',
      'user',
      // 会议状态
      'kmeeting',
      // 会议成员
      'speakers',
      // 正在说话的列表 包含老师和自己
      'activeSpeakers',
      // SDK类型
      'meetingSDK',
      'localSharing',
      'meetingLayout',
      'subscribeLoading',
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
    // this.handleHangup();
    this.stop()
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

    ...mapActions('kmeeting', [
      'setLocal',
      'setUser',
      'setSpeakers',
      'setKMeeting',
      'setMeetingSDK',
      'setLocalSharing',
      'setMeetingLayout',
      'setSubscribeLoading',
      'setActiveSpeakers',
    ]),

    /**
     * @method 互动课初始化
     * @params
     */
    async init() {
      let { id, avatar, name } = window.user;
      let meeting = this.kmeeting;
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
        setTimeout(()=>{
          // 初始化视频通话SDK
          this.initMeeting(data)
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

    getMeeting() {
      let URL = API.lesson.get_live_params
      return request.get(URL)
        .then(res => {
          if(res && res.code == 0) {
            return res.data
          }
        })
    },

    updateVCUsersInfo(users){
      let speakers = this.speakers
      speakers.forEach(item => {
        let userInfo = users.find(user => user.uid == item.id)
        if(userInfo) {
          item.avatar = userInfo.avatar
          item.name = userInfo.name
        }
      })

      this.setSpeakers(speakers)
    }

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
        height: 100%;
      }

      .share-info {
        position: absolute;
        bottom: 0;
        left: 0;
        height: 26px;

        .share-name {
          padding: 0 3px;

          .name {
            flex: 1;
          }
        }
      }
    }
  }

  .speakers__mini {
    padding: 15px;
    width: 264px;
    height: 40px;

    cursor: move;

    .line-scale-pulse-out {
      min-width: 20px;
    }

    .active__names {
      padding: 0 5px;
      flex: 1;
      max-width: 140px;
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

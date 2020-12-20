/**
 * @page：会议全屏模式
 * @author: chenzhou
 * @update: 2020.12.09
 * @desc 九宫格布局 本地音频控制 视频控制 共享 结束互动 后续设配检测
 */


<template>
  <!-- 会议全屏布局 -->
  <section class="fullscreen__cmp box-center">
    <!-- header -->
    <section class="fullscreen__header box-between">
      <div></div>
      <div class="action__back box-center" @click="handleVisibleFullScreen(false)">
        <svg class="icon f28 cc8" aria-hidden="true">
          <use xlink:href="#icon20-bofangqi-quanping"></use>
        </svg>
      </div>
    </section>

    <!-- 会议成员列表 -->
    <section class="members__container box-center">
      <section class="members__list box-center">
         <!-- 共享 -->
        <section class="member__wrap" :class="{ 'preview': visibleLargeScreen }" v-show="meeting.otherscreen">
          <div class="member__container box-center" @click="handlePreviewVideo">
            <!-- <video class="video" id="J_screenshare"></video> -->
            <template v-if="meetingSDK === 'local'">
              <video class="video" id="J_screenshare"></video>
            </template>
            <div class="video" id="J_screenshare" v-else></div>
            <div class="share-info box-between">
              <div class="share-name cfff f12" v-if="meeting.shareName">{{meeting.shareName}}的共享窗口</div>
            </div>
          </div>
        </section>
        <!-- 成员 -->
        <div class="member__wrap" v-for="member in speakers">
          <div class="member__container">
            <avatar :member="member" :fullscreen="true"></avatar>
          </div>
        </div>
      </section>
    </section>

    <!-- 会议基本操作 -->
    <actions></actions>
  </section>
</template>

<script>
import { mapState, mapActions } from 'vuex';

import avatar from './avatar-local'
import actions from './actions'

export default {
  name: "meeting-fullscreen",
  data() {
    return {
      visibleLargeScreen: false
    };
  },
  components: {
    avatar,
    actions
  },
  mixins: [ ],
  computed: {
    ...mapState('meeting', [
      // 会议状态
      'meeting',
      // 会议成员
      'speakers',
      'meetingSDK',
    ]),
  },
  created() {
  },
  mounted() {
    setTimeout(()=>{
      // this.init();
    }, 1000)
  },
  updated() {},
  beforeDestroy() {
  },
  filters: {
  },
  watch: {
    // 我自己开启了屏幕共享
    'meeting.otherscreen'(newVal, oldVal) {
    },
  },
  methods: {
    ...mapActions('meeting', [
      'setMeeting',
    ]),

    /**
     * @method 退出大屏
     * @params
     */
    handleVisibleFullScreen() {
      this.$parent.handleVisibleFullScreen(false);
    },

    handlePreviewVideo() {
      this.visibleLargeScreen = !this.visibleLargeScreen;
    },

  }
};
</script>

<style lang="scss" scoped>
  .fullscreen__cmp {
    position: fixed;
    top: 0;
    left: 0;

    flex-flow: column;

    width: 100vw;
    height: 100vh;

    background: #202022;
  }

  .fullscreen__header {
    padding: 0 20px;
    width: 100%;
    height: 44px;

    background: #18191A;

    .action__back {
      cursor: pointer;
    }
  }

  .members__container {
    flex: 1;

    padding: 0 90px;
    width: 100%;
    max-height: calc(100vw - 44px);
  }

  .members__list {
    position: relative;
    width: 100%;
    height: 100%;

    flex-wrap: wrap;
    align-content: center;
    justify-content: flex-start;
    // align-items: flex-start;

    .member__wrap {
      padding: 10px;
      width: 33.33%;
      height: 33.33%;

      &.preview {
        z-index: 1;
        position: absolute;
        top: 0;
        left: 0;

        width: 100%;
        height: 100%;
        height: fit-content;
      }
    }

    .member__container {
      position: relative;
      width: 100%;
      height: 100%;
      background: #4a4a4a;
      overflow: hidden;

      .video {
        width: 100%;
        // object-fit: cover;
        object-fit: contain;
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

  .actions__wrap {
    position: fixed;
    bottom: 10px;
    left: 0;
    right: 0;

    margin: 0 auto;
    padding: 0 50px;
    width: 350px;
    height: 80px;
    outline: none;

    display: flex;

    background: rgba(0,0,0, 0.8);
    box-shadow: 0 5px 20px rgba(2,2,2,0.47);
    border: 1px solid #000;
    border-radius: 40px/50%;
  }

  .line {
    margin: 0 10px;
    width: 1px;
    height: 30px;

    background: #414141;
  }

  .actions__item {
    cursor: pointer;
    position: relative;
    padding: 8px 10px 0;

    &:hover {
      .actions__more {
        display: flex;
      }
      .media__setting {
        display: block;
      }
    }

    .actions__btn {
      width: 64px;
      height: 34px;

      border-radius: 17px/50%;
      background: rgba(255, 255, 255, 0.08);

      &.over {
        background: #F34848;
      }
    }
  }
</style>

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
          <div class="actions__btn box-center">
            <svg class="icon f28 c666" aria-hidden="true">
              <use xlink:href="#icon20-yuyin" v-if="meeting.audio"></use>
              <use xlink:href="#icon20-yuyin-jingyin-01" v-else></use>
            </svg>
          </div>
        </section>
        <section class="actions__item" @click="handleSetVideo">
          <div class="actions__btn box-center">
            <svg class="icon f28 c666" aria-hidden="true">
              <use xlink:href="#icon20-shipin" v-if="meeting.video"></use>
              <use xlink:href="#icon20-guanbishipin-01" v-else></use>
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
        <i class="iconfont icon--gengduocaozuo f24 blue"></i>

        <!-- 更多操作 -->
        <section class="action__more">
          <section class="action__menu box-start c333" @click="handleVisibleSubmission">
            <i class="iconfont icon-ykq_tab_tougao f20"></i>
            <p class="pl10 f14">投稿</p>
          </section>
          <section class="action__menu box-start c333" data-tip="分组">
            <i class="iconfont icon-fenzu1 f20"></i>
            <p class="pl10 f14">分组</p>
          </section>
        </section>
      </section>

      <!-- 会议 -->
      <template v-if="hasMeeting">
        <div class="line"></div>
        <section class="actions__item" @click="handleHangup" v-if="joined">
          <div class="actions__btn over meeting__exit box-center f12 cfff">退出互动</div>
        </section>
        <section class="action box-center join__wrap" @click="handleJoin" v-else>
          <div class="meeting__join box-center" >
            <i class="iconfont icon-48-jieru f28 cfff"></i>
          </div>
        </section>
      </template>

    </section>

    <!-- 弹幕直播 -->
    <danmu v-if="danmuStatus && visibleDanmu"></danmu>

  </section>
</template>

<script>
  import { mapState, mapActions } from 'vuex';

  import danmu from './danmu-live';

  export default {
    name: "actions-bar",
    data() {
      return {
        // 默认是控制
        actions: [],
      };
    },
    components: {
      danmu
    },
    mixins: [ ],
    computed: {
      ...mapState([
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
      ]),
    },
    created() {
    },
    mounted() {
    },
    updated() {},
    beforeDestroy() {
    },
    filters: {
    },
    watch: {
      danmuStatus(newVal) {
        if(newVal) {

        }
      },
      hasMeeting(newVal) {

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
      ]),

      /**
       * @method 初始化
       * @param
       */
      init() {
        if(this.danmuStatus) {
          this.actions.push({ name: 'danmu', status: this.visibleDanmu })
        }

        if(this.hasMeeting) {
          this.actions.push({ name: 'meeting', status: this.joined })
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
        // todo: 暂时兼容下
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
    }
  };
</script>

<style lang="scss" scoped>
  .actions__cmp {
    z-index: 10;

    position: fixed;
    bottom: 20px;
    right: 34px;

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
    right: 0;

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
      width: 52px;
      height: 34px;

      &.over {
        background: #F34848;
      }

      &.meeting__exit {
        width: 64px;
        border-radius: 17px;
        background: #F34848;
      }
    }
  }
</style>

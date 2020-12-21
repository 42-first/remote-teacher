/**
 * @page：会议模式操作栏
 * @author: chenzhou
 * @update: 2020.12.02
 * @desc 音频控制 视频控制 共享 结束互动 后续设配检测
 */


<template>
  <!-- 操作栏 -->
  <section class="meeting__actions" tabindex="1">
    <section class="box-center" >
      <section class="actions__item" @click="handleSetAudio">
        <div class="actions__btn box-center">
          <svg class="icon f28 cfff" aria-hidden="true">
            <use xlink:href="#icon20-yuyin" v-if="meeting.audio"></use>
            <use xlink:href="#icon20-yuyin-jingyin-01" v-else></use>
          </svg>
        </div>
        <p class="pt5 f12 c7a">静音</p>
      </section>
      <section class="actions__item" @click="handleSetVideo">
        <div class="actions__btn box-center">
          <svg class="icon f28 cfff" aria-hidden="true">
            <use xlink:href="#icon20-shipin" v-if="meeting.video"></use>
            <use xlink:href="#icon20-guanbishipin-01" v-else></use>
          </svg>
        </div>
        <p class="pt5 f12 c7a">开启摄像头</p>
      </section>
      <section class="actions__item" @click="handleShareScreen">
        <div class="actions__btn box-center">
          <svg class="icon f28 cfff" aria-hidden="true">
            <use xlink:href="#icon20-gongxiangpingmu" ></use>
          </svg>
        </div>
        <p class="pt5 f12 c7a">{{ meeting.screen ? "结束共享" : "共享屏幕" }}</p>
      </section>
      <div class="line"></div>
      <!-- <section class="actions__item" @click="handleShareScreen">
        <div class="actions__btn box-center">
          <svg class="icon f28 cfff" aria-hidden="true">
            <use xlink:href="#icon32-chengyuan1" ></use>
          </svg>
        </div>
        <p class="pt5 f12 c7a">全员静音</p>
      </section> -->
      <div class="line"></div>
      <section class="actions__item" @click="handleHangup">
        <div class="actions__btn over box-center">
          <svg class="icon f28 cfff" aria-hidden="true">
            <use xlink:href="#icon20-jieshu" ></use>
          </svg>
        </div>
        <p class="pt5 f12 c7a">结束互动</p>
      </section>
    </section>
  </section>
</template>

<script>
import { mapState, mapActions } from 'vuex';

export default {
  name: "meeting-actions",
  data() {
    return {
      // 会议状态
    };
  },
  components: {
  },
  mixins: [ ],
  computed: {
    ...mapState('meeting', [
      // 会议状态
      'meeting',
      // 会议成员
      'speakers',
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
  },
  methods: {
    ...mapActions('meeting', [
      'setMeeting',
    ]),

    /**
     * @method 挂断
     * @param
     */
    handleHangup(evt) {
      let meeting = this.meeting;
      meeting.joined = false;

      this.setMeeting(meeting);
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
  .meeting__actions {
    z-index: 2;
    position: absolute;
    bottom: 10px;

    margin: 0 auto;
    padding: 0 50px;
    // width: 549px;
    height: 80px;
    outline: none;

    display: flex;

    background: rgba(0,0,0, 0.8);
    box-shadow: 0 5px 20px rgba(2,2,2,0.47);
    border: 1px solid #000;
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

    .actions__btn {
      width: 64px;
      height: 34px;

      &.over {
        background: #F34848;
      }
    }
  }
</style>

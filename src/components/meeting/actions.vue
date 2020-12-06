/**
 * @page：会议模式操作栏
 * @author: chenzhou
 * @update: 2020.12.02
 * @desc 音频控制 视频控制 共享 结束互动 后续设配检测
 */


<template>
  <!-- 操作栏 -->
  <section class="actions__wrap" tabindex="1">
    <section class="box-center" >
      <section class="actions__item" @click="handleSetAudio">
        <div class="actions__btn box-center">
          <svg class="icon f20 cfff" aria-hidden="true">
            <use xlink:href="#icon20-yuyin" v-if="meeting.audio"></use>
            <use xlink:href="#icon20-yuyin-jingyin-01" v-else></use>
          </svg>
        </div>
        <p class="pt5 f12 cfff">静音</p>
      </section>
      <section class="actions__item" @click="handleSetVideo">
        <div class="actions__btn box-center">
          <svg class="icon f20 cfff" aria-hidden="true">
            <use xlink:href="#icon20-shipin" v-if="meeting.video"></use>
            <use xlink:href="#icon20-guanbishipin-01" v-else></use>
          </svg>
        </div>
        <p class="pt5 f12 cfff">开启摄像头</p>
      </section>
      <section class="actions__item" @click="handleShareScreen">
        <div class="actions__btn box-center">
          <svg class="icon f20 cfff" aria-hidden="true">
            <use xlink:href="#icon20-gongxiangpingmu" ></use>
          </svg>
        </div>
        <p class="pt5 f12 cfff">{{ meeting.screen ? "结束共享" : "共享屏幕" }}</p>
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
    setTimeout(()=>{
      this.init();
    }, 1000)
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

<style>
  .icon {
    width: 1em;
    height: 1em;
    vertical-align: -0.15em;
    fill: currentColor;
    overflow: hidden;
  }
</style>
<style lang="scss" scoped>
  .f12 {
    font-size: 12px;
  }
  .cfff {
    color: #fff;
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

      &.join {
        background: #08BC72;
      }
    }

    .media__setting {
      display: none;
      position: absolute;
      bottom: 88px;
      left: 50%;
      transform: translateX(-50%);

      width: 160px;
      padding: 0 10px;
      border-radius: 4px;
      background: rgba(0,0,0,.8);
      border: 1px solid #000;
      box-shadow: 0 5px 20px 0 rgba(2,2,2,0.47);
      color: #DDDDDD;

      .setting_item {
        padding: 5px 0;
        text-align: left;
        &:not(:last-of-type) {
          border-bottom: 1px solid #414141;
        }
        .label {
          line-height: 17px;
        }
        .item {
          height: 32px;
          .text {
            width: 120px;
            text-overflow: ellipsis;
            white-space: nowrap;
            overflow: hidden;
          }
        }
      }

      &::after {
        content: "";
        position: absolute;
        bottom: -50px;
        left: 0;

        height: 60px;
        width: 160px;
      }

    }
  }
</style>

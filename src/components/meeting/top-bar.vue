/**
 * @page：会议全屏顶部操作栏
 * @author: chenzhou
 * @update: 2020.12.26
 * @desc 布局切换
 */


<template>
  <!-- header -->
  <section class="top-bar__container box-between">
    <div></div>
    <section class="box-center">
      <div class="action box-center" :class="{ 'active': meetingLayout === MeetingMode.SPEAKER }" @click="setMeetingLayout(MeetingMode.SPEAKER)">
        <svg class="icon f28 c666" aria-hidden="true">
          <use xlink:href="#icon20-ketanggongneng1"></use>
        </svg>
      </div>
      <div class="action box-center" :class="{ 'active': meetingLayout === MeetingMode.JIUGONGGE }" @click="setMeetingLayout(MeetingMode.JIUGONGGE)">
        <svg class="icon f28 c666" aria-hidden="true">
          <use xlink:href="#icon20-ketanggongneng1"></use>
        </svg>
      </div>
      <div class="line"></div>
      <div class="action box-center" @click="setMeetingLayout(MeetingMode.DEFAULT)">
        <svg class="icon f28 c666" aria-hidden="true">
          <use xlink:href="#icon20-bofangqi-quanping"></use>
        </svg>
      </div>
    </section>
  </section>
</template>

<script>
import { mapState, mapActions } from 'vuex';

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
  name: "meeting-top-bar",
  data() {
    return {
      MeetingMode,
    };
  },
  mixins: [ ],
  computed: {
    ...mapState('meeting', [
      // 会议状态
      'meeting',
      'meetingSDK',
      'meetingLayout',
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
      'setMeetingLayout',
    ]),

  }
};
</script>

<style lang="scss" scoped>
  .top-bar__container {
    padding: 0 20px;
    width: 100%;
    height: 44px;

    background: #fff;

    .action {
      width: 45px;
      cursor: pointer;

      &.active {
        .icon {
          color: #5096F5;
        }
      }
    }
  }

  .line {
    margin: 0 15px;
    width: 1px;
    height: 20px;

    background: #ddd;
  }


</style>

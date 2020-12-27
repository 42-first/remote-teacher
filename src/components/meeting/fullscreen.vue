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
    <topbar></topbar>

    <!-- 会议成员列表 -->
    <section class="members__container box-center">
      <!-- 上一页 -->
      <section class="actions__left" v-if="totalPage>1">
        <section class="action__wrap action__pages box-center cfff">
          <div>
            <span class="f24 bold">{{page}}</span><span class="f12">/{{totalPage}}</span>
          </div>
        </section>
        <section class="action__wrap box-center mt20" :class="{ 'disable': page === 1 }" @click="handlePrev">
          <svg class="icon f40 cfff" aria-hidden="true">
            <use xlink:href="#icon16-zuo"></use>
          </svg>
        </section>
      </section>

      <section class="members__list box-center">
        <!-- 共享 -->
        <section class="member__wrap" :class="{ 'preview': visibleLargeScreen }" v-show="meeting.otherscreen">
          <div class="member__container box-center share" @click="handlePreviewVideo">
            <template v-if="meetingSDK === 'local'">
              <video class="video" id="J_screenshare"></video>
            </template>
            <div class="video" id="J_screenshare" v-else></div>
            <div class="share-info">
              <div class="share-name cfff box-center" v-if="meeting.shareName">
                <svg class="icon f20 cfff" aria-hidden="true">
                  <use xlink:href="#icon20-gongxiangpingmu"></use>
                </svg>
                <span class="pl5 f12">{{meeting.shareName}}的共享窗口</span>
              </div>
            </div>
          </div>
        </section>
        <!-- 成员 -->
        <div class="member__wrap" :class="{ 'half' : members.length < 3 }" v-for="member in members">
          <div class="member__container">
            <avatar :member="member" :fullscreen="true"></avatar>
          </div>
        </div>
      </section>

      <!-- 下一页 -->
      <section class="actions__right" v-if="totalPage>1">
        <section class="action__wrap box-center" :class="{ 'disable': page === totalPage }" @click="handleNext">
          <svg class="icon f40 cfff" aria-hidden="true">
            <use xlink:href="#icon16-you"></use>
          </svg>
        </section>
      </section>
    </section>

  </section>
</template>

<script>
import { mapState, mapActions } from 'vuex';

import topbar from './top-bar'
import avatar from './avatar-local'


export default {
  name: "meeting-fullscreen",
  data() {
    return {
      visibleLargeScreen: false,
      // 当前页显示的成员列表
      members: [],
      // 分页
      totalCount: 1,
      totalPage: 1,
      page: 1,
      pageSize: 9,
    };
  },
  components: {
    topbar,
    avatar
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
    this.init();
  },
  updated() {},
  beforeDestroy() {
  },
  filters: {
  },
  watch: {
    'speakers'(newVal, oldVal) {
      if(newVal && newVal.length) {
        this.initPages();
      }
    },
  },
  methods: {
    ...mapActions('meeting', [
      'setMeeting',
      'setMeetingLayout',
    ]),

    init() {
      this.initPages();
      this.getMembers(this.page);
    },

    initPages() {
      const speakers = this.speakers;
      if(speakers && speakers.length) {
        this.totalCount = speakers.length;
        this.totalPage = Math.ceil(this.totalCount/this.pageSize);
      }
    },

    /**
     * @method 当前页成员列表
     * @params
     */
    getMembers(page) {
      page = page || this.page;
      const pageSize = this.pageSize;
      let start = (page - 1) * pageSize;
      let end = start + pageSize;
      let speakers = this.speakers;

      if(start < speakers.length) {
        this.members = speakers.slice(start, end);
        this.page = page;

        console.log('getMembers', page, this.members);
      }
    },

    /**
     * @method 下一页
     * @params
     */
    handleNext(evt) {
      let page = this.page;
      if(page < this.totalPage) {
        this.getMembers(page+1);

        console.log('handleNext');
      }
    },

    /**
     * @method 上一页
     * @params
     */
    handlePrev(evt) {
      let page = this.page;
      if(page > 1) {
        this.getMembers(page-1);
        console.log('handlePrev');
      }
    },

    /**
     * @method 预览
     * @params
     */
    handlePreviewVideo() {
      this.visibleLargeScreen = !this.visibleLargeScreen;
    },

  }
};
</script>

<style lang="scss" scoped>
  .mt20 {
    margin-top: 20px;
  }

  .fullscreen__cmp {
    position: fixed;
    top: 0;
    left: 0;

    flex-flow: column;

    width: 100vw;
    height: 100vh;

    background: #F8F8F8;
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

      &.half {
        width: 50%;
        height: 50%;
      }

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

      &.share {
        border-radius: 4px;
      }

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
          padding: 0 5px;
          background: rgba(0, 0, 0, 0.7);
        }
      }
    }
  }


  .actions__left,
  .actions__right {
    position: absolute;
    top: 50%;

    transform: translateY(-50%);

    .action__wrap {
      width: 50px;
      height: 100px;
      background: rgba(0,0,0,0.2);

      &:hover {
        background: rgba(0,0,0,0.7);
      }

      cursor: pointer;

      &.disable {
        .icon {
          color: #999;
        }
      }
    }

    .action__pages {
      font-family: din;
      // background: rgba(0,0,0,0.2);
    }
  }

  .actions__left {
    left: 0;
  }

  .actions__right {
    right: 0;
  }


</style>

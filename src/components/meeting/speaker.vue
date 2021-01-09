/**
 * @page：会议演讲者模式
 * @author: chenzhou
 * @update: 2020.12.26
 * @desc
 */


<template>
  <!-- 演讲者模式 -->
  <section class="speaker__cmp box-center">
    <!-- header -->
    <topbar></topbar>

    <!-- 会议成员列表 -->
    <section class="members__container box-center">
      <!-- 演讲者主视图区 -->
      <section class="speaker__container box-center">
        <!-- 共享 -->
        <section class="speaker__wrap box-center" v-show="meeting.otherscreen" >
          <div class="video__wrap box-center">
            <video class="video" id="J_screenshare" v-if="meetingSDK === 'local'"></video>
            <div class="video" id="J_screenshare" v-else></div>

            <div class="share-info">
              <div class="share-name cfff f12 box-center" v-if="meeting.shareName">
                <svg class="icon f20 blue" aria-hidden="true">
                  <use xlink:href="#icon20-gongxiangpingmu" ></use>
                </svg>
                <span class="pl5">{{meeting.shareName}}的共享窗口</span>
              </div>
            </div>
          </div>
        </section>
        <!-- 如果没有共享屏幕就展示老师 -->
        <section class="speaker__wrap box-center" v-if="!meeting.otherscreen">
          <avatar :member="activeStream"></avatar>
        </section>
      </section>

      <!-- 收起 -->
      <section class="members__closed box-center" @click="handleFold">
        <svg class="icon f24 cfff" :class="{ 'fold' : fold }" aria-hidden="true">
          <use xlink:href="#icon16-xiaojiantou-shang"></use>
        </svg>
      </section>

      <section class="members__list" v-show="!fold">
        <!-- 成员 -->
        <div class="member__wrap" v-for="member in members" >
          <div class="member__container">
            <avatar :member="member"></avatar>
          </div>
        </div>
      </section>

    </section>

  </section>
</template>

<script>
import { mapState, mapActions } from 'vuex';

import topbar from './top-bar'
import avatar from './avatar-local'


export default {
  name: "meeting-speaker",
  data() {
    return {
      // 当前页显示的成员列表
      members: [],
      activeStream: null,
      // 分页
      totalCount: 1,
      totalPage: 1,
      page: 1,
      pageSize: 5,

      // 右侧列表收起
      fold: false
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
        this.getMembers(this.page);
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

        this.activeStream = speakers.find((user)=>{
          return user.role === 'lecturer';
        })
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
     * @method 收起
     * @params
     */
    handleFold() {
      this.fold = !this.fold;
    },

  }
};
</script>

<style lang="scss" scoped>
  .mt20 {
    margin-top: 20px;
  }

  .speaker__cmp {
    position: fixed;
    top: 0;
    left: 0;

    flex-flow: column;

    width: 100vw;
    height: 100vh;

    background: #F8F8F8;
  }

  .members__container {
    position: relative;
    flex: 1;

    width: 100%;
    max-height: calc(100vw - 44px);
    overflow: hidden;
  }

  .speaker__container {
    flex: 1;
    height: 100%;
  }

  .speaker__wrap {
    position: relative;
    padding: 10px;
    width: 100%;
    height: 100%;

    .video__wrap {
      position: relative;
      width: 100%;
      max-height: calc(100% - 20px);
    }

    .video {
      width: 100%;
      max-height: calc(100% - 20px);
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

  .members__list {
    position: relative;
    width: 264px;
    max-height: calc(100vw - 44px);

    flex-flow: column;
    align-content: center;

    overflow-y: auto;

    .member__wrap {
      padding: 3px 0 0 0;
      width: 264px;
      height: 180px;
    }

    .member__container {
      position: relative;
      width: 100%;
      height: 100%;
      overflow: hidden;
    }

  }

  .members__closed {
    width: 20px;
    height: 100px;

    border-radius: 17px 0 0 17px;
    background: #C8C8C8;

    cursor: pointer;

    &:hover {
      background: rgba(0,0,0,0.7);
    }

    .icon {
      transform: rotate(90deg);

      &.fold {
        transform: rotate(-90deg);
      }
    }
  }


</style>

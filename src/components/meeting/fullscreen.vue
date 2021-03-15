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
      <section class="actions__left" v-show="totalPage>1">
        <section class="action__wrap action__pages box-center cfff">
          <div>
            <span class="f24 bold">{{page}}</span><span class="f12">/{{totalPage}}</span>
          </div>
        </section>
        <section class="action__wrap action__prev box-center" :class="{ 'disable': page === 1 }" @click="handlePrev">
          <svg class="icon f40 cfff" aria-hidden="true">
            <use xlink:href="#icon16-zuo"></use>
          </svg>
        </section>
      </section>

      <section class="members__list box-center">
        <!-- 共享 -->
        <section class="member__wrap" v-show="meeting.otherscreen">
          <div class="member__container box-center share">
            <template v-if="meetingSDK === 'local'">
              <video class="video" id="J_screenshare"></video>
            </template>
            <div class="video" id="J_screenshare" v-else></div>
            <div class="share-info">
              <div class="share-name cfff box-center" v-if="meeting.shareName">
                <svg class="icon f20 blue" aria-hidden="true">
                  <use xlink:href="#icon20-gongxiangpingmu"></use>
                </svg>
                <span class="pl5 f12"><!-- {{meeting.shareName}}的共享窗口 -->{{ $t('meeting.screenshare', { name: meeting.shareName }) }}</span>
              </div>
            </div>
          </div>
        </section>
        <!-- 成员 -->
        <div class="member__wrap" :class="{ 'half' : !meeting.otherscreen &&members.length < 3 }" v-for="member in members">
          <div class="member__container">
            <avatar :member="member" :fullscreen="true" v-if="!subscribeLoading"></avatar>
          </div>
        </div>
      </section>

      <!-- 下一页 -->
      <section class="actions__right" v-show="totalPage>1">
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
      // 当前页显示的成员列表
      members: [],
      teacherStream: null,
      // 分页
      totalCount: 1,
      totalPage: 1,
      page: 1,
      // 默认9  测试的时候可以改成6
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
      'subscribeLoading',
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
      // 新增或者减少时更新成员和页码
      // if(newVal && oldVal && newVal.length !== oldVal.length)
      if(newVal && newVal.length) {
        this.initPages();
        this.updateMembers(this.page);
      }
    },
    'meeting.otherscreen'(newVal) {
      if(newVal) {
        this.pageSize = 8;
      } else {
        this.pageSize = 9;
      }
    }
  },
  methods: {
    ...mapActions('meeting', [
      'setMeeting',
      'setMeetingLayout',
    ]),

    init() {
      if(this.meeting && this.meeting.otherscreen) {
        this.pageSize = 8;
      }

      this.initPages();
      this.getMembers(this.page);
    },

    initPages() {
      const speakers = this.speakers;
      if(speakers && speakers.length) {
        this.totalCount = speakers.length;
        this.totalPage = Math.ceil(this.totalCount/this.pageSize);

        // 修正没有翻页按钮的问题
        if(this.page > 1 && this.page > this.totalPage) {
          this.page -= 1;
        }
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
     * @method 更新与会成员状态
     * @params
     */
    updateMembers(page) {
      page = page || this.page;
      const pageSize = this.pageSize;
      let members = this.members
      const speakers = this.speakers;

      if(members && members.length) {
        // 删除的位置
        let index = -1;
        members.forEach((member, i)=>{
          let user = speakers.find((item)=>{
            return item && item.id === member.id;
          })

          if(user && (user.video !== member.video || user.audio !== member.audio)) {
            member.video = user.video;
            member.audio = user.audio;
            // member = user;
          }

          // 用户被删除了
          if(!user) {
            index = i;
          }
        })

        if(~index) {
          members.splice(index, 1);
        }

        // 视图需要增加成员
        if(members.length < pageSize) {
          const start = (page - 1) * pageSize + members.length;
          const end = page * pageSize;

          let addMembers = speakers.slice(start, end);
          // 去重
          if(addMembers && addMembers.length) {
            addMembers.forEach((item)=>{
              let addTemp = members.find((member)=>{
                return item && item.id === member.id;
              })

              if(!addTemp) {
                members.push(item);
              }
            })
          }
        }

        this.members = members;
      }
    },

    /**
     * @method 下一页
     * @params
     */
    handleNext(evt) {
      let page = this.page;
      if(page < this.totalPage) {
        if(this.meetingSDK === 'tencent') {
          // 取消订阅远端流 排除共享和老师流
          this.$parent.unsubscribeSpeakers();
        }

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
        if(this.meetingSDK === 'tencent') {
          // 取消订阅远端流 排除共享和老师流
          this.$parent.unsubscribeSpeakers();
        }

        this.getMembers(page-1);
        console.log('handlePrev');
      }
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

    .action__prev {
      display: none;
    }
  }

  .actions__left {
    left: 0;

    &:hover {
      .action__pages {
        display: none;
      }

      .action__prev {
        display: flex;
      }
    }
  }

  .actions__right {
    right: 0;
  }


</style>

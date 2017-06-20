<!-- 全部人员名单 被父组件 rc-mask-activity.vue 引用 -->
<template>
	<div class="participantlist-box allowscrollcallback">
    <div class="desc f18">
      当前班级人数：<span class="f24">{{participantList.length}}</span> 人
    </div>
    <div class="gap"></div>
    <section class="list">
      <div class="item f17" v-for="item in participantList" :key="item.id">
        <div class="name ellipsis">
          <img :src="item.profile.avatar_96" alt="">
          <span>{{item.profile.name}}</span>
        </div>
        <div class="wayin">
          <span class="time">{{item.time}}</span>
          <span v-show="item.source === 1">扫码签到</span>
          <span v-show="item.source === 2">邀请码</span>
          <span v-show="item.source === 3">我的课程</span>
        </div>
      </div>
    </section>
    <v-touch class="back-btn f18" v-on:tap="closeParticipantList">返回</v-touch>
  </div>
</template>

<script>
  // source代表学生签到的来源  1代表扫码  2代表邀请码   3代表我的课程-正在上课
  export default {
    name: 'RcMaskActivityParticipantlist',
    props: ['participantList'],
    data () {
      return {
      }
    },
    created () {
      
    },
    methods: {
      /**
       * 点击 返回 按钮关闭全部人员名单
       *
       * @event bindtap
       */
      closeParticipantList () {
        this.$emit('closeParticipantList')
      },
    }
  }
</script>

<style lang="scss" scoped>
  @import "~@/style/_variables";
  .participantlist-box {
    position: absolute;
    z-index: 20; /* 遮盖toolbar */
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    background: $white;
    color: #4A4A4A;
    overflow: auto;

    .desc {
      padding: 0 0.4rem;
      height: 1.466667rem;
      line-height: 1.466667rem;
    }

    .gap {
      height: 0.266667rem;
      background: #EDF2F6;
    }

    .list {
      padding: 0 0.4rem 1.466667rem;

      .item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        height: 1.693333rem;

        .name {
          width: 4.0rem;
          img {
            width: 1.2rem;
            height: 1.2rem;
            margin-right: 0.4rem;
            border-radius: 50%;
            vertical-align: middle;
          }
        }

        .wayin .time {
          margin-right: 0.76rem;
        }
        .hide {
          display: none;
        }
      }
    }

    .back-btn {
      position: fixed;
      left: 0;
      right: 0;
      bottom: 0;
      height: 1.466667rem;
      line-height: 1.466667rem;
      text-align: center;
      background: $blue;
      color: $white;
    }
  }
</style>

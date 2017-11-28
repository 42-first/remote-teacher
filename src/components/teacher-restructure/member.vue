<!-- 全部人员名单 -->
<template>
	<div class="member-box">
    <slot name="ykt-msg"></slot>
    <div class="desc f18">
      当前班级人数：<span class="f24">{{participantList.length}}</span> 人
    </div>
    <div class="gap"></div>
    <section class="list">
      <div class="item f17" v-for="item in participantList" :key="item.id">
        <div class="name ellipsis">
          <img :src="item.profile.avatar_96 || 'http://sfe.ykt.io/o_1bsn23hg89klt0h1lb01p63dd69.jpg'" alt="">
          <span>{{item.profile.name}}</span>
        </div>
        <div class="wayin">
          <span class="time">{{item.time}}</span>
          <span class="ganbei" v-show="item.source === 1">扫二维码</span>
          <span class="ganbei" v-show="item.source === 2">课堂暗号</span>
          <span class="ganbei" v-show="item.source === 3">微信公众号</span>
          <span class="ganbei" v-show="item.source === 4">微信小程序</span>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
  import {mapGetters} from 'vuex'
  import request from '@/util/request'
  import API from '@/pages/teacher/config/api'

  // source代表学生签到的来源  1代表扫码  2代表邀请码   3代表我的课程-正在上课
  export default {
    name: 'Member',
    data () {
      return {
      }
    },
    computed: {
      ...mapGetters([
        'lessonid',
        'participantList'
      ])
    },
    created () {
      this.fetchList()
    },
    methods: {
      /**
       * 获取 学生名单
       *
       */
      fetchList () {
        let self = this

        let url = API.teaching_lesson_participant_list

        if (process.env.NODE_ENV === 'production') {
          url = API.teaching_lesson_participant_list + '/' + self.lessonid + '/'
        }

        request.get(url)
          .then(jsonData => {
            self.$store.commit('set_participantList', jsonData.data.students)
          })
      },
    }
  }
</script>

<style lang="scss" scoped>
  @import "~@/style/_variables";
  .member-box {
    position: relative;
    min-height: 100%;
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
        border-bottom: 1px solid #C8C8C8;

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
        .wayin .ganbei {
          display: inline-block;
          text-align: center;
          width: 2.4rem;
        }
        .hide {
          display: none;
        }
      }
    }
  }
</style>

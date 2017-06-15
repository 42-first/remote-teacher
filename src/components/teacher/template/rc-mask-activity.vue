<!-- 课堂动态面板 被父组件 remote.vue 引用 -->
<template>
	<div class="activity-box">
    <section class="head f20">
      <div class="teacher">
        <img :src="avatar" alt="">
        {{coursename}}
      </div>
      <div class="student f17">
        <img v-for="item in avatarList" :src="item.profile.avatar_96" alt="">
        <span>当前学生96位&gt;</span>
      </div>
    </section>
    <div class="activity-item f18">
      <div>试卷</div>
      <div>
        <i class="iconfont icon-forward f20"></i>
      </div>
    </div>
    <div class="activity-item f18">
      <div>弹幕</div>
      <div>
        已开启
        <i class="iconfont icon-forward f20"></i>
      </div>
    </div>
    <div class="activity-item f18">
      <div>投稿</div>
      <div>
        55
        <i class="iconfont icon-forward f20"></i>
      </div>
    </div>
  </div>
</template>

<script>
  import request from '@/util/request'
  import API from '@/config/api'

  export default {
    name: 'RcMaskActivity',
    props: ['lessonid', 'coursename', 'avatar'],
    data () {
      return {
        participantList: [],   // 当前学生名单
        avatarList: [],        // 头像列表，最多取10个
      }
    },
    
    created () {
      let self = this

      // 点击 课堂动态 按钮 父组件发送事件给本子组件，获取学生名单、投稿数等
      self.$on('RcMaskActivity', function () {
        // teaching_lesson_participant_list
        self.fetchParticipantList()
      })
    },
    methods: {
      /**
       * 获取课堂动态页 学生名单
       *
       */
      fetchParticipantList () {
        let self = this

        let url = API.teaching_lesson_participant_list

        if (process.env.NODE_ENV === 'production') {
          url = API.teaching_lesson_participant_list + '/' + self.lessonid + '/'
        }

        request.get(url)
          .then(jsonData => {
            console.log('teaching_lesson_participant_list', jsonData)
            self.participantList = jsonData.data.students.reverse()
            // 下面又翻转过来只是为了hack float  left样式
            self.avatarList = self.participantList.slice(0, 10).reverse()
          })
      },
    }
  }
</script>

<style lang="scss" scoped>
  @import "~@/style/_variables";
  .activity-box {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    background: #EDF2F6;
    

    .head {
      box-sizing: border-box;
      height: 3.68rem;
      padding: 0.733333rem 0.533333rem 0;
      margin-bottom: 0.386667rem;
      background: #39383E;
      color: $white;

      .teacher {
        margin-bottom: 0.653333rem;
        img {
          width: 0.933333rem;
          height: 0.933333rem;
          border-radius: 50%;
          vertical-align: middle;
        }
      }

      .student {
        img {
          float: left;
          width: 0.533333rem;
          height: 0.533333rem;
          border-radius: 50%;
          margin-top: 0.133333rem;
          margin-right: -0.133333rem;
        }
        span {
          float: left;
          margin-left: 0.266667rem;
        }
      }
    }

    .activity-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 1.666667rem;
      padding: 0 0.533333rem;
      margin-bottom: 0.266667rem;
      background: $white;
      color: #333333;
    }
  }
</style>

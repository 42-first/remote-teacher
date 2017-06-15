<!-- 课堂动态面板 被父组件 remote.vue 引用 -->
<template>
	<div class="activity-box">
    <section class="head f20">
      计算机软件与工程
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
    props: ['lessonid', 'presentationid', 'pptData', 'current', 'total', 'socket'],
    data () {
      return {
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
      height: 3.68rem;
      margin-bottom: 0.386667rem;
      background: #39383E;
      color: $white;
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

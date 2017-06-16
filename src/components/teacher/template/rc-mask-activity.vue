<!-- 课堂动态面板 被父组件 remote.vue 引用 -->
<template>
	<div class="activity-box">
    <section class="head f20">
      <div class="teacher">
        <img :src="avatar" alt="">
        {{coursename}}
      </div>
      <v-touch class="student f17" v-on:tap="showParticipantList">
        <img v-for="item in avatarList" :src="item.profile.avatar_96" alt="">
        <span>当前学生{{participantList.length}}位&gt;</span>
      </v-touch>
    </section>
    <v-touch class="activity-item f18" v-on:tap="showPaper">
      <div>试卷</div>
      <div>
        <i class="iconfont icon-forward f20"></i>
      </div>
    </v-touch>
    <v-touch class="activity-item f18" v-on:tap="showDanmubox">
      <div>弹幕</div>
      <div>
        <span style="color: #cccccc;">{{isDanmuOpen ? '已开启' : '已关闭'}}</span>
        <i class="iconfont icon-forward f20"></i>
      </div>
    </v-touch>
    <div class="activity-item f18">
      <div>投稿</div>
      <div>
        55
        <i class="iconfont icon-forward f20"></i>
      </div>
    </div>

    <RcMaskActivityParticipantlist
      v-show="!isParticipantlistHidden"
      :participant-list="participantList"
      @closeParticipantList="closeParticipantList"
    ></RcMaskActivityParticipantlist>

    <RcMaskActivityPaper
      ref="RcMaskActivityPaper"
      v-show="!isPaperHidden"
      :lessonid="lessonid"
      :socket="socket"
      @closePaper="closePaper"
    ></RcMaskActivityPaper>

    <RcMaskActivityDanmubox
      ref="RcMaskActivityDanmu"
      v-show="!isDanmuboxHidden"
      :lessonid="lessonid"
      :socket="socket"
      :is-danmu-open="isDanmuOpen"
      @closeDanmubox="closeDanmubox"
    ></RcMaskActivityDanmubox>
  </div>
</template>

<script>
  import request from '@/util/request'
  import API from '@/config/api'

  // 全部人员名单
  import RcMaskActivityParticipantlist from '@/components/teacher/template/rc-mask-activity-participantlist'
  // 试卷列表
  import RcMaskActivityPaper from '@/components/teacher/template/rc-mask-activity-paper'
  // 弹幕控制页面
  import RcMaskActivityDanmubox from '@/components/teacher/template/rc-mask-activity-danmubox'


  export default {
    name: 'RcMaskActivity',
    props: ['lessonid', 'coursename', 'avatar', 'socket', 'isDanmuOpen'],
    data () {
      return {
        participantList: [],            // 当前学生名单
        avatarList: [],                 // 头像列表，最多取10个
        isParticipantlistHidden: true,  // 全部人员名单隐藏
        isPaperHidden: true,            // 试卷列表隐藏
        isDanmuboxHidden: true,         // 弹幕控制页面隐藏
      }
    },
    components: {
      RcMaskActivityParticipantlist,
      RcMaskActivityPaper,
      RcMaskActivityDanmubox
    },
    created () {
      let self = this

      // 点击 课堂动态 按钮 父组件发送事件给本子组件，获取学生名单、投稿数等
      self.$on('RcMaskActivity', function () {
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
            self.participantList = jsonData.data.students.reverse()
            // 下面又翻转过来只是为了hack float  left样式
            self.avatarList = self.participantList.slice(0, 10).reverse()
          })
      },
      /**
       * 点击 学生头像列表 按钮展示全部人员名单
       *
       * @event bindtap
       */
      showParticipantList () {
        let self = this
        self.isParticipantlistHidden = false
      },
      /**
       * 点击 返回 按钮关闭全部人员名单
       *
       * @event bindtap
       */
      closeParticipantList () {
        let self = this
        self.isParticipantlistHidden = true
      },
      /**
       * 点击 试卷 按钮展示试卷列表
       *
       * @event bindtap
       */
      showPaper () {
        let self = this
        self.isPaperHidden = false

        self.$refs.RcMaskActivityPaper.$emit('showPaper')
      },
      /**
       * 点击 弹幕 按钮展示弹幕控制
       *
       * @event bindtap
       */
      showDanmubox () {
        let self = this
        self.isDanmuboxHidden = false

        self.$refs.RcMaskActivityDanmu.$emit('showDanmubox')
      },
      /**
       * 点击 返回 按钮关闭试卷列表
       *
       * @event bindtap
       */
      closePaper () {
        let self = this
        self.isPaperHidden = true
      },
      /**
       * 点击 返回 返回课堂动态
       *
       * @event bindtap
       */
      closeDanmubox () {
        let self = this
        self.isDanmuboxHidden = true
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

<!-- 课堂动态面板 被父组件 remote.vue 引用 -->
<template>
	<div class="activity-box">
    <section class="head f20">
      <div class="teacher ellipsis clearfix">
        <img :src="avatar" alt="">
        <span class="coursename">{{coursename}}</span>
      </div>
      <v-touch class="student f17 J_ga" v-on:tap="showParticipantList" data-category="5" data-label="课堂动态页">
        <img v-for="item in avatarList" :src="item.profile.avatar_96" alt="">
        <span class="dqxs">
          当前学生{{participantList.length}}位
          <i class="iconfont icon-dakai f15"></i>
        </span>
      </v-touch>
    </section>
    <v-touch class="activity-item f18" v-on:tap="showPaper">
      <div>
        <div class="iconbox" style="background: #50E3C2;">
          <i class="iconfont icon-shiti_shijuan f21"></i>
        </div>
        试卷
      </div>
      <div class="dakai-box">
        <i class="iconfont icon-dakai f21"></i>
      </div>
    </v-touch>
    <v-touch class="activity-item f18 J_ga" v-on:tap="showDanmubox" data-category="6" data-label="课堂动态页">
      <div>
        <div class="iconbox" style="background: #BF7EF8;">
          <i class="iconfont icon-ykq_tab_danmu f21"></i>
        </div>
        弹幕
      </div>
      <div class="dakai-box">
        <span class="kg">{{isDanmuOpen ? '已开启' : '已关闭'}}</span>
        <i class="iconfont icon-dakai f21"></i>
      </div>
    </v-touch>
    <v-touch class="activity-item f18 J_ga" v-on:tap="showSubmission" data-category="8" data-label="课堂动态页">
      <div>
        <div class="iconbox" style="background: #FF576B;">
          <i class="iconfont icon-ykq_tab_tougao f21"></i>
        </div>
        投稿
      </div>
      <div class="dakai-box">
        <span class="info f12" v-show="newtougao">{{newtougao}}</span>
        <i class="iconfont icon-dakai f21"></i>
      </div>
    </v-touch>

    <Toolbar 
      ref="Toolbar"
      class="activity-tollbar"
      :lessonid="lessonid"
      :presentationid="presentationid"
      :socket="socket"
      :newdoubt="newdoubt"
      :newtougao="newtougao"
      :active-index="2"
      :is-socket-connected="isSocketConnected"
      @goHome="goHome"
      @showThumbnail="showThumbnail"
    ></Toolbar>

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
      ref="RcMaskActivityDanmubox"
      v-show="!isDanmuboxHidden"
      :lessonid="lessonid"
      :socket="socket"
      :is-danmu-open="isDanmuOpen"
      :posting-danmuid="postingDanmuid"
      @closeDanmubox="closeDanmubox"
    ></RcMaskActivityDanmubox>

    <RcMaskActivitySubmission
      ref="RcMaskActivitySubmission"
      v-show="!isSubmissionHidden"
      :lessonid="lessonid"
      :socket="socket"
      :posting-submissionid="postingSubmissionid"
      @closeSubmissionbox="closeSubmissionbox"
      @refreshCheckTougao="refreshCheckTougao"
    ></RcMaskActivitySubmission>
  </div>
</template>

<script>
  import request from '@/util/request'
  import API from '@/config/api'

  // 工具栏
  import Toolbar from '@/components/teacher/template/toolbar'

  // 全部人员名单
  import RcMaskActivityParticipantlist from '@/components/teacher/template/rc-mask-activity-participantlist'
  // 试卷列表
  import RcMaskActivityPaper from '@/components/teacher/template/rc-mask-activity-paper'
  // 弹幕控制页面
  import RcMaskActivityDanmubox from '@/components/teacher/template/rc-mask-activity-danmubox'
  // 投稿控制页面
  import RcMaskActivitySubmission from '@/components/teacher/template/rc-mask-activity-submission'


  export default {
    name: 'RcMaskActivity',
    props: ['lessonid', 'presentationid', 'coursename', 'avatar', 'socket', 'isDanmuOpen', 'postingDanmuid', 'postingSubmissionid', 'newdoubt', 'newtougao', 'isRcMaskActivityAtRoot', 'isSocketConnected'],
    data () {
      return {
        participantList: [],            // 当前学生名单
        avatarList: [],                 // 头像列表，最多取10个
        isParticipantlistHidden: true,  // 全部人员名单隐藏
        isPaperHidden: true,            // 试卷列表隐藏
        isDanmuboxHidden: true,         // 弹幕控制页面隐藏
        isSubmissionHidden: true,       // 投稿控制页面隐藏
      }
    },
    components: {
      Toolbar,
      RcMaskActivityParticipantlist,
      RcMaskActivityPaper,
      RcMaskActivityDanmubox,
      RcMaskActivitySubmission
    },
    created () {
      let self = this

      // 点击 课堂动态 按钮 父组件发送事件给本子组件，获取学生名单、投稿数等
      self.$on('RcMaskActivity', function () {
        self.fetchParticipantList()
      })
    },
    updated () {
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
       * @param {object} evt event对象
       */
      showParticipantList (evt) {
        let self = this
        self.isParticipantlistHidden = false

        self.setAtRootFalse()

        typeof gaue !== 'undefined' && gaue.default.fixTrigger(evt);
      },
      /**
       * 点击 返回 按钮关闭全部人员名单
       *
       * @event bindtap
       */
      closeParticipantList () {
        let self = this
        self.isParticipantlistHidden = true

        self.setAtRootTrue()
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

        self.setAtRootFalse()
      },
      /**
       * 点击 弹幕 按钮展示弹幕控制
       *
       * @event bindtap
       * @param {object} evt event对象
       */
      showDanmubox (evt) {
        let self = this
        self.isDanmuboxHidden = false

        self.$refs.RcMaskActivityDanmubox.$emit('showDanmubox')

        self.setAtRootFalse()

        typeof gaue !== 'undefined' && gaue.default.fixTrigger(evt);
      },
      /**
       * 点击 投稿 按钮展示投稿控制
       *
       * @event bindtap
       * @param {object} evt event对象
       */
      showSubmission (evt) {
        let self = this
        self.isSubmissionHidden = false

        self.$refs.RcMaskActivitySubmission.$emit('showSubmission')
        self.setAtRootFalse()

        typeof gaue !== 'undefined' && gaue.default.fixTrigger(evt);
      },
      /**
       * 投稿列表页面点击 刷新 按钮也应清零投稿未读数
       *
       * @param {number} num 总投稿数
       */
      refreshCheckTougao (num) {
        let self = this
        self.$emit('checkTougao', num)
      },
      /**
       * 点击 返回 按钮关闭试卷列表
       *
       * @event bindtap
       */
      closePaper () {
        let self = this
        self.isPaperHidden = true

        self.setAtRootTrue()
      },
      /**
       * 点击 返回 返回课堂动态
       *
       * @event bindtap
       */
      closeDanmubox () {
        let self = this
        self.isDanmuboxHidden = true

        self.setAtRootTrue()
      },
      /**
       * 点击 返回 返回课堂动态
       *
       * @event bindtap
       */
      closeSubmissionbox () {
        let self = this
        self.isSubmissionHidden = true

        self.setAtRootTrue()
      },
      /**
       * 确认当前在课堂动态根部页面
       *
       */
      setAtRootTrue () {
        let self = this

        self.$emit('update:isRcMaskActivityAtRoot', true)
      },
      /**
       * 确认当前在课堂动态页面的子页面
       *
       */
      setAtRootFalse () {
        let self = this

        self.$emit('update:isRcMaskActivityAtRoot', false)
      },
      /**
       * 点击 遥控器 按钮
       * 一般是用于主动关闭缩略图蒙版
       *
       */
      goHome () {
        this.$emit('goHome')
      },
      /**
       * 点击 缩略图 按钮
       *
       */
      showThumbnail () {
        this.$emit('showThumbnail')
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
    
    .activity-tollbar {
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      color: $white;
    }

    .head {
      box-sizing: border-box;
      height: 3.68rem;
      padding: 0.733333rem 0.533333rem 0;
      margin-bottom: 0.386667rem;
      background: #1C1B20;
      color: $white;

      .teacher {
        margin-bottom: 0.653333rem;
        img {
          float: left;
          width: 1.0rem;
          height: 1.0rem;
          border: 2px solid $white;
          border-radius: 50%;
          vertical-align: middle;
        }

        .coursename {
          float: left;
          margin-top: 0.146667rem;
          margin-left: 0.133333rem;
        }
      }

      .student {
        img {
          float: left;
          width: 0.56rem;
          height: 0.56rem;
          border: 1px solid $white;
          border-radius: 50%;
          margin-top: 0.133333rem;
          margin-right: -0.133333rem;
        }
        .dqxs {
          float: left;
          margin-top: 0.04rem;
          margin-left: 0.333333rem;
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

      .iconbox {
        display: inline-block;
        width: 0.933333rem;
        height: 0.933333rem;
        margin-right: 0.3rem;
        text-align: center; 
        line-height: 0.933333rem;
        border-radius: 50%;

        .iconfont {
          color: $white;
        }
      }

      .dakai-box {
        margin-top: 0.186667rem;
      }

      .kg {
        float: left;
        margin-top: 0.053333rem;
        margin-right: 0.1rem;
        color: #cccccc;
      }

      .info {
        float: left;
        margin-top: 0.173333rem;
        margin-right: 0.16rem;
        min-width: 0.3rem;
        padding: 0 0.1rem;
        text-align: center;
        background: #D0021B;
        border-radius: 0.25rem;
        color: $white;
      }
    }
  }
</style>

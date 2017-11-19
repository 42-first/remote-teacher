<!-- 课堂动态面板 被父组件 home.vue 引用 -->
<template>
	<div class="activity-box">
    <section class="head f20">
      <div class="teacher ellipsis clearfix">
        <img :src="avatar" alt="">
        <span class="coursename ellipsis">{{coursename}}</span>
      </div>
      <v-touch class="student f17 J_ga" v-on:tap="" data-category="5" data-label="课堂动态页">
        <img v-for="item in avatarList" :src="item.profile.avatar_96" alt="">
        <span class="dqxs">
          当前学生{{participantList.length}}位
          <i class="iconfont icon-dakai f15"></i>
        </span>
      </v-touch>
    </section>
    <v-touch class="activity-item f18 J_ga" v-on:tap="" data-category="16" data-label="课堂动态页">
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
    <v-touch class="activity-item f18 J_ga" v-on:tap="" data-category="6" data-label="课堂动态页">
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
    <router-link :to="{name: 'submission'}" class="activity-item f18 J_ga" data-category="8" data-label="课堂动态页">
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
    </router-link>

    <Toolbar 
      ref="Toolbar"
      class="activity-tollbar"
      :active-index="2"
      :is-socket-connected="isSocketConnected"
      @goHome="goHome"
      @showThumbnail="showThumbnail"
    ></Toolbar>

    
  </div>
</template>

<script>
  import {mapGetters} from 'vuex'
  import request from '@/util/request'
  import API from '@/pages/teacher/config/api'

  // 工具栏
  import Toolbar from './toolbar'

  export default {
    name: 'Activity',
    props: ['isDanmuOpen', 'isRcMaskActivityAtRoot', 'isSocketConnected'],
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
    computed: {
      ...mapGetters([
        'avatar',
        'coursename',
        'lessonid',
        'presentationid',
        'socket',
        'newtougao',
      ])
    },
    components: {
      Toolbar,
    },
    created () {
      let self = this

      // 点击 课堂动态 按钮 父组件发送事件给本子组件，获取学生名单、投稿数等
      self.$on('Activity', function () {
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
            self.participantList = jsonData.data.students
            // 下面又翻转过来只是为了hack float  left样式
            self.avatarList = self.participantList.slice(0, 10).reverse()
          })
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
          width: 7.333333rem;
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

<!-- 课堂动态面板 被父组件 home.vue 引用 -->
<template>
	<div class="activity-box">
    <section class="head f20">
      <div class="teacher ellipsis clearfix">
        <!-- <img :src="avatar" alt=""> -->
        <span class="coursename ellipsis">{{coursename}}</span>
      </div>
      <div class="head-link-wrap">
        <router-link tag="div" :to="{name: 'member'}" class="student f17 J_ga" data-category="5" data-label="课堂动态页">
          <div class="avatar-box">
            <img v-for="(item, index) in participantList.slice(0, 10).reverse()" :key="index" :src="item ||'http://sfe.ykt.io/o_1bsn23hg89klt0h1lb01p63dd69.jpg'" alt="">
          </div>
          <span class="dqxs f14">
            {{ $t('activeno', { activeno: participant_count }) }}
            <i class="iconfont icon-dakai f14"></i>
          </span>
        </router-link>
        <v-touch class="radomrollcall-btn f16" v-on:tap="radomrollcall">
          <!-- 随机点名 -->{{$t('radomrollcall')}}
        </v-touch>
      </div>
      
    </section>
    <router-link :to="{name: 'paper'}" class="activity-item f18 J_ga" data-category="16" data-label="课堂动态页">
      <div>
        <div class="iconbox" style="background: #50E3C2;">
          <i class="iconfont icon-shiti_shijuan f21"></i>
        </div>
        {{ $t('quiz') }}
      </div>
      <div class="dakai-box">
        <i class="iconfont icon-dakai f21"></i>
      </div>
    </router-link>
    <router-link tag="div" :to="{name: 'danmu'}" class="activity-item f18 J_ga" data-category="6" data-label="课堂动态页">
      <div>
        <div class="iconbox" style="background: #BF7EF8;">
          <i class="iconfont icon-ykq_tab_danmu f21"></i>
        </div>
        {{ $t('bullet') }}
      </div>
      <div class="dakai-box">
        <span class="kg">{{ $tc('onoff', isDanmuOpen) }}</span>
        <i class="iconfont icon-dakai f21"></i>
      </div>
    </router-link>
    <router-link :to="{name: 'submission'}" class="activity-item f18 J_ga" data-category="8" data-label="课堂动态页">
      <div>
        <div class="iconbox" style="background: #FF576B;">
          <i class="iconfont icon-ykq_tab_tougao f21"></i>
        </div>
        {{ $t('post') }}
      </div>
      <div class="dakai-box">
        <span class="info f12" v-show="newtougao">{{newtougao}}</span>
        <i class="iconfont icon-dakai f21"></i>
      </div>
    </router-link>
		<v-touch v-on:tap="toTeam" class="activity-item f18 J_ga" data-category="8" data-label="课堂动态页">
      <div>
        <div class="iconbox" style="background: #08BC72;">
          <i class="iconfont icon-fenzu1 f21"></i>
        </div>
        {{ $t('group') }}
      </div>
			<div class="dakai-box">
        <i class="iconfont icon-dakai f21"></i>
      </div>
    </v-touch>

    <Toolbar
      ref="Toolbar"
      class="activity-tollbar"
      :active-index="2"
      @goHome="goHome"
      @showThumbnail="showThumbnail"
      @stateSet="stateSetFn"
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
    data () {
      return {
        participantList: [],
        participant_count: 0,
      }
    },
    computed: {
      ...mapGetters([
        'avatar',
        'coursename',
        'lessonid',
        'presentationid',
        'socket',
        'isDanmuOpen',
        'newtougao',
				'classroomid'
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

        let url = API.teaching_lesson_participant_list + '/' + self.lessonid + '?sort_type=2'
        // let url = `${API.teaching_lesson_participant_count}/${self.lessonid}`;

        if (process.env.NODE_ENV === 'production') {
          url = API.teaching_lesson_participant_list + '/' + self.lessonid + '?sort_type=2'
        }

        request.get(url)
          .then(jsonData => {
            // self.$store.commit('set_participantList', jsonData.data.students)
            const data = jsonData.data;
            this.participant_count = data.participant_count || 0;
            this.participantList = data.avatars || [];
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
      // 设置
      stateSetFn () {
        this.$emit('stateSet')
      },

			/*
			 * 分组入口
			 */
			toTeam() {
				let self = this;
				console.log(self.classroomid + '--' + self.lessonid);
				location.href = '/team/teacher/' + self.classroomid + '?from=lesson&lessonid=' + self.lessonid;
      },
      /** 
       * 新增随机点名入口
      */
      radomrollcall(e){
        this.$refs.Toolbar.callWakeup(e)
      }
    }
  }
</script>

<style lang="scss" scoped>
  @import "~@/style/_variables";
  a {
    text-decoration: none;
  }
  .activity-box {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    background: #fff;

    .activity-tollbar {
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      color: $white;
    }

    .head {
      box-sizing: border-box;
      height: 3.46666667rem;
      padding: 0.6rem 0.4rem 0.53333333rem;
      margin-bottom: 0.09333333rem;
      background: #f8f8f8;
      color: #333;
      box-sizing: border-box;
      .teacher {
        margin-bottom: 0.4rem;
        height: 0.74666667rem;
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
          font-weight: bold;
        }
      }
      .head-link-wrap {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        .avatar-box {
          overflow: hidden;
          margin-bottom: 0.13333333rem;
        }
      }

      .student {
        // display: flex;
        // align-items: center;
        flex: 1;
        img {
          float: left;
          width: 0.53333333rem;
          height: 0.53333333rem;
          border: 1px solid $white;
          border-radius: 50%;
          margin-right: -0.13333333rem;
        }
        .dqxs {
          // float: left;
          // margin-left: 0.333333rem;
          color: #333;
          line-height: 0.64rem;
        }
      }
      .radomrollcall-btn {
        padding:0.16rem 0.34666667rem;
        border:1px solid #639ef4;
        border-radius: 0.10666667rem;
        height: 0.85333333rem;
        line-height: 0.53333333rem;
        box-sizing: border-box;
        color:#639ef4;
        background:rgba(99,158,244,.1); 
      }
    }

    .activity-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 1.86666667rem;
      padding: 0 0.4rem;
      background: $white;
      color: #333333;
      border-bottom: 1px solid #eee;

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
        // margin-top: 0.186667rem;
        display: flex;
        align-items: center;
      }

      .kg {
        float: left;
        // margin-top: 0.053333rem;
        margin-right: 0.1rem;
        color: #cccccc;
      }

      .info {
        float: left;
        // margin-top: 0.173333rem;
        margin-right: 0.16rem;
        min-width: 0.6rem;
        text-align: center;
        padding: 0 0.10666667rem;
        text-align: center;
        line-height: 0.37333333rem;
        background: #D0021B;
        border-radius: 0.25rem;
        color: $white;
      }
    }
  }
</style>

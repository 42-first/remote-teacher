<!-- 投稿控制页 -->
<template>
	<div class="page">
    <div class="ppt-show-set w100 color3 border-box" @click="pptShowSetLink">
      <span class="text">
          <span>{{ $t('studentsVisible') }}</span><!--学生可见-->
      </span>
      <div class="icon-span color-9b">
        <span v-show="show_presentation === 'film'">{{ $t('visibleStu') }}</span><!--课上讲解的-->
        <span v-show="show_presentation === 'all' || !show_presentation">{{ $t('visibleAll') }}</span><!--全部课件-->
        <i class="iconfont icon-kejiankejianqiehuan color63 ver-middle"></i>
      </div>
    </div>
    <div class="hideStu color3 back-f" v-if="addinversionRight">
      <span>{{$t('projectionHideStuInfo')}}</span>
      <i class="iconfont icon-danmu-close color-9b ver-middle" v-show="!isHideName" @click="hideNameHandle"></i>
      <i class="iconfont icon-danmu-open color63 ver-middle" v-show="isHideName" @click="hideNameHandle"></i>
    </div>
    <div class="hideStu color3 back-f" v-if="addinversionRight">
      <span>{{$t('subjectiveshowanwer')}}</span>
      <i class="iconfont icon-danmu-close color-9b ver-middle" v-show="!showAnswer" @click="showAnswerHandle"></i>
      <i class="iconfont icon-danmu-open color63 ver-middle" v-show="showAnswer" @click="showAnswerHandle"></i>
    </div>
    <!-- <Toolbar ref="Toolbar" class="state-set-tollbar" @goHome="goHome" @showThumbnail="showThumbnail" @showActivity="showActivity" @stateSet="stateSetFn"></Toolbar> -->
  </div>
</template>

<script>
  import axios from 'axios'
  import {mixin} from './util/mix_ppt_show_set'
  import MessageBoxMin from './common/messagebox.vue'
  import {mapGetters} from 'vuex'
  // 工具栏
  import Toolbar from './common/toolbar'

  export default {
    name: 'StateSet',
    data () {
      return {
        show_presentation: 'all',
        isHideName: true,
        showAnswer: false,
        addinversionRight: false
      }
    },
    mixins: [mixin],
    components: {
      MessageBoxMin,
      Toolbar
    },
    computed: {
      ...mapGetters([
        'lessonid',
        'socket',
        'userid',
        'auth',
        'addinversion'
      ])
    },
    created () {
      let num = Number(this.addinversion)
      if (num && num >= 1.3) {
        this.addinversionRight = true
      }
      this.init()
    },
    beforeDestroy () {
    },
    methods: {
      init () {
        let url = 'pc/web_ppt_config'
        axios.post(this.urlMock(url), {
          'op': 'get_config'
        }).then(e => {
          let data = e.data
          let info = data.data
          if (data.success) {
            this.show_presentation = info.show_presentation
            this.showAnswer = info.problem_show_answer
            this.isHideName = !info.show_user_profile
          }
        })
        this.addinversionRight && this.getShowUserInfo()
      },
      pptShowSetLink () {
        this.pptShowSet({
          get_config: this.show_presentation
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
      /**
       * 点击 课堂动态 按钮
       *
       */
      showActivity () {
        this.$emit('showActivity')
      },
      // 设置
      stateSetFn () {
        this.$emit('stateSet')
      },
      // 点击确定是否显示学生姓名
      hideNameHandle () {
        this.isHideName = !this.isHideName;
        axios.post('/pc/web_ppt_config',{
          "op": "set_config",
          "set_data": {
            "show_user_profile": !this.isHideName
          },
          "lesson_id": this.lessonid
        })
      },
      showAnswerHandle() {
        this.showAnswer = !this.showAnswer
        axios.post('/pc/web_ppt_config', {
          "op": "set_config",
          "set_data": {
            "problem_show_answer": this.showAnswer,
          },
          "lesson_id": this.lessonid
        })
      },
      // 获取是否投屏隐藏学生信息和习题是否显示答案
      getShowUserInfo() {
        const self = this
        axios.get('/v/lesson/get_show_user_profile_config/').then(e => {
          let data = e.data.data
          console.log(data)
          self.isHideName = !data.show_user_profile
        })
        axios.get('/v/lesson/get_problem_show_answer_config/').then(e => {
          let data = e.data.data
          console.log(data)
          self.showAnswer = data.problem_show_answer
        })
      },
      urlMock (url) {
        if (process.env.NODE_ENV !== 'production') {
          return 'http://apimock.xuetangx.com/mock/115/' + url
        }
        return '/' + url
      }
    }
}
</script>
<style lang="scss">
  @import "~@/style/common";
  .page{
    background-color: #F6F7F8;
    height: 100%;
    overflow: hidden;
    position: absolute;
    top: 0;
    width: 100%;
    z-index: 4;
    .state-set-tollbar{
      position: absolute;
      width: 100%;
      bottom: 0;
    }
    .ppt-show-set{
      margin-top: 0.267rem;
      font-size: 0.373rem;
      height: 1.2rem;
      line-height: 1.2rem;
      padding: 0 px2rem(30px);
      display: flex;
      background-color: #fff;
      .text{
        flex: 1;
        font-size: px2rem(34px);
      }
      .icon-span{
        span{
          font-size: px2rem(28px);
          vertical-align: middle;
        }
        i{
          font-size: 0.8rem;
        }
      }
    }
    .hideStu{
      height: px2rem(125px);
      box-sizing: border-box;
      padding: 0 px2rem(30px);
      font-size: px2rem(34px);
      line-height: px2rem(125px);
      margin-top: px2rem(20px);
      display: flex;
      span:first-child{
        flex: 1;
      }
      .iconfont{
        font-size: px2rem(110px);
      }
    }
  }
</style>

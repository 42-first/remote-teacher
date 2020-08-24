<!-- 投稿控制页 -->
<template>
	<div class="page">
    <div class="ppt-show-set w100 color3 border-box" @click="pickerfn"  v-if="addinversionRight >= 1.1">
      <span class="text">
          <span>{{ $t('studentsVisible') }}</span><!--学生可见-->
      </span>
      <div class="icon-span color-9b">
        <span>{{ show_presentation === 'film' ? visibleStu : visibleAll }}</span><!--课上讲解的 全部可见-->
        <i class="iconfont icon-kejiankejianqiehuan color63 ver-middle"></i>
      </div>
    </div>
    <div class="hideStu color3 back-f" v-if="addinversionRight >= 1.3">
      <span>{{$t('projectionHideStuInfo')}}</span>
      <i class="iconfont icon-danmu-close color-9b ver-middle" v-show="!isHideName" @click="hideNameHandle"></i>
      <i class="iconfont icon-danmu-open color63 ver-middle" v-show="isHideName" @click="hideNameHandle"></i>
    </div>
    <div class="hideStu color3 back-f" v-if="addinversionRight >= 1.3">
      <span>{{$t('subjectiveshowanwer')}}</span>
      <i class="iconfont icon-danmu-close color-9b ver-middle" v-show="!showAnswer" @click="showAnswerHandle"></i>
      <i class="iconfont icon-danmu-open color63 ver-middle" v-show="showAnswer" @click="showAnswerHandle"></i>
    </div>
    <picker v-show="pickerShow" @close="pickerclose" @change="pickerend"></picker>
    <div class="loading" v-if="!loaded">
      <loading></loading>
    </div>
  </div>
</template>

<script>
  import axios from 'axios'
  import MessageBoxMin from './common/messagebox.vue'
  import {mapGetters} from 'vuex'
  import picker from './common/picker.vue'
  import request from '@/util/request-v3'
  import API from '@/util/api'

  // 工具栏
  import Toolbar from './common/toolbar'
  import loading from './common/loading'

  export default {
    name: 'StateSet',
    data () {
      return {
        show_presentation: 'all',
        isHideName: true,
        showAnswer: false,
        addinversionRight: false,
        pickerShow: false,
        visibleAll: this.$t('visibleAll'),
        visibleStu: this.$t('visibleStu'),
        arr: [this.visibleAll, this.visibleStu],
        pickerIndex: this.show_presentation === 'all' ? 0 : 1,
        loaded: false
      }
    },
    components: {
      MessageBoxMin,
      Toolbar,
      picker,
      loading
    },
    computed: {
      ...mapGetters([
        'lessonid',
        'socket',
        'userid',
        'auth',
        'addinversion',
        'presentationid',
        'isCloneClass'
      ])
    },
    created () {
      this.addinversionRight = Number(this.addinversion) || 0
      this.init()
    },
    beforeDestroy () {
    },
    methods: {
      init () {
        let URL = API.lesson.get_user_config
        return request.get(URL)
        .then((res) => {
          if(res && res.code === 0 && res.data){
            let info = res.data
            this.show_presentation = info.show_presentation
            this.showAnswer = info.problem_show_answer
            this.isHideName = !info.show_user_profile
            this.loaded = true
          }
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
      // 点击确定是否显示学生姓名
      hideNameHandle () {

        // 克隆班不能执行当前操作
        if (!!this.isCloneClass) {
          this.$toast({
            message: this.$t('cloneTips'),
            duration: 3e3
          });
          return
        }

        this.isHideName = !this.isHideName;
        let URL = API.lesson.update_config

        let params = {
          show_user_profile: !this.isHideName
        }
        return request.post(URL, params)
        .then((res) => {
          if(res && res.code === 0 && res.data){

          }
        }).catch(error => {

        })
      },
      showAnswerHandle() {
        // 克隆班不能执行当前操作
        if (!!this.isCloneClass) {
          this.$toast({
            message: this.$t('cloneTips'),
            duration: 3e3
          });
          return
        }
        this.showAnswer = !this.showAnswer

        let URL = API.lesson.update_config
        let self = this

        let params = {
          problem_show_answer: this.showAnswer
        }
        return request.post(URL, params)
        .then((res) => {
          if(res && res.code === 0 && res.data){

          }
        }).catch(error => {
          
        })
      },
      pickerfn() {
        this.pickerShow = true
      },
      pickerend(e) {
        // console.log(e)
        let name = e ? 'film' : 'all'
        this.show_presentation = name
        this.pcSet(name)
        this.pickerclose()
      },
      pickerclose() {
        this.pickerShow = false
      },
      // 设置ppt
      pcSet (name) {
        this.show_presentation = name
        let URL = API.lesson.update_config
        let params = {
          show_presentation: name
        }

        request.post(URL,params)
        .then((res) => {
          if(res && res.code === 0 && res.data){

          }
        }).catch(error => {

        })
        // let url1 = `v/lesson/config_presentation/${this.presentationid}/`;
        // axios.post(this.urlMock(url1), {
        //   "op":"set_config",
        //   "set_data": {
        //     "show_presentation": name
        //   },
        //   'lesson_id': this.lessonid
        // })
      },
      urlMock (url) {
        if (process.env.NODE_ENV !== 'production') {
          return 'http://apimock.xuetangx.com/mock/115/' + url
        }
        return '/' + url
      }
    },
    mounted() {
      
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
    .loading{
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, .6);
    }
  }
</style>

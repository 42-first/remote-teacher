<!--组合错误信息面板 被父组件 home.vue 引用 -->
<template>
  <div class="rc-mask-endshow">
    <div class="err-wrapper">
      <div class="err-tips">
        {{$t('showended')}}
      </div>
      <div class="continiue-tips">
        {{$t('jsskqzdnd')}}
      </div>
      <div class="close-tips">
        <span>{{$t('jsskq')}}</span>
        <a @click="openModal">{{$t('djzl')}}</a>
      </div>
    </div>
    <!-- 当蒙版是缩略图时，底部的工具栏要露出来 -->
    <Toolbar
      ref="Toolbar"
      :active-index="activeIndex"
      @showThumbnail="showThumbnail"
      @showActivity="showActivity"
      @goHome="goHome"
    ></Toolbar>
  </div>
</template>

<script>
  import {mapGetters} from 'vuex'
	import request from '@/util/request'
  import API from '@/pages/teacher/config/api'
  import config from '@/pages/teacher/config/config'
  // 工具栏
	import Toolbar from '@/components/teacher-restructure/common/toolbar'

	export default {
	  name: 'RcMaskErrormsg',
	  data () {
	    return {
	      isModalHidden: true,						// 结束授课确认框是隐藏
	    }
	  },
    computed: {
      ...mapGetters([
        'courseid',
        'classroomid',
        'lessonid',
        'errType',
        'toolbarIndex'
      ]),
      activeIndex() {
        console.log(this.toolbarIndex)
        return this.toolbarIndex
      }
    },
	  methods: {
	  	/**
       * 点击 结束本次授课 按钮打开模态框
       *
       * @event bindtap
       */
      openModal () {
        let self = this

        self.isModalHidden = false
      },
	  	/**
       * 点击 取消 按钮关闭模态框
       *
       * @event bindtap
       */
      closeModal () {
        let self = this

        self.isModalHidden = true
      },
	  	/**
		   * 结束课程
		   *
		   * @event tap
		   */
		  endLesson () {
		    let self = this
		    let url = API.end_lesson

	      let postData = {
	        'lesson_id': self.lessonid
	      }

	      request.post(url, postData)
	        .then(jsonData => {
	          // 不需要判断success，在request模块中判断如果success为false，会直接reject
	          // location.href = '/v/index/course/normalcourse/manage_classroom/'+ self.courseid +'/'+ self.classroomid +'/';
	          // 跳转到课程小结页
	          location.href = '/v/index/course/normalcourse/teaching_lesson_detail/' + self.lessonid
	        })
      },
      showThumbnail() {},
      goHome() {},
      showActivity() {
        let self = this

	      self.$store.commit('set_initiativeCtrlMaskTpl', 'Activity')
	      self.$store.commit('set_isInitiativeCtrlMaskHidden', false)
	      Vue.nextTick(function () {
	        self.$refs.InitiativeCtrlMask && self.$refs.InitiativeCtrlMask.$emit('Activity')
	      })
      }
    },
    components: {
      Toolbar
    }
	}
</script>

<style lang="scss" scoped>
	@import "~@/style/_variables";
  @import "~@/style/common";
  .rc-mask-endshow{
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
    background: rgba(0,0,0,0.9);
    overflow: auto;
		z-index: 101;
    display: flex;
    flex-direction: column;
  }
  .err-wrapper{
    flex: 1;
  }
  .err-tips{
    font-size: px2rem(42px);
    color: #fff;
    line-height: px2rem(52px);
    margin-top: px2rem(240px);
    text-align: center;
    overflow: hidden;
  }
	.finish-btn {
		margin: 1rem auto;
		width: 5.0rem;
		background: none;
		border: 1px solid $white;
	}
  .continiue-tips{
    border: px2rem(2px) solid rgba(255,255,255,.2);
    padding: px2rem(38px) px2rem(52px);
    line-height: px2rem(42px);
    font-size: px2rem(30px);
    color: #fff;
    margin: px2rem(250px) auto 0 auto;
    width: px2rem(670px);
    text-align: left;
    background-color: rgba(255,255,255,.05);
  }
  .close-tips{
    border: px2rem(1px) solid rgba(255,255,255,.2);
    background-color: rgba(255,255,255,.05);
    padding: px2rem(32px) px2rem(52px);
    color: #fff;
    line-height: px2rem(42px);
    font-size: px2rem(30px);
    width: px2rem(670px);
    margin: px2rem(40px) auto;
    a{
      color: #639ef4;
      text-decoration: underline;
    }
  }
	.close-modal {
    position: absolute;
    background: none;
    height: 100%;
    z-index: 10;

    .pub-inner {
      position: absolute;
      left: 1.066667rem;
      right: 1.066667rem;
      top: 50%;
      transform: translateY(-50%);
      height: 4.5rem;
      text-align: center;
      background: $white;
      border-radius: 0.08rem;

      .title {
        height: 1.63333rem;
        line-height: 1.973333rem;
        color: #333;
      }

      .paper-title {
        color: $graybg;
      }

      .pub-btns {
        display: flex;
        align-items: center;
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        height: 1.32rem;
        border: 0.013333rem solid #C8C8C8;

        .cancel, .confirm {
          flex: 1;
        }
        .cancel {
          color: $graybg;
        }
        .confirm {
          color: #63c852;
        }
        .bar {
          width: 0.013333rem;
          min-width: 1px;
          height: 100%;
          background: #C8C8C8;
        }
      }
    }
  }
</style>

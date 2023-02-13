<!--组合错误信息面板 被父组件 home.vue 引用 -->
<template>
  <div class="err-wrapper">
  	<div v-html="errMsgList[errType]" class="err-tips"></div>
    <!-- <div v-show="errType === 2">
      {{ $t('showended') }}<br>{{ $t('showconnecting') }}
    </div> -->
    <div class="continiue-tips" v-if="errType === 2 || errType === 3">
      {{$t('jsskqzdnd')}}
    </div>
    <div class="close-tips" v-if="errType === 2 || errType === 3">
      <span>{{$t('jsskq')}}</span>
      <a @click="openModal">{{$t('djzl')}}</a>
    </div>
  	<!-- <v-touch v-if="errType === 2 || errType === 3" class="btn finish-btn" v-on:tap="openModal">{{ $t('endclass') }}</v-touch> -->
  	<div class="rc-mask close-modal" v-show="!isModalHidden">
  		<div class="pub-inner">
        <div class="title f20"><!-- 您即将结束本次授课 -->{{ $t('tciate') }}</div>
        <div class="paper-title f16"><!-- 电脑端将会同步结束授课 -->{{ $t('tsswes') }}</div>
        <div class="pub-btns f18">
          <v-touch class="cancel" v-on:tap="closeModal">{{ $t('cancel') }}</v-touch>
          <div class="bar"></div>
          <v-touch class="confirm" v-on:tap="endLesson">{{ $t('confirm') }} <!-- $t('endclass') --></v-touch>
        </div>
      </div>
  	</div>
  </div>
</template>

<script>
  import {mapGetters} from 'vuex'
	import request from '@/util/request-v3'
  import API from '@/util/api'
	import config from '@/pages/teacher/config/config'

	export default {
	  name: 'RcMaskErrormsg',
	  data () {
	    return {
	      errMsgList: config.errMsgList,
	      isModalHidden: true,						// 结束授课确认框是隐藏
	    }
	  },
    computed: {
      ...mapGetters([
        'courseid',
        'classroomid',
        'lessonid',
        'errType',
      ])
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
		    let url = API.lesson.end_lesson

	      return request.post(url)
        .then((res) => {
          if(res && res.code === 0 && res.data){
            location.href = '/m/v2/lesson/teacher/' + self.lessonid
          }
        }).catch(error => {

        })
		  },
	  }
	}
</script>

<style lang="scss" scoped>
	@import "~@/style/_variables";
  @import "~@/style/common";
  .err-wrapper{
    margin: px2rem(440px) auto 0 auto;
  }
  .err-tips{
    font-size: px2rem(42px);
    color: #fff;
    line-height: px2rem(52px);
    margin: 0 auto;
    text-align: center;
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

<!--组合错误信息面板 被父组件 remote.vue 引用 -->
<template>
  <div class="mask-content f20">
  	<div v-html="errMsgList[errType]"></div>
  	<v-touch v-if="errType === 2 || errType === 3" class="btn finish-btn" v-on:tap="openModal">{{ $t('endclass') }}</v-touch>
  	<div class="rc-mask close-modal" v-show="!isModalHidden">
  		<div class="pub-inner">
        <div class="title f20">您即将结束本次授课</div>
        <div class="paper-title f18">电脑端将会同步结束授课</div>
        <div class="pub-btns f18">
          <v-touch class="cancel" v-on:tap="closeModal">{{ $t('cancel') }}</v-touch>
          <div class="bar"></div>
          <v-touch class="confirm" v-on:tap="endLesson">{{ $t('endclass') }}</v-touch>
        </div>
      </div>
  	</div>
  </div>
</template>

<script>
	import request from '@/util/request'
  import API from '@/config/api'
	import config from '@/config/config'

	export default {
	  name: 'RcMaskErrormsg',
	  props: ['lessonid', 'courseid', 'classroomid', 'errType'],
	  data () {
	    return {
	      errMsgList: config.errMsgList,
	      isModalHidden: true,						// 结束授课确认框是隐藏
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
	  }
	}
</script>

<style lang="scss" scoped>
	@import "~@/style/_variables";
	.finish-btn {
		margin: 1rem auto;
		width: 5.0rem;
		background: none;
		border: 1px solid $white;
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
      height: 100%;
      text-align: center;
      background: $white;
      border-radius: 0.08rem;

      .title {
        height: 1.973333rem;
        line-height: 1.973333rem;
        color: $graybg;
      }

      .paper-title {
        color: #333333;
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
          color: #F40;
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

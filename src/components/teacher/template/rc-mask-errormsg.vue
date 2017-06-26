<!--组合错误信息面板 被父组件 remote.vue 引用 -->
<template>
  <div class="mask-content f20">
  	<div v-html="errMsgList[errType]"></div>
  	<v-touch v-if="errType === 2" class="btn finish-btn" v-on:tap="endLesson">结束本次授课</v-touch>
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
	      errMsgList: config.errMsgList
	    }
	  },
	  methods: {
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
</style>

<!--夺权面板 被父组件 remote.vue 引用 -->
<template>
  <div class="mask-content deprive-box f18">

    <div class="" v-show="isRobber">
      <div>当前有老师正在上课<br>您希望</div>
      <v-touch class="btn _btn" v-on:tap="tryDepriveRemote">{{isRobbing ? '正在夺权...' : '我要上课夺主权'}}</v-touch>
      <v-touch class="btn _btn" v-on:tap="gotoStu">以学生身份进入</v-touch>
      <v-touch class="btn _btn" v-on:tap="exitRC" >退出</v-touch>
    </div>

    <div class="" v-show="!isRobber">
      <div v-if="byself">您已在别处进入遥控器</div>
      <div v-else>其他老师已登录<br>您已被迫下线</div>
      <v-touch class="btn _btn" v-on:tap="exitRC">退出</v-touch>
      <v-touch v-show="!byself" class="btn _btn" v-on:tap="gotoStu">以学生身份进入</v-touch>
      <v-touch class="btn _btn" v-on:tap="tryDepriveRemote" >{{isRobbing ? '正在夺权...' : '我要夺回主权'}}</v-touch>
    </div>
    
  </div>
</template>

<script>
	import {mapGetters} from 'vuex'
	import request from '@/util/request'
  import API from '@/config/api'

	export default {
	  name: 'RcMaskDeprive',
	  props: ['courseid', 'classroomid', 'socket', 'isRobber', 'isRobbing', 'byself'],
	  data () {
	    return {
	    }
	  },
	  computed: {
      ...mapGetters([
        'lessonid',
      ])
    },
	  methods: {
	  	/**
		   * 我要上课夺主权
		   *
		   */
		  tryDepriveRemote () {
		    let self = this

		    let str = JSON.stringify({
		      'op': 'depriveremote',
		      'lessonid': self.lessonid
		    })

		    self.socket.send(str)

		    // 显示 '正在夺权...'
		    self.$emit('update:isRobbing', true)
		  },
		  /**
		   * 退出遥控器
		   *
		   * @event bindtap
		   */
		  exitRC () {
		  	let self = this

		    location.href = '/v/index/course/normalcourse/manage_classroom/'+ self.courseid +'/'+ self.classroomid +'/';
		  },
		  /**
		   * 以学生身份进入
		   *
		   * @event bindtap
		   */
		  gotoStu () {
		  	let self = this
		  	
		    location.href = '/lesson/student/'+ self.lessonid +'?force=lecture'
		  },
	  }
	}
</script>

<style lang="scss" scoped>
	@import "~@/style/_variables";
	.deprive-box {
	  ._btn {
	  	width: 4.0rem;
	  	margin: 0.8rem auto;
	  	background: none;
	  	color: $white;
	  	border: 1px solid $white;
	  }
	}
</style>

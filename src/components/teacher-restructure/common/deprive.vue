<!--夺权面板 被父组件 home.vue 引用 -->
<template>
  <div class="mask-content deprive-box f21">

    <div class="" v-show="isRobber">
      <div class="title" v-if="!noWakeuid" v-html="$t('dqlssk')"><!-- 当前有老师正在上课<br>您希望 --></div>
      <div class="title" v-else v-html="$t('dqqtlssk')"><!-- 当前有其他老师正在上课<br>您希望 --></div>
      <v-touch class="btn _btn" v-on:tap="tryDepriveRemote" style="margin-top: 1.5rem;">{{isRobbing ? $t('loading')+'...' : /*'夺取控制权'*/$t('loginagain')}}</v-touch>
      <v-touch class="btn _btn" v-on:tap="gotoStu">{{ $t('studentrole') }}</v-touch>
      <v-touch class="btn _btn" v-on:tap="exitRC" style="margin-top: 4.4rem;"><!-- 退出 -->{{ $t('dqquit') }}</v-touch>
    </div>

    <div class="" v-show="!isRobber">
      <div class="title" v-if="byself"><!-- 您已在别处进入遥控器 -->{{ $t('nybcykq') }}</div>
      <div class="title" v-else>{{ $t('otherslogin') }}<br>{{ $t('forcelogout') }}</div>
      <v-touch class="btn _btn" v-on:tap="tryDepriveRemote" style="margin-top: 1.5rem;">{{isRobbing ? $t('loading')+'...' : $t('loginagain')}}</v-touch>
      <v-touch v-show="!byself" class="btn _btn" v-on:tap="gotoStu">{{ $t('studentrole') }}</v-touch>
      
      <v-touch class="btn _btn" v-on:tap="exitRC" style="margin-top: 4.4rem;"><!-- 退出 -->{{ $t('dqquit') }}</v-touch>
    </div>
    
  </div>
</template>

<script>
	import { mapGetters, mapActions } from 'vuex'
	import request from '@/util/request'
  import API from '@/pages/teacher/config/api'

	export default {
	  name: 'Deprive',
	  props: ['isRobber', 'isRobbing', 'byself'],
	  data () {
	    return {
	    }
	  },
	  computed: {
      ...mapGetters([
      	'courseid',
      	'classroomid',
        'lessonid',
				'socket',
				'isCloneClass',
				'pretendSeizeAuth',
				'noWakeuid',
      ])
    },
	  methods: {
			...mapActions([
				'set_pretendSeizeAuth',
				'set_noWakeuid',
			]),
	  	/**
		   * 我要上课夺主权
		   *
		   */
		  tryDepriveRemote () {
				// 克隆班不能执行当前操作
        // if (!!this.isCloneClass) {
        //   this.$toast({
        //     message: this.$t('cloneTips'),
        //     duration: 3e3
        //   });
        //   return
        // }
				if(this.pretendSeizeAuth || this.noWakeuid) {
					this.pretendSeizeAuth && this.set_pretendSeizeAuth(false);
					this.noWakeuid && this.set_noWakeuid(false)
		    	this.$emit("sayhello");
					return;
				}
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
				// 克隆班不能执行当前操作
        // if (!!this.isCloneClass) {
        //   this.$toast({
        //     message: this.$t('cloneTips'),
        //     duration: 3e3
        //   });
        //   return
        // }
		  	let self = this
		    location.href = '/v/index/course/normalcourse/manage_classroom/'+ self.courseid +'/'+ self.classroomid +'/';
		  },
		  /**
		   * 以学生身份进入
		   *
		   * @event bindtap
		   */
		  gotoStu () {
				// 克隆班不能执行当前操作
        // if (!!this.isCloneClass) {
        //   this.$toast({
        //     message: this.$t('cloneTips'),
        //     duration: 3e3
        //   });
        //   return
        // }
		  	let self = this
		    location.href = '/lesson/student/'+ self.lessonid +'?force=lecture'
		  },
	  }
	}
</script>

<style lang="scss" scoped>
	@import "~@/style/_variables";
	.deprive-box {
		.title {
			width: 85%;
			margin: 0 auto;
		}
	  ._btn {
	  	width: 5.333333rem;
	  	height: 1.173333rem;
	  	line-height: 1.173333rem;
	  	margin: 0.8rem auto;
	  	background: none;
	  	color: $blue;
	  	border: 0.025rem solid $blue;
	  }
	}
</style>

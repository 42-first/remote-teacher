<!--发题选择时间面板 被父组件 home.vue 引用-->
<template>
	<div class="rc-mask">
    <section class="mask-content problemtime-box">
      <div class="block" style="margin-bottom: 0.133333rem;">
      	<div class="title f16">{{isYanshi ? $t('qxzycsx')/* '请选择延长时限' */ : $t('timelimit')/* '限时发送' */}}</div>
      	<div class="btn-box" v-show="problemType !== 'ShortAnswer'">
      		<v-touch class="btn normal_btn" v-on:tap="chooseProblemDuration(30)">30{{ $t('sec') }}</v-touch>
      		<v-touch class="btn normal_btn" v-on:tap="chooseProblemDuration(60)">1{{ $t('min') }}</v-touch>
      		<v-touch class="btn normal_btn" v-on:tap="chooseProblemDuration(120)">2{{ $t('min') }}</v-touch>
      		<v-touch class="btn normal_btn" v-on:tap="chooseProblemDuration(180)">3{{ $t('min') }}</v-touch>
      		<v-touch class="btn normal_btn" v-on:tap="chooseProblemDuration(240)">4{{ $t('min') }}</v-touch>
      		<v-touch class="btn normal_btn" v-on:tap="chooseProblemDuration(300)">5{{ $t('min') }}</v-touch>
      	</div>

      	<div class="btn-box" v-show="problemType === 'ShortAnswer'">
      		<v-touch class="btn normal_btn" v-on:tap="chooseProblemDuration(60)">1{{ $t('min') }}</v-touch>
      		<v-touch class="btn normal_btn" v-on:tap="chooseProblemDuration(180)">3{{ $t('min') }}</v-touch>
      		<v-touch class="btn normal_btn" v-on:tap="chooseProblemDuration(300)">5{{ $t('min') }}</v-touch>
      		<v-touch class="btn normal_btn" v-on:tap="chooseProblemDuration(600)">10{{ $t('min') }}</v-touch>
      		<v-touch class="btn normal_btn" v-on:tap="chooseProblemDuration(900)">15{{ $t('min') }}</v-touch>
      		<v-touch class="btn normal_btn" v-on:tap="chooseProblemDuration(1200)">20{{ $t('min') }}</v-touch>
      	</div>
      </div>

      <div class="block">
      	<div class="title f16" v-show="!isYanshi">{{$t('notimelimit')}}<!-- 不限时发送 --></div>
      	<v-touch class="btn higher_btn" v-on:tap="chooseProblemDuration(-1)">{{isYanshi ? $t('notimelimit')/*'不限时'*/ : $t('senddirectly')/*'直接发送'*/}}</v-touch>
      </div>
    </section>
    <v-touch class="btn cancel_btn higher_btn" v-on:tap="cancelPublishProblem">{{ $t('cancel') }}</v-touch>
  </div>
</template>

<script>
	export default {
	  name: 'Problemtime',
	  props: ['problemType', 'isYanshi'],
	  data () {
	    return {
	    }
	  },
	  created(){
	  },
	  methods: {
	  	/**
		   * 取消发题
		   * 涉及设置父组件 data，所以传递事件给父组件
		   *
		   * @event tap
		   */
		  cancelPublishProblem () {
		    this.$emit('cancelPublishProblem')
		  },
		  /**
	     * 点击按钮确认发送试题时间，多个按钮均使用，根据data-duration确定时限
	     * 下一步是发题的复杂操作，涉及定时器、显示柱状图等，所以传递事件给父组件
	     *
	     * @event bindtap
	     * @param {number} duration -1为不限时，以秒为单位，60为一分钟
	     */
	    chooseProblemDuration (duration) {
	      this.$emit('chooseProblemDuration', duration)
	    },
	  }
	}
</script>

<style lang="scss" scoped>
	@import "~@/style/_variables";
	/*发题蒙版*/
	.problemtime-box {
		transform: translate(-50%, -70%);
	  width: 7.733333rem;

	  .title {
	  	height: 1.04rem;
	  	text-align: left;
	  }
	  .btn-box {
	  	display: flex;
	  	flex-wrap: wrap;
	  	justify-content: space-between;

	  	.btn {
	  		width: 2.4rem;
	  		margin-bottom: 0.666667rem;
	  	}
	  }
	}
	.normal_btn {
		height: 1.106667rem;
		line-height: 1.106667rem;
	}
	.higher_btn {
		height: 1.173333rem;
		line-height: 1.173333rem;
	}
	.cancel_btn {
		position: absolute;
		left: 50%;
		bottom: 1.44rem;
		transform: translateX(-50%);
		width: 7.733333rem;
		background: $white;
		color: #333333;
	}

</style>

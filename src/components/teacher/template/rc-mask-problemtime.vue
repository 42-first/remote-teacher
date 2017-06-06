<!--发题选择时间面板-->
<template>
	<div class="rc-mask">
    <section class="mask-content problemtime-box">
      <div class="block" style="margin-bottom: 0.133333rem;">
      	<div class="title f16">限时发送</div>
      	<div class="btn-box">
      		<v-touch class="btn normal_btn">30秒</v-touch>
      		<v-touch class="btn normal_btn">1分钟</v-touch>
      		<v-touch class="btn normal_btn">2分钟</v-touch>
      		<v-touch class="btn normal_btn">3分钟</v-touch>
      		<v-touch class="btn normal_btn">4分钟</v-touch>
      		<v-touch class="btn normal_btn">5分钟</v-touch>
      	</div>
      </div>

      <div class="block">
      	<div class="title f16">不限时发送</div>
      	<v-touch class="btn higher_btn">直接发送</v-touch>
      </div>
    </section>
    <v-touch class="btn cancel_btn higher_btn" v-on:tap="cancelPublishProblem">取消</v-touch>
  </div>
</template>

<script>
	export default {
	  name: 'RcMaskProblemtime',
	  props: [],
	  data () {
	    return {
	    }
	  },
	  created(){
	  },
	  methods: {
	  	/**
		   * 取消发题
		   *
		   * @event tap
		   */
		  cancelPublishProblem () {
		    this.$emit('cancelPublishProblem')
		  },
	  }
	}
</script>

<style lang="scss" scoped>
	@import "~@/style/_variables";
	/*发题蒙版*/
	.problemtime-box {
		transform: translate(-50%, -60%);
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

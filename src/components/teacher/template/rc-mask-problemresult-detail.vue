<!--试题作答详情面板 被父组件 rc-mask-problemresult.vue 引用-->
<template>
	<div class="problemresultdetail-box">
		<div v-if="problemResultDetailData">
			<!-- 关闭按钮 -->
	    <v-touch tag="i" class="iconfont icon-close f24" v-on:tap="closeProblemresultdetail"></v-touch>
	    <div class="title f18">本题正确选项为</div>
	    <div :class="['answer-box', {'toomany': answers.length > 4}]">
	    	<div v-for="item in answers" :class="['anser-item', answers.length > 4 ? 'f36' : 'f50']">{{item}}</div>
	    </div>
	    <div class="choice-list">
	      <div class="choice-item">
	      	<div class="item-hd">x a 2ren</div>
	      	<div class="item-bd">renlibieo</div>
	      </div>
	    </div>
	    
	    <v-touch class="btn refresh-btn f17"  v-on:tap="refreshProblemResultDetail">
	    	<i class="iconfont icon-refresh f20"></i>
	    	刷新详情
	    </v-touch>
		</div>
  </div>
</template>

<script>
	export default {
	  name: 'RcMaskProblemresultDetail',
	  props: ['problemResultDetailData'],
	  data () {
	    return {
	    }
	  },
	  computed: {
	    answers: function () {
	    	// 刚开始 problemResultDetailData 为 null
	    	let result = this.problemResultDetailData ? this.problemResultDetailData.answer.split('') : []
	      return result
	    }
	  },
	  created(){
	  },
	  methods: {
	  	/**
	     * 关闭试题详情的按钮
	     * 涉及设置父组件 data，所以传递事件给父组件
	     *
	     * @event bindtap
	     */
	    closeProblemresultdetail () {
	      this.$emit('closeProblemresultdetail')
	    },
	    /**
	     * 更新试题详情的数据
	     * 点击打开详情时要主动更新一下数据，所以把真正方法放在本父组件中，这里传递事件
	     *
	     */
	    refreshProblemResultDetail(){
	      this.$emit('refreshProblemResultDetail')
	    }
	  }
	}
</script>

<style lang="scss" scoped>
	@import "~@/style/_variables";
	.problemresultdetail-box {
	  position: absolute;
	  left: 0;
	  right: 0;
	  top: 0;
	  bottom: 0;
	  background: $white;
	  color: #4A4A4A;
	  text-align: center;
	  overflow: auto;

	  .icon-close {
	  	position: absolute;
	  	right: 0.386667rem;
	  	top: 0.44rem;
	  }
	  .title {
	  	height: 2.0rem;
	  	line-height: 2.0rem;
	  }

	  .answer-box {
		  height: 3.066667rem;
		  display: flex;
		  align-items: center;
		  justify-content: center;

		  .anser-item {
		  	margin: 0 0.133333rem;
		  	width: 2.0rem;
		  	height: 2.0rem;
		  	line-height: 2.0rem;
		  	border-radius: 50%;
		  	background: $blue;
		  	color: $white;
		  }
		}
		.toomany .anser-item {
			width: 1.6rem;
		  height: 1.6rem;
		  line-height: 1.6rem;
		}

		.refresh-btn {
			position: absolute;
			left: 50%;
			bottom: 0.666667rem;
			transform: translateX(-50%);
			width: 4.093333rem;
			height: 1.466667rem;
			line-height: 1.466667rem;
		}
	}
</style>

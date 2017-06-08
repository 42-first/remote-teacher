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
	    <div class="gap"></div>
	    <div class="choice-list">
	      <div class="choice-item" v-for="(choiceItem, index) in problemResultDetailData.data">
	      	<v-touch class="item-hd" v-on:tap="toggleChoiceItem(index)">
	      		<i :class="['iconfont', 'f20', choiceItem.label === problemResultDetailData.answer ? 'icon-correct' : 'icon-wrong']"></i>
	      		<span class="f18 asw">{{choiceItem.label}}</span>
	      		<span class="f14">{{choiceItem.members.length}}人</span>
	      		<i :class="['iconfont', 'right', 'f20', index === showingIndex ? 'icon-fold' : 'icon-unfold']"></i>
	      	</v-touch>
	      	<div :class="['item-bd', {'item-hidden': index !== showingIndex}]">
	      		<div class="stu" v-for="stu in choiceItem.members">
	      			<img :src="stu.avatar" alt="">
	      			<div class="ellipsis">{{stu.name}}</div>
	      		</div>
	      	</div>
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
	    	showingIndex: -1 // 正在展示的题目的序号
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
	    },
	    /**
	     * 展示隐藏答案选项人名单
	     *
	     * @event bindtap
	     * @param {object} index 被点击的答案项的序号，从0开始
	     */
	    toggleChoiceItem (index) {
	      if (this.showingIndex === index) {
	      	// 收起
	      	this.showingIndex = -1
	      } else {
	      	this.showingIndex = index
	      }
	      
	    },
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
	  	position: fixed;
	  	right: 0.386667rem;
	  	top: 0.44rem;
	  }
	  .icon-wrong {
	  	color: #D0011B;
	  }
	  .icon-correct {
	  	color: #7ED321;
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

		.gap {
			height: 0.333333rem;
			background: #EDF2F6;
		}

		.choice-item {
			.item-hd {
				height: 1.2rem;
				line-height: 1.2rem;
				padding: 0 0.533333rem;
				background: #F6F6F6;
				text-align: left;
				border-top: 1px solid #C8C8C8;

				.asw {
					margin: 0 0.533333rem;
				}
				.right {
					float: right;
				}
			}
			/* 第一个顶部没有border */
			&:first-child .item-hd {
				border-top: 0;
			}

			.item-bd {
				margin: 0.533333rem auto 0;
				width: 8.64rem;
				text-align: left;
				overflow: hidden;

			  .stu {
			  	display: inline-block;
			  	text-align: center;
			  	margin-right: 0.57687496rem;
			  	margin-bottom: 0.8rem;
			  	width: 1.266667rem;
			  	img {
			  		width: 0.986667rem;
			  		height: 0.986667rem;
			  		border-radius: 50%;
			  		margin-bottom: 0.386667rem;
			  	}
			  	&:nth-child(5n) {
			  		margin-right: 0;
			  	}
			  	&:last-child {
			  		margin-bottom: 0;
			  	}
			  }
			}
			.item-hidden {
				height: 0;
				margin: 0;
			}
		}

		.refresh-btn {
			position: fixed;
			left: 50%;
			bottom: 0.666667rem;
			transform: translateX(-50%);
			width: 4.093333rem;
			height: 1.466667rem;
			line-height: 1.466667rem;
		}
	}
</style>

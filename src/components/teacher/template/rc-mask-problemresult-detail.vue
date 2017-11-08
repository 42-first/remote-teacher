<!--试题作答详情面板 被父组件 rc-mask-problemresult.vue 引用-->
<template>
	<div class="problemresultdetail-box allowscrollcallback">
		<div v-if="problemResultDetailData">
	    
	    <div class="title f18">{{problemResultDetailData.problem_type === 3 ? '票数最多' : '本题正确选项为'}}</div>
	    <div :class="['answer-box', {'toomany': answers.length > 4}]">
	    	<div v-for="item in answers" :class="['anser-item', answers.length > 4 ? 'f36' : 'f50']">{{item}}</div>
	    </div>
	    <div class="gap"></div>
	    <div class="choice-list">
	      <div class="choice-item" v-for="(choiceItem, index) in problemResultDetailData.data">
	      	<v-touch class="item-hd" v-on:tap="toggleChoiceItem(index)">
	      		<i v-show="problemResultDetailData.problem_type !== 3" :class="['iconfont', 'f20', choiceItem.label === problemResultDetailData.answer ? 'icon-correct' : 'icon-wrong']"></i>
	      		<span class="f18 asw">{{choiceItem.label}}</span>
	      		<span class="f14" style="color: #9B9B9B;">{{choiceItem.members.length}}人</span>
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

	    <div class="button-box f18">
	      <v-touch class="btn" v-on:tap="refreshProblemResultDetail">{{ $t('refresh') }}</v-touch>
	      <v-touch class="btn f18" v-on:tap="closeProblemresultdetail">{{ $t('back') }}</v-touch>
	    </div>
		</div>
  </div>
</template>

<script>
	import request from '@/util/request'
	import API from '@/config/api'

	let isFirstEnter = true

	export default {
	  name: 'RcMaskProblemresultDetail',
	  props: ['problemResultData'],
	  data () {
	    return {
	    	problemResultDetailData: null,          // 试题柱状图详情页数据
	    	showingIndex: -1,												// 正在展示的题目的序号
	    	problemid: 0,
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
	  	let self = this

	  	// 父组件点击 查看详情 按钮时发送事件给本子组件
	  	self.$on('refreshProblemResultDetail', function (problemid) {
	  		self.problemid = problemid
			  self.refreshProblemResultDetail()
			})
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
	    /**
	     * 更新试题详情的数据
	     * 点击打开详情时要主动更新一下数据，所以把本方法放在本父组件中
	     *
	     */
	    refreshProblemResultDetail(){
	      let self = this
	      let url = API.problem_result_detail

	      if (process.env.NODE_ENV === 'production') {
	        url = API.problem_result_detail + '/' + self.problemid + '/'
	      }

	      // 单次刷新
	      request.get(url)
	        .then(jsonData => {
	        	// 设置试卷详情数据
	          self.problemResultDetailData = jsonData

	          if (isFirstEnter) {
	          	// 新打开的时候，默认展示正确的
	          	self.openRightItem(jsonData)
	          	isFirstEnter = false
	          }

	          // 投票类型每回要算投票数最多的
	          if (jsonData.problem_type === 3) {
	          	self.findBigPoll()
	          }
	        })
	    },
	    /**
	     * 找到默认打开那一条：投票类型：人数最多；普通题目：正确选项
	     *
	     * @param {object} jsonData 详情数据
	     */
	    openRightItem (jsonData) {
	    	let self = this

	      // self.showingIndex = jsonData.problem_type === 3 ? self.findBigPoll(jsonData) : self.findRightAnswer(jsonData)

	      // 投票类型不打开默认选项
	      if (jsonData.problem_type !== 3) {
	      	self.showingIndex = self.findRightAnswer(jsonData)
	      }
	    },
	    /**
	     * 找出正确选项的序号
	     *
	     * @param {object} jsonData 详情数据
	     */
	    findRightAnswer (jsonData) {
	    	let self = this

	      for (let i = 0; i < jsonData.data.length; i++) {
        	if (jsonData.data[i].label === jsonData.answer) {
        		return i
        	}
        }
	    },
	    /**
	     * 算出投票类型的票数最多的选项
	     *
	     */
	    findBigPoll () {
	    	let self = this
	    	let GD = self.problemResultData.graph.data // 柱状图的数据
	    	let result = {
	    		'label': '',
	    		'value': -1
	    	}
	    	for (var i = 0; i < GD.length; i++) {
	    		if (result.value  === GD[i].value) {
			    	result.label += GD[i].label
	    		} else if (result.value  < GD[i].value) {
	    			result = {
			    		'label': GD[i].label,
			    		'value': GD[i].value
			    	}
	    		}
	    	}

	    	self.problemResultDetailData.answer = result.label
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
		  // align-items: center;
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

		.choice-list {
			padding-bottom: 1.466667rem;
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

		.button-box {
      display: flex;
      position: fixed;
      left: 0;
      right: 0;
      bottom: 0;
      height: 1.466667rem;
      text-align: center;

      .btn {
        flex: 1;
        border-radius: 0;
        height: 1.466667rem;
        line-height: 1.466667rem;
      }
    }
	}
</style>

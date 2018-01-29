<!--试题作答详情面板 -->
<template>
	<div class="problemresultdetail-box">
		<slot name="ykt-msg"></slot>
		<div v-if="problemResultDetailData">
	    
	    <div class="title f18">{{problemResultDetailData.problem_type === 3 || problemResultDetailData.problem_type === 8 ? $t('votemost') : $t('standardopt')}}</div>
	    <div :class="['answer-box', {'toomany': answerList.length > 4}]">
	    	<template v-if="answerList.length">
	    		<div v-for="item in answerList" :class="['anser-item', answerList.length > 4 ? 'f36' : 'f50']">{{item}}</div>
	    	</template>

	    	<div v-else-if="!isFetching"><!-- 还没有学生提交 -->{{$t('nosubmit')}}</div>
	    </div>
	    <div class="gap"></div>
	    <div v-if="problemResultDetailData.problem_type === 8" class="anonymous-hint f12"><!-- 本题为匿名投票，不显示投票人 -->{{$t('anonymouspoll')}}</div>
	    <div class="choice-list">
	      <div class="choice-item" v-for="(choiceItem, index) in problemResultDetailData.data">
	      	<v-touch class="item-hd" v-on:tap="toggleChoiceItem(index)">
	      		<template v-if="problemResultDetailData.problem_type !== 3 && problemResultDetailData.problem_type !== 8">
	      			<i v-if="!choiceItem.members[0].result_type" :class="['iconfont', 'f20', choiceItem.label === problemResultDetailData.answer ? 'icon-correct' : 'icon-wrong']"></i>
	      			<i v-if="choiceItem.members[0].result_type === 1" :class="['iconfont', 'f20', 'icon-correct']"></i>
	      			<i v-if="choiceItem.members[0].result_type === 2" :class="['iconfont', 'f20', 'icon-banduibancuo']"></i>
	      			<i v-if="choiceItem.members[0].result_type === 3" :class="['iconfont', 'f20', 'icon-wrong']"></i>
	      		</template>
	      		
	      		<span class="f18 asw">{{choiceItem.label}}</span>
	      		<span class="f14" style="color: #9B9B9B;">{{choiceItem.members.length}}{{ $t('ren') }}</span>
	      		<i :class="['iconfont', 'right', 'f20', index === showingIndex ? 'icon-fold' : 'icon-unfold']" v-if="problemResultDetailData.problem_type !== 8"></i>
	      	</v-touch>
	      	<div :class="['item-bd', {'item-hidden': index !== showingIndex}]" v-if="problemResultDetailData.problem_type !== 8">
	      		<div class="stu" v-for="stu in choiceItem.members">
	      			<img :src="stu.avatar || 'http://sfe.ykt.io/o_1bsn23hg89klt0h1lb01p63dd69.jpg'" alt="">
	      			<div class="ellipsis">{{stu.name}}</div>
	      		</div>
	      	</div>
	      </div>
	    </div>

	    <v-touch class="btn f18" :class="{'abs': !isBottomBtnFixed}" v-on:tap="refreshProblemResultDetail">{{ $t('refresh') }}</v-touch>
		</div>
  </div>
</template>

<script>
	import request from '@/util/request'
	import API from '@/pages/teacher/config/api'

	export default {
	  name: 'CollumresultDetail',
	  data () {
	    return {
	    	problemid: 0,
	    	problemResultDetailData: null,          // 试题柱状图详情页数据
	    	showingIndex: -1,												// 正在展示的题目的序号
	    	answerList: [],
	    	isBottomBtnFixed: false,
	    	isFetching: true,
	    }
	  },
	  created(){
	  	this.init()
	  },
	  mounted () {
      let self = this
      let wh = window.innerHeight

      // 如果搓到底了，不要到底，防止ios上搓露底
      let boxDom = document.querySelector('.problemresultdetail-box')

      self.isBottomBtnFixed = boxDom.scrollHeight !== boxDom.offsetHeight
      boxDom.addEventListener('scroll', e => {
      	self.isBottomBtnFixed = boxDom.scrollHeight !== boxDom.offsetHeight

        if (boxDom.scrollTop === boxDom.scrollHeight - boxDom.offsetHeight) {
          boxDom.scrollTop = boxDom.scrollTop -2
        }
      })
    },
	  methods: {
	  	/**
	     * 复用页面，需要watch route
	     *
	     */
	    init () {
		  	let self = this

		  	self.problemid = +self.$route.params.problemid
		  	self.refreshProblemResultDetail()
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
	        	// 多选题判分
	        	// https://www.tapd.cn/20392061/prong/stories/view/1120392061001001309
	        	// result_type 0 默认类型；1 多选题全对；2 多选题半对；3 多选题错误

	        	// 设置试卷详情数据
	          self.problemResultDetailData = jsonData

	          // 投票类型每回要算投票数最多的
	          if (jsonData.problem_type === 3 || jsonData.problem_type === 8) {
	          	self.findBigPoll()
	          } else {
	          	// 投票类型不打开默认选项
	          	self.openRightItem(jsonData)
	          	self.answerList = [...jsonData.answer]
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

	      self.showingIndex = self.findRightAnswer(jsonData)
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
	    	let url = API.problem_statistics

	    	if (process.env.NODE_ENV === 'production') {
	    	  url = API.problem_statistics + '/' + self.problemid + '/'
	    	}

	    	// 单次刷新
	    	request.get(url)
	    	  .then(jsonData => {
	    	  	let GD = jsonData.graph.data // 柱状图的数据
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

			    	self.isFetching = false
			    	self.problemResultDetailData.answer = result.label
			    	// self.answerList = [...result.label]
			    	if (result.value === 0) {
			    		self.answerList = []
			    	} else {
			    		self.answerList = [...result.label]
			    	}
	    	  })
	    },
	  }
	}
</script>

<style lang="scss" scoped>
	@import "~@/style/_variables";
	.problemresultdetail-box {
	  position: relative;
	  height: 100%;
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
	  .icon-banduibancuo {
	  	color: #D0011B;
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

		.anonymous-hint {
			height: 0.8rem;
			line-height: 0.8rem;
			padding: 0 1.0rem;
			background: #FCF9DC;
			text-align: left;
			color: #9B9B9B;
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
				display: flex;
			  flex-wrap: wrap;
			  justify-content: flex-start;
			  width: 9.066667rem;
			  margin: 0.533333rem auto 0;
			  overflow: hidden;

			  .stu {
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
				display: none;
			}
		}

		.btn {
		  position: fixed;
		  left: 0;
		  right: 0;
		  bottom: 0;
		  border-radius: 0;
		  height: 1.466667rem;
		  line-height: 1.466667rem;
		  box-shadow: none;
		}
		.abs {
			position: absolute;
		}
	}
</style>

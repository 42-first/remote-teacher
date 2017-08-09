<!--试题结果-主观题结果页面 被父组件 remote.vue 引用-->
<template>
	<div class="problem-root">
		<!--试题-主观题面板-->
		<div class="problemresult-box">
			<!-- 关闭按钮 -->
	    <v-touch class="close-box"  v-on:tap="closeProblemresult">
	    	<i class="iconfont icon-ykq-shiti-guanbi f24"></i>
	    </v-touch>

			<!-- 上部时钟、人数统计 -->
	    <section class="upper">
	    	<div class="f50" >
		      <img class="jishi" src="~images/teacher/jishi-dao.png" alt="">
		      <span class="time">14:50</span>
		    </div>
		    <div :class="['f18', 'yjy']">
		      已经有 <span>1</span> / <span>5</span> 位同学提交了答案
		    </div>
	    </section>

	    <!-- 中间柱状图 -->
	    <section class="histogram-box">
				主观题
	    </section>
	    
	  </div>
		
	</div>
</template>

<script>
	export default {
	  name: 'RcMaskProblemresultSubjective',
	  props: ['lessonid', 'pptData', 'current', 'socket', 'problemResultData', 'problemDurationLeft'],
	  data () {
	    return {
	    	isRedpacketListHidden: true,            // 试题的红包名单列表页面隐藏
	    }
	  },
	  computed: {
	    problemid: function () {
	      return this.pptData[this.current - 1].Problem.ProblemID
	    }
	  },
	  created(){
	  },
	  methods: {
	  	/**
	     * 模仿微信小程序的 setData 用法，简易设置data
	     *
	     * @param {object} newData
	     */
	    setData (newData) {
	      let self = this
	      Object.keys(newData).forEach(attr => {
	        self[attr] = newData[attr]
	      })
	    },
	  	/**
	     * 关闭试题柱状图的按钮
	     * 涉及设置父组件 data，所以传递事件给父组件
	     *
	     * @event bindtap
	     */
	    closeProblemresult () {
	    	this.$emit('closeProblemresult')
	    },
	    /**
	     * 试题柱状图页面中的 投屏 按钮
	     *
	     * @event bindtap
	     */
	    postProblemresult () {
	      let self = this

	      let str = JSON.stringify({
	        'op': 'postproblemresult',
	        'lessonid': self.lessonid,
	        'problemid': self.problemid
	      })

	      self.socket.send(str)
	    },
	    
	  }
	}
</script>

<style lang="scss" scoped>
	@import "~@/style/_variables";
	.problem-root {
		height: 100%;
	}
	.problemresult-box {
	  position: relative;
	  display: flex;
	  flex-direction: column;
	  justify-content: space-between;
	  height: 100%;
	  text-align: center;
	  color: $white;
	  background: #000000;
		
		.close-box {
			position: absolute;
	  	right: 0.386667rem;
	  	top: 0.44rem;
	  	width: 1.066667rem;
	  	height: 1.066667rem;
		}
		
		/* 上部 */
	  .upper {
	  	margin: 0 auto;
	  	width: 8.8rem;
	  	height: 4.0rem;
	  	padding-top: 0.8rem;
	  	border-bottom: 1px solid #cccccc;
			
			.jishi {
				margin-top: -0.186667rem;
				width: 0.9rem;
				vertical-align: middle;
			}
			.yjy {
				padding-top: 0.5rem;
			}
	  	.pt {
	  		padding-top: 1.6rem;
	  	}
	  }
		
	}
</style>

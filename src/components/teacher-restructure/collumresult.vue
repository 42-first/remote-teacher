<!--试题柱状图页-->
<template>
	<div class="problem-root">
		<slot name="ykt-msg"></slot>
		<!--试题柱状图面板-->
		<div class="problemresult-box">
			<!-- 上部时钟、人数统计 -->
	    <section class="upper">
	    	<div class="f50">
		      <img v-if="!~limit" class="jishi" src="~images/teacher/jishi-zheng.png" alt="">
		      <img v-else class="jishi" src="~images/teacher/jishi-dao.png" alt="">
		      <span class="time">{{durationLeft}}</span>
		    </div>
		    <div :class="['f18', 'yjy']">
		      已经有 <span>{{total}}</span> / <span>{{members}}</span> 位同学提交了答案
		    </div>
	    </section>

	    <!-- 中间柱状图 -->
	    <section class="histogram-with-mahint">
	    	<section class="mahint" v-if="problemType === 'MultipleChoiceMA'">
	    		<div class="mahint-item f12">
	    			<i style="background: #F5A623;"></i>
	    			本题答案
	    		</div>

	    		<div class="mahint-item f12">
	    			<i style="background: #639EF4;"></i>
	    			正确选项
	    		</div>

	    		<div class="mahint-item f12">
	    			<i style="background: #C8C8C8;"></i>
	    			错误选项
	    		</div>
	    	</section>

  	    <section class="histogram-box">
  	    	<div class="histogram-item" v-if="problemType === 'MultipleChoiceMA'">
  	        <div class="bar maright" :style="{height: ma_right_count.value/total*100+'%'}">
  	          <span class="value f18">{{ma_right_count.value}}</span>
  	          <span class="label f18">{{ma_right_count.label}}</span>
  	        </div>
  	      </div>
  				<div class="histogram-item" v-for="item in graph">
  	        <div :class="['bar', {'right': item.isRight}]" :style="{height: item.value === 0 ? 0 : item.value/total*100+'%'}">
  	          <span class="value f18">{{item.value}}</span>
  	          <span class="label f18">{{item.label}}</span>
  	        </div>
  	      </div>
  	    </section>
	    </section>
	    

	    <!-- 下方按钮 -->
	    <section :class="['group-btns', {'istoupiao': ~problemType.indexOf('Polling')}]">
	      <v-touch class="btn-item" v-on:tap="postProblemresult">
	      	<div class="iconbox" style="background: #28CF6E;">
	      	  <i class="iconfont icon-shiti_touping f28"></i>
	      	</div>
	        <div class="btn-desc f14">投屏</div>
	      </v-touch>

	      <router-link tag="div" :to="{name: 'collumresult-detail', params: { problemid: problemid }}" class="btn-item">
	        <div class="iconbox" style="background: #EEBC28;">
	      	  <i class="iconfont icon-shiti_chakanxiangqing f28"></i>
	      	</div>
	        <div class="btn-desc f14">查看详情</div>
	      </router-link>

	      <router-link tag="div" :to="{name: 'redpacket', params: { problemid: problemid }}" v-show="!~problemType.indexOf('Polling') && !~RedEnvelopeID" class="btn-item">
	        <div class="iconbox" style="background: #E64340;">
	      	  <i class="iconfont icon-shiti_hongbao f28" style="color: #DCBC83;"></i>
	      	</div>
	        <div class="btn-desc f14">课堂红包</div>
	      </router-link>

	      <router-link tag="div" :to="{name: 'redpacketlist', params: { redid: RedEnvelopeID }}" v-show="!~problemType.indexOf('Polling') && ~RedEnvelopeID" class="btn-item">
	        <div class="iconbox" style="background: #E64340;">
	      	  <i class="iconfont icon-shiti_hongbao f28" style="color: #DCBC83;"></i>
	      	</div>
	        <div class="btn-desc f14">红包名单</div>
	      </router-link>
	    </section>
	  </div>
		
	</div>
</template>

<script>
	import {mapGetters} from 'vuex'
	import {sec2str} from './util/util'
	import request from '@/util/request'
	import API from '@/pages/teacher/config/api'

	let durationTimer = null 			// 处理计时的定时器
	let refProblemTimer = null    // 刷新试题柱状图的定时器
	let refProblemTimerNum = 0    // 刷新试题柱状图的辅助数字
	let initTime = 1              // 初始时间 秒
	let START, NOW, newTime       // 进入页面的本机时间，倒计时过程中本机实时时间，计时器应该显示的时间


	export default {
	  name: 'Collumresult',
	  data () {
	    return {
	    	problemid: -1,
		    problemType: '',               // 当前页题目的类型 单选题: MultipleChoice; 多选题: MultipleChoiceMA; 投票题: Polling
		    durationLeft: '--:--',         // 题目的倒计时剩余时间
		    total: '--',                   // 提交的人数
		    members: '--',                 // 参与上课的人数
		    graph: [],                     // 柱状图数据
		    ma_right_count: {},            // 多选题答案及人数
		    limit: '',                     // 设置的限时 -1 为未限时 单位 秒
		    RedEnvelopeID: -1,             // 红包的id
	    }
	  },
	  computed: {
	    ...mapGetters([
        'lessonid',
        'socket',
      ])
	  },
	  created(){
	  	this.init()
	  },
	  beforeDestroy(){
	    this.shutDown()
	  },
	  watch: {
	  	'$route' () {
	  		this.init()
	  	}
	  },
	  methods: {
	  	/**
	     * 复用页面，需要watch route
	     *
	     */
	    init () {
		  	let self = this
		  	let params = self.$route.params
        let query = self.$route.query

		    self.problemid = +params.problemid
		    self.problemType = query.pt
		    self.limit = +query.lm

		    initTime = +query.tl <= 0 ? 0 : +query.tl
		    START = +new Date()
		    newTime = initTime

		    if (self.limit === -1 && newTime === 0) {
          newTime = 1
        }

        if (self.limit === -1 && initTime === 0) {
          initTime = 1
        }

	    	self.refreshProblemResult()
	    	self.handleDuration()
	    },
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
		   * 将秒数转换成 MM:SS 格式
		   *
		   * @param {number} sec 秒数
		   */
		  sec2str,
		  /**
		   * 发试题后设置刷新柱状图倒计时页面的定时器
		   *
		   */
		  refreshProblemResult(){
		    let self = this
		    // 先立即获取一次数据
		    self.getProblemResult()

		    clearInterval(refProblemTimer);
		    refProblemTimer = setInterval(function(){
		      if(self.limit !== -1 && newTime <= 0){
		        self.endTimers()
		      }

		      refProblemTimerNum++;
		      if(refProblemTimerNum%3 == 0){
		        self.getProblemResult()
		      }
		    }, 1000);
		  },
		  /**
		   * 发试题后request获取柱状图倒计时页面的数据
		   *
		   */
		  getProblemResult(){
		    let self = this

		    let url = API.problem_statistics

	      if (process.env.NODE_ENV === 'production') {
	        url = API.problem_statistics + '/' + self.problemid + '/'
	      }

	      request.get(url)
	      	.then(jsonData => {

	      		let _answer = jsonData.answer
	      		let _graph = jsonData.graph.data
	      		_graph.forEach(item => {
	      		  item.isRight = new RegExp(item.label).test(_answer)
	      		  return item
	      		})

	      		if(jsonData.success){
	      		  self.setData({
	      		    total: jsonData.total,
	      		    members: jsonData.members,
	      		    graph: _graph,
	      		    ma_right_count: jsonData.graph.ma_right_count,
	      		    RedEnvelopeID: jsonData.RedEnvelopeID || -1
	      		  })
	      		}
	      	}).catch(error => {
	      		console.error('error', error)
	      	})
		  },
		  /**
       * 处理计时
       *
       */
      handleDuration () {
        let self = this

        clearInterval(durationTimer)
        self.setData({
          durationLeft: self.sec2str(newTime)
        })

        durationTimer = setInterval(function(){
          if(self.limit !== -1 && newTime <= 0){
            clearInterval(durationTimer)
          }

          //更新闹钟时间
          NOW = +new Date()
          let diff = Math.round((NOW - START)/1000)
          newTime = self.limit !== -1 ? initTime - diff : initTime + diff
          self.setData({
            durationLeft: self.sec2str(newTime)
          })
        }, 1000)
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
	    /**
	     * 关闭页面时关闭定时器、投屏等的总开关
	     *
	     */
	    shutDown () {
	      let self = this
	      this.endTimers()

	      // 关闭试题柱状图的投屏
	      let str = JSON.stringify({
	        'op': 'closeproblemresult',
	        'lessonid': self.lessonid,
	        'problemid': self.problemid
	      })

	      self.socket.send(str)
	    },
	    /**
	     * 归零、结束定时器等
	     *
	     */
	    endTimers () {
	      // 关闭刷新柱状图的定时器
	      clearInterval(refProblemTimer)
	      refProblemTimerNum = 0
	      clearInterval(durationTimer)
	    },
	  }
	}
</script>
<!-- TODO 柱状图滑动 icon图片？ -->
<style lang="scss" scoped>
	@import "~@/style/_variables";
	.problem-root {
		height: 100%;
		min-height: 100%;
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
		
		/* 上部 */
	  .upper {
	  	margin: 0 auto;
	  	width: 8.8rem;
	  	height: 4.0rem;
	  	padding-top: 0.8rem;
	  	// border-bottom: 1px solid #cccccc;
			
			.jishi {
				margin-top: -0.186667rem;
				width: 0.9rem;
				vertical-align: middle;
			}
			.yjy {
				padding-top: 0.5rem;
				color: #AAAAAA;
			}
	  }
		
	  /* 中间柱状图 */
	  .histogram-with-mahint {
	  	flex: 1;
	  	margin: 1.0rem auto;
	  	width: 8.8rem;
	  	border-top: 1px solid #cccccc;
	  }
	  .mahint {	 
	  	display: flex;
	  	align-items: center;
	  	padding-left: 0.266667rem; 	
	  	height: 0.693333rem;
	  	background: linear-gradient(rgba(255,255,255,0.12) 10%, rgba(255,255,255,0.03));

	  	.mahint-item {
	  		margin-right: 0.666667rem;

	  		i {
	  			display: inline-block;
	  			width: 0.266667rem;
	  			height: 0.266667rem;
	  		}
	  	}
	  }
	  .histogram-box {
	  	margin: 0 auto;
	  	padding-top: 1rem;
	  	width: 8.8rem;
	  	height: 100%;
		  display: flex;
		  justify-content: space-between;
		  align-items: bottom;
		  
		  .histogram-item {
			  flex: 1;
			  position: relative;
			  border-bottom: 1px solid $white;

			  .bar {
				  position: absolute;
				  left: 50%;
				  bottom: 0.173333rem;
				  transform: translateX(-50%);
				  width: 0.8rem;
				  background-color: #C8C8C8;

					span {
					  position: absolute;
					  width: 100%;
					  left: 0;
					  text-align: center;
					  color: #fff;
					}
					.value {
					  top: -0.746667rem;
					}
					.label {
					  bottom: -1.0rem;
					}
				}
				.right {
				  background-color: $blue;
				}
				.maright {
				  background-color: #F5A623;
				  span {
				  	color: #F5A623;
				  }
				}
			}
		}
		
		/* 下方按钮 */
		.group-btns {
			margin: 0 auto;
		  display: flex;
		  align-items: center;
		  justify-content: space-between;
		  width: 7.466667rem;
		  padding: 1.2rem 0 0.5rem;

		  .btn-item {
			  width: 1.8rem; 
			  text-align: center;
			  color: #fff;

			  .iconbox {
			  	margin: 0 auto 0.4rem;
			  	width: 1.493333rem;
			  	height: 1.493333rem;
			  	line-height: 1.493333rem;
			  	text-align: center;
			  	border-radius: 50%;

			  	.iconfont {
			  		color: $white;
			  	}
			  }
			}
		}
		.istoupiao {
			width: 6.2rem;
		}
	}
</style>

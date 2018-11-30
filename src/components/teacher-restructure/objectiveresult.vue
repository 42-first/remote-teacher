<!--试题柱状图页-->
<template>
	<div class="problem-root">
		<slot name="ykt-msg"></slot>
		<!-- 教师遥控器引导查看答案、续时 -->
    <!-- <GuideDelay
      v-show="!isGuideDelayHidden"
    ></GuideDelay> -->

		<!--试题柱状图面板-->
		<div class="problemresult-box">
			<!-- 上部时钟、人数统计 -->
			<Rolex
        :limit="limit"
        :newTime="newTime"
        :durationLeft="durationLeft"
        :total="total"
        :members="members" 
				:problemid="problemid" 
				:isTouping="isTouping"
				:problemtype="problemType"
				@showresult = "showresult" 
        @yanshi="yanshi"
        @shouti="shouti"
      ></Rolex>
      <!-- 填空题条形图 -->
      <template v-if="problemType === 'FillBlank'"> 
        <FillblankBox class="FillblankBox"
          :total="total"
          :correctNum="correct_students.length"
          :result_graph="result_graph"
        ></FillblankBox>
      </template>

	    <!-- 单选多选 中间柱状图 -->
      <template v-else>
        <CollumBox class="CollumBox"
          :total="total"
          :problemType="problemType"
          :graph="graph"
					:ma_right_count="ma_right_count"
        ></CollumBox>
      </template>
	    


	    <!-- 下方按钮 -->
	    <section :class="['group-btns', {'istoupiao': ~problemType.indexOf('Polling') || ~problemType.indexOf('FillBlank')}]">
	      <v-touch class="btn-item" v-on:tap="handlePostProblemresult(isTouping)">
	      	<div class="iconbox" style="background: #28CF6E;">
	      	  <i class="iconfont icon-shiti_touping f28"></i>
	      	</div>
	        <div class="btn-desc f14">{{ $tc('screenmodeonoff', !isTouping) }}</div>
	      </v-touch>

				<router-link v-if="problemType === 'FillBlank'" tag="div" :to="{name: 'fillblankresult-detail', params: { problemid: problemid }}" class="btn-item">
	        <div class="iconbox" style="background: #EEBC28;">
	      	  <i class="iconfont icon-shiti_chakanxiangqing f28"></i>
	      	</div>
	        <div class="btn-desc f14">{{ $t('viewdetails') }}</div>
	      </router-link>

	      <router-link v-else tag="div" :to="{name: 'collumresult-detail', params: { problemid: problemid }}" class="btn-item">
	        <div class="iconbox" style="background: #EEBC28;">
	      	  <i class="iconfont icon-shiti_chakanxiangqing f28"></i>
	      	</div>
	        <div class="btn-desc f14">{{ $t('viewdetails') }}</div>
	      </router-link>

	      <router-link tag="div" :to="{name: 'redpacket', query: { problemid: problemid }}" v-show="!~problemType.indexOf('Polling') && !~RedEnvelopeID && !~problemType.indexOf('FillBlank')" class="btn-item">
	        <div class="iconbox" style="background: #E64340;">
	      	  <i class="iconfont icon-shiti_hongbao f28" style="color: #DCBC83;"></i>
	      	</div>
	        <div class="btn-desc f14">{{ $tc('classbonusBonuslist',RedEnvelopeID) }}</div>
	      </router-link>

	      <router-link tag="div" :to="{name: 'redpacketlist', params: { redid: RedEnvelopeID }}" v-show="!~problemType.indexOf('Polling') && ~RedEnvelopeID" class="btn-item">
	        <div class="iconbox" style="background: #E64340;">
	      	  <i class="iconfont icon-shiti_hongbao f28" style="color: #DCBC83;"></i>
	      	</div>
	        <div class="btn-desc f14">{{ $tc('classbonusBonuslist',~RedEnvelopeID) }}</div>
	      </router-link>
	    </section>
	  </div>

	  <!-- 发题选时间蒙版 -->
		<Problemtime v-show="!isProblemtimeHidden"
		  :problem-type="problemType"
		  :isYanshi="true"
		  @cancelPublishProblem="cancelPublishProblem"
		  @chooseProblemDuration="yanshiProblem"
		></Problemtime>
	</div>
</template>

<script>
	import {mapGetters} from 'vuex'
	import {sec2str} from './util/util'
	import request from '@/util/request'
	import API from '@/pages/teacher/config/api'
	import config from '@/pages/teacher/config/config'

	// 时钟组件
	import Rolex from '@/components/teacher-restructure/common/rolex'
  // 试题延时
  import Problemtime from '@/components/teacher-restructure/common/problemtime'
  // 中间条形图
  import FillblankBox from '@/components/teacher-restructure/common/fillblank-box'
  // 中间柱状图
	import CollumBox from '@/components/teacher-restructure/common/collum-box'
  
	// 教师遥控器引导查看答案、续时
	import GuideDelay from '@/components/teacher-restructure/common/guide-delay'
	
	import hideSomeInfo from '@/components/teacher-restructure/common/hideSomeInfo'

	let durationTimer = null 			// 处理计时的定时器
	let refProblemTimer = null    // 刷新试题柱状图的定时器
	let refProblemTimerNum = 0    // 刷新试题柱状图的辅助数字
	let initTime = 1              // 初始时间 秒
	let START, NOW, newTime       // 进入页面的本机时间，倒计时过程中本机实时时间，计时器应该显示的时间

	let routeStamp = 0 						// 首次进入本路由时时间戳
	const ISCOLLECTED = -200				// 用数字 -200 标记已经收题
	const operationType = {
		shouti: Symbol(),
		yanshi: Symbol()
	}
	const timeList = {
		'30': '30秒',
		'60': '1分钟',
		'120': '2分钟',
		'180': '3分钟',
		'240': '4分钟',
		'300': '5分钟',
		'600': '10分钟',
		'900': '15分钟',
		'1200': '20分钟',
		'-1': '不限时'
	}

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
		    newTime: 100,									 // 当前剩余时间，用于判读是否剩余5秒
		    isProblemtimeHidden: true, 		 // 延时面板隐藏
				isTouping: false,							 // 当前正在投屏
        showAnswer: false,             // 投屏现实答案
        is_sensitive: false,					 // true代表该填空题顺序敏感，可以展示每个空的填写情况;false代表不敏感，不能展示每个空的填写情况
				result_graph: {},
				correct_students: [],
	    }
	  },
	  computed: {
	    ...mapGetters([
        'lessonid',
        'socket',
        'isGuideDelayHidden',
      ])
	  },
	  components: {
	    Problemtime,
			GuideDelay,
      FillblankBox,
      CollumBox,
			Rolex
	  },
	  created(){
	  	this.init()
	  },
	  beforeDestroy(){
	    this.endTimers()
	    T_PUBSUB.unsubscribe('pro-msg')
	  },
	  watch: {
	  	'$route' () {
	  		this.init()
	  	}
	  },
	  methods: {
	  	/**
	     * 取消延时
	     *
	     */
	    cancelPublishProblem () {
	      let self = this

	      setTimeout(() => {
	      	self.isProblemtimeHidden = true
	      }, 100)
	    },
	    /**
	     * 延时题目
	     *
	     * @param {number} duration -1为不限时，以秒为单位，60为一分钟
	     */
	    yanshiProblem (duration) {
	      let self = this

	      setTimeout(() => {
	      	self.isProblemtimeHidden = true
	      }, 100)

	      let postData = {
	      	'op': 'extendtime',
	      	'limit': duration,
 					'problemid': self.problemid
	      }

	      self.problemOperation(postData)
	      	.then(() => {
	      		console.log(duration, timeList[duration])
	      		// let msg = i18n.locale === 'zh_CN' ? `延时${timeList[duration]}成功` : 'Successful'
						let time = ''
						if(duration > 30){
							time = duration / 60 + '分钟'
						}else if(duration == 30) {
							time = duration + '秒'
						} else {
							time = '不限时'
						}
						let msg = i18n.locale === 'zh_CN' ? `延时${time}成功` : 'Successful'
	      		T_PUBSUB.publish('ykt-msg-toast', msg);
	      	})
	    },
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

		    let storedPosting = localStorage.getItem('posting-problem'+self.problemid)

        self.isTouping = storedPosting === 'true'

		    routeStamp = query._t
		    START = +new Date()

		    // 如果有 storage 存储，说明之前进去过
		    // 如果是倒计时， 之前显示的时间 - 计算时间差
		    // 如果是正计时， 之前显示的时间 + 计算时间差
		    // 被通知续时的话，如果在当前页直接处理，如果不在当前页，处理 storage

		    // 使用 storage 机制主要是为了处理当前在计时页，然后进入红包等子页面后又回退的情况
		    // 发题进来，或查看答案进来， storage 中都不会有该题在当前时间戳的数据

		    // localStorage-duration-info
		    // 如果是从发送试题或者查看答案进入本页面的话，会带有最新的时间戳： routeStamp
		    // 详见 showProblemResult 函数中的 query 参数: _t
		    let stoDurInfo = localStorage.getItem('durInfo'+self.problemid+routeStamp)

		    if (stoDurInfo) {
		    	let arr = stoDurInfo.split('|')
		    	let limit = +arr[0]
		    	let timeStamp = +arr[1]
		    	let newTime = +arr[2]
		    	let diff = Math.round((+new Date() - +new Date(timeStamp))/1000)

		    	self.limit = limit
		    	// 如果限时，就让 initTime 更小，这样 initTime 可能为负数或正数或0
		    	// 不管限时不限时，只要已经收题，就拿 -200 - diff，这样 initTime 必然为负数
		    	if (~limit || newTime === ISCOLLECTED) {
		    		initTime = newTime - diff
		    	} else {
		    		initTime = newTime + diff
		    	}
		    } else {
		    	self.limit = +query.lm
		    	initTime = +query.tl
		    }

		    newTime = initTime

	    	self.refreshProblemResult()
	    	// 初始化时使用完计时的 storage 后，清理掉本题相关的，然后在下面
	    	// 的 handleDuration 中又立即设置了 storage，
	    	// 防止刚进入本页面立即进入课堂红包等子页面再返回后没有 storage 信息
	    	self.cleanDurInfoStorage()
	    	self.handleDuration()
	    	self.handlePubSub()
	    },
	    /**
       * 处理计时
       *
       */
      handleDuration () {
        let self = this

        // 应对页面进入其他路由后又返回的情况
        let str = `${self.limit}|${+new Date()}|${newTime}`
        localStorage.setItem('durInfo'+self.problemid+routeStamp, str)

        clearInterval(durationTimer)
        self.setData({
          durationLeft: self.sec2str(newTime),
          newTime
        })

        durationTimer = setInterval(function(){
          if(newTime <= 0){
            clearInterval(durationTimer)
            return;
          }

          //更新闹钟时间
          NOW = +new Date()
          let diff = Math.round((NOW - START)/1000)
          newTime = self.limit !== -1 ? initTime - diff : initTime + diff

          // 应对页面进入其他路由后又返回的情况
          let str = `${self.limit}|${+new Date()}|${newTime}`
          localStorage.setItem('durInfo'+self.problemid+routeStamp, str)

          self.setData({
            durationLeft: self.sec2str(newTime),
            newTime
          })
        }, 1000)
      },
      /**
       * 收题、延时等操作导致的重置计时初始值
       *
       * 所有状态下都能收题（除非已经收题或时间已到）
			 * 所有状态下都能延时（除非不限时）
			 * 限时后，能再改为不限时
			 *
			 * 延时规则：https://www.tapd.cn/20392061/prong/stories/view/1120392061001000893
			 * 原来是倒计时，设置为不限时，时间从最初发题算
			 * 从已经收题，变成不限时，时间从最初发题算
			 * 从时间到，设置为不限时，时间从最初发题算
			 * 原来是倒计时，增加时间，直接增加剩余时间
			 * 从已经收题，变成限时，开始新的倒计时
			 * 从时间到，设置限时，开始新的倒计时
			 *
			 * @param {Symbol} optype 导致重新设置时间的操作：收题 || 延时
			 * @param {Object} newConfig 延时的设置, 就是小幺鸡 extendtime 的 problem 字段的值
			 * {
       *   "type": "problem",
       *   "prob": 12,             // Problem ID
       *   "pres": 21,             // Presentation ID
       *   "sid": 1,               // SlideId
       *   "dt": 1453348909053,    //第一次发送试题的时间戳 毫秒
       *   "limit": 100,           //-1为不限时，总的限时时间。秒
       *   "now": 1453348909053,   //当前时间 毫秒
       *   "extend": 10            //本次续时时间 秒
	     * }
       */
      resetTiming (optype, newConfig) {
        let self = this

        if (optype === operationType['shouti']) {
        	// 收题回调：立即清理 计时、轮询定时器，设置时间为 0
				  // 由于使用了 storage 机制，也需要立即处理 storage
				  // 不改变的：收题不改变是否限时的状态，限时不限时都可以收题
				  // 注意：无论正计时倒计时，收题或时间到后不再显示时间或时间到，统一为 “作答时间结束”
          //
        	self.endTimers()
        	newTime = ISCOLLECTED // 设为 -200，小于0， 会显示“作答时间结束”

        	self.setData({
        	  durationLeft: self.sec2str(newTime),
        	  newTime
        	})

        	// 应对页面进入其他路由后又返回的情况
        	let str = `${self.limit}|${+new Date()}|${ISCOLLECTED}`
        	localStorage.setItem('durInfo'+self.problemid+routeStamp, str)

        } else if (optype === operationType['yanshi']) {
        	// 重新设置限时回调
				  // 应该重置当前的时间，
				  // 但是定时器也在走，也需要处理影响定时器的数据，比如初始时间，时间差
				  // 由于使用了 storage 机制，也需要立即处理 storage

        	let tempTime
        	let fromBegan = Math.round((newConfig.now - newConfig.dt)/1000)
        	newConfig.limit = Math.round(newConfig.limit)

        	if (newConfig.limit === -1) {
        		tempTime = fromBegan
        	} else {
        		tempTime = newConfig.limit - fromBegan
        	}

        	// 重置后权当重新进入页面重启
        	self.endTimers()
        	let str = `${newConfig.limit}|${+new Date()}|${tempTime}`
        	localStorage.setItem('durInfo'+self.problemid+routeStamp, str)
        	self.init()
        }
      },
	    /**
       * 处理发布订阅
       *
       */
      handlePubSub () {
        let self = this

        // 订阅前清掉之前可能的订阅，避免多次触发回调
        T_PUBSUB.unsubscribe('pro-msg')

        // 从模态框组件传来，H5收题事件
        T_PUBSUB.subscribe('pro-msg.shoutih5', (_name, msg) => {
          self.problemid === msg.problemid && self.shoutiConfirm()
        })

        // 从 node 传来， 试题投屏事件
        T_PUBSUB.subscribe('pro-msg.postproblemresult', (_name, msg) => {
          self.problemid === msg.problemid && self.toggleTouping(true)
        })

        // 从 node 传来， 试题取消投屏事件
        T_PUBSUB.subscribe('pro-msg.closeproblemresult', (_name, msg) => {
          self.problemid === msg.problemid && self.toggleTouping(false)
        })

        // 从 node 传来， pc收题事件
        T_PUBSUB.subscribe('pro-msg.shoutipc', (_name, msg) => {
          self.problemid === msg.problemid && self.resetTiming(operationType['shouti'])
        })

        // 从 node 传来，pc 延时事件
        T_PUBSUB.subscribe('pro-msg.yanshipc', (_name, msg) => {
          self.problemid === +msg.prob && self.resetTiming(operationType['yanshi'], msg)
        })

        // 从 node 传来，有学生断网重连提交答案了
        T_PUBSUB.subscribe('pro-msg.newsubmit', (_name, msg) => {
        	self.problemid === +msg.prob && self.getProblemResult()
        })
      },
      /**
	     * 切换 投屏 取消投屏
	     *
	     * @param {boolean} status true 已经投屏
	     */
	    toggleTouping (status) {
	    	let self = this
				self.isTouping = status
	    	localStorage.setItem('posting-problem'+self.problemid, status)
	    },
	    /**
	     * 清理 storage 中旧的 durInfo
	     *
	     */
	    cleanDurInfoStorage () {
	    	let self = this
	    	let re =  new RegExp('durInfo'+self.problemid)

	      Object.keys(localStorage).forEach(key => {
	        if (re.test(key)) {
	        	localStorage.removeItem(key)
	        }
	      })
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
		      if(newTime <= 0){
		        self.endTimers()
		        return;
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
        
        let url = ''

        if(self.problemType === 'FillBlank') {
          url = API.fill_blank_problem_statistics + '/' + self.problemid + '/'
        }else {
          url = API.problem_statistics + '/' + self.problemid + '/'
        }

	      // if (process.env.NODE_ENV === 'production') {
	      //   url = url + '/' + self.problemid + '/'
	      // }

	      request.get(url)
	      	.then(jsonData => {
            if(self.problemType === 'FillBlank'){
              jsonData = jsonData.data
	      		  self.setData({
	      		    total: jsonData.total,
	      		    members: jsonData.members,
								RedEnvelopeID: jsonData.RedEnvelopeID || -1,
								is_sensitive: jsonData.is_sensitive,
								result_graph: jsonData.result_graph,
								correct_students: jsonData.correct_students,
	      		  })
            }else {
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
            }
	      		
	      	}).catch(error => {
	      		console.error('error', error)
	      	})
		  },
      /**
	     * 延时
	     *
	     * @event bindtap
	     */
	    yanshi () {
	      let self = this

	      self.isProblemtimeHidden = false
	    },
      /**
	     * 收题
	     *
	     * @event bindtap
	     */
	    shouti () {
	      let self = this

	      T_PUBSUB.publish('ykt-msg-modal', {msg: config.pubsubmsg.modal[1], mark: self.problemid})
	    },
	    /**
	     * 收题
	     *
	     * @event bindtap
	     */
	    shoutiConfirm () {
	      let self = this

	      let postData = {
	      	'op': 'problemfinished',
 					'problemid': self.problemid
	      }

	      self.problemOperation(postData)
	    },
	    /**
	     * 收题、延时等具体请求的执行
	     *
	     * @event bindtap
	     * @param {Object} postData 请求数据
	     */
	    problemOperation (postData) {
	      let self = this

	      let url = API.delay_problem
	      return request.post(url, postData)
	      	.then(jsonData => {
	      		if (jsonData.success) {
	      			let optype = postData.op === 'extendtime' ? 'yanshi' : 'shouti'
	      			// 因为是单通，node会通知的，编码处理2遍，简单的解决是统一等node通知
	      			// self.resetTiming(operationType[optype], postData.limit)
	      		} else {
	      			let str = (postData.op === 'extendtime' ? '延时' : '收题')+ `失败${self.problemid}`
	      			throw new Error(str)
	      		}
	      	}).catch(error => {
	      		console.error('error', error)
	      	})
	    },
	    /**
	     * 试题柱状图页面中的 投屏 按钮
	     *
	     * @event bindtap
	     * @param {boolean} isTouping true 正在投屏，要取消投屏
	     */
	    handlePostProblemresult (isTouping) {
	      let self = this
				this.isTouping = isTouping
	      let op = !isTouping ? 'postproblemresult' : 'closeproblemresult'
	      let str = JSON.stringify({
	        op,
	        'lessonid': self.lessonid,
					'problemid': self.problemid,
					'showresult': this.showAnswer
	      })
	      self.socket.send(str)
			},
			//  捕获 hidesomeinfo 组件的change事件改变 showanswer 状态
			showAnswerChange(val) {
				this.showAnswer = val
			}, 
	    /**
	     * 关闭页面时关闭定时器、投屏等的总开关
	     *
	     */
	    shutDown () {
	      let self = this

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
			showresult(e) {
				this.showAnswer = !!e
			}
	  }
	}
</script>
<!-- TODO 柱状图滑动 icon图片？ -->
<style lang="scss" scoped>
	@import "~@/style/_variables";
	@import "~@/style/common";
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

	  /* 调整中间条形头的高度 */
		.FillblankBox {
			flex: 1;
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
	.rc-mask {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background: rgba(0,0,0,0.9);
    overflow: auto;

    .mask-content {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 100%;
      text-align: center;
      transform: translate(-50%, -50%);
      color: $white;
    }
  }
</style>

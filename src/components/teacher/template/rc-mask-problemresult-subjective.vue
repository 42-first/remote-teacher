<!--试题结果-主观题结果页面 被父组件 remote.vue 引用-->
<template>
	<div class="problem-root" :class="{'allowscrollcallback': !isScoring}" v-scroll="onScroll">
		<v-touch v-show="isBigpicShown" class="bigpic-mask" v-on:tap="hideBigpic">
      <img :src="bigpicUrl" :class="[isWider ? 'w100' : 'h100']" alt="">
    </v-touch>
		<v-touch v-on:tap="refreshSubjectivelist" class="new-item-hint f15" :class="isShowNewHint ? 'hintfadein' : 'hintfadeout' ">{{ $t('newans') }}</v-touch>

		<v-touch class="back-top-btn" v-on:tap="back2Top" v-show="isShow2TopBtn">
			<img class="jishi" src="~images/teacher/back-top.png" alt="">
		</v-touch>
		<!-- 打星星 -->
		<StarPanel
			ref="StarPanel"
			@giveScore="giveScore"
			@cancelScore="cancelScore"
		></StarPanel>

		<!--试题-主观题面板-->
		<div id="subjective-wrapper" class="problemresult-box">
			<!-- 关闭按钮 -->
	    <v-touch class="close-box"  v-on:tap="closeProblemSubjective">
	    	<i class="iconfont icon-ykq-shiti-guanbi f24"></i>
	    </v-touch>

			<!-- 上部时钟、人数统计 -->
	    <section class="upper">
	    	<div class="f50" >
	    		<img v-show="!hasLimit" class="jishi" src="~images/teacher/jishi-zheng.png" alt="">
		      <img v-show="hasLimit" class="jishi" src="~images/teacher/jishi-dao.png" alt="">
		      <span class="time">{{problemDurationLeft}}</span>
		    </div>
		    <div :class="['f18', 'yjy']">
		    	{{ $t('submittotal', { ss1: total_num, ss2: class_participant_num }) }}
		    </div>
	    </section>

	    <!-- 中间主观题页面 -->
	    <v-touch class="subjective-box f18">
				<p v-show="!total_num" class="hmy" v-html="$t('noanssubmit')"></p>

				<!-- 主观题部分 -->
				<div class="subjective-list" v-show="subjectiveList.length">
					<div class="item-with-gap" v-for="(item, index) in subjectiveList" :key="item.problem_result_id">
            <div class="item">
              <div class="detail">
                <img :src="item.user_avatar_46" class="avatar" alt="">
                <div class="cont f18">
               		<div class="time f15">{{item.end_time | formatTime}}</div>
                  <span class="author f15">{{item.user_name}}</span><br>
                  {{item.subj_result.content}}<br>
                  <v-touch v-show="item.subj_result.pics[0].thumb" :id="'pic' + item.problem_result_id" tag="img" v-lazy="item.subj_result.pics[0].thumb" class="pic" alt="" v-on:tap="showBigpic(item.subj_result.pics[0].pic, item.problem_result_id)"></v-touch>
                </div>
              </div>
              <div class="action-box f14">
              	<!-- 投屏时不能打分 -->
                <v-touch class="dafen-box" v-show="postingSubjectiveid !== item.problem_result_id" v-on:tap="initScore(item.problem_result_id, item.score, item.source_score, index)">
              		<div class="gray">
              	    <i class="iconfont icon-ykq_dafen f20" style="color: #639EF4;"></i>
              	    <span>{{item.score === -1 ? '打分' : '得分'}}</span>
              	    <span v-show="item.score !== -1">{{item.score}}分</span>
              	  </div>
                </v-touch>
                <div class="zhanweifu" v-show="postingSubjectiveid === item.problem_result_id"></div>
              	
                <div class="action f14">

                  <v-touch v-show="postingSubjectiveid !== item.problem_result_id"  class="gray" v-on:tap="postSubjective(item.problem_result_id)">
                    <i class="iconfont icon-shiti_touping f24" style="color: #639EF4;"></i>
                    <span>{{ $t('screenmode') }}</span>
                  </v-touch>
                  <v-touch class="cancel-post-btn f17" v-show="postingSubjectiveid === item.problem_result_id" v-on:tap="closeSubjectivemask">{{ $t('screenmodeoff') }}</v-touch>
                </div>
              </div>
            </div>
            <div class="gap"></div>
          </div>

          <div v-show="contLonger" class="nomore f15">
            <div class="bgline"></div>
            <div class="wenan">end</div>
          </div>
				</div>
	    </v-touch>
	    
	  </div>

	  <div class="button-box f18" v-show="isShowBtnBox" :class="isShowBackBtn ? 'btnfadein' : 'btnfadeout'">
      <v-touch class="btn f18" v-on:tap="closeProblemSubjective" >{{ $t('back') }}</v-touch>
    </div>
		
	</div>
</template>

<script>
	import Vue from 'vue'
	import request from '@/util/request'
  import API from '@/config/api'
  import Moment from 'moment'

  // import StarPanel from '@/components/teacher/template/star-panel'
  import StarPanel from '@/components/teacher/template/score-panel'

  // 使用 https://github.com/wangpin34/vue-scroll 处理当前搓动方向
  let VueScroll = require('vue-scroll') // 不是ES6模块，而是CommonJs模块
  Vue.use(VueScroll)

  import { Lazyload } from 'mint-ui';
  Vue.use(Lazyload);

  const STAR_TOTAL = 5  // 总星星数目
  const BIG_NUMBER = 10000000000000000000
  const FENYE_COUNT = 10
  const WH = window.innerWidth/window.innerHeight

  function handelScroll (posList = [0]) {
  	let self = this
  	let rootDom = document.querySelector('#subjective-wrapper')
  	let totalHeight = Math.round(rootDom.offsetHeight)
  	let windowHeight = Math.round(window.innerHeight)
  	let maxScrollTop = totalHeight - windowHeight

  	// 大于0就表示手指网上搓了
  	let direction = posList[posList.length-1] - posList[0]

  	// 往下搓或者搓到底都要显示返回按钮
  	self.isShowBackBtn = direction < 0 || (maxScrollTop - posList[posList.length-1]) < 10
  }

  let proxyHandleScroll = (function () {
  	let timer = null
  	let cachePos = []

  	return function (pos) {
  		let self = this

  		cachePos.push(pos)
  		if (timer) {return;}

  		timer = setTimeout(() => {
  			handelScroll.call(self, cachePos)
  			clearTimeout(timer)
  			timer = null
  			cachePos.length = 0
  		}, 50)
  	}
  })();

	export default {
	  name: 'RcMaskProblemresultSubjective',
	  props: ['lessonid', 'pptData', 'current', 'socket', 'postingSubjectiveid', 'problemDurationLeft'],
	  data () {
	    return {
	    	class_participant_num: '--',	// 班级学生数
	    	total_num: '--',							// 总的回答人数
	    	subjectiveList: [],           // 试题的红包名单列表页面隐藏
	    	// starTotal: STAR_TOTAL,				// 总星星数目
	    	scoringIndex: -1,							// 当前正在打分的item的序号
	    	isShowBackBtn: true,					// 显示底部返回按钮
	    	isShowNewHint: false,       	// 上方提示有新的条目进来
	    	isShow2TopBtn: false,					// 显示回到顶部按钮
	    	isScoring: false,							// 正在打分
	    	isShowBtnBox: false,					// 显示底部返回按钮
	    	hasLimit: false,							// 当前题目计时了
	    	isBigpicShown: false,         // 当前正显示大图
	    	isWider: false,               // 投稿图片更扁
	    	bigpicUrl: '',                // 当前大图url
	    	contLonger: false,            // 内容超过1屏
	    }
	  },
	  computed: {
	    problemid: function () {
	      return this.pptData[this.current - 1].Problem.ProblemID
	    }
	  },
	  components: {
	    StarPanel,
	  },
	  created(){
	  	// this.refreshSubjectivelist()
	  	// 召唤出来本页面后，倒计时更新在父组件进行，更新数据是在本页面处理
	  	// 点击 随机点名 按钮 父组件收到node回执后发送事件给本子组件
	  	let self = this

      self.$on('refreshSubjectivelist', function (inPageProblemID, isFirst) {
        // console.log(`父组件召唤子组件刷新主观题数据了${inPageProblemID}`)
        let fn = isFirst ? self.refreshSubjectivelist : self.pollingNewItem
        self.hasLimit = self.pptData[self.current - 1].Problem.hasLimit

        fn()
      })
	  },
	  filters: {
      formatTime(time) {
        return Moment(time).format('HH:mm')
      }
    },
    watch: {
      subjectiveList: function() {
        setTimeout(() => {
          let sbh = document.querySelector('.subjective-box .subjective-list').offsetHeight
          let wh = window.innerHeight
          this.contLonger = sbh >= wh
        }, 100)
      }
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
	     * 处理本蒙版上下搓动，处理返回按钮的显示隐藏
	     *
	     * @param {object, object} e event对象，position 当前对象滚动信息
	     */
	    onScroll (e, position) {
	      let self = this
	      let windowHeight = Math.round(window.innerHeight)

	      self.isShow2TopBtn = position.scrollTop > windowHeight
	      
	      proxyHandleScroll.call(self, position.scrollTop)
	    },
	    /**
	     * 回到顶部
	     *
	     * @event bindtap
	     */
	    back2Top () {
	      let self = this
	      
	      self.$el.scrollTop = 0
	      self.isShow2TopBtn = false
	    },
	  	/**
	     * 关闭试题主观题页面的按钮
	     * 涉及设置父组件 data，所以传递事件给父组件
	     *
	     * @event bindtap
	     */
	    closeProblemSubjective () {
	    	this.closeSubjectivemask ()
	    	this.$emit('closeProblemSubjective')
	    },
	    /**
       * 获取答案数据
       *
       */
      fetchList(){
        let self = this
        let url = API.subjective_problem_result_list

        // 单次刷新
        return request.get(url, {
          'start': BIG_NUMBER,
          'count': BIG_NUMBER,
          'problem_id': self.problemid,
          'lesson_id': self.lessonid,
          'direction': 0
        })
      },
	    /**
       * 查询有没有新的答案，根据id来判断
       *
       */
      pollingNewItem(){
        let self = this

        self.fetchList().then(jsonData => {
        	let list = jsonData.data.problem_results_list
        	let hasNew = (list[0] && !self.subjectiveList[0]) || (list[0] && self.subjectiveList[0] && list[0].problem_result_id > self.subjectiveList[0].problem_result_id)

        	self.total_num = jsonData.data.total_num
        	self.class_participant_num = jsonData.data.class_participant_num

        	if (hasNew) {
        		self.isShowNewHint = true
        	}
        })
      },
	    /**
       * 更新试题详情的数据
       * 点击打开详情时要主动更新一下数据，所以把本方法放在本父组件中
       *
       */
      refreshSubjectivelist(){
        let self = this

        self.fetchList().then(jsonData => {
    			self.isShowNewHint = false
    	    console.log('主观题列表', jsonData)
    	    let list = jsonData.data.problem_results_list

    	    let newList = list.map(item => {
    	    	item.fullStars = Math.round(item.score === -1 ? 0 : item.score*5/item.source_score)

    	    	return item
    	    })

    	    self.subjectiveList = newList
    	    self.total_num = jsonData.data.total_num
        	self.class_participant_num = jsonData.data.class_participant_num
    	    self.$el.scrollTop = 0

    	    setTimeout(() => {
    	    	self.isShowBtnBox = true
    	    },500)
        })
      },
      /**
	     * 点击打分部分，呼出打分面板
	     *
	     * @event bindtap
	     * @params {number, number, number, index} answerid 将要打分的主观题答案的id; studentScore 当前分数; scoreTotal 当前题目总分数； index 当前的item的序号
	     */
	    initScore (answerid, studentScore, scoreTotal, index) {
	      let self = this

	      // 投屏时不可打分
	      if (answerid === self.postingSubjectiveid) {return;}

	      self.scoringIndex = index
	      self.$refs.StarPanel.$emit('enter', ...arguments)
	      self.isScoring = true
	    },
	    /**
	     * 点击打分部分，呼出打分面板
	     *
	     * @event bindtap
	     * @params {number, number, number, index} answerid 将要打分的主观题答案的id; studentScore 当前分数; scoreTotal 当前题目总分数； index 当前的item的序号
	     */
	    cancelScore () {
	      let self = this

	      self.isScoring = false
	    },
	    /**
	     * 点击打分部分，呼出打分面板
	     *
	     * @event
	     * @params {number, number} answerid 将要打分的主观题答案的id score 打的分
	     */
	    giveScore (answerid, score) {
	    	let self = this

	    	self.isScoring = false

	    	if (score === -1) {
	    		self.$refs.StarPanel.$emit('leave')
	    		return;
	    	}
	      
	      // let url = API.subjective_problem_teacher_score
	      let url = API.subjective_problem_teacher_scorev2
	      let postData = {
	        'lesson_id': self.lessonid,
	        'problem_result_id': answerid,
	        // 'star': score,
	        'score': score
	      }

	      request.post(url, postData)
	        .then(jsonData => {
	          // 不需要判断success，在request模块中判断如果success为false，会直接reject
	          // location.href = '/v/index/course/normalcourse/manage_classroom/'+ self.courseid +'/'+ self.classroomid +'/';

	          // 关闭打分页面
	          console.log(`打过分啦${score}`, self.scoringIndex)
	          // self.subjectiveList[self.scoringIndex].fullStars = score
	          self.subjectiveList[self.scoringIndex].score = +score
	          self.$refs.StarPanel.$emit('leave')
	        })
	    },
	    /**
	     * 点击空白处隐藏打分面板
	     *
	     * @event bindtap
	     * @params {Object} evt event 对象
	     */
	    hideStar (evt) {
	    	let self = this
	    	let isScoreDom = $(evt.target).closest('.dafen-box').length


	    	if (isScoreDom) {return;}

	    	self.isScoring = false
	    	self.$refs.StarPanel.$emit('leave')
	    },
	    /**
       * 显示大图
       *
       * @event bindtap
       * @param {string} pic 大图url
       */
      showBigpic (pic, picid) {
        let self = this
        let dom = document.querySelector('#pic'+picid)
        let picwh = dom.naturalWidth / dom.naturalHeight

        self.isWider = picwh > WH
        self.isBigpicShown = true
        self.bigpicUrl = pic
      },
      /**
       * 隐藏大图
       *
       * @event bindtap
       */
      hideBigpic () {
        let self = this

        self.isBigpicShown = false
        self.bigpicUrl = ''
      },
	    /**
	     * 试题主观题页面页面中的 投屏 按钮
	     *
	     * @event bindtap
	     * @params {string} id 将要投屏的主观题的id
	     */
	    postSubjective (id) {
	      let self = this

	      let str = JSON.stringify({
	        'op': 'showsproblem',
	        'lessonid': self.lessonid,
	        'spid': id,
	        'msgid': 1234
	      })

	      self.socket.send(str)
	    },
	    /**
       * 退出主观题投屏蒙版
       *
       * @event bindtap
       */
      closeSubjectivemask () {
        let self = this

        let str = JSON.stringify({
          'op': 'closemask',
          'lessonid': self.lessonid,
          'type': 'subjective',
          'msgid': 1234
        })

        self.socket.send(str)
      },
	  }
	}
</script>

<style lang="scss" scoped>
	@import "~@/style/_variables";
	.problem-root {
		position: absolute;
		left: 0;
    right: 0;
    top: 0;
    bottom: 0;
		overflow: auto;
		background: #000000;

		.new-item-hint {
		  position: fixed;
		  z-index: 30;
		  left: 50%;
		  top: 0.266667rem;
		  transform: translate(-50%, 0);
		  width: 5.333333rem;
		  height: 0.8rem;
		  border-radius: 0.4rem;
		  background: #FCF9DC;
		  text-align: center;
		  line-height: 0.8rem;
		  color: #666666;
		  transition: transform 0.5s ease;
		}

		.hintfadein {
      transform: translate(-50%, 0) scale(1);
    }
    .hintfadeout {
      transform: translate(-50%, -1.5rem) scale(0.8);
    }

    .bigpic-mask {
      display: flex;
      align-items: center;
      position: fixed;
      z-index: 40;
      left: 0;
      right: 0;
      top: 0;
      bottom: 0;
      background: rgba(0,0,0,0.8);
      color: $white;

      img {
        display: block;
        margin: 0 auto;
        max-width: 100%;
        max-height: 100%;
      }
      .w100 {
        width: 100%;
      }
      .h100 {
        height: 100%;
      }
    }

		.back-top-btn {
			position: fixed;
		  z-index: 10;
		  right: 0.306667rem;
		  bottom: 1.986667rem;
		  width: 1.066667rem;
		  height: 1.066667rem;

		  img {
		  	width: 100%;
		  }
		}
	}

	.icon-fill-star, .icon-star {
		color: #F5A623;
	}

	.problemresult-box {
	  position: absolute;
    z-index: 20; /* 遮盖toolbar */
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
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
	  	text-align: center;
			
			.jishi {
				margin-top: -0.186667rem;
				width: 0.9rem;
				vertical-align: middle;
			}
			.yjy {
				padding-top: 0.5rem;
			}
	  }

	  .gap {
      height: 0.026667rem;
    }
		
		/* 主观题内容区 */
	  .subjective-box {
	  	margin-top: -1px;
	  	.hmy {
        margin-top: 2.893333rem;
        text-align: center;
      }

      .subjective-list {
      	color: #4A4A4A;
      	background: #EDF2F6;

      	padding-bottom: 1.5rem;
	      -webkit-overflow-scrolling: touch;
	      
	      .item {
	        padding: 0 0.4rem;
	        background: $white;

	        .detail {
	          display: flex;
	          margin-bottom: 0.346667rem;
	          padding-top: 0.266667rem;

	          .avatar {
	            margin-right: 0.4rem;
	            width: 0.986667rem;
	            height: 0.986667rem;
	            border-radius: 50%;
	          }
	          .cont {
	            flex: 1;
	            word-break: break-word;

	            .time {
	            	float: right;
		            color: $graybg;
		          }

	            .author {
	            	display: inline-block;
	            	margin-bottom: 0.2rem;
	              color: #4975B5;
	            }

	            .pic {
	            	margin-top: 0.266667rem;
	              max-width: 7.573333rem;
	              max-height: 7.04rem;
	            }
	            img[lazy=loading] {
	              width: 4.666667rem;
	              height: 4.666667rem;
	              background: url(~~images/teacher/img-holder.png) center center no-repeat;
								background-size: cover;
	            }
	          }
	        }

	        .action-box {
	          display: flex;
	          justify-content: space-between;
	          align-items: center;
	          height: 1rem;
	          margin-left: 1.386667rem;
	          
	          .gray {
	            color: $graybg;
	          }

	          .dafen-box, .action {
	            display: flex;
	            align-items: center;
	            justify-content: space-between;
	          }

	          .cancel-post-btn {
	          	margin-right: -0.4rem;
	            background: $blue;
	            width: 2.733333rem;
	            text-align: center;
	            height: 0.826667rem;
	            line-height: 0.826667rem;
	            color: $white;
	          }
	        }
	      }

	      .nomore {
	        position: relative;
	        height: 0.6rem;
	        margin: 0 0.6rem;
	        text-align: center;
	        color: $graybg;

	        .wenan {
	          position: relative;
	          margin: 0 auto;
	          width: 2.093333rem;
	          background: #EDF2F6;
	        }

	        .bgline {
	          position: absolute;
	          top: 0.293333rem;
	          width: 100%;
	          height: 1px;
	          background: #c8c8c8;
	        }
	      }
	      
      }
	  }
	}

	.button-box {
    display: flex;
    position: fixed;
    z-index: 30;
    left: 0;
    right: 0;
    bottom: 0;
    height: 1.466667rem;
    text-align: center;
    transition: transform 0.5s ease;

    .btn {
      flex: 1;
      border-radius: 0;
      height: 1.466667rem;
      line-height: 1.466667rem;
    }
  }
  .btnfadein {
  	transform: translateY(0);
  }
  .btnfadeout {
  	transform: translateY(1.5rem);
  }
</style>

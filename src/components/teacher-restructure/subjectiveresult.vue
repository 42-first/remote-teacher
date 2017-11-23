<!--试题结果-主观题结果页面-->
<template>
	<div class="problem-root" v-scroll="onScroll">
    <slot name="ykt-msg"></slot>
		<v-touch v-on:tap="refreshDataList" class="new-item-hint f15" :class="isShowNewHint ? 'hintfadein' : 'hintfadeout' ">您有新的答案</v-touch>

		<v-touch class="back-top-btn" v-on:tap="back2Top" v-show="isShow2TopBtn">
			<img class="jishi" src="~images/teacher/back-top.png" alt="">
		</v-touch>
		<!-- 打星星 -->
		<StarPanel
			ref="StarPanel"
			@giveScore="giveScore"
			@cancelScore="cancelScore"
		></StarPanel>

    <Loadmore
     ref="Loadmore"
     :bottom-method="loadBottom"
     :bottom-all-loaded="isAllLoaded"
     :bottomPullText="'上拉加载更多'"
     :bottomDropText="'释放加载更多'"
     :class="{'allLoaded': isAllLoaded}"
     >
      <!--试题-主观题面板-->
      <div id="subjective-wrapper" class="problemresult-box">

        <!-- 上部时钟、人数统计 -->
        <section class="upper">
          <div class="f50" >
            <img v-if="!~limit" class="jishi" src="~images/teacher/jishi-zheng.png" alt="">
            <img v-else class="jishi" src="~images/teacher/jishi-dao.png" alt="">
            <span class="time">{{durationLeft}}</span>
          </div>
          <div :class="['f18', 'yjy']">
            已经有 <span>{{total_num}}</span> / <span>{{class_participant_num}}</span> 位同学提交了答案
          </div>
        </section>

        <!-- 中间主观题页面 -->
        <section class="subjective-box f18">
          <p v-show="!(total_num !== 0 || total_num === '--')" class="hmy">还没有人提交<br>耐心等待一会儿吧~</p>

          <!-- 主观题部分 -->
          <div class="subjective-list" v-show="dataList.length">
            <div class="item-with-gap" v-for="(item, index) in dataList" :key="item.problem_result_id">
              <div class="item">
                <div class="detail">
                  <img :src="item.user_avatar_46" class="avatar" alt="">
                  <div class="cont f18">
                    <div class="time f15">{{item.end_time | formatTime}}</div>
                    <span class="author f15">{{item.user_name}}</span><br>
                    {{item.subj_result.content}}<br>

                    <v-touch v-show="item.subj_result.pics[0].thumb" :id="'pic' + item.problem_result_id" tag="img" v-lazy="item.subj_result.pics[0].thumb" class="pic" alt="" v-on:tap="scaleImage(item.subj_result.pics[0].pic, $event)"></v-touch>
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
                      <span>投屏</span>
                    </v-touch>
                    <v-touch class="cancel-post-btn f17" v-show="postingSubjectiveid === item.problem_result_id" v-on:tap="closeSubjectivemask">取消投屏</v-touch>
                  </div>
                </div>
              </div>
              <div class="gap"></div>
            </div>

            <div v-show="isContLonger" class="nomore f15">
              <div class="bgline"></div>
              <div class="wenan">end</div>
            </div>
          </div>
        </section>
        
      </div>
    </Loadmore>

		

    <Scale></Scale>
		
	</div>
</template>

<script>
  import {mapGetters} from 'vuex'
  import {sec2str} from './util/util'
	import Vue from 'vue'
	import request from '@/util/request'
  import API from '@/pages/teacher/config/api'
  import Moment from 'moment'

  // import StarPanel from '@/components/teacher/template/star-panel'
  import StarPanel from './common/score-panel'
  import Scale from './common/scale'
  import Loadmore from 'mint-ui/lib/loadmore'

  // 使用 https://github.com/wangpin34/vue-scroll 处理当前搓动方向
  let VueScroll = require('vue-scroll') // 不是ES6模块，而是CommonJs模块
  Vue.use(VueScroll)

  import { Lazyload } from 'mint-ui';
  Vue.use(Lazyload);

  let windowHeight = window.innerHeight
  const FENYE_COUNT = 10
  let pollingTimer = null

  let isFirstFetch = true       // 标记本 id 初次获取
  let refProblemTimer = null    // 刷新试题柱状图的定时器
  let initTime = 1              // 初始时间 秒
  let START, NOW, newTime       // 进入页面的本机时间，倒计时过程中本机实时时间，计时器应该显示的时间

  // 页面滚动处理
  function handelScroll (posList = [0]) {
  	let self = this
  	let scrollTopNow = posList.pop()

    self.isShow2TopBtn = scrollTopNow > windowHeight
  }

  // 页面滚动代理
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
  		}, 300)
  	}
  })();

	export default {
	  name: 'Subjectiveresult',
	  props: [],
	  data () {
	    return {
        problemid: -1,
        class_participant_num: '--',  // 班级学生数
        total_num: '--',              // 总的回答人数
        durationLeft: '--:--',        // 题目的倒计时剩余时间
        dataList: [],                 // 主观题答案列表
        scoringIndex: -1,             // 当前正在打分的item的序号
        isShowNewHint: false,         // 上方提示有新的条目进来
        isShow2TopBtn: false,         // 显示回到顶部按钮
        limit: '',                    // 设置的限时 -1 为未限时 单位 秒
        isAllLoaded: false,           // 上拉加载更多到底了
        isContLonger: false,          // 内容超过1屏
	    }
	  },
	  computed: {
      ...mapGetters([
        'lessonid',
        'socket',
        'current',
        'pptData',
        'postingSubjectiveid'
      ])
	  },
	  components: {
	    StarPanel,
      Scale,
      Loadmore
	  },
	  created(){
	  	this.init()
	  },
    beforeDestroy(){
      this.endTimers()
      this.closeSubjectivemask()
    },
	  filters: {
      formatTime(time) {
        return Moment(time).format('HH:mm')
      }
    },
    watch: {
      dataList: function() {
        setTimeout(() => {
          let sbh = document.querySelector('.subjective-box .subjective-list').offsetHeight
          let wh = window.innerHeight
          this.isContLonger = sbh >= wh
        }, 100)
      },
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

        self.refreshDataList()
        pollingTimer = setInterval(self.pollingNewItem, 5000)

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
       * 上拉刷新回调
       *
       */
      loadBottom () {
        let self = this
        console.log('上拉松手了')

        let tailNow = self.dataList[0] ? self.dataList[self.dataList.length-1].problem_result_id : 0

        self.fetchList(tailNow).then(jsonData => {
          // 设置试卷详情数据
          // response_num 当前请求返回的投稿数量
          if (jsonData.data.response_num === 0) {
            self.isAllLoaded = true
            return
          }
          self.dataList = self.dataList.concat(jsonData.data.problem_results_list)

          this.$refs.Loadmore.onBottomLoaded()
        })
      },
      /**
       * 将秒数转换成 MM:SS 格式
       *
       * @param {number} sec 秒数
       */
      sec2str,
	    /**
	     * 处理本蒙版上下搓动，处理返回按钮的显示隐藏
	     *
	     * @param {object, object} e event对象，position 当前对象滚动信息
	     */
	    onScroll (e, position) {
	      let self = this
	      
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
       * 获取答案数据
       *
       * @param {Number} start 起始位置id，返回值不包括起始位置的值， 默认 -1， 即从最新无限大处开始
       * @param {Number} direction 默认0 倒序，即向老的方向找去
       */
      fetchList(start = -1, direction = 0){
        let self = this
        let url = API.subjective_problem_result_list

        let data = {
          start,
          direction,
          count: FENYE_COUNT,
          problem_id: self.problemid,
          lesson_id: self.lessonid,
        }

        // 单次刷新
        return request.get(url, data)
      },
	    /**
       * 查询有没有新的答案，根据 response_num 来判断
       *
       */
      pollingNewItem(){
        let self = this

        let headNow = self.dataList[0] ? self.dataList[0].problem_result_id : 0

        self.fetchList(headNow, 1).then(jsonData => {
          self.setData({
            isShowNewHint: jsonData.data.response_num,
            total_num: jsonData.data.total_num,
            class_participant_num: jsonData.data.class_participant_num
          })
        })
      },
	    /**
       * 更新试题详情的数据
       *
       */
      refreshDataList(){
        let self = this

        /* 分页逻辑：
         * 1.如果一条数据都没有，就是一直都是0，直接赋值，设置为已经加载完了
         * 2.如果之前为空，新获取数据直接赋值，设置为可以加载更多
         * 3.如果当前展示的第一条的id出现在最新的获取的条目里，
         * 就说明新增的数目不超过 FENYE_COUNT，这时直接往前连接即可，不用管能不能加载更多
         * 4.否则直接展示新获取的数据，并且设置为可以加载更多
         *
         * 注：
         * 数据库中所有课的条目是往一张表中添加的，不是一堂课的 id 不断自增，所以不能用 id 相减
         * 的方法来判断新增了多少条条目，来查看到底从 start 处新增了多少条
         */
        self.fetchList().then(jsonData => {
          self.setData({
            isShowNewHint: false,
            total_num: jsonData.data.total_num,
            class_participant_num: jsonData.data.class_participant_num
          })

          let newList = jsonData.data.problem_results_list
          // 返回的条目的个数
          let response_num = jsonData.data.response_num
          // 有可能还一条都没有呢
          let headNow = self.dataList[0] ? self.dataList[0].problem_result_id : 0
          let headIndex = newList.findIndex(item => item.problem_result_id === headNow)

          let isAllLoaded = self.isAllLoaded
          if (response_num === 0) {
            isAllLoaded = true
          } else if (headNow === 0) {
            self.setData({
              dataList: newList
            })

            isAllLoaded = newList.length < FENYE_COUNT
          } else if (~headIndex) {
            // 包含
            let _list = newList.slice(0, headIndex).concat(self.dataList)
            self.setData({
              dataList: _list
            })
          } else {
            self.setData({
              dataList: newList
            })
            isAllLoaded = false
          }

          self.setData({
            isAllLoaded
          })

          // self.calcPageHeight()

          // 刷新的话回顶部
          self.back2Top()
        })
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
      /**
       * 处理计时
       *
       */
      handleDuration () {
        let self = this

        clearInterval(refProblemTimer)
        self.setData({
          durationLeft: self.sec2str(newTime)
        })

        refProblemTimer = setInterval(function(){
          if(self.limit !== -1 && newTime <= 0){
            clearInterval(refProblemTimer)
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
       * 归零、结束定时器等
       *
       */
      endTimers () {
        // 关闭刷新的定时器
        clearInterval(refProblemTimer)
        clearInterval(pollingTimer)
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
	    },
	    /**
	     * 点击打分部分，呼出打分面板
	     *
	     * @event bindtap
	     * @params {number, number, number, index} answerid 将要打分的主观题答案的id; studentScore 当前分数; scoreTotal 当前题目总分数； index 当前的item的序号
	     */
	    cancelScore () {
	      let self = this
        // TODO
	    },
	    /**
	     * 点击打分部分，呼出打分面板
	     *
	     * @event
	     * @params {number, number} answerid 将要打分的主观题答案的id score 打的分
	     */
	    giveScore (answerid, score) {
	    	let self = this

	    	if (score === -1) {
	    		self.$refs.StarPanel.$emit('leave')
	    		return;
	    	}
	      
	      let url = API.subjective_problem_teacher_scorev2
	      let postData = {
	        'lesson_id': self.lessonid,
	        'problem_result_id': answerid,
	        'score': score
	      }

	      request.post(url, postData)
	        .then(jsonData => {
	          // 不需要判断success，在request模块中判断如果success为false，会直接reject
	          // location.href = '/v/index/course/normalcourse/manage_classroom/'+ self.courseid +'/'+ self.classroomid +'/';

	          // 关闭打分页面
	          console.log(`打过分啦${score}`, self.scoringIndex)
	          self.dataList[self.scoringIndex].score = +score
	          self.$refs.StarPanel.$emit('leave')
	        })
	    },
      /**
       * 显示大图，使用 PhotoSwipe
       *
       * @event bindtap
       * @param {string} pic 大图url
       */
      scaleImage(src, evt) {
        let targetEl = typeof event !== 'undefined' && event.target || evt.target;;
        let pswpElement = document.querySelector('.J_pswp');
        let index = 0;
        let WIDTH = window.innerWidth
        let items = [{ src: src, w: WIDTH, h: targetEl.height*WIDTH/targetEl.width }];

        let options = {
          index: index,
          maxSpreadZoom: 5,
          showAnimationDuration: 300,
          hideAnimationDuration: 300,
          showHideOpacity: true,

          closeEl: false,
          captionEl: false,
          fullscreenEl: false,
          zoomEl: false,
          shareEl: false,
          counterEl: false,
          arrowEl: false,
          preloaderEl: false,

          tapToClose: true,
          // 解决消息点击问题
          // history: false,       
        };

        // Initializes and opens PhotoSwipe
        let gallery;

        if(typeof PhotoSwipe !== 'undefined') {
          gallery = new PhotoSwipe(pswpElement, PhotoSwipeUI_Default, items, options);

          gallery.init();
        } else {
          setTimeout(()=>{
            gallery = new PhotoSwipe(pswpElement, PhotoSwipeUI_Default, items, options);
            gallery.init();
          }, 1500)
        }

      },
	    
	  }
	}
</script>

<style lang="scss" scoped>
	@import "~@/style/_variables";
	.problem-root {
    position: relative;
    min-height: 100%;
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

	.problemresult-box {
	  position: relative;
    z-index: 20; /* 遮盖toolbar */
	  color: $white;
	  background: #000000;
		
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

  .btnfadein {
  	transform: translateY(0);
  }
  .btnfadeout {
  	transform: translateY(1.5rem);
  }
</style>

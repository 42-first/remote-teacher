<!--试题结果-主观题结果页面-->
<template>
	<div class="wai">
    <div class="problem-root" @scroll="onScroll">

      <!-- 教师遥控器引导查看答案、续时 -->
      <!-- <GuideDelay
        v-show="!isGuideDelayHidden"
      ></GuideDelay> -->

      <v-touch v-on:tap="refreshDataList" class="new-item-hint f15" :class="isShowNewHint ? 'hintfadein' : 'hintfadeout' ">{{ $t('newans') }}</v-touch>

      <v-touch class="back-top-btn" v-on:tap="back2Top" v-show="isShow2TopBtn">
        <img class="jishi" src="~images/teacher/back-top.png" alt="">
      </v-touch>

      <Loadmore
       ref="Loadmore"
       :bottom-method="loadBottom"
       :bottom-all-loaded="isAllLoaded"
       :bottomPullText="$t('release')"
       :bottomDropText="$t('shifang')"
       :class="{'allLoaded': isAllLoaded}"
       >
        <!--试题-主观题面板-->
        <div id="subjective-wrapper" class="problemresult-box">

          <!-- 上部时钟、人数统计 -->
          <section class="upper">
            <Rolex
              v-if="!problem_group_review_id"
              :limit="limit"
              :newTime="newTime"
              :durationLeft="durationLeft"
              :problemid="problemid"
              @yanshi="yanshi"
              @shouti="shouti"
            ></Rolex>
						<div class="faqihuping-box">
							<div class="total-box">
								<div :class="['f12', 'yjy']">
									<span class="f18">{{total_num}}</span>
									{{ $t('yizuoda') }}
		            </div>
								<div class="line"></div>
								<template v-if="problem_answer_type == 0">
									<div class="f12 yjy">
										<span class="f18" >{{unfinished_count}}</span>
										<span class="tips"> {{ $t('team.weizuoda') }}</span>
									</div>
								</template>
								<template v-else>
									<v-touch :class="['f12', 'yjy']" v-on:tap="showTips">
										<span class="f18">{{unfinished_count}}</span>
										<span class="tips"> {{ $t('team.weizuoda') }}<i class="ques"></i></span>
			            </v-touch>
								</template>

								<template v-if="problem_group_review_id">
									<div class="line"></div>
									<div :class="['f12', 'yjy']">
										<span class="f18">{{group_review_done_num}}</span>
										{{ $t('team.yihuping') }}
			            </div>
								</template>
							</div>
              <!-- v-if="problem_answer_type"  -->
							<v-touch :class="['faqihuping', 'f12', newTime > 0 ? 'disabled' : '']" v-on:tap="faqihuping">{{!problem_group_review_id ? $t('team.faqihuping') : $t('team.hupingguize')}}</v-touch>
              <!-- <v-touch :class="['faqihuping', 'f12', 'disabled']" v-on:tap="showToast">{{$t('team.faqihuping')}}</v-touch> -->
						</div>
          </section>
          <hide-some-info :isUserInfo="true" @change="showUserInfoChange"></hide-some-info>
          <!-- 有解析显示解析入口 -->
          <p class="analysis--btn f17" v-if="problem && problem.hasRemark" @click="handleVisibleAnalysis"><!-- 答案解析 -->{{ $t('answerkey') }}</p>
					<template v-if="group_name">
            <div class="gap"></div>
						<div class="group_name f14">
							<i class="iconfont icon-fenzu1 f21"></i>{{group_name}}
						</div>
					</template>
          <div class="gap"></div>
          <!-- 中间主观题页面 -->
          <section class="subjective-box f18">
            <p v-show="!(total_num !== 0 || total_num === '--')" class="hmy" v-html="$t('noanssubmit')">
              <!-- 还没有人提交<br>耐心等待一会儿吧~ -->
            </p>

            <!-- 主观题部分 -->
            <div class="subjective-list" v-show="dataList.length">
              <div class="item-with-gap" v-for="(item, index) in dataList" :key="item.problem_result_id">
                <div class="item">
                  <div class="detail">
										<div class="student-info" v-if="problem_answer_type == 1">
											<v-touch class="avatar-box" v-on:tap="handleOpenTeamMember(item.teamInfo.teamId)">
												<template v-for="(item2, index2) in item.teamInfo.memberList">
													<img v-if="index2 < 3" :src="item2.avatar" :key="index2" class="avatar" alt="">
												</template>
												<span class="author f15">{{item.teamInfo.teamName}}</span>
											</v-touch>
											<div class="time f15">{{item.resultInfo.submitTime | formatTime}}</div>
										</div>
										<div class="student-info" v-else>
											<div class="avatar-box">
												<img :src="item.user.avatar" class="avatar" alt="">
												<span class="author f15">{{item.user.name}}</span>
											</div>
											<div class="time f15">{{item.time | formatTime}}</div>
										</div>

                    <div class="cont f18">
                      <div class="cont-title">
                        {{item.fold ? item.result.foldContent : item.result.content}}
                        <!-- {{item.result.content}} -->
                        <span v-show="!item.hideFold">
                            <span v-show="item.fold" @click="item.fold = false">
                                <span>...</span>
                                <span class="color16">
                                  <span>{{$t('showall')}}</span>
                                  <span class="color12">({{item.result.content ? item.result.content.length : 0}})</span>
                                </span>
                            </span>
                            <span v-show="!item.fold" @click="item.fold = true" class="color16">
                                <i class="iconfont icon-zhankai"></i>
                                {{$t('foldall')}}
                            </span>
                        </span>
                      </div>
                      <v-touch v-if="hasThumb(item)" :id="'pic' + item.index" tag="img" v-lazy="item.result.pics[0].thumb || item.result.pics[0].pic" class="pic" alt="" v-on:tap="scaleImage(item.result.pics[0].pic, $event)"></v-touch>
                    </div>
                  </div>
                  <div class="action-box f14">
                    <!-- 投屏时不能打分 -->
                    <v-touch class="dafen-box" v-show="postingSubjectiveid !== item.index" v-on:tap="initScore(item.index, item.resultId, item.score, item.totalScore, index, item.comment && item.comment.content)">
                      <div class="gray">
                        <i class="iconfont icon-ykq_dafen f20 ver-middle" style="color: #639EF4;"></i>
                        <span>{{ $tc('givestuscore', item.score === -1) }}</span>
                        <span v-show="item.score !== -1">{{item.score > -1 ? (item.score/100).toFixed(1) : '--'}}</span>
                      </div>
                    </v-touch>
                    <div class="zhanweifu" v-show="postingSubjectiveid === item.index"></div>

                    <div class="action f14">
                      <v-touch class="gray" v-show="postingSubjectiveid !== item.index" v-on:tap="postSubjective(item.index)">
                        <i class="iconfont icon-shiti_touping f24 ver-middle" style="color: #639EF4; margin-right: 0.1rem;"></i>
                        <!-- 投屏 --><span>{{ $t('screenmode') }}</span>
                      </v-touch>
                      <v-touch class="cancel-post-btn f14 ver-middle" v-show="postingSubjectiveid === item.index && !postingSubjectiveSent" v-on:tap="fsqbHander(item.index)">
                        <!-- 发送全班 -->{{ $t('postpublic') }}
                      </v-touch>
                      <div class="cancel-post-btn yfqb f14" v-show="postingSubjectiveid === item.index && postingSubjectiveSent">
                        <!-- 已发全班 -->{{ $t('postpubliced') }}
                      </div>
                      <v-touch class="cancel-post-btn f14 qxtp" v-show="postingSubjectiveid === item.index" v-on:tap="closeSubjectivemask">
                        <span class="fsqb-innerline"></span>
                        <!-- 取消投屏 -->{{ $t('screenmodeoff') }}
                      </v-touch>
                    </div>
                  </div>
                </div>
                <div class="gap"></div>
              </div>
              <div v-show="isAllLoaded && isContLonger" class="nomore f15">
                <div class="bgline"></div>
                <div class="wenan">end</div>
              </div>
            </div>
          </section>

        </div>
      </Loadmore>
      <div class="gap"></div>

      <Scale></Scale>

    </div>

    <!-- 打星星 -->
    <StarPanel
      ref="StarPanel"
      @giveScore="giveScore"
    ></StarPanel>



		<!-- 发题选时间蒙版客观题 -->
    <Problemtime v-if="!isProblemtimeHidden"
      :problem-type="'ShortAnswer'"
      :isYanshi="true"
      @cancelPublishProblem="cancelPublishProblem"
      @chooseProblemDuration="yanshiProblem"
    ></Problemtime>
    <Scale></Scale>

		<HupingPanel
			ref="HupingPanel"
			:tProportion="tProportion"
			:gProportion="gProportion"
			@giveHuping="giveHuping"
			@editHuping="editHuping"
		></HupingPanel>

    <section class="teammember" v-show="showTeamMember">
      <div class="member-content">
        <v-touch class="member-actions" v-on:tap="handleTeammemberClosed">
          <i class="iconfont icon-shiti_guanbitouping f25 c333"></i>
        </v-touch>
        <div class="member-detail">
          <p class="team-info">
            <span class="team-name f20">{{currentTeam}}</span>
            <span class="team-total f14"><!-- 共{{teamMemberList.length}}人 -->{{ $t('team.totalmembers', {num: teamMemberList.length}) }}</span>
          </p>
          <div class="team-item" v-for="(item, index) in teamMemberList" :key="index">
            <img class="member--avatar" :src="item.avatar" alt="" >
            <div class="member--name f16 c666"><span class="name">{{item.userName}}</span></div>
          </div>
        </div>
      </div>
    </section>

    <!-- 解析弹层 -->
    <analysis :problem.sync="problem" :hide-analysis="hideAnalysis" v-if="visibleAnalysis"></analysis>
  </div>
</template>

<script>
  import {mapGetters} from 'vuex'
  import {sec2str} from './util/util'
	import Vue from 'vue'
	import request from '@/util/request-v3'
  import API from '@/util/api'
  import Moment from 'moment'
  import config from '@/pages/teacher/config/config'

  import StarPanel from './common/score-panel-v2'
  import Scale from './common/scale'
  import Loadmore from 'mint-ui/lib/loadmore'
  import HupingPanel from './common/huping-panel'
  // 试题延时
  import Problemtime from '@/lesson/teacher/common/problemtime'
  // 教师遥控器引导查看答案、续时
  import GuideDelay from '@/lesson/teacher/common/guide-delay'
  import hideSomeInfo from '@/lesson/teacher/common/hideSomeInfo'
  // 答案解析
  import analysismixin from '@/lesson/common/analysis-mixin'
  // 时钟组件
	import Rolex from '@/lesson/teacher/common/rolex'

  // 使用 https://github.com/wangpin34/vue-scroll 处理当前搓动方向
  let VueScroll = require('vue-scroll') // 不是ES6模块，而是CommonJs模块
  Vue.use(VueScroll, {throttle: 600})

  import { Lazyload } from 'mint-ui';
  Vue.use(Lazyload);

  let windowHeight = window.innerHeight
  const FENYE_COUNT = 10
  let pollingTimer = null

  let durationTimer = null    // 刷新试题柱状图的定时器
  let initTime = 1              // 初始时间 秒
  let START, NOW, newTime       // 进入页面的本机时间，倒计时过程中本机实时时间，计时器应该显示的时间

  let routeStamp = 0            // 首次进入本路由时时间戳
  const ISCOLLECTED = -200        // 用数字 -200 标记已经收题
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
  let scoreTapTimer = null
	let hupingTapTimer = null

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
        newTime: 100,                  // 当前剩余时间，用于判读是否剩余5秒
        isProblemtimeHidden: true,     // 延时面板隐藏
        isHideName: false,               // 匿名投屏
        explainShow: false,         // 投屏帮助说明
        showTeamMember: false,         // 展示小组成员
        teamMemberList: [],						 // 小组成员列表
				currentTeam: '',							 // 当前点击的小组名称
				problem_answer_type: 0,				 // 个人或小组作答 0:个人  1:小组
				team_num: '--',								 // 组数+未进组人数
				problem_group_review_id: 0,		 // 小组互评的id
				tProportion: 0,								 // 默认教师占比
				gProportion: 100,							 // 默认互评占比
				unfinished_count: 0,					// 未答题人数
				unfinished_team_count: 0,				// 没有回答的组数
        group_name: '',									// 分组名
        group_review_done_num: 0,        // 已互评数
        group_review_declaration: '',    // 互评规则
	    }
	  },
    mixins: [ analysismixin ],
	  computed: {
      ...mapGetters([
        'lessonid',
        'socket',
        'isGuideDelayHidden',
        'current',
        'pptData',
        'postingSubjectiveid',
        'postingSubjectiveSent',
        'isCloneClass'
      ])
	  },
	  components: {
	    StarPanel,
      Scale,
      Loadmore,
      Problemtime,
      GuideDelay,
      HupingPanel,
      hideSomeInfo,
      analysis: () => import('@/lesson/teacher/common/analysis.vue'),
      Rolex
	  },
	  created(){
      this.init()
	  },
    mounted(){
      // 处理打分蒙版出现时，ios11+ 后面不要滚动
      // 给整个打分的蒙版加上 touchmove 处理，但是对内部可能滚动的地方分情况处理下，一般用 e.preventDefault() 禁止滚动
      // 有2个 textarea-place 元素，其中一个隐藏的时候，其 offsetHeight scrollHeight 都是0
      let boxDom = document.querySelector('#scoreDom')
      let textDomList = boxDom.querySelectorAll('.textarea-place')
      let popDom = document.querySelector('.pop')
      boxDom.addEventListener('touchmove', e => {
        var target = e.target;
        if (target && target.tagName.toUpperCase() === 'TEXTAREA') {
          return this;
        }

        // 评语部分再内容很多的时候能搓动
        let isNotOverflow = textDomList[0].scrollHeight ? (textDomList[0].scrollHeight <= textDomList[0].offsetHeight) : (textDomList[1].scrollHeight <= textDomList[1].offsetHeight)
        if ((!~e.target.className.indexOf('textarea-place') || isNotOverflow) && (document.querySelector('.remark-box').offsetHeight || 0) < 318 || e.touches[0].clientY < popDom.offsetHeight) {
          e.preventDefault()
        }
      }, false)
    },
    beforeDestroy(){
      this.endTimers()
      this.closeSubjectivemask()
      T_PUBSUB.unsubscribe('pro-msg')
    },
	  filters: {
      formatTime(time) {
        return Moment(time).format('HH:mm')
      },
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
        let URL = API.lesson.problem_delay

        setTimeout(() => {
          self.isProblemtimeHidden = true
        }, 100)

        let params = {
          'limit': duration,
          'problemId': self.problemid
        }

        return request.post(URL,params)
        .then((res) => {
          if (res && res.code === 0 && res.data) {
            let msg = i18n.locale === 'zh_CN' ? `延时${duration > 0 ? duration / 60 + '分钟' : '不限时' }成功` : 'Successful'
            T_PUBSUB.publish('ykt-msg-toast', msg);
          }
        }).catch(error => {

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

        self.problemid = params.problemid
        self.problemType = query.pt

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

        self.refreshDataList()
        pollingTimer = setInterval(self.pollingNewItem, 5000)
        // 初始化时使用完计时的 storage 后，清理掉本题相关的，然后在下面
        // 的 handleDuration 中又立即设置了 storage，
        // 防止刚进入本页面立即进入课堂红包等子页面再返回后没有 storage 信息
        self.cleanDurInfoStorage()
        self.handleDuration()
        self.handlePubSub()

        this.getProlemById(this.problemid);
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
          self.problemid == msg.problemid && self.shoutiConfirm()
        })

        // 从 node 传来， pc收题事件
        T_PUBSUB.subscribe('pro-msg.shoutipc', (_name, msg) => {
          self.problemid === msg.problemid && self.resetTiming(operationType['shouti'])
        })

        // 从 node 传来，pc 延时事件
        T_PUBSUB.subscribe('pro-msg.yanshipc', (_name, msg) => {
          self.problemid === msg.prob && self.resetTiming(operationType['yanshi'], msg)
        })
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
       * 上拉刷新回调
       *
       */
      loadBottom () {
        let self = this
        if (!self.dataList[0]) {
          setTimeout(() => {
            this.$refs.Loadmore.onBottomLoaded()
          }, 100)
          return;
        }

        console.log('上拉松手了')

        let tailNow = self.dataList[self.dataList.length-1].index

        self.fetchList(tailNow).then(res => {
          if(res && res.code === 0 && res.data){
            let list = res.data.list
            if(self.problem_answer_type) {
              list = self.formatTeamResult(res.data)
            }
            // response_num 当前请求返回的投稿数量
            if (list.length === 0) {
              self.isAllLoaded = true
              return
            }
            self.dataList = self.addFold(self.dataList.concat(list))
            // self.dataList = self.dataList.concat(jsonData.data.problem_results_list)

            this.$refs.Loadmore.onBottomLoaded()
          }
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
        console.log(e, position, '测试scroll')
	      let self = this
        // 处理打分蒙版跟随搓动的问题，必须用 absolute， 不能用fixed（否则有光标错位问题）
        // let scoreDom = document.querySelector('#scoreDom')
        // scoreDom.style.top = position.scrollTop + 'px'

        self.isShow2TopBtn = position.scrollTop > windowHeight
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
       * @param {Function} fn 回调函数
       * @param {Number} start 起始位置index，返回值不包括起始位置的值， 默认 0， 即从最新无限大处开始
       */
      fetchList(last_index = -1){
        let URL = API.lesson.get_subj_list

        let params = {
          problem_id: this.problemid,
          last_index,
          size: FENYE_COUNT
        }

        return request.get(URL, params)
      },
			/**
       * 获取已经互评了的数量
       *
       */
			fetchHupingCount(){
				let self = this
				let url = API.get_subj_problem_group_review + '?group_review_id=' + self.problem_group_review_id

				return request.get(url)
			},
	    /**
       * 查询有没有新的答案，根据 response_num 来判断
       *
       */
      pollingNewItem(){
        let self = this
        let URL = API.lesson.get_subj_list_count
        let params = {
          problem_id: self.problemid
        }
        return request.get(URL, params)
        .then((res) => {
          if(res && res.code === 0 && res.data){
            self.setData({
              isShowNewHint: res.data.count - self.dataList.length > 0,
              total_num: res.data.count,
              unfinished_count: res.data.unfinishedCount,
              group_review_done_num: res.data.reviewNum,
              group_review_total_num: res.data.reviewTotalNum
            })
          }
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
         *
         *
         * 由于小组作答可能会出现小组成员覆盖原有答案，所以刷新列表后直接把列表赋新的值，不然需要每条数据去进行比较
         */
        self.fetchList().then(res => {
          if(res && res.code === 0 && res.data){
            self.setData({
              isShowNewHint: false,
              total_num: res.data.count,
              unfinished_count: res.data.unfinished,
              problem_group_review_id: res.data.reviewInfo && +res.data.reviewInfo.reviewId && res.data.reviewInfo.reviewId || this.problem_group_review_id
            })

            // 有互评拿到互评规则  无互评的时候返回的是"0"
            if(res.data.reviewInfo && +res.data.reviewInfo.reviewId && !self.group_review_declaration){
              self.getReviewRules(res.data.reviewInfo.reviewId)
            }

            let newList = res.data.list
            if(res.data.groupInfo){
              let groupInfo = res.data.groupInfo
              self.setData({
                problem_answer_type: 1,
                group_name: groupInfo.groupName,
              })
              newList = self.formatTeamResult(res.data)
            }

            // 返回的条目的个数
            let response_num = newList.length
            // 有可能还一条都没有呢
            let headNow = self.dataList[0] ? self.dataList[0].index : 0
            let headIndex = newList.findIndex(item => item.index === headNow)

            let isAllLoaded = self.isAllLoaded
            if (response_num === 0) {
              isAllLoaded = true
            } else {
              self.setData({
                dataList: self.addFold(newList)
                // dataList: newList
              })
              setTimeout(() => {
                this.dataList.map(e => {
                  e.fold = e.result.content && this.getLength(e.result.content) > 200
                })
              }, 3e2)
              isAllLoaded = newList.length < FENYE_COUNT
            }
            self.setData({
              isAllLoaded
            })

            // self.calcPageHeight()

            // 刷新的话回顶部
            self.back2Top()

          }
          
        })

      },

      /** 
       * @method 分组作答结果
      */
      formatTeamResult(data){
        let self = this
        let newList = data.resultList
        newList.forEach(item => {
          item['index'] = item.resultInfo.index
          item['result'] = Object.assign({}, item.resultInfo) 
          item['score'] = item.scoreInfo.score
          item['totalScore'] = item.scoreInfo.totalScore
          item['resultId'] = item.resultInfo.resultId
        })
        return newList
      },

      /**
       * 延时
       *
       * @event bindtap
       */
      yanshi () {
        // 克隆班不能执行当前操作
        if (!!this.isCloneClass) {
          this.$toast({
            message: this.$t('cloneTips'),
            duration: 3e3
          });
          return
        }
        let self = this
        self.isProblemtimeHidden = false
      },
      /**
       * 收题
       *
       * @event bindtap
       */
      shouti () {
        // 克隆班不能执行当前操作
        if (!!this.isCloneClass) {
          this.$toast({
            message: this.$t('cloneTips'),
            duration: 3e3
          });
          return
        }
        let self = this
        T_PUBSUB.publish('ykt-msg-modal', {msg: config.pubsubmsg.modal[1], mark: self.problemid})
      },
      /**
       * 收题
       *
       * @event bindtap
       */
      shoutiConfirm () {
        let URL = API.lesson.problem_finish
        let params = {
          'problemId': this.problemid
        }

        return request.post(URL, params)
        .then((res) => {
          if(res && res.code === 0 && res.data){

          }
        }).catch(error => {

        })
      },
      /**
       * 试题主观题页面页面中的 投屏 按钮
       *
       * @event bindtap
       * @params {string} id 将要投屏的主观题的id
       */
      postSubjective (id) {
        // 克隆班不能执行当前操作
        if (!!this.isCloneClass) {
          this.$toast({
            message: this.$t('cloneTips'),
            duration: 3e3
          });
          return
        }
        let self = this

        let str = JSON.stringify({
          'op': 'showsproblem',
          'lessonid': self.lessonid,
          'spid': id,
          'msgid': 1234,
          // 'hide': this.isHideName
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
       * 发送全班按钮
       *
       * @event bindtap
       * @param {number} subjectiveid;
       */
      fsqbHander (subjectiveid) {
        let self = this

        let str = JSON.stringify({
          'op': 'sendsproblem',
          'lessonid': self.lessonid,
          'spid': subjectiveid,
          'msgid': 1234,
          'pid': self.problemid
        })

        self.socket.send(str)
      },
      /**
       * 归零、结束定时器等
       *
       */
      endTimers () {
        // 关闭刷新的定时器
        clearInterval(durationTimer)
        clearInterval(pollingTimer)
      },
      /**
	     * 点击打分部分，呼出打分面板
	     *
	     * @event bindtap
       * @params {Number} answerindex 将要打分的主观题答案的index
       * @params {Number} scoreTotal 总分
	     * @params {Number} index 当前的item的序号
       * @params {String} remark 教师的评语
       * @params {Number} resultId 将要打分的主观题答案的id
	     */
	    initScore (answerindex, resultId, score = -1, scoreTotal, index, remark = '') {
	      let self = this
        let url = API.lesson.review_score_detail
        let params = {
          problemId: self.problemid,
          problemResultId: resultId
        }
	      // 投屏时不可打分
        if (answerindex === self.postingSubjectiveid) {return;}
        
        score = score > -1 ? score/100 : -1
        scoreTotal = scoreTotal/100

        // 防止用户频繁点击
        clearTimeout(scoreTapTimer)
        scoreTapTimer = setTimeout(() => {
          self.scoringIndex = index
          // TODO:有互评的时候再开放这段
					return request.post(url, params)
	          .then(res => {
              if(res && res.code === 0 && res.data){
                let data = res.data
                self.tProportion = 100 - data.reviewPercent
                self.gProportion = data.reviewPercent
                
                let teacherScore = data.teacherScore > -1 ? data.teacherScore/100 : data.teacherScore
                let reviewScore = data.reviewScore > -1 ? data.reviewScore/100 : data.reviewScore

                self.$refs.StarPanel.$emit('enter', answerindex, resultId, scoreTotal, teacherScore, reviewScore, self.tProportion/100, data.reviewPercent/100, index, remark)
              }
	          }).catch(error => {
	            console.error('error', error)
            })
          
          // self.$refs.StarPanel.$emit('enter', answerindex, resultId, scoreTotal, score, -2, 100, 0, index, remark)
          
        }, 100)
	    },
	    /**
	     * 点击打分部分，呼出打分面板
	     *
	     * @event
	     * @params {Number} answerid 将要打分的主观题答案的index
       * @params {Number} score 打的分
       * @params {String} remark 教师的评语
	     */
	    giveScore (answerindex, teacherScore, groupReviewScore, remark, teacherProportion, groupReviewProportion, resultId) {
	    	let self = this

	    	if (teacherScore === -1) {
	    		self.$refs.StarPanel.$emit('leave')
	    		return;
	    	}

	      let url = API.lesson.post_grade
	      let postData = {
          problemId: self.problemid,
          score: Math.round(teacherScore*100),
          userId: self.dataList[self.scoringIndex].user.userId,
          comment: {
            content: remark
          },
          problemResultId: resultId,
          reviewScore: groupReviewScore > 0 ? Math.round(groupReviewScore*100) : groupReviewScore > -1 ? 0 : undefined
        }

	      return request.post(url, postData)
	        .then(res => {
            if(res && res.code === 0 && res.data){
               // 关闭打分页面
              console.log(`打过分啦${teacherScore}`, self.scoringIndex)
              if(this.problem_group_review_id) {
                self.dataList[self.scoringIndex].score = Math.round((+teacherScore * teacherProportion * 100) + (+groupReviewScore * groupReviewProportion * 100))
              }else {
                self.dataList[self.scoringIndex].score = Math.round(teacherScore*100)
              }
              self.dataList[self.scoringIndex].comment.content = remark
              

              self.$refs.StarPanel.$emit('leave')
            }
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
			/*
			 * 发起互评,唤出互评面板
			 */
			faqihuping() {
        // 克隆班不能执行当前操作
        if (!!this.isCloneClass) {
          this.$toast({
            message: this.$t('cloneTips'),
            duration: 3e3
          });
          return
        }
				let self = this
				if(this.newTime > 0){
					let msg = i18n.locale === 'zh_CN' ? '请先收题' : 'Stop answering required'
					T_PUBSUB.publish('ykt-msg-toast', msg);
				} else {
          if(this.dataList.length < 2){
            let msg = i18n.locale === 'zh_CN' ? '答案提交数量不少于2份才可发起互评' : '2 answers are required at least'
            T_PUBSUB.publish('ykt-msg-toast', msg);
            return this;
          }
					// 防止用户频繁点击
	        clearTimeout(hupingTapTimer)
	        hupingTapTimer = setTimeout(() => {
	          self.$refs.HupingPanel.$emit('enterHuping', self.problem_group_review_id, self.tProportion, self.gProportion, self.group_review_declaration)
	        }, 100)
				}
			},
			/**
	     * 点击打分部分，呼出打分面板
	     *
	     * @event
	     * @params {Number} problem_id 问题id
       * @params {Number} teacher_score_proportion 教师评分比例
       * @params {Number} group_review_proportion 小组互评的比例
       * @params {String} review_declaration 评分要点
	     */
	    giveHuping (teacher_score_proportion, group_review_proportion, review_declaration) {
	    	let self = this

	      let url = API.lesson.publish_review
	      let postData = {
	        "problemId": self.problemid,
					reviewPercent: group_review_proportion,
					reviewDeclaration: review_declaration
	      }

	      request.post(url, postData)
	        .then(res => {
            if(res && res.code === 0 && res.data){
              self.problem_group_review_id = res.data.reviewId
              self.group_review_declaration = review_declaration
		          self.$refs.HupingPanel.$emit('leaveHuping')
							self.init()
            }
	        }).catch(res => {
            self.$refs.HupingPanel.$emit('leaveHuping')
						
          });



	    },
			/**
			 * 修改占比
			 *
			 * @event
			 * @params {Number} teacher_score_proportion 教师评分比例
			 */
			editHuping(teacher_proportion){
				let self = this

	      let url = API.edit_subj_problem_score_proportion
	      let postData = {
					teacher_proportion,
					problem_id: self.problemid
	      }

	      request.post(url, postData)
	        .then(jsonData => {

						if(jsonData.success){
							// 关闭互评页面
		          console.log('修改成功');
		          self.$refs.HupingPanel.$emit('leaveHuping')
						}

	        }).catch(res => {
						let msg = res.msg
						T_PUBSUB.publish('ykt-msg-toast', msg);
          });
			},
			/*
			 * 打开小组成员列表
			 *
			 */
			handleOpenTeamMember(teamId) {
        let URL = API.lesson.get_team_detail
        let params = {
          team_id: teamId
        }
        return request.get(URL, params)
        .then(res => {
          if(res && res.code === 0 && res.data){
            this.showTeamMember = true;
            this.teamMemberList = res.data.memberList
            this.currentTeam = res.data.teamName
          }
        })
			},
			/*
			 * 关闭小组成员列表
			 *
			 */
			handleTeammemberClosed() {
				this.showTeamMember = false;
			},
			showTips(){
        let msg = {
          title: i18n.locale === 'zh_CN' ? "未作答" : 'Unanwered',
          content: i18n.locale === 'zh_CN' ? "未作答数为“未作答的组数”和“已签到未进组的学生数”" : 'Unanwered = unanwered gruops + signed students but not in groups.',
          option: i18n.locale === 'zh_CN' ? "关闭" : 'Close'
        }
				T_PUBSUB.publish('ykt-tips-modal', msg);
      },
      /*
      * 变更投屏状态
      * 可能已废弃，以后删掉
      *
      **/
      showUserInfoChange(val) {
        this.isHideName = val
      },
      // 处理小数问题
      parsePriceValue (num) {
        // 确保输入最多小数点后2位
        if (num < 0.01){
          return "0.0"
        }else {
          var hNum = num * 100
          var hNumInt = parseInt(hNum)
          if (hNum - hNumInt > 0.999999)
            hNumInt++

          return hNumInt / 100
        }
      },
      // 增加fold 属性
      addFold(list) {
          list.map(e => {
              if(e.result.content && this.getLength(e.result.content)> 200) {
                  e.fold = false
              } else {
                  e.fold = false
                  e.hideFold = true
              }
              e.result.foldContent = e.result.content.slice(0, 100)
          })
          return list
      },
      getLength(str) {
          let s = str + ''
          var result = s.replace(/[^\x00-\xff]/g, '**')
          return result.length
      },
      // 是否有缩略图
      hasThumb(item) {
        let sub = item.result
        return !!(sub && sub.pics && sub.pics[0] && sub.pics[0].thumb || sub.pics[0].pic)
      },
      // 下线功能提示
      showToast(){
        this.$toast({
          message: this.$t('backsoon') || '该功能暂时下线维护，稍后回归，敬请期待~',
          duration: 3e3
        });
      },
      /** 
       * @method 获取互评规则
       * 
      */
      getReviewRules(reviewId){
        let URL = API.lesson.get_review_config
        let params = {
          reviewId
        }

        return request.post(URL, params)
        .then(res => {
          if(res && res.code === 0 && res.data){
            this.group_review_declaration = res.data.reviewDeclaration
            this.tProportion = 100 - res.data.reviewPercent
            this.gProportion = res.data.reviewPercent
          }
        })
      }
	  }
	}
</script>

<style lang="scss" scoped>
	@import "~@/style/_variables";
  @import "~@/style/common";
  .wai {
    height: 100%;
    width: 100%;
    position: absolute;
    top: 0;
    left: 0;
    z-index: 101;
  }
	.problem-root {
    position: relative;
    height: 100%;
    background: #fff;
    overflow: auto;
    -webkit-overflow-scrolling: touch;

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
	  background: $white;

		/* 上部 */
	  .upper {
	  	width: 100%;
	  	max-height: 4.453333rem;
	  	padding: .133333rem .2rem 0;
	  	text-align: center;
			box-shadow: 0 .026667rem .16rem 0 #e2e2e2;

      .xitixushi {
        display: flex;
        justify-content: space-between;
        align-items: center;
        height: 1.866667rem;
        padding: 0 0.3rem;
        background: rgba(0,0,0,.8);
				border-radius: .133333rem;

        .sjd {
          padding-right: 1.333333rem;
          color: #F84F41;
        }

        .rolex.warn {
          color: #F84F41;
          .iconfont {
            color: #F84F41;
          }
        }

        .time-rel, .pro-rel {
          align-self: center;
          color: $white;

          .tbtn {
            width: 1.733333rem;
            height: 0.8rem;
            line-height: 0.8rem;
            border: 1px solid #CCCCCC;
            border-radius: 0.4rem;
          }
          .nobtn {
            border: none;
            border-radius: 0.4rem;
            background-color: #282828;
            color: #08BC72;
          }
          .green {
            border-color: #08BC72;
            background-color: rgba(8, 188, 114, 0.2)
          }
          .red {
            border-color: #F84F41;
            background-color: rgba(248, 79, 65, 0.2)
          }
        }
      }

			.jishi {
				margin-top: -0.186667rem;
				width: 0.9rem;
				vertical-align: middle;
			}
			.faqihuping-box {
				display: flex;
				align-items: center;
				justify-content: space-between;
				padding: .533333rem .333333rem;

				.total-box{
					display: flex;
					align-items: center;
					.yjy {
						color: #666;
						padding: 0 0.16rem;
						height: 1.333333rem;
						display: flex;
						flex-direction: column;
						justify-content: space-around;
						span:first-of-type {
							display: block;
							line-height: .426667rem;
						}
						.ques {
							width: .346667rem;
							height: .346667rem;
							display: inline-block;
							vertical-align: middle;
							background: url(~images/teacher/question.png)no-repeat 0 0/contain;
							margin-left: .053333rem;
						}
					}
					.line {
						width: 1px;
						height: .8rem;
						background: #eee;
						margin: 0 .266667rem;
					}
				}



				.faqihuping {
					width: 2.133333rem;
					height: .746667rem;
					line-height: .746667rem;
					text-align: center;
					border-radius: .106667rem;
					background: rgba(99,158,244,.2);
					color: #5096F5;
				}

				.disabled {
					background: rgba(155,155,155,.2);
					color: #9b9b9b;
				}
			}

	  }

		.group_name {
			padding-left: .533333rem;
			color: #666;
			width: 100%;
			height: 1.226667rem;
			line-height: 1.226667rem;
			.iconfont {
				color: #B684C8;
				margin-right: .266667rem;
			}
		}
	  .gap {
      height: .133333rem;
			background: #f8f8f8;
    }

		/* 主观题内容区 */
	  .subjective-box {
			margin-top: .133333rem;
	  	.hmy {
        margin-top: 3.04rem;
        text-align: center;
				color: #9B9B9B;
      }

      .subjective-list {
      	color: #4A4A4A;

      	padding-bottom: 1.5rem;
	      -webkit-overflow-scrolling: touch;

	      .item {
	        padding: 0 .533333rem;
	        background: $white;

	        .detail {
	          padding-top: 0.266667rem;

						.student-info {
							display: flex;
							align-items: center;
							justify-content: space-between;
							width: 100%;

							.avatar-box {
								display: flex;
								align-items: center;

								.avatar {
			            margin-right: -.133333rem;
			            width: .666667rem;
			            height: .666667rem;
			            border-radius: 50%;
			          }
								.avatar:last-of-type {
									margin-right: .4rem;
								}
							}

							.time {
		            color: $graybg;
		          }

	            .author {
	            	display: inline-block;
	              color: #666;
	            }

						}

	          .cont {
							.cont-title {
								margin: .266667rem 0 0 .093333rem;
								color: #333;
                text-align: justify;
							}
              .color16{
                font-size: px2rem(32px);
                color: #639ef4;
                display: inline-block;
                .iconfont{
                  font-size: px2rem(60px);
                  vertical-align: middle;
                }
              }
              .color12{
                font-size: px2rem(24px);
                color: #639ef4;
              }
	            .pic {
	              max-width: 100%;
	              max-height: 5.68rem;
								display: block;
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
	          padding: px2rem(40px) 0;
            height: px2rem(50px);
	          .gray {
	            color: $graybg;
	          }

	          .dafen-box, .action {
	            display: flex;
	            align-items: center;
	            justify-content: space-between;
	          }

            .action .coll {
              margin-right: 0.666667rem;
              width: 2.133333rem;
            }

            .cancel-post-btn {
              background: $blue;
              width: 2.346667rem;
              text-align: center;
              height: 0.826667rem;
              line-height: 0.826667rem;
              color: $white;
            }

            .qxtp {
              margin-right: -0.4rem;
            }

            .yfqb {
              background: $graybg;
            }

            .fsqb-innerline {
              float: left;
              margin-top: 0.2rem;
              width: 1px;
              height: 0.4rem;
              background: $white;
            }
	        }
	      }

	      .nomore {
	        position: relative;
	        height: 1rem;
	        margin: 0 0.6rem;
	        text-align: center;
	        color: $graybg;

	        .wenan {
	          position: relative;
	          margin: 0 auto;
	          width: 2.093333rem;
            background: #fff;
            line-height: 1rem;
	        }

	        .bgline {
	          position: absolute;
	          top: 50%;
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
  .rc-mask {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background: rgba(0,0,0,0.9);
    overflow: auto;
		z-index: 30;

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
  .teammember {
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,.75);
    position: absolute;
    top: 0;
    left: 0;
    z-index: 9999;

      .member-content {
        width: 100%;
        max-height: 12.133333rem;
				min-height: 50%;
				position: absolute;
				bottom: 0;
				left: 0;
				background: #fff;
        .member-actions {
					height: 1.333333rem;
					width: 100%;
					padding-left: .4rem;
					line-height: 1.333333rem;
					border-bottom: .026667rem solid #c8c8c8;
        }

        .member-detail {
					padding-left: .533333rem;
					min-height: 6.706667rem;
					max-height: 10.8rem;
					overflow: scroll;

          .team-info {
						color: #333;
						font-weight: bold;
						display: flex;
						justify-content: space-between;
						align-items: center;
						padding: .533333rem .4rem .266667rem 0;

						.team-total {
							font-weight: normal;
							color: #9b9b9b;
						}
          }

          .team-item {
						height: 1.493333rem;
						padding: .266667rem 0 .293333rem;
						display: flex;
						align-items: center;
            .member--avatar {
              display: block;
              width: 0.933333rem;
              height: 0.933333rem;
              border-radius: 50%;
            }

            .member--name {
              flex: 1;
              text-align: left;
              border-bottom: 1px solid #eee;
							height: .933333rem;
							line-height: .933333rem;
							margin-left: .133333rem;

              .name {
                padding-left: 0.4rem;
              }
            }
          }
        }
      }
  }

	.toast-box {
		width: 5.333333rem;
		margin-left: -2.666665rem;
	}
	.longtips {
		width: 8.666667rem;
		height: 2.133333rem;
		text-align: center;
		margin-left: -4.333333rem;
		padding: .4rem .453333rem;
		line-height: .666667rem;
	}

  .analysis--btn {
    margin: 0.533333rem auto;
    width: 7.733333rem;
    height: 1.173333rem;
    line-height: 1.173333rem;

    color: #5096F5;
    text-align: center;;
    cursor: pointer;
    border: 0.026667rem solid #639EF4;
    border-radius: 0.106667rem;
  }
</style>

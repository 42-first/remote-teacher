<!--试题结果-主观题结果页面-->
<template>
	<div class="wai">
    <div class="problem-root" v-scroll="onScroll">
      <slot name="ykt-msg"></slot>
      <!-- 教师遥控器引导查看答案、续时 -->
      <GuideDelay
        v-show="!isGuideDelayHidden"
      ></GuideDelay>

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
            <div class="xitixushi">
              <!-- 延时相关 -->
              <div class="time-rel f15">
                <v-touch v-if="newTime <= 0 || ~limit" class="tbtn green" v-on:tap="yanshi"><!-- 延时 -->{{ $t('extend') }}</v-touch>
                <div v-else class="tbtn nobtn"><!-- 不限时 -->{{ $t('bxs') }}</div>
              </div>

              <div class="sjd f24" v-show="newTime <= 0"><!-- 作答时间结束 -->{{ $t('receivertimeout') }}</div>

              <!-- 中间秒表 -->
              <div v-show="newTime > 0" :class="['rolex', 'f36', {'warn': newTime <= 10 && ~limit}]">
                <img v-if="!~limit" class="jishi" src="~images/teacher/jishi-zheng.png" alt="">
                <img v-show="~limit && newTime > 10" class="jishi" src="~images/teacher/jishi-dao-w.png" alt="">
                <img v-show="~limit && newTime <= 10" class="jishi" src="~images/teacher/jishi-dao-r.png" alt="">
                <span class="time">{{durationLeft}}</span>
              </div>

              <!-- 收题相关 -->
              <div v-show="newTime > 0" class="pro-rel f15">
                <v-touch class="tbtn red" v-on:tap="shouti"><!-- 收题 -->{{$t('shouti')}}</v-touch>
              </div>
            </div>

            <div :class="['f18', 'yjy']">
              <span>
                {{ $t('hasSubmit')}}: {{total_num}}/{{class_participant_num}}
              </span>
              <span class="hide-show-name">
                <label @click="hideNameHandle">
                  <i class="iconfont icon-kuang" v-show="!isHideName"></i>
                  <i class="iconfont icon-kuangxuanzhong" v-show="isHideName"></i>
                  <span class="info">投屏隐藏学生姓名</span>
                </label>
              </span>
            </div>
          </section>

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
                    <img :src="item.user_avatar_46" class="avatar" alt="">
                    <div class="cont f18">
                      <div class="time f15">{{item.end_time | formatTime}}</div>
                      <span class="author f15" v-show="!isHideName">{{item.user_name}}</span>
                      <span class="author f15" v-show="isHideName">匿名</span>
                      <br>
                      {{item.subj_result.content}}<br>

                      <v-touch v-show="item.subj_result.pics[0].thumb" :id="'pic' + item.problem_result_id" tag="img" v-lazy="item.subj_result.pics[0].thumb" class="pic" alt="" v-on:tap="scaleImage(item.subj_result.pics[0].pic, $event)"></v-touch>
                    </div>
                  </div>

                  <div class="action-box f14">
                    <!-- 投屏时不能打分 -->
                    <v-touch class="dafen-box" v-show="postingSubjectiveid !== item.problem_result_id" v-on:tap="initScore(item.problem_result_id, item.score, item.source_score, index, item.remark)">
                      <div class="gray">
                        <i class="iconfont icon-ykq_dafen f20" style="color: #639EF4;"></i>
                        <span>{{ $tc('givestuscore', item.score === -1) }}</span>
                        <span v-show="item.score !== -1">{{item.score}}{{ $t('stutestscore') }}</span>
                      </div>
                    </v-touch>
                    <div class="zhanweifu" v-show="postingSubjectiveid === item.problem_result_id"></div>

                    <div class="action f14">
                      <v-touch class="gray" v-show="postingSubjectiveid !== item.problem_result_id" v-on:tap="postSubjective(item.problem_result_id)">
                        <i class="iconfont icon-shiti_touping f24" style="color: #639EF4; margin-right: 0.1rem;"></i>
                        <!-- 投屏 --><span>{{ $t('screenmode') }}</span>
                      </v-touch>
                      <v-touch class="cancel-post-btn f14" v-show="postingSubjectiveid === item.problem_result_id && !postingSubjectiveSent" v-on:tap="fsqbHander(item.problem_result_id)">
                        <!-- 发送全班 -->{{ $t('postpublic') }}
                      </v-touch>
                      <div class="cancel-post-btn yfqb f14" v-show="postingSubjectiveid === item.problem_result_id && postingSubjectiveSent">
                        <!-- 已发全班 -->{{ $t('postpubliced') }}
                      </div>
                      <v-touch class="cancel-post-btn f14 qxtp" v-show="postingSubjectiveid === item.problem_result_id" v-on:tap="closeSubjectivemask">
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

    <!-- 发题选时间蒙版 -->
    <Problemtime v-show="!isProblemtimeHidden"
      :problem-type="'ShortAnswer'"
      :isYanshi="true"
      @cancelPublishProblem="cancelPublishProblem"
      @chooseProblemDuration="yanshiProblem"
    ></Problemtime>
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
  import config from '@/pages/teacher/config/config'

  import StarPanel from './common/score-panel-v2'
  import Scale from './common/scale'
  import Loadmore from 'mint-ui/lib/loadmore'
  // 试题延时
  import Problemtime from '@/components/teacher-restructure/common/problemtime'
  // 教师遥控器引导查看答案、续时
  import GuideDelay from '@/components/teacher-restructure/common/guide-delay'

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
        isHideName: !0,                // 是否隐藏学生姓名
	    }
	  },
	  computed: {
      ...mapGetters([
        'lessonid',
        'socket',
        'isGuideDelayHidden',
        'current',
        'pptData',
        'postingSubjectiveid',
        'postingSubjectiveSent',
      ])
	  },
	  components: {
	    StarPanel,
      Scale,
      Loadmore,
      Problemtime,
      GuideDelay
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
      boxDom.addEventListener('touchmove', e => {
        // 评语部分再内容很多的时候能搓动
        let isNotOverflow = textDomList[0].scrollHeight ? (textDomList[0].scrollHeight <= textDomList[0].offsetHeight) : (textDomList[1].scrollHeight <= textDomList[1].offsetHeight)
        if (!~e.target.className.indexOf('textarea-place') || isNotOverflow) {
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
      // 点击确定是否显示学生姓名
      hideNameHandle () {
        this.isHideName = !this.isHideName;
      },
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
            let msg = i18n.locale === 'zh_CN' ? `延时${timeList[duration]}成功` : 'Successful'
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

        newTime = 100 //initTime

        self.refreshDataList()
        // pollingTimer = setInterval(self.pollingNewItem, 5000)
        // 初始化时使用完计时的 storage 后，清理掉本题相关的，然后在下面
        // 的 handleDuration 中又立即设置了 storage，
        // 防止刚进入本页面立即进入课堂红包等子页面再返回后没有 storage 信息
        self.cleanDurInfoStorage()
        // self.handleDuration()
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

        // 从 node 传来， pc收题事件
        T_PUBSUB.subscribe('pro-msg.shoutipc', (_name, msg) => {
          self.problemid === msg.problemid && self.resetTiming(operationType['shouti'])
        })

        // 从 node 传来，pc 延时事件
        T_PUBSUB.subscribe('pro-msg.yanshipc', (_name, msg) => {
          self.problemid === +msg.prob && self.resetTiming(operationType['yanshi'], msg)
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

        let tailNow = self.dataList[self.dataList.length-1].problem_result_id

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
          'msgid': 1234
        })

        self.socket.send(str)
        typeof gaue !== 'undefined' && gaue.default.fixTrigger(event);
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
       * @params {Number} answerid 将要打分的主观题答案的id
       * @params {Number} studentScore 当前分值
       * @params {Number} scoreTotal 总分
	     * @params {Number} index 当前的item的序号
       * @params {String} remark 教师的评语
	     */
	    initScore (answerid, studentScore, scoreTotal, index, remark) {
	      let self = this

	      // 投屏时不可打分
	      if (answerid === self.postingSubjectiveid) {return;}

        // 防止用户频繁点击
        clearTimeout(scoreTapTimer)
        scoreTapTimer = setTimeout(() => {
          self.scoringIndex = index
          self.$refs.StarPanel.$emit('enter', ...arguments)
        }, 100)
	    },
	    /**
	     * 点击打分部分，呼出打分面板
	     *
	     * @event
	     * @params {Number} answerid 将要打分的主观题答案的id
       * @params {Number} score 打的分
       * @params {String} remark 教师的评语
	     */
	    giveScore (answerid, score, remark) {
	    	let self = this

	    	if (score === -1) {
	    		self.$refs.StarPanel.$emit('leave')
	    		return;
	    	}

	      let url = API.subjective_problem_teacher_scorev2
	      let postData = {
	        'lesson_id': self.lessonid,
	        'problem_result_id': answerid,
	        'score': score,
          remark
	      }

	      request.post(url, postData)
	        .then(jsonData => {
	          // 不需要判断success，在request模块中判断如果success为false，会直接reject
	          // location.href = '/v/index/course/normalcourse/manage_classroom/'+ self.courseid +'/'+ self.classroomid +'/';

	          // 关闭打分页面
	          console.log(`打过分啦${score}`, self.scoringIndex)
	          self.dataList[self.scoringIndex].score = +score
            self.dataList[self.scoringIndex].remark = remark
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
    background: #000000;
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
	  background: #f6f7f8;

		/* 上部 */
	  .upper {
	  	margin: 0 auto;
	  	width: 8.8rem;
	  	height: 4.0rem;
	  	padding: 0.8rem 0.6rem 0 0.6rem;
	  	// border-bottom: 1px solid #cccccc;
	  	text-align: center;
      width: 100%;
      background-color: #fff;

      .xitixushi {
        display: flex;
        justify-content: space-between;
        align-items: center;
        height: 1.866667rem;
        padding: 0 0.3rem;
        background: #212121;
        border-radius: 0.1066667rem;
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
			.yjy {
				margin-top: 0.3466667rem;
        padding-top: 0.26667rem;
        line-height: 0.53333rem;
        color: #9b9b9b;
        text-align: left;
        font-size: 0.37333333rem;
        border-top: solid #aaa 0.013333rem;
        display: flex;
        .hide-show-name{
          flex: 2;
          text-align: right;
          .iconfont{
            font-size: 0.373333rem; 
          }
          .icon-kuang{
            color: #666;
          }
          .icon-kuangxuanzhong{
            color: #639efc;
          }
          .info{
            color: #666;
          }
        }
			}
	  }

	  .gap {
      height: 0.026667rem;
    }

		/* 主观题内容区 */
	  .subjective-box {
	  	margin-top: 0.26667rem;
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
  .rc-mask {
    position: fixed;
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

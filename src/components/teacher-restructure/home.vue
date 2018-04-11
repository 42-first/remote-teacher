<!-- 教师遥控器根组件 -->
<template>
  <div class="root J_page J_tip">
    <div id="rc-home" :class="['rc-home',{'shuban': isShuban}]" v-show="isEnterEnded">
      <!-- 当前幻灯片 -->
      <div id="upper" class="card-box upper">
        <div class="detail f14 dontcallback">
          <div>
            {{ $t('curslide') }}<span class="ct f18">{{current}}/{{total}}</span>
          </div>
          <v-touch v-show="!isPubCheckProblemBtnHidden" class="btn pubpblm_or_check_answer" v-on:tap="problemHandler">
            {{ $tc('sendprob', !isProblemPublished) }}
          </v-touch>
        </div>

        <div class="img-wrapper">
        	<template v-if="pptData[current - 1].Shapes && pptData[current - 1].Shapes.length">
        		<v-touch class="video-btn dontcallback" v-for="btnItem in pptData[current - 1].Shapes" v-if="btnItem.PPTShapeType === 16" :style="{left: btnItem.Left*100/cardWidth+'%', top: btnItem.Top*100/cardHeight+'%', width: btnItem.Width*100/cardWidth+'%', height: btnItem.Height*100/cardHeight+'%', zIndex: btnItem.ZOrderPosition}" v-on:tap="videoControl(pptData[current - 1].lessonSlideID, btnItem.PPTShapeId)"></v-touch>
        	</template>
        	
        	<img v-if="isUpImgError && isPPTVersionAboveOne && !isUploadSlideCrash" class="img-error" src="~images/teacher/img-uploading.png" />
        	<img v-if="isUpImgError && (!isPPTVersionAboveOne || isUploadSlideCrash)" class="img-error" src="~images/teacher/img-error.png" />
        	<img v-if="pptData.length && !pptData[current - 1].Cover" class="img-error" :src="imgUploadingPath" />
        	<img v-if="pptData.length && pptData[current - 1].Cover" class="card" :src="pptData[current - 1].Cover" />
        </div>

      </div>
      <!-- 下一张幻灯片 -->
      <div id="downer" class="card-box downer" v-if="current < pptData.length">
        <div class="detail f14">{{ $t('nextslide') }}</div>
        <img v-if="isDownImgError && isPPTVersionAboveOne && !isUploadSlideCrash" class="img-error" src="~images/teacher/img-uploading.png" />
        <img v-if="isDownImgError && (!isPPTVersionAboveOne || isUploadSlideCrash)" class="img-error" src="~images/teacher/img-error.png" />
        <img v-if="pptData.length && !pptData[current].Cover" class="img-error" :src="imgUploadingPath" />
        <img v-if="pptData.length && pptData[current].Cover" class="card" :src="pptData[current].Cover" />
      </div>
      <!-- 工具栏 -->
      <!-- 当蒙版是缩略图时，底部的工具栏要露出来 -->
      <Toolbar
        ref="Toolbar"
        :active-index="0"
        @showThumbnail="showThumbnail"
        @showActivity="showActivity"
        @goHome="goHome"
      ></Toolbar>
    </div>

    <!-- 蒙版层 -->
    <!-- 当蒙版是缩略图、课堂动态时，底部的工具栏要露出来 -->
    <div id="templates" v-show="!isInitiativeCtrlMaskHidden || !isToastCtrlMaskHidden || !isMsgMaskHidden" :class="['templates', 'dontcallback']">
      <!-- 遥控器遮罩层（用户主动弹出控制类）：缩略图，二维码控制，发试题选时间，课堂动态，第三优先级 -->
      <div class="rc-mask" v-show="!isInitiativeCtrlMaskHidden">
        <component
          ref="InitiativeCtrlMask"
          :is="initiativeCtrlMaskTpl"
          @goHome="goHome"
          @showThumbnail="showThumbnail"
          @showActivity="showActivity"
          @cancelPublishProblem="cancelPublishProblem"
          @chooseProblemDuration="unlockProblem"
          @checkDoubt="checkDoubt"

          :problem-type="problemType"
        ></component>
      </div>

      <!-- 遥控器遮罩层（被动弹出控制类，可关闭）：夺权面板，第二优先级 -->
      <div class="rc-mask" v-show="!isToastCtrlMaskHidden">
        <component
          ref="ToastCtrlMask"
          :is="toastCtrlMaskTpl"
          :is-robber="isRobber"
          :is-robbing.sync="isRobbing"
          :byself="byself"
        ></component>
      </div>

      <!-- 遥控器遮罩层（错误信息类，不可关闭）：各种错误信息，第一优先级 -->
      <div class="rc-mask" v-show="!isMsgMaskHidden">
        <component
          ref="MsgMask"
          :is="msgMaskTpl"
          :connect-count-down="connectCountDown"
          :is-connecting-hidden="isConnectingHidden"
          @triggerReconnect="triggerReconnect"
        ></component>
      </div>
    </div>

    <!-- 新手引导页 -->
    <Guide
      v-show="isMsgMaskHidden && isToastCtrlMaskHidden && initiativeCtrlMaskTpl !== 'Qrcode' && !isGuideHidden"
      @guideNext="guideNext"
    ></Guide>

    <!-- 教师遥控器引导查看答案、续时 -->
    <GuideDelay
      v-show="isMsgMaskHidden && isToastCtrlMaskHidden && initiativeCtrlMaskTpl !== 'Qrcode' && isGuideHidden && !isGuideDelayHidden && isProblemPublished"
      @guideDelayNext="guideDelayNext"
    ></GuideDelay>

  </div>
</template>

<script>
	/* eslint-disable no-undef, no-new */

	import {mapGetters} from 'vuex'

	import request from '@/util/request'
	import {configWX} from '@/util/wx-util'
	import API from '@/pages/teacher/config/api'

	if (process.env.NODE_ENV !== 'production') {
	  request.post = request.get
	}

	// 页面组件
	// 工具栏
	import Toolbar from '@/components/teacher-restructure/common/toolbar'
	// 新手引导蒙版
	import Guide from '@/components/teacher-restructure/common/guide'
	// 教师遥控器引导查看答案、续时
	import GuideDelay from '@/components/teacher-restructure/common/guide-delay'
	// 错误蒙版
	import Errormsg from '@/components/teacher-restructure/common/errormsg'
	// 断网重连蒙版
	import Reconnect from '@/components/teacher-restructure/common/reconnect'
	// 夺权面板
	import Deprive from '@/components/teacher-restructure/common/deprive'
	// 二维码控制蒙版
	import Qrcode from '@/components/teacher-restructure/common/qrcode'
	// 缩略图面板
	import Thumbnail from '@/components/teacher-restructure/common/thumbnail'
	// 课堂动态面板
	import Activity from '@/components/teacher-restructure/common/activity'

	// 没有输出，而是给全局window加了函数 PreventMoveOverScroll
	import './util/preventoverscroll'

	// js功能模块，放到 mixins 中
	// 一些开关
	import switches from './util/switches'
	// Websocket 服务
	import socketService from './util/socket-service'
	// 课堂试题相关
	import problemRelated from './util/problem-related'

	let pollingPresentationTagTimer = null // 轮询获取缩略图页 不懂 等标志的信息
	let pollingTougaoTimer = null          // 轮询获取投稿数的信息
	let oldDoubt = 0                       // 记录不懂人次，便于教师点击过后清零
	let doubtTotalSum = 0                  // 不懂总数

	export default {
	  name: 'Remote',
	  // 找不到的data在 mixins 中
	  data () {
	    return {
	      imgUploadingPath: require('../../images/teacher/img-uploading.png'),
	      isShuban: false,                        // 是竖版ppt
	      isGuideHidden: true,                    // 新手引导隐藏
	      // 根页面不用store，每次进入后自己夺自己的权，简单粗暴，
	      // 否则要再根据socket是否已经存在处理一遍监听
	      socket: null,                           // 全局 Websocket 实例对象
	      
	      isRobber: false,                        // 是夺权者
	      isRobbing: false,                       // 正在夺权
	      byself: false,                          // 是自己夺权
	      startPoint: [0, 0],
	      
	      connectCountDown: 10,
	      isConnectingHidden: true,               // 连接中隐藏
	      
	      isPPTVersionAboveOne: false,            // ppt插件的版本大于1
	      isUploadSlideCrash: false,              // 过了2秒
	      idIndexMap: {},                         // slideid 和 slideindex 的对应关系
	      cardWidth: 750,													// 大json中的ppt原始宽度
	      cardHeight: 540,												// 大json中的ppt原始高度
	    }
	  },
	  computed: {
	    isUpImgError () {
	      let self = this
	      let pptData = self.pptData
	      let current = self.current

	      return pptData[current - 1] && (pptData[current - 1].Cover == 'rain://error/upload-error' || pptData[current - 1].Cover == 'rain://error/export-error')
	    },
	    isDownImgError () {
	      let self = this
	      let pptData = self.pptData
	      let current = self.current

	      return pptData[current] && (pptData[current].Cover == 'rain://error/upload-error' || pptData[current].Cover == 'rain://error/export-error')
	    },
	    ...mapGetters([
	    	'userid',
	    	'avatar', 
	    	'auth',   
	    	'courseid',
	    	'classroomid',
	    	'coursename',
        'lessonid',
        'presentationid',
        'errType',
        'isGuideDelayHidden',
        'current',
        'total',
        'pptData',
        'newdoubt',
        // 'newtougao',
        // 'isPPTVersionAboveOne',
        // 'idIndexMap',
        'isEnterEnded',
        'isMsgMaskHidden',
        'isToastCtrlMaskHidden',
        'isInitiativeCtrlMaskHidden',
        'isPubCheckProblemBtnHidden',
        'isProblemPublished',


        'msgMaskTpl',
        'toastCtrlMaskTpl',
        'initiativeCtrlMaskTpl'
      ])
	  },
	  components: {
	    Toolbar,
	    Guide,
	    GuideDelay,
	    Errormsg,
	    Reconnect,
	    Deprive,
	    Qrcode,
	    Thumbnail,
	    Activity
	  },
	  created () {
	    this.init()
	  },
	  beforeDestroy () {
	  	clearInterval(pollingPresentationTagTimer)
	    clearInterval(pollingTougaoTimer)
	  },
	  mounted () {
	    let self = this

	    self.pmos()

	    // 根据localStorage判断是否显示新手引导
	    if (localStorage.getItem('hasGuided') !== 'yes') {
	      self.isGuideHidden = false
	    }
	    self.polyfillIncludes()
	    self.importPhotoswipe()
	  },
	  mixins: [switches, socketService, problemRelated],
	  methods: {
	  	/**
	     * 复用页面，需要watch route
	     *
	     */
	    init () {
	    	
		  	let self = this

		    let lessonid = +self.$route.params.lessonid
		    window.LESSONID = lessonid


		    // 换课的话，要清掉持久化的旧 store
		    if (lessonid !== self.lessonid) {
		    	self.$store.dispatch('reset')
		    }

		    self.$store.commit('set_lessonid', lessonid)
		    // self.$store.commit('set_isGuideDelayHidden', false)
		    self.$store.commit('set_stepGuideDelay', 0)

		    // 获取本地不懂、投稿已读数
		    oldDoubt = +(localStorage.getItem('oldDoubt'+self.lessonid) || 0)

		    self.fetchUserInfo()
		    		.then(self.initws)

		    self.pollingPresentationTag()

		    configWX()
		    wx.ready(() => {
		      wx.hideMenuItems({
		        menuList: [
		          'menuItem:share:appMessage', 'menuItem:share:timeline',
		          'menuItem:share:qq', 'menuItem:share:weiboApp',
		          'menuItem:favorite', 'menuItem:share:QZone']
		      });
		    });

		    self.setSentry()

		    import('@/util/ga').then(gaue => {
		    	window.gaue = gaue;
		      gaue.default.registerEl();
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
	     * 阻止微信露底
	     *
	     */
	    pmos () {
	      let self = this

	      // list中都是ID
	      new PreventMoveOverScroll({
	        list: ['rc-home', 'templates']
	      }, function (opAction) {
	        let op = ''
	        if (opAction.isTap) {
	          op = 'next'
	        } else if (!opAction.isUpAndDown && !opAction.isTooShort) {
	          op = opAction.isSwipeDown ? 'prev' : 'next'
	        }

	        self.sendSlideOp (op)
	      })
	    },
	    /**
	     * 发送前进后退的指令
	     *
	     * @param {string, number} op 'next' || 'prev'  to: 缩略图时的页码， undefined时则不发送
	     */
	    sendSlideOp (op, to) {
	      let self = this
	      let str = JSON.stringify({
	        'op': op,
	        'lessonid': self.lessonid,
	        'presentation': self.presentationid,
	        'msgid': 1234,
	        'to': to
	      })

	      self.socket.send(str)
	    },
	    /**
	     * 发送视频播放暂停的指令
	     *
	     * @param {number, number} sid: SlideId  pptshapeid: pptshapeid
	     */
	    videoControl (sid, pptshapeid) {
	      let self = this
	      console.log(900, self.lessonid, self.presentationid, sid, pptshapeid)
	      let str = JSON.stringify({
	        'op': 'videocontrol',
	        'lessonid': self.lessonid,
	        'pres': self.presentationid,
	        'status': 'change',
	        sid,
	        pptshapeid,
	      })

	      self.socket.send(str)
	    },
	    /**
	     * 获取用户数据
	     *
	     */
	    fetchUserInfo () {
	      let self = this
	      let url = API.userinfo

	      return request.get(url,{'lesson_id': self.lessonid})
	        .then(jsonData => {
	        	window.USERID = jsonData.data.user.user_id
	        	self.$store.dispatch('saveUserInfo', jsonData.data)
	        })
	        .catch(() => {
	        	console.error('获取用户信息失败')
	        })
	    },
	    /**
	     * 获取ppt数据
	     *
	     */
	    fetchPPTData () {
	      let self = this
	      let url = API.fetch_presentation_data

	      // 切换路由后，presentationcreated 触发的去设置 presentationid，
	      // 在这不会立即反映到 self.presentationid 上，所以干脆这里直接使用 store 上的值
	      if (process.env.NODE_ENV === 'production') {
	        url = API.fetch_presentation_data + '/' + self.$store.state.presentationid + '/'
	      }

	      request.get(url)
	        .then(jsonData => {
	          let pptData = jsonData.presentationData.Slides
	          let current = self.current
	          let isProblem = (typeof pptData[current - 1].Problem) !== 'undefined'
	          // let isProblemPublished = self.unlockedproblem.includes(current)// 也是从1开始的页码

	          let isProblemPublished

	          if (self.isPPTVersionAboveOne && isProblem) {
	            isProblemPublished = self.unlockedproblem.includes(pptData[current - 1].lessonSlideID)
	          } else {
	            isProblemPublished = self.unlockedproblem.includes(current)// 也是从1开始的页码，但是unlockedproblem是从0开始的
	          }

	          // fetchPPTData的主要目的是获取pptData total
	          // 后2个是因为一开始打开遥控器是没有pptData数据，在hello中并不能判断当前页有没有试题
	          self.$store.commit('set_pptData', pptData)
	          self.$store.commit('set_total', pptData.length)
	          self.$store.commit('set_isPubCheckProblemBtnHidden', !isProblem)
	          self.$store.commit('set_isProblemPublished', isProblemPublished)

	          self.$store.commit('set_isEnterEnded', true)
	          self.initCardHeight()
	          self.filterSlideid(pptData)
	          self.cardWidth = jsonData.presentationData.Width
	          self.cardHeight = jsonData.presentationData.Height
	        })
	    },
	    /**
	     * 处理slideid 和 slideindex 的对应关系
	     *
	     * @param {Object} pptData
	     */
	    filterSlideid (pptData) {
	      let self = this

	      let idIndexMap = {}
	      
	      pptData.forEach((item, index) => {
	        // idIndexMap[item.lessonSlideID] = item.Index
	        idIndexMap[item.lessonSlideID] = index + 1
	      })

	      self.setData({
	        idIndexMap
	      })
	    },
	    /**
	     * 初始化主页面当前页高度，防止竖版课件导致 toolbar 无法显示
	     *
	     * 如果ppt是普通的 4:3 或 16:9 (扁) 的话，就正常地上半截正常显示，下半截截取一部分
	     * 如果ppt为竖版，则显示上面的ppt（两边留黑），第二页的显示一截，下面不要盖住 toolbar
	     *
	     */
	    initCardHeight () {
	      let self = this
	      let _src = self.pptData[0].Cover
	      let _img = new Image()

	      _img.onload = function () {
	        let _w = _img.width
	        let _h = _img.height
	        self.isShuban = _h > _w
	      }

	      _img.src = _src
	    },
	    /**
	     * 点开缩略图按钮
	     *
	     */
	    showThumbnail () {
	      let self = this

	      self.$store.commit('set_initiativeCtrlMaskTpl', 'Thumbnail')
	      self.$store.commit('set_isInitiativeCtrlMaskHidden', false)

	      self.$refs.Toolbar.$emit('hideToolbarMore')

	      Vue.nextTick(function () {
	        self.$refs.InitiativeCtrlMask.$emit('Thumbnail')
	      })
	    },
	    /**
	     * 点开 课堂动态 按钮
	     *
	     */
	    showActivity () {
	      let self = this

	      self.$store.commit('set_initiativeCtrlMaskTpl', 'Activity')
	      self.$store.commit('set_isInitiativeCtrlMaskHidden', false)

	      Vue.nextTick(function () {
	        self.$refs.InitiativeCtrlMask && self.$refs.InitiativeCtrlMask.$emit('Activity')
	      })
	    },
	    /**
	     * 点击 遥控器 按钮
	     * 一般是用于主动关闭缩略图蒙版
	     *
	     */
	    goHome () {
	      let self = this

	      self.$store.commit('set_isInitiativeCtrlMaskHidden', true)
	      self.$store.commit('set_initiativeCtrlMaskTpl', '')
	    },
	    /**
	     * 轮询获取缩略图页 不懂 等标志的信息
	     * 在 WebSocket 收到 hello 指令得到 presentationid 后再开始轮询
	     *
	     */
	    pollingPresentationTag () {
	      let self = this

	      clearInterval(pollingPresentationTagTimer)
	      clearInterval(pollingTougaoTimer)

	      pollingPresentationTagTimer = setInterval(self.fetchPresentationTag, 10*1000)
	      pollingTougaoTimer = setInterval(self.fetchTougaoUnreadnum, 10*1000)
	    },
	    /**
	     * 获取缩略图页 不懂 的信息
	     *
	     */
	    fetchPresentationTag () {
	      let self = this
	      if (self.presentationid <= 0) {return;}

	      let url = API.presentation_tag
	      if (process.env.NODE_ENV === 'production') {
	        url = API.presentation_tag + '/' + self.presentationid + '/'
	      }

	      request.get(url)
	        .then(jsonData => {
	          let doubt = jsonData.data.doubt
	          doubtTotalSum = 0

	          doubt.forEach(item => {
	            doubtTotalSum += item
	          })

	          // 学生能取消不懂的，有可能减成负数
	          if (doubtTotalSum < oldDoubt) {
	            oldDoubt = doubtTotalSum
	          }

	          self.$store.commit('set_newdoubt', doubtTotalSum - oldDoubt)
	          // 和小程序不同， doubtSorted doubtList 在 thumbnail.vue中
	        })
	    },
	    /**
	     * 获取投稿未读数 的信息
	     *
	     */
	    fetchTougaoUnreadnum () {
	      let self = this
	      if (self.lessonid <= 0) {return;}

	      let url = API.submission_unread_num + '?lesson_id=' + self.lessonid

	      request.get(url).then(jsonData => {
          self.$store.commit('set_newtougao', jsonData.data.unread_num)
        })
	    },
	    /**
	     * 用户缩略图点击了 不懂 按钮，清零不懂数
	     *
	     */
	    checkDoubt () {
	      let self = this
	      oldDoubt = doubtTotalSum || oldDoubt // 有可能刚进页面还不到10秒就点击了查看缩略图，这时 doubtTotalSum 为0，而 oldDoubt 从storage取出来并不是0
	      localStorage.setItem('oldDoubt'+self.lessonid, oldDoubt)
	      self.$store.commit('set_newdoubt', 0)
	    },
	    /**
	     * 加载图片放大库代码
	     *
	     */
	    importPhotoswipe () {
	      let self = this

	      Promise.all([
	      	import('photoswipe'),
	      	import('photoswipe/dist/photoswipe-ui-default'),
	      	import('photoswipe/dist/photoswipe.css')
	      ]).then(([PhotoSwipe, PhotoSwipeUI_Default]) => {
	      	window.PhotoSwipe = PhotoSwipe;
	      	window.PhotoSwipeUI_Default = PhotoSwipeUI_Default;
	      })
	    },
	    /**
	     * 用户在新手引导页点击了
	     *
	     * @param {number} step 当前处于什么引导步骤
	     */
	    guideNext (step) {
	      let self = this
	      switch (step) {
	        case 1:
	          self.showActivity()
	          break;
	        case 2:
	          self.goHome()
	          self.isGuideHidden = true
	          localStorage.setItem('hasGuided', 'yes')
	          break;
	        case 3:
	          self.isGuideHidden = true
	          localStorage.setItem('hasGuided', 'yes')
	      }
	    },
	    /**
	     * 用户在延时引导页点击了
	     *
	     * @param {number} step 当前处于什么引导步骤
	     */
	    guideDelayNext (step) {
	      let self = this

	      step === 1 && self.problemHandler()
	    },
	    /*
	     * @method sentry ga 配置
	     */
	    setSentry() {
	      if(typeof Raven !== 'undefined') {
	        Raven.config('http://206997a397544b479583a315450260e5@rain-sentry.xuetangx.com/6').install();
	        Raven.setUserContext({ userid: this.userid });
	      } else {
	        setTimeout(() => {
	          Raven.config('http://206997a397544b479583a315450260e5@rain-sentry.xuetangx.com/6').install();
	          Raven.setUserContext({ userid: this.userid });
	        }, 1500)
	      }

	      typeof ga === 'function' && ga('set', 'userId', this.userid);
	    },
	    /*
	     * @method polyfill数组的 includes 方法
	     */
	    polyfillIncludes() {
	      // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/includes
	      if (!Array.prototype.includes) {
	        Object.defineProperty(Array.prototype, 'includes', {
	          value: function(searchElement, fromIndex) {

	            // 1. Let O be ? ToObject(this value).
	            if (this == null) {
	              throw new TypeError('"this" is null or not defined');
	            }

	            var o = Object(this);

	            // 2. Let len be ? ToLength(? Get(O, "length")).
	            var len = o.length >>> 0;

	            // 3. If len is 0, return false.
	            if (len === 0) {
	              return false;
	            }

	            // 4. Let n be ? ToInteger(fromIndex).
	            //    (If fromIndex is undefined, this step produces the value 0.)
	            var n = fromIndex | 0;

	            // 5. If n ≥ 0, then
	            //  a. Let k be n.
	            // 6. Else n < 0,
	            //  a. Let k be len + n.
	            //  b. If k < 0, let k be 0.
	            var k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);

	            function sameValueZero(x, y) {
	              return x === y || (typeof x === 'number' && typeof y === 'number' && isNaN(x) && isNaN(y));
	            }

	            // 7. Repeat, while k < len
	            while (k < len) {
	              // a. Let elementK be the result of ? Get(O, ! ToString(k)).
	              // b. If SameValueZero(searchElement, elementK) is true, return true.
	              // c. Increase k by 1.
	              if (sameValueZero(o[k], searchElement)) {
	                return true;
	              }
	              k++;
	            }

	            // 8. Return false
	            return false;
	          }
	        });
	      }
	    },
	  }
	}
</script>

<style lang="scss">
  @import "~@/style/_variables";
  @import "~@/style/_mixin";
  @include button;

  .root {position: relative; height: 100%;}
  .rc-home  {
    position: relative;
    display: flex;
    display: -webkit-flex;
    height: 100%;
    flex-direction: column;
    -webkit-flex-direction: column;
    justify-content: space-between;
    background: #000000;
    color: $white;
    font-size: 25px;
    /*卡片单元*/
    .card-box {
      // height: 6.853333rem;


      .detail {
        display: flex;
        justify-content: space-between;
        align-items: center;
        height: 0.906667rem;
        margin-bottom: 0.266667rem;
        padding-left: 0.56rem;

        .ct {
          margin-left: 0.693333rem;
        }
        .pubpblm_or_check_answer {
          margin-right: 0.453333rem;
          width: 2.4rem;
        }
      }

    }
    .upper {
      padding-top: 0.266667rem;

      .img-wrapper {
      	position: relative;

      	.video-btn {
      		position: absolute;
      		left: 1.333333rem;
      		top: 1.333333rem;
      		width: 1.333333rem;
      		height: 1.333333rem;
      		background: #000000;

      		&:after {
      			position: absolute;
      			content: "";
      			left: 50%;
      			top: 50%;
      			width: 0.8rem;
      			height: 0.8rem;
      			background: url(~images/teacher/play_pause.png);
      			background-size: 100%;
      			transform: translate(-50%, -50%);
      		}
      	}
      }
    }
    .downer {
      opacity: 0.8;
      overflow: hidden;
    }
    .card {
      width: 100%;
      // max-height: 5.666667rem;
    }
    .img-error {
      display: block;
      margin: 1.5rem auto 0;
      width: 2.0rem;
    }
    .downer .img-error {
      margin-top: 0.5rem;
    }
  }
  // 竖版的覆盖样式
  .shuban {
    .card-box {
      text-align: center;
    }
    .card {
      height: 10.666667rem;
      width: auto;
    }
  }

  .templates {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
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

  /* mint-ui 加载更多文案提示 */
  .mint-loadmore-bottom {
    text-align: center;
  }
  .allLoaded .mint-loadmore-bottom {
    display: none;
  }
</style>

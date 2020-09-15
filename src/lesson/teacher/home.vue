<!-- 教师遥控器根组件 -->
<template>
  <div class="root J_page J_tip">
		<slot name="ykt-msg"></slot>
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
        	<template v-if="pptData.length && pptData[current - 1].shapes && pptData[current - 1].shapes.length">
        		<v-touch class="dontcallback" :class="btnItem.URL.indexOf('rain://xtvideo') !== -1 ? 'video-btn' : 'audio-btn'" v-for="btnItem in pptData[current - 1].shapes" :key="btnItem.PPTShapeId" v-if="btnItem.PPTShapeType === 16" :style="{left: `calc(${btnItem.Left*100/cardWidth}% - 0.066667rem)`, top: `calc(${btnItem.Top*100/cardHeight}% - 0.133333rem)`, width: `calc(${btnItem.Width*100/cardWidth}% + 0.066667rem)`, height: `calc(${btnItem.Height*100/cardHeight}% + 0.133333rem)`, zIndex: btnItem.ZOrderPosition}" v-on:tap="videoControl(pptData[current - 1].id, btnItem.PPTShapeId)">
        			<div class="video-hint f12" v-if="btnItem.URL.indexOf('rain://xtvideo') !== -1"><!-- 点击 播放/暂停 视频 -->{{ $t('djbfztsp') }}</div>
        		</v-touch>
        	</template>

        	<img v-if="isUpImgError && isPPTVersionAboveOne && !isUploadSlideCrash" class="img-error" src="~images/teacher/img-uploading.png" />
        	<img v-if="isUpImgError && (!isPPTVersionAboveOne || isUploadSlideCrash)" class="img-error" src="~images/teacher/img-error.png" />
        	<img v-if="pptData.length && !pptData[current - 1].cover" class="img-error" :src="imgUploadingPath" />
        	<img v-if="pptData.length && pptData[current - 1].cover" class="card" :src="pptData[current - 1].cover" />
					<div class="note" v-if="pptData.length && pptData[current - 1].Note" v-show="pptData[current-1].Note" @touchend.self="showNote(pptData[current-1].Note)">{{$t('note')}}</div>
        </div>

      </div>
      <!-- 下一张幻灯片 -->
      <div id="downer" class="card-box downer" v-if="current < pptData.length">
        <div class="detail f14">{{ $t('nextslide') }}</div>
        <img v-if="isDownImgError && isPPTVersionAboveOne && !isUploadSlideCrash" class="img-error" src="~images/teacher/img-uploading.png" />
        <img v-if="isDownImgError && (!isPPTVersionAboveOne || isUploadSlideCrash)" class="img-error" src="~images/teacher/img-error.png" />
        <img v-if="pptData.length && !pptData[current].cover" class="img-error" :src="imgUploadingPath" />
        <img v-if="pptData.length && pptData[current].cover" class="card" :src="pptData[current].cover" />
      </div>
			<!-- 停服务通知 -->
    	<notice position="bottom" :style="{bottom: '1.706667rem'}"></notice>
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
    <div id="templates"
			v-show="!isInitiativeCtrlMaskHidden || !isToastCtrlMaskHidden || !isMsgMaskHidden"
				:class="['templates', 'dontcallback']"
			>
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
          :card-width="cardWidth"
          :card-height="cardHeight"
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
      <div class="rc-mask" v-show="!isMsgMaskHidden && errType !== 2">
        <component
          ref="MsgMask"
          :is="msgMaskTpl"
          :connect-count-down="connectCountDown"
          :is-connecting-hidden="isConnectingHidden"
          @triggerReconnect="triggerReconnect"
        ></component>
      </div>

			<endshow v-show="
				errType == 2
				&& toolbarIndex !== 2
				&& isToastCtrlMaskHidden
			"></endshow>
    </div>

    <!-- 新手引导页 -->
    <Guide
      v-show="isMsgMaskHidden && isToastCtrlMaskHidden && initiativeCtrlMaskTpl !== 'Qrcode' && !isGuideHidden"
      @guideNext="guideNext"
    ></Guide>

    <!-- 教师遥控器引导查看答案、续时 -->
    <!-- <GuideDelay
      v-show="isMsgMaskHidden && isToastCtrlMaskHidden && initiativeCtrlMaskTpl !== 'Qrcode' && isGuideHidden && !isGuideDelayHidden && isProblemPublished"
      @guideDelayNext="guideDelayNext"
    ></GuideDelay> -->
    <!-- 切换语言弹窗 -->
    <change_lang_dialog></change_lang_dialog>
		<div class="note-box" v-show="noteText">
			<div class="note-box-content">
				<div class="title">备注：</div>
				<div class="text">{{noteText}}</div>
				<div class="close">
					<i class="icon-ykq-shiti-guanbi iconfont" @touchend.self="showNote('')"></i>
				</div>
			</div>
		</div>
		<router-view class="subContainer"></router-view>
  </div>
</template>

<script>
	/* eslint-disable no-undef, no-new */

	import { mapGetters, mapActions} from 'vuex'

	import request from '@/util/request-v3'
	import {configWX} from '@/util/wx-util'
	import API from '@/util/api'

  // 子组件不需要引用直接使用
  window.request = request;
	if (process.env.NODE_ENV !== 'production') {
	  // request.post = request.get
	}

	// 页面组件
	// 工具栏
	import Toolbar from '@/lesson/teacher/common/toolbar'
	// 新手引导蒙版
	import Guide from '@/lesson/teacher/common/guide'
	// 教师遥控器引导查看答案、续时
	import GuideDelay from '@/lesson/teacher/common/guide-delay'
	// 错误蒙版
	import Errormsg from '@/lesson/teacher/common/errormsg'
	// 断网重连蒙版
	import Reconnect from '@/lesson/teacher/common/reconnect'
	// 夺权面板
	import Deprive from '@/lesson/teacher/common/deprive'
	// 二维码控制蒙版
	import Qrcode from '@/lesson/teacher/common/qrcode'
	// 缩略图面板
	import Thumbnail from '@/lesson/teacher/common/thumbnail'
	// 课堂动态面板
	import Activity from '@/lesson/teacher/common/activity'

	import change_lang_dialog from "@/lesson/common/change_lang_dialog.vue"

	import endshow from '@/lesson/teacher/common/endshow'

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
	      cardWidth: 750,												// 大json中的ppt原始宽度
				cardHeight: 540,												// 大json中的ppt原始高度
				noteText: "",
	    }
	  },
	  computed: {
	    isUpImgError () {
	      let self = this
	      let pptData = self.pptData
	      let current = self.current

	      return pptData[current - 1] && (pptData[current - 1].cover == 'rain://error/upload-error' || pptData[current - 1].cover == 'rain://error/export-error')
	    },
	    isDownImgError () {
	      let self = this
	      let pptData = self.pptData
	      let current = self.current

	      return pptData[current] && (pptData[current].cover == 'rain://error/upload-error' || pptData[current].cover == 'rain://error/export-error')
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
				'initiativeCtrlMaskTpl',
				'toolbarIndex',

				'isCloneClass'
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
	    Activity,
	    change_lang_dialog,
			notice: () => import('@/components/common/service-notice.vue'),
			endshow
	  },
	  created () {
	    this.init()
	  },
	  beforeDestroy () {
    clearInterval(pollingPresentationTagTimer)
    // clearInterval(pollingTougaoTimer)
	  },
	  mounted () {
	    let self = this
	    self.pmos()

	    // 根据localStorage判断是否显示新手引导
	    if (localStorage.getItem('hasGuided') !== 'yes') {
	    	// 新遥控器上线很久了，不再显示新遥控器引导了
	      // self.isGuideHidden = false
	    }
	    self.polyfillIncludes()
	    self.importPhotoswipe()
	  },
		mixins: [switches, socketService, problemRelated],
		watch: {
			'$route'(newVal){
				if(newVal.name !== 'teacher-v3'){
					clearInterval(pollingPresentationTagTimer)
				}else {
					this.pollingPresentationTag()
				}
			}
		},
	  methods: {
			...mapActions([
				'set_isCloneClass'
			]),
			showNote(text) {
				this.noteText = text
			},
	  	/**
	     * 复用页面，需要watch route
	     *
	     */
	    init () {
		  	let self = this

		    let lessonid = self.$route.params.lessonid
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
				self.initLesson()

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

				let goHomeFlag = localStorage.getItem('gohome')
				if(goHomeFlag){
					localStorage.removeItem('gohome')
					this.goHome()
				}
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
			 * 初始化课堂数据
			 * 
			 */
			async initLesson(){
				let joined = await this.checkIn();
				// TODO： 签到发现没有权限处理
				if(joined.code !== 0) {
					// 50004 lesson end
					if(joined.code === 50004) {
						console.log('下课了')
						return this;
					}
				}
				let studentRoles = [4, 5, 6]
				if(studentRoles.includes(joined.data.role)){
					location.href = `/student/v3/${this.$route.params.lessonid}`
				}
				let userInfo = await this.getUserInfo()

				let lessonInfo = await this.getLessonInfo();
				if(lessonInfo){
					let {basic, classroom, invitation} = lessonInfo
				
				let data = {
					classroom: {
						classroomid: basic.classroomId,
						count: classroom.count
					},
					course: {
						coursename: classroom.courseName,
						courseid: classroom.courseId
					},
					lesson: {
						is_lesson_end: basic.endTime > 0,
						user_role: joined.data.isTeacher ? 1 : 5,
						invite_code: invitation.inviteCode
					},
					user: {
						user_id: userInfo.id,
						avatar: userInfo.avatar,
						user_auth: joined.data.lessonToken
					}
				}

				this.$store.dispatch('saveUserInfo', data)
				}
			 	

				setTimeout(() => {
					this.initws()
				}, 20);
			},
			/** 
			 * 教师签到
			*/
			checkIn(){
				let self = this
				let URL = API.lesson.checkin
				let params = {
					lessonId: this.lessonid,
					source: 0
				}
				return request.post(URL,params)
				.then((res)=>{
					if(res && res.code === 0) {
						let data = res.data;
						self.token = data.lessonToken
					}

					return res;
				}).
				catch(error => {
					console.log('checkin:', error);
					return null;
				})
			},
			/** 
			 * 获取用户信息
			*/
			getUserInfo(){
				let URL = API.lesson.get_user
				return request.get(URL)
				.then((res) => {
					if(res && res.code === 0 && res.data){
						window.userid = window.USERID = res.data.id
						return res.data
					}
				}).catch(error => {
					console.log('UserInfo:' + error)
				})
			},
			/** 
			 * 获取授课信息
			*/
			getLessonInfo(){
				let URL = API.lesson.get_lesson_detail
				return request.get(URL)
				.then((res) => {
					if(res && res.code === 0 && res.data){
						let data = res.data
						return res.data
					}
				}).catch(error => {
					console.log('getLesson:', error);
				})
			},
	    /**
	     * 获取ppt数据
	     *
	     */
	    fetchPPTData () {
	      let self = this
				let url = API.lesson.get_presentation
				let params = {
					presentation_id: self.$store.state.presentationid
				}

	      // 切换路由后，presentationcreated 触发的去设置 presentationid，
	      // 在这不会立即反映到 self.presentationid 上，所以干脆这里直接使用 store 上的值
	      request.get(url,params)
	        .then((res) => {
						if(res && res.code === 0 && res.data){
							let jsonData = res.data
							let pptData = jsonData.slides
							let current = self.current
							let isProblem = (typeof pptData[current - 1].problem) !== 'undefined'
							// let isProblemPublished = self.unlockedproblem.includes(current)// 也是从1开始的页码

							let isProblemPublished

							if (self.isPPTVersionAboveOne && isProblem) {
								isProblemPublished = self.unlockedproblem.includes(pptData[current - 1].id)
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
							self.cardWidth = jsonData.width
							self.cardHeight = jsonData.height
						}
					}).catch(error => {
						console.log('fetchPPTData:' + error)
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
	        idIndexMap[item.id] = index + 1
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
	      let _src = self.pptData[0].cover
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
	      // clearInterval(pollingTougaoTimer)

	      pollingPresentationTagTimer = setInterval(self.fetchPresentationTag, 10*1000)
	      // pollingTougaoTimer = setInterval(self.fetchTougaoUnreadnum, 10*1000)
        // 进来请求一次 不轮询等ws通知
        setTimeout(self.fetchTougaoUnreadnum, 5*1000)
	    },
	    /**
	     * 获取缩略图页 不懂 的信息
	     *
	     */
	    fetchPresentationTag () {
	      let self = this
				if (self.presentationid <= 0) {return;}
				
				let URL = API.lesson.get_presentation_tag
				let params = {
					presentation_id: self.presentationid
				}
				
				return request.get(URL, params)
				.then((res) => {
					if(res && res.code === 0 && res.data){
						let doubt = res.data.doubtCountList
						doubtTotalSum = 0
						let doubtBoard = res.data.doubtFileSharingCount

						doubt.forEach(item => {
							doubtTotalSum += item
						})

						// 加上不懂的数据
						if(doubtBoard) {
							doubtTotalSum += doubtBoard
						}

						// 学生能取消不懂的，有可能减成负数
						if (doubtTotalSum < oldDoubt) {
							oldDoubt = doubtTotalSum
						}

						self.$store.commit('set_newdoubt', doubtTotalSum - oldDoubt)
					}
				}).catch(error => {

				})
	    },
	    /**
	     * 获取投稿未读数 的信息
	     *
	     */
	    fetchTougaoUnreadnum () {
	      let self = this
	      if (self.lessonid <= 0) {return;}

	      let url = API.lesson.get_unread

				request.get(url)
				.then((res) => {
					if(res && res.code === 0 && res.data){
						self.$store.commit('set_newtougao', res.data.unreadNum)
					}
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
	        Raven.config('https://9f7d1b452e5a4457810f66486e6338c0@rain-sentry.xuetangx.com/12').install();
	        Raven.setUserContext({ userid: this.userid });
	      } else {
	        setTimeout(() => {
	          Raven.config('https://9f7d1b452e5a4457810f66486e6338c0@rain-sentry.xuetangx.com/12').install();
	          Raven.setUserContext({ userid: this.userid });
	        }, 1500)
	      }
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
	@import "~@/style/common";
  @import "~@/style/_mixin";
  @include button;

	.root {position: relative; height: 100%;}
	.note-box{
		position: fixed;
		z-index: 10000;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-color: rgba(0, 0, 0, .7);
		&-content{
			width: px2rem(600px);
			height: px2rem(960px);
			padding: px2rem(30px);
			border-radius: px2rem(12px);
			background-color: #fff;
			color: #333;
			top: 50%;
			position: absolute;
			left: 50%;
			transform: translate(-50%, -50%);
			.title{
				height: px2rem(56px);
				line-height: px2rem(56px);
				margin: px2rem(10px) 0;
				font-size: px2rem(34px);
			}
			.text{
				font-size: px2rem(34px);
				line-height: px2rem(40px);
				height: px2rem(800px);
				overflow-y: auto;
				-webkit-overflow-scrolling: touch;
			}
		}
		.close{
			position: absolute;
			height: px2rem(80px);
			line-height: px2rem(80px);
			text-align: center;
			width: px2rem(80px);
			font-size: px2rem(80px);
			bottom: -1.1rem;
			left: 50%;
			transform: translateX(-50%);
			i{
				color: #fff;
				font-size: px2rem(80px);
			}
		}
	}
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

      	.video-btn, .audio-btn {
      		position: absolute;
      		left: 1.333333rem;
      		top: 1.333333rem;
      		width: 1.333333rem;
      		height: 1.333333rem;
      		background: rgba(0,0,0,.2);

      		&:after {
      			position: absolute;
      			content: "";
      			left: 50%;
      			top: 50%;
      			width: 0.8rem;
      			height: 0.8rem;
      			background-image: url(~images/teacher/play_pause.png);
      			background-size: 100%;
      			transform: translate(-50%, -50%);
      		}

      		&:active {
      			border-color: #639EF4;
  					box-shadow: 0 0 0.4rem 0.133333rem rgba(99,158,244,0.8) inset;
      		}

      		.video-hint {
      			position: absolute;
      			left: 0;
      			width: 100%;
      			bottom: 0.4rem;
      			text-align: center;
      		}
				}
				.audio-btn {
					background: #fff;
					&:after {
						background-image: url(~images/teacher/play_pause_black.png);
					}
				}
				.note{
					position: absolute;
					background-color: #639ef4;
					border-radius: px2rem(35px) 0 0 px2rem(35px);
					height: px2rem(70px);
					line-height: px2rem(70px);
					text-align: center;
					color: #fff;
					font-size: px2rem(28px);
					top: 50%;
					right: -1px;
					transform: translateY(-50%);
					border: 1px solid #639ef4;
					padding: 0 px2rem(10px);
					z-index: 11;
				}
      }
    }
    .downer {
      opacity: 0.8;
      overflow: hidden;
    }
    .card {
      width: 100%;
			background-color: #F6F7F8;
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
    z-index: 101;
  }
	.templates-endshow{
		bottom: px2rem(128px);
	}

  .rc-mask {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background: rgba(0,0,0,0.9);
    overflow: auto;
		z-index: 101;

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
	.subContainer {
		position: absolute !important;
		width: 100%;
		top: 0;
		left: 0;
		z-index: 102 !important;
	}
</style>

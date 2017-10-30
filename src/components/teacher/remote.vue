<!-- 教师遥控器根组件 -->
<template>
  <div class="root J_page J_tip">
    <div id="rc-home" :class="['rc-home',{'shuban': isShuban}]" v-show="isEnterEnded">
      <!-- 当前幻灯片 -->
      <div id="upper" class="card-box upper">
        <div class="detail f14 dontcallback">
          <div>
            当前幻灯片<span class="ct f18">{{current}}/{{total}}</span>
          </div>
          <v-touch v-show="!isPubCheckProblemBtnHidden" class="btn pubpblm_or_check_answer" v-on:tap="problemHandler">
            {{isProblemPublished ? '查看答案' : '发送此题'}}
          </v-touch>
        </div>
        <img v-if="isUpImgError" class="img-error" src="~images/teacher/img-error.png" />
        <img v-if="pptData.length" class="card" :src="pptData[current - 1].Cover" />
      </div>
      <!-- 下一张幻灯片 -->
      <div id="downer" class="card-box downer" v-if="current < pptData.length">
        <div class="detail f14">下一张幻灯片</div>
        <img v-if="isDownImgError" class="img-error" src="~images/teacher/img-error.png" />
        <img v-if="pptData.length" class="card" :src="pptData[current].Cover" />
      </div>
      <!-- 工具栏 -->
      <!-- 当蒙版是缩略图时，底部的工具栏要露出来 -->
      <Toolbar
        ref="Toolbar"
        :lessonid="lessonid"
        :presentationid="presentationid"
        :socket="socket"
        :newdoubt="newdoubt"
        :newtougao="newtougao"
        :active-index="0"
        :is-socket-connected="isSocketConnected"
        @showThumbnail="showThumbnail"
        @showActivity="showActivity"
        @goHome="goHome"
      ></Toolbar>
    </div>

    <!-- 蒙版层 -->
    <!-- 当蒙版是缩略图、课堂动态时，底部的工具栏要露出来 -->
    <div id="templates" v-show="!isInitiativeCtrlMaskHidden || !isToastCtrlMaskHidden || !isMsgMaskHidden" :class="['templates', 'dontcallback']">
      <!-- 遥控器遮罩层（用户主动弹出控制类）：缩略图，二维码控制，发试题选时间，试题柱状图，试题详情，第三优先级 -->
      <div class="rc-mask" v-show="!isInitiativeCtrlMaskHidden">
        <component
          ref="InitiativeCtrlMask"
          :is="initiativeCtrlMaskTpl"
          :lessonid="lessonid"
          :avatar="avatar"
          :coursename="coursename"
          :presentationid="presentationid"
          :ppt-data="pptData"
          :current="current"
          :total="total"
          :socket="socket"
          :invite-code="inviteCode"
          :is-brand-new-ppt="isBrandNewPpt"
          :qrcode-status="qrcodeStatus"
          :is-danmu-open="isDanmuOpen"
          :posting-danmuid="postingDanmuid"
          :posting-submissionid="postingSubmissionid"
          :posting-submission-sent="postingSubmissionSent"
          :posting-subjectiveid="postingSubjectiveid"
          :newdoubt="newdoubt"
          :newtougao="newtougao"
          :is-rc-mask-activity-at-root.sync="isRcMaskActivityAtRoot"
          :is-socket-connected="isSocketConnected"
          @goHome="goHome"
          @showThumbnail="showThumbnail"
          @showActivity="showActivity"
          @cancelPublishProblem="cancelPublishProblem"
          @chooseProblemDuration="unlockProblem"
          @checkDoubt="checkDoubt"
          @checkTougao="checkTougao"

          :problem-type="problemType"
          :problem-result-data="problemResultData"
          :problem-duration-left="problemDurationLeft"
          @closeProblemresult="closeProblemresult"
          @closeProblemSubjective="closeProblemSubjective"
          @connectLittleBankSuccess="connectLittleBankSuccess"
        ></component>
      </div>

      <!-- 遥控器遮罩层（被动弹出控制类，可关闭）：夺权面板，第二优先级 -->
      <div class="rc-mask" v-show="!isToastCtrlMaskHidden">
        <component
          ref="ToastCtrlMask"
          :is="toastCtrlMaskTpl"
          :lessonid="lessonid"
          :courseid="courseid"
          :classroomid="classroomid"
          :socket="socket"
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
          :lessonid="lessonid"
          :courseid="courseid"
          :classroomid="classroomid"
          :err-type="errType"
          :connect-count-down="connectCountDown"
          :is-connecting-hidden="isConnectingHidden"
          @triggerReconnect="triggerReconnect"
        ></component>
      </div>
    </div>

    <!-- 新手引导页 -->
    <Guide
      v-show="isMsgMaskHidden && isToastCtrlMaskHidden && initiativeCtrlMaskTpl !== 'RcMaskQrcode' && !isGuideHidden"
      @guideNext="guideNext"
    ></Guide>

  </div>
</template>

<script>
/* eslint-disable no-undef, no-new */

import request from '@/util/request'
import {configWX} from '@/util/wx-util'
import API from '@/config/api'

if (process.env.NODE_ENV !== 'production') {
  request.post = request.get
}

// 页面组件
// 工具栏
import Toolbar from '@/components/teacher/template/toolbar'
// 新手引导蒙版
import Guide from '@/components/teacher/template/guide'
// 错误蒙版
import RcMaskErrormsg from '@/components/teacher/template/rc-mask-errormsg'
// 断网重连蒙版
import RcMaskReconnect from '@/components/teacher/template/rc-mask-reconnect'
// 夺权面板
import RcMaskDeprive from '@/components/teacher/template/rc-mask-deprive'
// 二维码控制蒙版
import RcMaskQrcode from '@/components/teacher/template/rc-mask-qrcode'
// 随机点名面板
import RcMaskRandomcall from '@/components/teacher/template/rc-mask-randomcall'
// 缩略图面板
import RcMaskThumbnail from '@/components/teacher/template/rc-mask-thumbnail'
// 课堂动态面板
import RcMaskActivity from '@/components/teacher/template/rc-mask-activity'

// 没有输出，而是给全局window加了函数 PreventMoveOverScroll
import '@/util/teacher-util/preventoverscroll'

// js功能模块，放到 mixins 中
// 一些开关
import switches from '@/util/teacher-util/switches'
// Websocket 服务
import socketService from '@/util/teacher-util/socket-service'
// 课堂试题相关
import problemRelated from '@/util/teacher-util/problem-related'

let pollingPresentationTagTimer = null // 轮询获取缩略图页 不懂 等标志的信息
let pollingTougaoTimer = null          // 轮询获取投稿数的信息
let oldDoubt = 0                       // 记录不懂人次，便于教师点击过后清零
let oldTougao = 0                      // 记录投稿人次，便于教师点击过后清零
let doubtTotalSum = 0                  // 不懂总数
let tougaoTotalSum = 0                 // 投稿总数

export default {
  name: 'Remote',
  // 找不到的data在 mixins 中
  data () {
    return {
      isShuban: false,                        // 是竖版ppt
      isGuideHidden: true,                    // 新手引导隐藏
      isEnterEnded: false,                    // 遥控器进入是否结束
      userid: -1,                             // 用户id
      avatar: '',                             // 用户头像
      auth: '',                               // 用户身份
      inviteCode: '',                         // 课堂暗号
      courseid: '',                           // 课程id 以 八>了 班为例，是 八 的id
      classroomid: '',                        // 班级id 以 八>了 班为例，是 了 的id
      coursename: '',                         // 课程名称 以 八>了 班为例，是 八
      socket: null,                           // 全局 Websocket 实例对象
      lessonid: 0,
      presentationid: 0,
      isBrandNewPpt: true,                    // 是否是全新的ppt，主要用来控制二维码控制页“开始上课”、“继续上课”按钮文案。新上课或presentationcreated都为true。
      isMsgMaskHidden: false,                 // 蒙版隐藏，错误信息类
      isToastCtrlMaskHidden: true,            // 蒙版隐藏，被动弹出控制类，如夺权
      isInitiativeCtrlMaskHidden: true,       // 蒙版隐藏，用户主动弹出控制类，缩略图，二维码，试卷，发题，红包
      isSocketConnected: false,               // WebSocket 已连接
      total: '',                              // 总页数
      current: 1,                             // 当前页码，从1开始
      pptData: [],                            // ppt数据
      isRobber: false,                        // 是夺权者
      isRobbing: false,                       // 正在夺权
      byself: false,                          // 是自己夺权
      startPoint: [0, 0],
      msgMaskTpl: 'RcMaskErrormsg',
      toastCtrlMaskTpl: '',
      initiativeCtrlMaskTpl: '',
      errType: 5,
      connectCountDown: 10,
      isConnectingHidden: true,               // 连接中隐藏
      qrcodeStatus: 1,                        // 二维码大小状态：1 和 2 分别为 小 和 大
      isDanmuOpen: false,                     // 弹幕是否处于打开状态
      postingDanmuid: -1,                     // 正在投屏的弹幕的id
      postingSubmissionid: -1,                // 正在投屏的投稿的id
      postingSubmissionSent: false,           // 正在投屏的投稿已经发送全班
      postingSubjectiveid: -1,                // 正在投屏的主观题的id
      newdoubt: 0,                            // 未查看的不懂人次总数
      newtougao: 0,                           // 未查看的投稿人次总数
      isRcMaskActivityAtRoot: true,           // 课堂动态页是否在根部
      idIndexMap: {},                         // slideid 和 slideindex 的对应关系
    }
  },
  computed: {
    // 判断在 InitiativeCtrlMask 蒙版时是否显示工具栏部分
    isYieldToolbar: function () {
      let self = this

      // 当前蒙版是缩略图或课堂动态根组件时，显示工具栏（课堂动态子页面不显示工具栏）
      let status = (self.msgMaskTpl !== 'rc-mask-reconnect') && self.initiativeCtrlMaskTpl === 'RcMaskThumbnail' || (self.initiativeCtrlMaskTpl === 'RcMaskActivity' && self.isRcMaskActivityAtRoot)

      return status
    },
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
    }
  },
  components: {
    Toolbar,
    Guide,
    RcMaskErrormsg,
    RcMaskReconnect,
    RcMaskDeprive,
    RcMaskQrcode,
    RcMaskRandomcall,
    RcMaskThumbnail,
    RcMaskActivity
  },
  created () {
    let self = this

    self.lessonid = self.$route.params.lessonid
    // 保存本地不懂、投稿已读数
    oldDoubt = localStorage.getItem('oldDoubt'+self.lessonid) || 0
    oldDoubt -= 0
    oldTougao = localStorage.getItem('oldTougao'+self.lessonid) || 0
    oldTougao -= 0
    // 有可能刚进页面还不到10秒就点击了查看投稿，这时 tougaoTotalSum 为0，而 oldTougao 从storage取出来并不是0
    tougaoTotalSum = oldTougao

    // 保存本地正在投屏的弹幕、投稿id、主观题id
    self.postingDanmuid = localStorage.getItem('postingDanmuid'+self.lessonid) || -1
    self.postingDanmuid -= 0

    self.postingSubmissionid = localStorage.getItem('postingSubmissionid'+self.lessonid) || -1
    self.postingSubmissionid -= 0

    let tempSentStatus = localStorage.getItem('postingSubmissionSent'+self.lessonid)
    self.postingSubmissionSent = tempSentStatus === 'true'


    self.postingSubjectiveid = localStorage.getItem('postingSubjectiveid'+self.lessonid) || -1
    self.postingSubjectiveid -= 0

    self.polyfillIncludes()

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

    setTimeout(()=>{
        require(['@/util/ga'], function(gaue){
          window.gaue = gaue;
          gaue.default.registerEl();
        })
    }, 500)
  },
  mounted () {
    let self = this

    self.pmos()
    self.fetchUserInfo().then(self.initws)
    self.pollingPresentationTag()

    // 根据localStorage判断是否显示新手引导
    if (localStorage.getItem('hasGuided') !== 'yes') {
      self.isGuideHidden = false
    }
  },
  mixins: [switches, socketService, problemRelated],
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
     * 获取用户数据
     *
     */
    fetchUserInfo () {
      let self = this
      let url = API.userinfo

      return request.get(url,{'lesson_id': self.lessonid})
        .then(jsonData => {
          self.setData({
            userid: jsonData.data.user.user_id,
            avatar: jsonData.data.user.avatar,
            auth: jsonData.data.user.user_auth,
            inviteCode: jsonData.data.lesson.invite_code,
            courseid: jsonData.data.course.courseid,
            coursename: jsonData.data.course.coursename,
            classroomid: jsonData.data.classroom.classroomid
          })

          window.USERID = jsonData.data.user.user_id
        })
    },
    /**
     * 获取ppt数据
     *
     */
    fetchPPTData () {
      let self = this
      let url = API.fetch_presentation_data

      if (process.env.NODE_ENV === 'production') {
        url = API.fetch_presentation_data + '/' + this.presentationid + '/'
      }

      request.get(url)
        .then(jsonData => {
          let pptData = jsonData.presentationData.Slides
          let current = self.current
          let isProblem = (typeof pptData[current - 1].Problem) !== 'undefined'
          let isProblemPublished = self.unlockedproblem.includes(current)// 也是从1开始的页码

          // fetchPPTData的主要目的是获取pptData total
          // 后2个是因为一开始打开遥控器是没有pptData数据，在hello中并不能判断当前页有没有试题
          self.setData({
            pptData: pptData,
            total: pptData.length,
            isPubCheckProblemBtnHidden: !isProblem,
            isProblemPublished: isProblemPublished
          })

          self.isEnterEnded = true
          self.initCardHeight()
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
      
      pptData.forEach(item => {
        idIndexMap[item.lessonSlideID] = item.Index
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
     * 将秒数转换成 MM:SS 格式
     *
     * @param {number} sec 秒数
     */
    sec2str (sec) {
      if(sec == 0){
          return '时间到';
      }

      var str = '';
      var fen = Math.floor(sec/60);
      var miao = sec%60;//
      miao = (miao<10) ? ('0'+miao) : miao;

      str += fen + ':' + miao;
      return str;
    },
    /**
     * 点开缩略图按钮
     *
     */
    showThumbnail () {
      let self = this

      self.setData({
        isInitiativeCtrlMaskHidden: false,
        initiativeCtrlMaskTpl: 'RcMaskThumbnail'
      })

      self.$refs.Toolbar.$emit('hideToolbarMore')

      Vue.nextTick(function () {
        self.$refs.InitiativeCtrlMask.$emit('RcMaskThumbnail')
      })
    },
    /**
     * 点开 课堂动态 按钮
     *
     */
    showActivity () {
      let self = this

      self.setData({
        isInitiativeCtrlMaskHidden: false,
        initiativeCtrlMaskTpl: 'RcMaskActivity'
      })

      self.$refs.Toolbar.$emit('hideToolbarMore')

      Vue.nextTick(function () {
        self.$refs.InitiativeCtrlMask.$emit('RcMaskActivity')
      })
    },
    /**
     * 点击 遥控器 按钮
     * 一般是用于主动关闭缩略图蒙版
     *
     */
    goHome () {
      let self = this

      self.setData({
        isInitiativeCtrlMaskHidden: true,
        initiativeCtrlMaskTpl: ''
      })
    },
    /**
     * 轮询获取缩略图页 不懂 等标志的信息
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

          self.newdoubt = doubtTotalSum - oldDoubt
        })
    },
    /**
     * 获取投稿未读数 的信息
     *
     */
    fetchTougaoUnreadnum () {
      let self = this
      // let url = API.submissionlist
      let url = API.submission_unread_num + '?lesson_id=' + self.lessonid

      request.get(url).then(jsonData => {
          self.newtougao = jsonData.data.unread_num
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
      self.newdoubt = 0
    },
    /**
     * 用户课堂动态点击了 投稿 按钮，清零投稿数
     *
     */
    checkTougao () {
      let self = this
      
      self.newtougao = 0
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
  /*样式清零*/
  html, body {height: 100%;}
  @import "~@/style/base";
  @import "~@/style/font/iconfont/iconfont.css";
  @import "~@/style/remote";
</style>

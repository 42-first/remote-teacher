<!-- 教师遥控器根组件 -->
<template>
  <div class="root">
    <div id="rc-home" class="rc-home">
      <!-- 当前幻灯片 -->
      <div id="upper" class="card-box upper">
        <div class="detail f14 dontcallback">
          <div>
            当前幻灯片<span class="ct f18">{{current}}/{{total}}</span>
          </div>
          <v-touch v-show="!isPubCheckProblemBtnHidden" class="btn pubpblm_or_check_answer" v-on:tap="problemHandler">
            {{isProblemPublished ? '查看答案' : '发送此题目'}}
          </v-touch>
        </div>
        <img v-if="pptData.length" class="card" :src="pptData[current - 1].Cover" />
      </div>
      <!-- 下一张幻灯片 -->
      <div id="downer" class="card-box downer" v-if="current < pptData.length">
        <div class="detail f14">下一张幻灯片</div>
        <img v-if="pptData.length" class="card" :src="pptData[current].Cover" />
      </div>
      <!-- 工具栏 -->
      <!-- 当蒙版是缩略图时，底部的工具栏要露出来 -->
      <Toolbar 
        :class="['dontcallback']"
        :lessonid="lessonid"
        :socket="socket"
        :newdoubt="newdoubt"
        :newtougao="newtougao"
        :is-toolbar-more-box-hidden.sync="isToolbarMoreBoxHidden"
        @showThumbnail="showThumbnail"
        @showActivity="showActivity"
        @goHome="goHome"
      ></Toolbar>
    </div>

    <!-- 蒙版层 -->
    <!-- 当蒙版是缩略图、课堂动态时，底部的工具栏要露出来 -->
    <div id="templates" v-show="!isInitiativeCtrlMaskHidden || !isToastCtrlMaskHidden || !isMsgMaskHidden" :class="['templates', 'dontcallback', {'yield-toolbar': isYieldToolbar, 'yield-toolbar-more': !isToolbarMoreBoxHidden}]">
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
          :newdoubt="newdoubt"
          :newtougao="newtougao"
          :is-rc-mask-activity-at-root.sync="isRcMaskActivityAtRoot"
          @cancelPublishProblem="cancelPublishProblem"
          @chooseProblemDuration="unlockProblem"
          @checkDoubt="checkDoubt"
          @checkTougao="checkTougao"

          :problem-result-data="problemResultData"
          :problem-duration-left="problemDurationLeft"
          @closeProblemresult="closeProblemresult"
          @connectLittleBankSuccess="connectLittleBankSuccess"
        ></component>
      </div>

      <!-- 遥控器遮罩层（被动弹出控制类，可关闭）：夺权面板，第二优先级 -->
      <div class="rc-mask" v-show="!isToastCtrlMaskHidden">
        <component
          :is="toastCtrlMaskTpl"
          :lessonid="lessonid"
          :courseid="courseid"
          :classroomid="classroomid"
          :socket="socket"
          :is-robber="isRobber"
          :is-robbing.sync="isRobbing"
        ></component>
      </div>

      <!-- 遥控器遮罩层（错误信息类，不可关闭）：各种错误信息，第一优先级 -->
      <div class="rc-mask" v-show="!isMsgMaskHidden">
        <component
          :is="msgMaskTpl"
          :lessonid="lessonid"
          :courseid="courseid"
          :classroomid="classroomid"
          :err-type="errType"
        ></component>
      </div>
    </div>
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
// 错误蒙版
import RcMaskErrormsg from '@/components/teacher/template/rc-mask-errormsg'
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

export default {
  name: 'Remote',
  // 找不到的data在 mixins 中
  data () {
    return {
      // TODO 用户身份
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
      isConnectingHidden: true,               // 连接中隐藏
      total: '',                              // 总页数
      current: 1,                             // 当前页码，从1开始
      pptData: [],                            // ppt数据
      isRobber: false,                        // 是夺权者
      isRobbing: false,                       // 正在夺权
      startPoint: [0, 0],
      msgMaskTpl: 'RcMaskErrormsg',
      toastCtrlMaskTpl: '',
      initiativeCtrlMaskTpl: '',
      errType: 2,
      connectCountDown: 10,
      qrcodeStatus: 1,                        // 二维码大小状态：1 和 2 分别为 小 和 大
      isDanmuOpen: false,                     // 弹幕是否处于打开状态
      postingDanmuid: -1,                     // 正在投屏的弹幕的id
      postingSubmissionid: -1,                // 正在投屏的投稿的id
      newdoubt: 0,                            //  未查看的不懂人次总数
      newtougao: 0,                           //  未查看的投稿人次总数
      isToolbarMoreBoxHidden: true,           // 工具栏更多按钮们的隐藏
      isRcMaskActivityAtRoot: true,           // 课堂动态页是否在根部
    }
  },
  computed: {
    // 判断在 InitiativeCtrlMask 蒙版时是否显示工具栏部分
    isYieldToolbar: function () {
      let self = this
      
      // 当前蒙版是缩略图或课堂动态根组件时，显示工具栏（课堂动态子页面不显示工具栏）
      let status = self.initiativeCtrlMaskTpl === 'RcMaskThumbnail' || (self.initiativeCtrlMaskTpl === 'RcMaskActivity' && self.isRcMaskActivityAtRoot)

      return status
    }
  },
  components: {
    Toolbar,
    RcMaskErrormsg,
    RcMaskDeprive,
    RcMaskQrcode,
    RcMaskRandomcall,
    RcMaskThumbnail,
    RcMaskActivity
  },
  created () {
    this.lessonid = this.$route.params.lessonid
    this.fetchLessonStatus()
    configWX()
  },
  mounted () {
    let self = this

    self.pmos()
    self.fetchUserInfo().then(self.initws)
    self.pollingPresentationTag()
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
     * 查询当前课程是否已经结束，结束的话跳转到我的课程页
     *
     */
    fetchLessonStatus () {
      let self = this
      let url = API.lesson_status

      return request.get(url,{'lesson_id': self.lessonid})
        .then(jsonData => {
          if (jsonData.data.is_lesson_end) {
            // 0未结束 1已结束
            location.href = '/v/index'
          }
        })
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
        })
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
      Vue.nextTick(function () {
        self.$refs.InitiativeCtrlMask.$emit('showThumbnail')
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
        isInitiativeCtrlMaskHidden: true
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

      let url1 = API.presentation_tag

      

      pollingPresentationTagTimer = setInterval(() => {
        if (process.env.NODE_ENV === 'production') {
          url1 = API.presentation_tag + '/' + self.presentationid + '/'
        }

        request.get(url1)
          .then(jsonData => {
            let doubt = jsonData.data.doubt
            let sum = 0

            doubt.forEach(item => {
              sum += item
            })
            self.newdoubt = sum - oldDoubt
          })
      }, 10*1000)

      let url2 = API.submissionlist

      pollingPresentationTagTimer = setInterval(() => {
        request.get(url2, {
          'lesson_id': self.lessonid,
          'start': 10000000000000000000,
          'count': 10000000000000000000,
          'direction': 0
        }).then(jsonData => {
            let sum = jsonData.data.tougao_list.length

            self.newtougao = sum - oldTougao
          })
      }, 10*1000)
    },
    /**
     * 用户缩略图点击了 不懂 按钮，清零不懂数
     *
     */
    checkDoubt () {
      let self = this
      oldDoubt = self.newdoubt || oldDoubt // 防止反复点击把oldDoubt置零
      self.newdoubt = 0
    },
    /**
     * 用户课堂动态点击了 投稿 按钮，清零投稿数
     *
     */
    checkTougao () {
      let self = this
      oldTougao = self.newtougao || oldTougao // 防止反复点击把 oldTougao 置零
      self.newtougao = 0
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

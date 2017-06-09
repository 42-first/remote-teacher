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
      <div id="downer" class="card-box downer">
        <div class="detail f14">下一张幻灯片</div>
        <img v-if="pptData.length" class="card" :src="pptData[current].Cover" />
      </div>
      <!-- 工具栏 -->
      <Toolbar 
        class="dontcallback"
        :lessonid="lessonid"
        :socket="socket"
      ></Toolbar>
    </div>

    <!-- 蒙版层 -->
    <div id="templates" class="templates dontcallback">
      <!-- 遥控器遮罩层（用户主动弹出控制类）：缩略图，二维码控制，发试题选时间，试题柱状图，试题详情，第三优先级 -->
      <div class="rc-mask" v-show="!isInitiativeCtrlMaskHidden">
        <component
          :is="initiativeCtrlMaskTpl"
          :lessonid="lessonid"
          :ppt-data="pptData"
          :current="current"
          :socket="socket"
          :invite-code="inviteCode"
          :is-brand-new-ppt="isBrandNewPpt"
          :qrcode-status="qrcodeStatus"
          @cancelPublishProblem="cancelPublishProblem"
          @chooseProblemDuration="unlockProblem"

          :problem-result-data="problemResultData"
          :problem-duration-left="problemDurationLeft"
          @closeProblemresult="closeProblemresult"
        ></component>
      </div>

      <!-- 遥控器遮罩层（被动弹出控制类，可关闭）：夺权面板，第二优先级 -->
      <div class="rc-mask" v-show="!isToastCtrlMaskHidden">
        <component :is="toastCtrlMaskTpl"></component>
      </div>

      <!-- 遥控器遮罩层（错误信息类，不可关闭）：各种错误信息，第一优先级 -->
      <div class="rc-mask" v-show="!isMsgMaskHidden">
        <component
          :is="msgMaskTpl"
          :err-type="errType"
        ></component>
      </div>
    </div>
  </div>
</template>

<script>
/* eslint-disable no-undef, no-new */

import request from '@/util/request'
import API from '@/config/api'

if (process.env.NODE_ENV !== 'production') {
  request.post = request.get
}

// 页面组件
// 工具栏
import Toolbar from '@/components/teacher/template/toolbar'
// 错误蒙版
import RcMaskErrormsg from '@/components/teacher/template/rc-mask-errormsg'
// 二维码控制蒙版
import RcMaskQrcode from '@/components/teacher/template/rc-mask-qrcode'

// 没有输出，而是给全局window加了函数 PreventMoveOverScroll
import '@/util/teacher-util/preventoverscroll'

// js功能模块，放到 mixins 中
// 一些开关
import switches from '@/util/teacher-util/switches'
// Websocket 服务
import socketService from '@/util/teacher-util/socket-service'
// 课堂试题相关
import problemRelated from '@/util/teacher-util/problem-related'

export default {
  name: 'Remote',
  // 找不到的data在 mixins 中
  data () {
    return {
      // TODO 用户身份
      userid: 265,                              // 用户id
      avatar: 'http://wx.qlogo.cn/mmopen/vi_32/QAZ5gLTK2Atz3EiawtM9Gibdmia1YibRRaqib1MJWibGolKhQzEia8ZatXgibjYsJAfrBWj0z1CZ15ic1rNicQcBypUgbGibg/64',                             // 用户头像
      auth: '35526bd3-c0bf-4676-9601-5ac1f872be79',                               // 用户身份
      inviteCode: 'LLP5IA',                         // 课堂暗号

      socket: null,                           // 全局 Websocket 实例对象
      lessonid: 0,
      presentationid: 0,
      isBrandNewPpt: true,                    // 是否是全新的ppt，主要用来控制二维码控制页“开始上课”、“继续上课”按钮文案。新上课或presentationcreated都为true。
      unlockedproblem: [],                    // 已发布试题的页码的数组，页码是从1开始
      isPubCheckProblemBtnHidden: true,       // 发送题目、查看答案按钮的隐藏
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
    }
  },
  components: {
    Toolbar,
    RcMaskErrormsg,
    RcMaskQrcode,
  },
  created () {
    this.lessonid = this.$route.params.lessonid
  },
  mounted () {
    let self = this

    self.pmos()
    self.killMask()
    self.showWhichPage({
      slideindex: 2,
      unlockedproblem: []
    })
    self.initws()
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
          console.log('fetchPPTData success', jsonData)
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

<!-- 教师遥控器根组件 -->
<template>
  <div class="root">
    <div class="rc-home">
      <!-- 当前幻灯片 -->
      <div class="card-box upper">
        <div class="detail">
          <div>
            当前幻灯片<span class="ct">{{current}}/{{total}}</span>
          </div>
          <div  class="btn pubpblm_or_check_answer">查看答案</div>
        </div>
        <img v-if="pptData.length" class="card" :src="pptData[current - 1].Cover" />
      </div>
      <!-- 下一张幻灯片 -->
      <div class="card-box downer">
        <div class="detail">下一张幻灯片</div>
        <img v-if="pptData.length" class="card" :src="pptData[current].Cover" />
      </div>
      <!-- 工具栏 -->
      <Toolbar></Toolbar>
    </div>

    <!-- 蒙版层 -->
    <div class="templates">
      <!-- 遥控器遮罩层（用户主动弹出控制类）：缩略图，二维码控制，第三优先级 -->
      <div class="rc-mask" v-show="!isInitiativeCtrlMaskHidden">
        <component :is="initiativeCtrlMaskTpl"></component>
      </div>

      <!-- 遥控器遮罩层（被动弹出控制类，可关闭）：夺权面板，第二优先级 -->
      <div class="rc-mask" v-show="!isToastCtrlMaskHidden">
        <component :is="toastCtrlMaskTpl"></component>
      </div>

      <!-- 遥控器遮罩层（错误信息类，不可关闭）：各种错误信息，第一优先级 -->
      <div class="rc-mask" v-show="!isMsgMaskHidden">
        <component :is="msgMaskTpl"></component>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
  /*样式清零*/
  html, body {height: 100%;}
  @import "~@/style/base";
  @import "~@/style/font/iconfont/iconfont.css";
  @import "~@/style/remote";
</style>

<script>
/* eslint-disable no-undef, no-unreachable */

import request from '@/util/request'
import API from '@/config/api'
import Toolbar from '@/components/template/toolbar'
import RcMaskErrormsg from '@/components/template/rc-mask-errormsg'

export default {
  name: 'Remote',
  data () {
    return {
      lessonid: 0,
      presentationid: 0,
      isBrandNewPPT: true,                    // 是否是全新的ppt，主要用来控制二维码控制页“开始上课”、“继续上课”按钮文案。新上课或presentationcreated都为true。
      unlockedproblem: [],                    // 已发布试题的页码的数组，页码是从1开始
      isPubCheckProblemBtnHidden: true,       // 发送题目、查看答案按钮的隐藏
      isMsgMaskHidden: true,                 // 蒙版隐藏，错误信息类
      isToastCtrlMaskHidden: true,            // 蒙版隐藏，被动弹出控制类，如夺权
      isInitiativeCtrlMaskHidden: true,       // 蒙版隐藏，用户主动弹出控制类，缩略图，二维码，试卷，发题，红包
      isSocketConnected: false,               // WebSocket 已连接
      isConnectingHidden: true,                // 连接中隐藏
      total: '',                              // 总页数
      current: 1,                             // 当前页码，从1开始
      pptData: [],                            // ppt数据
      isRobber: false,                        // 是夺权者
      isRobbing: false,                       // 正在夺权
      startPoint: [0, 0],
      msgMaskTpl: 'RcMaskErrormsg',
      toastCtrlMaskTpl: '',
      initiativeCtrlMaskTpl: '',
      errType: -1,
      connectCountDown: 10
    }
  },
  components: {
    Toolbar,
    RcMaskErrormsg
  },
  created () {
    this.lessonid = this.$route.params.lessonid
    // TODO 在hello中才能fetch
    this.fetchPPTData()
  },
  methods: {
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
          let current = 1 // TODO 如何全局获取current？ 模块开发
          let isProblem = (typeof pptData[current - 1].Problem) !== 'undefined'
          let isProblemPublished = false // TODO
          // let isProblemPublished = self.data.unlockedproblem.includes(current)// 也是从1开始的页码

          // fetchPPTData的主要目的是获取pptData total
          // 后2个是因为一开始打开遥控器是没有pptData数据，在hello中并不能判断当前页有没有试题
          self.pptData = pptData
          self.total = pptData.length
          self.isPubCheckProblemBtnHidden = !isProblem
          self.isProblemPublished = isProblemPublished
        })
    }
  }
}
</script>


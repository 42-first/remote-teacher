<template>
  <!-- 教师遥控器根组件 -->
  <div>
    <div class="detail">第{{current}}页/共{{total}}页</div>
    <img v-if="pptData.length" class="card" mode="widthFix" :src="pptData[current - 1].Cover" />
    <div>下一张幻灯片</div>
    <img v-if="pptData.length" class="card" mode="widthFix" :src="pptData[current].Cover" />
  </div>
</template>

<style lang="sass">
  img {width: 100%;}
</style>

<script>
/* eslint-disable no-undef, no-unreachable */

import request from '@/util/request'
import API from '../config/api'

export default {
  name: 'Remote',
  data () {
    return {
      lessonid: 0,
      presentationid: 0,
      isBrandNewPPT: true,                    // 是否是全新的ppt，主要用来控制二维码控制页“开始上课”、“继续上课”按钮文案。新上课或presentationcreated都为true。
      unlockedproblem: [],                    // 已发布试题的页码的数组，页码是从1开始
      isPubCheckProblemBtnHidden: true,       // 发送题目、查看答案按钮的隐藏
      isMsgMaskHidden: false,                 // 蒙版隐藏，错误信息类
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
      msgMaskTpl: 'rc-mask-errormsg',
      toastCtrlMaskTpl: 'rc-mask-errormsg',
      initiativeCtrlMaskTpl: 'rc-mask-errormsg',
      errType: -1,
      connectCountDown: 10
    }
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


/**
 * 仅用于 home.vue 组件
 * @module 发试题相关：发送试题、查看答案、试题倒计时、刷新柱状图、获取柱状图数据、获取试题答题详情
 */

import request from '@/util/request'
import API from '@/pages/teacher/config/api'

// 发送试题
import RcMaskProblemtime from '@/components/teacher-restructure/common/problemtime'

export default {
  data () {
    return {
      unlockedproblem: [],                    // 已发布试题的页码的数组，页码是从1开始
      isPubCheckProblemBtnHidden: true,       // 发送题目、查看答案按钮的隐藏
      isProblemPublished: false,              // 标志发题按钮文案，跟任何页无关，翻页动态变化
      problemType: '',                        // 当前页题目的类型 主观题： ShortAnswer; 单选题: MultipleChoice; 多选题: MultipleChoiceMA; 投票题: Polling
    }
  },
  components: {
    RcMaskProblemtime,
  },
  methods: {
    /**
     * 发送此题目、查看答案按钮的tap处理
     * 使用的是catchtap，防止冒泡
     *
     */
    problemHandler () {
      let self = this
      self.data = self // hack 复用小程序代码

      let current = self.data.current - 1
      let pptData = self.data.pptData
      let problemid = pptData[current].Problem.ProblemID

      self.problemType = pptData[current].Problem.Type

      if(self.data.isProblemPublished){
        // 查看答案
        // 查询当前题目的状态，在 WebSocket 回复的指令 probleminfo 中执行 showProblemResult 函数
        let str = JSON.stringify({
          'op': 'probleminfo',
          'lessonid': self.data.lessonid,
          'problemid': problemid,
          'msgid': self.problemType // 使用 problemType 判断是不是主观题，因为主观题有正计时
        })

        self.socket.send(str)
      }else{
        // 发送题目
        self.setData({
          isInitiativeCtrlMaskHidden: false,
          initiativeCtrlMaskTpl: 'RcMaskProblemtime'
        })
      }
    },
    /**
     * 取消发题
     *
     * @event bindtap
     */
    cancelPublishProblem () {
      this.setData({
        isInitiativeCtrlMaskHidden: true
      })
    },
    
    /**
     * 发送题目，在 rc-mask-problemtime.vue 中点击选择了时间后的处理函数
     *
     * @param {number} duration 设定时限的时间，以秒计算
     */
    unlockProblem (duration) {
      let self = this
      self.data = self // hack 复用小程序代码

      let current = self.data.current - 1
      let pptData = self.data.pptData
      let problemid = pptData[current].Problem.ProblemID

      let postData = {
        "lessonid": self.data.lessonid,
        "presentation": self.data.presentationid,
        "slideindex": self.data.current,
        "problemid": problemid,
        "limit": duration //-1为不限时，以秒为单位，60为一分钟
      }

      request.post(API.publish_problem, postData)
        .then(jsonData => {
          // 打开柱状图页面，倒计时
          self.showProblemResult(problemid, duration, duration)
        })
    },
    
    /**
     * 发试题后显示结果：主观题或柱状图倒计时页面
     *
     * @param {number} problemid 发送的试题的id
     * @param {number} limit 限时
     * @param {number} timeLeft 剩余的时间
     */
    showProblemResult (problemid, limit, timeLeft = 0) {
      let self = this

      // 主观题、普通题分别进入各自的页面
      let pt = self.data.problemType
      let to = {
        name: pt === 'ShortAnswer' ? 'subjectiveresult' : 'collumresult',
        params: {
          problemid,
        },
        query: {
          pt,
          lm: limit,
          tl: timeLeft
        }
      }

      // 如果是在发题选择时间的页面，记得回主界面并且把发题按钮状态改为“查看答案”
      self.goHome()
      // 跳到试题结果页
      self.$router.push(to)
    },
    
  }
}
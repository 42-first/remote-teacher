/**
 * 仅用于 home.vue 组件
 * @module 发试题相关：发送试题、查看答案、试题倒计时、刷新柱状图、获取柱状图数据、获取试题答题详情
 */

import request from '@/util/request'
import API from '@/pages/teacher/config/api'

// 发送试题
import Problemtime from '@/components/teacher-restructure/common/problemtime'

let problemType = ''

export default {
  data () {
    return {
      unlockedproblem: [],                    // 已发布试题的页码的数组，页码是从1开始
      problemType: '',                        // 当前页题目的类型 主观题： ShortAnswer; 单选题: MultipleChoice; 多选题: MultipleChoiceMA; 投票题: Polling
    }
  },
  components: {
    Problemtime,
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

      problemType = pptData[current].Problem.Type
      self.problemType = problemType

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
        self.$store.commit('set_initiativeCtrlMaskTpl', 'Problemtime')
        self.$store.commit('set_isInitiativeCtrlMaskHidden', false)
      }
    },
    /**
     * 取消发题
     *
     * @event bindtap
     */
    cancelPublishProblem () {
      let self = this
      
      self.$store.commit('set_isInitiativeCtrlMaskHidden', true)
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
      let limit = duration

      // 如果是正计时，timeLeft 可以为0或正数
      // 所以使用 0 判断是否时间到不能做题的话，不能让正计时时其值为0
      // 所以如果是正计时的话，将初始 timeLeft 设置为1
      let timeLeft = ~limit ? duration : 1

      let postData = {
        "lessonid": self.data.lessonid,
        "presentation": self.data.presentationid,
        "slideindex": self.data.current,
        "problemid": problemid,
        "limit": duration //-1为不限时，以秒为单位，60为一分钟
      }

      request.post(API.publish_problem, postData)
        .then(jsonData => {
          // 打开柱状图页面
          self.showProblemResult(problemid, limit, timeLeft)
        })
    },
    
    /**
     * 发试题后显示结果：主观题或柱状图倒计时页面
     *
     * @param {number} problemid 发送的试题的id
     * @param {number} limit 限时
     * @param {number} timeLeft 剩余的时间或正计时进行到的时间
     */
    showProblemResult (problemid, limit, timeLeft) {
      let self = this

      // 主观题、普通题分别进入各自的页面
      // TODO 找出这里的 self.problemType 总是 ShortAnswer 的原因
      let pt = problemType
      let to = {
        name: problemType === 'ShortAnswer' ? 'subjectiveresult' : 'collumresult',
        params: {
          problemid,
        },
        query: {
          pt,
          lm: limit,
          tl: timeLeft,
          _t: +new Date()
        }
      }

      // 如果是在发题选择时间的页面，记得回主界面并且把发题按钮状态改为“查看答案”
      self.goHome()
      // 跳到试题结果页
      self.$router.push(to)
    },
    
  }
}
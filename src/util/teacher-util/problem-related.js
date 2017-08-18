/**
 * 仅用于 remote.vue 组件
 * @module 发试题相关：发送试题、查看答案、试题倒计时、刷新柱状图、获取柱状图数据、获取试题答题详情
 */

import request from '@/util/request'
import API from '@/config/api'

// 发送试题
import RcMaskProblemtime from '@/components/teacher/template/rc-mask-problemtime'
// 试题柱状图页面
import RcMaskProblemresult from '@/components/teacher/template/rc-mask-problemresult'
// 试题-主观题结果页面
import RcMaskProblemresultSubjective from '@/components/teacher/template/rc-mask-problemresult-subjective'

let bellArr = []              // 倒计时命名空间
let refProblemTimer = null    // 刷新试题柱状图的定时器
let refProblemTimerNum = 0    // 刷新试题柱状图的辅助数字

export default {
  data () {
    return {
      unlockedproblem: [],                    // 已发布试题的页码的数组，页码是从1开始
      isPubCheckProblemBtnHidden: true,       // 发送题目、查看答案按钮的隐藏
      isProblemPublished: false,              // 标志发题按钮文案，跟任何页无关，翻页动态变化
      problemType: '',                        // 当前页题目的类型 主观题： ShortAnswer; 单选题: MultipleChoice; 多选题: MultipleChoiceMA; 投票题: Polling
      problemDurationLeft: '--:--',           // 题目的倒计时剩余时间
      problemResultData: null,                // 试题柱状图页数据
    }
  },
  components: {
    RcMaskProblemtime,
    RcMaskProblemresult,
    RcMaskProblemresultSubjective,
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
      let inPageProblemID = pptData[current].Problem.ProblemID

      self.problemType = pptData[current].Problem.Type

      if(self.data.isProblemPublished){
        // 查看答案
        //为了防止退出遥控器以后再进入得不到倒计时信息，需要从node服务器获取信息
        //分5种情况，1：未退出遥控器且设置了时限 2：未退出遥控器且未设置时限 
        //3：刷新了遥控器且未设置时限 4：刷新了遥控器且设置了时限但是倒计时已经终止 5：刷新了遥控器且正在倒计时
        if(bellArr[current]){//情况1,情况2
          self.showProblemResult(inPageProblemID)
        }else{
          //查询当前题目的状态，收到node回复后再显示答案showProblemResult
          let str = JSON.stringify({
            'op': 'probleminfo',
            'lessonid': self.data.lessonid,
            'problemid': inPageProblemID,
            'msgid': self.problemType // 使用 problemType 判断是不是主观题，因为主观题有正计时
          })

          self.socket.send(str)
        }
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
     * 关闭试题柱状图的按钮
     *
     * @event bindtap
     */
    closeProblemresult () {
      let self = this
      self.data = self // hack 复用小程序代码

      let current = self.data.current - 1
      let pptData = self.data.pptData
      let inPageProblemID = pptData[current].Problem.ProblemID

      this.setData({
        isInitiativeCtrlMaskHidden: true
      })
      //关闭刷新柱状图的定时器
      clearInterval(refProblemTimer)
      refProblemTimerNum = 0

      let str = JSON.stringify({
        'op': 'closeproblemresult',
        'lessonid': self.data.lessonid,
        'problemid': inPageProblemID
      })

      self.socket.send(str)
    },
    /**
     * 关闭试题-主观题答案的按钮
     *
     * @event bindtap
     */
    closeProblemSubjective () {
      // TODO 是否要关闭投屏
      let self = this
      console.log('关闭主观题答案')

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
      let inPageProblemID = pptData[current].Problem.ProblemID

      let postData = {
        "lessonid": self.data.lessonid,
        "presentation": self.data.presentationid,
        "slideindex": self.data.current,
        "problemid": inPageProblemID,
        "limit": duration //-1为不限时，以秒为单位，60为一分钟
      }

      request.post(API.publish_problem, postData)
        .then(jsonData => {
          // 打开柱状图页面，倒计时
          self.startBell(current, duration, self.problemType)
          self.showProblemResult(inPageProblemID)
        })
    },
    /**
     * 柱状图倒计时功能函数
     *
     * @param {Number} index 下标，从0开始，0代表第一页
     * @param {String} initTime 倒计时初始时间，因为有可能刷新遥控器，这个时间不一定是发送题目时设置的时间
     * @param {String} problemType 如果 initTime 是 -1 的话传入本第三个参数，标明是不是主观题 'ShortAnswer' ,因为主观题有正计时
     * @param {Number} timePassed 如果是主观题直接发送，传入已经过去的时间（默认值取1，以免触发 '时间到' 文案）
     */
    startBell (index, initTime, problemType = 'notShortAnswer', timePassed = 1) {
      let self = this
      let isShortAnswer = problemType === 'ShortAnswer'
      let isDaojishi = initTime != -1

      bellArr[index] = {}

      // 利用隐式类型转换
      if(!isDaojishi && !isShortAnswer){
        //未设置时限并且不是主观题
        bellArr[index].hasLimit = false
      }else{
        // 设置时限 或 未设置时限但是是主观题
        //设置时限
        bellArr[index].hasLimit = true
        bellArr[index].sec = isDaojishi ? initTime : timePassed

        let START = +new Date()

        //某个习题独有的计时器
        bellArr[index].timer = setInterval(function(){
          let NOW = +new Date()
          let newTime1 = initTime - Math.round((NOW - START)/1000)
          let newTime2 = timePassed + Math.round((NOW - START)/1000)

          bellArr[index].sec = isDaojishi ? newTime1 : newTime2
          // console.log(index, bellArr[index].sec)

          if(bellArr[index].sec <= 0){
            bellArr[index].sec = 0
            clearInterval(bellArr[index].timer)
          }
        }, 1000)
      }
    },
    /**
     * 发试题后显示结果：主观题或柱状图倒计时页面
     *
     * @param {number} inPageProblemID 发送的试题的id
     */
    showProblemResult (inPageProblemID) {
      let self = this
      let isSubjective = self.problemType === 'ShortAnswer'
      let fn = isSubjective ? self.showSubjective : self.showCollumResult

      fn(inPageProblemID)
    },
    /**
     * 发主观题题后显示主观题结果页面
     *
     * @param {number} inPageProblemID 发送的试题的id
     */
    showSubjective (inPageProblemID) {
      let self = this
      self.data = self // hack 复用小程序代码

      let current = self.data.current - 1
      let slideData = self.data.pptData[current]
      let problemData = slideData.Problem

      self.setData({
        isProblemPublished: true,
        isInitiativeCtrlMaskHidden: false,
        initiativeCtrlMaskTpl: 'RcMaskProblemresultSubjective'
      })

      self.refreshProblemResult(inPageProblemID)
    },
    /**
     * 发试题后显示柱状图倒计时页面
     *
     * @param {number} inPageProblemID 发送的试题的id
     */
    showCollumResult (inPageProblemID) {
      let self = this
      self.data = self // hack 复用小程序代码

      let current = self.data.current - 1
      let slideData = self.data.pptData[current]
      let problemData = slideData.Problem
      let bullets = problemData.Bullets
      let optionData = []

      for (let i = 0; i < bullets.length; i++) {
        optionData.push({
          'label': bullets[i].Label,
          'value': 0,
          'isRight': new RegExp(bullets[i].Label).test(slideData.Answer)
        })
      }

      let initData = {
        "problemID": problemData.ProblemID,
        'RedEnvelopeID': problemData.RedEnvelopeID,
        'type': problemData.Type,
        "total":0,
        "answer": slideData.Answer,
        "members":0,
        "graph":{
          "type":"Histogram",
          "data":optionData
        },
        'isBellset': bellArr[current].hasLimit
      }

      // 控制发送试题按钮文案时使用的是showWhichPage中的msg.unlockedproblem
      // 此处只是记录下数据
      let  _pptData = self.data.pptData
      _pptData[current].Problem.isPublished = true

      self.setData({
        pptData: _pptData,
        // 设置柱状图数据
        problemResultData: initData,
        isProblemPublished: true,
        isInitiativeCtrlMaskHidden: false,
        initiativeCtrlMaskTpl: 'RcMaskProblemresult'
      })

      self.refreshProblemResult(inPageProblemID)
    },

    /**
     * 在试题的发红包页面发红包成功后接收子组件传过来的事件 
     * rc-mask-redpacket.vue -> rc-mask-problemresult.vue -> remote.vue
     * 设置本试题的红包id，是的课堂红包按钮文案改为红包名单
     *
     * @event 子组件 rc-mask-problemresult.vue 传过来的事件
     * @param {Object} RedEnvelopeID 红包id
     */
    connectLittleBankSuccess (RedEnvelopeID) {
      let self = this
      let current = self.data.current - 1

      console.log('主页收到红包id', RedEnvelopeID)
      self.problemResultData.RedEnvelopeID = RedEnvelopeID
      self.pptData[current].Problem.RedEnvelopeID = RedEnvelopeID
    },
    /**
     * 发试题后设置刷新主观题、柱状图倒计时页面的定时器
     *
     * @param {number} inPageProblemID 发送的试题的id
     */
    refreshProblemResult(inPageProblemID){
      let self = this
      self.data = self // hack 复用小程序代码

      let current = self.data.current - 1
      //不在柱状图页面的话就停止刷新
      // if(!refreshStatus)return

      let hasLimit = bellArr[current] && bellArr[current].hasLimit

      clearInterval(refProblemTimer)
      refProblemTimer = setInterval(function(){
        refProblemTimerNum++
        if(refProblemTimerNum%3 == 0){
          self.getProblemResult(inPageProblemID)
        }

        //更新闹钟时间
        //有可能该题没有设置闹钟
        if(hasLimit){
          let sec = bellArr[current].sec
          self.setData({
            problemDurationLeft: self.sec2str(sec)
          })

          if(sec === 0){
            clearInterval(refProblemTimer)
            refProblemTimerNum = 0
          }
        }
      }, 1000)

      //更新闹钟时间
      //有可能该题没有设置闹钟
      if(hasLimit){
        self.setData({
          problemDurationLeft: self.sec2str(bellArr[current].sec)
        })
      }
      
      Vue.nextTick(function () {
        self.getProblemResult(inPageProblemID)
      })
      
    },
    /**
     * 发试题后request获取主观题、柱状图倒计时页面的数据
     *
     * @param {number} inPageProblemID 发送的试题的id
     */
    getProblemResult (inPageProblemID) {
      let self = this
      let isSubjective = self.problemType === 'ShortAnswer'
      let fn = isSubjective ? self.getSubjective : self.getCollumResult

      fn(inPageProblemID)
    },
    /**
     * 发试题后request获取主观题页面的数据
     *
     * @param {number} inPageProblemID 发送的试题的id
     */
    getSubjective(inPageProblemID){
      let self = this

      self.$refs.InitiativeCtrlMask && self.$refs.InitiativeCtrlMask.$emit('refreshSubjectivelist', inPageProblemID)
    },
    /**
     * 发试题后request获取柱状图倒计时页面的数据
     *
     * @param {number} inPageProblemID 发送的试题的id
     */
    getCollumResult(inPageProblemID){
      let self = this
      self.data = self // hack 复用小程序代码

      let url = API.problem_statistics

      if (process.env.NODE_ENV === 'production') {
        url = API.problem_statistics + '/' + inPageProblemID + '/'
      }

      request.get(url)
        .then(jsonData => {
          let newGraphData = jsonData.graph.data
          let total = jsonData.total
          let members = jsonData.members
          let _problemResultData = self.data.problemResultData
          let _graphData = _problemResultData.graph.data

          for (let i = 0; i < _graphData.length; i++) {
            _graphData[i].value = newGraphData[i].value
          }

          _problemResultData.total = total
          _problemResultData.members = members
          _problemResultData.graph.data = _graphData

          self.setData({
            // 设置柱状图数据
            problemResultData: _problemResultData
          })
        })
    },
  }
}
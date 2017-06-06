/**
 * @module 发试题相关：发送试题、查看答案、试题倒计时、刷新柱状图、获取柱状图数据、获取试题答题详情
 */

import request from '@/util/request'
import API from '@/config/api'

// 发送试题
import RcMaskProblemtime from '@/components/teacher/template/rc-mask-problemtime'
// 试题柱状图页面
import RcMaskProblemresult from '@/components/teacher/template/rc-mask-problemresult'

let bellArr = []              // 倒计时命名空间
let refProblemTimer = null    // 刷新试题柱状图的定时器
let refProblemTimerNum = 0    // 刷新试题柱状图的辅助数字

export default {
  data () {
    return {
      isProblemPublished: false,              // 标志发题按钮文案，跟任何页无关，翻页动态变化
      isProblemResultDetailHidden: true,      // 试题回答的详情隐藏
      problemDurationLeft: '--:--',           // 题目的倒计时剩余时间
      problemResultData: null,                // 试题柱状图页数据
      problemResultDetailData: null,          // 试题柱状图详情页数据
    }
  },
  components: {
    RcMaskProblemtime,
    RcMaskProblemresult
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
      let inPageProblemID = pptData[current].Problem.ProblemID;

      if(self.data.isProblemPublished){
        // 查看答案
        //为了防止退出遥控器以后再进入得不到倒计时信息，需要从node服务器获取信息
        //分5种情况，1：未退出遥控器且设置了时限 2：未退出遥控器且未设置时限 
        //3：刷新了遥控器且未设置时限 4：刷新了遥控器且设置了时限但是倒计时已经终止 5：刷新了遥控器且正在倒计时
        if(bellArr[current]){//情况1,情况2
          self.showProblemResult(inPageProblemID);
        }else{
          //查询当前题目的状态，收到node回复后再显示答案showProblemResult
          let str = JSON.stringify({
            'op': 'probleminfo',
            'lessonid': self.data.lessonid,
            'problemid': inPageProblemID
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
      let current = self.data.current - 1
      let pptData = self.data.pptData
      let inPageProblemID = pptData[current].Problem.ProblemID;

      this.setData({
        isInitiativeCtrlMaskHidden: true
      })
      //关闭刷新柱状图的定时器
      clearInterval(refProblemTimer);
      refProblemTimerNum = 0

      let str = JSON.stringify({
        'op': 'closeproblemresult',
        'lessonid': self.data.lessonid,
        'problemid': inPageProblemID
      })

      wx.sendSocketMessage({
        data: str
      })
    },
    /**
     * 试题柱状图页面中的公布至屏幕按钮
     *
     * @event bindtap
     */
    postProblemresult () {
      let self = this
      let current = self.data.current - 1
      let pptData = self.data.pptData
      let inPageProblemID = pptData[current].Problem.ProblemID;

      let str = JSON.stringify({
        'op': 'postproblemresult',
        'lessonid': self.data.lessonid,
        'problemid': inPageProblemID
      })

      wx.sendSocketMessage({
        data: str
      })
    },
    /**
     * 发送题目
     *
     * @param {number} duration 设定时限的时间，以秒计算
     */
    unlockProblem (duration) {
      let self = this
      self.data = self // hack 复用小程序代码

      let current = self.data.current - 1
      let pptData = self.data.pptData
      let inPageProblemID = pptData[current].Problem.ProblemID;

      let postData = {
        "lessonid": self.data.lessonid,
        "presentation": self.data.presentationid,
        "slideindex": self.data.current,
        "problemid": inPageProblemID,
        "limit": duration //-1为不限时，以秒为单位，60为一分钟
      };

      request.post(API.publish_problem, postData)
        .then(jsonData => {
          // 打开柱状图页面，倒计时
          self.startBell(current, duration);
          self.showProblemResult(inPageProblemID);
        })
    },
    /**
     * 柱状图倒计时功能函数
     *
     * @param {number} index 下标，从0开始，0代表第一页
     * @param {string} initTime 倒计时初始时间，因为有可能刷新遥控器，这个时间不一定是发送题目时设置的时间
     */
    startBell (index, initTime) {
      let self = this
      bellArr[index] = {};

      // 利用隐式类型转换
      if(initTime == -1){
        //未设置时限
        bellArr[index].hasLimit = false;
      }else{
        //设置时限
        bellArr[index].hasLimit = true;
        bellArr[index].sec = initTime;

        let START = +new Date()

        //某个习题独有的计时器
        bellArr[index].timer = setInterval(function(){
          let NOW = +new Date()
          bellArr[index].sec = initTime - Math.round((NOW - START)/1000);
          console.log(index, bellArr[index].sec)

          if(bellArr[index].sec <= 0){
            bellArr[index].sec = 0;
            clearInterval(bellArr[index].timer);
          }
        }, 1000);
      }
    },
    /**
     * 发试题后显示柱状图倒计时页面
     *
     * @param {number} inPageProblemID 发送的试题的id
     */
    showProblemResult (inPageProblemID) {
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
          'value': 10,
          'isRight': new RegExp(bullets[i].Label).test(slideData.Answer)
        })
      }

      let initData = {
        "problemID": problemData.ProblemID,
        'RedEnvelopeID': problemData.RedEnvelopeID,
        'type': problemData.Type,
        "total":20,
        "answer": slideData.Answer,
        "members":0,
        "graph":{
          "type":"Histogram",
          "data":optionData
        },
        'isBellset': bellArr[current].hasLimit
      };

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

      // self.refreshProblemResult(inPageProblemID)
    },
    /**
     * 发试题后设置刷新柱状图倒计时页面的定时器
     *
     * @param {number} inPageProblemID 发送的试题的id
     */
    refreshProblemResult(inPageProblemID){
      let self = this
      let current = self.data.current - 1
      //不在柱状图页面的话就停止刷新
      // if(!refreshStatus)return;

      let hasLimit = bellArr[current] && bellArr[current].hasLimit;

      clearInterval(refProblemTimer);
      refProblemTimer = setInterval(function(){
        refProblemTimerNum++;
        if(refProblemTimerNum%3 == 0){
          self.getProblemResult(inPageProblemID);
        }

        //更新闹钟时间
        //有可能该题没有设置闹钟
        if(hasLimit){
          let sec = bellArr[current].sec;
          self.setData({
            problemDurationLeft: self.sec2str(sec)
          })

          if(sec === 0){
            clearInterval(refProblemTimer);
            refProblemTimerNum = 0
          }
        }
      }, 1000);

      //更新闹钟时间
      //有可能该题没有设置闹钟
      if(hasLimit){
        self.setData({
          problemDurationLeft: self.sec2str(bellArr[current].sec)
        })
      }
      self.getProblemResult(inPageProblemID);
    },
    /**
     * 发试题后request获取柱状图倒计时页面的数据
     *
     * @param {number} inPageProblemID 发送的试题的id
     */
    getProblemResult(inPageProblemID){
      let self = this

      app.request({
        url: API.problem_statistics + '/' + inPageProblemID + '/',
        method: 'GET',
        success(data) {
          if(data.data.success){
            let newGraphData = data.data.graph.data;
            let total = data.data.total
            let members = data.data.members
            let _problemResultData = self.data.problemResultData
            let _graphData = _problemResultData.graph.data

            for (let i = 0; i < _graphData.length; i++) {
              _graphData[i].value = newGraphData[i].value
            };

            _problemResultData.total = total
            _problemResultData.members = members
            _problemResultData.graph.data = _graphData

            self.setData({
              // 设置柱状图数据
              problemResultData: _problemResultData
            })
          }
        },
        fail(error) {
          console.log('error', error);
        },
        complete(what) {
          // console.log('complete', what);
        },
      })
    },
    /**
     * 显示试题详情的按钮：查看详情
     *
     * @event bindtap
     */
    showProblemresultdetail () {
      let self = this
      let current = self.data.current - 1
      let pptData = self.data.pptData
      let inPageProblemID = pptData[current].Problem.ProblemID;

      self.setData({
        isProblemResultDetailHidden: false
      })
      self.refreshProblemResultDetail()
    },
    /**
     * 关闭试题详情的按钮
     *
     * @event bindtap
     */
    closeProblemresultdetail () {
      this.setData({
        isProblemResultDetailHidden: true
      })
    },
    refreshProblemResultDetail(){
      let self = this
      let current = self.data.current - 1
      let pptData = self.data.pptData
      let inPageProblemID = pptData[current].Problem.ProblemID

      //单次刷新
      app.request({
        url: API.problem_result_detail + '/' + inPageProblemID + '/',
        method: 'GET',
        success(data) {
          if(data.data.success){
            console.log(data)

            self.setData({
              // 设置柱状图数据
              problemResultDetailData: data.data
            })
          }
        },
        fail(error) {
          console.log('error', error);
        },
        complete(what) {
          // console.log('complete', what);
        },
      })
    }
  }
}
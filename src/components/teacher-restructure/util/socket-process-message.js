/**
 * @module socket处理函数
 * 现在在用
 */

let isOldVersion = false               // 雨课堂软件是老版本
import config from '@/pages/teacher/config/config'
import request from '@/util/request'

function goHome () {
  this.$store.commit('set_toolbarIndex', 0)
  this.goHome.call(this)
  if (this.$route.name !== 'home') {
    location.href = `/lesson/teacher/${window.LESSONID}`
  }
}

// 重连时必要的初始化
function remoteReset() {
  this.$store.commit('set_errType', 5)
  this.$store.commit('set_isToastCtrlMaskHidden', true)
  this.$store.commit('set_toolbarIndex', 0)
}

function socketProcessMessage(msg){
  let self = this

  if (msg.op === 'hello') {
    this.set_isCloneClass(!!msg.isClone)
  }

  // 没有在上课则直接跳走
  if (msg.op === 'hello' && !msg.isAlive) {
    location.href = '/v/index/course/normalcourse/manage_classroom/'+ self.courseid +'/'+ self.classroomid +'/';
    return
  }
  // 1.1版本及以上采用了 ppt指纹机制
  if (self.isPPTVersionAboveOne) {
    // 有可能 presentationupdated 触发的 fetchData 比较慢（比 showpresentation 指令慢），这时还没有新 slideid 的 map
    // 就暂时用 msg.slideindex
    let mapResult = self.idIndexMap[msg.slide ? msg.slide.sid : msg.slideid]
    msg.slideindex = mapResult ? mapResult : msg.slideindex
  }

  let current = self.current - 1

  // 通杀，针对所有指令，并不只是hello
  if(msg.shownow){
    // 处理刷新页面之前在课堂动态页进入的子路由的情况时，默认进入课堂动态页
    let _state = self.$store.state
    // computed 数据有缓存，这里直接用store中的数据，而不是computed传过来的数据
    // 这两个数据是基本型
    let oldAtAcitvity = !_state.isInitiativeCtrlMaskHidden && _state.initiativeCtrlMaskTpl === 'Activity'
    self.killMask()

    oldAtAcitvity && self.showActivity()
    _state = null
  }

  // 这个depriveremote是用户发送夺权并成功后服务端返回的指令
  if (msg.op === 'hello' || msg.op === 'depriveremote') {
    // 初次进来或新上课时，初始化部分选项
    remoteReset.call(self)

    self.isPPTVersionAboveOne = msg.addinversion > 1

    if(msg.addinversion === -1){
      // 显示 '您的电脑存在连接异常\n请您检查网络连接状况'
      self.showPcErrorMask()
      return
    }

    if(msg.addinversion === 0){
      isOldVersion = true; //老版本

      // TODO 提示版本过低并始终蒙版
      return
    }

    // 这个情况是用户进入后发现遥控器正被使用，需要显示我要夺权
    if(msg.op === 'hello' && msg.state === 'occupied'){
      self.$store.commit('set_isMsgMaskHidden', true)
      self.openDeprive('isRobber')
      return
    }
    // 参考 https://www.tapd.cn/20392061/bugtrace/bugs/view?bug_id=1120392061001004274
    if(!msg.presentation){
      if (msg.mask && msg.mask.type === 'qrcode') {
        self.$store.commit('set_qrcodeStatus', +msg.mask.qrcode)
        self.$store.commit('set_isMsgMaskHidden', true)

        self.showQrcodeMask()
      } else if(msg.mask && msg.mask.type === 'wordcloud'){
        if(msg.mask.cat == 'danmu'){
          self.$store.commit('set_postWordCloudOpen', false)
          self.$store.commit('set_danmuWordCloudOpen', true)
        }else {
          self.$store.commit('set_postWordCloudOpen', true)
          self.$store.commit('set_danmuWordCloudOpen', false)
        }
      } else {
        // 到这一步，如果是夺权，夺权成功了，隐藏 '正在夺权...'
        self.setData({
          isRobbing: false
        })
        // 电脑结束放映，显示 '已退出全屏放映\n或放映正在连接中'
        self.showEscMask()
      }

      return
    }

    // 到这一步，如果是夺权，夺权成功了，隐藏 '正在夺权...'
    self.setData({
      isRobbing: false
    })

    // 初始化弹幕按钮
    msg.danmu ? self.openDanmuBtn() : self.closeDanmuBtn()

    // TODO 初次联通，node有时会丢失msg.presentation
    // 有可能中间换课件，这时不要显示老的课件
    if (self.presentationid !== +msg.presentation) {
      self.$store.commit('set_pptData', [])
    }
    self.$store.commit('set_presentationid', +msg.presentation)
    // 保证夺权的时候如果shownow为false也能事后关闭夺权蒙版
    self.$store.commit('set_isToastCtrlMaskHidden', true)

    // 翻到初始页面（不一定是第一页），当前页有没有发试题按钮及状态在fetchPPTData的回调中处理
    self.showWhichPage(msg)

    // 随机点名相关代码
    if((typeof msg.call !== 'undefined') && msg.call != -1){
      // $('[data-role=stu_num]').html(msg.sc)

      let str = JSON.stringify({
        'op': 'calledlist',
        'lessonid': self.lessonid,
        'page': 0,
        'size': 20
      })

      self.socket.send(str)
      // $('.random_roll_call_box').show()
    }

    if (msg.slideindex !== 0) { // 刚开始上课slideindex总为0，不管是不是从第一页开始放映
      self.$store.commit('set_isBrandNewPpt', false)
    }

    if(msg.mask && msg.mask.type === 'qrcode'){
      // 教师可能刷新页面，得到当前的二维码状态并确定操作按钮的内容
      self.$store.commit('set_qrcodeStatus', +msg.mask.qrcode)
    }

    if(!msg.shownow){
      // qrcode为0时，有可能是第一次打开页面，此时并未播放，要在手机上点击开始上课，也显示二维码控制页
      self.$store.commit('set_isMsgMaskHidden', true)
      self.showQrcodeMask()
    }

    self.fetchPPTData()
    return
  }

  //控制权被夺
  if (msg.op == 'remotedeprived') {
    // TODO 是否需要关闭定时器
    self.openDeprive('notRobber', msg.byself)
    T_PUBSUB.publish('ykt-msg-modal', {msg: config.pubsubmsg.modal[0], isCancelHidden: true})

    let url = '/reporter/collect'
    request.get(url, {
      'user_id': self.userid,
      'lesson_id': self.lessonid,
      'socket_id': self.socket.socket_id,
      'type': 'remotedeprived-h5-teacher',
      'dt': Date.now()
    })
    return
  }

  //电脑连接异常
  if (msg.op == 'addinnews') {
    if(msg.addinversion === -1){
      self.showPcErrorMask()
    }else{
      self.killMask()
    }
    return
  }

  if (msg.op == 'presentationcreated' || msg.op == 'presentationupdated') {
    //presentationcreated是打开了新的ppt，
    //但是遥控器上还被遮罩住，等到showpresentation指令，才会去掉遮罩，显示新ppt的内容
    if(self.presentationid !== msg.presentation){
      //切换ppt的话显示二维码控制页面
      self.killMask()
      self.showQrcodeMask()
      self.$store.commit('set_current', 1)
    }

    // 无论是新ppt还是更新，都需要fetch数据
    self.$store.commit('set_presentationid', msg.presentation)

    self.fetchPPTData()
    return
  }

  if (msg.op == 'showpresentation') {
    // 一旦开始上课，二维码控制蒙版的上课按钮即为“继续上课”
    self.$store.commit('set_isBrandNewPpt', false)
    self.showWhichPage(msg)
    self.killMask()

    if (self.presentationid !== msg.presentation) {
      self.$store.commit('set_presentationid', msg.presentation)
      self.fetchPPTData()
    }
    return
  }

  if (msg.op == 'showfinished') {
    self.showEscMask()
    goHome.call(self)
    return
  }

  if (msg.op == 'lessonfinished') {
    // 结束授课
    location.href = '/v/index/course/normalcourse/manage_classroom/'+ self.courseid +'/'+ self.classroomid +'/';
    return
  }

  if (msg.op == 'slidenav') {
    // 新遥控器不会套presentationid，如果在ppt退出全屏放映的时候进入的遥控器，
    // hello中不会得到presentationid，ppt全屏后遥控器会收到qrcodezooomed，
    // 但是依然没有presentationid，此处hack在slidenav中判断presentationid，
    // 如果不一样就更新并fetchPPTData
    if (self.presentationid !== msg.slide.pres) {
      self.$store.commit('set_presentationid', msg.slide.pres)
      self.fetchPPTData()
    }

    // 换页
    if (self.isPPTVersionAboveOne) {
      msg.slideindex = typeof msg.slide.sid !== 'undefined' && msg.slide.sid > 0 ? self.idIndexMap[msg.slide.sid] : msg.slide.si // 为了公用函数，补充一下数据
    }else {
      msg.slideindex = msg.slide.si // 为了公用函数，补充一下数据
    }

    self.showWhichPage(msg)
    goHome.call(self)
    return
  }

  //刷新了遥控器页面，且点击的是查看答案按钮
  if (msg.op == 'probleminfo') {
    // msg.dt 是发题的时间
    let timePassed = Math.floor((msg.now-msg.dt)/1000)
    // 是倒计时则取剩下时间，没有限时则取已经过去的时间
    let timeLeft = ~msg.limit ? msg.limit - timePassed : timePassed

    // 如果是倒计时，timeLeft 有可能为0或负数或正数
    // 如果是正计时，timeLeft 有可能为0或正数
    // 所以使用 0 判断是否时间到不能做题的话，不能让正计时时其值为0
    // 所以如果是正计时的话，如果 timeLeft 为0，将其设置为1
    if (!~msg.limit && timeLeft === 0) {timeLeft = 1}
    timeLeft = Math.round(timeLeft)

    self.showProblemResult(msg.problemid, msg.limit, timeLeft)
    return
  }

  //习题柱状图投屏了
  if (msg.op == 'postproblemresult') {
    T_PUBSUB.publish('pro-msg.postproblemresult', {problemid: +msg.problemid});
    return
  }
  //习题柱状图取消投屏了
  if (msg.op == 'closeproblemresult') {
    T_PUBSUB.publish('pro-msg.closeproblemresult', {problemid: +msg.problemid});
    localStorage.removeItem('posting-problem'+msg.problemid)
    return
  }

  //收题了
  if (msg.op == 'problemfinished') {
    T_PUBSUB.publish('pro-msg.shoutipc', {problemid: +msg.prob});
    return
  }

  //试题延时了
  if (msg.op == 'extendtime') {
    T_PUBSUB.publish('pro-msg.yanshipc', msg.problem);
    return
  }

  //试题延时了
  if (msg.op == 'newsubmit') {
    T_PUBSUB.publish('pro-msg.newsubmit', msg);
    return
  }
  // pc端发题，通知我
  if (msg.op == 'unlockproblem') {
    self.$store.commit('set_isProblemPublished', true)
    return
  }

  // 有新的弹幕
  if (msg.op == 'newdanmu') {
    T_PUBSUB.publish('danmu-msg.newdanmu', msg)
    return
  }

  if (msg.op == 'turnondanmu') {
    self.openDanmuBtn()
    T_PUBSUB.publish('danmu-msg.turnondanmu', msg)
    return
  }

  if (msg.op == 'turnoffdanmu') {
    self.closeDanmuBtn()
    T_PUBSUB.publish('danmu-msg.turnoffdanmu', msg)
    return
  }

  // 弹幕投屏
  if (msg.op == 'danmushown') {
    self.$store.commit('set_postingDanmuid', +msg.danmuid)
    return
  }

  // 主观题投屏
  if (msg.op == 'sproblemshown') {
    self.$store.commit('set_postingSubjectiveid', +msg.spid)
    self.$store.commit('set_postingSubjectiveSent', msg.sent)
    return
  }

  // 主观题已经发送给全班，发送全班肯定是在当前投屏的状态下进行的
  if (msg.op == 'sendsproblem') {
    self.$store.commit('set_postingSubjectiveSent', true)
    return
  }

  // 投稿投屏，用户重新投屏（投之前投屏过的，这是需要在这里获取是否已经发送全班的状态）
  if (msg.op == 'postshown') {
    T_PUBSUB.publish('submission-msg.postshown', msg)

    self.$store.commit('set_postingSubmissionid', +msg.postid)
    self.$store.commit('set_postingSubmissionSent', msg.sent)
    return
  }

  // 投稿已经发送给全班，发送全班肯定是在当前投屏的状态下进行的
  if (msg.op == 'sendpost') {
    self.$store.commit('set_postingSubmissionSent', true)
    return
  }

  //关于qrcode为99、101、102的分析详见tower记录
  //链接：https://tower.im/projects/1a3a5c7ea6ff4a109296d3c5039c9c19/docs/0c842a038c3f41648a25a169f6fd8e46/#6e559264aaeb4662ba74888c912ce019
  if (msg.op == 'qrcodezoomed') {
    remoteReset.call(self);
    if(msg.qrcode == 1){
      //已经缩小
      self.$store.commit('set_qrcodeStatus', 1)
    }else if(msg.qrcode == 2){
      //已经放大
      self.$store.commit('set_qrcodeStatus', 2)
    }else if(msg.qrcode == 99){
      self.showQrcodeMask()
    }else if(msg.qrcode == 101){
      // slidenav 会去判断是不是 presentationid 变了，不要在这里 fetchPPTData 了
      // 否则，在切换 ppt 的时候，这个 fetchPPTData 会和 slidenav 里面的 fetchPPTData 比赛速度，
      // 如果这里的速度慢的话，这里的 fetchPPTData 生效，就不对了
      // self.fetchPPTData()
      self.$store.commit('set_qrcodeStatus', 1)
      self.killMask()
      self.showQrcodeMask()
    }else if(msg.qrcode == 102){
      self.fetchPPTData()
      self.$store.commit('set_qrcodeStatus', 2)
      self.killMask()
      self.showQrcodeMask()
    }
    return
  }

  // 唤起随机点名
  if (msg.op == 'callwokeup') {
    let to = {
      name: 'randomcall',
      query: {
        sc: +msg.sc
      }
    }

    self.$router.push(to)
    return
  }

  // 开始了随机点名
  if (msg.op == 'callstarted') {
    T_PUBSUB.publish('call-msg.callstarted', msg)
    return
  }

  // 暂停了随机点名
  if (msg.op == 'callpaused') {
    T_PUBSUB.publish('call-msg.callpaused', msg)
    return
  }


  if (msg.op == 'closedmask') {

    // 点击随机点名继续上课的回执
    if (msg.type == 'call') {
      // 随机点名页面关闭时触发的，不需要响应
      // T_PUBSUB.publish('call-msg.callpaused', msg)
      // 随机点名的时候，继续上课没有搞懂为啥回来就存在面板遮盖，这里强制刷新一次解决
      location.reload()
      return
    }

    // 退出弹幕投屏蒙版
    if (msg.type == 'danmu') {
      self.$store.commit('set_postingDanmuid', -1)
      return
    }

    // 退出投稿投屏蒙版
    if (msg.type == 'post') {
      self.$store.commit('set_postingSubmissionid', -1)
      return
    }

    // 退出主观题投屏蒙版
    if (msg.type == 'subjective') {
      self.$store.commit('set_postingSubjectiveid', -1)
      return
    }

    // 退出弹幕投稿词云投屏
    if (msg.type == 'wordcloud') {
      T_PUBSUB.publish('danmu-msg.closedanmuwc', msg)
      T_PUBSUB.publish('submission-msg.closepostwc', msg)
    }

  }

  // 获取随机点名名单列表
  if (msg.op == 'calledlist') {
    T_PUBSUB.publish('call-msg.calledlist', msg)
    return
  }

  // 发了新的试卷，单通了
  if (msg.op == 'newquiz') {
    T_PUBSUB.publish('quiz-msg.newquiz', msg)
    return
  }

  // 收卷了
  if (msg.op == 'quizfinished') {
    T_PUBSUB.publish('quiz-msg.quizfinished', msg)
    return
  }

  //试卷饼图投屏了
  if (msg.op == 'postquizresult') {
    T_PUBSUB.publish('quiz-msg.postquizresult', {quizid: +msg.quizid});
    return
  }
  //试卷饼图取消投屏了
  if (msg.op == 'closequizresult') {
    T_PUBSUB.publish('quiz-msg.closequizresult', {quizid: +msg.quizid});
    return
  }

  // 词云投屏了
  if (msg.op == 'wordcloudshown') {
    if(msg.cat == 'post'){
      T_PUBSUB.publish('submission-msg.wordcloudshown', msg)
      self.$store.commit('set_danmuWordCloudOpen', false)
    }else if(msg.cat == 'danmu') {
      T_PUBSUB.publish('danmu-msg.wordcloudshown', msg)
      self.$store.commit('set_postWordCloudOpen', false)
    }
  }

  // 投稿未读数目
  if (msg.op == 'unreadpost') {
    self.$store.commit('set_newtougao', msg.number || 0)
  }

}

export default socketProcessMessage

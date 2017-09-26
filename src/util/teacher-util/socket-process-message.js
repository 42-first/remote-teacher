/**
 * @module socket处理函数
 */

 let isOldVersion = false               // 雨课堂软件是老版本

function socketProcessMessage(msg){
  let self = this
  // 没有在上课则直接跳走
  if (msg.op === 'hello' && !msg.isAlive) {
    location.href = '/v/index/course/normalcourse/manage_classroom/'+ self.courseid +'/'+ self.classroomid +'/';
    return
  }
  
  let current = self.current - 1

  // 通杀，针对所有指令，并不只是hello
  if(msg.shownow){
    self.killMask()
  }

  // 这个depriveremote是用户发送夺权并成功后服务端返回的指令
  if (msg.op === 'hello' || msg.op === 'depriveremote') {
    
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
      self.isMsgMaskHidden = true
      self.openDeprive('isRobber')
      return
    }

    if(!msg.presentation){
      // 电脑结束放映，显示 '已退出全屏放映\n或放映正在连接中'
      self.showEscMask()
      return
    }

    // 到这一步，如果是夺权，夺权成功了，隐藏 '正在夺权...'
    self.setData({
      isRobbing: false
    })

    // 初始化弹幕按钮
    msg.danmu ? self.openDanmuBtn() : self.closeDanmuBtn()
    
    // TODO 初次联通，node有时会丢失msg.presentation
    self.setData({
      presentationid: msg.presentation,
      isToastCtrlMaskHidden: true // 保证夺权的时候如果shownow为false也能事后关闭夺权蒙版
    })

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

    // 根据qrcode是否为0判断是否显示二维码控制页，不为0，则显示
    if (msg.slideindex !== 0) { // 刚开始上课slideindex总为0，不管是不是从第一页开始放映
      self.isBrandNewPpt = false
    }
    
    if(msg.mask && msg.mask.type === 'qrcode'){
      // 教师可能刷新页面，得到当前的二维码状态并确定操作按钮的内容
      self.setData({
        isMsgMaskHidden: true,
        qrcodeStatus: msg.mask.qrcode
      })
      self.showQrcodeMask()
    }else if(!msg.shownow){
      // qrcode为0时，有可能是第一次打开页面，此时并未播放，要在手机上点击开始上课，也显示二维码控制页
      self.setData({
        isMsgMaskHidden: true
      })
      self.showQrcodeMask()
    }
    
    self.fetchPPTData()
    return
  }

  //控制权被夺
  if (msg.op == 'remotedeprived') {
    // TODO 是否需要关闭定时器
    self.openDeprive('notRobber')
    return
  }

  //电脑连接异常
  if (msg.op == 'addinnews') {
    if(msg.addinversion === -1){
      self.showPcErrorMask()
    }else{
      // self.showQrcodeMask()
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
    }

    // 无论是新ppt还是更新，都需要fetch数据
    self.setData({
      presentationid: msg.presentation
    })
    self.fetchPPTData()
    return
  }

  if (msg.op == 'showpresentation') {
    // 一旦开始上课，二维码控制蒙版的上课按钮即为“继续上课”
    self.setData({
      isBrandNewPpt: false
    })
    self.showWhichPage(msg)
    self.killMask()
    return
  }

  if (msg.op == 'showfinished') {
    self.showEscMask()
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
      self.presentationid = msg.slide.pres
      self.fetchPPTData()
    }

    // 换页
    msg.slideindex = msg.slide.si // 为了公用函数，补充一下数据
    self.showWhichPage(msg)

    // 换页会退出投屏的
    self.postingDanmuid = -1
    localStorage.setItem('postingDanmuid'+self.lessonid, -1)
    self.postingSubmissionid = -1
    localStorage.setItem('postingSubmissionid'+self.lessonid, -1)
      
    return
  }
  
  //刷新了遥控器页面，且点击的是查看答案按钮
  if (msg.op == 'probleminfo') {

    if (msg.limit == -1 || typeof msg.limit === 'undefined') {

        //3：刷新了遥控器且未设置时限
        //如果是 -1 的话传入第三个参数 msgid ，标明是不是主观题 ShortAnswer,因为主观题有正计时，以及传入第4个参数，已经过去的时间
        self.startBell(current, -1, msg.msgid, Math.floor((msg.now-msg.dt)/1000));

    } else if ((msg.now-msg.dt) >= msg.limit*1000) {

        //4：刷新了遥控器且设置了时限但是倒计时已经终止
        self.startBell(current, 0);

    } else {

        //5：刷新了遥控器且正在倒计时
        var bellTimeLeft = msg.limit - Math.floor((msg.now-msg.dt)/1000);
        self.startBell(current, bellTimeLeft);

    }

    self.showProblemResult(msg.problemid);
    return
  }

  // pc端发题，通知我
  if (msg.op == 'unlockproblem') {
    let current = self.data.current - 1
    self.startBell(current, msg.problem.limit, self.pptData[current].Problem.Type)
    self.isProblemPublished = true
    return
  }

  if (msg.op == 'turnondanmu') {
    self.openDanmuBtn()
    return
  }

  if (msg.op == 'turnoffdanmu') {
    self.closeDanmuBtn()
    return
  }

  // 弹幕投屏
  if (msg.op == 'danmushown') {
    self.postingDanmuid = msg.danmuid

    localStorage.setItem('postingDanmuid'+self.lessonid, msg.danmuid)
    return
  }

  // 投稿投屏，用户重新投屏（投之前投屏过的，这是需要在这里获取是否已经发送全班的状态）
  if (msg.op == 'postshown') {
    self.postingSubmissionid = msg.postid

    // 投稿投屏成功再隐藏投屏中提示
    self.$refs.InitiativeCtrlMask.$emit('postshown', msg)

    localStorage.setItem('postingSubmissionid'+self.lessonid, msg.postid)

    self.postingSubmissionSent = msg.sent

    localStorage.setItem('postingSubmissionSent'+self.lessonid, msg.sent)
    return
  }

  // 投稿已经发送给全班，发送全班肯定是在当前投屏的状态下进行的
  if (msg.op == 'sendpost') {
    self.postingSubmissionSent = true

    localStorage.setItem('postingSubmissionSent'+self.lessonid, true)
    return
  }

  // 主观题投屏
  if (msg.op == 'sproblemshown') {
    self.postingSubjectiveid = msg.spid

    localStorage.setItem('postingSubjectiveid'+self.lessonid, msg.spid)
    return
  }

  //关于qrcode为99、101、102的分析详见tower记录
  //链接：https://tower.im/projects/1a3a5c7ea6ff4a109296d3c5039c9c19/docs/0c842a038c3f41648a25a169f6fd8e46/#6e559264aaeb4662ba74888c912ce019
  if (msg.op == 'qrcodezoomed') {
    if(msg.qrcode == 1){
      //已经缩小
      self.setData({
        qrcodeStatus: 1
      })
    }else if(msg.qrcode == 2){
      //已经放大
      self.setData({
        qrcodeStatus: 2
      })
    }else if(msg.qrcode == 99){
      self.showQrcodeMask()
    }else if(msg.qrcode == 101){
      self.fetchPPTData()
      self.setData({
        qrcodeStatus: 1
      })
      self.killMask()
      self.showQrcodeMask()
    }else if(msg.qrcode == 102){
      self.fetchPPTData()
      self.setData({
        qrcodeStatus: 2
      })
      self.killMask()
      self.showQrcodeMask()
    }
    return
  }

  // 唤起随机点名
  if (msg.op == 'callwokeup') {
    self.setData({
      isInitiativeCtrlMaskHidden: false,
      initiativeCtrlMaskTpl: 'RcMaskRandomcall'
    })

    Vue.nextTick(function () {
      self.$refs.InitiativeCtrlMask.$emit('callwokeup', msg)
    })

    // 有可能是刷新了遥控器，并且之前点过名
    let str = JSON.stringify({
      'op': 'calledlist',
      'lessonid': self.lessonid,
      'page': 0,
      'size': 20
    })

    self.socket.send(str)
    return
  }

  // 开始了随机点名
  if (msg.op == 'callstarted') {
    self.$refs.InitiativeCtrlMask.$emit('callstarted', msg)
    return
  }

  // 暂停了随机点名
  if (msg.op == 'callpaused') {
    self.$refs.InitiativeCtrlMask.$emit('callpaused', msg)
    return
  }

  
  if (msg.op == 'closedmask') {
    // 点击随机点名继续上课的回执
    if (msg.type == 'call') {
      self.setData({
        isInitiativeCtrlMaskHidden: true
      })

      // 通知第一层蒙版（即当前的随机点名）点击继续上课 回执成功
      self.$refs.InitiativeCtrlMask.$emit('closedmask', msg)
      return
    }

    // 退出弹幕投屏蒙版
    if (msg.type == 'danmu') {
      self.postingDanmuid = -1

      localStorage.setItem('postingDanmuid'+self.lessonid, -1)
      return
    }

    // 退出投稿投屏蒙版
    if (msg.type == 'post') {
      self.postingSubmissionid = -1

      localStorage.setItem('postingSubmissionid'+self.lessonid, -1)
      return
    }

    // 退出主观题投屏蒙版
    if (msg.type == 'subjective') {
      self.postingSubjectiveid = -1

      localStorage.setItem('postingSubjectiveid'+self.lessonid, -1)
      return
    }
    
  }

  // 获取随机点名名单列表
  if (msg.op == 'calledlist') {
    self.setData({
      isInitiativeCtrlMaskHidden: false,
      initiativeCtrlMaskTpl: 'RcMaskRandomcall'
    })

    Vue.nextTick(function () {
      self.$refs.InitiativeCtrlMask.$emit('calledlist', msg)
    })

    return
  }

  // 有新的弹幕
  if (msg.op == 'newdanmu') {
    self.$refs.InitiativeCtrlMask.$emit('newdanmu', msg)
    return
  }

  // 发了新的试卷，单通了
  if (msg.op == 'newquiz') {
    self.$refs.InitiativeCtrlMask.$emit('newquiz', msg)
    return
  }

  // 收卷了
  if (msg.op == 'quizfinished') {
    self.$refs.InitiativeCtrlMask && self.$refs.InitiativeCtrlMask.$emit('quizfinished', msg)
    return
  }

}

export default socketProcessMessage

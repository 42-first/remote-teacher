import Vue from 'vue'
import Vuex from 'vuex'
// import home from './modules/home'
import getters from './getters'
import createPersistedState from 'vuex-persistedstate'

Vue.use(Vuex)

const store = new Vuex.Store({
  plugins: [createPersistedState()],
  state: {
    userid: -1,                             // 用户id
    avatar: '',                             // 用户头像
    auth: '',                               // 用户身份
    inviteCode: '',                         // 课堂暗号
    courseid: '',                           // 课程id 以 八>了 班为例，是 八 的id
    classroomid: '',                        // 班级id 以 八>了 班为例，是 了 的id
    coursename: '',                         // 课程名称 以 八>了 班为例，是 八
    studentCounts: 0,                       // 班级人数
    socket: null,                           // 全局 Websocket 实例对象
    lessonid: 0,
    presentationid: 0,
    isBrandNewPpt: true,                    // 是否是全新的ppt，主要用来控制二维码控制页“开始上课”、“继续上课”按钮文案。新上课或presentationcreated都为true。
    errType: 5,                             // 错误信息类型
    isGuideDelayHidden: false,              // 延时引导隐藏
    stepGuideDelay: 0,                      // 延时引导状态 0 查看答案；1 延时；2 收题；3 结束

    current: 1,                             // 当前页码，从1开始
    total: '',                              // 总页数
    pptData: [],                            // ppt数据
    finishedQuizList: {},                   // 给已经收卷的试卷做标记
    participantList: [],                    // 参与的学生
    notParticipantList: [],                 // 未签到学生

    qrcodeStatus: 1,                        // 二维码大小状态：1 和 2 分别为 小 和 大
    isDanmuOpen: false,                     // 弹幕是否处于打开状态
    newdoubt: 0,														// 未看的不懂人数
    newtougao: 0,                           // 未查看的投稿人次总数
    isPPTVersionAboveOne: false,            // ppt插件的版本大于1
    idIndexMap: {},                         // slideid 和 slideindex 的对应关系
    postingDanmuid: -1,                     // 正在投屏的弹幕的id
    postingSubmissionid: -1,                // 正在投屏的投稿的id
    postingSubmissionSent: false,           // 正在投屏的投稿已经发送全班
    postingSubjectiveid: -1,                // 正在投屏的主观题的id
    postingSubjectiveSent: false,           // 正在投屏的主观题已经发送全班

    isEnterEnded: false,                    // 遥控器进入是否结束
    stateSet: false,                        // 课堂动态 '设置' 组件
    isMsgMaskHidden: false,                 // 蒙版隐藏，错误信息类
    isToastCtrlMaskHidden: true,            // 蒙版隐藏，被动弹出控制类，如夺权
    isInitiativeCtrlMaskHidden: true,       // 蒙版隐藏，用户主动弹出控制类，缩略图，二维码，试卷，发题，红包
    isPubCheckProblemBtnHidden: true,       // 发送题目、查看答案按钮的隐藏
    isProblemPublished: false,              // 标志发题按钮文案，跟任何页无关，翻页动态变化
    toolbarIndex: 0,

    msgMaskTpl: 'Errormsg',
    toastCtrlMaskTpl: '',
    initiativeCtrlMaskTpl: '',

    newToolBar: !1,
    addinversion: 0,                        // 插件协议版本号
    toupinginfo: 0,                          // 记录当前投屏的problemid
    postWordCloudOpen: false,               // 投稿词云是否开启
    danmuWordCloudOpen: false,               // 弹幕词云是否开启
    analysisRemarkId: 0,                    // 标示当前答案解析投屏状态的problemid

    isCloneClass: false,                     // 是不是克隆班
    pretendSeizeAuth: false,                 // 非开课教师进入遥控器，展示夺权界面，实际是hello 不是夺权，用这个字段标记
    noWakeuid: false,                        // 进入遥控器时发现没有wakeuid（开课的uid） 需要展示特殊的夺权页面以便后查问题

  },

  mutations: {
  	set_userid (state, id) {
      state.userid = id
    },
    set_avatar (state, avatar) {
      state.avatar = avatar
    },
    set_auth (state, auth) {
      state.auth = auth
    },
    set_inviteCode (state, inviteCode) {
      state.inviteCode = inviteCode
    },
  	set_courseid (state, id) {
      state.courseid = id
    },
    set_classroomid (state, id) {
      state.classroomid = id
    },
    set_coursename (state, coursename) {
      state.coursename = coursename
    },
    set_studentCounts (state, count) {
      state.studentCounts = count
    },

    set_socket: (state, socket) => {
      state.socket = socket
    },
    set_lessonid (state, id) {
      state.lessonid = id
    },
    set_presentationid: (state, id) => {
      state.presentationid = id
    },
    set_isBrandNewPpt: (state, isBrandNewPpt) => {
      state.isBrandNewPpt = isBrandNewPpt
    },
    set_errType: (state, errType) => {
      state.errType = errType
    },
    set_isGuideDelayHidden: (state, isGuideDelayHidden) => {
      state.isGuideDelayHidden = isGuideDelayHidden
    },
    set_stepGuideDelay: (state, stepGuideDelay) => {
      state.stepGuideDelay = stepGuideDelay
    },

    set_current: (state, current) => {
      state.current = current
    },
    set_total: (state, total) => {
      state.total = total
    },
    set_pptData: (state, pptData) => {
      // state.pptData = pptData
      // state.pptData = Array.from(pptData)

      /*
       * 注意！注意！注意！
       * 在遥控器切换路由返回遥控器主界面之后，ppt 新增一页会获取新的data，并在这里设置 pptData，
       * 这种情况下采用上面的方法都不能引发 vue 实例（home.vue）中 this.pptData 的更新
       * 要用下面这种"变异方法"才行
       * https://cn.vuejs.org/v2/guide/list.html
       */
      let len = state.pptData.length
      state.pptData.splice(0, len, ...pptData)
    },
    set_finishedQuizList: (state, finishedQuizList) => {
      state.finishedQuizList = finishedQuizList
    },
    set_participantList: (state, participantList) => {
      state.participantList = participantList
    },
    set_notParticipantList: (state, notParticipantList) => {
      state.notParticipantList = notParticipantList
    },
    set_isDanmuOpen: (state, isDanmuOpen) => {
      state.isDanmuOpen = isDanmuOpen
    },
    set_qrcodeStatus: (state, qrcodeStatus) => {
      state.qrcodeStatus = qrcodeStatus
    },
    set_newdoubt: (state, newdoubt) => {
      state.newdoubt = newdoubt
    },
    set_newtougao: (state, newtougao) => {
      state.newtougao = newtougao
    },
    set_postingDanmuid: (state, postingDanmuid) => {
      state.postingDanmuid = postingDanmuid
    },
    set_postingSubmissionid: (state, postingSubmissionid) => {
      state.postingSubmissionid = postingSubmissionid
    },
    set_postingSubmissionSent: (state, postingSubmissionSent) => {
      state.postingSubmissionSent = postingSubmissionSent
    },
    set_postingSubjectiveid: (state, postingSubjectiveid) => {
      state.postingSubjectiveid = postingSubjectiveid
    },
    set_postingSubjectiveSent: (state, postingSubjectiveSent) => {
      state.postingSubjectiveSent = postingSubjectiveSent
    },

    set_isEnterEnded: (state, isEnterEnded) => {
      state.isEnterEnded = isEnterEnded
    },
    set_stateSet (state, isstateSet) {
      state.stateSet = isstateSet
    },
    set_isMsgMaskHidden: (state, isMsgMaskHidden) => {
      state.isMsgMaskHidden = isMsgMaskHidden
    },
    set_isToastCtrlMaskHidden: (state, isToastCtrlMaskHidden) => {
      state.isToastCtrlMaskHidden = isToastCtrlMaskHidden
    },
    set_isInitiativeCtrlMaskHidden: (state, isInitiativeCtrlMaskHidden) => {
      state.isInitiativeCtrlMaskHidden = isInitiativeCtrlMaskHidden
    },
    set_isPubCheckProblemBtnHidden: (state, isPubCheckProblemBtnHidden) => {
      state.isPubCheckProblemBtnHidden = isPubCheckProblemBtnHidden
    },
    set_isProblemPublished: (state, isProblemPublished) => {
      state.isProblemPublished = isProblemPublished
    },

    set_msgMaskTpl: (state, msgMaskTpl) => {
      state.msgMaskTpl = msgMaskTpl
    },
    set_toastCtrlMaskTpl: (state, toastCtrlMaskTpl) => {
      state.toastCtrlMaskTpl = toastCtrlMaskTpl
    },
    set_initiativeCtrlMaskTpl: (state, initiativeCtrlMaskTpl) => {
      state.initiativeCtrlMaskTpl = initiativeCtrlMaskTpl
    },
    // 获取新功能通知是否显示
    set_newToolBar (state, newToolBar) {
      state.newToolBar = newToolBar
    },
    addinversion(state, addinversion) {
      state.addinversion = addinversion
    },
    set_toupinginfo(state, toupinginfo) {
      state.toupinginfo = toupinginfo
    },
    set_postWordCloudOpen(state, isWordCloudOpen){
      state.postWordCloudOpen = isWordCloudOpen
    },
    set_danmuWordCloudOpen(state, isWordCloudOpen){
      state.danmuWordCloudOpen = isWordCloudOpen
    },
    set_analysisRemarkId(state, id) {
      state.analysisRemarkId = id
    },
    set_toolbarIndex(state, index) {
      state.toolbarIndex = index
    },
    set_isCloneClass(state, status) {
      state.isCloneClass = status
    },
    set_pretendSeizeAuth(state, status) {
      state.pretendSeizeAuth = status;
    },

    set_noWakeuid(state, status) {
      state.noWakeuid = status;
    },

  },

  actions: {
    saveUserInfo: ({commit}, payload) => {
      commit('set_userid', payload.user.user_id)
      commit('set_avatar', payload.user.avatar)
      commit('set_auth', payload.user.user_auth)
      commit('set_inviteCode', payload.lesson.invite_code)
      commit('set_courseid', payload.course.courseid)
      commit('set_classroomid', payload.classroom.classroomid)
      commit('set_coursename', payload.course.coursename)
      payload.classroom.count && commit('set_studentCounts', payload.classroom.count)

      window.USERID = payload.user.user_id
    },
    reset: ({commit}) => {
      commit('set_pptData', [])
      commit('set_avatar', '')
      commit('set_auth', '')
      commit('set_inviteCode', '')
      commit('set_courseid', '')
      commit('set_classroomid', '')
      commit('set_coursename', '')
      commit('set_studentCounts', 0)

      // 在 socket-process-message.js 中第 104 行根据 msg.slideindex !== 0 再重新设置
      commit('set_isBrandNewPpt', true)

      commit('set_newdoubt', 0)
      commit('set_newtougao', 0)

    },
    resetModal: ({commit}) => {
      commit('set_isToastCtrlMaskHidden', true)
      commit('set_toastCtrlMaskTpl', '')
      commit('set_msgMaskTpl', 'Reconnect')
      commit('set_isMsgMaskHidden', false)
      commit('set_noWakeuid', false)
    },
    addinversion({commit}, payload) {
      commit('addinversion', payload)
    },
    toupinginfo({ commit }, payload) {
      commit('set_toupinginfo', payload)
    },
    set_postWordCloudOpen({commit}, isWordCloudOpen){
      commit('set_postWordCloudOpen', isWordCloudOpen)
    },
    set_danmuWordCloudOpen({commit}, isWordCloudOpen){
      commit('set_danmuWordCloudOpen', isWordCloudOpen)
    },
    set_analysisRemarkId({commit}, id) {
      commit("set_analysisRemarkId", id)
    },
    set_toolbarIndex({commit}, index) {
      commit('set_toolbarIndex', index);
    },
    set_errType({commit}, type) {
      commit('set_errType', type);
    },
    set_isCloneClass({commit}, status) {
      commit('set_isCloneClass', status)
    },
    set_pretendSeizeAuth({commit}, status) {
      commit('set_pretendSeizeAuth', status)
    },

    set_noWakeuid({commit}, status) {
      commit('set_noWakeuid', status)
    },
    
  },
  getters
})

export default store

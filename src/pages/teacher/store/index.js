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
    socket: null,                           // 全局 Websocket 实例对象
    lessonid: 0,
    presentationid: 0,
    isBrandNewPpt: true,                    // 是否是全新的ppt，主要用来控制二维码控制页“开始上课”、“继续上课”按钮文案。新上课或presentationcreated都为true。
    
    current: 1,                             // 当前页码，从1开始
    total: '',                              // 总页数
    pptData: [],                            // ppt数据
    
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

    isEnterEnded: false,                    // 遥控器进入是否结束
    isMsgMaskHidden: false,                 // 蒙版隐藏，错误信息类
    isToastCtrlMaskHidden: true,            // 蒙版隐藏，被动弹出控制类，如夺权
    isInitiativeCtrlMaskHidden: true,       // 蒙版隐藏，用户主动弹出控制类，缩略图，二维码，试卷，发题，红包
    isPubCheckProblemBtnHidden: true,       // 发送题目、查看答案按钮的隐藏
    isProblemPublished: false,              // 标志发题按钮文案，跟任何页无关，翻页动态变化

    msgMaskTpl: 'Errormsg',
    toastCtrlMaskTpl: '',
    initiativeCtrlMaskTpl: '',

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
    set_current: (state, current) => {
      state.current = current
    },
    set_total: (state, total) => {
      state.total = total
    },
    set_pptData: (state, pptData) => {
      state.pptData = pptData
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
    set_postingSubjectiveid: (state, postingSubjectiveid) => {
      state.postingSubjectiveid = postingSubjectiveid
    },

    set_isEnterEnded: (state, isEnterEnded) => {
      state.isEnterEnded = isEnterEnded
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

      window.USERID = payload.user.user_id
    },
  },
  getters
})

export default store

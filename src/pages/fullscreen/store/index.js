/*
 * @page：web上课 store数据管理
 * @author: chenzhou
 * @update: 2020.2.29
 * @desc
 *
 */


import Vue from 'vue'
import Vuex from 'vuex'
import createPersistedState from 'vuex-persistedstate'

import meeting from './modules/meeting'
import kmeeting from './modules/kmeeting'


Vue.use(Vuex)


const store = new Vuex.Store({
  // plugins: [createPersistedState()],
  state: {
    // 课程信息 lessonID 课程ID classroomID presentationid, sid si
    lesson: {},
    // 老师信息
    teacher: null,
    // 课堂cards
    cards: [],
    // timeline列表
    lines: [],
    // 当前选中的序号
    slideIndex: 0,
    // 当前放映slide
    currSlide: null,
    // 信息消息提醒
    msg: null,
    // 是否全屏
    fullscreen: false,
    // 是否观察者模式
    observerMode: false,
    // 白板命令
    boardMsg: null,
    // 是否显示弹幕发送
    visibleDanmuSend: false,

    // 是否开启弹幕
    danmuStatus: false,
    // 是否显示弹幕
    visibleDanmu: true,
    // 弹幕
    danmus: [],
    // 是否有会议
    hasMeeting: false,
    // 是否已进入会议
    joined: false,
    // 插件协议版本
    addinVersion: 1.6,
    // 是否旁听生
    isGuestStudent: false,

    // 内容区大小
    layoutSize: {},
    // 课程状态 1 已结课
    lessonStatus: 0,
    // 右侧展示内容
    rightType: '',
    // 是否开启了腾讯会议扩展应用
    hasTXMeeting: false,
    // 腾讯会议邀请链接
    invitationLink: '',
    // 是否有直播连麦
    hasKMeeting: false,
    // 教务端听课
    inspectorMode: false,
    // timeline是否自动跳转的
    isAutoJump: false,
  },
  mutations: {
    // 重置课堂信息
    reset(state, data) {
      state.lesson = {};
      state.cards = [];
      state.lines = [];
      state.teacher = null;
      state.danmuStatus = false;
      state.visibleDanmu = true;
      state.hasMeeting = false;
      state.joined = false;
      state.danmus = [];
      state.addinVersion = 1.6;
      state.isGuestStudent = false;
      state.layoutSize = {}
      state.lessonStatus = 0
      state.invitationLink = '';
      state.hasTXMeeting = false;
      state.hasKMeeting = false;
      state.inspectorMode = false;
      state.isAutoJump = false;
    },

    setLines(state, lines) {
      state.lines = lines;
    },

    setCards(state, cards) {
      state.cards = cards;
    },

    setLesson(state, lesson) {
      state.lesson = lesson;
    },

    setSlideIndex(state, index) {
      state.slideIndex = index;
    },

    setCurrSlide(state, slide) {
      state.currSlide = slide;
    },

    setMsg(state, msg) {
      state.msg = msg;
    },

    setBoardMsg(state, msg) {
      state.boardMsg = msg;
    },

    setVisibleDanmuSend(state, data) {
      state.visibleDanmuSend = data;
    },

    setObserverMode(state, data) {
      state.observerMode = data;
    },

    setTeacher(state, data) {
      state.teacher = data;
    },

    setDanmuStatus(state, data) {
      state.danmuStatus = data;
    },

    setVisibleDanmu(state, data) {
      state.visibleDanmu = data;
    },

    setHasMeeting(state, data) {
      state.hasMeeting = data;
    },

    setJoined(state, data) {
      state.joined = data;
    },

    setDanmus(state, data) {
      state.danmus = data;
    },

    setAddinVersion(state, data) {
      state.addinVersion = data;
    },

    setIsGuestStudent(state, data) {
      state.isGuestStudent = data
    },

    setLayoutSize(state, data) {
      state.layoutSize = data
    },

    setLessonStatus(state, data) {
      state.lessonStatus = data
    },

    setRightType(state, data) {
      state.rightType = data
    },

    setHasTXMeeting(state, data) {
      state.hasTXMeeting = data;
    },

    setInvitationLink(state, data) {
      state.invitationLink = data;
    },

    setHasKMeeting(state, data) {
      state.hasKMeeting = data
    },

    setInspectorMode(state, data) {
      state.inspectorMode = data
    },

    setIsAutoJump(state, data) {
      state.isAutoJump = data
    },
  },

  actions: {
    reset: ({commit}, data) => {
      commit('reset', data)
    },

    setLines({commit}, data) {
      commit('setLines', data)
    },

    setCards({commit}, data) {
      commit('setCards', data)
    },

    setLesson({commit}, data) {
      commit('setLesson', data)
    },
    setSlideIndex({commit}, index) {
      commit('setSlideIndex', index)
    },
    setCurrSlide({commit}, slide) {
      commit('setCurrSlide', slide)
    },

    setMsg({commit}, slide) {
      commit('setMsg', slide)
    },

    setBoardMsg({commit}, slide) {
      commit('setBoardMsg', slide)
    },

    setVisibleDanmuSend({commit}, data) {
      commit('setVisibleDanmuSend', data)
    },

    setObserverMode({commit}, slide) {
      commit('setObserverMode', slide)
    },

    setTeacher({commit}, data) {
      commit('setTeacher', data)
    },

    setDanmuStatus({commit}, data) {
      commit('setDanmuStatus', data)
    },

    setVisibleDanmu({commit}, data) {
      commit('setVisibleDanmu', data)
    },

    setHasMeeting({commit}, data) {
      commit('setHasMeeting', data)
    },

    setJoined({commit}, data) {
      commit('setJoined', data)
    },

    setDanmus({commit}, data) {
      commit('setDanmus', data)
    },

    setAddinVersion({commit}, data) {
      commit('setAddinVersion', data)
    },

    setIsGuestStudent({commit}, data) {
      commit('setIsGuestStudent', data)
    },

    setLayoutSize({commit}, data) {
      commit('setLayoutSize', data)
    },

    setLessonStatus({commit}, data) {
      commit('setLessonStatus', data)
    },

    setRightType({commit}, data) {
      commit('setRightType', data)
    },

    setHasTXMeeting({commit}, data) {
      commit('setHasTXMeeting', data)
    },

    setInvitationLink({commit}, data) {
      commit('setInvitationLink', data)
    },

    setHasKMeeting({commit}, data) {
      commit('setHasKMeeting', data)
    },

    setInspectorMode({commit}, data) {
      commit('setInspectorMode', data)
    },

    setIsAutoJump({commit}, data) {
      commit('setIsAutoJump', data)
    },
  },

  modules: {
    meeting,
    kmeeting
  }

})

export default store

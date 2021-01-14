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
  },

  modules: {
    meeting
  }

})

export default store

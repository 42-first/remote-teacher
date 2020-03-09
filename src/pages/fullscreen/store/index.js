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


Vue.use(Vuex)


const store = new Vuex.Store({
  plugins: [createPersistedState()],
  state: {
    // 课程信息 lessonID 课程ID classroomID presentationid, sid si
    lesson: {},
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
  },
  mutations: {
    // 重置课堂信息
    reset(state, data) {
      state.lesson = {};
      state.cards = [];
      state.lines = [];
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

    setObserverMode(state, data) {
      state.observerMode = data;
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

    setObserverMode({commit}, slide) {
      commit('setObserverMode', slide)
    },
  },

})

export default store

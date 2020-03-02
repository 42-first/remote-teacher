/*
 * @page：web上课 store数据管理
 * @author: chenzhou
 * @update: 2020.2.29
 * @desc
 *
 */


import Vue from 'vue'
import Vuex from 'vuex'
// import createPersistedState from 'vuex-persistedstate'


Vue.use(Vuex)


const store = new Vuex.Store({
  // plugins: [createPersistedState()],
  state: {
    // 课程信息 lessonID 课程ID classroomID presentationid, sid si
    lesson: {},
    // 课堂cards
    cards: [],
    // timeline列表
    lines: [],
    // 当前选中的序号
    slideIndex: 0,
    // 当前slide
    slide: null,
    // 信息消息提醒
    msg: null,
    // 是否全屏
    fullscreen: false,
    // 是否观察者模式
    observerMode: false
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

    setSlide(state, slide) {
      state.slide = slide;
    },

    setMsg(state, msg) {
      state.msg = msg;
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
    setSlide({commit}, slide) {
      commit('setSlide', slide)
    },

    setMsg({commit}, slide) {
      commit('setMsg', slide)
    },

    setObserverMode({commit}, slide) {
      commit('setObserverMode', slide)
    },
  },

})

export default store

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
  // plugins: [createPersistedState()],
  state: {
    // 课程信息 lessonID
    lessonId: 0,
    classroomId: 0,
    presentationId: 0,
    // 课堂cards
    cards: [],
    // 是否观察者模式
    observerMode: false,
    // 白板命令
    boardMsg: null,
    // 腾讯会议邀请链接
    invitationLink: '',
  },
  mutations: {
    // 重置课堂信息
    reset(state, data) {
      state.cards = [];
      state.lessonId = 0;
      state.classroomId = 0;
      state.presentationId = 0;
      state.observerMode = false;
      state.invitationLink = '';
    },

    setCards(state, data) {
      state.cards = data;
    },

    setLessonId(state, data) {
      state.lessonId = data;
    },

    setClassroomId(state, data) {
      state.classroomId = data;
    },

    setPresentationId(state, data) {
      state.presentationId = data;
    },

    setBoardMsg(state, msg) {
      state.boardMsg = msg;
    },

    setObserverMode(state, data) {
      state.observerMode = data;
    },

    setInvitationLink(state, data) {
      state.invitationLink = data;
    },
  },

  actions: {
    reset: ({commit}, data) => {
      commit('reset', data)
    },

    setCards({commit}, data) {
      commit('setCards', data)
    },

    setLessonId({commit}, data) {
      commit('setLessonId', data)
    },

    setClassroomId({commit}, index) {
      commit('setClassroomId', index)
    },

    setPresentationId({commit}, slide) {
      commit('setPresentationId', slide)
    },

    setBoardMsg({commit}, slide) {
      commit('setBoardMsg', slide)
    },

    setObserverMode({commit}, slide) {
      commit('setObserverMode', slide)
    },

    setInvitationLink({commit}, data) {
      commit('setInvitationLink', data)
    },
  },

})

export default store



const meeting = {
  namespaced: true,
  state: {
    local: null,
    // 当前用户信息
    user: null,
    // {
    //   id: uid,
    //   name: "测试员",
    //   avatar: "http://wx.qlogo.cn/mmopen/OUicWJdJoz3HNVF1oYxOQYibUZicpTD55udhicFPk9RBUuicwxiahv5nUJBx7MZPbl7tTkeZRlptRuhhMpaPNPxyplWQ/96",
    //   role: 'student', audio: false, video: false, active: false
    // }
    // 会议状态
    meeting: {
      // 是否开启音频
      audio: false,
      // 是否开启音频
      video: false,
      active: false,
      // 0: 无分享屏幕  1: 开启屏幕分享 开启新的分享screen++
      screen: false,
      // 别人是否分享了屏幕
      otherscreen: false,
      // 分享基本信息
      shareInfo: null
    },
    lcalSharing: false,
    // 发言列表
    speakers: [],
    // 视频通话使用的SDK kwai: 快手 tencent：腾讯 local:本地
    meetingSDK: '',
  },
  mutations: {
    // 重置课堂信息
    reset(state, data) {
      state.local = null;
      state.user = null;
      state.meeting = {
        // 是否开启音频
        audio: false,
        // 是否开启音频
        video: false,
        active: false,
        // 0: 无分享屏幕 1: 开启屏幕分享
        screen: false,
        // 别人是否分享了屏幕
        otherscreen: false
      };
      state.speakers = [];
      state.lcalSharing = false;
    },

    setLocal(state, data) {
      state.local = data;
    },

    setUser(state, data) {
      state.user = data;
    },

    setMeeting(state, data) {
      state.meeting = data;
    },

    setSpeakers(state, data) {
      state.speakers = data;
    },

    setMeetingSDK(state, data) {
      state.meetingSDK = data;
    },

    setLocalSharing(state, data) {
      state.lcalSharing = data;
    },
  },

  actions: {
    reset({commit}, data) {
      commit('reset', data)
    },

    setLocal({commit}, data) {
      commit('setLocal', data)
    },

    setUser({commit}, data) {
      commit('setUser', data)
    },

    setMeeting({commit}, data) {
      commit('setMeeting', data)
    },

    setSpeakers({commit}, data) {
      commit('setSpeakers', data)
    },

    setMeetingSDK({commit}, data) {
      commit('setMeetingSDK', data)
    },

    setLocalSharing({commit}, data) {
      commit('setLcalSharing', data)
    },

  }
}

export default meeting

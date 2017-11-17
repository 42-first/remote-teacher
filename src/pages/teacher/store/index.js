import Vue from 'vue'
import Vuex from 'vuex'
// import home from './modules/home'
import getters from './getters'

Vue.use(Vuex)

const store = new Vuex.Store({
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
    pptData: [],                            // ppt数据
    
    qrcodeStatus: 1,                        // 二维码大小状态：1 和 2 分别为 小 和 大
    isDanmuOpen: false,                     // 弹幕是否处于打开状态
    
    newtougao: 0,                           // 未查看的投稿人次总数
    isPPTVersionAboveOne: false,            // ppt插件的版本大于1
    idIndexMap: {},                         // slideid 和 slideindex 的对应关系
  },

  mutations: {
    set_lessonid (state, id) {
      state.lessonid = id
    },
    set_presentationid: (state, id) => {
      state.presentationid = id
    },
    set_pptData: (state, pptData) => {
      state.pptData = pptData
    },
    set_socket: (state, socket) => {
      state.socket = socket
    },
  },

  actions: {
    
  },
  getters
})

export default store

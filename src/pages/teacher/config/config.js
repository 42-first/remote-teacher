/**
 * @module 预置文案、选择范围等
 */

import Vue from 'vue'
import VueI18n from 'vue-i18n'
// 通过插件的形式挂载
Vue.use(VueI18n)

import EnLanguage from '@/language/en'
import ChLanguage from '@/language/zh_CN'

const i18n = new VueI18n({
  // 语言标识
  locale: 'en',
  messages: {
    'zh_CN': ChLanguage,
    'en': EnLanguage
  }
})

const config = {
  movementList: ['tap', 'giveup', 'swipeleft', 'swiperight', 'swipeup', 'swipedown'],
  // 新增文案继续往后添加，不要往前插
  errMsgList: [
    '当前网络状况不佳，建议切换网络<br/>模式或使用电脑操作。',
    '已连接成功<br/>请在电脑上播放幻灯片',
    // '已退出全屏放映<br/>或放映正在连接中',
    `${i18n.t('showended')}<br/>${i18n.t('showconnecting')}`,
    '您的电脑存在连接异常<br/>请您检查网络连接状况',
    '您的雨课堂软件版本过低<br/>请您升级到最新版本后继续使用',
    '放映正在连接中'
  ],
  // 发题时间选择
  problemTimePicker: ['30秒', '1分钟', '2分钟', '3分钟', '4分钟', '5分钟'],
  pubsubmsg: {
    toast: [],
    modal: [
      i18n.t('yhbflo') || '您已经被夺权，请刷新页面',
      i18n.t('aysts') || '确定结束答题？'
    ]
  }
}

export default config

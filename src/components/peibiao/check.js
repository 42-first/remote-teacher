import initSet from './initSet';
import escapeRegExp from './utils/escapeRegExp';

/**
 * 判断是否为陪标平台域名
 * @param platform
 * @returns {boolean}
 */
const isPeiBiaoLocationByPlatform = function (platform) {
  return (
    new RegExp(`${escapeRegExp(`${platform}.rainclassroom.com`)}`).test(window.location.host) ||
    new RegExp(`${escapeRegExp(`${platform}-example.rainclassroom.com`)}`).test(
      window.location.host,
    ) ||
    new RegExp(`${escapeRegExp(`${platform}.yuketang.cn`)}`).test(window.location.host) ||
    new RegExp(`${escapeRegExp(`xuetangxpeibiaotest=${platform}`)}`).test(window.location.search)
  );
};
/**
 * 获取是哪个陪标平台
 * @param data
 * @returns {string}
 */
const getPeiBiaoPlatform = function (data) {
  const valueList = data.platformValueList;
  for (let i = 0; i < valueList.length; i++) {
    let value = valueList[i];
    if (isPeiBiaoLocationByPlatform(value)) {
      return value;
    }
  }
  return '';
};
/**
 * 陪标全局数据
 * @type {{platformValueList: string[], ready: boolean, platform: string}}
 */
window.xuetangxpeibiao = {
  platformValueList: ['zhktpt', 'cyktdx'],
  ready: false,
  platform: '',
};
window.xuetangxpeibiao.platform = getPeiBiaoPlatform(window.xuetangxpeibiao);
if (process.env.NODE_ENV === 'development') {
  // localStorage.setItem('runtime_xtbz', 'yth');
  // window.xuetangxpeibiao.platform = 'zhktpt';
}
// 陪标平台要上线，这些代码必须加载
// 如果是陪标平台里面添加body特定classname,并且添加全局loading，在陪标修改完成前面遮挡，不然就穿帮了
// 具体页面的代码都基于路由懒加载了，尽量减少对项目的影响
export default function peiBiaoCheck({
  router,
  i18n,
  store,
  pageName = '',
  langKeys = {zh: 'zh_CN', en: 'en'},
}) {
  // 如果是陪标平台
  if (window.xuetangxpeibiao.platform) {
    window.xuetangxpeibiao.isPeiBiaoLocationByPlatform = isPeiBiaoLocationByPlatform;
    window.xuetangxpeibiao.getPeiBiaoPlatform = getPeiBiaoPlatform;
    initSet({router, i18n, store, pageName, langKeys, data: window.xuetangxpeibiao});
  }
}

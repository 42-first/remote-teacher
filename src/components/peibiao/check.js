import Vue from 'vue';
import PeiBiaoGlobalLoading from './CompLoading.vue';
import escapeRegExp from './utils/escapeRegExp'

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
// if (process.env.NODE_ENV === 'development') {
//   window.xuetangxpeibiao.platform = 'zhktpt';
// }
// 陪标平台要上线，这些代码必须加载
// 如果是陪标平台里面添加body特定classname,并且添加全局loading，在陪标修改完成前面遮挡，不然就穿帮了
// 具体页面的代码都基于路由懒加载了，尽量减少对项目的影响
export default function peiBiaoCheck({router, i18n, store}) {
  // 如果是陪标平台
  if (window.xuetangxpeibiao.platform) {
    /**
     * 添加全局loading 平台修改没完成前遮挡
     * @param data
     */
    const addPeiBiaoGlobalLoading = function (data) {
      if (data.platform && document.body && !data.globalLoading) {
        const _PeiBiaoGlobalLoading = Vue.extend({
          extends: PeiBiaoGlobalLoading,
          props: {
            platform: {
              type: String,
              default: data.platform,
            },
          },
        });
        const _PeiBiaoGlobalLoadingComp = new _PeiBiaoGlobalLoading().$mount();
        document.body.appendChild(_PeiBiaoGlobalLoadingComp.$el);
        data.globalLoading = _PeiBiaoGlobalLoadingComp;
      }
    };
    /**
     * 给body添加陪标特定classname
     * @param data
     */
    const addPeiBiaoBodyClassName = function (data) {
      if (
        data.platform &&
        document.body &&
        !document.body.classList.contains(data.classNameConfig.body)
      ) {
        for (let classNameKey in data.classNameConfig) {
          if (Object.prototype.hasOwnProperty.call(data.classNameConfig, classNameKey)) {
            document.body.classList.add(data.classNameConfig[classNameKey]);
          }
        }
        if (!data.bodyClassNameObserver) {
          // 如果body的class有变化，则检查陪标的class是否还存在，没有就加上
          let bodyClassNameObserver = new MutationObserver(function (mutationsList) {
            for (let i = 0; i < mutationsList.length; i++) {
              let mutation = mutationsList[i];
              // 检查是否是属性变化，且变化的属性是 class
              if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                // bodyClassNameObserver.disconnect();
                addPeiBiaoBodyClassName(data);
                // 提前退出循环
                break;
              }
            }
          });
          bodyClassNameObserver.observe(document.body, {
            attributes: true,
            attributeFilter: ['class'],
          });
          data.bodyClassNameObserver = bodyClassNameObserver;
        }
      }
    };
    window.xuetangxpeibiao.platformKeyValue = {};
    window.xuetangxpeibiao.platformValueList.forEach(function (value) {
      window.xuetangxpeibiao.platformKeyValue[value] = value;
    });
    window.xuetangxpeibiao.classNameConfig = {
      body: 'pei-biao-global-class-name-body',
    };
    window.xuetangxpeibiao.classNameConfig.bodyType = `${window.xuetangxpeibiao.classNameConfig.body}-${window.xuetangxpeibiao.platform}`;
    window.xuetangxpeibiao.isPeiBiaoLocationByPlatform = isPeiBiaoLocationByPlatform;
    window.xuetangxpeibiao.getPeiBiaoPlatform = getPeiBiaoPlatform;
    window.xuetangxpeibiao.addPeiBiaoBodyClassName = addPeiBiaoBodyClassName;

    if (document.body) {
      addPeiBiaoBodyClassName(window.xuetangxpeibiao);
      addPeiBiaoGlobalLoading(window.xuetangxpeibiao);
    } else {
      // 没有body，就监听document.body是否添加
      // 创建一个 MutationObserver 实例
      const observer = new MutationObserver(function (mutationsList) {
        // 检查是否有节点被添加
        for (let i = 0; i < mutationsList.length; i++) {
          let mutation = mutationsList[i];
          if (mutation.type === 'childList') {
            // 检查 body 元素是否被添加
            if (document.body) {
              // 停止观察
              observer.disconnect();
              // 获取 body 元素并添加 class
              addPeiBiaoBodyClassName(window.xuetangxpeibiao);
              addPeiBiaoGlobalLoading(window.xuetangxpeibiao);
              // 提前退出循环
              break;
            }
          }
        }
      });
      // 开始观察 document.documentElement（即 <html> 元素）的子节点变化
      observer.observe(document.documentElement, {childList: true});
    }

    const styleDisplayChange = (el, binding) => {
      if (window.xuetangxpeibiao.platform) {
        el.style.display = 'none';
      } else {
        el.style.display = '';
      }
    };

    Vue.directive('pei-biao-hide', {
      bind(el, binding) {
        // 初始绑定时的逻辑
        styleDisplayChange(el, binding);
      },
      update(el, binding) {
        // 当绑定的值更新时的逻辑
        styleDisplayChange(el, binding);
      },
    });

    Vue.prototype.$peiBiao = window.xuetangxpeibiao;

    router.beforeEach(async (to, from, next) => {
      try {
        if (window.xuetangxpeibiao.ready) {
          window.xuetangxpeibiao.beforeEach({
            data: window.xuetangxpeibiao,
            router,
            i18n,
            store,
            to,
            from,
            next,
          });
        } else {
          // 懒加载，减少对正常项目的影响
          const module = await import('./index');
          await module.initMain({
            data: window.xuetangxpeibiao,
            router,
            i18n,
            store,
            to,
            from,
            next,
          });
        }
      } catch (e) {
        window.xuetangxpeibiao.globalLoading &&
          window.xuetangxpeibiao.globalLoading.setLoading(false);
        next();
      }
    });
  }
}

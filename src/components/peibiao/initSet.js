import Vue from 'vue';
import PeiBiaoGlobalLoading from './CompLoading.vue';
import initSetExtra from './extra/initSetExtra';

export default function initSet({router, i18n, store, pageName, langKeys, data}) {
  data.pageName = pageName;
  data.langKeys = langKeys;
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
  data.platformKeyValue = {};
  data.platformValueList.forEach(function (value) {
    data.platformKeyValue[value] = value;
  });
  data.classNameConfig = {
    body: 'pei-biao-global-class-name-body',
  };
  data.classNameConfig.bodyType = `${data.classNameConfig.body}-${data.platform}`;

  data.addPeiBiaoBodyClassName = addPeiBiaoBodyClassName;

  if (document.body) {
    addPeiBiaoBodyClassName(data);
    addPeiBiaoGlobalLoading(data);
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
            addPeiBiaoBodyClassName(data);
            addPeiBiaoGlobalLoading(data);
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

  Vue.prototype.$peiBiao = data;

  router.beforeEach(async (to, from, next) => {
    try {
      if (data.ready) {
        await data.beforeEach({
          data,
          router,
          i18n,
          store,
          to,
          from,
          next,
        });
      } else {
        // 懒加载，减少对正常项目的影响
        const module = await import('./initRouterGuards');
        await module.initRouterGuards({
          data,
          router,
          i18n,
          store,
          to,
          from,
          next,
        });
      }
    } catch (e) {
      data.globalLoading && data.globalLoading.setLoading(false);
      next();
    }
  });

  initSetExtra({
    router,
    i18n,
    store,
    pageName,
    langKeys,
    data,
  });
}

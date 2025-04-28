import './extra/index.scss';
import initExtra from './extra/initExtra';
import injectionRouteView from './extra/injectionRouteView';
import EnLanguage_cyktdx from './extra/platform/cyktdx/language/en';
import ChLanguage_cyktdx from './extra/platform/cyktdx/language/zh_cn';
import EnLanguage_zhktpt from './extra/platform/zhktpt/language/en';
import ChLanguage_zhktpt from './extra/platform/zhktpt/language/zh_cn';
import './index.scss';
import {findFirstRouterViewComponentInChildren, startPolling} from './utils';

export function getRouteViewVm({data, router, i18n, store, to, matchedInjectionModule, callback}) {
  if (to.matched && to.matched.length) {
    let length = to.matched.length;
    let count = 0;
    const updateCount = async ({vm, injectionModule, matchedRoute} = {}) => {
      if (injectionModule) {
        await injectionModule.initModule({
          vm,
          data,
          router,
          i18n,
          store,
          to,
          injectionModule,
          matchedRoute,
        });
      }
      count++;
      if (count >= length) {
        callback();
      }
    };
    // 遍历匹配到的router-view
    to.matched.forEach(async (matchedRoute, index) => {
      const injectionModuleConfig =
        matchedInjectionModule[matchedRoute.name] ||
        matchedInjectionModule[matchedRoute.meta.peiBiaoName];
      if (injectionModuleConfig && injectionModuleConfig.module) {
        const injectionModule = (await injectionModuleConfig.module()).default;
        if (injectionModule && injectionModule.initModule) {
          injectionModule.name = injectionModuleConfig.name;
          let pollingCount = 0;
          startPolling(20, async () => {
            pollingCount++;
            // 正常情况这里就能获得router view挂载的vue组件实例
            if (matchedRoute.instances.default) {
              await updateCount({
                vm: matchedRoute.instances.default,
                injectionModule,
                matchedRoute,
              });
              return true;
            }
            // 如果router view用了 is 动态组件，则只能这样才能拿到实例
            if (pollingCount >= 3) {
              const $children =
                matchedRoute.parent &&
                matchedRoute.parent.instances &&
                matchedRoute.parent.instances.default &&
                matchedRoute.parent.instances.default.$children;
              const routerViewComponent = findFirstRouterViewComponentInChildren($children);
              if (routerViewComponent) {
                await updateCount({vm: routerViewComponent, injectionModule, matchedRoute});
                return true;
              }
            }
            // 保底拿不到vm也执行注入代码
            if (pollingCount >= 10) {
              await updateCount({injectionModule, matchedRoute});
              return true;
            }
            return false;
          });
        } else {
          await updateCount();
        }
      } else {
        await updateCount();
      }
    });
  }
}

/**
 * 判断是否有注入页面的需求
 * @param data
 * @param router
 * @param store
 * @param to
 * @returns {{count: number, matchedInjectionModule: null}}
 */
function isCustomization({data, router, store, to}) {
  const customization = {
    count: 0,
    matchedInjectionModule: null,
  };
  for (const routeName in injectionRouteView) {
    if (Object.prototype.hasOwnProperty.call(injectionRouteView, routeName)) {
      const module = injectionRouteView[routeName];
      if (module.regex.test(to.path)) {
        if (!customization.matchedInjectionModule) {
          customization.matchedInjectionModule = {};
        }
        customization.matchedInjectionModule[routeName] = module;
      }
    }
  }
  if (customization.matchedInjectionModule) {
    customization.count++;
  }
  return customization;
}

/**
 * 如果有注入页面，则显示遮罩loading
 * @param data
 * @param router
 * @param i18n
 * @param store
 * @param to
 * @param from
 * @param next
 */
function beforeEach({data, router, i18n, store, to, from, next}) {
  const {count} = isCustomization({data, router, store, to});
  if (count > 0) {
    data.globalLoading.setLoading(true);
    next();
  } else {
    data.globalLoading.setLoading(false);
    next();
  }
}

/**
 * 如果有注入页面，则等待注入页面完成，再去掉遮罩loading
 * @param data
 * @param router
 * @param i18n
 * @param store
 */
function initAfterEach({data, router, i18n, store}) {
  router.afterEach(async (to, from) => {
    const customization = isCustomization({data, router, store, to});
    if (customization.count > 0) {
      if (customization.matchedInjectionModule) {
        getRouteViewVm({
          data,
          router,
          i18n,
          store,
          to,
          matchedInjectionModule: customization.matchedInjectionModule,
          callback: async vm => {
            customization.count--;
          },
        });
      }
      let pollingCount = 0;
      startPolling(22, async () => {
        pollingCount++;
        if (customization.count <= 0 || pollingCount > 20) {
          data.globalLoading.setLoading(false);
          return true;
        }
        return false;
      });
    }
  });
}

async function initMain({data, router, i18n, store, to, from, next}) {
  await initExtra({data, router, i18n, store, to, from, next});
  initAfterEach({data, router, i18n, store});
  if (data.platform + '' === data.platformKeyValue.zhktpt) {
    i18n.mergeLocaleMessage('en', EnLanguage_zhktpt);
    i18n.mergeLocaleMessage('zh-cn', ChLanguage_zhktpt);
  } else {
    i18n.mergeLocaleMessage('en', EnLanguage_cyktdx);
    i18n.mergeLocaleMessage('zh-cn', ChLanguage_cyktdx);
  }
  beforeEach({data, router, i18n, store, to, from, next});
  data.beforeEach = beforeEach;
  data.ready = true;
}

export {initMain};

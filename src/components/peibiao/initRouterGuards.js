import checkRedirectExtra from './extra/checkRedirectExtra';
import './extra/index.scss';
import initRouterGuardsExtra from './extra/initRouterGuardsExtra';
import injectionRouteView from './extra/injectionRouteView';
import EnLanguage_cyktdx from './extra/platform/cyktdx/language/en';
import ChLanguage_cyktdx from './extra/platform/cyktdx/language/zh_cn';
import EnLanguage_zhktpt from './extra/platform/zhktpt/language/en';
import ChLanguage_zhktpt from './extra/platform/zhktpt/language/zh_cn';
import './index.scss';
import {findFirstRouterViewComponentInChildren, startPolling} from './utils';

export function getRouteViewVm({
  data,
  router,
  i18n,
  store,
  to,
  matchedInjectionModuleConfig,
  callback,
}) {
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
        matchedInjectionModuleConfig[matchedRoute.name] ||
        matchedInjectionModuleConfig[matchedRoute.meta.peiBiaoName];
      if (injectionModuleConfig && injectionModuleConfig.module) {
        const injectionModule = (await injectionModuleConfig.module()).default;
        if (injectionModule && injectionModule.initModule) {
          injectionModule.name = injectionModuleConfig.name;
          let pollingCount = 0;
          if (injectionModuleConfig.stopPolling) {
            injectionModuleConfig.stopPolling();
            injectionModuleConfig.stopPolling = null;
          }
          injectionModuleConfig.stopPolling = startPolling(20, async () => {
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
            if (pollingCount >= 20) {
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
            if (pollingCount >= 50) {
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

async function checkRedirect({data, router, i18n, store, to, from, next}) {
  let result = false;
  result = await checkRedirectExtra({data, router, i18n, store, to, from, next});
  return result;
}

let customizationData = null;
/**
 * 判断是否有注入页面的需求
 * @param data
 * @param router
 * @param store
 * @param to
 * @returns {{count: number, matchedInjectionModuleConfig: null}}
 */
function checkCustomization({data, router, store, to}) {
  if (customizationData) {
    if (customizationData.stopPolling) {
      customizationData.stopPolling();
      customizationData.stopPolling = null;
    }
    customizationData = null;
  }
  const _customizationData = {
    count: 0,
    matchedInjectionModuleConfig: null,
  };
  for (const routeName in injectionRouteView) {
    if (Object.prototype.hasOwnProperty.call(injectionRouteView, routeName)) {
      const moduleConfig = injectionRouteView[routeName];
      if (moduleConfig.stopPolling) {
        moduleConfig.stopPolling();
        moduleConfig.stopPolling = null;
      }
      if (moduleConfig.regex.test(to.path)) {
        if (!_customizationData.matchedInjectionModuleConfig) {
          _customizationData.matchedInjectionModuleConfig = {};
        }
        moduleConfig.css && moduleConfig.css();
        _customizationData.matchedInjectionModuleConfig[routeName] = moduleConfig;
      }
    }
  }
  if (_customizationData.matchedInjectionModuleConfig) {
    _customizationData.count++;
  }
  if (_customizationData.count > 0) {
    customizationData = _customizationData;
  }
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
async function beforeEach({data, router, i18n, store, to, from, next}) {
  if (await checkRedirect({data, router, i18n, store, to, from, next})) {
    return;
  }
  checkCustomization({data, router, store, to});
  if (customizationData && customizationData.count > 0) {
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
    if (customizationData && customizationData.count > 0) {
      if (customizationData.matchedInjectionModuleConfig) {
        getRouteViewVm({
          data,
          router,
          i18n,
          store,
          to,
          matchedInjectionModuleConfig: customizationData.matchedInjectionModuleConfig,
          callback: async vm => {
            customizationData && customizationData.count--;
          },
        });
      }
      let pollingCount = 0;
      customizationData.stopPolling = startPolling(22, async () => {
        pollingCount++;
        if ((customizationData && customizationData.count <= 0) || pollingCount > 50) {
          customizationData = null;
          data.globalLoading.setLoading(false);
          return true;
        }
        return false;
      });
    }
  });
}

async function initRouterGuards({data, router, i18n, store, to, from, next}) {
  const langConfig = {
    [data.platformKeyValue.zhktpt]: {
      zh: ChLanguage_zhktpt,
      en: EnLanguage_zhktpt,
    },
    [data.platformKeyValue.cyktdx]: {
      zh: ChLanguage_cyktdx,
      en: EnLanguage_cyktdx,
    },
  };
  const currentLangConfig = langConfig[data.platform + ''];
  if (currentLangConfig) {
    for (let langKey in data.langKeys) {
      if (Object.prototype.hasOwnProperty.call(currentLangConfig, langKey)) {
        i18n.mergeLocaleMessage(data.langKeys[langKey], currentLangConfig[langKey]);
      }
    }
  }

  await initRouterGuardsExtra({data, router, i18n, store, to, from, next});

  initAfterEach({data, router, i18n, store});

  await beforeEach({data, router, i18n, store, to, from, next});
  data.beforeEach = beforeEach;

  data.ready = true;
}

export {initRouterGuards};

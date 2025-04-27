import EnLanguage_cyktdx from './platform/cyktdx/language/en';
import ChLanguage_cyktdx from './platform/cyktdx/language/zh_cn';
import EnLanguage_zhktpt from './platform/zhktpt/language/en';
import ChLanguage_zhktpt from './platform/zhktpt/language/zh_cn';
import {getRouteVm, startPolling} from './utils';
import './index.scss';
import './extra/index.scss';
import injectionRouteView from './extra/injectionRouteView'
import initExtra from './extra/initExtra';
function isPeiBiaoCustomization({data, router, store, to}) {
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

function beforeEach({data, router, i18n, store, to, from, next}) {
  const {count} = isPeiBiaoCustomization({data, router, store, to});
  if (count > 0) {
    data.globalLoading.setLoading(true);
    next();
  } else {
    data.globalLoading.setLoading(false);
    next();
  }
}

function initAfterEach({data, router, i18n, store}) {
  router.afterEach(async (to, from) => {
    const customization = isPeiBiaoCustomization({data, router, store, to});
    if (customization.count > 0) {
      if (customization.matchedInjectionModule) {
        getRouteVm({
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

async function initPeiBiao({data, router, i18n, store, to, from, next}) {
  await initExtra({data, router, i18n, store, to, from, next})
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

export {initPeiBiao};

// 转义正则表达式中的特殊字符的函数
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $&表示匹配到的子字符串
}

export function startPolling(interval, callback) {
  let pollingId;

  const poll = async () => {
    const stop = await callback(); // 执行回调函数
    clearTimeout(pollingId); // 清除定时器，停止轮询
    pollingId = undefined;
    if (stop) {
      return;
    }
    pollingId = setTimeout(poll, interval); // 设置下一次轮询
  };

  // 开始轮询
  poll();
  // 返回一个停止轮询的函数
  return () => {
    clearTimeout(pollingId); // 清除定时器，停止轮询
    pollingId = undefined;
  };
}

/**
 * 递归查找 $children 中第一个路由视图组件实例
 * @param {Array} children - Vue 组件的 $children 数组
 * @returns {Object|null} - 找到的路由视图组件实例，如果没找到则返回 null
 */
function findFirstRouterViewComponentInChildren(children) {
  if (!children || !children.length) {
    return null;
  }

  // 遍历所有子组件
  for (let i = 0; i < children.length; i++) {
    const child = children[i];

    // 检查当前子组件是否是路由视图组件
    if (
      child.$vnode &&
      child.$vnode.data &&
      (child.$vnode.data.tag === 'router-view' || child.$vnode.data.routerView)
    ) {
      return child;
    }

    // 如果当前子组件不是路由视图组件，递归查找其子组件
    if (child.$children && child.$children.length > 0) {
      const found = findFirstRouterViewComponentInChildren(child.$children);
      if (found) {
        return found;
      }
    }
  }

  // 如果所有子组件都没找到，返回 null
  return null;
}

export function getRouteVm({data, router, i18n, store, to, matchedInjectionModule, callback}) {
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
            if (matchedRoute.instances.default) {
              await updateCount({
                vm: matchedRoute.instances.default,
                injectionModule,
                matchedRoute,
              });
              return true;
            }
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

// export function getLeftNavVm({data, router, i18n, store, to, callback}) {
//   startPolling(20, async () => {
//     const $children =
//       router &&
//       router.app &&
//       router.app.$children &&
//       router.app.$children[0] &&
//       router.app.$children[0].$children;
//     if ($children && $children.length) {
//       for (let i = 0; i < $children.length; i++) {
//         const vm = $children[i];
//         if (vm && vm.$el && vm.$el.classList.contains('left-nav')) {
//           try {
//             const leftNavOneImport = await import('../module/left-nav');
//             const leftNavOne = leftNavOneImport.default;
//             await leftNavOne.initModule({vm, data, router, i18n, store, to});
//           } catch (e) {}
//           callback(vm);
//           return true;
//         }
//       }
//     }
//     return false;
//   });
// }

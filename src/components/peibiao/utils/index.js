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
export function findFirstRouterViewComponentInChildren(children) {
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


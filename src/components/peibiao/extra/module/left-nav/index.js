import './index.scss';
export default {
  initModule: async function ({data, router, i18n, store, to}) {
    return new Promise((resolve, reject) => {
      resolve();
      // let init = true;
      // data.globalLoading.setLoading(true);
      // const appVm = router?.app?.$children[0];
      // if (appVm) {
      //   appVm.$watch(
      //     () => [appVm.hiddenMenu],
      //     async () => {
      //       await appVm.$nextTick();
      //       const navVm = appVm?.$refs?.leftNavRef;
      //       if (navVm) {
      //         if (navVm.$el) {
      //           navVm.$el.classList.add(`pei-biao-global-class-name-left-nav`);
      //           navVm.$el.classList.add(`pei-biao-global-class-name-left-nav-${data.platform}`);
      //         }
      //       }
      //       if (init) {
      //         init = false;
      //         data.globalLoading.setLoading(false);
      //         resolve();
      //       }
      //     },
      //     {immediate: true, deep: true},
      //   );
      // } else {
      //   data.globalLoading.setLoading(false);
      //   resolve();
      // }
      // if (vm) {
      //   if (vm.$el) {
      //     vm.$el.classList.add(`pei-biao-global-class-name-left-nav-one`);
      //     vm.$el.classList.add(`pei-biao-global-class-name-left-nav-one-${data.platform}`);
      //   }
      //   resolve();
      //
      //   // // 获取要观察的目标元素
      //   // const rootEl = vm.$el;
      //   // // 定义隐藏元素的函数
      //   // const hideElements = function (el) {
      //   //   // 遍历所有子元素
      //   //   if (el && el.children) {
      //   //     Array.from(el.children).forEach(child => {
      //   //       // 排除id为data_center和class为user-wrapper的元素
      //   //       if (child.id !== 'data_center' && !child.classList.contains('user-wrapper')) {
      //   //         // 隐藏其他子元素
      //   //         child.style.display = 'none';
      //   //         child.style.opacity = '0';
      //   //       }
      //   //       if (child.children && child.classList.contains('user-wrapper')) {
      //   //         Array.from(child.children).forEach(childChild => {
      //   //           if (
      //   //             !childChild.classList.contains('user-change-role') &&
      //   //             !childChild.classList.contains('blank')
      //   //           ) {
      //   //             // 隐藏其他子元素
      //   //             childChild.style.display = 'none';
      //   //             childChild.style.opacity = '0';
      //   //           }
      //   //         });
      //   //       }
      //   //     });
      //   //   }
      //   // };
      //   //
      //   // // 创建MutationObserver实例
      //   // const observer = new MutationObserver(mutations => {
      //   //   // 当观察到变动时，重新执行隐藏操作
      //   //   hideElements(rootEl);
      //   // });
      //   //
      //   // // 配置观察选项:
      //   // // childList: 观察目标子节点的变动（添加或删除）
      //   // // subtree: 观察所有后代节点的变动
      //   // const config = {childList: true, subtree: true};
      //   //
      //   // let observerReady = false;
      //   // vm.$watch(
      //   //   () => [vm.info, vm.userMenu],
      //   //   async () => {
      //   //     if (
      //   //       vm.info &&
      //   //       vm.userMenu.menu_list &&
      //   //       vm.userMenu.menu_list.length &&
      //   //       !observerReady
      //   //     ) {
      //   //       await vm.$nextTick();
      //   //       // 初次执行隐藏操作
      //   //       hideElements(rootEl);
      //   //       // 开始观察
      //   //       observer.observe(rootEl, config);
      //   //       observerReady = true;
      //   //       resolve();
      //   //     }
      //   //   },
      //   //   {immediate: true, deep: true},
      //   // );
      // } else {
      //   resolve();
      // }
    });
  },
};

import './index.scss';
export default {
  initModule: async function ({vm, data, router, i18n, store, to, injectionModule,matchedRoute}) {
    return new Promise((resolve, reject) => {
      if (vm) {
        if (vm.$el) {
          vm.$el.classList.add(`pei-biao-global-class-name-data-center`);
          vm.$el.classList.add(`pei-biao-global-class-name-data-center-${data.platform}`);
        }
        resolve();
        // vm.$watch(
        //   () => vm.tabList,
        //   async () => {
        //     if (vm.tabList.length) {
        //       await vm.$nextTick();
        //       const tabContainerEl = vm.$el.querySelector('.scroll-style .tabContainer');
        //       const hideElements = function (el) {
        //         // 遍历所有子元素
        //         if (el && el.children) {
        //           Array.from(el.children).forEach(child => {
        //             if (
        //               !child.classList.contains('data_screening') &&
        //               !child.classList.contains('resource_construction')
        //             ) {
        //               // 隐藏其他子元素
        //               child.style.display = 'none';
        //               child.style.opacity = '0';
        //             }
        //           });
        //         }
        //         resolve();
        //       };
        //
        //       // 初次执行隐藏操作
        //       hideElements(tabContainerEl);
        //     }
        //   },
        //   {immediate: true, deep: true},
        // );
      } else {
        resolve();
      }
    });
  },
};

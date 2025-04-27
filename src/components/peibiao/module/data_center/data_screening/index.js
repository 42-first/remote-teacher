import './index.scss';
export default {
  initModule: async function ({vm, data, router, i18n, store, to, injectionModule,matchedRoute}) {
    return new Promise((resolve, reject) => {
      if (vm) {
        if (vm.$el) {
          vm.$el.classList.add(`pei-biao-global-class-name-data-center-data-screening`);
          vm.$el.classList.add(`pei-biao-global-class-name-data-center-data-screening-${data.platform}`);
        }
        resolve();
        // vm.$watch(
        //   () => [vm.isShowIntegrated, vm.isShowCourse, vm.isShowExam, vm.activeName],
        //   async () => {
        //     if ((vm.isShowIntegrated || vm.isShowCourse || vm.isShowExam) && vm.activeName) {
        //       await vm.$nextTick();
        //       const elList = [
        //         vm.$el.querySelector('.father-box .time-list'),
        //         vm.$el.querySelector('.father-box #tab-real_time_exam'),
        //         vm.$el.querySelector('.father-box .term-button'),
        //       ];
        //       for (let i = 0; i < elList.length; i++) {
        //         const el = elList[i];
        //         if (!el) continue;
        //         el.style.display = 'none';
        //         el.style.opacity = '0';
        //       }
        //       resolve();
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

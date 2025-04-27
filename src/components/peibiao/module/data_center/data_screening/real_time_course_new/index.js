import './index.scss';
export default {
  initModule: async function ({vm, data, router, i18n, store, to, injectionModule,matchedRoute}) {
    return new Promise((resolve, reject) => {
      if (vm) {
        if (vm.$el) {
          vm.$el.classList.add(`pei-biao-global-class-name-data-center-data-screening-real-time-course`);
          vm.$el.classList.add(`pei-biao-global-class-name-data-center-data-screening-real-time-course-${data.platform}`);
        }
        resolve();
      } else {
        resolve();
      }
    });
  },
};

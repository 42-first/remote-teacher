import './index.scss';
export default {
  initModule: async function ({vm, data, router, i18n, store, to, injectionModule,matchedRoute}) {
    return new Promise((resolve, reject) => {
      if (vm) {
        if (vm.$el) {
          vm.$el.classList.add(`pei-biao-global-class-name-teaching-content`);
          vm.$el.classList.add(`pei-biao-global-class-name-teaching-content-${data.platform}`);
          if (data.platform === data.platformKeyValue.zhktpt) {
            const tempImg = vm.$el.querySelector('.header > .bg');
            if (tempImg) {
              tempImg.src =
                'https://fe-static-yuketang.yuketang.cn/fe/static/assets/provue/xuetanngcourse-rainclassroom-com-peibiao-1.png';
            }
          }
        }
      }
      resolve();
    });
  },
};

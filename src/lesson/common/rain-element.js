import confirmBox from "./confirm-box";

function destroy() {
  if (this.HandleBar) {
    this.HandleBar.$destroy();
    document.querySelector('#app').removeChild(this.HandleBar.$el);
    this.HandleBar = null;
  }
}

// 确认弹窗
const confirmObj = function(Vue) {
  Vue.prototype.$rainConfirm = function(Options) {
    // 连续多次弹框有bug
    if(this.HandleBar && this.HandleBar.type === 'messagebox') {
      this.HandleBar.close();
      this.HandleBar = null;
    }

    const confirmConstructor = Vue.extend(confirmBox);
    const { data, cancel, confirm } = Options;
    const { id = '' } = data || {}
    const self = this;
    this.HandleBar = new confirmConstructor({
      data: {
        type: 'messagebox',
        ...data,
        id,
      },
      methods: {
        cancel() {
          cancel && cancel();
          destroy.call(self)
        },
        confirm() {
          confirm && confirm();
          destroy.call(self)
        }
      }
    }).$mount();
    document.querySelector('#app').appendChild(this.HandleBar.$el);
  }
}

export { confirmObj as confirm };

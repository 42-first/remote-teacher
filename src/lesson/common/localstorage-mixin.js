/*
 * 学生接收器 本地缓存模块
 * @author: chenzhou
 * @update: 2020.2.6
 * @desc 接口数据缓存，作答结果缓存交互缓存
 * { base: {}, dt: 1580980595192 }
 *
 *
 */

import { isSupported } from '@/util/util'


let localstorageMixin = {
  methods: {
    /*
    * @method 保存数据
    * @params
    */
    setLocalData(name, value) {
      let id = this.lessonID;
      let key = 'yktstudent'+id;

      if(isSupported(localStorage)) {
        try {
          let data = JSON.parse(localStorage.getItem(key)) || {};

          data[name] = value;

          let temp = JSON.stringify(data);
          localStorage.setItem(key, temp);
        } catch(e) {
          console.dir(e);
        }
      }
    },

    /*
     * @method 读取本都存储数据
     * @params
     */
    getLocalData(name) {
      let id = this.lessonID;
      let key = 'yktstudent'+id;
      let value = null;

      if(isSupported(window.localStorage)) {
        let info = JSON.parse(localStorage.getItem(key)) || null;

        if(info && name && info[name]) {
          value = info[name];
        } else {
          value = info;
        }
      }

      return value;
    },

    /*
     * @method 删除本地缓存
     * @params
     */
    delLocalData() {
      let id = this.lessonID;
      let key = 'yktstudent'+id;

      if(isSupported(window.localStorage)) {
        localStorage.removeItem(key)
      }
    },

    /*
     * @method 使用缓存数据恢复接收器
     * @params force: 强制只用缓存
     */
    initByLocalData() {
      // 本地缓存是都存在
      let info = this.getLocalData();

      if(info && info['cards']) {
        this.cards = info['cards'];
      }
    },
  }

}


export default localstorageMixin;

/*
 * 学生接收器 习题
 * @author: chenzhou
 * @update: 2017.6.12
 * @desc
 *
 */


var exerciseMixin = {
  methods: {
    /*
    * @method 保存习题答案
    * @param
    */
    saveAnswer(data) {
      let key = '';
      let value = JSON.stringify(data);

      localStorage.setItem(key, value);
    },

    /*
    * @method 读取答案
    * @param
    */
    getAnswer(key) {
      let value = localStorage.getItem(key);

      return JSON.parse(value);
    }


  }
}


export default exerciseMixin;

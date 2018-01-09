/*
 * 学生接收器 习题
 * @author: chenzhou
 * @update: 2017.6.12
 * @desc
 *
 */

import API from '@/util/api'

var exerciseMixin = {
  methods: {
    /*
    * @method 保存习题答案
    * @param
    */
    saveAnswer(data) {
      let key = 'answer_problem';
      let answerPostList = JSON.parse(localStorage.getItem(key)) || [];

      data.retry_times = data.retry_times + 1;
      answerPostList.push(data);

      let value = JSON.stringify(answerPostList);

      localStorage.setItem(key, value);
    },

    /*
    * @method 读取答案
    * @param
    */
    getAnswer(key) {
      key = key || 'answer_problem';
      let value = localStorage.getItem(key);

      return JSON.parse(value);
    },

    removeAnswer(key) {
      localStorage.removeItem(key);
    },

    /*
    * @method 设置问题状态
    * @param problemID
    */
    setProblemStatus(problemID, data) {
      let cards = this.cards;
      let problem = this.problemMap.get(problemID)
      let card = cards.find((item) => {
        return item.type === 3 && item.problemID === problemID;
      })

      // 处理习题状态 提交过得设置已完成
      card = Object.assign(card, {
        status: '已完成',
        isComplete: true
      })

      problem['Problem']['Result'] = data['result'];
      this.problemMap.set(problemID, problem);

      this.addMessage({ type: 1, message: '第' + card.pageIndex + '页习题已自动提交成功', time: +new Date() });
    },

    /*
    * @method 自动提交习题答案
    * @param
    */
    autoSendAnswers() {
      let self = this;
      let key = 'answer_problem';
      let URL = API.student.RETRY_ANSWER_LESSON_PROBLEM;
      let answerPostList = this.getAnswer(key);

      if(answerPostList && answerPostList.length ) {
        let param = [];
        answerPostList.forEach((item) => {
          param.push({
            'lesson_problem_id': item['lesson_problem_id'],
            'submit_time': item['submit_time'],
            'result': item['result'],
            'retry_times': item['retry_times']
          });
        })

        return request.post(URL, param)
          .then((res) => {
            if(res && res.data) {
              let data = res.data;
              let problemAnswers =  data.problem_answers;

              problemAnswers.forEach((answer, index) => {
                if(answer['status_code'] === 0) {
                  let problemID = answer['lesson_problem_id'];
                  self.setProblemStatus(problemID, param[index]);
                }
              });

              self.removeAnswer(key);

              return problemAnswers;
            }
          })
          .catch(error => {
            // self.removeAnswer(key);
            Raven && Raven.captureMessage("习题提交失败:" + error);
          });
      } else {
        return this;
      }
    }
  }
}


export default exerciseMixin;

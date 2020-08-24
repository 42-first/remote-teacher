/*
 * 学生接收器 习题
 * @author: chenzhou
 * @update: 2017.6.12
 * @desc
 *
 */

import API from '@/util/api'
import { isSupported } from '@/util/util'

var exerciseMixin = {
  methods: {
    /*
    * @method 读取答案
    * @param
    */
    getAnswer(key) {
      key = key || 'answer_problem';
      let value = [];

      if(isSupported(localStorage)) {
        value = localStorage.getItem(key);
        return JSON.parse(value);
      } else {
        return value;
      }
    },

    removeAnswer(key) {
      if(isSupported(localStorage)) {
        localStorage.removeItem(key);
      }
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
        status: this.$i18n.t('done') || '已完成',
        isComplete: true
      })

      problem['problem']['result'] = data['result'];
      this.problemMap.set(problemID, problem);

      this.addMessage({ type: 1, message: this.$i18n.t('autosubmittip', { index: card.pageIndex }), time: +new Date() });
    },

    /*
    * @method 自动提交习题答案
    * @param
    */
    autoSendAnswers() {
      let self = this;
      let key = 'answer_problem';
      let URL = API.lesson.retry_answer_problem;
      let answerPostList = this.getAnswer(key);

      if(answerPostList && answerPostList.length ) {
        let param = [];
        answerPostList.forEach((item) => {
          params.push(item)
        })

        request.post(URL, params).
        then((res)=>{
          if(res && res.code === 0) {
            let successList = res.data.success;
            if(successList) {
              successList.forEach((pid)=>{
                let problem = params.find((item)=>{
                  return item.problemId === pid;
                })

                problem && this.setProblemStatus(pid, problem);
              })

              this.removeAnswer(key);
            }
          }
        }).
        catch(error => {
          console.log('autoSendAnswers:', error);
        })
      }
    }
  }
}


export default exerciseMixin;

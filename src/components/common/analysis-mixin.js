/*
 * @page：答案解析相关辅助方法
 * @author: chenzhou
 * @update: 2018.12.11
 * @desc 主观题客观题对应答案解析和交互
 *
 */


import {mapGetters} from 'vuex'


let analysisMixin = {
  data() {
    return {
      problem: null,
      visibleAnalysis: false
    }
  },
  computed: {
    ...mapGetters([
      'lessonid',
      'pptData'
    ])
  },
  methods: {
    /**
     * method 读取问题详情
     * params id
     */
    getProlemById(id) {
      if(this.pptData && this.pptData.length) {
        let card = this.pptData.find( (silde) => {
          return silde && silde.Problem && id === silde.Problem.ProblemID;
        });

        this.problem = card.Problem;
        // 统一将 Answer 放在Problem下
        if(card.Answer) {
          this.problem.Answer = card.Answer;
        }

        console.info(this.problem);
      }
    },

    /**
     * method 显示答案解析弹层
     * params id
     */
    handleVisibleAnalysis() {
      this.visibleAnalysis = true;
    },

    /**
     * method 关闭答案解析弹层
     * params id
     */
    hideAnalysis() {
      this.visibleAnalysis = false;
    }

  }
}


export default analysisMixin;

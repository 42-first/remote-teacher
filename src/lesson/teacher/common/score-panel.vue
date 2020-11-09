<!-- 打分的分值输入框弹出层 目前被父组件主观题 subjective.vue 引用 -->
<template>
  <div class="mask dontcallback" v-show="!isPanelHidden">
    <div class="pop">
      <div class="con-mask">
        <div class="score-show f14">打分 （本题{{scoreTotal}}分）</div>
        <div class="score-input f18">
          <input type="number" v-model="studentScore" @focus="errorInfo = ''"/>
          <label>分</label>
        </div>
        <div class="error f12">{{errorInfo}}</div>
      </div>
      <div class="button-con f18">
        <div class="cancel" @click = "leave">取消</div>
        <div class="yes" @click = "decide">确定</div>
      </div>
    </div>
  </div>
</template>

<script>

  const errorList = [
    '分数超过本题最大分值，请重新输入',
    '分数最多保留一位小数，请重新输入',
    '所输分数错误，请重新输入'
  ]
  export default {
    name: 'ScorePanel',
    data () {
      return {
        isPanelHidden: true,     // 面板隐藏
        studentScore: -1,        // 学生当前分数
        scoreTotal: '--',        // 当前题目总分
        answerid: -1,            // 当前正在打分的 answer 的 id
        errorInfo: ''
      }
    },
    created () {
      let self = this

      // 父组件呼出本子组件
      self.$on('enter', function (answerid, studentScore, scoreTotal) {
        self.enter(...arguments)
      })

      // 父组件交互成功后隐去本子组件
      self.$on('leave', function () {
        self.leave()
      })
    },
    methods: {
      /**
       * 父组件呼出面板
       *
       * @event bindtap
       * @params {number, number} answerid 将要打分的主观题答案的id, oldFullStars 当前星级
       */
      enter (answerid, studentScore = -1, scoreTotal) {
        let self = this

        self.isPanelHidden = false
        self.answerid = answerid
        self.studentScore = +studentScore === -1 ? scoreTotal : +studentScore
        self.scoreTotal = scoreTotal
      },
      /**
       * 点击空白处或星星决定放弃或星级
       *
       * @event bindtap
       * @param {object} evt event 对象
       */
      leave (evt) {
        let self = this
        
        self.isPanelHidden = true
        self.$emit('cancelScore')
      },
      /**
       * 点击空白处或星星决定放弃或星级
       *
       * @event bindtap
       */
      decide (evt) {
        let self = this

        self.validate() && self.$emit('giveScore', self.answerid, self.studentScore)
      },
      /**
       * 校验输入值是否合法
       *
       */
      validate () {
        let self = this
        let num = Number(self.studentScore)

        if (self.studentScore !== "" && ( num >= 0)) {
            if (num > self.scoreTotal) {
              self.errorInfo = errorList[0]
              return false;
            }
            if (Math.floor(num*10) < num*10) {
              self.errorInfo = errorList[1]
              return false;
            }
        }else {
          self.errorInfo = errorList[2]
          return false;
        }
        return true
      },
    }
  }
</script>

<style lang="scss" scoped>
  @import "~@/style/_variables";
  .mask{
    position: fixed;
    width: 100%;
    height: 100%;
    top:0;
    left:0;
    z-index: 100;
    background: rgba(0,0,0,.4);
    .pop{
      width: 90%;
      min-width: 8.0rem;
      position: absolute;
      background: #fff;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      .con-mask{
        box-sizing: border-box;
        padding: 0.266667rem 0.533333rem;
        .score-show{
          height: 0.533333rem;
          color: #9b9b9b;
          text-align: center;
          width: 100%;
          margin-bottom: 0.266667rem;
        }
        .score-input{
          width: 100%;
          position: relative;
          height: 1.066667rem;
          line-height: 1.066667rem;
          input{
            width: 100%;
            height: 1.066667rem;
            outline: none;
            border: 1px solid #c8c8c8;
            border-radius: 0.213333rem;
            text-align: center;
            color: #333;
          }
          label{
            position: absolute;
            height: 100%;
            color: #9b9b9b;
            top: 0;
            right: 0.106667rem;
          }
        }
        .error{
          color : #ff1010;
          width: 100%;
          height: 0.533333rem;
          line-height: 0.533333rem;
        }
      }
      .button-con{
        display: flex;
        border-top: 1px solid #c8c8c8;
        color: $blue;
        text-align: center;
        width: 100%;
        div{
          flex-basis: 50%;
          height: 1.173333rem;
          line-height: 1.173333rem;
        }
        div.cancel{
          border-right: 1px solid #c8c8c8;
          color: #4a4a4a;
        }
      }
    }
  }
  
</style>

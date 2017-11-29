<!-- 打分的分值输入框弹出层 目前被父组件主观题 subjective.vue 引用 -->
<template>
  <div class="mask" v-show="!isPanelHidden">
    <div class="pop">
      <header>
        <v-touch tag="i" class="iconfont icon-shiti_guanbitouping f25" v-on:tap="leave"></v-touch>
      </header>
      
      <!-- 打分部分 -->
      <section class="fen-box f16">
        <p class="hint">得分 <span class="f12">（本题{{scoreTotal}}分）</span></p>
        <div class="score-input f18">
          <input type="number" v-model="studentScore" @focus="errorInfo = ''"/>
          <label>分</label>
          <div class="error f12">{{errorInfo}}</div>
        </div>
      </section>
      
      <!-- 评语部分 -->
      <section class="remark-box f16">
        <p class="hint">评语</p>
        <textarea v-model="remark" placeholder="请输入评语"></textarea>
        <p class="remark-btns f14">
          <v-touch tag="span" class="remark-itm" v-on:tap="tapRe(0)">写的不错</v-touch>
          <v-touch tag="span" class="remark-itm" v-on:tap="tapRe(1)">继续加油</v-touch>
          <v-touch tag="span" class="remark-itm" v-on:tap="tapRe(2)">想法很独特</v-touch>
          <v-touch tag="span" class="remark-itm" v-on:tap="tapRe(3)">小红花</v-touch>
        </p>
      </section>

      <v-touch class="commit-btn btn" v-on:tap="decide">确定</v-touch>
    </div>
  </div>
</template>

<script>

  const errorList = [
    '分数超过本题最大分值，请重新输入',
    '分数最多保留一位小数，请重新输入',
    '所输分数错误，请重新输入'
  ]

  const reList = [
    '写的不错',
    '继续加油',
    '想法很独特',
    '小红花'
  ]
  export default {
    name: 'ScorePanelV2',
    data () {
      return {
        isPanelHidden: true,     // 面板隐藏
        studentScore: -1,        // 学生当前分数
        scoreTotal: '--',        // 当前题目总分
        answerid: -1,            // 当前正在打分的 answer 的 id
        errorInfo: '',
        remark: '',              // 教师评语
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
       * @params {number} answerid 将要打分的主观题答案的id
       * @params {number} studentScore 当前分值
       * @params {number} scoreTotal 总分
       * @params {Number} index 当前的item的序号
       * @params {String} remark 教师的评语
       */
      enter (answerid, studentScore = -1, scoreTotal, index, remark) {
        let self = this

        self.isPanelHidden = false
        self.answerid = answerid
        self.studentScore = +studentScore === -1 ? scoreTotal : +studentScore
        self.scoreTotal = scoreTotal
        self.remark = remark
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
       * 点击快捷评语按钮
       *
       * @event bindtap
       * @param {Number} idx 快捷评语序号
       */
      tapRe (idx) {
        let self = this
        
        self.remark = reList[idx]
      },
      /**
       * 点击空白处或星星决定放弃或星级
       *
       * @event bindtap
       */
      decide (evt) {
        let self = this

        self.validate() && self.$emit('giveScore', self.answerid, self.studentScore, self.remark)
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
      width: 100%;
      height: 12.106667rem;
      position: absolute;
      background: #fff;
      left: 0;
      bottom: 0;

      header {
        height: 1.333333rem;
        line-height: 1.333333rem;
        padding-left: 0.4rem;
        border-bottom: 1px solid #C8C8C8;
        .iconfont {
          color: #000000;
        }
      }

      .fen-box {
        padding: 0 0.4rem;

        .hint {
          height: 1.386667rem;
          line-height: 1.386667rem;
        }

        .score-input{
          width: 100%;
          position: relative;
          height: 1.6rem;
          line-height: 1.066667rem;
          border-bottom: 1px solid #C8C8C8;

          input{
            width: 3.2rem;
            height: 1.066667rem;
            outline: none;
            border: 1px solid transparent;
            border-radius: 0.213333rem;
            text-align: center;
            background-color: #F8F8F8;
            color: #666666;
          }
          label{
            color: #666666;
          }
        }
        .error{
          color : #ff1010;
          width: 100%;
          height: 0.533333rem;
          line-height: 0.533333rem;
        }
      }

      .remark-box {
        padding: 0 0.4rem;

        .hint {
          height: 1.386667rem;
          line-height: 1.386667rem;
        }

        textarea {
          width: 100%;
          height: 2.28rem;
          padding: 0.133333rem;
          outline: none;
          border: 1px solid transparent;
          border-radius: 0.213333rem;
          background-color: #F8F8F8;
          color: #666666;
        }

        .remark-btns {
          display: flex;
          align-items: center;
          justify-content: space-around;
          padding: 0.266667rem 0;

          .remark-itm {
            height: 0.8rem;
            line-height: 0.8rem;
            padding: 0 0.2rem;
            border: 1px solid #C1C1C1;
            border-radius: 0.4rem;
          }
        }
      }
      
      .commit-btn {
        margin: 0.4rem auto;
        width: 7.733333rem;
        height: 1.173333rem;
        line-height: 1.173333rem;
      }
    }
  }
  
</style>

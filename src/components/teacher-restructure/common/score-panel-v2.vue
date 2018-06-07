<!-- 打分的分值输入框弹出层 目前被父组件主观题 subjective.vue 引用 -->
<template>
  <div id="scoreDom" class="mask" :class="{'animateMobileTextIn': !isPanelHidden, 'animateMobileTextOut': isPanelHidden, 'none': !isSummoned}">
    <div :class="['pop', {'pop-up': isTextFocused, 'not-editting': isScored && !isEditting, 'huping': groupReviewScore != -2}]">
      <header>
        <v-touch tag="i" class="iconfont icon-shiti_guanbitouping f25" v-on:tap="leave"></v-touch>
        <v-touch class="f16 blue" v-on:tap="toEdit" v-show="isScored && !isEditting">
          <i class="iconfont icon-ykq_bianji f20"></i>
          <!-- 修改 -->{{ $t('subjectiveedit') }}
        </v-touch>
        <!-- <div class="f16" v-show="isScored && isEditting">
          <i class="iconfont icon-ykq_bianji f20"></i>
          修改
        </div> -->
      </header>

      <template v-if="!isScored && !isEditting">
        <!-- 打分部分 -->
        <section class="fen-box f14">
          <template v-if="problemGroupReviewId == 0">
            <p class="hint">本题总分{{scoreTotal}}分</p>
            <div class="score-input f18">
              <div class="score-item">
                <label class="f16">教师评分：</label>
                <div class="">
                  <input class="input-place" type="number" v-model="teacherScore" @focus="focusInput" @blur="blurInput('teacherScore')"/>
                  <span class="f18">分</span>
                </div>
                <div class="error f12">{{errorInfo1}}</div>
              </div>
            </div>
          </template>
          <template v-else>
            <p class="hint">
              本题总分{{scoreTotal}}分，互评占比{{groupReviewProportion * 100 }}%，教师占比{{teacherProportion * 100}}%
            </p>
            <p class="finally—score f18">最终得分：{{finallyScore}}</p>
            <div class="score-input f18">
              <div class="score-item">
                <label class="f16">教师评分：</label>
                <div class="">
                  <input class="input-place" type="number" v-model="teacherScore" @focus="focusInput" @blur="blurInput('teacherScore')"/>
                  <span class="f18">分</span>
                </div>
                <div class="error f12">{{errorInfo1}}</div>
              </div>
              <div class="score-item">
                <label class="f16">互评得分：</label>
                <div class="">
                  <input class="input-place" type="number" v-model="groupReviewScore" @focus="focusInput" @blur="blurInput('groupReviewScore')"/>
                  <span class="f18">分</span>
                </div>
                <div class="error f12">{{errorInfo2}}</div>
              </div>
            </div>
          </template>
        </section>

        <!-- 评语部分 -->
        <section class="remark-box f16">
          <textarea class="textarea-place" v-model="remark" :placeholder="$t('quizentercomment')" @focus="focusText" @blur="isTextFocused = false"></textarea>
          <p class="remark-btns f14" v-show="!isScored || (isScored && isEditting)">
            <v-touch tag="span" class="remark-itm" v-on:tap="tapRe(0)"><!-- 写的不错 -->{{ $t('good') }}</v-touch>
            <v-touch tag="span" class="remark-itm" v-on:tap="tapRe(1)"><!-- 继续加油 -->{{ $t('comeon') }}</v-touch>
            <v-touch tag="span" class="remark-itm" v-on:tap="tapRe(2)"><!-- 想法很独特 -->{{ $t('uniqueidea') }}</v-touch>
            <v-touch tag="span" class="remark-itm" v-on:tap="tapRe(3)"><!-- 小红花 -->{{ $t('excellent') }}</v-touch>
          </p>
        </section>

        <v-touch class="commit-btn btn" v-show="!isScored || (isScored && isEditting)" v-on:tap="decide"><!-- 提交 -->{{ $t('submit') }}</v-touch>
        <div class="commit-btn grey-btn btn" v-show="isScored && !isEditting"><!-- 已批改 -->{{ $t('graded') }}</div>
      </template>
      <template v-else>
        <section class="score-result">
          <template v-if="problemGroupReviewId == 0">
            <p class="hint">本题总分{{scoreTotal}}分</p>
            <p class="defen f16"><span class="f40">{{teacherScore}}</span>分</p>
          </template>
          <template v-else>
            <p class="hint">本题总分{{scoreTotal}}分，互评占比{{groupReviewProportion * 100 }}%，教师占比{{teacherProportion * 100}}%</p>
            <div class="result-info">
              <div class="defen f16"><span class="f40">{{teacherScore}}</span>分</div>
              <div class="">
                <p class="f16">教师评分：{{teacherScore}}</p>
                <p class="f16">互评得分：{{groupReviewScore}}</p>
              </div>
            </div>
          </template>
          <div class="gap"></div>
          <div class="remark-box">
            <p v-if="remark" class="f17 c333">{{remark}}</p>
            <p v-else class="f17 c9b">暂无评语</p>
          </div>
        </section>
      </template>

    </div>
  </div>
</template>

<script>

  const errorList = [
    i18n.t('exceedmaximumscore') || '分数超过本题最大分值，请重新输入',
    i18n.t('keepadecimal')       || '分数最多保留一位小数，请重新输入',
    i18n.t('invaildinput')       || '输入无效，请重新输入',
    i18n.t('positivescore')      || '分数必须为正数'
  ]

  const reList = [
    i18n.t('good')       || '写的不错',
    i18n.t('comeon')     || '继续加油',
    i18n.t('uniqueidea') || '想法很独特',
    i18n.t('excellent')  || '小红花'
  ]

  let timer2 = null

  export default {
    name: 'ScorePanelV2',
    data () {
      return {
        isSummoned: false,       // 标记本组件是用户点击呼出的，
        isPanelHidden: true,     // 面板隐藏
        studentScore: -1,        // 学生当前分数
        scoreTotal: '--',        // 当前题目总分
        answerid: -1,            // 当前正在打分的 answer 的 id
        errorInfo1: '',          // 教师评分错误验证
        errorInfo2: '',          // 互评评分错误验证
        remark: '',              // 教师评语
        isScored: false,         // 被评分过
        isEditting: false,       // 被评分过，并且点击了修改按钮
        isTextFocused: false,    // 正在输入评语
        groupReviewScore: -2,    // 互评分数，-1表示没打分, -2表示是个人作答的题目
        teacherScore: 0,        // 教师评分
        finallyScore: '--',      // 最终得分
        teacherProportion: 0,    // 教师评分占比
        groupReviewProportion: 0,  // 互评占比
        problemGroupReviewId: 0,   // 小组互评的id
      }
    },
    created () {
      let self = this

      // 父组件呼出本子组件
      self.$on('enter', function () {
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
      enter (answerid, scoreTotal, teacherScore = 0, groupReviewScore = -2, teacherProportion, groupReviewProportion, index, remark, problemGroupReviewId) {
        let self = this

        self.isPanelHidden = false
        self.isSummoned = true
        self.isScored = +teacherScore !== -1

        self.answerid = answerid
        self.teacherScore = +teacherScore === -1 ? '' : +teacherScore
        self.groupReviewScore = +groupReviewScore === -2 ? -2 :  (+groupReviewScore === -1) ? '' : +groupReviewScore
        self.scoreTotal = scoreTotal
        self.groupReviewProportion = groupReviewProportion
        self.teacherProportion = teacherProportion
        self.problemGroupReviewId = problemGroupReviewId
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

        self.errorInfo1 = ''
        self.errorInfo2 = ''

        self.isPanelHidden = true
        clearTimeout(timer2)
        timer2 = setTimeout(() => {
          self.isSummoned = false
          self.isEditting = false
        }, 400)
      },
      /**
       * 点击分数输入框
       *
       * @event bindtap
       */
      focusInput () {
        let self = this

        self.errorInfo1 = ''
        self.errorInfo2 = ''
        self.isTextFocused = true
      },
      /**
       * 点击分数输入框
       *
       * @event bindtap
       */
      blurInput (score) {
        let self = this

        self.isTextFocused = false
        self.validate(score)
      },
      /**
       * 点击评语输入框
       *
       * @event bindtap
       */
      focusText () {
        let self = this
      },
      /**
       * 点击修改按钮
       *
       * @event bindtap
       */
      toEdit () {
        let self = this

        self.isScored = false
      },
      /**
       * 点击快捷评语按钮
       *
       * @event bindtap
       * @param {Number} idx 快捷评语序号
       */
      tapRe (idx) {
        let self = this

        self.remark += reList[idx]
      },
      /**
       * 点击空白处或星星决定放弃或星级
       *
       * @event bindtap
       */
      decide (evt) {
        let self = this

        self.$emit('giveScore', self.answerid, self.teacherScore, self.groupReviewScore, self.remark)
      },
      /**
       * 校验输入值是否合法
       *
       */
      validate (score) {
        // const errorList = [
        //   '分数超过本题最大分值，请重新输入',
        //   '分数最多保留一位小数，请重新输入',
        //   '输入无效，请重新输入',
        //   '分数必须为正数'
        // ]

        let self = this
        // 处理空字符串 输入纯字母会进入这里
        if (self[score] === "") {
          if(score == 'teacherScore'){
            self.errorInfo1 = errorList[2]
          }else {
            self.errorInfo2 = errorList[2]
          }

          return false;
        }

        // 让 0 通过
        // if (self.studentScore === "0") {
        //   return true;
        // }

        // 处理 '0a' 'ab' '.' 'a' '0.1a' '0.1a' '0.1.1' '045' 等不合法字符
        // 不能错判 '0.1'
        let arr = [...self[score]]
        let len = arr.length
        if (Number.isNaN(+self[score]) || (self[score] >= 1 && arr[0] === '0')) {
          if(score == 'teacherScore'){
            self.errorInfo1 = errorList[2]
          }else {
            self.errorInfo2 = errorList[2]
          }
          return false;
        }

        // Number 测不了0开头的数字 045
        // Number('') // 0
        // Number('0') // 0
        // Number('11.111') // 11.111
        // Number('011') // 11
        // Number('01.1') // 1.1
        // Number('01a') // NaN
        // Number('a') // NaN
        // Number('(a%') // 11
        let num = Number(self[score])

        if (num >= 0) {
            if (num > self.scoreTotal) {
              if(score == 'teacherScore'){
                self.errorInfo1 = errorList[0]
              }else {
                self.errorInfo2 = errorList[0]
              }
              return false;
            }
            if (Math.floor(num*10) < num*10) {
              if(score == 'teacherScore'){
                self.errorInfo1 = errorList[1]
              }else {
                self.errorInfo2 = errorList[1]
              }
              return false;
            }
        }else if (num < 0) {
          if(score == 'teacherScore'){
            self.errorInfo1 = errorList[3]
          }else {
            self.errorInfo2 = errorList[3]
          }
          return false;
        }else {
          if(score == 'teacherScore'){
            self.errorInfo1 = errorList[2]
          }else {
            self.errorInfo2 = errorList[2]
          }
          return false;
        }
        self[score] = '' + num
        return true
      },
    }
  }
</script>

<style lang="scss" scoped>
  @import "~@/style/_variables";
  .mask{
    position: absolute;
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
        display: flex;
        justify-content: space-between;
        align-items: center;
        height: 1.333333rem;
        line-height: 1.333333rem;
        padding: 0 0.4rem;
        border-bottom: 1px solid #C8C8C8;
        .iconfont {
          color: #000000;
        }

        .blue {
          color: $blue;
          .iconfont {
            color: $blue;
          }
        }
      }

      .fen-box {
        padding: 0 0.4rem;

        .hint {
          height: .4rem;
          line-height: .4rem;
          margin: .4rem 0 .8rem;
        }

        .finally—score {
          height: .506667rem;
          line-height: .506667rem;
          margin-bottom: .8rem;
          color: #FEA300;
        }
        .score-input{
          width: 100%;
          position: relative;
          height: 1.746667rem;
          line-height: 1.746667rem;
          // border-bottom: 1px solid #C8C8C8;
          display: flex;
          justify-content: space-between;

          .score-item {
            height: 100%;
            div:first-of-type {
              display: flex;
              justify-content: space-between;
              padding: .293333rem .4rem;
              height: 1.146667rem;
              box-sizing: border-box;
              border-radius: 0.213333rem;
              background: #F8F8F8;
              margin-top: .133333rem;
              width: 4rem;
              align-items: center;

              span {
                color: #9b9b9b;
              }
            }
            .input-place {
              display: block;
              width: 80%;
              height: 100%;
              outline: none;
              border: 1px solid transparent;
              background-color: #F8F8F8;
              color: #333333;
              text-align: left;
            }
            label{
              color: #4A4A4A;
              height: .453333rem;
              line-height: .453333rem;
              display: block;
            }
            .b9 {
              color: #9B9B9B;
            }
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
        margin-top: .8rem;

        .hint {
          height: 1.386667rem;
          line-height: 1.386667rem;
        }

        .textarea-place {
          display: inline-block;
          width: 100%;
          height: 2.28rem;
          padding: 0.133333rem;
          outline: none;
          border: 1px solid transparent;
          border-radius: 0.106667rem;
          background-color: #F8F8F8;
          color: #333333;
          overflow: scroll;
          word-break: break-all;
        }
        .b9 {
          color: #9B9B9B;
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
        width: 5.333333rem;
        height: 1.173333rem;
        line-height: 1.173333rem;
        border-radius: .76rem;
        box-shadow: 0 .106667rem .186667rem 0 rgba(80,150,245,.4);
      }
      .grey-btn {
        background-color: #9D9D9D;
      }

      .score-result {
        padding: 0 0.4rem;

        .hint {
          height: .4rem;
          line-height: .4rem;
          margin: .4rem 0 .8rem;
        }
        .defen {
          color: #FEA300;
          min-height: 1.093333rem;
          text-align: center;

          span {
            display: inline-block;
          }
        }

        .result-info {
          display: flex;
          justify-content: space-around;
          height: 1.173333rem;
          align-items: center;
          position: relative;

          &::after {
            position: absolute;
            content: "";
            width: 1px;
            height: 1.066667rem;
            background: #eee;
            top: 50%;
            left: 3.866667rem;
            transform: translateY(-50%);
          }

          .defen {
            color: #FEA300;
            min-height: 1.093333rem;
            text-align: center;

            span {
              display: inline-block;
            }
          }
          p {
            color: #333;
            line-height: .453333rem;
          }

          p:last-of-type {
            margin-top: .266667rem;
          }
        }

        .gap {
          width: 100%;
          height: .026667rem;
          background: #eee;
          margin-top: .8rem;
          margin-bottom: .4rem;
        }

        .remark-box {
          .c333 {
            color: #333;
          }

          .c9b {
            color: #9b9b9b;
          }
        }
      }

    }

    .huping {
      height: 13.466667rem;
    }

    .pop-up {
      top: 1.0rem;
    }

    .not-editting {
      height: 10.0rem;
    }
  }

  [data-dpr="1"] .input-place::placeholder {
    font-size: 16px;
  }
  [data-dpr="2"] .input-place::placeholder {
      font-size: 32px;
  }
  [data-dpr="3"] .input-place::placeholder {
    font-size: 48px;
  }

  .none {
    display: none;
  }

  //参考微信文字淡入http://weread.qq.com/
  @keyframes animateMobileTextIn {
      0% {
          transform: scale(0.5, 0.5) translateY(100%);
          opacity: 0;
      }
      90% {
          opacity: 1;
      }
      100% {
          transform: scale(1, 1) translateY(0);
          opacity: 1;
      }
  }
  .animateMobileTextIn {
      -webkit-animation: animateMobileTextIn 0.4s;
      animation: animateMobileTextIn 0.4s;
  //    -webkit-animation-fill-mode: forwards;
  //    animation-fill-mode: forwards;
      -webkit-animation-timing-function: ease;
      animation-timing-function: ease;
  }
  @keyframes animateMobileTextOut {
      0% {
          transform: scale(1, 1) translateY(0);
          opacity: 1;
      }
      90% {
          opacity: 0;
      }
      100% {
          transform: scale(0.5, 0.5) translateY(100%);
          opacity: 0;
      }
  }
  .animateMobileTextOut {
      -webkit-animation: animateMobileTextOut 0.4s;
      animation: animateMobileTextOut 0.4s;
      -webkit-animation-fill-mode: forwards;
      animation-fill-mode: forwards;
      -webkit-animation-timing-function: ease;
      animation-timing-function: ease;
  }

</style>

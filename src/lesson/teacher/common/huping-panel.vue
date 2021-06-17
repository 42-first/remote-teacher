<!-- 打分的分值输入框弹出层 目前被父组件主观题 subjective.vue 引用 -->
<template>
  <div class="mask hupingPanel" :class="{'animateMobileTextIn': !isHupingPanelHidden, 'animateMobileTextOut': isHupingPanelHidden, 'none': !isSummoned}">
    <div class="container_box" :class="group_review_id ? 'smallBox' : ''">
      <header>
        <v-touch tag="i" class="iconfont icon-shiti_guanbitouping f25" v-on:tap="leave"></v-touch>
        <v-touch v-if="!group_review_id" class="blue f17" v-on:tap="submit"><!-- 发起互评 -->{{$t('grading.faqihuping')}}</v-touch>
      </header>
      <section class="huping_content">
        <template v-if="!group_review_id">
          <div class="proportion-box">
            <div class="score-box">
              <div class="score student">
                <p class="f16"><span class="f36">{{parseInt(group_review_proportion)}}</span>%</p>
                <p class="f14"><!-- 互评分数占比 -->{{$t('grading.scoreofpeergrading')}}</p>
              </div>
              <div class="score teacher">
                <p class="f16"><span class="f36">{{parseInt(teacher_score_proportion)}}</span>%</p>
                <p class="f14"><!-- 教师分数占比 -->{{$t('grading.scoreofteachergrading')}}</p>
              </div>
            </div>
            <div class="range-box">
              <mt-range v-model="group_review_proportion" :min="0" :max="100" :step="1" :bar-height="8">
                <div class="start" slot="start"> </div>
                <div class="end" slot="end"> </div>
              </mt-range>
            </div>
          </div>
          <div class="gap"></div>
          <div class="scale-of-marks">
            <div class="score-point">
              <h1 class="f20"><!-- 评分要点 -->{{$t('grading.pointsofgrading')}}</h1>
              <textarea class="textarea-place f15" v-model="review_declaration" maxlength="100" :placeholder="$t('grading.textareaplaceholder')" @focus="focusText" @blur="isTextFocused = false"></textarea>
            </div>
            <div class="score-rules">
              <h1 class="f20"><!-- 互评规则 -->{{$t('grading.hupingguize')}}</h1>
              <ul>
                <li class="f12" v-html="$t('grading.rule1')"></li>
                <li class="f12"><i>＊</i> <!-- 各组之间相互匿名 -->{{$t('grading.rule2')}}</li>
                <li class="f12"><i>＊</i> <!-- 教师可随时修改互评占比或者直接修改总得分 -->{{$t('grading.rule3')}}</li>
              </ul>
            </div>
            <!-- <v-touch class="btn-submit f18" v-on:tap="submit">发起互评{{$t('grading.faqihuping')}}</v-touch> -->
            <!-- <v-touch class="btn-cancel f15" v-on:tap="leave">取消{{$t('grading.cancel')}}</v-touch> -->
          </div>
        </template>
        <template v-else>
          <div class="proportion-box check_box">
            <div class="score-box">
              <div class="score student">
                <p class="f16"><span class="f36">{{parseInt(gProportion)}}</span>%</p>
                <p class="f14"><!-- 互评分数占比 -->{{$t('grading.scoreofpeergrading')}}</p>
              </div>
              <div class="score teacher">
                <p class="f16"><span class="f36">{{parseInt(teacher_score_proportion)}}</span>%</p>
                <p class="f14"><!-- 教师分数占比 -->{{$t('grading.scoreofteachergrading')}}</p>
              </div>
            </div>
            <div class="range-box" v-if="false">
              <mt-range disabled v-model="gProportion" :min="0" :max="100" :step="1" :bar-height="8">
                <div class="start" slot="start"> </div>
                <div class="end" slot="end"> </div>
              </mt-range>
            </div>
            <v-touch v-if="false" class="btn-submit f18" :class="group_review_id && changed ? 'disabled': ''" v-on:tap="save"><!-- 保存 -->{{$t('grading.save')}}</v-touch>
            <v-touch v-if="false" class="btn-cancel f15" v-on:tap="leave"><!-- 取消 -->{{$t('grading.cancel')}}</v-touch>
          </div>
          <div class="gap"></div>
          <div class="scale-of-marks">
            <div class="score-point" v-if="group_review_declaration">
              <h1 class="f20"><!-- 评分要点 -->{{$t('grading.pointsofgrading')}}</h1>
              <p class="f15 point">{{group_review_declaration}}</p>
            </div>
            <div class="score-rules">
              <h1 class="f20"><!-- 互评规则 -->{{$t('grading.hupingguize')}}</h1>
              <ul>
                <li class="f12" v-html="$t('grading.rule1')"></li>
                <li class="f12"><i>＊</i> <!-- 各组之间相互匿名 -->{{$t('grading.rule2')}}</li>
                <li class="f12"><i>＊</i> <!-- 教师可随时修改互评占比或者直接修改总得分 -->{{$t('grading.rule3')}}</li>
              </ul>
            </div>
          </div>
        </template>
      </section>
    </div>
    


  </div>
</template>

<script>
  import 'mint-ui/lib/range/style.css'
  import { Range } from 'mint-ui';
  Vue.component(Range.name, Range);

  export default {
    name: 'HupingPanel',
    data () {
      return {
        isHupingPanelHidden: true,
        isSummoned: false,
        group_review_proportion: 100,
        review_declaration: '',
        group_review_id: 0,
        gProportion: 100,
        group_review_declaration: '',
        changed: true
      }
    },
    created () {
      let self = this

      // 父组件呼出本子组件
      self.$on('enterHuping', function () {
        self.enter(...arguments)
      })

      // 父组件交互成功后隐去本子组件
      self.$on('leaveHuping', function () {
        self.leave()
      })
    },
    computed: {
      teacher_score_proportion() {
        if(this.group_review_id){
          return 100 - this.gProportion
        }else {
          return 100 - this.group_review_proportion
        }
      },
    },
    watch: {
      // review_declaration(newVal, oldVal) {
      //   if(newVal && newVal.length > 100) {
      //     let len = this.getLength(newVal);
      //     if(len > 100) {
      //       this.review_declaration = newVal.substr(0, 100);
      //     }
      //   }
      // },
      gProportion(newVal, oldVal){
        if(newVal != this.$parent.gProportion){
          this.changed = false
        }
      },
    },
    methods: {
      /**
       * 父组件呼出面板
       *
       * @event bindtap
       * @params {number, number} group_review_id 互评id
       * @params {number, number} tProportion 教师占比
       * @params {number, number} gProportion 互评占比
       * @params {string, string} group_review_declaration 评分要点
       *
       */
      enter (group_review_id, tProportion, gProportion, group_review_declaration) {
        let self = this

        self.isHupingPanelHidden = false
        self.isSummoned = true
        self.group_review_id = group_review_id
        self.gProportion = gProportion
        self.group_review_declaration = group_review_declaration
      },

      leave() {
        let self = this

        self.isHupingPanelHidden = true
        self.isSummoned = false
        self.changed = true
      },

      /*
       * 发起互评
       */
      submit (evt) {
        let self = this
        let teacher_score_proportion = self.teacher_score_proportion
        let group_review_proportion = self.group_review_proportion
        self.changed = true
        self.$emit('giveHuping', teacher_score_proportion, group_review_proportion, self.review_declaration)
      },
      /*
       * 修改占比
       */
      save(){
        let self = this
        let teacher_proportion = self.teacher_score_proportion
        if(self.changed) return
        self.changed = true
        self.$emit('editHuping', teacher_proportion)
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
       * 获取字节长度
       */
        getLength(str) {
         let result = 0;
         let length = str.length;
         while (length--) {
           if (/^[\u0000-\u00ff]$/.test(str.charAt(length))) {
             result += 1;
           } else {
             result += 2;
           }
         }

         return result;
        },
        openModal() {
          ModalHelper.afterOpen();
        },
        closeModal() {
          ModalHelper.beforeClose();
        } 
    }
  }
</script>

<style lang="scss" scoped>
  @import "~@/style/_variables";
  .hupingPanel {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,.75);
    overflow: hidden;
    z-index: 199;
    
    .container_box {
      width: 100%;
      max-height: 90%;
      position: absolute;
      background: #fff;
      bottom: 0;
      left: 0;
      overflow: hidden;
      &.smallBox {
        max-height: 72.88%;
        .huping_content {
          max-height: 10.36rem;
          overflow: auto;
        }
      }
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

        // .blue {
        //   color: $blue;
        //   .iconfont {
        //     color: $blue;
        //   }
        // }
      }
      .huping_content {
        width: 100%;
        height: 13.13333333rem;
        overflow: auto;
        .proportion-box {
          width: 100%;
          height: 4.6rem;
          padding-top: .8rem;
          &.check_box {
            height: 3.6rem;
            display: flex;
            align-items: center;
            justify-content: space-around;
            padding: 0;
          }

          .score-box {
            display: flex;
            justify-content: space-around;
            align-items: center;
            position: relative;
            width: 100%;
            &::after {
              position: absolute;
              content: "";
              width: 1px;
              height: 1.333333rem;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              background: #eee;
            }

            .score {
              text-align: center;

              p:last-of-type {
                color: #333;
              }
            }

            .student p:first-of-type {
              color: #FEA300;
            }

            .teacher p:first-of-type {
              color: #5096F5;
            }
          }

          .range-box {
            margin: .96rem auto 0;
            text-align: center;
            width: 7.733333rem;
          }
        }
        .edit-box {
          height: 8.066667rem;
          .btn-submit {
            width: 5.333333rem;
            height: 1.173333rem;
            border-radius: .76rem;
            box-shadow: 0 .106667rem .186667rem 0 rgba(80,150,245,.4);
            margin: 1.466667rem auto .533333rem;
            text-align: center;
            line-height: 1.173333rem;
            color: #fff;
            background: #5096F5;
          }

          .disabled {
            background: #E5E5E5;
            color: #9b9b9b;
            box-shadow: none;
          }
          .btn-cancel {
            color: #5096F5;
            font-weight: bold;
            text-decoration: underline;
            margin: 0 auto;
            text-align: center;
          }
        }

        .gap {
          width: 100%;
          height: .133333rem;
          background: #F8F8F8;
        }

        .scale-of-marks {
          padding: .533333rem .533333rem .786667rem;

          h1 {
            color: #333;
            font-weight: bold;
            line-height: 0.56rem;
          }

          .score-point {
            .textarea-place {
              margin-top: .4rem;
              display: inline-block;
              width: 100%;
              height: 2.66666667rem;
              padding: 0.133333rem;
              outline: none;
              border: 2px solid #E5E5E5;
              background-color: #fff;
              color: #333333;
              overflow: scroll;
              word-break: break-word;
            }
            .point {
              color: #333;
              margin-top: 0.266667rem;
            }
          }

          .score-rules {
            margin-top: 0.53333333rem;
            padding-bottom: 0.26666667rem;
            ul {
              margin-top: .4rem;

              li {
                color: #9b9b9b;
              }
              i, span {
                color: #FEA300;
                font-style: normal;
              }
            }
          }

          .btn-submit {
            width: 5.333333rem;
            height: 1.173333rem;
            border-radius: .76rem;
            box-shadow: 0 .106667rem .186667rem 0 rgba(80,150,245,.4);
            margin: .84rem auto .533333rem;
            text-align: center;
            line-height: 1.173333rem;
            color: #fff;
            background: #5096F5;
          }

          .btn-cancel {
            color: #5096F5;
            font-weight: bold;
            text-decoration: underline;
            margin: 0 auto;
            text-align: center;
          }
        }
      }
    }
    


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
<style lang="scss">
.container_box {
  .mt-range {
    height: 8px !important;
    line-height: 8px !important;
  }
  .mt-range-progress {
    background: #FEA300 !important;
  }
  .mt-range-runway {
    border-top-color: #5096F5 !important;
  }
  .mt-range-thumb {
    width: .933333rem !important;
    height: .933333rem !important;
    background: url(~images/teacher/range-thumb2.png)no-repeat 0 0/contain;
    box-shadow: 0 .04rem .16rem 0 rgba(0,0,0,.3) !important;
    top: 50% !important;
    transform: translateY(-50%);
  }
  .start {
    width: .133333rem;
    background: #FEA300;
    border-top-left-radius: .053333rem !important;
    border-bottom-left-radius: .053333rem !important;
  }
  .end {
    width: .8rem;
    background: #5096F5;
    border-top-right-radius: .053333rem !important;
    border-bottom-right-radius: .053333rem !important;
    margin-left: 20px;
  }
  .mt-range-content {
    margin-right: 0;
  }

  .score-rules i, .score-rules span {
    color: #FEA300;
    font-style: normal;
  }
}

body.modal-open {
    position: fixed;
    width: 100%;
}
</style>

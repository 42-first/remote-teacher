/*
 * @page：习题答案解析页面
 * @author: chenzhou
 * @update: 2018.12.11
 * @desc 主观题客观题对应答案解析和交互
 *
 */

<template>
  <section class="analysis__page">
    <!-- 问题内容 -->
    <section class="problem__content" v-if="slide" >
      <p class="page-no f12"><span>{{ $t('pno', { number: slide.Index }) }}</span></p>
      <img class="cover" :src="slide.Cover" :data-src="slide.Cove" @click="handlePreviewImage" alt="雨课堂,习题解析" />
    </section>

    <!-- 客观题 问题选项 -->
    <section class="analysis__answer" v-if="problemType === 'MultipleChoice' || problemType === 'MultipleChoiceMA' || problemType === 'Polling'">
      <header class="answer__header f20"><!-- 我的答案 -->{{ $t('myanswer') }}</header>
      <ul class="exercise__options" v-if="result">
        <li :class="['options-item', 'f45', problemType, pollingCount === 1 ? 'MultipleChoice': '']" v-for="item in options">
          <p :class="['options-label', item.selected ? 'selected' : '' ]" :data-option="item.Label">{{ item.Label }}</p>
        </li>
      </ul>
      <div class="noanswered f17" v-else><!-- 未作答 -->{{ $t('weizuoda') }}</div>
    </section>

    <!-- 填空题 选项 -->
    <section class="analysis__answer" v-if="problemType === 'FillBlank'">
      <header class="answer__header f20"><!-- 我的答案 -->{{ $t('myanswer') }}</header>
      <ul class="blanks__options" >
        <li class="blank__item f14 mb10" v-for="(item, index) in blanks" >
          <div class="blank__order">{{ index + 1 }}</div>
          <p class="blank__input f17" v-if="result && result[index + 1]">{{ result[index + 1] }}</p>
          <p class="blank__input f17" v-else><!-- 未作答 -->{{ $t('weizuoda') }}</p>
        </li>
       </ul>
    </section>

    <!-- 主观题内容 -->
    <section class="analysis__answer" v-if="problemType === 'ShortAnswer'">
      <header class="answer__header f20"><!-- 我的答案 -->{{ $t('myanswer') }}</header>
      <div class="subjective__answer" v-if="result&&(result.content || result.pics&&result.pics.length)">
        <div class="answer__inner">
          <p class="answer--text f17">{{ result.content }}</p>
          <div class="answer--image" v-if="result.pics.length && result.pics[0].pic">
            <img class="" :src="result.pics[0].pic" :data-src="result.pics[0].pic" alt="主观题作答图片" @click="handlePreviewImage" />
          </div>
        </div>
        <!-- 打分显示 -->
        <div class="answer-score" v-if="getScore !== -1">
          <i class="iconfont blue icon-ykq_dafen f18"></i>
          <span class="lable f15" >{{ $t('stuscore') }}: <!-- {{getScore}}分 -->{{ $t('getpoint', { score: getScore }) }}</span>
        </div>
      </div>
      <div class="noanswered f17" v-else><!-- 未作答 -->{{ $t('weizuoda') }}</div>
    </section>

    <!-- 解析内容 -->
    <section class="analysis__answer" v-if="hasRemark">
      <header class="answer__header f20"><!-- 答案解析 -->{{ $t('answerkey') }}</header>
      <!--  -->
      <section class="analysis__wrap">
        <analysis :problem.sync="oProblem"></analysis>
      </section>
    </section>

  </section>
</template>
<script>
  import API from '@/util/api'
  import { isSupported } from '@/util/util'

  export default {
    name: 'problem-analysis-page',
    data() {
      return {
        index: 0,
        problemID: 0,
        title: '习题',
        card: null,
        slide: null,
        // 问题类型 单选 多选 投票 填空 主观题
        problemType: '',
        hasRemark: true,
        oProblem: null,
        options: null,
        // 填空题填空列表
        blanks: [],
        // 作答结果
        result: {},
        // 主观题得分
        getScore: -1,
      };
    },
    components: {
      analysis: () => import('@/components/common/analysis.vue'),
    },
    computed: {
    },
    watch: {
    },
    filters: {
    },
    mixins: [],
    methods: {
      /*
      * @method 初始化习题页面
      * @param problemID 问题ID
      */
      init(problemID) {
        console.info(this.$parent.problemMap);

        this.problemID = problemID;
        this.slide = this.$parent.problemMap.get(problemID);
        this.oProblem = this.slide && this.slide['Problem'];
        // 问题类型
        this.problemType = this.oProblem['Type'];

        // 根据问题类型组织对应的数据结构
        this.formatData(this.oProblem);

        // 作答结果
        this.getProblemResult();
      },

      /*
       * @method 根据问题类型整理数据结构
       * @param problem
       */
      formatData(problem) {
        let problemType = problem['Type'];
        this.result = problem['Result'];
        this.hasRemark = problem['HasRemark']

        if(problemType) {
          switch (problemType) {
            case 'ShortAnswer':
              console.info('主观题')

              this.getScore = problem.getScore;
              break;
            case 'FillBlank':
              console.info('填空题')
              this.blanks = problem['Blanks'];
              break;
            case 'MultipleChoice':
            case 'MultipleChoiceMA':
            case 'Polling':
              console.info('客观题')
              problemType === 'Polling' && (this.pollingCount = parseInt(problem['Answer'], 10));
              this.options = problem['Bullets'];

              this.result && this.result.split('').forEach((option) => {
                this.setOptions(option, true, true);
              });

              break;
            default:
              // statements_def
              break;
          }

        }

      },

      /*
       * @method 设置答案选项是否选中
       * @param option: 选项
       *        isSelected: 是否选中
       *        multi: 是否多选
       */
      setOptions(option, isSelected, multi) {
        let options = this.options;

        options = options.map( (element, index) => {
          if(!isSelected) {
            // 取消
            element.Label === option && (element.selected = isSelected);
          } else {
            if(multi) {
              // 多选
              element.Label === option && (element.selected = isSelected);
            } else {
              // 单选
              if(element.Label === option) {
                element.selected = isSelected;
              } else {
                element.selected = false;
              }
            }
          }

          return element;
        });

        this.options = options;
      },

      /*
       * @method 作答解析详情
       */
      getProblemResult() {
        let problemID = this.problemID;
        let URL = API.student.GET_PROBLEM_RESULT;
        let param = {
          'problem_id': problemID,
          'lesson_id': this.lessonID
        }

        request.get(URL, param)
        .then((res) => {
          if(res && res.data) {
            let data = res.data;

            // 客观题
            data.answer && (this.oProblem.Answer = data.answer);
            // 填空题
            this.result = data.result
            // 主观题
            if(this.problemType === 'ShortAnswer' || this.problemType === 'FillBlank') {
              this.result = data.subj_result
            }
            this.getScore = data.result_score;
          }
        })
        .catch(error => {
        });

      },

      /*
       * @method 预览图片
      */
      handlePreviewImage(evt) {
        let targetEl = evt.target;
        let src = targetEl.dataset.src || targetEl.src;

        typeof wx !== 'undefined' && wx.previewImage({
          current: src, // 当前显示图片的http链接
          urls: [ src ] // 需要预览的图片http链接列表
        });

      },

    },
    created() {
      this.index = +this.$route.params.index;
      this.lessonID = +this.$route.params.lessonID;
      let cards = this.$parent.cards;
      this.card = cards[this.index];

      if(this.card) {
        let problemID = this.card.problemID;
        this.init(problemID);
      } else {
        setTimeout(()=>{
          let cards = this.$parent.cards;
          this.card = cards[this.index];
          let problemID = this.card.problemID;
          this.init(problemID);
        }, 1500)
      }
    },
    mounted() {
    },
    beforeDestroy() {
    }
  };
</script>

<style lang="scss" scoped>

  /*------------------*\
    $ 习题详情页
  \*------------------*/

  .analysis__page {
    z-index: 2;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;

    background: #eee;

    overflow-y: scroll;
    -webkit-overflow-scrolling: touch;
  }



  /*------------------*\
    $ 习题内容
  \*------------------*/

  .problem__content {
    position: relative;
    margin: 0.4rem 0 0;
    // padding-bottom: 0.4rem;


    border-top: 1px solid #C8C8C8;
    overflow: hidden;
    .page-no {
      position: absolute;
      top: 0;
      right: 0;

      padding: 0 0.306667rem;
      height: 0.666667rem;
      line-height: 0.666667rem;
      color: #fff;

      background: rgba(0,0,0,0.5);
    }

    .cover {
      display: block;
      width: 100%;

      box-shadow: 0 0 4px rgba(0,0,0,0.2);
    }
  }



  /*------------------*\
    $ 客观题选项
  \*------------------*/

  .exercise__options {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    flex-wrap: wrap;

    padding: 0.7rem 0.453333rem 0;

    .options-item {
      padding: 0.1rem 0;
      width: 25%;

      .options-label {
        margin: 0 auto;
        width: 1.6rem;
        height: 1.6rem;

        line-height: 1.6rem;

        color: #fff;
        font-weight: lighter;
        cursor: pointer;

        background: #C8C8C8;
        /*border-radius: 50%;*/
      }

      .options-label.selected {
        background: linear-gradient(to bottom, #28CF6E, #5CA9E4);
      }
    }

    .options-item.MultipleChoice .options-label {
      border-radius: 50%;
    }
  }


  /*------------------*\
    $ 填空选项
  \*------------------*/

  .analysis__answer {
    margin-top: 0.266667rem;
    padding: 0.533333rem 0;

    background: #fff;
  }

  .answer__header {
    padding-left: 0.293333rem;
    height: 0.746667rem;
    border-left: 0.16rem solid #639EF4;
    font-weight: bold;
    text-align: left;
  }

  .blanks__options {
    padding: 0.533333rem;
  }

  .blank__item {
    display: flex;
    min-height: 1.066667rem;
  }

  .blank__order {
    display: flex;
    justify-content: center;
    align-items: center;

    width: 1.066667rem;
    min-height: 1.066667rem;
    font-weight: bold;
    color: #5096F5;
    border: 2px solid #5096F5;
    border-radius: 0.106667rem 0 0 0.106667rem;
  }

  .blank__input {
    flex: 1;
    padding: 0.133333rem;
    min-height: 1.066667rem;
    line-height: 1.5;
    text-align: left;
    box-sizing: border-box;
    border: 2px solid #eee;
    border-left: none;
    border-radius: 0 0.106667rem 0.106667rem 0;
  }

  .analysis__wrap {
    padding-left: 0.533333rem;
  }



  /*------------------*\
    $ 作答完成预览
  \*------------------*/

  .subjective__answer {
    margin-bottom: 1.066667rem;
    padding: 0.333333rem 0.4rem;
    color: #333;
    background: #fff;

    .answer__inner {
      padding: 0 0.2rem 0.4rem;
      border-bottom: 1px solid #C8C8C8;
    }

    .answer--text {
      text-align: left;
      word-wrap: break-word;
    }

    .answer--image {
      padding-top: 0.266667rem;
      img {
        display: block;
        width: 6.933333rem;
        max-width: 100%;
      }
    }

    .answer-score {
      padding: 0.266667rem 0.2rem 0;
      color: #9B9B9B;
      text-align: left;

      .lable {
        vertical-align: 0.066667rem;
      }

      .iconfont {
        color: #F5A623;
      }

      .iconfont.blue {
        color: #639EF4;
      }
    }

  }

  .noanswered {
    padding: 0.333333rem 0;
  }


</style>


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
      <img class="cover" :src="slide.cover" :data-src="slide.cover" @click="handlePreviewImage" alt="雨课堂,习题解析" />
    </section>

    <!-- 客观题 问题选项 -->
    <section class="analysis__answer" v-if="problemType === 1 || problemType === 2 || problemType === 3">
      <header class="answer__header f20"><!-- 我的答案 -->{{ $t('myanswer') }}</header>
      <ul class="exercise__options" v-if="result">
        <li :class="['options-item', 'f45', problemType === 1 || pollingCount === 1 ? 'MultipleChoice': '']" v-for="item in options">
          <p :class="['options-label', item.selected ? 'selected' : '' ]" :data-option="item.label">{{ item.label }}</p>
        </li>
      </ul>
      <div class="noanswered f17" v-else><!-- 未作答 -->{{ $t('weizuoda') }}</div>
    </section>

    <!-- 填空题 选项 -->
    <section class="analysis__answer" v-if="problemType === 4">
      <header class="answer__header f20"><!-- 我的答案 -->{{ $t('myanswer') }}</header>
      <ul class="blanks__options" >
        <li class="blank__item f14 mb10" v-for="(item, index) in blanks" >
          <div class="blank__order">{{ index + 1 }}</div>
          <p class="blank__input f17" v-if="result && result[index]">{{ result[index] }}</p>
          <p class="blank__input f17" v-else><!-- 未作答 -->{{ $t('weizuoda') }}</p>
        </li>
       </ul>
    </section>

    <!-- 主观题内容 -->
    <section class="analysis__answer" v-if="problemType === 5">
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
  import { mapState, mapActions } from 'vuex'

  import API from '@/util/api'
  import { isSupported } from '@/util/util'

  export default {
    name: 'problem-analysis',
    data() {
      return {
        index: 0,
        problemID: 0,
        title: '习题',
        card: null,
        slide: null,
        pollingCount: 0,
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
      analysis: () => import('@/lesson/common/analysis.vue'),
    },
    computed: {
      // 使用对象展开运算符将 getter 混入 computed 对象中
      ...mapState([
        'lesson',
        'cards',
      ]),
    },
    watch: {
      '$route' (to, from) {
        if(to && to.params && to.name === 'analysis') {
          let params = to.params;
          this.index = params.index

          setTimeout(()=>{
            let cards = this.cards;
            this.card = cards[this.index];
            let problemID = this.card.problemID;
            this.init(problemID);
          }, 1000)
        }
      },
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
        this.problemID = problemID;
        this.slide = this.$parent.$parent.problemMap.get(problemID);
        this.oProblem = this.slide && this.slide['problem'];
        // 问题类型
        this.problemType = this.oProblem['problemType'];

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
        let problemType = problem['problemType'];
        this.result = problem['result'];
        // this.hasRemark = problem['hasRemark']

        if(problemType) {
          switch (problemType) {
            case 5:
              console.info('主观题')

              this.getScore = problem.getScore;
              break;
            case 4:
              console.info('填空题')
              this.blanks = problem['blanks'];
              break;
            case 1:
            case 2:
            case 3:
              console.info('客观题')
              problemType === 3 && (this.pollingCount = problem['pollingCount']);
              // 4.0和以后版本兼容下
              let options = problem['bullets'] || problem['options'];
              if(options && options.length) {
                options.forEach((item)=>{
                  item.label = item.label || item.key;
                })
              }
              this.options = options;

              this.result && this.result.forEach((option) => {
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
            element.label === option && (element.selected = isSelected);
          } else {
            if(multi) {
              // 多选
              element.label === option && (element.selected = isSelected);
            } else {
              // 单选
              if(element.label === option) {
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
        let URL = API.lesson.get_problem_answer;
        let param = {
          'problem_id': problemID
        };

        request.get(URL, param)
        .then((res) => {
          if(res && res.code === 0 && res.data) {
            let data = res.data;

            // 客观题
            if(data.answer && this.problemType !== 5) {
              data.Answer = data.answer.join(',');
            }

            // 主观题
            if(this.problemType === 5 && typeof data.score !== 'undefined') {
              this.getScore = data.score > 0 ? data.score/100 : data.score;
            }

            this.oProblem = Object.assign({}, this.oProblem, data);

            console.log(this.oProblem);
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
      this.lessonID = this.$route.params.lessonID;
      let cards = this.cards;
      this.card = cards[this.index];

      if(this.card) {
        let problemID = this.card.problemID;
        this.init(problemID);
      } else {
        setTimeout(()=>{
          let cards = this.cards;
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
    position: relative;


    display: flex;
    flex-direction: column;

    margin: 0 auto;

    width: 375px;
    // height: 667px;
    height: 100%;

    background: #eee;
    border: 2px solid #eee;

    overflow-y: scroll;
    -webkit-overflow-scrolling: touch;
  }



  /*------------------*\
    $ 习题内容
  \*------------------*/

  .problem__content {
    position: relative;
    // margin: 5px 0 0;

    border-top: 1px solid #C8C8C8;

    .page-no {
      position: absolute;
      top: 0;
      right: 0;

      padding: 0 10px;
      height: 25px;
      line-height: 25px;
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

    padding: 26px 17px 0;

    .options-item {
      padding: 3px 0;
      width: 25%;

      .options-label {
        margin: 0 auto;
        width: 60px;
        height: 60px;

        line-height: 60px;

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
    margin-top: 10px;
    padding: 20px 0;

    background: #fff;
  }

  .answer__header {
    padding-left: 11px;
    height: 28px;
    border-left: 6px solid #639EF4;
    font-weight: bold;
    text-align: left;
  }

  .blanks__options {
    padding: 20px;
  }

  .blank__item {
    display: flex;
    min-height: 40px;
  }

  .blank__order {
    display: flex;
    justify-content: center;
    align-items: center;

    width: 40px;
    min-height: 40px;
    font-weight: bold;
    color: #5096F5;
    border: 2px solid #5096F5;
    border-radius: 4px 0 0 4px;
  }

  .blank__input {
    flex: 1;
    padding: 5px;
    min-height: 40px;
    line-height: 1.5;
    text-align: left;
    box-sizing: border-box;
    border: 2px solid #eee;
    border-left: none;
    border-radius: 0 4px 4px 0;
  }

  .analysis__wrap {
    padding-left: 20px;
  }



  /*------------------*\
    $ 作答完成预览
  \*------------------*/

  .subjective__answer {
    margin-bottom: 40px;
    padding: 12px 20px;
    color: #333;
    background: #fff;

    .answer__inner {
      padding: 0 7px 15px;
      border-bottom: 1px solid #C8C8C8;
    }

    .answer--text {
      text-align: left;
      word-wrap: break-word;
    }

    .answer--image {
      padding-top: 10px;
      img {
        display: block;
        width: 260px;
        max-width: 100%;
      }
    }

    .answer-score {
      padding: 10px 7px 0;
      color: #9B9B9B;
      text-align: left;

      .lable {
        vertical-align: 3px;
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
    padding: 12px 0;
  }


</style>


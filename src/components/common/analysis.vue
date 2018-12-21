/*
 * @page：答案解析组件
 * @author: chenzhou
 * @update: 2018.12.11
 * @desc 主观题客观题对应答案解析和交互
 *
 */


<template>
  <!-- 解析内容 -->
  <section class="analysis-inner J_analysis_inner">
    <section class="analysis-anwser f16" v-if="problem.Type!=='ShortAnswer'"><!-- 正确答案 -->{{ $t('correctanswer') }}: {{ problem.Answer }}</section>
    <section class="analysis__images" :style="problem.RemarkRich|setScale">
      <!-- 新的解析处理 -->
      <div v-for="shape in problem.RemarkRich.Shapes" v-if="problem.RemarkRich && problem.RemarkRich.Shapes">
        <!-- 文字提取方式 新版 -->
        <img class="analysis__shape" :style="shape|setShapeStyle" :src="shape.URL" v-if="!shape.Paragraphs" />
        <div class="analysis__shape" :style="shape|setShapeStyle" v-else>
          <template v-for="paragraph in shape.Paragraphs" v-if="shape.Paragraphs">
            <ol class="paragraph__wrap J_paragraph" :start="paragraph.Number">
              <li class="analysis__shape shape__text" :style="paragraph.Bound|setShapeStyle">
                <div class="analysis__shape paragragh__line" :style="line.Bound|setShapeStyle" v-html="line.Html" v-for="line in paragraph.Lines" v-if="paragraph.Lines"></div>
              </li>
            </ol>
          </template>
        </div>
      </div>

      <!-- 兼容老的解析处理 -->
      <section class="remark f17" v-if="!problem.RemarkRich&&problem.Remark">{{ problem.Remark }}</section>
    </section>

  </section>

</template>

<style lang="scss" scoped>

  .analysis-inner {
    padding-top: 0.266667rem;
  }

  .analysis-anwser {
    text-align: left;
    color: #9B9B9B;
  }

  .remark {
    color: #4a4a4a;
    text-align: left;
    word-wrap: break-word;
    white-space: pre-wrap;
  }

  .analysis__images {
    position: relative;
    transform-origin: 0 0 0;
  }
  .analysis__shape {
    position: absolute;
  }

  .paragraph__wrap {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
  }
</style>
<script>
    export default {
    props: {
      problem: {
        type: Object,
        default: null
      }
    },
    data() {
      return {
      }
    },
    watch: {
      problem(newVal, oldVal) {
        newVal && this.init(newVal);
      }
    },
    filters: {
      setShapeStyle(shape) {
        var astyle = [
          'width:'+ (shape.Width)+'px;',
          'min-height:'+ shape.Height +'px;',
          'left:'+ shape.Left +'px;',
          'top:'+ shape.Top +'px;',
          'z-index:'+ shape.ZOrderPosition + ';',
          'transform: rotate('+ shape.Rotation + 'deg);',
          'webkit-transform: rotate('+ shape.Rotation + 'deg);',
        ];

        if(shape.FontSize){
          astyle.push('font-size:'+ shape.FontSize + 'px;');
        }

        if(shape.Fill && shape.Fill.Visble && !shape.Fill.Transparency){
          astyle.push('background-color:'+ shape.Fill.BackColor +';');
        }

        return astyle.join('');
      },

      // 设置答案解析的缩放
      setScale(remarkRich) {
        let sCss = '';
        let px2rem = window.lib && window.lib['flexible'] && window.lib['flexible']['px2rem'];
        if(remarkRich) {
          let winWidth = window.innerWidth - 80;
          let width = remarkRich.Width*window.dpr;
          let height = remarkRich.Height*window.dpr;
          let scaleRate = winWidth/width;
          height = height * scaleRate;
          // sCss = `width: ${width}px; height: ${height}px; transform: scale(${scaleRate});`;
          sCss = `width: ${px2rem(width)}rem; height: ${px2rem(height)}rem; transform: scale(${scaleRate});`;
        }

        return sCss;
      }
    },
    methods: {
      /**
       * @method 完善结构信息
       */
      init(problem) {
        // 结构中是否有Answer字段
        let type = problem.Type;
        if(type === 'FillBlank' && !problem.Answer) {

          problem.Blanks.forEach( (blank) =>{
            problem.Answer += ' ' +blank.Answers.join('/');
          });

          console.log(problem.Answer);
          this.problem.Answer = problem.Answer;
        }
      }
    },
    mounted() {
      this.problem && this.init(this.problem);
    },
    created() {
    }
  }
</script>

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
    <section class="analysis-anwser f16" v-if="problem.problemType!==5"><!-- 正确答案 -->{{ $t('correctanswer') }}: {{ problem.Answer }}</section>
    <section class="analysis__images" :style="problem.remarkRich|setScale" v-if="problem.remarkRich && problem.remarkRich.shapes">
      <!-- 新的解析处理 -->
      <div v-for="shape in problem.remarkRich.shapes">
        <!-- 文字提取方式 新版 -->
        <img class="analysis__shape" :style="shape|setShapeStyle" :src="shape.url" v-if="!shape.paragraphs" />
        <div class="analysis__shape" :style="shape|setShapeStyle" v-else>
          <template v-for="paragraph in shape.paragraphs" v-if="shape.paragraphs">
            <ol class="paragraph__wrap J_paragraph" :start="paragraph.number">
              <li class="analysis__shape shape__text" :style="paragraph.bound|setShapeStyle">
                <div class="analysis__shape paragragh__line" :style="line.bound|setShapeStyle" v-html="line.html" v-for="line in paragraph.lines" v-if="paragraph.lines"></div>
              </li>
            </ol>
          </template>
        </div>
      </div>
    </section>
    <!-- 兼容老的解析处理 -->
    <section class="remark f17" v-else-if="problem.remark">{{ problem.remark }}</section>
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
<style lang="scss">
  .paragragh__line {
    white-space: nowrap;
    p {
      display: inline-block;
    }
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
          'width:'+ (shape.width)+'px;',
          'min-height:'+ shape.height +'px;',
          'left:'+ shape.left +'px;',
          'top:'+ shape.top +'px;',
          'z-index:'+ shape.zOrderPosition + ';',
          'transform: rotate('+ shape.rotation + 'deg);',
          'webkit-transform: rotate('+ shape.rotation + 'deg);',
        ];

        if(shape.fontSize){
          astyle.push('font-size:'+ shape.fontSize + 'px;');
        }

        if(shape.fill && shape.fill.visible && !shape.fill.transparency){
          astyle.push('background-color:'+ shape.fill.backColor +';');
        }

        return astyle.join('');
      },

      // 设置答案解析的缩放
      setScale(remarkRich) {
        let sCss = '';
        let isFullScreen = location.href.indexOf('fullscreen') != -1
        if(remarkRich) {
          let winWidth = isFullScreen ? 275 : window.innerWidth - 100
          let width = remarkRich.width;
          let height = remarkRich.height;
          let scaleRate = winWidth/width;

          sCss = `width: ${width}px; height: ${height}px; transform: scale(${scaleRate});`;
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
        let type = problem.problemType;
        // 全部题型答案目前都在answers字段内
        if(!problem.Answer && (problem.answer || problem.answers)) {
          problem.Answer = '';

          let answers = problem.answer || problem.answers

          problem.Answer = type == 4 ? answers.join(';') : answers.join('');

          console.log(problem);
          this.problem = problem;
        }
      }
    },
    mounted() {
    },
    created() {
      this.problem && this.init(this.problem);
    }
  }
</script>

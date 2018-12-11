/*
 * @page：答案解析组件
 * @author: chenzhou
 * @update: 2018.12.11
 * @desc 主观题客观题对应答案解析和交互
 *
 */


<template>
  <!-- 解析页面 -->
  <section class="analysis__page mask-analysis">

    <article class="analysis-content">
      <h3 class="title f18">答案解析</h3>
      <!-- 解析内容 -->
      <div class="analysis-inner J_analysis_inner">
        <section class="analysis-anwser f16" v-if="problem.Type!=='ShortAnswer'">正确答案: {{ problem.Answer }}</section>
        <section class="analysis__images J_analysis_content" :style="problem.RemarkRich|setScale">
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
      </div>
    </article>

    <!-- 底部操作 -->
    <footer class="">
      <!-- 关闭按钮 -->
      <p class="analysis--closed f17" @click="handleclosed">关闭</p>
    </footer>
  </section>

</template>

<style lang="scss" scoped>
  .analysis__page {
    z-index: 2;
    position: fixed;
    top: 0;
    left: 0;

    width: 100%;
    height: 100%;

    background: rgba(0, 0, 0, 0.7);
  }

  .analysis--closed {
    z-index: 1001;
    position: absolute;
    bottom: 0.666667rem;
    left: 0.533333rem;
    right: 0.533333rem;
    height: 1.306667rem;
    line-height: 1.306667rem;
    text-align: center;
    color: #639EF4;
    background-color: #fff;
    border-radius: 0.106667rem;
  }

  .analysis-content {
    position: absolute;
    top: 0.533333rem;
    left: 0.533333rem;
    right: 0.533333rem;
    bottom: 1.866667rem;
    padding: 0.32rem 0.453333rem 0;
    background-color: #fff;
    border-radius: 0.106667rem;
    box-shadow: 0 0.106667rem 0.16rem rgba(0,0,0,0.2);
    overflow: auto;
    -webkit-overflow-scrolling: touch;

    .analysis-inner {
      padding-top: 0.266667rem;
    }

    .analysis-anwser {
      text-align: left;
      color: #9B9B9B;
    }

    .title {
      font-weight: normal;
      color: #333;
      text-align: center;
    }

    .remark {
      color: #4a4a4a;
      text-align: left;
      word-wrap: break-word;
      white-space: pre-wrap;
    }
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
      },
      hideAnalysis: {
        type: Function
      }
    },
    data() {
      return {

      }
    },
    watch: {
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
       * @method 关闭答案解析页面
       *
       */
      handleclosed() {
        if(typeof this.hideAnalysis === 'function') {
          this.hideAnalysis();
        }
      }

    },
    created() {
    }
  }
</script>

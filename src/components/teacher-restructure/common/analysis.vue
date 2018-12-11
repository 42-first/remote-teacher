/*
 * @page：答案解析组件 遥控器使用
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
      <analysis :problem.sync="problem"></analysis>
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

    .title {
      font-weight: normal;
      color: #333;
      text-align: center;
    }
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
    components: {
      analysis: () => import('@/components/common/analysis.vue'),
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

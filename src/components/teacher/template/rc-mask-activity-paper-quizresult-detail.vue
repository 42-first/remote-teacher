<!-- 已发试卷详情页 被父组件 rc-mask-activity-paper-quizresult.vue 引用 -->
<template>
	<div class="quizresultdetail-box">
    试卷详情页
    <div class="button-box f18">
      <v-touch class="btn" >刷新详情</v-touch>
      <v-touch class="btn" v-on:tap="closeQuizresultDetail">返回</v-touch>
    </div>
  </div>
</template>

<script>
  import request from '@/util/request'
  import API from '@/config/api'

  export default {
    name: 'RcMaskActivityPaperQuizresultDetail',
    props: [],
    data () {
      return {
      }
    },
    created () {
      let self = this

      // 点击 已发试卷 或 发布了一个试卷 父组件发送事件给本子组件，显示已发试卷饼图等信息
      self.$on('showQuizresultDetail', function (quizid) {
        console.log('显示 试卷详情页')
      })
    },
    methods: {
      /**
       * 关闭已发试卷详情页，返回饼图页面
       *
       * @event bindtap
       */
      closeQuizresultDetail () {
        this.$emit('closeQuizresultDetail')
      },
    }
  }
</script>

<style lang="scss" scoped>
  @import "~@/style/_variables";
  .quizresultdetail-box {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    background: $white;
    color: #000000;
    text-align: center;

    .button-box {
      display: flex;
      position: fixed;
      left: 0;
      right: 0;
      bottom: 0;
      height: 1.466667rem;
      text-align: center;

      .btn {
        flex: 1;
        border-radius: 0;
        height: 1.466667rem;
        line-height: 1.466667rem;
      }
    }
  }
</style>

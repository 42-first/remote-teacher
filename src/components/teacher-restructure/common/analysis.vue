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
      <h3 class="title f18"><!-- 答案解析 -->{{ $t('answerkey') }}</h3>
      <!-- 解析内容 -->
      <analysis :problem.sync="problem"></analysis>
    </article>

    <!-- 底部操作 -->
    <footer class="analysis__footer">
      <!-- 关闭按钮 -->
      <p class="analysis--closed f17" @click="handleclosed"><!-- 关闭 -->{{ $t('close') }}</p>
      <p v-if="sendStatus<2" class="analysis--closed f17" :class="[ sendStatus ? 'c9b' : '' ]" @click="handleSendToStu"><!-- 发送给学生 -->{{ $t('sendtostus') }}</p>
      <p v-else class="analysis--closed f17 c9b" ><!-- 已发给学生 -->{{ $t('hasbeensend') }}</p>
    </footer>
  </section>

</template>

<style lang="scss" scoped>
  .analysis__page {
    z-index: 1000;
    position: fixed;
    top: 0;
    left: 0;

    width: 100%;
    height: 100%;

    background: rgba(0, 0, 0, 0.7);
  }

  .analysis__footer {
    z-index: 1001;
    position: absolute;
    bottom: 0.666667rem;
    left: 0.533333rem;
    right: 0.533333rem;

    display: flex;
    justify-content: space-around;
    align-items: center;

    height: 1.306667rem;
    line-height: 1.306667rem;

    text-align: center;
    color: #639EF4;
    background-color: #fff;
  }

  .analysis--closed {
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
  import {mapGetters} from 'vuex'
  import request from '@/util/request'
  import API from '@/pages/teacher/config/api'
  import { isSupported } from '@/util/util'


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
        // 锁定发送 发送状态 0：未发送 1：发送中 2：已发送 3：发送失败
        sendStatus: 0,
      }
    },
    watch: {
      // problem(newVal, oldVal) {
      // }
    },
    computed: {
      ...mapGetters([
        'lessonid'
      ])
    },
    components: {
      analysis: () => import('@/components/common/analysis.vue'),
    },
    methods: {
      /**
       * @method 组件初始化
       */
      init() {
        let key = 'analysis-sendstatus-' + this.problem.ProblemID;
        if(isSupported(window.localStorage)) {
          this.sendStatus = +localStorage.getItem(key);
        }
      },

      /**
       * @method 关闭答案解析页面
       */
      handleclosed() {
        if(typeof this.hideAnalysis === 'function') {
          this.hideAnalysis();
        }
      },

      /**
       * @method 发送给全班
       */
      handleSendToStu() {
        let url = API.publish_remark;
        let params = {
          'problem_id': this.problem.ProblemID,
          'lesson_id': this.lessonid
        };

        if(this.sendStatus > 0) {
          return this;
        }

        // 禁止重复发送
        this.sendStatus = 1;

        request.post(url, params)
        .then(res => {
          if(res && res.success) {
            // 发送成功
            this.sendStatus = 2;

            // 这里记录是否发送
            let key = 'analysis-sendstatus-' + this.problem.ProblemID;
            if(isSupported(window.localStorage)) {
              localStorage.setItem(key, this.sendStatus);
            }
          }

        })
      }

    },
    created() {
      this.init();
    }
  }
</script>

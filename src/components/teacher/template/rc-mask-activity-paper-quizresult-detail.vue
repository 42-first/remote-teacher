<!-- 已发试卷详情页 被父组件 rc-mask-activity-paper-quizresult.vue 引用 -->
<template>
	<div class="quizresultdetail-box">
    <div class="list f17" style="padding: 0 0.4rem;">
      <div class="item f17" style="border-bottom: none;">
        <div class="name ellipsis">
        </div>
        <div class="detail">
          <span class="score" style="margin-right: 1.3rem;">得分</span>
          <span>交卷时间</span>
        </div>
      </div>
    </div>
    <div class="gap"></div>
    <div v-show="!quizResultDetailData.length" class="hmy f18">还没有学生提交</div>
    <section class="list">
      <div v-show="quizResultDetailData.length" class="item f17" v-for="item in quizResultDetailData" :key="item.userID">
        <div class="name ellipsis">
          <img :src="item.avatar" alt="">
          <span>{{item.name}}</span>
        </div>
        <div class="detail">
          <span class="score">{{item.score}}分</span>
          <span>{{item.time}}</span>
        </div>
      </div>
    </section>

    <div class="button-box f18">
      <v-touch class="btn" v-on:tap="refreshQuizResultDetail">刷新</v-touch>
      <v-touch class="btn" v-on:tap="closeQuizresultDetail">返回</v-touch>
    </div>
  </div>
</template>

<script>
  import request from '@/util/request'
  import API from '@/config/api'

  export default {
    name: 'RcMaskActivityPaperQuizresultDetail',
    props: ['quizid'],
    data () {
      return {
        quizResultDetailData: []
      }
    },
    created () {
      let self = this

      // 点击 已发试卷 或 发布了一个试卷 父组件发送事件给本子组件，显示已发试卷饼图等信息
      self.$on('showQuizresultDetail', function (quizid) {
        self.refreshQuizResultDetail()
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
      /**
       * 刷新试卷详情
       *
       */
      refreshQuizResultDetail(){
        let self = this
        let url = API.quiz_results_detail

        if (process.env.NODE_ENV === 'production') {
          url = API.quiz_results_detail + '/' + self.quizid + '/'
        }

        request.get(url)
          .then(jsonData => {
            self.quizResultDetailData = jsonData.data
          })
      },
    }
  }
</script>

<style lang="scss" scoped>
  @import "~@/style/_variables";
  .quizresultdetail-box {
    position: fixed;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    background: $white;
    color: #000000;
    text-align: center;
    
    .gap {
      height: 0.266667rem;
      background: #EDF2F6;
    }
    
    .hmy {
      margin-top: 6rem;
      color: $blue;
    }

    .list {
      padding: 0 0.4rem 1.466667rem;

      .item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        height: 1.693333rem;
        border-bottom: 1px solid #CCCCCC;

        .name {
          width: 3.866667rem;
          text-align: left;
          img {
            width: 1.2rem;
            height: 1.2rem;
            margin-right: 0.4rem;
            border-radius: 50%;
            vertical-align: middle;
          }
        }

        .detail .score {
          margin-right: 0.8rem;
        }
      }
    }

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
        box-shadow: none;
      }
    }
  }
</style>

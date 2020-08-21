<!-- 已发试卷详情页 -->
<template>
	<div class="quizresultdetail-box">
    <slot name="ykt-msg"></slot>
    <div class="list-head f17">
      <div class="item f17" style="border-bottom: none;">
        <div class="name ellipsis">
        </div>
        <div class="detail">
          <span class="score" style="margin-right: 1.3rem;">{{ $t('stuscore') }}</span>
          <span>{{ $t('submission') }}</span>
        </div>
      </div>
    </div>
    <div class="gap"></div>
    <section class="list">
      <div v-show="!quizResultDetailData.length" class="hmy f18">{{ $t('nosubmit') }}</div>
      <div v-show="quizResultDetailData.length" class="item f17" v-for="item in quizResultDetailData" :key="item.userID">
        <div class="name ellipsis">
          <img :src="item.avatar || 'http://sfe.ykt.io/o_1bsn23hg89klt0h1lb01p63dd69.jpg'" alt="">
          <span>{{item.name}}</span>
        </div>
        <div class="detail">
          <span class="score">{{item.score}}{{ $t('stutestscore') }}</span>
          <span>{{item.time}}</span>
        </div>
      </div>
    </section>

    <v-touch class="btn f18" v-on:tap="refreshQuizResultDetail">{{ $t('refresh') }}</v-touch>
  </div>
</template>

<script>
  import request from '@/util/request-v3'
  import API from '@/util/api'

  export default {
    name: 'QuizresultDetail',
    data () {
      return {
        quizid: -1,
        quizResultDetailData: []
      }
    },
    created () {
      this.init()
    },
    watch: {
      '$route' () {
        this.init()
      }
    },
    methods: {
      /**
       * 复用页面，需要watch route
       *
       */
      init () {
        let self = this
        self.quizid = +self.$route.params.quizid

        self.refreshQuizResultDetail()
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
    position: relative;
    min-height: 100%;
    background: $white;
    color: #000000;
    text-align: center;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    
    .gap {
      height: 0.266667rem;
      background: #EDF2F6;
    }
    
    .hmy {
      margin-top: 6rem;
      color: $blue;
    }

    .list, .list-head {
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

    .list-head {
      height: 1.5rem;
      padding: 0 0.4rem;
    }

    .list {
      flex: 1;
      padding: 0 0.4rem;
      overflow: auto;
      -webkit-overflow-scrolling: touch;
    }

    .btn {
      border-radius: 0;
      height: 1.466667rem;
      line-height: 1.466667rem;
      box-shadow: none;
    }
  }
</style>

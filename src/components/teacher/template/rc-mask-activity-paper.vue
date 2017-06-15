<!-- 试卷列表 被父组件 rc-mask-activity.vue 引用 -->
<template>
	<div class="paper-box allowscrollcallback">
    <!-- 已发试卷 -->
    <section class="list upper">
      <div class="title f17">已发试卷</div>
      <div class="item">
        <div class="desc f18" v-for="quiz in quizList">
          {{quiz.title}} <br>
          <span class="f14"> {{quiz.time}}</span>
        </div>
        <i class="iconfont icon-forward f14"></i>
      </div>
    </section>
    
    <!-- 试卷库 -->
    <section class="list downer">
      <div class="title f17">我的试卷库</div>
      <div class="item" v-for="paper in paperList">
        <div class="desc f18">
          {{paper.title}} <br>
          <span class="f14">{{paper.time}}</span>
        </div>
        <i class="iconfont icon-forward f14"></i>
      </div>
    </section>
    <v-touch class="back-btn f18" v-on:tap="closePaper">返回</v-touch>
  </div>
</template>

<script>
  import request from '@/util/request'
  import API from '@/config/api'

  export default {
    name: 'RcMaskActivityPaper',
    props: ['lessonid'],
    data () {
      return {
        paperList: [],    // 试卷库
        quizList: [],     // 已发试卷
      }
    },
    created () {
      let self = this

      // 点击 试卷 按钮 父组件发送事件给本子组件，获取已发、未发试卷
      self.$on('showPaper', function () {
        self.fetchPaperData()
      })
    },
    methods: {
      /**
       * 点击 返回 按钮关闭试卷列表
       *
       * @event bindtap
       */
      closePaper () {
        this.$emit('closePaper')
      },
      /**
       * 获取试卷数据
       *
       */
      fetchPaperData () {
        let self = this

        let url = API.lesson_quiz_list

        if (process.env.NODE_ENV === 'production') {
          url = API.lesson_quiz_list + '/' + self.lessonid + '/'
        }

        request.get(url)
          .then(jsonData => {
            console.log('lesson_quiz_list', jsonData)
            self.paperList = jsonData.data.quiz_data.paper_list
            self.quizList = jsonData.data.quiz_data.quiz_list

            return
            let quiz_data = data.data.data.quiz_data
            let _quiz_list = quiz_data.quiz_list
            console.log('success', quiz_data);

            self.setData({
              paperData: quiz_data
            })

            // 有可能老师刷新了遥控器，而之前已经有已经收卷的试卷
            // finishedQuizList['id'+quizID];
            for (var i = 0, _len = _quiz_list.length; i < _len; i++) {
              var _tmpID = _quiz_list[i].quiz_id;
              finishedQuizList['id'+_tmpID] = _quiz_list[i].quiz_end;
            }
          })
      },
    }
  }
</script>

<style lang="scss" scoped>
  @import "~@/style/_variables";
  .paper-box {
    position: absolute;
    z-index: 20; /* 遮盖toolbar */
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    background: #EDF2F6;
    color: #000000;
    overflow: auto;

    .list {
      padding-top: 0.4rem;

      .title {
        padding-left: 0.613333rem;
        height: 0.773333rem;
      }

      .item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        height: 2.133333rem;
        padding: 0 0.613333rem;
        background: $white;
        border-bottom: 1px solid #C8C8C8;

        .desc {
          span {
            color: #9B9B9B;
          }
        }
      }
    }

    .upper {
      margin-bottom: 0.266667rem;
    }
    .downer {
      padding-bottom: 1.466667rem;
    }
    
    .back-btn {
      position: fixed;
      left: 0;
      right: 0;
      bottom: 0;
      height: 1.466667rem;
      line-height: 1.466667rem;
      text-align: center;
      background: $blue;
      color: $white;
    }
  }
</style>

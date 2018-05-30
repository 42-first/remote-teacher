/*
 * @page：学生接收器互评主观题
 * @author: chenzhou
 * @update: 2018.5.28
 * @desc
 *
 */

<template>
  <section class="evaluation__page">
    <div :class="['evaluation__wrapper', 'animated', opacity ? 'zoomIn': '']">
      <!-- 互评得分 修改入口 -->
      <section class="evaluation__getscore mb10">
        <p class="f20 yellow">互评得分：100分</p>
        <p @click="handlescore"><i class="iconfont icon-bianji f25 blue"></i></p>
      </section>

      <!-- 主观题题干 -->
      <section class="subjective-content mb10" >
        <div class="content_wrapper">
          <p class="page-no f12"><span>第8页</span></p>
          <div class="cover__wrapper" :style="{ minHeight: (10 - 0.906667)/pptRate + 'rem' }">
            <img class="cover J_preview_img" src="http://st0.ykt.io/FqOgxWJctO7pymHwWJQ0Db_2CPci" alt="雨课堂" />
          </div>
        </div>
      </section>

      <!-- 主观题答案 -->
      <section class="evaluation__answer">
        <h3 class="answer__header">
          <p class="f21 c333">答案</p>
          <p class="answer--points f14 blue" @click="handlenode">评分要点</p>
        </h3>
        <div class="">
          <img class="answer--pic" src="http://st0.ykt.io/FkE8Q9Yo7IC8SW0y_XmYUPnM5PwS" alt="雨课堂主观题" />
          <div class="answer--text f17 c333">这里是文字描述，投稿限制了140个字符，这里全部显示。一二三这里是文字描述，投稿限制了140个字符，这里全部显示。一二三这里是文字描述，投稿限制了140个字符，这里全部显示。一二三这里是文字描述，投稿限制了140个字符</div>
        </div>
      </section>

      <!-- 打分 -->
      <section class="evaluation__score f18">
        <p class="score--btn" @click="handlescore">打分</p>
      </section>

    </div>

    <!-- 打分弹层 -->
    <section class="score__wrap" v-if="scoreVisible">
      <div class="score__modal">
        <header class="modal--closed"><i class="iconfont icon-shiti_guanbitouping f28 c333" @click="handleclosed"></i></header>
        <div class="score__input">
          <p class="input--tip f14 c666">请输入互评分数（本题总分100分）</p>
          <input class="input f30 c9b" type="tel" v-model="score" />
        </div>
        <div class="score__node">
          <h3 class="f20 c333">注意</h3>
          <div class="node__info">
            <span class="f18 yellow">*</span>
            <p class="f12 c9b">本题以小组形式批改，每人只有一次评分机会<br>成绩以最后一次提交为主</p>
          </div>
        </div>

        <p class="score--submit f18">提交</p>
      </div>
    </section>

    <!-- 评分要点 -->
    <section class="node__wrap" v-show="nodeVisible">
      <div class="node__modal">
        <header class="node--title f18 c333">评分要点</header>
        <div class="node__content f14 c666">
          <p>评论包含您所在的班级中，关于课件或话题的讨论，收到的评论或回复都将归为评论板块。</p>
          <p>私信包含您所在的班级中所有联系人与您的私信。</p>
          <p>通知均为雨课堂重要教学活动，会进行实时微信推送，不在此设置范围内。</p>
        </div>
        <footer class="node--footer f18" @click="handleclosedNode">关闭</footer>
      </div>
    </section>

  </section>
</template>

<script>
  import API from '@/util/api'

  export default {
    name: 'mutual-evaluation-page',
    data() {
      return {
        lessonID: 0,
        index: 0,
        opacity: 0,
        title: '',
        result: {},
        width: 0,
        height: 0,
        pptRate: 1,
        // 图片比例
        rate: 1,
        score: 0,
        scoreVisible: false,
        nodeVisible: false
      };
    },
    components: {
    },
    computed: {
    },
    watch: {
    },
    filters: {
    },
    mixins: [],
    methods: {
      /*
       * @method 获取互评的详情
       * @param reviewID 互评ID
       */
      getGroupReview(reviewID) {
        let URL = API.student.GET_GROUP_REVIEW;
        let param = {
          'group_review_id': reviewID
        };

        return request.get(URL, param)
          .then((res) => {
            if(res && res.data) {
              let data = res.data;

              this.result = data;

              return data;
            }
          });
      },
      /*
       * @method 显示打分弹层
       * @param
       */
      handlescore() {
        this.scoreVisible = true;
      },
      handleclosed() {
        this.scoreVisible = false;
      },

      /*
       * @method 显示评分要点
       * @param
       */
      handlenode() {
        this.nodeVisible = true;
      },
      handleclosedNode () {
        this.nodeVisible = false;
      },

      handlelaodImg(evt) {
        let target = evt.target;
        let src = target.dataset.src || target.src;

        this.width = target.naturalWidth || target.width;
        this.height = target.naturalHeight || target.width;

        this.rate = this.width/this.height;
        this.rate > 1 && (target.style.width = '100%');

        let oImg = new Image();
        oImg.onload = (e) => {
          this.width = oImg.naturalWidth || oImg.width;
          this.height = oImg.naturalHeight || oImg.height;
        };
        oImg.src = src;
      },

      handleBack() {
        this.$router.back();
      }
    },
    created() {
      this.index = +this.$route.params.index;

      let cards = this.$parent.cards;
      this.summary = cards[this.index];
      this.lessonID = this.$parent.lessonID;

      setTimeout(()=>{
        this.opacity = 1;
      }, 20)

      if(this.summary) {
        this.getGroupReview(this.summary.spid);
      } else {
        // this.$router.back();
      }
    },
    mounted() {
    },
    beforeDestroy() {
    }
  };
</script>

<style lang="scss" scoped="">
  .mb10 {
    margin-bottom: 0.133333rem;
  }

  .evaluation__page {
    z-index: 1;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;

    background: #f8f8f8;
    overflow: hidden;
    -webkit-backface-visibility: hidden;
  }

  .evaluation__wrapper {
    // display: flex;
    // flex-direction: column;
    width: 100%;
    height: 100%;
    overflow-y: scroll;
    -webkit-overflow-scrolling: touch;
  }

  .evaluation__getscore {
    display: flex;
    align-items: center;
    justify-content: space-between;

    padding: 0 0.533333rem;

    height: 1.626667rem;
    line-height: 1.626667rem;

    background: #fff;
  }



  /*------------------*\
    $ 主观题内容
  \*------------------*/

  .subjective-content {

    .content_wrapper {
      position: relative;
      margin: 0.266667rem 0 0.266667rem;
      background: #fff;
      overflow: hidden;
    }

    .page-no {
      position: absolute;
      top: 0;
      right: 1px;

      padding: 0 0.306667rem;
      height: 0.666667rem;
      line-height: 0.666667rem;
      color: #fff;

      background: rgba(0,0,0,0.5);
    }

    .cover {
      display: block;
      width: 100%;
    }
  }


  .evaluation__answer {
    padding: 0 0.533333rem;
    background: #fff;

    .answer__header {
      display: flex;
      align-items: center;
      justify-content: space-between;

      padding: 0.533333rem 0;
    }

    .answer--points {
      text-decoration: underline;
      font-weight: bold;
    }

    .answer--pic {
      display: block;
      width: 100%;
      padding-bottom: 0.4rem;
    }

  }


  .evaluation__score {
    padding: 1.066667rem 0 1.333333rem;
    background: #fff;

    .score--btn {
      margin: 0 auto;
      width: 5.333333rem;
      height: 1.173333rem;
      line-height: 1.173333rem;

      color: #fff;
      background: #5096F5;

      border-radius: 0.6rem/50%;
      box-shadow: 0 0.106667rem 0.186667rem rgba(80, 150, 245, 0.4);
      cursor: pointer;
    }
  }



  /*------------------*\
    $ 打分弹层
  \*------------------*/

  .score__wrap:after {
    content: '';
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;

    background: rgba(0,0,0,0.45);
  }

  .score__modal {
    z-index: 1;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;

    background: #fff;

    .modal--closed {
      height: 1.333333rem;
      line-height: 1.333333rem;
      padding: 0 0.4rem;
      text-align: left;
      border-bottom: 1px solid #C8C8C8;
      cursor: pointer;
    }

    .score__input {
      margin: 0 0.4rem;
      padding: 0.773333rem 0 1.36rem;
      border-bottom: 1px solid #C8C8C8;

      .input {
        margin-top: 0.533333rem;
        width: 5.866667rem;
        height: 1.466667rem;
        line-height: 1.466667rem;
        text-align: center;
        background: #f8f8f8;

        outline: none; resize: none; appearance: none; border: none;
      }
    }

    .score__node {
      padding: 0.533333rem 0;

      .node__info {
        display: flex;
        align-items: flex-start;
        justify-content: center;

        padding-top: 0.4rem;
      }
    }

    .score--submit {
      margin: 1.066667rem auto 0.666667rem;
      width: 5.333333rem;
      height: 1.173333rem;
      line-height: 1.173333rem;

      color: #fff;
      background: #5096F5;

      border-radius: 0.6rem/50%;
      box-shadow: 0 0.106667rem 0.186667rem rgba(80, 150, 245, 0.4);
    }
  }

  .node__wrap {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;

    display: flex;
    align-items: center;
    justify-content: center;

    background: rgba(0,0,0,0.45);
  }

  .node__modal {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;

    width: 7.866667rem;
    height: 10.666667rem;

    background: #fff;
    border-radius: 0.106667rem;

    .node--title {
      width: 100%;
      height: 2.4rem;
      line-height: 2.4rem;
      background: #F8F8F8;
      border-bottom: 1px solid #C8C8C8;
    }

    .node__content {
      flex: 1;
      padding: 0.4rem;
      text-align: left;
    }

    .node--footer {
       width: 100%;
      height: 1.333333rem;
      line-height: 1.333333rem;
      background: #F8F8F8;
      border-top: 1px solid #C8C8C8;
    }
  }



</style>

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
      <section class="evaluation__getscore mb10" v-if="reviewScore !== -1">
        <p class="f20 yellow">{{ $t('grading.gradingscore', { score: reviewScore }) }}</p>
        <p @click="handlescore" v-if="canSubmitScore"><i class="iconfont icon-bianji f25 blue"></i></p>
      </section>

      <!-- 主观题题干 -->
      <section class="subjective-content mb10" >
        <div class="content_wrapper">
          <p class="page-no f12"><span>{{ $t('pno', { number: summary&&summary.pageIndex }) }}</span></p>
          <div class="cover__wrapper">
            <img class="cover" :src="summary&&summary.cover" alt="雨课堂" />
          </div>
        </div>
      </section>

      <!-- 主观题答案 -->
      <section class="evaluation__answer" v-if="result">
        <h3 class="answer__header">
          <p class="f21 c333"><!-- 答案 -->{{ $t('grading.answer') }}</p>
          <p class="answer--points f14 blue" @click="handlenode"><!-- 评分要点 -->{{ $t('grading.pointsgrading') }}</p>
        </h3>
        <div class="">
          <img class="answer--pic" :src="result.pics[0].pic" alt="雨课堂主观题" v-if="result.pics && result.pics[0].pic" />
          <div class="answer--text f17 c333" v-if="result.content">{{ result.content }}</div>
        </div>
      </section>

      <!-- 打分 -->
      <section class="evaluation__score f18" v-if="canSubmitScore && reviewScore === -1">
        <p class="score--btn" @click="handlescore"><!-- 打分 -->{{ $t('grading.grade') }}</p>
      </section>

    </div>

    <!-- 打分弹层 -->
    <section class="score__wrap" v-if="scoreVisible">
      <div :class="[ 'score__modal', modalActive ? 'active' : '']" >
        <header class="modal--closed"><i class="iconfont icon-shiti_guanbitouping f28 c333" @click="handleclosed"></i></header>
        <div class="score__input">
          <p class="input--tip f14 c666"><!-- 请输入互评分数（满分{{ summary&&summary.score }}分） -->{{ $t('grading.gradingtotalscore', { score: summary&&summary.score }) }}</p>
          <input class="input f30 c9b" type="tel" v-model="score" @focus="handlefocus" @blur="handleblur" />
        </div>
        <div class="score__node">
          <h3 class="f20 c333"><!-- 注意 -->{{ $t('grading.notice') }}</h3>
          <div class="node__info">
            <span class="f18 yellow">*</span>
            <p class="f12 c9b" v-html="$t('grading.noticecontent')">本题以小组形式批改，每人只有一次评分机会<br>成绩以最后一次提交为主</p>
          </div>
        </div>

        <p class="score--submit f18" @click="handlesubmit"><!-- 提交 -->{{ $t('submit') }}</p>
      </div>
    </section>

    <!-- 评分要点 -->
    <section class="node__wrap" v-show="nodeVisible">
      <div class="node__modal">
        <header class="node--title f18 c333"><!-- 评分要点 -->{{ $t('grading.pointsgrading') }}</header>
        <div class="node__content f14 c666">{{ declaration }}</div>
        <footer class="node--footer f18" @click="handleclosedNode"><!-- 关闭 -->{{ $t('grading.close') }}</footer>
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
        // 作答结果
        result: null,
        reviewScore: 0,
        width: 0,
        height: 0,
        pptRate: 1,
        // 图片比例
        rate: 1,
        score: 0,
        // 互评ID
        reviewID: 0,
        // 问题ID
        problemID: 0,
        // 作答结果ID
        problemResultID: 0,
        slideData: null,
        // 互评要点
        declaration: '',

        scoreVisible: false,
        nodeVisible: false,
        canSubmitScore: false,

        modalActive: false
      };
    },
    components: {
    },
    computed: {
    },
    watch: {
      score(newVal, oldVal) {
        if(newVal > this.summary.score) {
          this.score = this.summary.score;
        }
      }
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

              this.review = data;
              this.problemID = data.problem_id;
              this.canSubmitScore = data.can_submit_score;
              this.declaration = data.group_review_declaration;

              // 作答结果
              if(data.problem_result_list && data.problem_result_list.length) {
                let resultInfo = data.problem_result_list[0];
                this.result = resultInfo.result;
                this.reviewScore = resultInfo.review_score;
                this.score = this.reviewScore > 0 ? this.reviewScore : 0;
                this.problemResultID = resultInfo.problem_result_id;
              }

              return data;
            }
          });
      },

      handlesubmit() {
        // 第一次打分直接提交 第二次打分确认
        if(this.reviewScore === -1) {
          this.submitReview();
        } else {
          let msgOptions = {
            confirmButtonText: this.$i18n && this.$i18n.t('submit') || '提交',
            cancelButtonText: this.$i18n && this.$i18n.t('cancel') || '取消'
          };
          let title = '已有人批改' || this.$i18n && this.$i18n.t('team.teamhasanswer');
          let message = '提交后将会覆盖之前的评分' || this.$i18n && this.$i18n.t('team.teamanswercover');

          this.$messagebox.confirm(message, title, msgOptions).
            then( action => {
              if(action === 'confirm') {
                this.submitReview();
              }
          });
        }
      },

      /*
       * @method 互评打分
       * @param
       */
      submitReview() {
        let URL = API.student.SUBMIT_GROUP_REVIEW;
        let param = {
          'group_review_id': this.summary.reviewid,
          'problem_result_id': this.problemResultID,
          'score': this.score
        };

        if(!this.score) {
          return this;
        }

        return request.post(URL, param)
          .then((res) => {
            if(res && res.data) {
              let data = res.data;
              this.reviewScore = this.score;

              this.summary = Object.assign(this.summary, {
                status: this.$i18n.t('done') || '已完成',
                isComplete: true
              })
              // 替换原来的数据
              this.$parent.cards.splice(this.index, 1, this.summary);

              this.$toast({
                message: this.$i18n.t('sendsuccess') || '提交成功',
                duration: 2000
              });

              setTimeout(() => {
                this.$router.back();
              }, 2000)

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

      /*
       * @method 打分输入框focus
       * @param
       */
      handlefocus() {
        this.modalActive = true;
      },

      handleblur() {
        this.modalActive = false;
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
        this.getGroupReview(this.summary.reviewid);
      } else {
        this.$router.back();
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
    overflow-y: scroll;
    -webkit-overflow-scrolling: touch;
    -webkit-backface-visibility: hidden;
  }

  .evaluation__wrapper {
    width: 100%;
    // height: 100%;
    min-height: 100vh;
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

    .answer--text {
      text-align: left;
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
    // position: fixed;
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;

    background: rgba(0,0,0,0.45);
  }

  .score__modal {
    z-index: 1;
    // position: fixed;
    position: absolute;
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

  .score__modal.active {
    top: 0;
    bottom: initial;
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
      width: 100%;
      text-align: left;
      white-space: pre-wrap;
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

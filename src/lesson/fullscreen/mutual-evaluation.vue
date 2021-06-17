/*
 * @page：学生接收器互评主观题
 * @author: chenzhou
 * @update: 2018.5.28
 * @desc
 *
 */

<template>
  <section class="evaluation__page">
    <div class="evaluation__wrapper">
      <section class="evaluation__inner">
      <!-- 互评得分 修改入口 -->
      <section class="evaluation__getscore mb10" v-if="reviewScore !== -1">
        <p class="f20 yellow">{{ $t('grading.gradingscore', { score: reviewScore/100 }) }}</p>
        <p class="pointer" @click="handlescore" v-if="canSubmitScore"><i class="iconfont icon-bianji f25 blue"></i></p>
      </section>

      <!-- 主观题题干 -->
      <section class="subjective-content mb10" >
        <div class="content_wrapper">
          <p class="page-no f12"><span>{{ $t('pno', { number: summary&&summary.pageIndex }) }}</span></p>
          <div class="cover__wrapper">
            <img class="cover" :src="summary&&summary.cover" :data-src="summary&&summary.cover" alt="雨课堂" @click="handleZoom" />
          </div>
        </div>
      </section>

      <!-- 主观题答案 -->
      <section class="evaluation__answer" v-if="result">
        <h3 class="answer__header">
          <p class="f21 c333"><!-- 答案 -->{{ $t('grading.answer') }}</p>
          <p class="answer--points f14 blue pointer" @click="handlenode" v-if="declaration"><!-- 评分要点 -->{{ $t('grading.pointsgrading') }}</p>
        </h3>
        <div class="">
          <img class="answer--pic" :src="result.pics[0].pic" :data-src="result.pics[0].pic" alt="雨课堂主观题" v-if="result.pics.length && result.pics[0].pic" @click="handleZoom" />
          <div class="answer--text f17 c333" v-if="result.content">{{ result.content }}</div>
        </div>
      </section>
      <!-- 没有互评ID显示 -->
      <section class="evaluation__empty f17" v-if="!hasReview">
        <p>{{ $t('grading.noarticipate') }}</p>
      </section>
      <!-- 旁听生不能打分 -->
      <section class="evaluation__empty f17" v-if="isGuestStudent">
        <p>{{ $t('auditornotgrade') }}</p>
      </section>
      

      <!-- 打分 -->
      <section class="evaluation__score f18" v-if="canSubmitScore && reviewScore === -1">
        <p class="score--btn pointer" @click="handlescore"><!-- 打分 -->{{ $t('grading.grade') }}</p>
      </section>

      </section>
    </div>

    <!-- 打分弹层 -->
    <section class="score__wrap" v-if="scoreVisible">
      <div class="score__modal" >
        <header class="modal--closed"><i class="iconfont icon-shiti_guanbitouping f28 c333" @click="handleclosed"></i></header>
        <div class="score__input">
          <p class="input--tip f14 c666"><!-- 请输入互评分数（满分{{ summary&&summary.score }}分） -->{{ $t('grading.gradingtotalscore', { score: summary&&summary.score/100 }) }}</p>
          <input class="input f30 c9b" :placeholder="$t('grading.pleasescore')" type="number" pattern="\d" v-model="score" @focus="handlefocus" @blur="handleblur" @keyup="oninput" :max="summary.score/100"/>
        </div>
        <div class="score__node">
          <h3 class="f20 c333"><!-- 注意 -->{{ $t('grading.notice') }}</h3>
          <div class="node__info">
            <span class="f18 yellow">*</span>
            <p class="f12 c9b" v-html="$t('grading.noticecontent')">本题以小组形式批改，每人只有一次评分机会<br>成绩以最后一次提交为主</p>
          </div>
        </div>

        <p class="score--submit f18" :class="[ submitStatus === 1 ? 'active' : '' ]" @click="handlesubmit"><!-- 提交 -->{{ $t('submit') }}</p>
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
  import { mapState, mapActions } from 'vuex'
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
        reviewScore: -1,
        width: 0,
        height: 0,
        pptRate: 1,
        // 图片比例
        rate: 1,
        score: '',
        // 互评ID
        reviewID: 0,
        // 问题ID
        problemID: 0,
        // 作答结果ID
        problemResultID: 0,
        slideData: null,
        // 互评要点
        declaration: '',
        // 提交状态 0:不能提交 1：可以提交
        submitStatus: 0,

        scoreVisible: false,
        nodeVisible: false,
        canSubmitScore: false,

        modalActive: false,
        hasReview: true,
      };
    },
    components: {
    },
    computed: {
      // 使用对象展开运算符将 getter 混入 computed 对象中
      ...mapState([
        'lesson',
        'cards',
        'isGuestStudent'
      ]),
    },
    watch: {
      score(newVal, oldVal) {
        if(newVal !== '') {
          this.submitStatus = 1;
        } else {
          this.submitStatus = 0;
        }

        if(newVal > this.summary.score) {
          this.score = this.summary.score;
        }
      },
      '$route'(to, from){
        if(to && to.params && to.name === 'evaluation') {
          let params = to.params;
          this.index = params.index

          this.init()
        }
      }
    },
    filters: {
    },
    mixins: [],
    methods: {
      ...mapActions([
        'setCards',
      ]),

      init(){
        let cards = this.cards;
        this.summary = cards[this.index];
        this.lessonID = this.lesson.lessonID;

        if(this.summary) {
          let reviewID = this.summary.reviewid;
          let problemID = this.summary.prob;
          problemID && this.getGroupReview(problemID);

          this.reviewID = reviewID;
        } else {
          // this.$router.back();
        }
      },

      /*
       * @method 获取互评的详情
        * @param problemID 
       */
      getGroupReview(problemID) {
        let URL = API.lesson.get_problem_review_detail;
        let param = {
          'problemId': problemID
        };



        return request.post(URL, param)
          .then((res) => {
            if(res && res.code === 0 && res.data) {
              let data = res.data;

              this.review = data;
              this.problemID = data.problemId;
              // this.canSubmitScore = data.can_submit_score;
              this.declaration = data.reviewDeclaration;

              // 作答结果
              if(data.problemResultList && data.problemResultList.length) {
                let resultInfo = data.problemResultList[0];
                this.result = resultInfo.result;
                this.reviewScore = resultInfo.reviewScore;
                this.score = this.reviewScore > 0 ? this.reviewScore / 100 : '';
                this.problemResultID = resultInfo.problemResultId;
                this.canSubmitScore = resultInfo.canSubmitScore;
                this.hasReview = true;
              } else {
                this.hasReview = false;
                this.canSubmitScore = false;
              }

              return data;
            }
          });
      },

      handlesubmit() {
        // 是否可以提交
        if(!this.submitStatus) {
          return this;
        }

        // 第一次打分直接提交 第二次打分确认
        if(this.reviewScore === -1) {
          this.submitReview();
        } else {
          let msgOptions = {
            confirmButtonText: this.$i18n && this.$i18n.t('submit') || '提交',
            cancelButtonText: this.$i18n && this.$i18n.t('cancel') || '取消'
          };
          let title = this.$i18n && this.$i18n.t('grading.gradedalready');
          let message = this.$i18n && this.$i18n.t('grading.gradedoverwrite');

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
        let URL = API.lesson.submit_review_score;
        let param = {
          'reviewId': this.summary.reviewid,
          'problemId': this.problemID,
          'problemResultId': this.problemResultID,
          'reviewScore': this.score*100
        };

        if(!this.submitStatus) {
          return this;
        } else {
          this.submitStatus = 0;
        }

        return request.post(URL, param)
          .then((res) => {
            if(res && res.code === 0 && res.data) {
              let data = res.data;
              this.reviewScore = this.score * 100;

              this.summary = Object.assign(this.summary, {
                status: this.$i18n.t('done') || '已完成',
                isComplete: true
              })
              // 替换原来的数据
              this.cards.splice(this.index, 1, this.summary);
              this.setCards(this.cards);

              this.$toast({
                message: this.$i18n.t('sendsuccess') || '提交成功',
                duration: 2000
              });

              this.handleclosed()

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

      handleblur(evt) {
        this.modalActive = false;

        let target = evt.currentTarget;
        setTimeout(() => {
          target.scrollIntoView({
            block: 'start',
            behavior: 'smooth'
          });
        }, 100);
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

      /*
       * @method 打分
       * @param
       */
      oninput(evt){
        let targetEl = evt.target;
        let sValue = targetEl.value;
        let index = sValue.indexOf('.');
        let sourceScore = this.summary && this.summary.score/100 || 0;

        if(index !== -1 && index == sValue.length - 1) {
          return ;
        }
        let iptValue = +sValue;

        if(iptValue > sourceScore) {
          this.score = sourceScore
        } else if(iptValue < 0) {
          this.score = 0;
        } else {
          if((this.score+'').indexOf('.') !== -1) {
            this.score = +parseFloat(this.score).toFixed(1);
          }
        }
      },

      /*
       * @method 图片放大
       * @param
       */
      handleZoom(evt) {
        evt.preventDefault();
        evt.stopPropagation();

        let targetEl = evt.target;
        let src = targetEl.dataset.src || targetEl.src;

        typeof wx !== 'undefined' && wx.previewImage({
          current: src, // 当前显示图片的http链接
          urls: [src] // 需要预览的图片http链接列表
        });
      },

    },
    created() {
      this.index = +this.$route.params.index;

      this.init()
    },
    mounted() {
    },
    beforeDestroy() {
    }
  };
</script>

<style lang="scss" scoped="">
  .mb10 {
    margin-bottom: 5px;
  }

  .evaluation__page {
    position: relative;
    // width: 100%;
    // height: 100%;

    margin: 0 auto;
    width: 375px;
    height: 667px;

    background: #f8f8f8;
    overflow: hidden;
    -webkit-overflow-scrolling: touch;
  }

  .evaluation__wrapper {
    display: flex;
    flex-direction: column;

    width: 375px;
    height: 667px;

    // background: #fff;
    border: 2px solid #eee;
  }

  .evaluation__inner {
    flex: 1;
    width: 100%;

    overflow-y: scroll;
    -webkit-overflow-scrolling: touch;

  }

  .evaluation__getscore {
    display: flex;
    align-items: center;
    justify-content: space-between;

    padding: 0 20px;

    height: 60px;
    line-height: 60px;

    background: #fff;
  }



  /*------------------*\
    $ 主观题内容
  \*------------------*/

  .subjective-content {

    .content_wrapper {
      position: relative;
      margin: 10px 0 10px;
      background: #fff;
      overflow: hidden;
    }

    .page-no {
      position: absolute;
      top: 0;
      right: 1px;

      padding: 0 11px;
      height: 25px;
      line-height: 25px;
      color: #fff;

      background: rgba(0,0,0,0.5);
    }

    .cover {
      display: block;
      width: 100%;
    }
  }


  .evaluation__answer {
    padding: 0 20px;
    background: #fff;

    .answer__header {
      display: flex;
      align-items: center;
      justify-content: space-between;

      padding: 20px 0;
    }

    .answer--points {
      text-decoration: underline;
      font-weight: bold;
    }

    .answer--pic {
      display: block;
      width: 100%;
      padding-bottom: 15px;
    }

    .answer--text {
      text-align: left;
      word-wrap: break-word;
      word-break: break-all;
    }
  }

  .evaluation__empty {
    display: flex;
    align-items: center;
    justify-content: center;

    padding: 0 20px;
    height: 15px;
    text-align: center;
    background: #fff;
  }


  .evaluation__score {
    padding: 40px 0 50px;
    background: #fff;

    .score--btn {
      margin: 0 auto;
      width: 200px;
      height: 44px;
      line-height: 44px;

      color: #fff;
      background: #5096F5;

      border-radius: 22px/50%;
      box-shadow: 0 4px 7px rgba(80, 150, 245, 0.4);
      cursor: pointer;
    }
  }



  /*------------------*\
    $ 打分弹层
  \*------------------*/

  .score__wrap:after {
    content: '';
    position: fixed;
    // position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;

    background: rgba(0,0,0,0.45);
  }

  .score__modal {
    z-index: 1;
    position: fixed;
    // position: absolute;
    bottom: 0;
    left: 0;
    right: 0;

    background: #fff;

    .modal--closed {
      height: 50px;
      line-height: 50px;
      padding: 0 15px;
      text-align: left;
      border-bottom: 1px solid #C8C8C8;
      cursor: pointer;
    }

    .score__input {
      margin: 0 15px;
      padding: 29px 0 51px;
      border-bottom: 1px solid #C8C8C8;

      .input {
        margin-top: 20px;
        width: 220px;
        height: 55px;
        line-height: 55px;
        text-align: center;
        background: #f8f8f8;

        outline: none; resize: none; appearance: none; border: none;
      }
    }

    .score__node {
      padding: 20px 0;

      .node__info {
        display: flex;
        align-items: flex-start;
        justify-content: center;

        padding-top: 15px;
      }
    }

    .score--submit {
      margin: 40px auto 25px;
      width: 200px;
      height: 44px;
      line-height: 44px;

      color: #fff;
      // background: #5096F5;
      background: #999999;

      border-radius: 22px/50%;
      box-shadow: 0 4px 7px rgba(80, 150, 245, 0.4);
    }

    .score--submit.active {
      background: #5096F5;
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

    width: 295px;
    height: 400px;

    background: #fff;
    border-radius: 4px;

    .node--title {
      width: 100%;
      height: 90px;
      line-height: 90px;
      background: #F8F8F8;
      border-radius: 4px 4px 0 0;
    }

    .node__content {
      flex: 1;
      padding: 2px;
      width: 100%;
      text-align: left;
      white-space: pre-wrap;
    }

    .node--footer {
      width: 100%;
      height: 50px;
      line-height: 50px;
      color: #5096f5;
      border-top: 1px solid #eee;
      border-radius: 0 0 4px 4px;
    }
  }


</style>

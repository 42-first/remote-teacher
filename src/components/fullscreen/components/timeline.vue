/*
 * 学生接收器 大屏幕 timeline
 * @author: chenzhou
 * @update: 2020.2.29
 */

<template>
  <!-- timeline -->
  <section class="timeline__wrap" >
    <section class="timeline__item J_slide" :data-index="index" :class="{ 'active': slideIndex === index }" v-for="(item, index) in cards" :key="index" v-if="item" @click="handleView(item, index)" >
      <!-- 正在放映提示 v-if="item.type === 2 || item.type === 3 " -->
      <section class="box-between inlesson" v-if="currSlide && index === currSlide.index">
        <span class="f12 cfff">正在放映</span>
      </section>

      <!-- type : 1消息 2ppt 3习题 4试卷 5红包 8分组 10截图分享 11白板分享 12白板绘制 -->
      <template v-if="item.type==1">
        <div class="timeline__msg f12" :title="item.message">{{ item.message }}</div>
      </template>
      <!-- ppt模板 -->
      <template v-else-if="item.type==2">
        <div class="timeline__ppt">
          <span class="ppt--pageno f12" >{{ $t('pno', { number: item.pageIndex }) }}</span>
          <div class="ppt__cover--wrapper" :style="{ minHeight: 180/item.rate + 'px' }">
            <img class="cover" :src="item.src">
          </div>
          <div class="timeline__footer box-between">
            <p class="f12 c9b">{{ item.time|getTimeago }}</p>
          </div>
        </div>
      </template>
      <!-- 习题模板 -->
      <template v-else-if="item.type==3">
        <div class="timeline__ppt problem" :class="{ 'complete': item.isComplete }" >
          <span class="ppt--pageno f12" >{{ $t('pno', { number: item.pageIndex }) }}</span>
          <div class="ppt__cover--wrapper" :style="{ minHeight: 180/item.rate + 'px' }">
            <img class="cover" :src="item.src">
          </div>
          <div class="timeline__footer box-between cfff">
            <p class="f12">{{ item.time|getTimeago }}</p>
            <span class="f12">{{ item.status }}</span>
          </div>
        </div>
      </template>
      <!-- 截图分享 白板分享 -->
      <template v-else-if="item.type==10 || item.type==11">
        <div class="timeline__ppt">
          <span class="ppt--pageno f12"><!-- 截图分享 -->{{ item.type === 10 ? $t('screenshot') : $t('blackboard') }}</span>
          <div class="ppt__cover--wrapper screenshot" :style="{ minHeight: 180/item.rate + 'px' }">
            <img class="screenshot--image" :src="item.src" alt="雨课堂,截图分享" />
          </div>
          <div class="timeline__footer box-between">
            <p class="f12 c9b">{{ item.time|getTimeago }}</p>
          </div>
        </div>
      </template>
      <!-- 试卷模板 -->
      <template v-else-if="item.type==4" >
        <div class="timeline__cards quiz" :class="{ 'complete': item.isComplete }" >
          <div class="icon__wrap box-center">
            <i class="iconfont icon-queding cfff f24" v-if="item.isComplete"></i>
            <i class="iconfont icon-shiti_shijuan cfff f24" v-else ></i>
          </div>
          <p class="f14 c333 bold">{{ item.papername }}</p>
          <p class="f12 c9b">{{ $t('totalprob', { number: item.count }) }}</p>

          <div class="box-between timeline__footer">
            <p class="f12">{{ item.time|getTimeago }}</p>
          </div>
        </div>
      </template>
      <!-- 红包模板 -->
      <template v-else-if="item.type==5">
        <div class="timeline__cards hongbao">
          <div class="icon__wrap box-center">
            <i class="iconfont icon-shiti_hongbao cfff f24"></i>
          </div>
          <p class="f14 c333 bold" v-if="item.length">{{ $t('gainbonus', { number: item.length }) }}</p>
          <p class="f14 c333 bold" v-else >{{ $t('recvbonus') }}</p>

          <div class="box-between timeline__footer">
            <p class="f12">{{ item.time|getTimeago }}</p>
          </div>
        </div>
      </template>
      <!-- 投稿分享 -->
      <template v-else-if="item.type==6">
        <div class="timeline__cards submission">
          <div class="icon__wrap box-center">
            <i class="iconfont icon-ykq_tab_tougao cfff f24"></i>
          </div>
          <p class="f14 c333 bold"><!-- Hi, 老师正在分享课堂投稿 -->{{ $t('sharepostpush') }}</p>

          <div class="box-between timeline__footer">
            <p class="f12">{{ item.time|getTimeago }}</p>
          </div>
        </div>
      </template>
      <!-- 主观题答案分享 -->
      <template v-else-if="item.type==7">
        <div class="timeline__cards subjective">
          <div class="icon__wrap box-center">
            <i class="iconfont icon-ykq_shiti cfff f24"></i>
          </div>
          <p class="f14 c333 bold"><!-- Hi, 老师正在分享主观题答案 -->{{ $t('sharesubjective') }}</p>
          <div class="box-between timeline__footer">
            <p class="f12">{{ item.time|getTimeago }}</p>
          </div>
        </div>
      </template>
      <!-- 发起了分组 -->
      <template v-else-if="item.type==8">
        <div class="timeline__cards fenzu" :class="{ 'complete': item.isComplete }" >
          <div class="icon__wrap box-center">
            <i class="iconfont icon-queding cfff f24" v-if="item.isComplete"></i>
            <i class="iconfont icon-fenzu cfff f24" v-else ></i>
          </div>
          <template v-if="item.groupType ==='random'">
            <p class="f14 c333 bold"><!-- Hi，老师进行了随机分组 -->{{ $t('team.randomized') }}</p>
            <p class="f12 c9b"><!-- 查看结果 -->{{ $t('team.viewresults') }}</p>
          </template>
          <template v-else-if="item.groupType ==='free'">
            <p class="f14 c333 bold"><!-- Hi，老师进行了自由分组 -->{{ $t('team.freegrouping') }}</p>
            <p class="f12 c9b"><!-- 输入口令 -->{{ $t('team.enterpassword') }}</p>
          </template>

          <div class="box-between timeline__footer">
            <p class="f12">{{ item.time|getTimeago }}</p>
          </div>
        </div>

      </template>
      <!-- 发起了互评 -->
      <template v-else-if="item.type==9">
        <div class="timeline__cards evaluation" :class="{ 'complete': item.isComplete }" >
          <div class="icon__wrap box-center">
            <i class="iconfont icon-queding cfff f24" v-if="item.isComplete"></i>
            <i class="iconfont icon-huping cfff f24" v-else ></i>
          </div>
          <p class="f14 c333 bold"><!-- Hi，老师发起了互评 -->{{ $t('grading.launchedgrading') }}</p>
          <p class="f12 c9b">{{ $t('pno', { number: item.pageIndex }) }}</p>

          <div class="box-between timeline__footer">
            <p class="f12">{{ item.time|getTimeago }}</p>
          </div>
        </div>
      </template>
      <!-- 白板绘制 -->
      <template v-else-if="item.type==12">
        <div class="timeline__ppt">
          <span class="ppt--pageno f12"><!-- 板书 -->{{ $t('board') }}</span>
          <div class="box-center board__container">
            <i class="iconfont icon-dengdai blue f40" ></i>
          </div>
          <div class="box-between timeline__footer">
            <p class="f12">{{ item.time|getTimeago }}</p>
          </div>
        </div>
      </template>
      <!-- 问题解析 -->
      <template v-else-if="item.type==13">
        <div class="timeline__cards analysis">
          <div class="icon__wrap box-center">
            <i class="iconfont icon-ykq_shiti cfff f24"></i>
          </div>
          <p class="f14 c333 bold">{{ item.caption }}</p>
          <p class="f12 c9b">{{ $t('pno', { number: item.pageIndex }) }}</p>

          <div class="box-between timeline__footer">
            <p class="f12">{{ item.time|getTimeago }}</p>
          </div>
        </div>

      </template>

    </section>

  </section>

</template>
<script>
  import { mapState, mapActions } from 'vuex'
  import timeago from 'timeago.js';

  let locale = window.i18n && window.i18n.locale || 'zh_CN';
  // 在这里设置相对时间
  let timeagoInstance = timeago(null, locale);

  if (locale != 'en' && locale != 'zh_CN') {
    timeago.register(locale, require('timeago.js/locales/' + locale));
  }


  export default {
    name: 'timeline',
    data() {
      return {
      };
    },
    watch: {
      msg(newVal, oldVal) {
        // let index = this.cards.findIndex((item)=>{
        //   return item.type === newVal.type;
        // })

        let index = newVal.index || this.cards.length - 1;
        if(index) {
          setTimeout(()=>{
            let slideEl = this.$el.querySelector(`.J_slide[data-index="${index}"]`);
            slideEl && slideEl.scrollIntoView();

            this.autoJump(index, newVal);
          }, 100)
        }
      },
    },
    computed: {
      // 使用对象展开运算符将 getter 混入 computed 对象中
      ...mapState([
        'lesson',
        'cards',
        'slideIndex',
        'msg',
        'observerMode',
        'currSlide'
      ]),
    },
    filters: {
      getTimeago(time) {
        return timeagoInstance.format(time, window.i18n && window.i18n.locale === 'en' ? 'en': 'zh_CN');
      }
    },
    methods: {
      ...mapActions([
        'setSlideIndex',
      ]),

      /**
       * @method timeline详情
       */
      handleView(item, index) {
        if(item && item.type) {
          this.setSlideIndex(index);
        }
      },

      /**
       * @method timeline详情
       */
      autoJump(index, slide) {
        // TODO: 自动跳转策略
        // 当前是PPT 直接跳转, 有题目出现跳转
        console.log(index);
        console.dir(this.$route);

        let pageName = this.$route.name;
        // PPT页可以自动切换
        if(pageName === 'ppt-page') {
          this.setSlideIndex(index);

          this.setMsg(null);

          return this;
        }

        // 新消息是题目自动切换到题目
        if(slide && slide.type === 3) {
          // this.setSlideIndex(index);
        }
      }
    },
    created() {
    },
    mounted() {
    },
    beforeDestroy() {
    }
  };
</script>

<style lang="scss">

  .timeline__wrap {
    display: flex;
    flex-direction: column-reverse;
    align-items: center;
    justify-content: center;
  }

  .timeline__item {
    position: relative;
    margin: 10px auto;
    width: calc(100% - 40px);

    cursor: pointer;

    &.active {
      outline: 2px solid #5096F5;
    }
  }

  .timeline__footer,
  .inlesson {
    position: absolute;
    bottom: 0;
    left: 0;

    width: 100%;
    padding: 2px 10px;
  }

  .inlesson {
    z-index: 1;
    background: #5096F5;
  }


  /*--------------------*\
    $ event消息
  \*--------------------*/

  .timeline__msg {
    padding: 0 10px;
    max-width: 100%;
    height: 20px;

    display: inline-flex;
    align-items: center;
    justify-content: center;

    text-align: center;
    color: #fff;
    background: #C1C1C1;

    border-radius: 10px/50%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }



  /*--------------------*\
    $ ppt模板
  \*--------------------*/


  .timeline__ppt {
    position: relative;
    margin: 0 auto;
    width: 100%;

    .ppt__cover--wrapper {
      margin: 0 auto;
      width: 100%;

      border: 1px solid #C8C8C8;
      border-radius: 2px;
      overflow: hidden;

      .cover {
        display: block;
        width: 100%;
      }
    }

    .ppt--pageno {
      z-index: 1;
      position: absolute;
      top: 0;
      right: 0;

      padding: 3px 10px;
      color: #fff;
      background: rgba(0,0,0, 0.3);
      border-radius: 0 2px 0 0;
    }

  }

  .problem {
    &.complete {
      .timeline__footer {
        background: #c8c8c8;
      }
    }

    .timeline__footer {
      background: #5096F5;
    }
  }


  .screenshot {
    position: relative;
    background: #f8f8f8;
  }

  .screenshot--image {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);

    max-width: 100%;
  }



  /*--------------------*\
    $ 常用模板
  \*--------------------*/

  .timeline__cards {
    position: relative;

    display: flex;
    flex-flow: column;

    width: 180px;
    height: 135px;
    padding: 20px 0px;
    border: 1px solid #c8c8c8;
    border-radius: 2px;

    &.quiz {
      .icon__wrap {
        background: #62D793;
        box-shadow: 0 2px 4px rgba(98, 215, 147, 0.5);
      }
    }

    &.submission {
      .icon__wrap {
        background: #FFB53C;
        box-shadow: 0 2px 4px rgba(255, 181, 60, 0.5);
      }
    }

    &.subjective,
    &.analysis {
      .icon__wrap {
        background: #91BBF7;
        box-shadow: 0 2px 4px rgba(145, 187, 247, 0.5);
      }
    }

    &.hongbao {
      .icon__wrap {
        background: #F84F41;
        box-shadow: 0 2px 4px rgba(248, 79, 65, 0.5);
      }
    }

    &.evaluation {
      .icon__wrap {
        background: #D281FA;
        box-shadow: 0 2px 4px rgba(210, 219, 250, 0.5);
      }
    }

    &.fenzu {
      .icon__wrap {
        background: #9C81FA;
        box-shadow: 0 2px 4px rgba(156, 129, 250, 0.5);
      }
    }

    .icon__wrap {
      margin: 0 auto 7px;
      width: 40px;
      height: 40px;
      border-radius: 50%;
    }

    &.complete {
      .icon__wrap {
        opacity: 0.2;
      }

      p {
        color: #9b9b9b;
      }

      .timeline__footer {
        // background: #c8c8c8;
      }
    }

  }


  .board__container {
    width: 100%;
    height: 135px;

    border: 1px solid #c8c8c8;
    border-radius: 2px;
  }


</style>


/*
 * @page：web上课 主页面
 * @author: chenzhou
 * @update: 2020.2.29
 * @desc
 *
 */


<template>
  <section class="lesson__page" tabindex="1">
    <!-- 内容区 -->
    <section class="lesson__wrap" :class="[ fullscreen ? 'fullscreen' : '']" >
      <!-- header -->
      <header class="lesson__header" v-show="!fullscreen">
        <div class="box-center">
          <section class="cards__title box-center c333" >
            <h3 class="f16" v-if="lesson && lesson.title" >{{ lesson.title }}</h3>
          </section>
        </div>
        <!-- <div class="box-center pointer">
          <p class="box-center mr10 blue full-btn" @click="handleFullscreen">
            <i class="iconfont icon-quanpingyanshix pr5 f15"></i><span>全屏演示</span>
          </p>
        </div> -->
      </header>
      <!-- 课件内容 -->
      <section class="lesson__cards">
        <nav class="cards__nav" v-show="!fullscreen">
          <h3 class="nav__header">动态</h3>
          <section class="nav__list">
            <!--  -->
            <timeline></timeline>
          </section>
        </nav>
        <section class="slide__info J_container" >
          <!-- 当前或者选中的数据展示 -->
          <router-view></router-view>
        </section>
      </section>
    </section>

  </section>

</template>

<script>
let screenfull = require('screenfull');
import { mapState, mapActions } from 'vuex'

import timeline from './timeline';


export default {
  name: "lesson-content",
  props: {
  },
  data() {
    return {
      // 当前选中
      activeIndex: 0,
      // ppt 展示容器的宽高
      maxWidth: 0,
      maxHeight: 0,

      // 是否放映结束
      isEnd: false,
      fullscreen: false
    };
  },
  computed: {
    // 使用对象展开运算符将 getter 混入 computed 对象中
    ...mapState([
      'lesson',
      'lessonAllStatus',
    ]),
  },
  components: {
    timeline,
  },
  mixins: [ ],
  created() {
  },
  mounted() {
    this.init();
  },
  updated() {},
  beforeDestroy() {
    window.removeEventListener('resize', this.resize);
  },
  filters: {
  },
  watch: {
    activeIndex(newVal, oldVal) {
      if(this.problem && this.problem.isPublished && this.fullscreen) {
        this.handleProblemInfo()
      }

      let slideEl = this.$el.querySelector(`.J_slide[data-index="${newVal}"]`);
      setTimeout(()=>{
        slideEl && slideEl.scrollIntoView({ behavior: "smooth", block: 'center' });
      }, 0)
    },
    slideIndex(newVal, oldVal) {
      this.activeIndex = newVal;

      let slide = this.slides[newVal];
      this.setSlide(slide);

      if(this.isEnd) {
        this.isEnd = false;
      }
    },
    slide(newVal, oldVal) {
      if(newVal.ClickCount > 0) {
        // 往前翻页 非放映模式 动画显示完整
        if(this.direction === 'prev' || !this.fullscreen) {
          this.setStep(newVal.ClickCount);
        } else {
          this.setStep(0);
        }
      } else {
        this.setStep(-1);
      }
    },
    fullscreen(newVal, oldVal) {
      if(newVal) {
        if(this.problem && this.problem.isPublished) {
          this.handleProblemInfo();
        }
      }
    }
  },
  methods: {
    ...mapActions([
      'setSlide',
    ]),

    /**
     * @method 页面初始化
     * @params
     */
    init() {
      // let slide = this.slides[this.slideIndex];
      // this.setSlide(slide);
      // this.activeIndex = this.slideIndex;

      this.initEvent();

      setTimeout(()=>{
        // this.resize();
      }, 100)
    },

    /**
     * @method 事件监听
     * @params
     */
    initEvent() {
      window.addEventListener('resize', this.resize);

      this.$el.focus();

      // 监听放映状态
      document.addEventListener('fullscreenchange', this.resize);
    },

    /**
     * @method 更新ppt宽高
     * @params
     */
    resize() {
      this.checkFullscreen();
      this.maxWidth = this.$el.querySelector('.J_container').clientWidth - 40;
      this.maxHeight = this.$el.querySelector('.J_container').clientHeight - 40;

      setTimeout(()=>{
        this.maxWidth = this.$el.querySelector('.J_container').clientWidth - 41;
        this.maxHeight = this.$el.querySelector('.J_container').clientHeight - 41;
      }, 1500)
    },

    /**
     * @method 全屏展示
     * @params
     */
    handleFullscreen(evt) {
      // 保证全屏放映兼容性
      screenfull.request().
      then(()=>{
        this.setFullscreen(true);
      });

      setTimeout(()=>{
        this.$parent.danmaku.resize();
      }, 500)
    },

    checkFullscreen() {
      var fullscreen = document.webkitIsFullScreen || document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement || false

      if (fullscreen !== this.fullscreen) {
        console.log('checkFullscreen', fullscreen);
        this.setFullscreen(fullscreen);
      }
    },

    /**
     * @method 结束授课
     * @params
     */
    handleEndLesson() {
      this.setEndLessonVisible(true);
    },

    /**
     * @method 切换slide
     */
    handleSwitchSlide(index) {
      this.setSlideIndex(index);
    },

  }
};
</script>

<style lang="scss" scoped>
  .lesson__page {
    position: fixed;
    top: 0;
    left: 0;

    width: 100vw;
    height: 100vh;

    background: radial-gradient(circle at 100% 100%, #0D1F39, #224372 80%, #284D83 100%);
  }

  .lesson__wrap {
    position: fixed;
    top: 0;
    left: 0;

    width: 100vw;
    height: 100vh;

    min-width: 800px;
    min-height: 500px;

    display: flex;
    flex-flow: column;
  }

  .slide__end {
    position: fixed;
    width: 100vw;
    height: 100vh;

    background: #050606;

    .end--txt {
      padding-top: 45px;
      text-align: center;
      font-weight: bold;
    }
  }

  .lesson__header {
    height: 40px;
    padding: 0 20px;

    display: flex;
    justify-content: space-between;
    align-content: center;

    // cursor: pointer;
    background: #fff;
    border-bottom: 1px solid #ddd;

    .cards__title {
      position: relative;

      h3 {
        max-width: 480px;
        overflow: hidden;
        white-space: nowrap;
      }
    }
  }

  .lesson__cards {
    flex: 1;
    height: calc(100vh - 40px);
    max-height: calc(100vh - 40px);

    display: flex;
    justify-content: flex-start;
    align-items: flex-start;

    // background: #fff;
    background: #f5f5f5;
  }

  .cards__nav {
    width: 220px;
    height: 100%;

    padding: 0 0 10px;

    display: flex;
    flex-flow: column;

    overflow: hidden;
    box-shadow: 2px 0 4px rgba(0,0,0,0.2);
    background: #fff;

    .nav__header {
      height: 40px;
      line-height: 40px;
      padding: 0 20px;
      border-bottom: 1px solid #ddd;

      text-align: left;
    }

    .nav__list {
      flex: 1;
      overflow-y: auto;
    }

    .slide__nav {
      display: flex;
      justify-content: flex-start;
      align-items: flex-start;

      padding: 5px 10px 5px;

      cursor: pointer;

      .silde__order {
        width: 20px;
        text-align: left;
      }

      .slide--thumb {
        width: 140px;
        height: 79px;

        object-fit: contain;
        background: #fff;
        border: 1px solid #ddd;
      }
    }

    .active {
      background: #5096F5;

      .silde__order {
        color: #fff;
      }
    }
  }

  .slide__info {
    position: relative;
    flex: 1;
    max-width: calc(100% - 220px);
    height: 100%;

    padding: 20px;

    display: flex;
    justify-content: center;
    align-items: center;

    // background: #f5f5f5;
  }

  .unlock-problem {
    padding: 5px 30px;
    background: #5096F5;
    cursor: pointer;
    &.disabled {
      background: #999;
    }
  }

  .fullscreen {
    top: 0;
    left: 0;

    width: 100vw;
    height: 100vh;

    .lesson__cards {
      height: 100vh;
      max-height: 100vh;
    }

    .slide__info {
      max-width: 100vw;
    }
  }

  .full-btn,
  .end-btn {
    padding: 0 10px;
    height: 30px;
    border: 1px solid #5096F5;
    border-radius: 4px;
  }

  .end-btn {
    border-color: #F84F41;
  }

</style>

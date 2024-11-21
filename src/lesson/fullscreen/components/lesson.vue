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
      </header>
      <!-- 课件内容 -->
      <section class="lesson__cards">
        <nav class="cards__nav" v-show="!fullscreen" v-if="!fold">
          <h3 class="nav__header box-between">
            <span><!-- 课堂动态 -->{{ $t('meeting.dynamics') }}</span>
            <i class="iconfont icon-guanbi1 f16 c9b pointer" @click="handleFold(true)"></i>
          </h3>
          <section class="nav__list">
            <timeline></timeline>
          </section>
        </nav>
        <!-- 展开更多 -->
        <p class="nav__fold box-center pointer" v-if="fold" @click="handleFold(false)">
          <svg class="icon f24 cfff" aria-hidden="true">
            <use xlink:href="#icon16-xiaojiantou-shang"></use>
          </svg>
        </p>
        <!-- 右侧左右布局 -->
        <section class="lesson__container box-center" :class="!fold ? 'notfull' : ''">
          <section class="slide__info J_container" :class="rightType ? 'maxWidth' : ''">
            <!-- 当前或者选中的数据展示 -->
            <router-view></router-view>
          </section>
          <section class="right__layout" v-show="rightType">
            <tougao v-if="rightType == 'tougao'"></tougao>
          </section>
        </section>
        
      </section>
    </section>

  </section>

</template>

<script>
let screenfull = require('screenfull');
import { mapState, mapActions } from 'vuex'

import timeline from './timeline';

import tougao from './tougao'

// 会议模式
const MeetingMode = {
  // 默认 default
  DEFAULT: 0,
  // 九宫格 Jiugongge
  JIUGONGGE: 1,
  // 发言者模式
  SPEAKER: 2
};

let resizeObserver = null

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

      // 导航收起展开
      fold: false,
      fullscreen: false
    };
  },
  computed: {
    // 使用对象展开运算符将 getter 混入 computed 对象中
    ...mapState([
      'lesson',
      'cards',
      'slideIndex',
      'msg',
      'currSlide',
      'rightType'
    ]),

    ...mapState('meeting', [
      'meetingLayout',
    ]),
  },
  components: {
    timeline,
    tougao
  },
  mixins: [ ],
  created() {
  },
  mounted() {
    this.init();
  },
  updated() {},
  beforeDestroy() {
    // window.removeEventListener('resize', this.resize);
  },
  filters: {
  },
  watch: {
    msg(newVal, oldVal) {
      if(!newVal) {
        return this;
      }

      let index = newVal.index || this.cards.length - 1;
      if(index) {
        this.autoJump(index, newVal);
      }
    },
    fullscreen(newVal, oldVal) {
      if(newVal) {
      }
    },

    rightType(newVal) {
      this.$nextTick(() => {
        this.handleSetSize()
      })
      
    },

    slideIndex(newVal){
      if(this.rightType != 'tougao'){
        this.setRightType('')
      }
    },
  },
  methods: {
    ...mapActions([
      'setSlideIndex',
      'setMsg',
      'setLayoutSize',
      'setRightType'
    ]),

    /**
     * @method 页面初始化
     * @params
     */
    init() {
      this.initEvent();
    },

    /**
     * @method 导航收起
     * @params
     */
    handleFold(fold) {
      this.fold = fold;
    },

    /**
     * @method 事件监听
     * @params
     */
    initEvent() {
      // window.addEventListener('resize', this.resize);

      this.$el.focus();
      this.$el.addEventListener('keydown', (e) => {
        // console.dir(e);
        let target = e.target;
        let tagName = target.tagName.toLowerCase()
        if(tagName === 'input' || tagName === 'textarea') {
          return this;
        }

        if(e.keyCode) {
          this.mapKeyCode(e);
        }
      })

      this.resize()
    },

    /**
     * @method 更新ppt宽高
     * @params
     */
    resize() {
      let self = this
      
      resizeObserver = new ResizeObserver(entries => {
        for (let entry of entries) {
          self.handleSetSize()
        }
      });
      resizeObserver.observe(document.querySelector('.lesson__container'));
      
    },

    handleSetSize(){
      let layoutEl = document.querySelector('.J_container')
      let maxWidth = layoutEl.clientWidth;
      let maxHeight = layoutEl.clientHeight;
      this.setLayoutSize({
        maxWidth,
        maxHeight
      })
    },

    checkFullscreen() {
      var fullscreen = document.webkitIsFullScreen || document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement || false

      if (fullscreen !== this.fullscreen) {
        console.log('checkFullscreen', fullscreen);
        // this.setFullscreen(fullscreen);
      }
    },

    /**
     * @method 切换slide
     */
    handleSwitchSlide(index) {
      this.setSlideIndex(index);
    },

    /**
     * @method 自动跳转逻辑
     */
    autoJump(index, slide) {
      // 自动跳转策略
      // 当前页是是放映页 PPT或者白板 新消息是PPT习题白板自动跳

      // todo: 会议全屏模式不自动跳转
      if(this.meetingLayout !== MeetingMode.DEFAULT) {
        return this;
      }

      let curr = this.currSlide;
      // 当前页是放映也
      if(curr && curr.index === this.slideIndex) {
        // PPT或者白板
        if([2, 12].includes(curr.type)) {
          // 消息类型 PPT习题白板自动跳
          if(slide && [2, 3, 12].includes(slide.type)) {
            this.setSlideIndex(index);
            this.setMsg(null);
          }
        }
      }

      // let pageName = this.$route.name;
      // if(pageName === 'ppt-page') {
      // }
    },

    /**
     * @method 键盘事件处理
     * @params
     */
    mapKeyCode(evt) {
      let keyCode = evt.keyCode;

      switch (keyCode) {
        // 上一个
        case 33:
        case 37:
        case 38:
          this.handlePrevSlide();

          break;

        // 下一个
        case 34:
        case 39:
        case 40:
          this.handleNextSlide();

          break;
      }
    },

    /**
     * @method 上一个
     * @params
     */
    handlePrevSlide() {
      // 当前选中位置
      let index = this.slideIndex;
      let prev = this.cards.findIndex((item, i)=>{
        return i > index && item.type !== 1;
      })

      if(~prev) {
        this.setSlideIndex(prev);
        setTimeout(()=>{
          let slideEl = this.$el.querySelector(`.J_slide[data-index="${prev}"]`);
          slideEl && slideEl.scrollIntoView();
        }, 50)
      }
    },

    /**
     * @method 下一个
     * @params
     */
    handleNextSlide() {
      let index = this.slideIndex;
      let cards = this.cards.slice(0, index);
      let next = index - 1;
      cards.forEach((item, i)=>{
        if(item.type !== 1) {
          next = i;
        }
      })

      if(~next) {
        this.setSlideIndex(next);
        setTimeout(()=>{
          let slideEl = this.$el.querySelector(`.J_slide[data-index="${next}"]`);
          slideEl && slideEl.scrollIntoView();
        }, 50)
      }
    }

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

    user-select: none;
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

  .lesson__header {
    height: 40px;
    padding: 0 20px;

    display: flex;
    justify-content: space-between;
    align-content: center;

    // cursor: pointer;
    background: #fff;
    // border-bottom: 1px solid #ddd;
    box-shadow: 0 1px 4px 0 rgba(0,0,0,0.1);
    position: relative;
    z-index: 2;

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
    position: relative;
    flex: 1;
    height: calc(100vh - 40px);
    max-height: calc(100vh - 40px);

    display: flex;
    justify-content: flex-start;
    align-items: flex-start;

    background: #f5f5f5;

    .nav__fold {
      z-index: 1;
      position: absolute;
      top: 50%;
      left: 0;
      transform: translateY(-50%);

      width: 20px;
      height: 100px;

      border-radius: 0 17px 17px 0;
      background: #C8C8C8;

      .icon {
        transform: rotate(90deg);
      }

      &:hover {
        background: rgba(0,0,0,0.7);
      }
    }
  }

  .cards__nav {
    width: 220px;
    height: 100%;

    padding: 0 0 10px;

    display: flex;
    flex-flow: column;

    overflow: hidden;
    box-shadow: 1px 0 4px rgba(0,0,0,0.1);
    background: #fff;

    .nav__header {
      height: 40px;
      line-height: 40px;
      padding: 0 10px 0 10px;
      border-bottom: 1px solid #ddd;

      text-align: left;
    }

    .nav__list {
      flex: 1;
      overflow-y: auto;
    }

    .active {
      background: #5096F5;

      .silde__order {
        color: #fff;
      }
    }
  }
  .lesson__container {
    position: relative;
    flex: 1;
    height: 100%;

    padding: 20px;

    display: flex;
    justify-content: center;
    align-items: center;

    &.notfull {
      max-width: calc(100% - 220px);
    }
  }

  .slide__info {
    flex: 1;
    height: 100%;
    max-width: 100%;
    max-height: 100%;
    &.maxWidth {
      max-width: calc(100% - 380px);
    }
  }

  .right__layout {
    width: 380px;
    height: 100%;
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

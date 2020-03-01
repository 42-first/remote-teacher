/*
 * @page：web上课 ppt详情
 * @author: chenzhou
 * @update: 2020.2.29
 * @desc
 *
 */


<template>
  <section class="lesson__ppt">
    <!-- 内容区 -->
    <div class="cover__container box-center" v-if="slide">
      <img class="cover" :src="slide.src" :style="slide|setStyle" alt="" />
    </div>
  </section>

</template>

<script>
import { mapState, mapActions } from 'vuex'


export default {
  name: "lesson-ppt",
  data() {
    return {
      index: 0,
      slide: null,
    };
  },
  computed: {
    // 使用对象展开运算符将 getter 混入 computed 对象中
    ...mapState([
      'lesson',
      'cards',
    ]),
  },
  mixins: [ ],
  created() {
    // this.index = +this.$route.params.index;
  },
  mounted() {
    this.index = +this.$route.params.index;

    console.log(this.index);
    this.init();
  },
  updated() {},
  beforeDestroy() {
    window.removeEventListener('resize', this.resize);
  },
  filters: {
    setStyle(slide) {
      let oStyle = {};

      let innerHeight = window.innerHeight - 80;
      let innerWidth = window.innerWidth - 220 -40;
      let screenRate = innerWidth/innerHeight;
      let width = slide.Width;
      let height = slide.Height;
      let rate = slide.rate;

      // 截图
      if(slide.type === 10 ) {
        return oStyle;
      }

      // 正常宽高比屏幕的宽高
      if(rate > screenRate) {
        oStyle['width'] = innerWidth + 'px';
        oStyle['height'] = innerWidth/rate + 'px';
      } else {
        oStyle['width'] = innerHeight*rate + 'px';
        oStyle['height'] = innerHeight + 'px';
      }

      return oStyle;
    }
  },
  watch: {
    '$route' (to, from) {
      if(to && to.params && to.name === 'ppt-page') {
        let params = to.params;
        this.index = params.index
      }
    },
    index(newVal, oldVal) {
      let slide = this.cards[this.index];

      this.slide = slide;
    },
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

      // // 监听放映状态
      // document.addEventListener('fullscreenchange', this.resize);
    },

    /**
     * @method 更新ppt宽高
     * @params
     */
    resize() {
      let oStyle = {};

      let innerHeight = window.innerHeight - 80;
      let innerWidth = window.innerWidth - 220 -40;
      let screenRate = innerWidth/innerHeight;
      let width = slide.Width;
      let height = slide.Height;
      let rate = slide.rate;

      // 截图
      if(slide.type === 10 ) {
        return oStyle;
      }

      // 正常宽高比屏幕的宽高
      if(rate > screenRate) {
        oStyle['width'] = innerWidth + 'px';
        oStyle['height'] = innerWidth/rate + 'px';
      } else {
        oStyle['width'] = innerHeight*rate + 'px';
        oStyle['height'] = innerHeight + 'px';
      }

      return oStyle;
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
  .lesson__ppt {
    position: relative;
    width: 100%;
    height: 100%;

    background: #fff;
  }

  .cover__container {

  }

</style>

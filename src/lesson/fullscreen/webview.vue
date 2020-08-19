/*
 * @page：web上课 暂时没有的类型跳转到H5地址
 * @author: chenzhou
 * @update: 2020.3.1
 * @desc
 *
 */


<template>
  <section class="lesson__ppt">
    <!-- 内容区 -->
    <div class="cover__container box-center">
      <iframe class="webview" id="webview" :src="src" allowFullScreen></iframe>
    </div>
  </section>

</template>

<script>
import { mapState, mapActions } from 'vuex'
import $ from 'jquery'


export default {
  name: "lesson-webview",
  data() {
    return {
      index: 0,
      slide: null,
      src: '',
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
  },
  updated() {},
  beforeDestroy() {
  },
  filters: {
  },
  watch: {
    '$route' (to, from) {
      if(to && to.params && to.name === 'webview') {
        let params = to.params;
        this.index = params.index
      }
    },
    index(newVal, oldVal) {
      let slide = this.cards[this.index];
      this.slide = slide;

      this.init(slide);
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
    init(slide) {
      if(slide && slide.type) {
        switch (slide.type) {
          // 试卷
          case 4:
            this.src = slide.href;

            setTimeout(()=>{
              let webviewEl = document.getElementById('webview').contentWindow;
              $(webviewEl).click((evt) => {
                webviewEl.$ && webviewEl.$(evt.target).trigger('tap')
              })
            }, 1500)

            break;

          // 发起了分组
          case 8:
            this.src = slide.href;
            break;

          // 白板
          case 12:
            this.src = `/lesson/student/${this.lesson.lessonID}`;
            break;

          default:
            break;
        }

      }
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
    width: 100%;
    height: 100%;
  }

  .webview {
    width: 375px;
    height: 100%;
    box-shadow: 1px 1px 5px #999;
  }

</style>

/*
 * @page：web上课 暂时没有的类型跳转到H5地址
 * @author: chenzhou
 * @update: 2020.3.12
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


export default {
  name: "lesson-team",
  data() {
    return {
      index: 0,
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
    let query = this.$route.query;
    if(query && query.src) {
      this.src = decodeURIComponent(query.src);
    }
  },
  mounted() {
  },
  updated() {},
  beforeDestroy() {
  },
  watch: {
    '$route' (to, from) {
      if(to && to.params && to.name === 'team') {
      }
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

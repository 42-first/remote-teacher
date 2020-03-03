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
      <!-- <img class="cover" :src="slide.src" :style="slide|setStyle" alt="" /> -->
      <img class="cover" :src="slide.src" alt="" />
    </div>

    <!-- 不懂收藏 -->
    <section class="ppt__opt f12 c9b" v-if="slide && slide.type===2" >
      <div class="opt__action pb10" @click="handleTag(1)">
        <i class="iconfont icon--budongnormal f24 " :class="[ slide.hasQuestion ? 'red': 'c666' ]"></i>
        <p><!-- 不懂 -->{{ $t('unknown') }}</p>
      </div>
      <div class="opt__action" @click="handleTag(2)">
        <i class="iconfont icon--shoucangactive f24" :class="[ slide.hasStore? 'red': 'c666' ]"></i>
        <p><!-- 收藏 -->{{ $t('favorite') }}</p>
      </div>
    </section>
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
      style: {},
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
  },
  mounted() {
    this.index = +this.$route.params.index;

    this.init(this.index);
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
      if(this.cards && this.cards.length) {
        let slide = this.cards[newVal];
        this.slide = slide;
      } else {
        setTimeout(()=>{
          let slide = this.cards[newVal];
          this.slide = slide;
        }, 1000)
      }
    },
  },
  methods: {
    ...mapActions([
      'setCards',
    ]),

    /**
     * @method 页面初始化
     * @params
     */
    init(index) {
      let slide = this.cards[index];
      if(slide) {
        this.slide = slide;
      }

      this.initEvent();
    },

    /**
     * @method 事件监听
     * @params
     */
    initEvent() {
      // window.addEventListener('resize', this.resize);
    },

    /**
     * @method 更新ppt宽高
     * @params
     */
    resize() {
      let slide = this.slide;
      let oStyle = {};

      if(!slide) {
        return this;
      }

      let innerHeight = this.$el.innerHeight - 80;
      let innerWidth = this.$el.innerWidth - 220 -40;
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
     * @method 不懂收藏
     * @ tag 1 不懂 2 收藏
     */
    handleTag(tag) {
      let URL = API.student.SET_LEESON_SILDE_TAG;
      let cards = this.cards;
      let slide = this.slide;
      let slideID = slide.slideID;

      let ppts = cards.filter((card, index)=>{
        return card.slideID === slideID;
      })

      // 确实是否不懂
      let tagType = ppts.length && ppts[0].hasQuestion ? 'cancel' : 'add';
      // 是否收藏
      if(tag === 2) {
        tagType = ppts.length && ppts[0].hasStore ? 'cancel' : 'add';
      }

      let param = {
        'tag': tag,
        'lessonSlideID': slideID,
        'tagType': tagType
      }

      request.post(URL, param).
      then( (res) => {
        if(res) {
          if (res.msg === '标记已存在,不能反复提交' || res.msg === '标记不存在') {
            return;
          }

          ppts.forEach( (item, index) => {
            tag === 1 && (item.hasQuestion = !item.hasQuestion);
            tag === 2 && (item.hasStore = !item.hasStore);
          });

          if(tag === 1) {
            slide['question'] = ppts.length && ppts[0].hasQuestion ? 1 : 0;
            slide.hasQuestion = ppts[0].hasQuestion;
          } else if(tag === 2) {
            slide['store'] = ppts.length && ppts[0].hasStore ? 1 : 0;
            slide.store = ppts[0].hasStore;
          }

          this.setCards(cards);
        }
      });

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
    .cover {
      object-fit: contain;
    }
  }

  .ppt__opt {
    position: fixed;
    top: 50%;
    right: 10px;

    transform: translateY(-50%);

    width: 60px;
    height: 120px;

    display: flex;
    flex-flow: column;
    align-items: center;
    justify-content: center;

    background: #fff;
    border: 1px solid #c8c8c8;
    border-radius: 2px;

    .opt__action {
      cursor: pointer;
      line-height: 1.3;
    }
  }

</style>

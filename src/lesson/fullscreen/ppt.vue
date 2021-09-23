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
      <img class="cover" :src="slide.src" :style="style" alt="" />
    </div>

    <!-- 不懂收藏 -->
    <section class="ppt__opt f12 cfff" v-if="slide && slide.type===2" >
      <div class="opt__action pb10" @click="handleTag(1)">
        <i class="iconfont f20 cfff" :class="[ slide.hasStore ? 'icon-shoucangjihuo-': 'icon-shoucang-' ]"></i>
        <p><!-- 收藏 -->{{ $t('favorite') }}</p>
      </div>
      <div class="opt__action" @click="handleTag(0)">
        <i class="iconfont f20 cfff" :class="[ slide.hasQuestion ? 'icon-budongjihuo': 'icon-budong-' ]"></i>
        <p><!-- 不懂 -->{{ $t('unknown') }}</p>
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
      if(to && to.params && to.name === 'ppt') {
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
      } else {
        setTimeout(()=>{
          let slide = this.cards[index];
          slide && (this.slide = slide);
        }, 2000)
      }

      this.initEvent();
    },

    /**
     * @method 事件监听
     * @params
     */
    initEvent() {
      window.addEventListener('resize', this.resize);
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

      let container = document.querySelector('.J_container')

      let innerHeight = window.innerHeight - 80;
      // let innerWidth = window.innerWidth - 220 -40;
      // 直接获取图片展示区域的宽度  有可能左侧导航会被关闭
      let innerWidth = container.clientWidth - 40;
      let screenRate = innerWidth/innerHeight;
      let width = slide.Width;
      let height = slide.Height;
      let rate = slide.rate;

      // 截图
      if(slide.type === 10 ) {
        return oStyle;
      }

      let resultRate = screenRate > rate ? innerHeight/height : innerWidth/width

      oStyle['width'] = slide.Width * resultRate + 'px' 
      oStyle['height'] = slide.Height * resultRate + 'px' 

      this.style = oStyle
    },

    /**
     * @method 不懂收藏
     * @ tag 1 不懂 2 收藏
     */
    handleTag(type) {
      let URL = API.lesson.post_tag;
      let cards = this.cards;
      let slide = this.slide;
      let slideID = slide.slideID;

      let ppts = cards.filter((card, index)=>{
        return card.slideID === slideID;
      })

      // 取消还是新增
      let action = ppts.length && ppts[0].hasQuestion ? 1 : 0;
      // 是否收藏
      if(type === 1) {
        action = ppts.length && ppts[0].hasStore ? 1 : 0;
      }

      let params = {
        'type': type,
        'action': action,
        'presentationId': slide.presentationid,
        'objId': slideID,
        'objType': 0,
      };

      request.post(URL, params).
      then((res)=>{
        if(res && res.code === 0) {
          let data = res.data;

          ppts.forEach( (item) => {
            if(type === 0) {
              item.hasQuestion = !item.hasQuestion;
              slide && (slide.question = item.hasQuestion ? 1 : 0);
            } else if(type === 1) {
              item.hasStore = !item.hasStore;
              slide && (slide.store = item.hasStore ? 1 : 0);
            }
          });

          this.setCards(cards);
        }
      }).
      catch(error => {
        console.log('handleTag:', error);
      })
    },

  }
};
</script>

<style lang="scss" scoped>
  .lesson__ppt {
    position: relative;
    width: 100%;
    height: 100%;

    // background: #fff;
  }

  .cover__container {
    width: 100%;
    height: 100%;

    .cover {
      object-fit: contain;
      max-height: 100%;
    }
  }

  .ppt__opt {
    position: fixed;
    top: 50%;
    right: 15px;

    transform: translateY(-50%);

    width: 50px;
    height: 118px;

    display: flex;
    flex-flow: column;
    align-items: center;
    justify-content: center;

    background: rgba(0,0,0,0.7);
    // border: 1px solid #c8c8c8;
    border-radius: 4px;

    .opt__action {
      cursor: pointer;
      line-height: 1.3;
    }
  }

</style>

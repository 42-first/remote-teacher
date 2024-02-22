/*
 * @page：web上课 ppt详情
 * @author: chenzhou
 * @update: 2020.2.29
 * @desc
 *
 */


<template>
  <section class="board__page">
    <!-- 白板屏幕宽高 增加自定义指令解决数据改变canvas被清空大坑 v-canvas="slide" -->
    <div class="board__info" v-if="slide" >
      <canvas :id="'canvas_'+slide.boardid" class="board__canvas" :width="slide.devwidth" :height="slide.devheight" :style="{transform: 'scale(' + scaleValue + ')'}" ></canvas>
    </div>

    <!-- 不懂收藏 -->
    <section class="ppt__opt f12 cfff" v-if="slide && slide.type===12 && !inspectorMode" >
      <div class="opt__action pb10" @click="handleBoardTag(1, slide.boardid, slide.emphasis)">
        <i class="iconfont f20" :class="[ slide.emphasis ? 'icon-shoucangjihuo-': 'icon-shoucang-' ]"></i>
        <p><!-- 收藏 -->{{ $t('favorite') }}</p>
      </div>
      <div class="opt__action" @click="handleBoardTag(0, slide.boardid, slide.doubt)">
        <i class="iconfont f20 " :class="[ slide.doubt ? 'icon-budongjihuo': 'icon-budong-' ]"></i>
        <p><!-- 不懂 -->{{ $t('unknown') }}</p>
      </div>
    </section>
  </section>

</template>

<script>
import { mapState, mapActions } from 'vuex'

import boardmixin from '@/lesson/fullscreen/mixin/board-mixin'


export default {
  name: "lesson-board",
  data() {
    return {
      index: 0,
      slide: null,
      boardInfo: null,
      scaleValue: 1
    };
  },
  computed: {
    // 使用对象展开运算符将 getter 混入 computed 对象中
    ...mapState([
      'lesson',
      'cards',
      'boardMsg',
      'inspectorMode',
    ]),
  },
  mixins: [ boardmixin ],
  created() {
  },
  mounted() {
    this.index = +this.$route.params.index;

    let slide = this.cards[this.index];
    if(slide) {
      this.slide = slide;
    }

    window.addEventListener('resize', this.scaleCanvas);
  },
  updated() {},
  beforeDestroy() {
    window.removeEventListener('resize', this.scaleCanvas);
  },
  filters: {
  },
  watch: {
    '$route' (to, from) {
      if(to && to.params && to.name === 'board-v3') {
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
        }, 1500)
      }
    },
    slide(newVal, oldVal) {
      if(newVal.boardid) {
        let id = newVal.boardid;

        this.initBoard(id);
      }
    },
    boardMsg(newVal, oldVal) {
      if(newVal) {
        if('draw' === newVal.type) {
          this.simulationDrawing(newVal);
        } else {
          this.clearScreen(this.boardInfo);
        }
      }
    }
  },
  methods: {
    ...mapActions([
      'setCards',
    ]),

    /**
     * @method 页面初始化
     * @params
     */
    initBoard(id) {
      let boardMap = this.$parent.$parent.boardMap;

      let boardInfo = boardMap && boardMap.get(id);
      if(boardInfo) {
        this.boardInfo = boardInfo;

        setTimeout(()=>{
          this.clearScreen(boardInfo);
          this.restore(boardInfo);
        }, 0)
      } else {
        setTimeout(()=>{
          this.initBoard(id);
        }, 1500)
      }

      this.scaleCanvas()
    },

    /*
     * @method 白板不懂,收藏
     * boardid 白板ID tag 1 不懂 2 收藏
     */
    handleBoardTag(type, boardid, value) {
      let URL = API.lesson.post_tag;
      let action = value ? 1 : 0;
      let params = {
        'type': type,
        'action': action,
        'objId': new String(boardid),
        'objType': 1
      };
      let cards = this.cards;

      // 同步白板信息 更新cards信息
      let boardInfo = cards.find((card)=>{
        return card.boardid === boardid;
      })

      request.post(URL, params).
      then((res)=>{
        if(res && res.code === 0) {
          type === 0 && (boardInfo.doubt = !boardInfo.doubt);
          type === 1 && (boardInfo.emphasis = !boardInfo.emphasis);

          this.setCards(cards);
          this.slide = boardInfo;
        }
      }).
      catch(error => {
        console.log('handleBoardTag:', error);
      })
    },

    scaleCanvas() {
      let item = this.slide
      if(item) {
        let wrapWidth = document.querySelector('.J_container').clientWidth - 40
        let wrapHeight = document.querySelector('.J_container').clientHeight - 40
        let wrapRate = wrapWidth / wrapHeight
        let innerRate = item.devwidth / item.devheight
        this.scaleValue = wrapRate > innerRate ?  wrapHeight / item.devheight : wrapWidth / item.devwidth;
      }
    },

  }
};
</script>

<style lang="scss" scoped>
  .board__page {
    position: relative;
    width: 100%;
    height: 100%;

    background: #fff;
  }

  .board__info {
    width: 100%;
    height: 100%;

    .board__canvas {
      transform-origin: 0 0;
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

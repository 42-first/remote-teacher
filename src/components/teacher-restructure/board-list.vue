/*
 * 白板列表
 * @author: chenzhou
 * @update: 2018.11.13
 */

<template>
  <section class="board__wrap">

    <!-- 白板绘制 -->
    <div class="timeline__ppt" v-for="board in boards">
      <!-- 白板屏幕宽高 -->
      <div class="ppt__cover--wrapper" :style="{ height: (10 - 0.906667)/board.rate + 'rem' }" >
        <canvas :id="'canvas_'+board.board_id" class="board__container" :width="board.content.width" :height="board.content.height" :style="board|scaleCanvas" v-canvas="board"></canvas>
      </div>
      <div class="ppt-footer">
        <p class="ppt__time f16 c9b">{{ $t('pno', { number: board.index }) }}</p>
        <div class="ppt__opt f15 c33" >
          <p><span>{{ $t('unknown') }}:</span><span class="pl10">{{ board.doubt_count }}</span></p>
        </div>
      </div>
    </div>

  </section>

</template>
<script>
  import '@/util/directive-util'
  // import {mapGetters} from 'vuex'
  import request from '@/util/request'
  import API from '@/pages/teacher/config/api'


  export default {
    name: 'board-list',
    data() {
      return {
        boards: [],
      };
    },
    watch: {
    },
    computed: {
      // ...mapGetters([
      //   'lessonid',
      // ])
    },
    filters: {
      scaleCanvas(item) {
        let scaleValue = (window.innerWidth / 10 * (10 - 0.906667)) / item.width;
        return { transform: 'scale(' + scaleValue + ')' };
      }
    },
    methods: {
      /*
       * @method 读取白板数据
       */
      getBoardList(lessonid) {
        let url = API.get_board_list;
        let params = {
          'lesson_id': lessonid
        };

        request.get(url, params)
        .then(res => {
          if(res && res.success) {
            let data = res.data;

            this.boards = this.formatData(data && data.doubt_board_list);
          }
        })
      },

      /*
       * @method 白板数据格式化
       */
      formatData(list) {
        let width = 1200;
        let height = 800;

        if(list) {
          list.forEach((board) => {
            board.content.width = board.content.width || width;
            board.content.height = board.content.height || height;

            board.rate = board.content.width/board.content.height;
            board.lines = board.content && board.content.track_history;
          })
        }

        return list;
      }
    },
    created() {
      this.lessonid = +this.$route.params.lessonid;
      this.getBoardList(this.lessonid);
    },
    mounted() {
    },
    beforeDestroy() {
    }
  };
</script>

<style lang="scss">

  .pl10 {
    padding-left: 0.2rem;
  }

  /*--------------------*\
    $ 白板列表
  \*--------------------*/


  .timeline__ppt {
    position: relative;
    margin: 0.266667rem auto 0.4rem;
    padding-bottom: 0.4rem;
    width: calc(100% - 0.533333rem);
    border-bottom: 1px solid #C8C8C8;

    .ppt__cover--wrapper {
      margin: 0 auto 0.32rem;
      width: 100%;

      border: 1px solid #C8C8C8;
      overflow: hidden;
    }

    .ppt-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;

      .ppt__opt {
        display: flex;
        align-items: center;
        justify-content: space-between;

      }
    }

  }

  .board__container {
    transform-origin: 0 0;
    transform: scale(0.5);
  }


</style>








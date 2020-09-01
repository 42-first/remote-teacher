/*
 * 白板列表
 * @author: chenzhou
 * @update: 2018.11.13
 */

<template>
  <section class="board__wrap">

    <div class="timeline__ppt" v-for="board in boards" :key="board.id">
      <div class="ppt__cover--wrapper">
        <img class="border--cover" :src="board.cover" />
      </div>
      <div class="ppt-footer">
        <p class="ppt__time f16 c9b">{{ $t('pno', { number: board.index }) }}</p>
        <div class="ppt__opt f15 c33" >
          <p><span>{{ $t('unknown') }}:</span><span class="pl10">{{ board.count }}</span></p>
        </div>
      </div>
    </div>

  </section>

</template>
<script>
  import '@/util/directive-util'
  // import {mapGetters} from 'vuex'
  import request from '@/util/request-v3'
  import API from '@/util/api'


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
      getBoardList() {
        let url = API.lesson.get_file_sharing;

        request.get(url)
        .then(res => {
          if(res && res.code === 0 && res.data) {

            this.boards = res.data;
          }
        })
      },
    },
    created() {
      this.getBoardList();
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

  .board__wrap {
    width: 100%;
    height: 100%;
    background: #fff;
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
      background: #fff;
    }

    .border--cover {
      display: block;
      width: 100%;
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








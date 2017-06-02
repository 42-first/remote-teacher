/*
 * 学生接收器 timeline item
 * @author: chenzhou
 * @update: 2017.5.31
 */

<template>
  <!--  -->
  <section class="timeline-item" v-if="item">

    <!-- type : 1消息 2ppt 3习题 4试卷 5红包 -->
    <template v-if="item.type==1"><div class="timeline__msg f15">{{ item.message }}</div></template>
    <!-- ppt模板 -->
    <template v-else-if="item.type==2">
      <div class="timeline__ppt">
        <span class="ppt--pageno f14">第{{ item.pageIndex }}页</span>
        <div class="ppt__cover--wrapper" :style="{ height: (10 - 0.906667)/item.rate + 'rem' }">
          <img class="cover" :src="item.src" >
        </div>
        <div class="ppt-footer">
          <p class="ppt__time f16">{{ item.time|getTimeago }}</p>
          <div class="ppt__opt f15" :data-pageindex="item.pageIndex" :data-presentationid="item.presentationid">
            <p :class="['ppt--action', item.hasQuestion ? 'selected' : '']" @click="handleQuestion(item.pageIndex, item.presentationid)">不懂</p>
            <p :class="['ppt--action', item.hasStore ? 'selected' : '']" @click="handleStore(item.pageIndex, item.presentationid)">收藏</p>
          </div>
        </div>
      </div>
    </template>
    <!-- 试卷模板 -->
    <template v-else-if="item.type==4">
      <div class="timeline__paper">
        <div class="">
          <a :class="['paper-info', item.isComplete ? 'complete' : '']" :href="item.href" :data-quizid="item.quizid">
            <div class="paper-txt f18">
              <p class="paper-name">{{ item.papername }}</p>
              <p class="paper-count">共{{ item.count }}题</p>
            </div>
            <div class="">
              <!-- http://sfe.ykt.io/o_1bhh6gui01h1nirm1l7j2gt12tv9.png -->
              <img class="paper-icon" src="http://sfe.ykt.io/o_1bhjoe1sn1vhc1ltcu4o16pk344e.png">
            </div>
          </a>
        </div>
        <div class="item-footer">
          <p class="f16" :data-time="item.time">{{ item.time|getTimeago }}</p>
          <div class="f14">
            <span class="status">{{ item.status }}</span>
          </div>
        </div>
      </div>
    </template>
    <!-- 红包模板 -->
    <template v-else-if="item.type==5">
      <div class="timeline__paper">
        <div :class="['paper-info', 'hongbao']">
            <div class="paper-txt f18">
              <p class="paper-name">{{ item.caption }}</p>
            </div>
            <div class="">
              <!--  http://sfe.ykt.io/o_1bhhfttettbskmu8u61vd91plse.png -->
              <img class="paper-icon" src="http://sfe.ykt.io/o_1bhjob08v13oh1qu29uh1hlc1d8l9.png">
            </div>
        </div>
        <div class="item-footer">
          <p class="f16" :data-time="item.time">{{ item.time|getTimeago }}</p>
          <div class="f14">
            <span class="status">{{ item.status }}</span>
          </div>
        </div>
      </div>
    </template>
    <!-- 习题模板 -->
    <template v-else-if="item.type==3">
     <div class="timeline__paper">
        <div :class="['paper-info', 'xt', item.isComplete ? 'complete' : '']" :data-quizid="item.quizid">
            <div class="paper-txt f18">
              <p class="paper-name">{{ item.caption }}</p>
              <p class="paper-count">第{{ item.pageIndex }}题</p>
            </div>
            <div class="">
              <!-- http://sfe.ykt.io/o_1bhhfkpq9nu21eua1uf71a6519pj9.png -->
              <img class="paper-icon" src="http://sfe.ykt.io/o_1bhjoe5h81cp41vadqbl6aidb8j.png">
            </div>
        </div>
        <div class="item-footer">
          <p class="f16" :data-time="item.time">{{ item.time|getTimeago }}</p>
          <div class="f14">
            <span class="status">{{ item.status }}</span>
          </div>
        </div>
      </div>
    </template>

  </section>

</template>
<script>
  import timeago from 'timeago.js';

  // 在这里设置相对时间
  var timeagoInstance = timeago(null, new Date());

  export default {
    name: 'card-item',
    props: {
      item: null
    },
    data() {
      return {
      };
    },
    watch: {
    },
    computed: {

    },
    filters: {
      getTimeago(time) {
        return timeagoInstance.format(time, 'zh_CN');
      }
    },
    methods: {
    },
    created() {
    },
    mounted() {
    },
    beforeDestroy() {
    }
  };
</script>

<style lang="scss">

  .timeline-item {
    margin: 0 auto;
    width: calc(100% - 0.906667rem);
    border-bottom: 1px solid #C8C8C8;
  }


  /*--------------------*\
    $ common
  \*--------------------*/

  .item-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  /*--------------------*\
    $ event消息
  \*--------------------*/

  .timeline__msg {
    margin: 0.4rem auto;
    width: 5.333333rem;
    height: 0.8rem;
    line-height: 0.8rem;

    text-align: center;
    color: #fff;
    background: #9B9B9B;

    border-radius: 0.4rem/50%;
  }



  /*--------------------*\
    $ ppt模板
  \*--------------------*/


  .timeline__ppt {
    position: relative;
    margin: 0.266667rem auto 0.4rem;
    width: 100%;

    .ppt__cover--wrapper {
      margin: 0 auto 0.32rem;
      width: 100%;

      border: 1px solid #C8C8C8;
      overflow: hidden;

      .cover {
        display: block;
        width: 100%;
      }
    }

    .ppt--pageno {
      position: absolute;
      top: 0;
      left: 0;

      padding: 6px 14px;
      color: #fff;
      background: rgba(37,37,37, 0.6);
    }

    .ppt-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;

      .ppt__opt {
        display: flex;
        align-items: center;
        justify-content: space-between;

        .ppt--action {
          margin-left: 0.266667rem;
          width: 1.6rem;
          height: 0.666667rem;

          color: #639EF4;
          border: 1px solid #639EF4;
          border-radius: 0.333333rem/50%;
        }

        .selected {
          color: #fff;
          background: #639EF4;
        }
      }
    }

  }



  /*--------------------*\
    $ 试卷模板
  \*--------------------*/


  .timeline__paper {
    margin: 0.4rem auto;

    .paper-info {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: space-between;

      margin-bottom: 0.266667rem;
      padding: 0.28rem 0.586667rem 0.32rem 0.4rem;

      color: #FFFFFF;
      background: rgba(40,207,110,0.7);

      border-radius: 4px;

      .paper-txt {
        text-align: left;
      }
    }

    .paper-info.xt {
      background: rgba(99,158,244,0.7);
    }

    .paper-info.hongbao {
      color: #FFE595;
      background: #e64340;
    }

    .paper-info.complete,
    .paper-info.xt.complete {
      background: #C8C8C8;
    }

    .paper-icon {
      display: block;
      width: 1.386667rem;
    }
  }


</style>










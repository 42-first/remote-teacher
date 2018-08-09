/*
 * 学生接收器 消息box item
 * @author: chenzhou
 * @update: 2017.5.31
 */

<template>

  <section class="popup-item" v-if="item">
    <!-- type : 3习题 4试卷 8分组 9:互评 -->
    <!-- 试卷模板 -->
    <template v-if="item.type==4">
      <div class="popup__paper">
        <div class="paper-info">
          <a class="paper-txt f17" :href="item.href" @click="handlelink(index, $event)">
            <p class="icon-wrapper"><i class="iconfont icon-shiti_shijuan f32"></i></p>
            <p class="paper-name">{{ item.papername }}</p>
          </a>
          <i class="iconfont gray icon-shiti_guanbitouping f25" @click="handledelMag(index, $event)"></i>
        </div>
      </div>
    </template>
    <!-- 习题模板 -->
    <template v-else-if="item.type==3">
     <div class="popup__paper">
        <!-- 主观题作答链接 -->
        <div :class="['paper-info', 'xt', item.isComplete ? 'complete' : '']"  v-if="item.problemType==='ShortAnswer'" @click="handlelink(index, $event)">
          <router-link class="paper-txt f17" :to="'/'+lessonid+'/subjective/'+item.index" >
            <p class="icon-wrapper"><i class="iconfont icon-ykq_shiti f32"></i></p>
            <p class="paper-name">{{ item.caption }}</p>
           </router-link>
          <i class="iconfont gray icon-shiti_guanbitouping f25"></i>
        </div>
        <!-- 客观题作答链接 -->
        <div :class="['paper-info', 'xt', item.isComplete ? 'complete' : '']" v-else @click="handlelink(index, $event)">
          <router-link class="paper-txt f17" :to="'/'+lessonid+'/exercise/'+item.index" >
            <p class="icon-wrapper"><i class="iconfont icon-ykq_shiti f32"></i></p>
            <p class="paper-name">{{ item.caption }}</p>
          </router-link>
          <i class="iconfont gray icon-shiti_guanbitouping f25"></i>
        </div>
      </div>
    </template>
    <!-- 分组模板 -->
    <template v-else-if="item.type==8">
      <div class="popup__paper">
        <div class="paper-info fenzu">
          <a class="paper-txt f17" :href="item.href" @click="handlelink(index, $event)">
            <p class="icon-wrapper"><i class="iconfont icon-fenzu f32"></i></p>
            <p class="paper-name" v-if="item.groupType ==='random'"><!-- Hi，老师进行了随机分组 -->{{ $t('team.randomized') }}</p>
            <p class="paper-name" v-else-if="item.groupType ==='free'">{{ $t('team.freegrouping') }}</p>
          </a>
          <i class="iconfont gray icon-shiti_guanbitouping f25" @click="handledelMag(index, $event)"></i>
        </div>
      </div>
    </template>
    <!-- 互评模板 -->
    <template v-else-if="item.type==9">
     <div class="popup__paper">
        <div :class="['paper-info', 'evaluation', item.isComplete ? 'complete' : '']" @click="handlelink(index, $event)">
          <router-link class="paper-txt f17" :to="'/'+lessonid+'/evaluation/'+item.index" >
            <p class="icon-wrapper"><i class="iconfont icon-huping f32"></i></p>
            <p class="paper-name"><!-- Hi，老师发起了互评 -->{{ $t('grading.launchedgrading') }}</p>
          </router-link>
          <i class="iconfont gray icon-shiti_guanbitouping f25"></i>
        </div>
      </div>
    </template>

  </section>

</template>
<script>
  export default {
    name: 'popup-item',
    props: {
      index: 0,
      lessonid: 0,
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
    },
    methods: {
      /*
      * @method 删除box
      * index
      */
      handledelMag(index, evt) {
        this.$parent.msgBoxs.splice(index, 1);
      },
      handlelink(index, evt) {
        this.$parent.msgBoxs.splice(index, 1);
      }
    },
    created() {
      let msgBoxs = this.$parent.msgBoxs;
    },
    mounted() {
      let self = this;
    },
    beforeDestroy() {
    }
  };
</script>

<style lang="scss">
  .popup-item {
    margin: 0 auto;
    width: 9.466667rem;

    a {text-decoration: none;}
  }


  /*--------------------*\
    $ 试卷模板
  \*--------------------*/


  .popup__paper {
    margin: 0 auto 0.2rem;

    .paper-info {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: space-between;

      padding: 0.2rem 0.333333rem;

      color: #4A4A4A;
      background: #fff;

      border-radius: 4px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.2);

      .paper-txt {
        display: flex;
        align-items: center;
        justify-content: flex-start;
        text-align: left;

        .icon-wrapper {
          width: 1.2rem;
          height: 1.2rem;
          background: #28CF6E;
          border-radius: 4px;

          .iconfont {
            display: block;
            margin: auto;
            line-height: 1.2rem;
            text-align: center;
            color: #fff;
          }
        }

        .paper-name {
          padding-left: 0.333333rem;
          width: 6.66rem;
          color: #4A4A4A;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
        }
      }

      .iconfont.gray {
        color: #9B9B9B;
      }
    }

    .paper-info.xt .paper-txt .icon-wrapper {
      background: #639EF4;
    }

    .paper-info.fenzu .paper-txt .icon-wrapper {
      background: #71D2A5;
    }

    .paper-icon {
      display: block;
      width: 1.386667rem;
      min-height: 1.546667rem
    }

  }


</style>










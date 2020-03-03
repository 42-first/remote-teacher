/*
 * 学生接收器 消息box video中
 * @author: chenzhou
 * @update: 2020.3.3
 */

<template>
  <section class="msg__container" :class="{ 'fullscreen': videoFullscreen }">
    <!-- <div class="msg__box box-between cfff subjective" @click="handleLink(slide)">
      <section class="box-start pr10">
        <div class="icon__wrap box-center">
          <i class="iconfont icon-ykq_shiti cfff f24"></i>
        </div>
        <p class="pl10 f16">{{ $t('sharesubjective') }}</p>
      </section>
      <i class="iconfont icon-shiti_guanbitouping f24" @click="handleClosedMsg"></i>
    </div> -->

    <!-- 消息模板一 试卷 习题 分组 互评 -->
    <!-- 试卷模板 -->
    <template v-if="slide && slide.type==4">
      <div class="msg__box box-between cfff quiz">
        <section class="box-start" @click="handleLink(slide)">
          <p class="pl10 f16 cfff">{{ slide.papername }}</p>
          <span class="blue anwser--tip">去作答</span>
        </section>
        <i class="iconfont icon-shiti_guanbitouping f24" @click="handleClosedMsg"></i>
      </div>
    </template>
    <!-- 习题模板 -->
    <template v-else-if="slide && slide.type==3">
      <div class="msg__box box-between cfff problem">
        <section class="box-start" @click="handleLink(slide)">
          <p class="pl10 f16 cfff">{{ slide.caption }}</p>
          <span class="blue anwser--tip">去作答</span>
        </section>
        <i class="iconfont icon-shiti_guanbitouping f24" @click="handleClosedMsg"></i>
      </div>
    </template>
    <!-- 分组模板 -->
    <template v-else-if="slide && slide.type==8">
      <div class="msg__box box-between cfff fenzu">
        <section class="box-start" @click="handleLink(slide)">
          <p class="pl10 f16 cfff" v-if="slide.groupType ==='random'"><!-- Hi，老师进行了随机分组 -->{{ $t('team.randomized') }}</p>
          <p class="paper-name" v-else-if="slide.groupType ==='free'">{{ $t('team.freegrouping') }}</p>
        </section>
        <i class="iconfont icon-shiti_guanbitouping f24" @click="handleClosedMsg"></i>
      </div>
    </template>
    <!-- 互评模板 -->
    <template v-else-if="slide && slide.type==9">
      <div class="msg__box box-between cfff evaluation">
        <section class="box-start" @click="handleLink(slide)">
          <p class="pl10 f16 cfff"><!-- Hi，老师发起了互评 -->{{ $t('grading.launchedgrading') }}</p>
        </section>
        <i class="iconfont icon-shiti_guanbitouping f24" @click="handleClosedMsg"></i>
      </div>
    </template>

    <!-- 消息模板二 红包 分享 答案解析 -->
    <!-- 红包 -->
    <template v-else-if="slide && slide.type==5">
      <div class="msg__box box-between cfff hongbao">
        <section class="box-start" @click="handleLink(slide)">
          <div class="icon__wrap box-center">
            <i class="iconfont icon-shiti_hongbao cfff f24"></i>
          </div>
          <p class="pl10 f16">{{ $t('recvbonus') }}</p>
        </section>
        <i class="iconfont icon-shiti_guanbitouping f24" @click="handleClosedMsg"></i>
      </div>
    </template>
    <!-- 投稿分享 -->
    <template v-else-if="slide && slide.type==6">
      <div class="msg__box box-between cfff submission">
        <section class="box-start" @click="handleLink(slide)">
          <div class="icon__wrap box-center">
            <i class="iconfont icon-ykq_tab_tougao cfff f24"></i>
          </div>
          <p class="pl10 f16"><!-- Hi, 老师正在分享课堂投稿 -->{{ $t('sharepostpush') }}</p>
        </section>
        <i class="iconfont icon-shiti_guanbitouping f24" @click="handleClosedMsg"></i>
      </div>
    </template>
    <!-- 主观题答案分享 -->
    <template v-else-if="slide && slide.type==7">
      <div class="msg__box box-between cfff subjective" >
        <section class="box-start pr10" @click="handleLink(slide)">
          <div class="icon__wrap box-center">
            <i class="iconfont icon-ykq_shiti cfff f24"></i>
          </div>
          <p class="pl10 f16"><!-- Hi, 老师正在分享主观题答案 -->{{ $t('sharesubjective') }}</p>
        </section>
        <i class="iconfont icon-shiti_guanbitouping f24" @click="handleClosedMsg"></i>
      </div>
    </template>
    <!-- 问题解析 -->
    <template v-else-if="slide && slide.type==13">
      <div class="msg__box box-between cfff analysis">
        <section class="box-start pr10" @click="handleLink(slide)">
          <div class="icon__wrap box-center">
            <i class="iconfont icon-ykq_shiti cfff f24"></i>
          </div>
          <p class="pl10 f16">{{ slide.caption }}</p>
        </section>
        <i class="iconfont icon-shiti_guanbitouping f24" @click="handleClosedMsg"></i>
      </div>
    </template>

  </section>

</template>
<script>
  import { mapState, mapActions } from 'vuex'

  let screenfull = require('screenfull');

  export default {
    name: 'mag-box',
    props: {
      videoFullscreen: Boolean
    },
    data() {
      return {
        slide: null
      };
    },
    watch: {
      msg(newVal, oldVal) {
        // 过滤消息
        if(newVal && newVal.type !==2) {
          this.slide = newVal;
        } else if(!newVal) {
          this.slide = null;
        }
      }
    },
    computed: {
      // 使用对象展开运算符将 getter 混入 computed 对象中
      ...mapState([
        'cards',
        'msg'
      ]),
    },
    methods: {
      ...mapActions([
        'setSlideIndex',
        'setMsg',
      ]),

      /*
      * @method 打开链接
      * index
      */
      handleLink(slide) {
        let slideIndex = slide.index || this.cards.length - 1;

        if(~slideIndex) {
          this.setSlideIndex(slideIndex);
        }

        this.setMsg(null);

        // 退出全屏
        if(screenfull.isFullscreen) {
          screenfull.exit()
        }
      },

      /**
       * @method 关闭消息
       * index
       */
      handleClosedMsg() {
        this.setMsg(null);
      }
    },
    created() {
    },
    mounted() {
    },
    beforeDestroy() {
    }
  };
</script>

<style lang="scss" scoped>
  .msg__container {
    position: absolute;
    right: 5px;
    bottom: 45px;

    &.fullscreen {
      bottom: 96px;
      left: 50%;
      right: initial;

      transform: translateX(-50%);

      .anwser--tip  {
        margin: 0 20px;
      }
    }
  }

  .anwser--tip  {
    margin: 0 10px;
    padding: 3px 10px;
    color: #fff;
    background: #5096F5;
    border-radius: 15px/50%;
  }

  .msg__box {
    min-width: 300px;
    height: 60px;
    padding: 0 15px;

    background: rgba(0,0,0, 0.5);
    border-radius: 4px;

    cursor: pointer;

    .icon__wrap {
      width: 40px;
      height: 40px;
      border-radius: 50%;
    }
  }


</style>


/*
 * 学生接收器 消息box item
 * @author: chenzhou
 * @update: 2020.3.1
 */

<template>
  <section class="msg__container">
    <!-- <div class="msg__box box-between cfff subjective" @click="handleLink(item)">
      <section class="box-start pr10">
        <div class="icon__wrap box-center">
          <i class="iconfont icon-ykq_shiti cfff f24"></i>
        </div>
        <p class="pl10 f16 c333">{{ $t('sharesubjective') }}</p>
      </section>
      <i class="iconfont icon-shiti_guanbitouping f24 c666" @click="handleClosedMsg"></i>
    </div> -->

    <!-- 消息模板一 试卷 习题 分组 互评 -->

    <!-- 试卷模板 -->
    <template v-if="msg && msg.type==4">
      <div class="msg__box box-between cfff quiz">
        <section class="box-start" @click="handleLink(msg)">
          <i class="iconfont icon-shiti_shijuan f32"></i>
          <p class="pl10 f16 cfff">{{ msg.papername }}</p>
        </section>
        <i class="iconfont icon-shiti_guanbitouping f24" @click="handleClosedMsg"></i>
      </div>
    </template>
    <!-- 习题模板 -->
    <template v-else-if="msg && msg.type==3">
      <div class="msg__box box-between cfff problem">
        <section class="box-start" @click="handleLink(msg)">
          <i class="iconfont icon-ykq_shiti f32"></i>
          <p class="pl10 f16 cfff">{{ msg.caption }}</p>
        </section>
        <i class="iconfont icon-shiti_guanbitouping f24" @click="handleClosedMsg"></i>
      </div>
    </template>
    <!-- 分组模板 -->
    <template v-else-if="msg && msg.type==8">
      <div class="msg__box box-between cfff fenzu">
        <section class="box-start" @click="handleLink(msg)">
          <i class="iconfont icon-fenzu f32"></i>
          <p class="pl10 f16 cfff" v-if="msg.groupType ==='random'"><!-- Hi，老师进行了随机分组 -->{{ $t('team.randomized') }}</p>
          <p class="paper-name" v-else-if="msg.groupType ==='free'">{{ $t('team.freegrouping') }}</p>
        </section>
        <i class="iconfont icon-shiti_guanbitouping f24" @click="handleClosedMsg"></i>
      </div>
    </template>
    <!-- 互评模板 -->
    <template v-else-if="msg && msg.type==9">
      <div class="msg__box box-between cfff evaluation">
        <section class="box-start" @click="handleLink(msg)">
          <i class="iconfont icon-huping f32"></i>
          <p class="pl10 f16 cfff"><!-- Hi，老师发起了互评 -->{{ $t('grading.launchedgrading') }}</p>
        </section>
        <i class="iconfont icon-shiti_guanbitouping f24" @click="handleClosedMsg"></i>
      </div>
    </template>

    <!-- 消息模板二 红包 分享 答案解析 -->
    <!-- 红包 -->
    <template v-else-if="msg && msg.type==5">
      <div class="msg__box box-between cfff hongbao">
        <section class="box-start" @click="handleLink(msg)">
          <div class="icon__wrap box-center">
            <i class="iconfont icon-shiti_hongbao cfff f24"></i>
          </div>
          <p class="pl10 f16 c333">{{ $t('recvbonus') }}</p>
        </section>
        <i class="iconfont icon-shiti_guanbitouping f24 c666" @click="handleClosedMsg"></i>
      </div>
    </template>
    <!-- 投稿分享 -->
    <template v-else-if="msg && msg.type==6">
      <div class="msg__box box-between cfff submission">
        <section class="box-start" @click="handleLink(msg)">
          <div class="icon__wrap box-center">
            <i class="iconfont icon-ykq_tab_tougao cfff f24"></i>
          </div>
          <p class="pl10 f16 c333"><!-- Hi, 老师正在分享课堂投稿 -->{{ $t('sharepostpush') }}</p>
        </section>
        <i class="iconfont icon-shiti_guanbitouping f24 c666" @click="handleClosedMsg"></i>
      </div>
    </template>
    <!-- 主观题答案分享 -->
    <template v-else-if="msg && msg.type==7">
      <div class="msg__box box-between cfff subjective" >
        <section class="box-start pr10" @click="handleLink(msg)">
          <div class="icon__wrap box-center">
            <i class="iconfont icon-ykq_shiti cfff f24"></i>
          </div>
          <p class="pl10 f16 c333"><!-- Hi, 老师正在分享主观题答案 -->{{ $t('sharesubjective') }}</p>
        </section>
        <i class="iconfont icon-shiti_guanbitouping f24 c666" @click="handleClosedMsg"></i>
      </div>
    </template>
    <!-- 问题解析 -->
    <template v-else-if="msg && msg.type==13">
      <div class="msg__box box-between cfff analysis">
        <section class="box-start pr10" @click="handleLink(msg)">
          <div class="icon__wrap box-center">
            <i class="iconfont icon-ykq_shiti cfff f24"></i>
          </div>
          <p class="pl10 f16 c333">{{ msg.caption }}</p>
        </section>
        <i class="iconfont icon-shiti_guanbitouping f24 c666" @click="handleClosedMsg"></i>
      </div>
    </template>

  </section>

</template>
<script>
  import { mapState, mapActions } from 'vuex'

  export default {
    name: 'mag-box',
    data() {
      return {
      };
    },
    watch: {
    },
    computed: {
      // 使用对象展开运算符将 getter 混入 computed 对象中
      ...mapState([
        'cards',
        // 'slideIndex',
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
        // 对应类型第一个
        let slideIndex = this.cards.findIndex((item)=>{
          return item.type === slide.type;
        })

        if(~slideIndex) {
          this.setSlideIndex(slideIndex);
        }

        this.setMsg(null);
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

<style lang="scss">
  .msg__container {
    z-index: 2;
    position: fixed;
    top: 10px;


  }

  .msg__box {
    min-width: 300px;
    height: 60px;
    padding: 0 15px;

    background: #fff;
    border-radius: 4px;

    .icon__wrap {
      width: 40px;
      height: 40px;
      border-radius: 50%;
    }

    &.problem {
      background: #91BBF7;
    }

    &.quiz {
      background: #62D793;
    }

    &.fenzu {
      background: #9C81FA;
    }

    &.evaluation {
      background: #D281FA;
    }

    &.submission {
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);

      .icon__wrap {
        background: #FFB53C;
        box-shadow: 0 2px 4px rgba(255, 181, 60, 0.5);
      }
    }

    &.subjective,
    &.analysis {
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);

      .icon__wrap {
        background: #91BBF7;
        box-shadow: 0 2px 4px rgba(145, 187, 247, 0.5);
      }
    }

    &.hongbao {
       box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);

      .icon__wrap {
        background: #F84F41;
        box-shadow: 0 2px 4px rgba(248, 79, 65, 0.5);
      }
    }
  }


</style>




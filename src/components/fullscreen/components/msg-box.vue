/*
 * 学生接收器 消息box item
 * @author: chenzhou
 * @update: 2020.3.1
 */

<template>
  <section class="msg__container">
    <!-- type : 3习题 4试卷 8分组 9:互评 -->
    <div class="msg__box box-between cfff">
      <section>
        <i class="iconfont icon-ykq_shiti f32"></i>
        <p class="f16 cfff">Hi,你有新的投票</p>
      </section>

      <i class="iconfont icon-shiti_guanbitouping f24"></i>
    </div>

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
        <!-- 作答链接 -->
        <div :class="['paper-info', 'xt', item.isComplete ? 'complete' : '']" @click="handlelink(index, $event)">
          <router-link class="paper-txt f17" :to="item.pageURL+item.index">
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
  import { mapState, mapActions } from 'vuex'

  export default {
    name: 'popup-item',
    data() {
      return {
        item: {}
      };
    },
    watch: {
    },
    computed: {
      // 使用对象展开运算符将 getter 混入 computed 对象中
      ...mapState([
        'slideIndex',
        'msg'
      ]),
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
    top: 0;


  }

  .msg__box {
    width: 300px;
    height: 60px;
    padding: 0 20px;

    background: #91BBF7;
    border-radius: 4px;
  }


</style>




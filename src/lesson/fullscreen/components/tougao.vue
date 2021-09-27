/**
* @author [tuqiushuang]
* @email [tuqiushuang@xuetangx.com]
* @create date 2020-05-06 14:20:23
* @modify date 2020-05-06 14:20:23
* @desc 我的投稿页面
*       包含发送投稿&已发送投稿列表
*/
<template>
<section class='tougao__page'>
  <section class="tougao__wrap">
    <header class="tougao__header box-between">
      <div class="tab_box box-center pointer">
        <div class="tab_item" :class="{'active': currentTab == 1}" @click="currentTab = 1"><!-- 投稿 --> {{ $t('post') }} </div>
        <div class="tab_item" :class="{'active': currentTab == 2}" @click="currentTab = 2"><!-- 我的投稿 --> {{ $t('mypost') }} </div>
      </div>
      <i class="iconfont icon-guanbi2 f16 c9b pointer" @click="handleClosed"></i>
    </header>
    <section class="tougao__content">
      <template v-if="currentTab == 1">
        <send-tougao></send-tougao>
      </template>
      <template v-else>
        <tougao-list></tougao-list>
      </template>
    </section>
  </section>
</section>
</template>

<script>
import {  mapState, mapActions } from 'vuex'
import '@/util/util'

import sendTougao from './send-tougao'
import tougaoList from './tougao-list'

export default {
  name: "lesson-tougao",
  components: {
    sendTougao,
    tougaoList
  },
  data() {
    return {
      // 当前选择tab 1 发送投稿 2 已发送列表
      currentTab: 1,
    };
  },
  filters: {
  },
  props: {},
  mixins: [ ],
  computed: {
    ...mapState([
      'lesson',
      'auth',
    ]),
  },
  watch: {
    auth(newVal) {
      window.Authorization = newVal;
    },
  },
  methods: {
    ...mapActions([
      'setRightType'
    ]),
    handleClosed() {
      this.setRightType('')
    },

    
  },
  created() {
  },
  mounted() {
    
  },
  updated() {},
  beforeDestroy() {},
  destroyed() {}
};
</script>
<style lang='scss' scoped>
.tougao__page {
  width: 380px;
  height: calc(100% - 40px);
  background: #fff;
  position: fixed;
  right: 0;
  top: 40px;
  display: flex;
  flex-direction: column;
  // padding: 40px 0 70px;
  &.nopb {
    padding-bottom: 0;
  }
  .tougao__wrap {
    display: flex;
    flex-direction: column;

    width: 100%;
    height: 100%;
  }
  .tougao__header {
    height: 40px;
    color: #333;
    font-size: 14px;
    font-weight: 600;
    border-bottom: 1px solid #ddd;
    padding: 0 15px;
    .tab_box {
      .tab_item {
        position: relative;
        min-width: 56px;
        margin-right: 20px;
        line-height: 20px;
        &.active::after {
          content: "";
          width: 20px;
          height: 3px;
          background: #5096F5;
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          top: calc(100% + 4px);
        }
      }
    }
  }
  .tougao__content {
    height: calc(100% - 60px);
    margin-top: 20px;
  }
}
</style>
/**
 * @author [tuqiushuang]
 * @email [tuqiushuang@xuetangx.com]
 * @create date 2023-08-01 16:53:45
 * @modify date 2023-08-01 16:53:45
 * @desc [手机端确认框组件]
 */

<template>
  <section class="messagebox__wrap" @click="handleClosed">
    <section class="message__container" @click.stop="">
      <h2 class="message--title f19">{{ title }}</h2>
      <div class="message--close" v-if="showClose" @click="handleClosed"><i class="iconfont icon-cuowu f20"></i></div>
      <div class="message--content f15" v-if="!renderHtml">{{ message }}</div>
      <div class="message--content f15 lh26" v-else v-html="message">{{ message }}</div>
      <div class="message--btns box-between" :class="{'box-center': !showCancel}" v-if="showCancel || showConfirm">
        <div class="btn box-center cancel" v-if="showCancel" @click="cancel">{{ cancelText }}</div>
        <div class="btn box-center confirm" v-if="showConfirm" :class="confirmClass" @click="confirm">{{ confirmText }}</div>
      </div>
    </section>
  </section>
</template>

<script>

export default {
  name: "",
  components: {},
  data() {
    return {
      renderHtml: false
    };
  },
  filters: {},
  props: {},
  mixins: [],
  computed: {},
  watch: {},
  methods: {
    close() {
      this.closed = true;
      this.$destroy(true);

      if(this.$el && this.$el.parentNode) {
        this.$el.parentNode.removeChild(this.$el);
      }
    },

    // 关闭弹框
    handleClosed(evt) {
      this.close();
      this.onClose();
    },

  },
  created() {
    
  },
  mounted() {},
  updated() {},
  beforeDestroy() {},
  destroyed() {},
};
</script>
<style lang='scss'>
  .messagebox__wrap {
    width: 100vw;
    height: 100vh;
    position: fixed;
    top: 0;
    left: 0;
    background: rgba(0,0,0,.3);
    z-index: 99;

    .message__container {
      position: fixed;
      bottom: 0;
      width: 100%;
      background: #fff;
      border-radius: 0.32rem 0.32rem 0 0;
      overflow: hidden;
      padding: 0.74666667rem 0.85333333rem 0.64rem;
      max-height: calc(100vh - 1.92rem);  // 最少距顶部 72px

      .message--title {
        color: #2B2E35;
        font-weight: bold;
        line-height: 26px;
        margin-bottom: 0.42666667rem;
      }

      .message--close {
        position: absolute;
        top: 18px;
        right: 18px;
        padding: 2px;
        color: #90949D;
      }

      .message--content {
        color: #656A72;
        line-height: 20px;
        text-align: left;
        &.lh26 {
          line-height: 26px;
        }
      }

      .message--btns {
        margin-top: 0.64rem;
        .btn {
          width: 4rem;
          height: 1.17333333rem;
          border-radius: 0.96rem;
          font-weight: bold;
          &.cancel {
            background: #EEF0F5;
            color: #656A72;
          }
          &.confirm {
            background: #3D7BFF;
            color: #fff;
          }
          &.relative {
            position: relative;
          }
          &.iknow {
            width: 100%;
            height: 1.17333333rem;
            background: #EEF0F5;
            color: #656A72;
          }
          &.del {
            background: rgba($color: #E65332, $alpha: .1);
            color: #E65332;
          }
        }
      }

    }
  }

</style>
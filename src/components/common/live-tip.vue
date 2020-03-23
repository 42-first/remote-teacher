/*
 * @page：直播提示
 * @author: chenzhou
 * @update: 2020.2.8
 * @desc
 */


<template>
  <!-- 服务停止通知 -->
  <section class="notice__cmp fixed-position" v-show="valid">
    <div class="notice__content">
      <p class="notice--text c666 f12">{{ content }}</p>
    </div>
    <p class="notice__actions">
      <i class="iconfont icon-shiti_guanbitouping f21 c666" @click="handleClose"></i>
    </p>
  </section>
</template>
<style lang="scss" scoped>
  .c666 {
    color: #666;
  }

  .fixed-position {
    z-index: 100;
    position: fixed;
    bottom: 0;
  }

  .notice__cmp {
    display: flex;
    justify-content: space-between;
    align-items: center;

    padding: 0 0.4rem;
    height: 0.8rem;
    width: 100vw;
    line-height: 0.8rem;

    box-shadow: 0 1px 0.08rem rgba(0,0,0,0.2);
    background: #FFFABF;
    box-sizing: border-box;
  }

  .notice__content {
    flex: 1;
    max-width: calc(100vw - 0.6rem);
    padding-right: 0.4rem;
    overflow: hidden;
  }

  .notice--text {
    text-align: left;
    white-space: nowrap;
  }

  .notice__actions {
    width: 0.8rem;

    display: flex;
    justify-content: flex-end;
    align-items: center;
  }
</style>
<script>
  import { isSupported } from '@/util/util'

  export default {
    // position: 位置  offset：位移 例如距离底部距离
    props: {
      id: {
        type: String,
        default: ''
      }
    },
    data() {
      return {
        // 是否显示通知
        valid: false,
        content: '推荐使用雨课堂小程序，直播更实时',
      }
    },
    methods: {
      /**
       * @method 初始化状态
       */
      init() {
        let key = 'live-tip-closed-' + this.id;
        let hidden = false;

        if(isSupported(window.localStorage)) {
          hidden = localStorage.getItem(key);
        }

        if(!hidden) {
          this.valid = true;
        }
      },

      /**
       * @method 关闭通知
       */
      handleClose(evt) {
        // 可能会点透 需要特殊处理下
        let id = this.id;
        let key = 'live-tip-closed-' + id;

        if(isSupported(window.localStorage)) {
          localStorage.setItem(key, true);
        }

        this.valid = false;
      },
    },
    created() {
      this.init();
    },
  }
</script>

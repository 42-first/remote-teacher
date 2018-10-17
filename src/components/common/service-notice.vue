/*
 * @page：停服通知
 * @author: chenzhou
 * @update: 2018.10.10
 * @desc 停服通知通用组件
 * @demo <notice-cmp position="bottom" offset="50"></notice-cmp>
 */


<template>
  <!-- 服务停止通知 -->
  <section :class="['notice__cmp', position ? 'fixed-position' : '']" :style="position|setStyle(offset)" v-show="valid">
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
    z-index: 101;
    position: fixed;
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
    white-space: nowrap;
    animation: maquee infinite 8s 0.3s linear;
    transition: opacify ease-out 0.3s;
  }

  .notice__actions {
    width: 0.8rem;

    display: flex;
    justify-content: flex-end;
    align-items: center;
  }

  @keyframes maquee {
    0% {
      opacity: 0.2;
      transform: translateX(95%);
    }
    5% {
      opacity: 1;
    }
    95% {
      opacity: 0.95;
    }
    100% {
      opacity: 0.1;
      transform: translateX(-100%);
    }
  }
</style>
<script>
  import request from '@/util/request'
  import API from '@/util/api'
  import { isSupported } from '@/util/util'

  export default {
    // position: 位置  offset：位移 例如距离底部距离
    props: {
      position: {
        type: String,
        default: ''
      },
      offset: {
        type: Number,
        default: 0
      }
    },
    data() {
      return {
        // 通知的ID
        noticeID: null,
        // 是否显示通知
        valid: false,
        content: '雨课堂将于10月1日凌晨1:00-5:00升级系统，届时将无法访问，敬请谅解。',
        //
        oStyle: {}
      }
    },
    filters: {
      setStyle(position, offset = 0) {
        let oStyle = {};

        if(position) {
          oStyle[position] = offset + 'rem';
        }

        return oStyle;
      }
    },
    methods: {
      /**
       * @method 初始化状态
       */
      init(data) {
        this.noticeID = data.id;
        let key = 'service-notice-closed-' + data.id;
        let hidden = false;

        if(isSupported(window.localStorage)) {
          hidden = localStorage.getItem(key);
        }

        if(!hidden) {
          this.valid = data.valid;
          this.content = data.content;
        }
      },

      /**
       * @method 获取通知
       *
       */
      getServiceNotice() {
        let url = API.HOLD_SERVICE_NOTICE;

        request.get(url).
        then((res) => {
          if(res.success) {
            let data = res.data;
            this.init(data);
          }
        })
      },

      /**
       * @method 关闭通知
       */
      handleClose(evt) {
        // 可能会点透 需要特殊处理下
        let id = this.noticeID;
        let key = 'service-notice-closed-' + id;

        if(isSupported(window.localStorage)) {
          localStorage.setItem(key, true);
        }

        this.valid = false;
      },
    },
    created() {
      setTimeout(()=>{
        this.getServiceNotice();
      }, 3500)
    },
  }
</script>

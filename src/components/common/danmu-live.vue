/*
 * @page：实时弹幕
 * @author: chenzhou
 * @update: 2018.11.30
 * @desc 接收器中实时弹幕列表
 * @demo <notice-cmp position="bottom" offset="50"></notice-cmp>
 */


<template>
  <!-- 弹幕直播 -->
  <section class="danmu__cmp" v-show="danmuStatus">
    <!-- 弹幕列表 -->
    <section class="danmu__wrap" v-show="visible">
      <ul class="danmu__list">
        <li class="danmu__item f12" v-for="danmu in danmus">{{ danmu.danmu }}</li>
      </ul>
    </section>

    <!-- 弹幕标识 开关 -->
    <button class="danmu__btn f14">
      <!-- <i class="iconfont icon-shiti_guanbitouping f21 c666" @click="handleClose"></i> -->
      <span>弹</span>
    </button>

  </section>
</template>
<style lang="scss" scoped>
  .c666 {
    color: #666;
  }

  .danmu__cmp {
    z-index: 2;
    position: fixed;
    bottom: 0.533333rem;
    left: 0.453333rem;

    // display: flex;
    // justify-content: space-between;
    // align-items: center;

    // padding: 0 0.4rem;
    // height: 0.8rem;
    // width: 100vw;
    // line-height: 0.8rem;

    box-sizing: border-box;
  }

  .danmu__btn {
    position: absolute;
    bottom: 0;
    left: 0.2rem;

    width: 0.8rem;
    height: 0.8rem;

    color: #fff;
    background: rgba(0,0,0, 0.6);
    border-radius: 0.106667rem;
  }

  .danmu__wrap {
    position: absolute;
    bottom: 1.066667rem;
    left: 0;

    max-height: 6.0rem;
    max-width: 6.36rem;
    overflow: hidden;
  }

  .danmu__item {
    margin-top: 0.133333rem;
    padding: 0 0.4rem;
    min-height: 0.64rem;
    line-height: 1.5;

    color: #fff;
    background: rgba(0,0,0, 0.6);
    border-radius: 0.32rem;
  }

  .notice--text {
    white-space: nowrap;
    animation: maquee infinite 8s 0.3s linear;
    transition: opacify ease-out 0.3s;
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
  import { isSupported } from '@/util/util'

  export default {
    // danmus: 弹幕列表  danmuStatus: 例如距离底部距离
    props: {
      danmus: {
        type: Array,
        default: []
      },
      danmuStatus: {
        type: Boolean,
        default: true
      }
    },
    data() {
      return {
        // 是否显示弹幕列表
        visible: false,
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
        this.visible = true;
        this.danmus = [{
          "danmu": "一条弹幕",
          "danmuid": 1122
        }, {
          "danmu": "第二条弹幕",
          "danmuid": 1123
        }];
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

        this.visible = false;
      },
    },
    created() {
      setTimeout(()=>{
        this.init();
      }, 500)
    },
  }
</script>

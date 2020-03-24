/*
 * @page：实时弹幕
 * @author: chenzhou
 * @update: 2018.11.30
 * @desc 接收器中实时弹幕列表
 * @demo
 */


<template>
  <!-- 弹幕直播 -->
  <section class="danmu__cmp" v-show="danmuStatus">
    <!-- 弹幕列表 -->
    <section class="danmu__wrap" v-show="visible">
      <ul class="danmu__list">
        <li class="danmu__item J_danmu" :class="[ danmu.status===1? 'enter' : 'out']" v-for="danmu in danmuList">
          <p class="danmu--text f14" >{{ danmu.danmu }}</p>
        </li>
      </ul>
    </section>

    <!-- 弹幕标识 开关 -->
    <button class="danmu__btn f18" @click="handleClose">
      <p :class="[ visible ? '' : 'danmu--close']">弹</p>
    </button>

  </section>
</template>
<style lang="scss" scoped>
  .c666 {
    color: #666;
  }

  .danmu__cmp {
    // z-index: 2;
    position: fixed;
    bottom: 0.533333rem;
    left: 0.453333rem;

    box-sizing: border-box;
  }

  .danmu__btn {
    position: absolute;
    bottom: 0;
    left: 0.2rem;

    width: 1.2rem;
    height: 1.0rem;

    color: #fff;
    background: rgba(0,0,0,0.7);
    // box-shadow: 0 0.04rem 0.24rem rgba(0,0,0,0.6);
    border-radius: 0.16rem;
    border: none;
    outline: none;
    box-sizing: border-box;
  }

  .danmu__btn:before {
    content: '';
    position: absolute;
    top: -0.266667rem;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-style: solid;
    border-width: 0.16rem;
    border-color: transparent transparent rgba(0,0,0,0.7) transparent;
  }

  .danmu--close {
    position: relative;
    margin: auto;
    padding: 0.066667rem 0;
    width: 0.8rem;
    height: 0.8rem;

    border-radius: 50%;
    border: 0.026667rem solid #fff;
    box-sizing: border-box;
  }

  .danmu--close:after {
    content: '';
    display: block;
    width: 100%;
    height: 0.026667rem;

    background: #fff;

    transform: translateY(-0.28rem) rotate(45deg);
  }

  .danmu__wrap {
    position: absolute;
    bottom: 1.266667rem;
    left: 0;

    max-height: 6.0rem;
    // max-width: 6.36rem;
    width: 6.36rem;
    overflow: hidden;
  }

  .danmu__list {
    transition: all 1s ease-out;
  }

  .danmu__item {
    display: flex;
    align-items: flex-start;

    margin-top: 0.133333rem;
    width: 100%;
  }

  .danmu--text {
    box-sizing: border-box;
    position: relative;
    padding: 0.066667rem 0.4rem 0;
    min-height: 0.64rem;
    line-height: 1.5;
    text-align: justify;

    word-break: break-word;

    color: #fff;
    background: rgba(0,0,0, 0.6);
    border-radius: 0.32rem;
  }

  .enter {
    animation: gradient 0.75s linear;
    transition: opacify ease-in 0.3s;
  }

  .out {
    animation: fadeOut 1.15s ease-out;
  }

  @keyframes gradient {
    0% {
      opacity: 0.1;
    }
    50% {
      opacity: 0.35;
    }
    100% {
      opacity: 1;
    }
  }

  @keyframes fadeOut {
    from {
      opacity: 1;
    }

    to {
      opacity: 0;
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
        default: false
      },
      clearDanmus: {
        type: Function
      }
    },
    data() {
      return {
        // 是否显示弹幕列表
        visible: true,
        // 格式化后的弹幕列表
        danmuList: [],
        // 定时清理屏幕弹幕 十秒内没有弹幕清理屏幕
        timer: null,
      }
    },
    filters: {
    },
    watch: {
      danmus(newVal, oldVal) {
        if(newVal && newVal.length) {
          this.calcDanmus();
        }
      }
    },
    methods: {
      /**
       * @method 初始化状态
       */
      init() {
        /*
        this.danmuStatus = true;
        this.visible = true;

        let danmus = [{
          "danmu": "一条弹幕",
          "danmuid": 1122
        }, {
          "danmu": "第二条弹幕",
          "danmuid": 1123
        }, {
          "danmu": "第三条弹幕第三条弹幕第三条弹幕第",
          "danmuid": 1123
        }, {
          "danmu": "第四条弹幕第四条弹幕第四条弹幕第四条弹幕",
          "danmuid": 1123
        }, {
          "danmu": "第二条弹幕",
          "danmuid": 1123
        }, {
          "danmu": "第三条弹幕第三条弹幕第三条弹幕第三条弹幕第三条弹幕第三条弹幕",
          "danmuid": 1123
        }, {
          "danmu": "第四条弹幕第四条弹幕第四条弹幕第四条弹幕",
          "danmuid": 1123
        }];

        setInterval(()=>{
          let index = parseInt(Math.random() * 7);
          this.danmus.push(danmus[index]);
        }, 2000)

        this.danmus = danmus.slice(-5);
        */

        let key = 'danmu-live-switchoff';
        if(isSupported(window.localStorage)) {
          let visible = localStorage.getItem(key);

          this.visible = !visible;
        }

      },

      /**
       * @method 计算弹幕长度
       */
      calcDanmus() {
        let danmus = this.danmus;

        // 清理定时器
        this.timer && clearTimeout(this.timer);

        if(danmus && danmus.length) {
          this.getOneDanmu(danmus);

          // 屏幕最多显示20条
          if(this.danmuList.length > 20) {
            this.danmuList = this.danmuList.slice(-15);
          }
        }

        // 30秒内没有收到新弹幕清空弹幕列表
        this.timer = setTimeout(()=>{
          clearTimeout(this.timer);

          // 增加消失动画
          this.fadeOutDanmus(this.danmuList.slice(-7));

          // 清理弹幕列表源头
          if(typeof this.clearDanmus === 'function') {
            setTimeout(()=>{
              this.clearDanmus();
              this.danmuList = [];
            }, 1200)
          }
        }, 1000*30)
      },

      /**
       * @method 取出一条弹幕
       */
      getOneDanmu(danmus) {
        let danmu = danmus.shift();

        if(danmu) {
          let newDanmu = Object.assign({}, danmu, { status: 1 })
          this.danmuList.push(newDanmu);

          Promise.resolve().then(()=>{
            let lastDanmuEl = this.$el.querySelector('.J_danmu:last-child');
            lastDanmuEl && lastDanmuEl.scrollIntoView();
          });
        }
      },

      /**
       * @method 增加消失动画
       */
      fadeOutDanmus(list) {
        this.danmuList = list.map((danmu) => {
          // status 弹幕状态 1：进入视图 2:已进入 3：离开视图 方便扩展使用数字
          return Object.assign({}, danmu, { status: 3 })
        });
      },

      /**
       * @method 关闭弹幕直播
       */
      handleClose(evt) {
        this.visible = !this.visible;

        let key = 'danmu-live-switchoff';
        if(isSupported(window.localStorage)) {
          localStorage.setItem(key, this.visible ? '' : true);
        }
      },
    },
    created() {
      this.init();
    },
    beforeDestroy() {
      clearInterval(this.timer);
    }
  }
</script>

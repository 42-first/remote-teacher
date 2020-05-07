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
    <section class="danmu__container" :class="{ 'publish-mode': visibleIpt }">
      <!-- 弹幕列表 -->
      <section class="danmu__wrap" v-show="visible">
        <ul class="danmu__list">
          <li class="danmu__item J_danmu" :class="[ danmu.status===1? 'enter' : 'out']" v-for="danmu in danmuList">
            <p class="danmu--text f12" >
              <span class="blue" v-if="danmu.ismine"><!-- (我) -->{{ $t('danmume') }}</span>
              <span>{{ danmu.danmu }}</span>
            </p>
          </li>
        </ul>
      </section>

      <!-- footer  -->
      <section class="danmu__footer" v-show="!visibleIpt">
        <!-- 弹幕标识 开关 -->
        <div class="box-center danmu__btn f14" @click="handleClose">
          <p :class="[ visible ? '' : 'danmu--close']">弹</p>
        </div>
        <!-- 发送弹幕入口 -->
        <p class="box-start cfff f14 danmu--visible" @click="handleVisibleIpt"><!-- 点击发弹幕 … -->{{ $t('danmusendtip') }}</p>
      </section>
    </section>

    <!-- 发送弹幕组件 -->
    <section class="publish__wrap" :class="{ 'ios': isiOS }" v-show="visibleIpt" >
      <section class="danmu__publish f16">
        <input class="danmu__ipt J_input c333" type="text" :placeholder="$t('danmuipttip')" v-model="danmuText" @focus="handleFocus" @blur="handleBlur" @keyup="handleKeyup" />
        <p class="danmu__send box-center" :class="[ danmuText ? 'blue' : 'c9b']" @click="handleSend"><!-- 发送 -->{{ $t('danmusend') }}</p>
      </section>
    </section>
  </section>
</template>
<style lang="scss" scoped>
  .c666 {
    color: #666;
  }

  .danmu__cmp {
    // z-index: 2;
    position: fixed;
    bottom: 0;
    left: 0;

    box-sizing: border-box;
  }

  .danmu__container {
    padding: 0 0 0.533333rem 0.453333rem;

    &.publish-mode {
      padding-bottom: 0;
    }
  }

  .danmu__footer {
    padding-left: 0.2rem;

    display: flex;
    justify-content: flex-start;
    align-items: center;
  }

  .danmu__btn {
    position: relative;

    width: 0.8rem;
    height: 0.746667rem;

    color: #fff;
    background: #333;
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
    border-color: transparent transparent #333 transparent;
  }

  .danmu--close {
    position: relative;
    margin: auto;
    padding: 0.066667rem 0;
    width: 0.666667rem;
    height: 0.666667rem;

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
    padding-bottom: 0.266667rem;

    max-height: 6.0rem;
    width: 6.36rem;
    overflow: hidden;

    // &.publish-mode {
    //   padding-bottom: 0.933333rem;
    // }
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
    display: inline-table;
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

  .danmu--visible {
    margin-left: 0.4rem;

    width: 4.893333rem;
    height: 0.853333rem;
    padding: 0 0.426667rem;

    background: rgba(0, 0, 0, 0.6);
    border-radius: 0.426667rem/50%;
  }

  .publish__wrap {
    background: #fff;

    &.ios {
      padding-bottom: 1.2rem;
    }
  }

  .danmu__publish {
    position: relative;

    display: flex;
    justify-content: space-between;
    align-items: center;

    width: 100vw;
    height: 1.2rem;
    padding: 0 0.32rem;

    border: 1px solid #eee;
    border-left: none;
    border-right: none;

    background: #fff;

    &:before {
      content: '';
      position: absolute;
      // bottom: 1.21rem;
      bottom: 100%;
      left: 0;

      width: 100vw;
      height: 2.0rem;
    }

    .danmu__ipt {
      flex: 1;
      height: 100%;

      padding-right: 0.32rem;
      appearance: none;
      outline: none;
      border: none;
    }

    .danmu__send {
      width: 1.066667rem;
      height: 100%;
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
        // 是否显示发送弹幕
        visibleIpt: false,
        // danmu内容
        danmuText: '',
        // 已经发布过的弹幕ids
        myDanmus: [],
        // 用户ID
        userid: 0,
        isiOS: false
      }
    },
    watch: {
      danmus(newVal, oldVal) {
        if(newVal && newVal.length) {
          this.calcDanmus();
        }
      },
      danmuText(newVal, oldVal) {
        let value = newVal && newVal.substr(0, 50);
        this.danmuText = value;
      },
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

        this.userid = this.$parent.userID;
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
          let ismine = this.userid === danmu.userid ? true : false;

          let newDanmu = Object.assign({}, danmu, { status: 1, ismine })
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

      /**
       * @method 关闭弹幕直播
       */
      handleVisibleIpt(evt) {
        this.visibleIpt = true;

        Promise.resolve().then(()=>{
          this.$el.querySelector('.J_input').focus();
        });
      },

      /**
       * @method 监听焦点
       */
      handleFocus(evt) {
        const target = evt.target;

        Promise.resolve().then(()=>{
          target.focus();
        });

        setTimeout(()=>{
          target.focus();
          target.scrollIntoView(true);
          target.scrollIntoViewIfNeeded();
        }, 500)
      },

      /**
       * @method 关闭弹幕直播
       */
      handleBlur(evt) {
        let isiOS = this.isiOS;

        setTimeout(()=>{
          this.visibleIpt = false;

          if(isiOS) {
            document.activeElement && document.activeElement.scrollIntoViewIfNeeded(true);
            window.scrollTo(0, 0);
          }
        }, 300)
      },

      /**
       * @method enter发送
       * @param
       */
      handleKeyup(evt) {
        // 回车自动提交
        if (evt.keyCode === 13 && this.danmuText) {
          setTimeout(()=>{
            this.handleSend();
          }, 50)
        }
      },

      /**
       * @method 发送弹幕
       */
      handleSend(evt) {
        let URL = API.student.SEND_DANMU;
        const message = this.danmuText.replace(/^\s+|\s+$/g, '').replace(/(\r\n|\n|\r)/gm, ' ');
        let params = {
          'lessonID': this.$parent.lessonID,
          'presentationID': this.$parent.presentationID,
          'message': message
        };

        // 不能为空
        if(!message) {
          return this;
        }

        request.post(URL, params)
        .then( (res) => {
          if(res) {
            // 弹幕返回数据结构 danmuID success
            let data = res;
            let danmuID = data && data.danmuID;

            this.danmuText = '';
            // this.myDanmus.push(danmuID);

            this.$toast({
              message: this.$i18n.t('sendsuccess') || '发送成功',
              duration: 2000
            });
          }
        });
      }
    },
    created() {
      this.init();

      let ua = navigator.userAgent;
      let isiOS = !!ua.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);
      this.isiOS = isiOS;
    },
    beforeDestroy() {
      clearInterval(this.timer);
    }
  }
</script>

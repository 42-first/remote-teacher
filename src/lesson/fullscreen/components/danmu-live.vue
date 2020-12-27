/*
 * @page：实时弹幕
 * @author: chenzhou
 * @update: 2020.12.25
 * @desc 接收器中实时弹幕列表
 * @demo
 */


<template>
  <!-- 弹幕直播 -->
  <section class="danmu__cmp">
    <!-- 关闭 -->
    <p class="danmu__closed box-center" @click="handleClose" v-show="danmuList && danmuList.length">
      <i class="iconfont icon-guanbi1 f12 cfff"></i>
    </p>
    <section class="danmu__container" v-show="visible">
      <!-- 弹幕列表 -->
      <section class="danmu__wrap">
        <ul class="danmu__list">
          <li class="danmu__item J_danmu" :class="[ danmu.status===1? 'enter' : 'out']" v-for="danmu in danmuList">
            <p class="danmu--text f12" >
              <span class="blue" v-if="danmu.ismine"><!-- (我) -->{{ $t('danmume') }}</span>
              <span>{{ danmu.danmu }}</span>
            </p>
          </li>
        </ul>
      </section>
    </section>

    <!-- 发送弹幕组件 -->
    <section class="publish__wrap" >
      <section class="danmu__publish f14">
        <input class="danmu__ipt J_input f12 cfff" type="text" :placeholder="$t('danmuipttip')" v-model="danmuText" @focus="handleFocus" @keyup="handleKeyup" />
        <p class="danmu__send box-center cfff" @click="handleSend"><!-- 发送 -->{{ $t('danmusend') }}</p>
      </section>
    </section>
  </section>
</template>
<style lang="scss" scoped>
  .danmu__cmp {
    position: absolute;
    bottom: 60px;
    right: 0;

    display: flex;
    flex-flow: column;
    justify-content: flex-start;
    align-items: flex-end;

    padding: 10px;
    width: 290px;
    // height: 296px;
    max-height: 296px;

    box-sizing: border-box;

    &:hover {
      background: rgba(255, 255,255, 0.6);
      border-radius: 4px;
      border: 1px solid #E5E5E5;
    }
  }

  .danmu__closed {
    position: absolute;
    top: 0;
    right: 10px;

    width: 16px;
    height: 16px;
    border-radius: 50%;

    background: rgba(0,0,0,0.7);
  }

  .danmu__container {
    flex: 1;
    width: 100%;

    // overflow: hidden;
    cursor: move;
  }

  .danmu__wrap {
    width: 100%;
    height: 100%;

    max-height: 212px;

    overflow-y: auto;
  }

  .danmu__list {
    transition: all 1s ease-out;
  }

  .danmu__item {
    display: flex;
    align-items: flex-start;

    margin-top: 10px;
    width: 100%;
  }

  .danmu--text {
    display: inline-table;
    box-sizing: border-box;
    position: relative;
    padding: 5px 15px;
    min-height: 28px;
    line-height: 1.5;
    text-align: justify;

    word-break: break-word;

    color: #fff;
    background: rgba(0,0,0, 0.7);
    border-radius: 14px;
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

  .publish__wrap {
    margin-top: 10px;

    width: 266px;
    height: 32px;
  }

  .danmu__publish {
    position: relative;

    display: flex;
    justify-content: space-between;
    align-items: center;

    width: 100%;
    height: 100%;

    .danmu__ipt {
      flex: 1;
      height: 100%;

      padding: 15px;
      appearance: none;
      outline: none;
      border: none;

      border-radius: 16px 0 0 16px;
      background: rgba(0,0,0,0.7);
    }

    .danmu__send {
      width: 53px;
      height: 100%;

      border-radius: 0 16px 16px 0;
      background: #5096F5;

      cursor: pointer;
    }
  }

</style>
<style>
  .danmu__cmp {
    --x: 0px;
    --y: 0px;

    transform: translate(var(--x), var(--y));
  }
</style>
<script>
  import { mapState, mapActions } from 'vuex';
  import { isSupported } from '@/util/util'

  export default {
    data() {
      return {
        // 是否显示弹幕列表
        visible: true,
        // 格式化后的弹幕列表
        danmuList: [],
        // 定时清理屏幕弹幕 十秒内没有弹幕清理屏幕
        timer: null,
        // danmu内容
        danmuText: '',
        // 已经发布过的弹幕ids
        myDanmus: [],
        // 用户ID
        userid: 0,
        // 移动相对位置
        offset: {
          offsetX: 0,
          offsetY: 0
        },
      }
    },
    computed: {
      ...mapState([
        'lesson',
        // 是否开启弹幕
        'danmuStatus',
        // 是否显示弹幕
        'visibleDanmu',
        'danmus',
      ]),
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
      ...mapActions([
        'setDanmus',
        'setVisibleDanmu',
      ]),

      /**
       * @method 初始化状态
       */
      init() {
        this.initEvent();

        console.log('lesson:', this.lesson);

        this.userid = this.lesson.userID;
      },

       /**
       * @method 事件监听
       * @params
       */
      initEvent() {
        let danmuEl = this.$el;

        danmuEl.addEventListener('mousedown', (evt) => {
          // evt.preventDefault();

          this.canMove = true;

          const cssStyles = getComputedStyle(danmuEl);
          let xVal = String(cssStyles.getPropertyValue('--x')).trim();
          let yVal = String(cssStyles.getPropertyValue('--y')).trim();
          xVal = parseInt(xVal, 10);
          yVal = parseInt(yVal, 10);

          const x = evt.clientX - xVal;
          const y = evt.clientY - yVal;
          this.lastPoint = { x, y };

          console.dir(cssStyles);
        }, true)

        danmuEl.addEventListener('mouseup', (evt) => {
          evt.preventDefault();

          this.canMove = false;
        }, true)

        danmuEl.addEventListener('mouseout', (evt) => {
          evt.preventDefault();

          this.canMove = false;
        }, true)

        danmuEl.addEventListener('mousemove', (evt)=>{
          evt.preventDefault();

          if(this.canMove) {
            let lastPoint = this.lastPoint;
            let x = evt.clientX - lastPoint.x;
            let y = evt.clientY - lastPoint.y;
            let offset = { x, y };

            if(Math.abs(x) > 10 || Math.abs(y) > 10) {
              this.translateContent(offset);
            }

            return false;
          }
        }, true)
      },

      translateContent(offset) {
        let danmuEl = this.$el;
        let offsetX = offset.x;
        let offsetY = offset.y;

        danmuEl.style.setProperty('--x', offsetX + 'px');
        danmuEl.style.setProperty('--y', offsetY + 'px');
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
          setTimeout(()=>{
            this.setDanmus([]);
            this.danmuList = [];
          }, 1200)
        }, 1000*30)
      },

      /**
       * @method 取出一条弹幕
       */
      getOneDanmu(danmus) {
        let danmu = danmus.shift();

        if(danmu) {
          let ismine = this.userid == danmu.userid ? true : false;

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
        // this.visible = false;
        this.setVisibleDanmu(false);
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
        let URL = API.lesson.send_danmu;
        const message = this.danmuText.replace(/(\r\n|\n|\r)/gm, ' ').replace(/^\s+|\s+$/g, '');
        let params = {
          'lessonId': this.lesson.lessonID,
          'target': '',
          'userName': '',
          'message': message,
          'extra': '',
          'requiredCensor': false,
          'wordCloud': true,
          'showStatus': true,
          'fromStart': '50',
        };

        // 不能为空
        if(!message) {
          return this;
        }

        request.post(URL, params).
        then((res)=>{
          if(res && res.code === 0) {
            this.danmuText = '';

            this.$toast({
              message: this.$i18n.t('sendsuccess') || '发送成功',
              duration: 2000
            });
          }
        }).
        catch(error => {
          console.log('send danmu:', error);
        })
      }
    },
    created() {
    },
    mounted() {
      this.init();
    },
    beforeDestroy() {
      this.timer && clearInterval(this.timer);
    }
  }
</script>

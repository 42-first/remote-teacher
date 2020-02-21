/**
 * @author [tuqiushuang]
 * @email [tuqiushuang@xuetangx.com]
 * @create date 2020-02-20 15:27:52
 * @modify date 2020-02-20 15:27:52
 * @desc [大屏发送弹幕&弹幕展示开关]
 */
<template>
  <section class="danmu-control-cmp">
    <div class="danmu__control">
      <i class="iconfont icon-danmukai1 f28" v-if="visibleDanmu" @click="handleVisibleDanmu"></i>
      <i class="iconfont icon-danmuguan1 f28" v-else @click="handleVisibleDanmu"></i>
      <i class="iconfont icon-fadanmu f24" @click="showSend = true"></i>
    </div>
    <div class="danmu__send_box" v-show="showSend">
      <div class="send__container">
        <div class="input__box">
          <input class="send__input" ref="danmuinput" type="text" v-model="danmuText" placeholder="发弹幕" autofocus>
          <span class="words" :class="danmuText.length > 50 ? 'warning' : ''">
            <i class="current">{{danmuText.length}}</i>/50
          </span>
        </div>

        <span class="send__btn" :class="!danmuText ? 'disabled' : ''" @click="handleSend">{{sendSuccess ? '发送成功' : '发送'}}</span>
      </div>
      <i class="iconfont icon-guanbi1 send__close" @click="showSend = false"></i>
    </div>
  </section>
</template>

<script>
export default {
  name: 'danmuControl',
  props: {
    visibleDanmu: {
      type: Boolean,
      default: true
    },
  },
  data(){
    return {
      showSend: false,
      danmuText: '',
      sendSuccess: false
    }
  },
  components: {
  },
  computed: {
  },
  watch: {
    showSend(newVal){
      if(newVal){
        this.$nextTick(() => {
          this.$refs.danmuinput.focus()
        })
      }else {
        this.danmuText = ''
      }
    }
  },
  methods: {
    /*
    * @method 发送弹幕
    * @param
    */
    handleSend() {
      if(this.danmuText.length > 50 || !this.danmuText) return
      let self = this;
      let URL = API.student.SEND_DANMU;
      // let socket = this.$parent.socket;
      const message = this.danmuText.replace(/^\s+|\s+$/g, '').replace(/(\r\n|\n|\r)/gm, ' ');
      let params = {
        'lessonID': this.$parent.lessonID,
        'presentationID': this.$parent.presentationID,
        'message': message
      };

      return request.post(URL, params)
        .then( (res) => {
          if(res) {
            // 弹幕返回数据结构 danmuID success
            let data = res;
            if(data.success){
              self.sendSuccess = true
              self.danmuText = ''
              setTimeout(() => {
                self.sendSuccess = false
              }, 3000);
            }
            return data;
          }
        });
    },

    /*
     * @method 弹幕开关控制
     * @param
     */
    handleVisibleDanmu() {
      // this.visibleDanmu = !this.visibleDanmu;
      this.$parent.setVisibleDanmu(!this.visibleDanmu);
    }
  },
  created() {

  },
  mounted() {
  },
  beforeDestroy() {

  }
}
</script>

<style lang="scss" scoped>
.f24 {
  font-size: 24px;
}
.f28 {
  font-size: 28px;
}
.danmu-control-cmp {
  position: relative;
  .danmu__control {
    position: absolute;
    bottom: 30px;
    right: 30px;
    padding: 12px 0;
    width: 54px;
    height: 84px;   //弹幕开关icon展示的时候用这个高度
    // height: 54px;
    display: flex;
    flex-direction: column;
    justify-content: space-between; //弹幕开关icon展示的时候用这个高度
    // justify-content: center;
    align-items: center;
    border-radius: 27px;
    background: #fff;
    opacity: .8;
    box-shadow: 0 3px 18px rgba(0,0,0,.6);
    cursor: pointer;
    &:hover {
      opacity: 1;
    }
    .iconfont {
      color: #5096F5;
      line-height: 1;
    }
  }
  .danmu__send_box {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 98px;
    background: rgba(0,0,0,.5);
    display: flex;
    align-items: center;
    justify-content: center;
    .send__container {
      width: 80%;
      height: 40px;
      display: flex;
      .input__box {
        flex: 1;
        background: #fff;
        border-radius: 44px;
        padding: 0 20px;
        display: flex;
        align-items: center;
        .send__input {
          flex: 1;
          border: none;
          outline: none;
          font-size: 16px;
          line-height: 22px;
          caret-color:#5096F5;
        }
        .words {
          margin-left: 20px;
          font-size: 12px;
          color: #666;
          &.warning {
            color: #F84F41;
          }
          i {
            font-style: normal;
            font-size: 16px;
          }
        }
      }

      .send__btn {
        width: 100px;
        background: #5096F5;
        color: #fff;
        line-height: 40px;
        font-size: 18px;
        margin-left: 10px;
        border-radius: 44px;
        cursor: pointer;
        &.disabled {
          background: #c8c8c8;
          pointer-events: none;
        }
      }
    }
    .send__close {
      position: absolute;
      right: 30px;
      font-size: 20px;
      color: #fff;
      top: 50%;
      transform: translateY(-50%);
      cursor: pointer;
    }
  }
}

</style>

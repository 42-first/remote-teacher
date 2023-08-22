/**
* @author [tuqiushuang]
* @email [tuqiushuang@xuetangx.com]
* @create date 2020-05-06 14:20:23
* @modify date 2020-05-06 14:20:23
* @desc [confirm-box]
*/
<template>
<section class='message-box-masking' :id="id">
  <div class="message-box box-between">
    <div class="img_icon" :class="headerConfig.type == 'img' ? 'imgStyle' : 'iconStyle'" v-if="headerConfig">
      <img v-if="headerConfig.type == 'img'" :src="headerConfig.img" alt="">
      <i v-else class="iconfont" :class="headerConfig.icon"></i>
    </div>
    <div class="close-wrap box-center" v-if="showClose" @click="close">
      <i class="iconfont icon-qingchuguanbi f16"></i>
    </div>
    <div class="message-container">
      <div class="message-title f16">{{title}}</div>
      <div class="message-content" v-if="message">{{message}}</div>
      <div class="message-btns">
        <div class="btn buttton-normal pointer cancel" :class="cancelClassProxy" v-if="showCancel" @click="cancel">
          <i class="iconfont mr6 f16" :class="cancelIcon" v-if="cancelIcon"></i>
          {{cancelText}}
        </div>
        <div class="button-blue btn confirm pointer" :class="[confirmClassProxy, !showCancel ? 'only' : '']" @click="confirm">
          <i class="iconfont mr6 f16" :class="confirmIcon" v-if="confirmIcon"></i>
          {{confirmText}}
        </div>
      </div>
    </div>
  </div>
</section>
</template>

<script>
export default {
name: 'messagebox',
components: {},
data() {
return {
  reverse: false,
  headerConfig: null,
  showClose: false,
  message: '',
  cancelIcon: '',
  confirmIcon: ''
};
},
filters: {},
props: {
  
},
mixins: [  ],
computed: {
  confirmClassProxy() {
    return this.confirmClass ? this.confirmClass : ''
  },

  cancelClassProxy() {
    return this.cancelClass ? this.cancelClass : ''
  }
},
watch: {},
methods: {
  close() {
    this.closed = true;
    this.$destroy(true);
    this.$el.parentNode.removeChild(this.$el);
  },
},
created() {

},
mounted() {

},
updated() {}, 
beforeDestroy() {}, 
destroyed() {},
}
</script>
<style lang='scss'>
.message-box-masking {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 1000001;
    width: 100vw;
    height: 100vh;
    background: rgba(0,0,0,.7);
    display: flex;
    align-items: center;
    justify-content: center;

    .mr6 {
      margin-right: 6px;
    }

    .message-box {
      width: 416px;
      background: #fff;
      border-radius: 6px;
      padding: 16px 24px 24px;
      text-align: left;

      .img_icon {
        align-self: flex-start;
        &.imgStyle {
          width: 40px;
          height: 40px;
          margin-right: 18px;

          img {
            width: 100%;
            height: 100%;
            border-radius: 50%;
          }
        }

        &.iconStyle {
          width: 32px;
          height: 32px;
          margin-right: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      }

      .message-container {
        flex: 1;
      }

      .message-title {
        font-weight: bold;
        color: #2B2E35;
        padding: 5px 0;
        line-height: 22px;
        text-align: left;
      }
      .message-content {
        margin-top: 8px;
        white-space: pre-wrap;
        color: #656A72;
        font-size: 14px;
        line-height: 20px;
      }
      .message-btns {
        margin-top: 24px;
        display: flex;
        justify-content: flex-end;
        // &.reverse {
        //   flex-direction: row-reverse
        // }
        .btn {
          min-width: 84px;
          height: 32px;
          padding: 0 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 6px;
          margin-left: 12px;
          &.only {
            width: 96px;
          }
          

          &.buttton-normal {
            border: 1px solid rgba(45, 74, 148, 0.14);
            color: #656A72;

            &:hover {
              background: rgba(123, 135, 178, 0.15);
            }
          }

          &.button-blue {
            color: #fff;
            background: #3D7BFF;

            &:hover {
              background: #376FE6;
            }
          }

          &.button-red {
            color: #F34848;
            border: 1px solid #F34848;
            background: #fff;

            &:hover {
              background: rgba(243, 72, 72, 0.1);
            }
          }

          &.button-red-fill, 
          &.del  {
            color: #fff;
            background: #F34848;

            &:hover {
              background: #E13843;
            }
          }

          &.button-green {
            color: #fff;
            background: #14BF81;

            &:hover {
              background: #119B68;
            }
          }
        }
      }

      .close-wrap {
        position: absolute;
        top: 16px;
        right: 16px;
        width: 32px;
        height: 32px;
      }
    }
  }
</style>
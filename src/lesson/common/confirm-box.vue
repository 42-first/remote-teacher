/**
* @author [tuqiushuang]
* @email [tuqiushuang@xuetangx.com]
* @create date 2020-05-06 14:20:23
* @modify date 2020-05-06 14:20:23
* @desc [confirm-box]
*/
<template>
<section class='message-box-masking' :id="id">
  <div class="message-box">
    <div class="message-header f18 c333">{{title}}</div>
    <div class="message-content c666">{{message}}</div>
    <div class="message-btns" :class="reverse ? 'reverse' : ''">
      <div class="btn buttton-normal pointer cancel" v-if="showCancel" @click="cancel">{{cancelText}}</div>
      <div class="button-blue btn confirm pointer" :class="[confirmClassProxy, !showCancel ? 'only' : '']" @click="confirm">{{confirmText}}</div>
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
reverse: false
};
},
filters: {},
props: {
  
},
mixins: [  ],
computed: {
  confirmClassProxy() {
    return this.confirmClass ? this.confirmClass : ''
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

    .message-box {
      width: 350px;
      background: #fff;
      border-radius: 4px;
      .message-header {
        font-weight: bold;
        padding: 30px 30px 20px;
      }
      .message-content {
        padding: 0 0 30px;
        margin: 0 30px;
        text-align: center;
        white-space: pre-wrap;
        color: #666;
        font-size: 16px;
        line-height: 22px;
        border-bottom: 1px solid #eee;
      }
      .message-btns {
        margin: 30px 0;
        padding: 0 30px;
        display: flex;
        justify-content: space-around;
        &.reverse {
          flex-direction: row-reverse
        }
        .btn {
          width: 100px;
          height: 34px;
          line-height: 34px;
          background: #5096f5;
          color: #fff;
          border-radius: 4px;
          &.only {
            width: 140px;
          }
          &.cancel {
            background: #fff;
            border: 1px solid #5096f5;
            color: #5096f5;
          }
          &.del {
            background: #f84f41;
          }
        }
      }
    }
  }
</style>
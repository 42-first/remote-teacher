/*
 * @page：个性化弹窗
 * @author: 周正义
 * @update: 2018.05.03
 * @desc 定制化弹窗没有找到合适的插件；这里做一下自己的改造
 *
 */
<template>
  <div class="masking">
    <div class="box back-f clear-fix">
      <div class="message-content w100 text-center color3 font16">{{message}}</div>
      <div class="plugin">
        <slot></slot>
      </div>
      <div class="button-wrapper text-center font18">
        <div class="cancel color-9b" @click="sendResult(0)">{{$t('cancel')}}</div>
        <div class="yes color63" @click="sendResult(1)">{{$t('confirm')}}</div>
      </div>
    </div>
  </div>
</template>
<style lang="scss">
  @import "~@/style/common";
  div{
    box-sizing: border-box;
  }
  .masking{
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 100000001;
    background-color: rgba(0,0,0,.4);
    display: flex;
    .box{
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 300px;
      border-radius: 4px;
      .message-content{
        padding: 20px;
      }
      .plugin{
        padding-bottom: 25px;
        .checkbox-icon{
          color: #639ef4;
          font-size: 22px;
          vertical-align: middle;
          margin-right: 15px;
        }
      }
      .button-wrapper{
        height: 48px;
        line-height: 48px;
        border-top: 1px solid #c8c8c8;
        display: flex;
        .cancel,.yes{
          width: 50%;
        }
        .cancel{
          border-right: 1px solid #c8c8c8;
        }
      }
    }
  }
</style>
<script>
  export default {
    props: ['message'],
    data () {
      return {
      }
    },
    methods: {
      sendResult (type = 1) {
        if (type) {
          this.$emit('yes')
        } else {
          this.$emit('cancel')
        }
      }
    }
  }
</script>

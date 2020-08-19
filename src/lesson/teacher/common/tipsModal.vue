<!-- 全局弹窗组件 -->
<template>
	<div class="tipsModal_container" v-if="isSummoned">
    <div class="tipsModal">
      <div class="modal_header f18">
        {{msg.title}}
      </div>
      <div class="modal_content f15">
        {{msg.content}}
      </div>
      <div class="modal_footer f17" @click="closed">{{msg.option}}</div>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'ykt-tips-modal',
    props: [],
    data () {
      return {
        isSummoned: false,       // 标记本组件是用户点击呼出的，
        msg: {}
      }
    },
    created () {
      let self = this

      T_PUBSUB.unsubscribe('ykt-tips-modal')
      T_PUBSUB.subscribe('ykt-tips-modal', (_name, msg) => {
        self.fire(msg)
      })
    },
    methods: {
      /**
       * 触发弹出提示
       *
       */
      fire (msg) {
        let self = this
        self.msg = msg
        self.isSummoned = true
      },
      closed(){
        this.isSummoned = false
      }
    }
  }
</script>

<style lang="scss" scoped>
  .tipsModal_container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1000;
    background: rgba(0,0,0,.7);
    display: flex;
    align-items: center;
    justify-content: center;

    .tipsModal {
      width: 7.86666667rem;
      .modal_header {
        width: 100%;
        height: 2.4rem;
        background: #f8f8f8;
        text-align: center;
        line-height: 2.4rem;
        color: #333;
        font-weight: bold;
        border-top-left-radius: 0.16rem;
        border-top-right-radius: 0.16rem;
      }
      .modal_content {
        min-height: 2.96rem;
        padding: 0.53333333rem 0.4rem;
        box-sizing: border-box;
        background: #fff;
        color: #666;
        line-height: 0.56rem;
      }
      .modal_footer {
        height: 1.33333333rem;
        border-top: 1px solid #eee;
        text-align: center;
        line-height: 1.33333333rem;
        color: #639EF4;
        font-weight: bold;
        background: #fff;
        border-bottom-left-radius: 0.16rem;
        border-bottom-right-radius: 0.16rem;
      }
    }
  }
</style>

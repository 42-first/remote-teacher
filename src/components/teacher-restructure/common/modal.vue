<!-- 全局模态组件 -->
<template>
	<div class="_outter f18" v-show="isShown">
		<div class="_inner">
      <div class="_title">{{msg}}</div>
      <div class="_btn-box">
        <template v-if="hasCancel">
          <div class="_btn">取消</div>
          <div class="_bar"></div>
        </template>
        <div class="_btn" style="color: #639EF4;" @click="confirm">确定</div>
      </div>
    </div>
	</div>
</template>

<script>
  import config from '@/pages/teacher/config/config'

  export default {
    name: 'ykt-modal',
    props: [],
    data () {
      return {
        isShown: false,
        hasCancel: false,
        msg: 'loading...'
      }
    },
    created () {
      let self = this

      T_PUBSUB.unsubscribe('ykt-msg-modal')
      T_PUBSUB.subscribe('ykt-msg-modal', (_name, msg) => {
        self.fire(msg)
      })
    },
    beforeDestroy(){
      T_PUBSUB.unsubscribe('ykt-msg-modal')
    },
    methods: {
      /**
       * 触发弹出提示
       *
       */
      fire (msg) {
        let self = this

        self.msg = msg
        self.isShown = true
      },
      /**
       * 触发弹出提示
       *
       */
      confirm () {
        let self = this

        if (self.msg === config.pubsubmsg.modal[0]) {
          location.reload()
        }
      },
    }
  }
</script>

<style lang="scss" scoped>
  ._outter {
    position: fixed;
    z-index: 1100;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    background: rgba(0,0,0,0.7);
    text-align: center;
  }
  ._inner {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 7.866667rem;
    height: 4.0rem;
    border-radius: 0.1rem;
    background: #FFFFFF;
    text-align: center;
    color: #4A4A4A;
    overflow: hidden;
  }
  ._title {
    line-height: 2.5rem;
  }
  ._btn-box {
    display: flex;
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 1.333333rem;
    border-top: 0.013333rem solid #C8C8C8;
    
  }
  ._btn {
    flex: 1;
    align-self: center;
  }
  ._bar {
    width: 1px;
    background: #C8C8C8;
  }
</style>

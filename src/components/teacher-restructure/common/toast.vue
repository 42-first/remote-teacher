<!-- 全局弹层组件 -->
<template>
	<div class="toast-box f18" v-show="isShown">
		{{msg}}
	</div>
</template>

<script>
  let timer = null

  export default {
    name: 'ykt-toast',
    props: [],
    data () {
      return {
        isShown: false,
        msg: 'loading...'
      }
    },
    created () {
      let self = this

      T_PUBSUB.unsubscribe('ykt-msg-toast')
      T_PUBSUB.subscribe('ykt-msg-toast', (_name, msg) => {
        self.fire(msg)
      })
    },
    beforeDestroy(){
      T_PUBSUB.unsubscribe('ykt-msg-toast')
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

        clearTimeout(timer)
        setTimeout(() => {
          self.isShown = false
        }, 1000)
      },
    }
  }
</script>

<style lang="scss" scoped>
  .toast-box {
    position: fixed;
    z-index: 1000;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 4.0rem;
    height: 2.0rem;
    border-radius: 0.1rem;
    background: rgba(0,0,0,0.7);
    text-align: center;
    line-height: 2.0rem;
    color: #FFFFFF;
  }
</style>

<!-- 全局弹层组件 -->
<template>
	<div class="toast-box f18" :class="{'animateMobileTextIn': isShown, 'animateMobileTextOut': !isShown, 'none': !isSummoned}">
		{{msg}}
	</div>
</template>

<script>
  let timer1 = null
  let timer2 = null

  export default {
    name: 'ykt-toast',
    props: [],
    data () {
      return {
        isSummoned: false,       // 标记本组件是用户点击呼出的，
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
    methods: {
      /**
       * 触发弹出提示
       *
       */
      fire (msg) {
        let self = this

        self.msg = msg
        self.isShown = true
        self.isSummoned = true

        clearTimeout(timer1)
        clearTimeout(timer2)
        timer1 = setTimeout(() => {
          self.isShown = false
          clearTimeout(timer2)
          timer2 = setTimeout(() => {self.isSummoned = false}, 400)
        }, 3000)
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
    margin-left: -2.0rem;
    margin-top: -2.0rem;
    width: 4.0rem;
    height: 2.0rem;
    border-radius: 0.1rem;
    background: rgba(0,0,0,0.7);
    text-align: center;
    line-height: 2.0rem;
    color: #FFFFFF;
  }

  .none {
    display: none;
  }

  //参考微信文字淡入http://weread.qq.com/
  @keyframes animateMobileTextIn {
      0% {
          transform: scale(0.5, 0.5);
          opacity: 0;
      }
      90% {
          opacity: 1;
      }
      100% {
          transform: scale(1, 1);
          opacity: 1;
      }
  }
  .animateMobileTextIn {
      -webkit-animation: animateMobileTextIn 0.4s;
      animation: animateMobileTextIn 0.4s;
  //    -webkit-animation-fill-mode: forwards;
  //    animation-fill-mode: forwards;
      -webkit-animation-timing-function: ease;
      animation-timing-function: ease;
  }
  @keyframes animateMobileTextOut {
      0% {
          transform: scale(1, 1);
          opacity: 1;
      }
      90% {
          opacity: 0;
      }
      100% {
          transform: scale(0.5, 0.5);
          opacity: 0;
      }
  }
  .animateMobileTextOut {
      -webkit-animation: animateMobileTextOut 0.4s;
      animation: animateMobileTextOut 0.4s;
      -webkit-animation-fill-mode: forwards;
      animation-fill-mode: forwards;
      -webkit-animation-timing-function: ease;
      animation-timing-function: ease;
  }
</style>

<!-- 全局弹层组件 -->
<template>
  <div class="toast_container" :class="[{'animateMobileTextIn': isShown, 'animateMobileTextOut': !isShown, 'none': !isSummoned}]">
    <div class="toast-box f18" >
      {{msg}}
    </div>
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
        msg: 'loading...',
				newClassName: ''
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
				if(typeof msg == "object"){
					self.msg = msg.msg
					self.newClassName = msg.newClassName
				}else {
					self.msg = msg
				}

        self.isShown = true
        self.isSummoned = true

        clearTimeout(timer1)
        clearTimeout(timer2)
        timer1 = setTimeout(() => {
          self.isShown = false
          clearTimeout(timer2)
          timer2 = setTimeout(() => {
						self.isSummoned = false
						self.newClassName = ''
					}, 400)
        }, 3000)
      },
    }
  }
</script>

<style lang="scss" scoped>
.toast_container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  position: fixed;
  z-index: 99999999;
}
  .toast-box {
    position: fixed;
    border-radius: 0.1rem;
    background: rgba(0,0,0,0.7);
    line-height: 0.66666667rem;
    text-align: center;
    color: #FFFFFF;
    box-sizing: border-box;
    display: inline-block;
    padding: 0.4rem 0.45333333rem;
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

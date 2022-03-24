<!-- 全局模态组件 -->
<template>
	<div class="_outter f18" v-show="isShown">
		<div class="_inner">
      <div class="_title">{{msg}}</div>
      <div class="_btn-box">
          <v-touch v-show="!isCancelHidden" class="_btn" v-on:tap="cancel"><!-- 取消 -->{{ $t('cancel') }}</v-touch>
          <div v-show="!isCancelHidden" class="_bar"></div>
        <v-touch class="_btn" style="color: #639EF4;" v-on:tap="confirm"><!-- 确定 -->{{ $t('confirm') }}</v-touch>
      </div>
    </div>
	</div>
</template>

<script>
  import config from '@/pages/teacher/config/config'
  let mark = '' //标记传递的信息，比如试题收题的话，传递的是 problemid

  export default {
    name: 'ykt-modal',
    props: [],
    data () {
      return {
        isShown: false,
        isCancelHidden: false,
        msg: 'loading...'
      }
    },
    created () {
      let self = this

      T_PUBSUB.unsubscribe('ykt-msg-modal')
      T_PUBSUB.subscribe('ykt-msg-modal', (_name, opt) => {
        self.fire(opt)
      })
    },
    methods: {
      /**
       * 触发弹出提示
       *
       */
      fire (opt) {
        let self = this

        mark = opt.mark

        self.msg = opt.msg
        self.isCancelHidden = opt.isCancelHidden
        self.isShown = true
      },
      /**
       * 触发弹出提示
       *
       */
      confirm () {
        let self = this

        switch (self.msg) {
          case config.pubsubmsg.modal[0]:
            // 新课二级页面是二级路由 需要手动关闭弹窗 
            self.isShown = false
            this.$router.back()
            break;
          case config.pubsubmsg.modal[1]:
            T_PUBSUB.publish('pro-msg.shoutih5', {problemid: +mark});
            self.isShown = false
            break;
        }
      },
      /**
       * 取消
       *
       */
      cancel () {
        let self = this

        self.isShown = false
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
    padding-top: 0.8rem;
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

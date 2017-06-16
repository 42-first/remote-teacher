<!-- 弹幕控制页面 被父组件 rc-mask-activity.vue 引用 -->
<template>
	<div class="danmu-box allowscrollcallback">
    <div class="desc f20">
      <span>弹幕</span>
      <v-touch  tag="i" :class="['iconfont', 'f40', isDanmuOpen ? 'icon-danmu-open' : 'icon-danmu-close']" v-on:tap="setDanmuStatus"></v-touch>
    </div>
    <div class="gap"></div>
    <section class="list">
      
    </section>
    <v-touch class="back-btn f18" v-on:tap="closeDanmubox">返回</v-touch>
  </div>
</template>

<script>
  export default {
    name: 'RcMaskActivityDanmubox',
    props: ['lessonid', 'socket', 'isDanmuOpen'],
    data () {
      return {
      }
    },
    created () {
      let self = this


      // 父组件点击 弹幕 按钮时发送事件给本子组件
      self.$on('showDanmubox', function (msg) {
        // self.refreshProblemResultDetail()
      })
    },
    methods: {
      /**
       * 点击 返回 按钮 返回课堂动态
       *
       * @event bindtap
       */
      closeDanmubox () {
        this.$emit('closeDanmubox')
      },
      /**
       * 点击弹幕按钮，设置是否允许弹幕
       *
       * @event bindtap
       */
      setDanmuStatus () {
        let self = this
        let op = self.isDanmuOpen ? 'turnoffdanmu' : 'turnondanmu'
        let desc = self.isDanmuOpen ? '关闭' : '开启'
        let str = JSON.stringify({
          'op': op,
          'lessonid': self.lessonid,
          'event': {
            'type': 'event',
            'title': '老师已' + desc + '弹幕',
            'dt': (new Date()).getTime()  //Datetime 时间戳
          }
        })

        self.socket.send(str)
      },
    }
  }
</script>

<style lang="scss" scoped>
  @import "~@/style/_variables";
  .danmu-box {
    position: absolute;
    z-index: 20; /* 遮盖toolbar */
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    background: $white;
    color: #4A4A4A;
    overflow: auto;

    .desc {
      padding: 0 0.4rem;
      height: 1.466667rem;
      line-height: 1.466667rem;
      
      span {
        color: $blue;
      }

      .iconfont {
        float: right;
        margin-top: 0.1rem;
        vertical-align: middle;
      }
      .icon-danmu-open {
        color: $blue;
      }
    }

    .gap {
      height: 0.266667rem;
      background: #EDF2F6;
    }

    .back-btn {
      position: fixed;
      left: 0;
      right: 0;
      bottom: 0;
      height: 1.466667rem;
      line-height: 1.466667rem;
      text-align: center;
      background: $blue;
      color: $white;
    }
  }
</style>

<!-- 教师遥控器工具栏 被父组件 remote.vue 引用 -->
<template>
	<div class="toolbar-root">
		<div class="rc-toolbar f12">
		  <v-touch class="tool-item first-item" v-on:tap="goHome">
		    <div class="bulb"></div>
		    <div>遥控器</div>
		  </v-touch>
		  <v-touch class="tool-item" v-on:tap="showThumbnail">
		    <i class="iconfont icon-cascades f16"></i>
		    缩略图
        <span class="info f12" v-show="newdoubt">{{newdoubt}}</span>
		  </v-touch>
		  <v-touch class="tool-item" v-on:tap="showActivity">
		    <i class="iconfont icon-exercise f16"></i>
		    课堂动态
        <span class="info f12" v-show="newtougao">{{newtougao}}</span>
		  </v-touch>
		  <v-touch class="tool-item last-item" v-on:tap="toggleToolbarMoreBox">
		    <i class="iconfont icon-more f16"></i>
		    更多
		  </v-touch>
		</div>

		<!-- 更多的内容 -->
		<div v-show="!isToolbarMoreBoxHidden" class="toolbar-more-box f18">
		  <v-touch class="more-item" v-on:tap="summonQrcodeMask">
		    <i class="iconfont icon-erweima f24"></i>
		    <span>二维码</span>
		  </v-touch>

		  <v-touch class="more-item" v-on:tap="callWakeup">
		    <i class="iconfont icon-people f24"></i>
		    <span style="margin-left: 32rpx;">随机点名</span>
		  </v-touch>
		</div>
	</div>
</template>

<script>

  export default {
    name: 'Tollbar',
    props: ['lessonid', 'socket', 'newdoubt', 'newtougao'],
    data () {
      return {
        isToolbarMoreBoxHidden: true,           // 工具栏更多按钮们的隐藏
      }
    },
    created () {

    },
    methods: {
      /**
       * 点击 缩略图 按钮
       *
       */
      showThumbnail () {
        this.$emit('showThumbnail')
      },
      /**
       * 点击 课堂动态 按钮
       *
       */
      showActivity () {
        this.$emit('showActivity')
      },
      /**
       * 点击 遥控器 按钮
       * 一般是用于主动关闭缩略图蒙版
       *
       */
      goHome () {
        this.$emit('goHome')
      },
      /**
       * 点击工具栏更多按钮，显示隐藏更多按钮卡片
       *
       * @event tap
       */
      toggleToolbarMoreBox () {
        let self = this

        self.isToolbarMoreBoxHidden = !self.isToolbarMoreBoxHidden
      },
      /**
       * 点击二维码按钮，发送弹出二维码控制面板的请求，收到回复后在回复中才打开面板
       *
       * @event tap
       */
      summonQrcodeMask () {
        let self = this
        let str = JSON.stringify({
          'op': 'tryzoomqrcode',
          'lessonid': self.lessonid,
          'qrcode': 99
        })

        self.socket.send(str)
        self.isToolbarMoreBoxHidden = true
      },
      /**
       * 点击 随机点名 按钮，发送弹出 随机点名 控制面板的请求，收到回复后在回复中才打开面板
       *
       * @event tap
       */
      callWakeup () {
        let self = this
        let str = JSON.stringify({
          'op': 'callwakeup',
          'lessonid': self.lessonid
        })

        self.socket.send(str)
        self.isToolbarMoreBoxHidden = true
      },
    }
  }
</script>

<style lang="scss" scoped>
  @import "~@/style/_variables";
  .toolbar-root {
    position: relative;
  }
  /* 当蒙版是缩略图时，底部的工具栏要露出来 */
  .higher-than-InitiativeCtrlMask {
    z-index: 10;
  }
  .rc-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 1.706667rem;
    background: rgba(34,34,34,0.9);

    .tool-item {
      position: relative;
      flex: 1;
      text-align: center;
      border-right: 1px solid #eee;

      .iconfont {
        display: inline-block;
        width: 100%;
        text-align: center;
      }

      .info {
        position: absolute;
        right: 0.133333rem;
        top: 0;
        width: 0.666667rem;
        height: 0.6rem;
        line-height: 0.6rem;
        text-align: center;
        background: #D0021B;
        border-radius: 0.25rem;
      }
    }
    .last-item {
      border-right: 0;
    }
    .bulb {
      display: inline-block;
      width: 0.266667rem;
      height: 0.266667rem;
      background-color: $blue;
    }
  }


  /*更多按钮打开的内容*/
  .toolbar-more-box {
    position: absolute;
    right: 0.133333rem;
    bottom: 2.026667rem;
    width: 3.6rem;
    height: 2.933333rem;

    padding: 5rpx 10rpx;
    background: #333333;
    border-radius: 10px;
    color: #ffffff;

    .more-item {
      margin: 0 auto;
      width: 2.826667rem;
      height: 1.44rem;
      line-height: 1.44rem;
      text-align: left;
      border-bottom: 1px solid #979797;

      &:last-child {
        border: 0;
      }
    }
  }
</style>

<!-- 教师遥控器工具栏 -->
<template>
	<div class="toolbar-root">
		<div class="rc-toolbar">
		  <div class="tool-item first-item" >
		    <div class="bulb"></div>
		    <div>遥控器</div>
		  </div>
		  <v-touch class="tool-item" v-on:tap="showThumbnail">
		    <i class="iconfont icon-cascades"></i>
		    缩略图
		  </v-touch>
		  <div class="tool-item" bindtap="showPaperQuiz">
		    <i class="iconfont icon-exercise"></i>
		    课堂动态
		  </div>
		  <div class="tool-item last-item" bindtap="toggleToolbarMoreBox">
		    <i class="iconfont icon-more"></i>
		    更多
		  </div>
		</div>

		<!-- 更多的内容 -->
		<div class="toolbar-more-box none">
		  <div class="danmubox" bindtap="summonQrcodeMask">
		    <i class="iconfont icon-erweima"></i>
		    <span>二维码</span>
		  </div>
		  
		  <div class="danmubox"  bindtap="setDanmuStatus">
		    <i class="iconfont "></i>
		    <span style="margin-left: 20rpx;">弹幕</span>
		  </div>

		  <div bindtap="setEndShow">
		    <i class="iconfont icon-tuichu"></i>
		    <span style="margin-left: 32rpx;">结束</span>
		  </div>
		  <div class="triangle"></div>
		</div>
	</div>
</template>

<script>

export default {
  name: 'Tollbar',
  data () {
    return {
      lessonid: 0
    }
  },
  created () {

  },
  methods: {
    /**
     * 点开缩略图按钮
     *
     */
    showThumbnail () {
      console.log(800)
    }
  }
}
</script>

<style lang="scss" scoped>
/*下方工具栏*/
.rc-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 1.706667rem;
  font-size: 12px;

  .tool-item {
    flex: 1;
    text-align: center;

    .iconfont {
      display: inline-block;
      width: 100%;
      text-align: center;
      font-size: 16px;
    }
  }
  .first-item {
    border-right: 1px solid #eee;
  }
  .last-item {
    border-left: 1px solid #eee;
  }
  .bulb {
    display: inline-block;
    width: 0.266667rem;
    height: 0.266667rem;
    background-color: #ff0000;
  }
}

[data-dpr="2"] .rc-toolbar {
  font-size: 24px;
  .iconfont {
    font-size: 33px;
  }
}
[data-dpr="3"] .rc-toolbar {
  font-size: 36px;
  .iconfont {
    font-size: 48px;
  }
}

.rc-toolbar.online .bulb {
  border-radius: 50%;
  background-color: #28cf6e;
}

/*更多按钮打开的内容*/
.toolbar-more-box {
  position: absolute;
  right: 2%;
  bottom: 140rpx;
  width: 140rpx;
  height: 220rpx;
  padding: 5rpx 10rpx;
  background: rgba(0,0,0,0.72);
  border-radius: 10rpx;
  color: #fff;
}
.triangle {
  width: 0;
  height: 0;
  margin: 0 auto;
  border-width: 20rpx;
  border-color: rgba(0,0,0,0.72) transparent transparent transparent;
  border-style: solid;
}
.danmubox {
  border-bottom: 1rpx solid #999;
}
.danmubox .iconfont {
  font-size: 50rpx;
  vertical-align: middle;
}
.icon-danmu-open {color: #28cf6e;}
</style>

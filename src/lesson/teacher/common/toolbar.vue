<!-- 教师遥控器工具栏 被父组件 home.vue activity.vue 引用 -->
<template>
	<div class="toolbar-root dontcallback">
		<div class="rc-toolbar f12">
      <v-touch :class="['tool-item', 'first-item', {'active': activeIndex === 0}]" v-on:tap="goHome">
        <i class="iconfont f28" :class="activeIndex === 0 ? 'icon-ykq_tab_active2' : 'icon-ykq_tab_normal'"></i>
        <div class="icondesc">{{ $t('remotectrl') }}</div>
      </v-touch>
		  <v-touch :class="['tool-item', 'J_ga', {'active': activeIndex === 1}]" v-on:tap="showThumbnail" data-category="1" data-label="工具栏">
		    <i class="iconfont f28" :class="activeIndex === 1 ? 'icon-ykq_tab_active' : 'icon-ykq_tab_normal2' "></i>
		    <div class="icondesc">{{ $t('thumbnail') }}</div>
        <span class="info suoluetu-info f12" v-show="newdoubt">{{newdoubt}}</span>
		  </v-touch>
		  <v-touch :class="['tool-item', 'J_ga', {'active': activeIndex === 2}]" v-on:tap="showActivity" data-category="4" data-label="工具栏">
		    <i class="iconfont f28" :class="activeIndex === 2 ? 'icon-ykq_tab_active1' : 'icon-ykq_tab_normal1' "></i>
		    <div class="icondesc">{{ $t('classact') }}</div>
        <span class="info f12" v-show="newtougao">{{newtougao}}</span>
		  </v-touch>
		  <v-touch :class="['tool-item', 'last-item', 'J_ga']" v-on:tap="toggleToolbarMoreBox" data-category="11" data-label="工具栏">
		    <i class="iconfont f28" :class="isToolbarMoreBoxHidden ? 'icon-ykq_tab_normal3' : 'icon-ykq_tab_normal3' "></i>
		    <div class="icondesc">{{ $t('readmore') }}</div>
		  </v-touch>
		</div>

		<!-- 更多的内容 -->
    <div class="toolbar-more-box-wrapper" v-show="!isToolbarMoreBoxHidden" @click="touchCloseToolbarMoreBox">
      <div class="toolbar-more-box f14">
        <i class="iconfont icon-sanjiaoxing f24"></i>
        <v-touch class="more-item" v-on:tap="summonQrcodeMask" v-show="errType !== 2">
          <i class="iconfont icon-ykq_erweima f24"></i>
          <span>{{ $t('qrcode') }}</span>
        </v-touch>

        <v-touch class="more-item J_ga" v-on:tap="callWakeup" data-category="12" data-label="工具栏">
          <i class="iconfont icon-suijidianming1 f24"></i>
          <span style="margin-left: 32rpx;">{{ $t('radomrollcall') }}</span>
        </v-touch>

        <v-touch class="more-item" v-on:tap="gotoStu">
          <i class="iconfont icon-qiehuanshijiao f24 ver-middle"></i>
          <span style="margin-left: 32rpx;" class="ver-middle">{{ $t('viewasstudent') }}</span>
        </v-touch>

        <v-touch class="more-item" v-on:tap="setEndShow" v-show="errType !== 2">
          <i class="iconfont icon-ykq-tuichufangying f24"></i>
          <span style="margin-left: 32rpx;">{{ $t('endshow') }}</span>
        </v-touch>
        <v-touch class="more-item" v-on:tap="goSet" v-if="addinversionRight >= 1.1">
          <i class="iconfont icon-shezhi f24 ver-middle"></i>
          <span style="margin-left: 32rpx;" class="ver-middle">{{ $t('set') }}</span>
        </v-touch>

      </div>
    </div>

    <!-- 新功能提示 -->
    <!-- <div class="tips" v-show="newToolBar && !activeIndex">
      {{$t('toupingfanweitishi')}}
      <i class="iconfont icon-shiti_guanbitouping" @click="closeTips"></i>
    </div> -->
	</div>
</template>

<script>
  import {mapGetters} from 'vuex'

  export default {
    name: 'Tollbar',
    props: ['activeIndex'],
    data () {
      return {
        // activeIndex: 0,   // 当前正在高亮的工具栏tab序号
        isToolbarMoreBoxHidden: true,           // 工具栏更多按钮们的隐藏
        isHideSet: false,           // 工具栏设置按钮的隐藏
      }
    },
    computed: {
      ...mapGetters([
        'lessonid',
        'presentationid',
        'socket',
        'newdoubt',
        'newtougao',
        'newToolBar',
        'addinversion',
        'errType',
        'toolbarIndex',
        'isCloneClass'
      ]),
      addinversionRight() {
        return Number(this.addinversion) || 0;
      }
    },
    created () {
      let self = this
      // 主屏幕点击 缩略图、课堂动态 后，隐藏更多
      self.$on('hideToolbarMore', function () {
        self.closeMore()
      })
      let newToolBar = !localStorage.getItem('newToolBar')
      this.$store.commit('set_newToolBar', newToolBar)
      this.isHideSet = this.$route.name === "stateSet";
    },
    methods: {
      /**
       * 点击 缩略图 按钮
       *
       */
      showThumbnail () {
        this.$emit('showThumbnail')
        this.$store.dispatch('set_toolbarIndex', 1)
      },
      /**
       * 点击 课堂动态 按钮
       *
       */
      showActivity () {
        this.$emit('showActivity')
        this.$store.dispatch('set_toolbarIndex', 2)
      },
      /**
       * 点击 遥控器 按钮
       * 一般是用于主动关闭缩略图蒙版
       *
       */
      goHome () {
        this.$emit('goHome')
        this.$store.dispatch('set_toolbarIndex', 0)
      },
      /**
       * 点击工具栏更多按钮，显示隐藏更多按钮卡片
       *
       * @event tap
       */
      toggleToolbarMoreBox () {
        let self = this
        self.isToolbarMoreBoxHidden = !self.isToolbarMoreBoxHidden
        // self.$emit('update:isToolbarMoreBoxHidden', !self.isToolbarMoreBoxHidden)
      },
      /* 点击外部蒙层关闭更多菜单栏 */
      touchCloseToolbarMoreBox(e) {
        const $target = e.target
        if ($target) {
          const className = $target.getAttribute('class')
          if (className && className.indexOf('toolbar-more-box-wrapper')>-1) {
            this.isToolbarMoreBoxHidden = !this.isToolbarMoreBoxHidden
          }
        }
      },
      /**
       * 点击二维码按钮，发送弹出二维码控制面板的请求，收到回复后在回复中才打开面板
       *
       * @event tap
       */
      summonQrcodeMask () {
        // 克隆班不能执行当前操作
        if (!!this.isCloneClass) {
          this.$toast({
            message: this.$t('cloneTips'),
            duration: 3e3
          });
          return
        }
        let self = this
        let str = JSON.stringify({
          'op': 'tryzoomqrcode',
          'lessonid': self.lessonid,
          'qrcode': 99
        })

        self.socket.send(str)
        // self.$emit('update:isToolbarMoreBoxHidden', true)
        self.closeMore()
      },
      /**
       * 点击 随机点名 按钮，发送弹出 随机点名 控制面板的请求，收到回复后在回复中才打开面板
       *
       * @event tap
       * @param {object} evt event对象
       */
      callWakeup (evt) {

        // 克隆班不能执行当前操作
        if (!!this.isCloneClass) {
          this.$toast({
            message: this.$t('cloneTips'),
            duration: 3e3
          });
          return
        }

        let self = this
        let str = JSON.stringify({
          'op': 'callwakeup',
          'lessonid': self.lessonid
        })

        self.socket.send(str)
        // self.$emit('update:isToolbarMoreBoxHidden', true)
        self.closeMore()
      },
      /**
       * 点击更多->退出放映按钮，设置结束授课
       *
       * @event bindtap
       */
      setEndShow () {

        // 克隆班不能执行当前操作
        if (!!this.isCloneClass) {
          this.$toast({
            message: this.$t('cloneTips'),
            duration: 3e3
          });
          return
        }

        let self = this
        let str = JSON.stringify({
          'op': 'endshow',
          'lessonid': self.lessonid,
          'presentation': self.presentationid
        })

        self.socket.send(str)
        // self.$emit('update:isToolbarMoreBoxHidden', true)
        self.closeMore()
      },
      goSet () {
        this.$emit('stateSet', 1)
        this.$router.push({name: 'stateSet_v3', query: {nojump: 1}})
        this.closeMore()
      },
      // 延迟关闭当前浮窗
      closeMore() {
        let self = this
        setTimeout(e=>{
          self.isToolbarMoreBoxHidden = true
        }, 200)
      },
      //  关闭新功能提示tips
      closeTips () {
        this.$store.commit('set_newToolBar', false)
        localStorage.setItem('newToolBar', 1)
      },
      // 学生视角预览
      gotoStu(){
        location.href = '/lesson/student/v3/'+ this.lessonid +'?force=lecture&remote=1'
      }
    }
  }
</script>

<style lang="scss" scoped>
  @import "~@/style/_variables";
  @import "~@/style/common";
  .toolbar-root {
    position: relative;
    color: #9b9b9b;
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
      // border-right: 1px solid #eee;

      .iconfont {
        display: inline-block;
        width: 100%;
        text-align: center;
      }

      .icondesc {
        margin-top: -0.133333rem;
      }

      .info {
        position: absolute;
        left: 1.5rem;
        top: 0;
        min-width: 0.45rem;
        padding: 0 0.1rem;
        text-align: center;
        background: #D0021B;
        border-radius: 0.32rem;
        color: $white;
      }
      .suoluetu-info {
        background: $blue;
      }
    }
    .last-item {
      border-right: 0;
    }
    .active {
      color: $blue;
    }
    .online {
      color: $blue;
    }
    .offline {
      color: #f40;
    }
  }

  .toolbar-more-box-wrapper{
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: calc(100% - 1.706667rem);
    z-index: 10000;
  }
  /*更多按钮打开的内容*/
  .toolbar-more-box {
    position: absolute;
    right: 0.133333rem;
    bottom: 0.24rem;
    width: 3.86666667rem;
    /*height: 4.5rem;*/

    background: #333333;
    border-radius: 10px;
    color: #ffffff;

    .icon-sanjiaoxing {
      position: absolute;
      left: 2.133333rem;
      bottom: -0.506667rem;
      color: #333333;
    }

    .more-item {
      margin: 0 auto;
      width: 3.2rem;
      height: 1.44rem;
      line-height: 1.44rem;
      text-align: left;
      border-bottom: 1px solid #979797;
      white-space: nowrap;
      .iconfont {
        margin-right: 0.2rem;
      }

      &:last-child {
        border: 0;
      }
    }
  }

  /* 新功能提示 */
  .tips{
    height: 1.067rem;
    line-height: 1.067rem;
    padding: 0 0.4rem;
    color: #fff;
    border-radius: 0.5333rem;
    background-color: rgba(0,0,0,1);
    position: absolute;
    top: -1.1rem;
    left: 50%;
    margin-left: -40%;
    overflow: hidden;
    font-size: 0.373rem;
    .iconfont{
      font-size: 0.764rem;
      vertical-align: middle;
    }
  }

  @media only screen and (device-width: 375px) and (device-height: 812px) and (-webkit-min-device-pixel-ratio: 3) {
    .rc-toolbar {
      height: 2rem;
      align-items: flex-start;
    }
  }
</style>

<!-- 缩略图面板 被父组件 home.vue 引用 -->
<template>
	<div class="thumbnail-box">
    <section class="tab-box f15">
      <v-touch :class="['item', {'active': tab === 1}]" v-on:tap="swichType(1)">PPT</v-touch>
      <div class="bar" v-show="tab === 3"></div>
      <v-touch :class="['item', 'J_ga', {'active': tab === 2}]" v-on:tap="swichType(2)" data-category="2" data-label="缩略图页">
        {{ $t('unknown') }}
        <span class="info f12" v-show="newdoubt">{{newdoubt}}</span>
      </v-touch>
      <div class="bar" v-show="tab === 1"></div>
      <v-touch :class="['item', 'J_ga', {'active': tab === 3}]" v-on:tap="swichType(3)" data-category="3" data-label="缩略图页">{{ $t('prob') }}</v-touch>
    </section>

    <!-- PPT 类型 -->
    <div v-show="tab === 1" class="scroll-box scroll-box1 allowscrollcallback">
      <v-touch v-for="(item, index) in pptData" :id="'t' + (index+1)" :key="item.id" :class="['item', {'active': current === index + 1}]" v-on:tap="tapThumbnail(index+1)">
        <span class="gridimg-holder" v-show="!item.thumbnail || imgHolder[index]" :style="{height: realHeight + 'rem'}"></span>
        <span class="gridimg-holder holder-mask" :style="{height: realHeight + 'rem'}"></span>
        <img :src="item.thumbnail" alt="" v-show="!imgHolder[index]" class="gridimg" :onload="hideHolder(index, item.thumbnail)" :style="{minHeight: realHeight + 'rem'}">
        <div class="gridlabel f18">{{index + 1}} / {{total}}</div>
        <div class="f15 bdsz">{{doubtList[index] ? $t('unknown')+': '+doubtList[index] : ''}}</div>
      </v-touch>
    </div>

    <!-- 不懂 类型 -->
    <section class="scroll-box scroll-box2 allowscrollcallback" v-show="tab === 2">
      <!-- 新增白板不懂入口 有数据显示没数据不显示  -->
      <router-link tag="section" :to="{ name: 'boardlist_v3', params: { lessonid: lessonid } }" class="board__box" v-if="doubtBoard">
        <div class="board__left">
          <img class="board--image" alt="雨课堂,白板" src="http://sfe.ykt.io/o_1cs602ntrk81rnejl2im1n3s9.png" />
          <span class="board--title f14"><!-- 白板不懂 -->{{ $t('boardunknow') }}</span>
        </div>
        <p class="board__right">
          <span class="board--unknow f15">{{ doubtBoard }}</span>
          <i class="iconfont icon-jinrucopy f25"></i>
        </p>
      </router-link>

      <div class="">
        <v-touch v-for="item in doubtSorted" :id="'t' + (item.index+1)" :key="item.index" :class="['item', {'active': current === item.index + 1}]" v-on:tap="tapThumbnail(item.index+1)" v-if="item.val">
        <span class="gridimg-holder" v-show="!pptData[item.index].thumbnail || imgHolder[item.index]" :style="{height: realHeight + 'rem'}"></span>
        <span class="gridimg-holder holder-mask" :style="{height: realHeight + 'rem'}"></span>
        <img :src="pptData[item.index].thumbnail" v-show="!imgHolder[item.index]" alt="" class="gridimg" :style="{minHeight: realHeight + 'rem'}">
        <div class="gridlabel f18">{{item.index + 1}} / {{total}}</div>
        <div class="f15">{{ $t('unknown') }}: {{item.val}}</div>
        </v-touch>
      </div>
    </section>

    <!-- 习题 类型 -->
    <div v-show="tab === 3" class="scroll-box scroll-box3 allowscrollcallback">
      <v-touch v-for="(item, index) in pptData" :id="'t' + (index+1)" :key="item.id" :class="['item', {'active': current === index + 1}]" v-on:tap="tapThumbnail(index+1)" v-if="item.problem">
        <span class="gridimg-holder" v-show="!item.thumbnail || imgHolder[index]" :style="{height: realHeight + 'rem'}"></span>
        <span class="gridimg-holder holder-mask" :style="{height: realHeight + 'rem'}"></span>
        <img :src="item.thumbnail" alt="" v-show="!imgHolder[index]" class="gridimg" :style="{minHeight: realHeight + 'rem'}">
        <div class="gridlabel f18">{{index + 1}} / {{total}}</div>
      </v-touch>
    </div>

    <Toolbar
      ref="Toolbar"
      :active-index="1"
      :is-socket-connected="isSocketConnected"
      @goHome="goHome"
      @showActivity="showActivity"
      @stateSet="stateSetFn"
    ></Toolbar>
  </div>
</template>

<script>
  import {mapGetters} from 'vuex'
  import request from '@/util/request-v3'
  import API from '@/util/api'

  // 工具栏
  import Toolbar from './toolbar'

  export default {
    name: 'thumbnail',
    props: ['isSocketConnected', 'cardWidth', 'cardHeight'],
    data () {
      return {
        tab: 1,         // 缩略图当前tab
        doubtList: [],  // 不懂人员分布
        imgHolder: [],  // 图片加载成功前占位符, 1表示显示占位符
				realHeight: null,
        // 白板不懂数
        doubtBoard: 0
      }
    },
    computed: {
      // 从高到低排序"不懂""
      doubtSorted: function () {
        let self = this
        let doubtList = self.doubtList
        let arr = []

        for (let i = doubtList.length - 1; i >= 0; i--) {
          arr[i] = {
            'index': i,
            'val': doubtList[i]
          }
        }

        arr.sort((a, b) => b.val - a.val)
        return arr
      },
      ...mapGetters([
        'lessonid',
        'presentationid',
        'pptData',
        'current',
        'total',
        'socket',
        'newdoubt',
        'isCloneClass'
      ])
    },
    components: {
      Toolbar,
    },
    created () {
      let self = this

      // 点击 缩略图 按钮 父组件发送事件给本子组件，想要滚动到当前页
      self.$on('Thumbnail', function () {
        let container = self.$el.querySelector('.scroll-box1')
        let currentPage = container.querySelector('#t'+self.current)
        container.scrollTop = currentPage.offsetTop

        // 不懂的总是显示最上面
        self.$el.querySelector('.scroll-box2').scrollTop = 0

        let container3 = self.$el.querySelector('.scroll-box3')
        let currentPage3 = container.querySelector('#t'+self.current)
        container3.scrollTop = currentPage3.offsetTop

        self.fetchPresentationTag()
      })
    },

    mounted () {
      // 处理缩略图holder高度为真实高度
      // 使用ppt类型中的最后一张图（或占位div）的宽度以及ppt卡片的宽高比计算得出
      let self = this

			// 缩略图宽度为4.4rem，直接取用该值
      let holderWidth = 4.4
      let bili = self.cardHeight/self.cardWidth
      let realHeight = holderWidth * bili

      // 如果得出的结果是0，就不执行
      if (!realHeight) {return;}

			this.realHeight = realHeight
    },
    methods: {
      /**
       * 切换上方的 PPT 不懂 习题
       *
       * @event bindtap
       * @param {number} tab  1 PPT 2 不懂 3 习题
       */
      swichType (tab) {
        let self = this

        self.tab = tab
        if (tab === 2) {
          self.$emit('checkDoubt')
          self.fetchPresentationTag()
        }
      },
      /**
       * 图片加载完毕后隐藏占位框
       *
       * @event bindtap
       * @param {Number} index  图片序号
       * @param {String} src  图片url
       */
      hideHolder (index, src) {
        let self = this

        // 图片url为空 '' 时也要显示占位符
        self.imgHolder[index] = !src ? 1 : 0
      },
      /**
       * 点击缩略图按钮给WebSocket发指令要进入某页
       *
       * @event bindtap
       * @param {number} to 翻到的页码 从1开始
       */
      tapThumbnail (to) {

        // 克隆班不能执行当前操作
        if (!!this.isCloneClass) {
          this.$toast({
            message: this.$t('cloneTips'),
            duration: 3e3
          });
          return
        }

        let self = this
        if (self.current === to) {
          setTimeout(() => {
            self.$emit('goHome')
          }, 100)
          return;
        }

        let str = JSON.stringify({
          'op': 'navtoslide',
          'lessonid': self.lessonid,
          'presentation': self.presentationid,
          'msgid': 1234,
          'to': to
        })

        self.socket.send(str)
      },
      /**
       * 获取缩略图页 不懂 等标志的信息
       *
       */
      fetchPresentationTag () {
        let self = this
        let URL = API.lesson.get_presentation_tag
				let params = {
					presentation_id: self.presentationid
				}
				
				return request.get(URL, params)
				.then((res) => {
					if(res && res.code === 0 && res.data){
						self.doubtList = res.data.doubtCountList
            self.doubtBoard = res.data.doubtFileSharingCount
					}
				}).catch(error => {

				})
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
       * 点击 课堂动态 按钮
       *
       */
      showActivity () {
        this.$emit('showActivity')
      },
      // 设置
      stateSetFn () {
        this.$emit('stateSet')
      }
    }
  }
</script>

<style lang="scss" scoped>
  @import "~@/style/_variables";
  .thumbnail-box {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 100%;
    overflow: hidden;
    color: $white;
    background: #000000;

    .tab-box {
      display: flex;
      margin: 0.4rem auto;
      width: 8.0rem;
      height: 0.906667rem;
      line-height: 0.8rem;
      border: 1px solid $blue;
      border-radius: 0.08rem;
      text-align: center;
      color: $blue;

      .item {
        position: relative;
        flex: 1;

        .info {
          position: absolute;
          left: 1.7rem;
          top: 0;
          min-width: 0.45rem;
          padding: 0 0.1rem;
          text-align: center;
          background: $blue;
          border-radius: 0.32rem;
          color: $white;
          line-height: 0.48rem;
        }
      }
      .bar {
        width: 1px;
        background: $blue;
        margin: 0.22rem 0;
      }
      .active {
        background: $blue;
        color: $white;
      }
    }

    .scroll-box {
      height: 100%;
      position: relative;
      padding: 0 0.453333rem;
      margin-bottom: 0.4rem;
      overflow: auto;
      -webkit-overflow-scrolling: touch;

      .item {
        float: left;
        position: relative;
        width: 4.4rem;
        // overflow: hidden;
        margin-bottom: 0.4rem;
        color: $white;
        text-align: center;

        &:nth-child(2n) {
          float: right;
        }
        &:nth-child(2n+1) {
          clear: both;
        }

        .gridimg {
          box-sizing: border-box;
          width: 100%;
          background-color: #f6f7f8;
          // background: #9B9B9B;
        }

        .gridimg-holder {
          display: inline-block;
          box-sizing: border-box;
          width: 100%;
          height: 2.4rem;
          background: #9B9B9B;
        }

        .holder-mask {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          height: 100%;
          background: transparent;
        }

        .bdsz {
          min-height: 0.6rem;
        }

        .gridlabel {
          position: absolute;
          right: 0;
          top: 0;
          min-width: 1.866667rem;
          height: 0.8rem;
          line-height: 0.8rem;
          border-radius: 0 0 0 0.05rem;
          text-align: center;
          background: rgba(0,0,0,0.72);
          color: $white;
        }
      }
      .item.active .gridimg {
        box-sizing: content-box;
        margin-top: -0.14rem;
        padding: 0.053333rem;
        border: 0.08rem solid $blue;
      }
      .item.active .gridimg-holder {
        border: 0.08rem solid $blue;
      }
      .item.active .holder-mask {
        border: none;
      }
      .item.active .gridlabel {
        right: 0.08rem;
        top: 0.08rem;
      }
    }
  }


  /*--------------------*\
    $ 白板不懂
  \*--------------------*/

  .board__box {
    display: flex;
    justify-content: space-between;
    align-items: center;

    margin-bottom: 0.4rem;
    width: 100%;
    height: 1.066667rem;
    border-radius: 0.16rem;

    color: #333;
    background: #fff;
  }

  .board__left {
    display: flex;
    justify-content: flex-start;
    align-items: center;
  }

  .board--title {
    padding-left: 0.133333rem;
  }

  .board__right {
    display: flex;
    justify-content: flex-end;
    align-items: center;

    padding-right: 0.266667rem;
  }

  .board--image {
    width: 1.413333rem;
    height: 1.066667rem;
  }

</style>

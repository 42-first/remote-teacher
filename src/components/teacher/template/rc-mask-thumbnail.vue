<!-- 缩略图面板 被父组件 remote.vue 引用 -->
<template>
	<div class="thumbnail-box">
    <section class="tab-box f15">
      <v-touch :class="['item', {'active': tab === 1}]" v-on:tap="swichType(1)">PPT</v-touch>
      <div class="bar" v-show="tab === 3"></div>
      <v-touch :class="['item', {'active': tab === 2}]" v-on:tap="swichType(2)">
        不懂
        <span class="info f12" v-show="newdoubt">{{newdoubt}}</span>
      </v-touch>
      <div class="bar" v-show="tab === 1"></div>
      <v-touch :class="['item', {'active': tab === 3}]" v-on:tap="swichType(3)">习题</v-touch>
    </section>

    <!-- PPT 类型 -->
    <div v-show="tab === 1" class="scroll-box scroll-box1 allowscrollcallback">
      <v-touch v-for="(item, index) in pptData" :id="'t' + (index+1)" :key="item.lessonSlideID" :class="['item', {'active': current === index + 1}]" v-on:tap="tapThumbnail(index+1)">
        <img :src="item.Thumbnail" alt="" class="gridimg">
        <div class="gridlabel f18">{{index + 1}} / {{total}}</div>
        <div v-if="doubtList[index]" class="f15">不懂: {{doubtList[index]}}</div>
      </v-touch>
    </div>

    <!-- 不懂 类型 -->
    <div v-show="tab === 2" class="scroll-box scroll-box2 allowscrollcallback">
      <v-touch v-for="item in doubtSorted" :id="'t' + (item.index+1)" :key="item.index" :class="['item', {'active': current === item.index + 1}]" v-on:tap="tapThumbnail(item.index+1)" v-if="item.val">
        <img :src="pptData[item.index].Thumbnail" alt="" class="gridimg">
        <div class="gridlabel f18">{{item.index + 1}} / {{total}}</div>
        <div class="f15">不懂: {{item.val}}</div>
      </v-touch>
    </div>

    <!-- 习题 类型 -->
    <div v-show="tab === 3" class="scroll-box scroll-box3 allowscrollcallback">
      <v-touch v-for="(item, index) in pptData" :id="'t' + (index+1)" :key="item.lessonSlideID" :class="['item', {'active': current === index + 1}]" v-on:tap="tapThumbnail(index+1)" v-if="item.Problem">
        <img :src="item.Thumbnail" alt="" class="gridimg">
        <div class="gridlabel f18">{{index + 1}} / {{total}}</div>
      </v-touch>
    </div>
  </div>
</template>

<script>
  import request from '@/util/request'
  import API from '@/config/api'

  export default {
    name: 'RcMaskThumbnail',
    props: ['lessonid', 'presentationid', 'pptData', 'current', 'total', 'socket', 'newdoubt'],
    data () {
      return {
        tab: 1,         // 缩略图当前tab
        doubtList: [],  // 不懂人员分布
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
      }
    },
    created () {
      let self = this

      // 点击 缩略图 按钮 父组件发送事件给本子组件，想要滚动到当前页
      self.$on('showThumbnail', function () {
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
        }
      },
      /**
       * 点击缩略图按钮给WebSocket发指令要进入某页
       *
       * @event bindtap
       * @param {number} to 翻到的页码 从1开始
       */
      tapThumbnail (to) {
        let self = this
        if (self.current === to) {
          self.$emit('goHome')
          return
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

        let url = API.presentation_tag

        if (process.env.NODE_ENV === 'production') {
          url = API.presentation_tag + '/' + self.presentationid + '/'
        }

        request.get(url)
          .then(jsonData => {
            self.doubtList = jsonData.data.doubt
          })
      },
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
      line-height: 0.906667rem;
      border: 1px solid $blue;
      border-radius: 0.08rem;
      text-align: center;
      color: $blue;

      .item {
        position: relative;
        flex: 1;

        .info {
          position: absolute;
          right: 0.133333rem;
          top: 0;
          width: 0.666667rem;
          height: 0.6rem;
          line-height: 0.6rem;
          text-align: center;
          background: $blue;
          border-radius: 0.25rem;
          color: $white;
        }
      }
      .bar {
        width: 1px;
        background: $blue;
        margin: 0.173333rem 0;
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

      .item {
        float: left;
        position: relative;
        width: 4.4rem;
        overflow: hidden;
        margin-bottom: 1.36rem;
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
        }

        .gridlabel {
          position: absolute;
          right: 0;
          top: 0;
          width: 1.866667rem;
          height: 0.8rem;
          line-height: 0.8rem;
          border-radius: 0 0 0 0.1rem;
          text-align: center;
          background: rgba(0,0,0,0.72);
          color: $white;
        }
      }
      .item.active .gridimg {
        padding: 2px;
        border: 2px solid $blue;
      }
    }
  }
</style>

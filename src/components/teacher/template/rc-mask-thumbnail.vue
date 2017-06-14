<!-- 缩略图面板 被父组件 remote.vue 引用 -->
<template>
	<div class="thumbnail-box">
    <section class="tab-box f15">
      <div>PPT</div>
      <div>不懂</div>
      <div>习题</div>
    </section>
    <div class="scroll-box allowscrollcallback">
      <v-touch v-for="(item, index) in pptData" :id="'t' + (index+1)" :key="item.lessonSlideID" :class="['item', {'active': current === index + 1}]" v-on:tap="tapThumbnail(index+1)">
        <img :src="item.Thumbnail" alt="" class="gridimg">
        <div class="gridlabel f18">{{index + 1}} / {{total}}</div>
        <div v-if="doubtList[index]" class="f15">不懂: {{doubtList[index]}}</div>
      </v-touch>
    </div>
  </div>
</template>

<script>
  import request from '@/util/request'
  import API from '@/config/api'

  export default {
    name: 'RcMaskThumbnail',
    props: ['lessonid', 'presentationid', 'pptData', 'current', 'total', 'socket'],
    data () {
      return {
        doubtList: []
      }
    },
    
    created () {
      let self = this

      // 点击 缩略图 按钮 父组件发送事件给本子组件，想要滚动到当前页
      self.$on('showThumbnail', function () {
        let container = this.$el.querySelector('.scroll-box')
        let currentPage = container.querySelector('#t'+self.current)
        container.scrollTop = currentPage.offsetTop

        self.fetchPresentationTag()
      })
    },
    methods: {
      /**
       * 点击缩略图按钮给WebSocket发指令要进入某页
       *
       * @event bindtap
       * @param {number} to 翻到的页码 从1开始
       */
      tapThumbnail: function (to) {
        let self = this
        console.log(to)

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
      fetchPresentationTag: function () {
        let self = this

        let url = API.presentation_tag

        if (process.env.NODE_ENV === 'production') {
          url = API.presentation_tag + '/' + self.inPageProblemID + '/'
        }

        request.get(url)
          .then(jsonData => {
            console.log('presentation_tag', jsonData)
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
      width: 5.386667rem;
      height: 0.906667rem;
      line-height: 0.906667rem;
      border: 1px solid $blue;
      border-radius: 0.08rem;
      text-align: center;
      color: $blue;

      &>div {
        flex: 1;
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

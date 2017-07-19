<!-- 弹幕控制页面 被父组件 rc-mask-activity.vue 引用 -->
<template>
	<div class="danmu-box allowscrollcallback">
    <div class="desc f20">
      <span>弹幕</span>
      <v-touch  tag="i" :class="['iconfont', 'f45', isDanmuOpen ? 'icon-danmu-open' : 'icon-danmu-close']" v-on:tap="setDanmuStatus"></v-touch>
    </div>
    <div class="gap"></div>

    <!-- 没有试卷 -->
    <div v-show="!danmuList.length" class="no-paper-box">
      <img v-show="!isDanmuOpen" src="~images/teacher/no-danmu-closed.png" alt="">
      <img v-show="isDanmuOpen" src="~images/teacher/no-danmu-open.png" alt="">
    </div>
    <!-- 上拉加载更多页，刷新返回并刷新只显示第一页 -->
    <Loadmore
       ref="Loadmore"
       :bottom-method="loadBottom"
       :bottom-all-loaded="allLoaded"
       :bottomPullText="'上拉加载更多'"
       :bottomDropText="'释放加载更多'"
       :class="{'allLoaded': allLoaded}"
       >
      <section v-show="danmuList.length" class="list">

        <div class="item-with-gap" v-for="item in danmuList" :key="item.danmu_id">
          <div class="item">
            <div class="detail">
              <img :src="item.avatar" alt="">
              <div class="danmu f18">{{item.message}}</div>
            </div>
            <div class="action-box">
              <div class="time f15">{{item.time.substring(11)}}</div>
              <v-touch class="f15 gray" v-show="postingDanmuid !== item.danmu_id" v-on:tap="postDanmu(item.danmu_id, item.message)"><i class="iconfont icon-shiti_touping f24" style="color: #639EF4; margin-right: 0.1rem;"></i>投屏</v-touch>
              <v-touch class="cancel-post-btn f17" v-show="postingDanmuid === item.danmu_id" v-on:tap="closeDanmumask">退出投屏</v-touch>
            </div>
          </div>
          <div class="gap"></div>
        </div>

        <div v-show="allLoaded" class="nomore f15">没有更多了</div>

      </section> 
     </Loadmore>

    <div class="button-box f18">
      <v-touch class="btn" v-on:tap="refreshDanmulist">刷新</v-touch>
      <v-touch class="btn f18" v-on:tap="closeDanmubox">返回</v-touch>
    </div>
  </div>
</template>

<script>
  import request from '@/util/request'
  import API from '@/config/api'

  import Loadmore from 'mint-ui/lib/loadmore'

  let DANMU_ALL_LIST = []
  let FENYE_COUNT = 30

  export default {
    name: 'RcMaskActivityDanmubox',
    props: ['lessonid', 'socket', 'isDanmuOpen', 'postingDanmuid'],
    data () {
      return {
        danmuList: [],    // 弹幕列表
        allLoaded: false, // 上拉加载更多到底了
      }
    },
    components: {
      Loadmore
    },
    created () {
      let self = this

      // 父组件点击 弹幕 按钮时发送事件给本子组件
      self.$on('showDanmubox', function (msg) {
        self.refreshDanmulist()
      })
    },
    methods: {
      /**
       * 上拉刷新回调
       *
       */
      loadBottom () {
        let self = this
        console.log('上拉松手了')

        self.$refs.Loadmore.onBottomLoaded()

        if (self.danmuList.length < DANMU_ALL_LIST.length) {
          self.danmuList = DANMU_ALL_LIST.slice(0, self.danmuList.length+FENYE_COUNT)
        } else {
          self.allLoaded = true
        }
      },
      /**
       * 点击 返回 按钮 返回课堂动态
       *
       * @event bindtap
       */
      closeDanmubox () {
        this.$emit('closeDanmubox')
        this.closeDanmumask()
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
      /**
       * 更新试题详情的数据
       * 点击打开详情时要主动更新一下数据，所以把本方法放在本父组件中
       *
       */
      refreshDanmulist(){
        let self = this
        let url = API.danmulist

        // 单次刷新
        request.get(url, {lesson_id: self.lessonid})
          .then(jsonData => {
            // 设置试卷详情数据
            DANMU_ALL_LIST = jsonData.data.sender_list

            let newItemsCount = 0
            if (DANMU_ALL_LIST[0] && self.danmuList[0]) {
              newItemsCount = DANMU_ALL_LIST[0].danmu_id - self.danmuList[0].danmu_id
            }
            
            if (!self.danmuList.length || newItemsCount > FENYE_COUNT) {
              self.danmuList = DANMU_ALL_LIST.slice(0, FENYE_COUNT)
              self.allLoaded = false
            } else if (self.allLoaded) {
              self.danmuList = DANMU_ALL_LIST
            } else {
              self.danmuList = DANMU_ALL_LIST.slice(0, newItemsCount).concat(self.danmuList)
              self.allLoaded = false
            }

            // 刷新的话回顶部
            self.$el.scrollTop = 0
          })
      },
      /**
       * 投屏
       *
       * @event bindtap
       * @param {number, string} danmuid message
       */
      postDanmu (danmuid, message) {
        let self = this

        let str = JSON.stringify({
          'op': 'showdanmu',
          'lessonid': self.lessonid,
          'danmu': message,
          'danmuid': danmuid,
          'msgid': 1234
        })

        self.socket.send(str)
      },
      /**
       * 退出弹幕投屏蒙版
       *
       * @event bindtap
       */
      closeDanmumask () {
        let self = this

        let str = JSON.stringify({
          'op': 'closemask',
          'lessonid': self.lessonid,
          'type': 'danmu',
          'msgid': 1234
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
    background: #EDF2F6;
    color: #4A4A4A;
    overflow: auto;

    .no-paper-box {
      box-sizing: border-box;
      height: 100%;
      background: $white;
      text-align: center;
      
      img {
        display: inline-block;
        width: 5.88rem;
        transform: translateY(50%);
      }
      .hint {
        position: absolute;
        left: 0;
        bottom: 2rem;
        width: 100%;
        color: #9B9B9B;
      }
    }

    .desc {
      padding: 0 0.4rem;
      height: 1.466667rem;
      line-height: 1.466667rem;
      background: $white;
      
      span {
        color: $blue;
      }

      .iconfont {
        float: right;
        margin-top: 0.1rem;
        vertical-align: middle;
      }
      .icon-danmu-close {
        color: #9B9B9B;
      }
      .icon-danmu-open {
        color: $blue;
      }
    }

    .gap {
      height: 0.266667rem;
      background: #EDF2F6;
    }

    .list {
      padding-bottom: 1.466667rem;
      -webkit-overflow-scrolling: touch;
      
      .item {
        padding: 0 0.4rem;
        background: $white;

        .detail {
          display: flex;
          // align-items: center;
          margin-bottom: 0.4rem;
          padding-top: 0.266667rem;

          img {
            margin-right: 0.4rem;
            width: 0.986667rem;
            height: 0.986667rem;
            border-radius: 50%;
          }
          .danmu {
            flex: 1;
            word-break: break-word;
          }
        }

        .action-box {
          display: flex;
          justify-content: space-between;
          align-items: center;
          height: 1rem;
          margin-left: 1.386667rem;

          .time {
            color: #9B9B9B;
          }
          .gray {
            color: #9B9B9B;
          }
          .cancel-post-btn {
            background: $blue;
            width: 2.733333rem;
            text-align: center;
            height: 0.826667rem;
            line-height: 0.826667rem;
            color: $white;
          }
        }
      }

      .nomore {
        text-align: center;
      }
    }

    .button-box {
      display: flex;
      position: fixed;
      left: 0;
      right: 0;
      bottom: 0;
      height: 1.466667rem;
      text-align: center;

      .btn {
        flex: 1;
        border-radius: 0;
        height: 1.466667rem;
        line-height: 1.466667rem;
      }
    }
  }
</style>

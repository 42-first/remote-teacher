<!-- 弹幕控制页面 -->
<template>
	<div class="danmu-box">
    <div class="desc f20">
      <span>弹幕</span>
      <v-touch :class="['set-btn', 'f16', isDanmuOpen ? 'is-closed' : 'is-open']" v-on:tap="setDanmuStatus">
        {{isDanmuOpen ? '关闭' : '开启'}}
      </v-touch>
    </div>
    <div class="gap"></div>
    <v-touch v-on:tap="refreshDataList" class="new-item-hint f15" :class="isShowNewHint ? 'hintfadein' : 'hintfadeout' ">您有新的弹幕</v-touch>
    <div v-show="isShowNoNewItem" class="no-new-item f18">没有新的弹幕</div>
    <div v-show="isToastSwitch" class="no-new-item f18">弹幕已{{isDanmuOpen ? '开启' : '关闭'}}</div>

    <!-- 没有试卷 -->
    <div v-show="!dataList.length" class="no-paper-box">
      <img v-show="!isDanmuOpen" src="~images/teacher/no-danmu-closed.png" alt="">
      <img v-show="isDanmuOpen" src="~images/teacher/no-danmu-open.png" alt="" style="transform: translateY(50%); width: 6.5rem;">
    </div>
    <!-- 上拉加载更多页，刷新返回并刷新只显示第一页 -->
    <Loadmore
       ref="Loadmore"
       v-show="dataList.length"
       :bottom-method="loadBottom"
       :bottom-all-loaded="isAllLoaded"
       :bottomPullText="'上拉加载更多'"
       :bottomDropText="'释放加载更多'"
       :class="{'allLoaded': isAllLoaded}"
       >
      <section v-show="dataList.length" class="list">

        <div class="item-with-gap" v-for="item in dataList" :key="item.id">
          <div class="item">
            <div class="detail">
              <img :src="item.user_avatar_46" alt="">
              <div class="danmu f18">{{item.message}}</div>
            </div>
            <div class="action-box">
              <div class="time f15">{{item.time.substring(11)}}</div>
              <v-touch class="f15 gray J_ga" data-category="7" data-label="弹幕页" v-show="postingDanmuid !== item.id" v-on:tap="postDanmu(item.id, item.message)"><i class="iconfont icon-shiti_touping f24" style="color: #639EF4; margin-right: 0.1rem;"></i>投屏</v-touch>
              <v-touch class="cancel-post-btn f17" v-show="postingDanmuid === item.id" v-on:tap="closeDanmumask">退出投屏</v-touch>
            </div>
          </div>
          <div class="gap"></div>
        </div>

        <div v-show="isAllLoaded  && isContLonger" class="nomore f15">
          <div class="bgline"></div>
          <div class="wenan">end</div>
        </div>

      </section> 
     </Loadmore>

    <div class="button-box f18" v-show="isShowBtnBox">
      <v-touch class="btn" v-on:tap="refreshDataList">刷新</v-touch>
    </div>
  </div>
</template>

<script>
  import {mapGetters} from 'vuex'
  import request from '@/util/request'
  import API from '@/pages/teacher/config/api'

  import Loadmore from 'mint-ui/lib/loadmore'

  let FENYE_COUNT = 20

  export default {
    name: 'Danmu',
    data () {
      return {
        dataList: [],               // 弹幕列表
        isFetching: true,           // 正在获取数据
        isAllLoaded: false,         // 上拉加载更多到底了
        isContLonger: false,        // 内容超过1屏
        isShowNoNewItem: false,     // 刷新后没有新的条目
        isShowNewHint: false,       // 上方提示有新的条目进来
        isShowBtnBox: false,        // 显示底部返回按钮
        isToastSwitch: false,       // 显示弹幕开启关闭提示
      }
    },
    computed: {
      ...mapGetters([
        'lessonid',
        'socket',
        'isDanmuOpen',
        'postingDanmuid',
      ])
    },
    components: {
      Loadmore
    },
    created () {
      let self = this

      //首次加载页面
      self.refreshDataList(true);
      self.handlePubSub()
    },
    mounted () {
      let self = this
      let wh = window.innerHeight

      // 如果搓到底了，不要到底，防止ios上搓露底
      let boxDom = document.querySelector('.danmu-box')
      boxDom.addEventListener('scroll', e => {
        if (boxDom.scrollTop === boxDom.scrollHeight - boxDom.offsetHeight) {
          boxDom.scrollTop = boxDom.scrollTop -2
        }
      })

      // 数据不多时，让用户能搓动空白处加载更多
      let loadmoreDom = document.querySelector('.danmu-box .mint-loadmore')
      loadmoreDom.style.minHeight = wh + 'px'

    },
    beforeDestroy(){
      this.closeDanmumask()
      T_PUBSUB.unsubscribe('danmu-msg')
    },
    watch: {
      dataList: function() {
        setTimeout(() => {
          let sbh = document.querySelector('.danmu-box .list').offsetHeight
          let wh = window.innerHeight
          this.isContLonger = sbh >= wh
        }, 100)
      }
    },
    methods: {
      /**
       * 处理发布订阅
       *
       */
      handlePubSub () {
        let self = this
        let toastTimer = null

        // 订阅前清掉之前可能的订阅，避免多次触发回调
        T_PUBSUB.unsubscribe('danmu-msg')

        T_PUBSUB.subscribe('danmu-msg.newdanmu', (_name, msg) => {
          self.isShowNewHint = true
        })

        T_PUBSUB.subscribe('danmu-msg.turnondanmu', (_name, msg) => {
          self.isToastSwitch = true
          clearTimeout(toastTimer)
          toastTimer = setTimeout(() => {self.isToastSwitch = false}, 2000)
        })

        T_PUBSUB.subscribe('danmu-msg.turnoffdanmu', (_name, msg) => {
          self.isToastSwitch = true
          clearTimeout(toastTimer)
          toastTimer = setTimeout(() => {self.isToastSwitch = false}, 2000)
        })
      },
      /**
       * 模仿微信小程序的 setData 用法，简易设置data
       *
       * @param {object} newData
       */
      setData (newData) {
        let self = this
        Object.keys(newData).forEach(attr => {
          self[attr] = newData[attr]
        })
      },
      /**
       * 上拉刷新回调
       *
       */
      loadBottom () {
        let self = this
        console.log('上拉松手了')

        let tailNow = self.dataList[0] ? self.dataList[self.dataList.length-1].id : 0

        self.fetchList(tailNow).then(jsonData => {
          // 设置试卷详情数据
          // response_num 当前请求返回的投稿数量
          if (jsonData.data.response_num === 0) {
            self.isAllLoaded = true
            return
          }
          self.dataList = self.dataList.concat(jsonData.data.danmu_list)

          this.$refs.Loadmore.onBottomLoaded()
        })
      },
      /**
       * 获取弹幕数据
       *
       * @param {Number} start 起始位置id，返回值不包括起始位置的值， 默认 -1， 即从最新无限大处开始
       * @param {Number} direction 默认0 倒序，即向老的方向找去
       */
      fetchList(start = -1, direction = 0){
        let self = this
        let url = API.danmulist2

        let data = {
          start,
          direction,
          count: FENYE_COUNT,
          lesson_id: self.lessonid,
        }

        // 单次刷新
        return request.post(url, data)
      },
      /**
       * 更新试题详情的数据
       * 点击打开详情时要主动更新一下数据，所以把本方法放在本父组件中
       *
       * @param {Boolean} isInit 判断是不是从课堂动态点击进来的
       */
      refreshDataList(isInit){
        let self = this

        // 如果已经有内容了就不要显示正在加载中了
        if (!self.dataList.length) {
          self.isFetching = true
        }

        /* 分页逻辑：
         * 1.如果一条数据都没有，就是一直都是0，直接赋值，设置为已经加载完了
         * 2.如果之前为空，新获取数据直接赋值，设置为可以加载更多
         * 3.如果当前展示的第一条的id出现在最新的获取的条目里，
         * 就说明新增的数目不超过 FENYE_COUNT，这时直接往前连接即可，不用管能不能加载更多
         * 4.否则直接展示新获取的数据，并且设置为可以加载更多
         *
         * 注：
         * 数据库中所有课的条目是往一张表中添加的，不是一堂课的 id 不断自增，所以不能用 id 相减
         * 的方法来判断新增了多少条条目，来查看到底从 start 处新增了多少条
         */
        self.fetchList().then(jsonData => {
          // 只要点击刷新按钮就去掉上方的有新弹幕的提示
          self.isShowNewHint = false
          
          setTimeout(() => {
            self.isShowBtnBox = true
          },500)

          let newList = jsonData.data.danmu_list
          // 返回的条目的个数
          let response_num = jsonData.data.response_num
          // 有可能还一条都没有呢
          let headNow = self.dataList[0] ? self.dataList[0].id : 0
          let headIndex = newList.findIndex(item => item.id === headNow)

          // 假如没有新条目的话，显示没有新条目的提示
          // 无论显示提示与否，2秒后不再显示提示
          self.isShowNoNewItem = isInit && (!newList.length || newList[0].id === headNow)
          
          setTimeout(() => {
            self.isShowNoNewItem = false
          }, 2000)

          self.isFetching = false


          let isAllLoaded = self.isAllLoaded
          if (response_num === 0) {
            isAllLoaded = true
          } else if (headNow === 0) {
            self.setData({
              dataList: newList
            })

            isAllLoaded = newList.length < FENYE_COUNT
          } else if (~headIndex) {
            // 包含
            let _list = newList.slice(0, headIndex).concat(self.dataList)
            self.setData({
              dataList: _list
            })
          } else {
            self.setData({
              dataList: newList
            })
            isAllLoaded = false
          }

          self.setData({
            isAllLoaded
          })

          // 刷新的话回顶部，清零投稿未读数
          self.$el.scrollTop = 0
        })
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
    position: relative;
    min-height: 100%;
    padding-top: 1.5rem;
    background: #EDF2F6;
    color: #4A4A4A;

    .new-item-hint {
      position: fixed;
      z-index: 10;
      left: 50%;
      top: 0.266667rem;
      transform: translate(-50%, 0);
      width: 5.333333rem;
      height: 0.8rem;
      border-radius: 0.4rem;
      background: rgba(0,0,0,0.7);
      text-align: center;
      line-height: 0.8rem;
      color: $white;
      transition: transform 0.5s ease;
    }

    .hintfadein {
      transform: translate(-50%, 0) scale(1);
    }
    .hintfadeout {
      transform: translate(-50%, -1.5rem) scale(0.8);
    }

    .no-new-item {
      position: fixed;
      z-index: 10;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      width: 4.0rem;
      height: 2.0rem;
      border-radius: 0.1rem;
      background: rgba(0,0,0,0.7);
      text-align: center;
      line-height: 2.0rem;
      color: $white;
    }

    .no-paper-box {
      box-sizing: border-box;
      height: 100%;
      background: $white;
      text-align: center;
      
      img {
        display: inline-block;
        width: 7.0rem;
        transform: translateY(20%);
      }
      .hint {
        position: absolute;
        left: 0;
        bottom: 2rem;
        width: 100%;
        color: $graybg;
      }
    }

    .desc {
      position: fixed;
      z-index: 10;
      left: 0;
      top: 0;
      right: 0;
      padding: 0 0.4rem;
      height: 1.466667rem;
      line-height: 1.466667rem;
      background: $white;
      
      span {
        color: $blue;
      }

      .set-btn {
        float: right;
        margin-top: 0.28rem;
        text-align: center;
        width: 1.706667rem;
        height: 0.906667rem;
        line-height: 0.906667rem;
        border-radius: 0.053333rem;
      }

      .is-open {
        background: $blue;
        color: $white;
      }

      .is-closed {
        background: $white;
        color: $blue;
        border: 1px solid $blue;
      }

      .iconfont {
        float: right;
        margin-top: 0.1rem;
        vertical-align: middle;
      }
      .icon-danmu-close {
        color: $graybg;
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
      padding-bottom: 2.1rem;
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
            color: $graybg;
          }
          .gray {
            color: $graybg;
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
        position: relative;
        height: 0.6rem;
        margin: 0 0.6rem;
        text-align: center;
        color: $graybg;

        .wenan {
          position: relative;
          margin: 0 auto;
          width: 2.093333rem;
          background: #EDF2F6;
        }

        .bgline {
          position: absolute;
          top: 0.293333rem;
          width: 100%;
          height: 1px;
          background: #c8c8c8;
        }
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
        box-shadow: none;
      }
      .innerline {
        float: left;
        margin-top: 0.333333rem;
        width: 0.026667rem;
        height: 0.8rem;
        background: $white;
      }
    }
  }
</style>

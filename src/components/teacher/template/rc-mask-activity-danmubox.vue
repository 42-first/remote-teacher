<!-- 弹幕控制页面 被父组件 rc-mask-activity.vue 引用 -->
<template>
	<div class="danmu-box allowscrollcallback">
    <div class="desc f20">
      <span>弹幕</span>
      <!-- <v-touch  tag="i" :class="['iconfont', 'f50', isDanmuOpen ? 'icon-danmu-open' : 'icon-danmu-close']" v-on:tap="setDanmuStatus"></v-touch> -->
      <v-touch :class="['set-btn', 'f16', isDanmuOpen ? 'is-closed' : 'is-open']" v-on:tap="setDanmuStatus">
        {{isDanmuOpen ? '关闭' : '开启'}}
      </v-touch>
    </div>
    <div class="gap"></div>
    <v-touch v-on:tap="refreshDanmulist" class="new-item-hint f15" :class="isShowNewHint ? 'hintfadein' : 'hintfadeout' ">您有新的弹幕</v-touch>
    <div v-show="isShowNoNewItem" class="no-new-item f18">没有新的弹幕</div>
    <div v-show="isToastSwitch" class="no-new-item f18">弹幕已{{isDanmuOpen ? '开启' : '关闭'}}</div>

    <!-- 没有试卷 -->
    <div v-show="!danmuList.length" class="no-paper-box">
      <img v-show="!isDanmuOpen" src="~images/teacher/no-danmu-closed.png" alt="">
      <img v-show="isDanmuOpen" src="~images/teacher/no-danmu-open.png" alt="" style="transform: translateY(50%); width: 6.5rem;">
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

        <div class="item-with-gap" v-for="item in danmuList" :key="item.id">
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

        <div v-show="allLoaded  && contLonger" class="nomore f15">
          <div class="bgline"></div>
          <div class="wenan">end</div>
        </div>

      </section> 
     </Loadmore>

    <div class="button-box f18" v-show="isShowBtnBox">
      <v-touch class="btn" v-on:tap="refreshDanmulist">刷新</v-touch>
      <v-touch class="btn f18 J_ga" v-on:tap="closeDanmubox" data-category="14" data-label="弹幕页"><span class="innerline"></span>返回</v-touch>
    </div>
  </div>
</template>

<script>
  import request from '@/util/request'
  import API from '@/config/api'

  import Loadmore from 'mint-ui/lib/loadmore'

  let DANMU_ALL_LIST = []
  let BIG_NUMBER = 10000000000000000000
  let FENYE_COUNT = 20

  export default {
    name: 'RcMaskActivityDanmubox',
    props: ['lessonid', 'socket', 'isDanmuOpen', 'postingDanmuid'],
    data () {
      return {
        danmuList: [],              // 弹幕列表
        allLoaded: false,           // 上拉加载更多到底了
        isFetching: true,           // 正在获取数据
        contLonger: false,          // 内容超过1屏
        isShowNoNewItem: false,     // 刷新后没有新的条目
        isShowNewHint: false,       // 上方提示有新的条目进来
        isShowBtnBox: false,        // 显示底部返回按钮
        isToastSwitch: false,       // 显示弹幕开启关闭提示
      }
    },
    components: {
      Loadmore
    },
    created () {
      let self = this

      // 父组件点击 弹幕 按钮时发送事件给本子组件
      self.$on('showDanmubox', function (msg) {
        self.refreshDanmulist('isClickedin')
      })

      // socket通知有新的弹幕进来了
      self.$on('newdanmu', function () {
        self.isShowNewHint = true
      })

      // socket通知有开启了弹幕
      self.$on('turnondanmu', function () {
        self.isToastSwitch = true
        setTimeout(() => {self.isToastSwitch = false}, 2000)
      })

      // socket通知关闭了弹幕
      self.$on('turnoffdanmu', function () {
        self.isToastSwitch = true
        setTimeout(() => {self.isToastSwitch = false}, 2000)
      })
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
    watch: {
      danmuList: function() {
        setTimeout(() => {
          let sbh = document.querySelector('.danmu-box .list').offsetHeight
          let wh = window.innerHeight
          this.contLonger = sbh >= wh
        }, 100)
      }
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

        let url = API.danmulist2
        // 有可能还一条都没哟呢
        let start = self.danmuList[0] ? self.danmuList[self.danmuList.length-1].id : 0

        // 单次刷新
        request.post(url, {
          'lesson_id': self.lessonid,
          'start': start,
          'count': FENYE_COUNT,
          'direction': 0 // 加载更多要倒序查找
        }).then(jsonData => {
            if (jsonData.data.response_num === 0) {
              self.allLoaded = true
              return
            }
            self.danmuList = self.danmuList.concat(jsonData.data.danmu_list)
          })
      },
      /**
       * 点击 返回 按钮 返回课堂动态
       *
       * @event bindtap
       * @param {object} evt event对象
       */
      closeDanmubox (evt) {
        this.$emit('closeDanmubox')
        this.closeDanmumask()

        typeof gaue !== 'undefined' && gaue.default.fixTrigger(evt);
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
       * @param {string} isClickedin 判断是不是从课堂动态点击进来的
       */
      refreshDanmulist(isClickedin){
        let self = this
        let url = API.danmulist2
        // 有可能还一条都没哟呢
        let start = self.danmuList[0] ? self.danmuList[0].id : 0

        // 如果已经有内容了就不要显示正在加载中了
        if (!self.danmuList.length) {
          self.isFetching = true
        }

        // 分页逻辑：
        // 如果新增的超过了FENYE_COUNT或目前投稿列表为空，则只显示最新的FENYE_COUNT个
        // 否则如果状态为已经全加载完的话，直接把所有刷新的数据赋值
        // 否则只新塞最新的数据到前面

        // 数据库中所有课的条目是往一张表中添加的，不是一堂课的 id 不断自增，所以不能用 id 相减
        // 的方法来判断新增了多少条条目，而是可以通过用 start count 的请求查看从 start 的地方
        // 新增的条目是不是比分页的多，或者把 count 设置成极大值
        // 来查看到底从 start 处新增了多少条
        request.post(url, {
          'lesson_id': self.lessonid,
          'start': start,             // 开始的id，返回时不包含本id内容
          'count': BIG_NUMBER,        // 如果新条目数很多，要直接取最新分页个数的条目的
          'direction': 1              // 刷新要正序查找
        }).then(jsonData => {
            // 只要点击刷新按钮就去掉上方的有新弹幕的提示
            self.isShowNewHint = false

            setTimeout(() => {
              self.isShowBtnBox = true
            },500)

            // 假如没有新条目的话，显示没有新条目的提示
            // 从课堂动态进来的话，不显示提示
            // 无论显示提示与否，2秒后不再显示提示
            self.isShowNoNewItem = typeof isClickedin !== 'string' && !jsonData.data.response_num
            setTimeout(() => {
              self.isShowNoNewItem = false
            }, 2000)

            let newList = jsonData.data.danmu_list
            
            self.isFetching = false

            // 新增的条目的个数
            let newItemsCount = jsonData.data.response_num
            
            if (!self.danmuList.length || newItemsCount > FENYE_COUNT) {
              // 刚加载展示或新条目数大于于 FENYE_COUNT，
              // 就算只是刚加载展示的话，就算新条目少，slice这么写也刚好没问题
              self.danmuList = newList.reverse().slice(0, FENYE_COUNT)            
            } else {
              // 不是刚展示，新条目数也小于 FENYE_COUNT
              self.danmuList = newList.reverse().concat(self.danmuList)
            }

            // 如果新条目数大于 FENYE_COUNT， 则肯定改状态为 可以加载更多
            // 如果新条目数少，那么如果之前是已经加载完了，就依然保持已经加载完了
            // 如果新条目少，并且之前是根本没有，那么也是更新状态为已经加载完了
            self.allLoaded =  newItemsCount <= FENYE_COUNT && (self.allLoaded || !self.danmuList.length);

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
    padding-top: 1.5rem;
    background: #EDF2F6;
    color: #4A4A4A;
    overflow: auto;

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

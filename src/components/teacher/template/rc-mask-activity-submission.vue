<!-- 投稿控制页面 被父组件 rc-mask-activity.vue 引用 -->
<template>
	<div class="submission-box allowscrollcallback">
    <v-touch v-show="isBigpicShown" class="bigpic-mask" v-on:tap="hideBigpic">
      <img :src="bigpicUrl" :class="[isWider ? 'w100' : 'h100']" alt="">
    </v-touch>
    <div class="isFetching f21" v-show="isFetching">正在加载中...</div>

    <v-touch v-on:tap="refreshSubmissionlist" class="new-item-hint f15" :class="isShowNewHint ? 'hintfadein' : 'hintfadeout' ">你有新的投稿</v-touch>
    <div v-show="isShowNoNewItem" class="no-new-item f18">没有新的投稿</div>
    <!-- 没有投稿 -->
    <div v-show="!isFetching && !submissionList.length" class="no-paper-box">
      <img src="~images/teacher/no-tougao.png" alt="">
      <div class="hint f12">试试让学生在手机端 <i class="iconfont icon-add f15"></i> 号中投稿吧！</div>
    </div>
    <div v-show="!isFetching && submissionList.length">
      <div class="gap"></div>
      <!-- 上拉加载更多页，刷新返回并刷新只显示第一页 -->
      <Loadmore
         ref="Loadmore"
         :bottom-method="loadBottom"
         :bottom-all-loaded="allLoaded"
         :bottomPullText="'上拉加载更多'"
         :bottomDropText="'释放加载更多'"
         :class="{'allLoaded': allLoaded}"
         >
        <section class="list">

          <div class="item-with-gap" v-for="(item, index) in submissionList" :key="item.id">
            <div class="item">
              <div class="detail">
                <img :src="item.user_avatar" class="avatar" alt="">
                <div class="cont f18">
                  <span class="author f15">{{item.user_name}}</span><br>
                  {{item.content}}<br>
                  <v-touch :id="'pic' + item.id" tag="img" :src="item.thumb" class="pic" alt="" v-on:tap="showBigpic(item.pic, item.id)"></v-touch>
                </div>
              </div>
              <div class="action-box">
                <div class="time f15">{{item.create_time.substring(11)}}</div>
                <div class="action f15">
                  <!-- 投屏的时候不显示收藏状态 -->
                  <v-touch class="coll gray" v-show="item.is_collect && postingSubmissionid !== item.id" v-on:tap="collectSubmission(item.id, index, 0)">
                    <i class="iconfont icon-tougao_shoucang1 f20" style="color: #E1142D; margin-right: 0.1rem;"></i>
                    已收藏
                  </v-touch>
                  <v-touch class="coll gray J_ga" data-category="9" data-label="投稿页" v-show="!item.is_collect && postingSubmissionid !== item.id" v-on:tap="collectSubmission(item.id, index, 1)">
                    <i class="iconfont icon-tougao_bushoucang f20" style=" margin-right: 0.1rem;"></i>
                    收藏
                  </v-touch>

                  <v-touch  class="gray J_ga" data-category="10" data-label="投稿页" v-show="postingSubmissionid !== item.id" v-on:tap="postSubmission(item.id)">
                    <i class="iconfont icon-shiti_touping f24" style="color: #639EF4; margin-right: 0.1rem;"></i>
                    投屏
                  </v-touch>
                  <v-touch class="cancel-post-btn f14" v-show="postingSubmissionid === item.id" v-on:tap="closeSubmissionmask">取消投屏</v-touch>

                  <v-touch class="cancel-post-btn f14 qb" v-show="postingSubmissionid === item.id && !postingSubmissionSent" v-on:tap="fsqbHander(item.id)">
                    <span class="fsqb-innerline"></span>
                    发送全班
                  </v-touch>
                  <div class="cancel-post-btn qb yfqb f14" v-show="postingSubmissionid === item.id && postingSubmissionSent">
                    <span class="fsqb-innerline"></span>
                    已发全班
                  </div>
                </div>
              </div>
            </div>
            <div class="gap"></div>
          </div>

          <div v-show="allLoaded && contLonger" class="nomore f15">
            <div class="bgline"></div>
            <div class="wenan">end</div>
          </div>

        </section> 
      </Loadmore>
      
    </div>
    
    <div class="toast-box f15" v-show="isAskingItemStatus || isItemDeleted">
      <span v-show="isAskingItemStatus">正在投屏中...</span>
      <span v-show="isItemDeleted">学生已删除此投稿</span>
    </div>
    <div class="button-box f18" v-show="isShowBtnBox">
      <v-touch class="btn" v-on:tap="refreshSubmissionlist">刷新</v-touch>
      <v-touch class="btn f18 J_ga" v-on:tap="closeSubmissionbox" data-category="15" data-label="投稿页"><span class="innerline"></span>返回</v-touch>
    </div>
  </div>
</template>

<script>
  import request from '@/util/request'
  import API from '@/config/api'

  import Loadmore from 'mint-ui/lib/loadmore'

  let BIG_NUMBER = 10000000000000000000
  let FENYE_COUNT = 10

  let WH = window.innerWidth/window.innerHeight
  let pollingTimer = null

  export default {
    name: 'RcMaskActivitySubmission',
    props: ['lessonid', 'socket', 'postingSubmissionid', 'postingSubmissionSent'],
    data () {
      return {
        submissionList: [],           // 投稿列表
        isAskingItemStatus: false,    // 正在查询投稿状态
        isItemDeleted: false,         // 投稿已经被删除
        isFetching: true,             // 正在获取数据
        allLoaded: false,             // 上拉加载更多到底了
        isBigpicShown: false,         // 当前正显示大图
        bigpicUrl: '',                // 当前大图url
        isWider: false,               // 投稿图片更扁
        contLonger: false,            // 内容超过1屏
        isShowNoNewItem: false,       // 刷新后没有新的条目
        isShowNewHint: false,         // 上方提示有新的条目进来
        isShowBtnBox: false,          // 显示底部返回按钮
      }
    },
    components: {
      Loadmore
    },
    created () {
      let self = this

      // 父组件点击 投稿 按钮时发送事件给本子组件
      self.$on('showSubmission', function (msg) {
        self.refreshSubmissionlist('isClickedin')

        pollingTimer = setInterval(() => {
          self.pollingNewSubmission()
        }, 5000)
      })
      
    },
    mounted () {
      let self = this
      let wh = window.innerHeight

      // 如果搓到底了，不要到底，防止ios上搓露底
      let boxDom = document.querySelector('.submission-box')
      boxDom.addEventListener('scroll', e => {
        if (boxDom.scrollTop === boxDom.scrollHeight - boxDom.offsetHeight) {
          boxDom.scrollTop = boxDom.scrollTop -2
        }
      })

      // 数据不多时，让用户能搓动空白处加载更多
      document.querySelector('.submission-box .mint-loadmore').style.minHeight = wh + 'px'
    },
    watch: {
      submissionList: function() {
        setTimeout(() => {
          let sbh = document.querySelector('.submission-box .list').offsetHeight
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

        this.$refs.Loadmore.onBottomLoaded()

        let url = API.submissionlist
        // 有可能还一条都没哟呢
        let start = self.submissionList[0] ? self.submissionList[self.submissionList.length-1].id : 0

        // 单次刷新
        request.get(url, {
          'lesson_id': self.lessonid,
          'start': start,
          'count': FENYE_COUNT,
          'direction': 0
        }).then(jsonData => {
            // 清零投稿未读数
            self.$emit('refreshCheckTougao', self.submissionList.length)
            // 设置试卷详情数据
            // response_num 当前请求返回的投稿数量
            if (jsonData.data.response_num === 0) {
              self.allLoaded = true
              return
            }
            self.submissionList = self.submissionList.concat(jsonData.data.tougao_list)
          })
      },
      /**
       * 点击 返回 按钮 返回课堂动态
       *
       * @event bindtap
       * @param {object} evt event对象
       */
      closeSubmissionbox (evt) {
        clearInterval(pollingTimer)
        this.$emit('closeSubmissionbox')
        this.closeSubmissionmask()

        typeof gaue !== 'undefined' && gaue.default.fixTrigger(evt);
      },
      /**
       * 更新投稿列表的数据
       * 点击打开详情时要主动更新一下数据，所以把本方法放在本父组件中
       *
       * @param {string} isClickedin 判断是不是从课堂动态点击进来的
       */
      refreshSubmissionlist(isClickedin){
        let self = this
        let url = API.submissionlist
        // 有可能还一条都没哟呢
        let start = self.submissionList[0] ? self.submissionList[0].id : 0

        // 如果已经有内容了就不要显示正在加载中了
        if (!self.submissionList.length) {
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
        request.get(url, {
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

            // 加入没有新条目的话，显示没有新条目的提示
            // 从课堂动态进来的话，不显示提示
            // 无论显示提示与否，2秒后不再显示提示
            self.isShowNoNewItem = typeof isClickedin !== 'string' && !jsonData.data.response_num
            setTimeout(() => {
              self.isShowNoNewItem = false
            }, 2000)

            let newList = jsonData.data.tougao_list
            
            self.isFetching = false

            // 新增的条目的个数
            let newItemsCount = jsonData.data.response_num
            
            if (!self.submissionList.length || newItemsCount > FENYE_COUNT) {
              // 刚加载展示或新条目数大于 FENYE_COUNT，
              // 就算只是刚加载展示的话，就算新条目少，slice这么写也刚好没问题
              self.submissionList = newList.reverse().slice(0, FENYE_COUNT)      
            } else {
              // 不是刚展示，新条目数也小于 FENYE_COUNT
              self.submissionList = newList.reverse().concat(self.submissionList)
            }

            // 如果新条目数大于 FENYE_COUNT， 则肯定改状态为 可以加载更多
            // 如果新条目数少，那么如果之前是已经加载完了，就依然保持已经加载完了
            // 如果新条目少，并且之前是根本没有，那么也是更新状态为已经加载完了
            self.allLoaded =  newItemsCount <= FENYE_COUNT && (self.allLoaded || !self.submissionList.length)
            
            // 刷新的话回顶部
            self.$el.scrollTop = 0

            // 清零投稿未读数
            self.$emit('refreshCheckTougao', newList.length)
          })
      },
      /**
       * 投屏
       *
       * @event bindtap
       * @param {number} submissionid
       */
      postSubmission (submissionid) {
        let self = this

        // let str = JSON.stringify({
        //   'op': 'showpost',
        //   'lessonid': self.lessonid,
        //   'postid': submissionid,
        //   'msgid': 1234
        // })

        // self.socket.send(str)

        // 因为学生能够删除投稿，修改投屏方式为ajax
        // https://tower.im/projects/ea368aa0284f4fb3ab8993b006579460/todos/5854f6b0dd584a9fac796bba852e5ba1/#043541593c7d442e8921fbf9856a8691
        let timer = setTimeout(() => {
          self.isAskingItemStatus = true
        },800)
        
        let url = API.tougaostatus

        let postData = {
          'lesson_id': self.lessonid,
          'tougao_id': submissionid
        }

        request.post(url, postData)
          .then(jsonData => {
            // 不需要判断success，在request模块中判断如果success为false，会直接reject
            clearTimeout(timer)
            self.isAskingItemStatus = false
            if (jsonData.data.is_deleted) {
              self.isItemDeleted = true
              setTimeout(() => {
                self.isItemDeleted = false
              }, 1000)
            }
          })
          .catch(() => {
            self.isAskingItemStatus = false
          })
      },
      /**
       * 退出投稿投屏蒙版
       *
       * @event bindtap
       */
      closeSubmissionmask () {
        let self = this

        let str = JSON.stringify({
          'op': 'closemask',
          'lessonid': self.lessonid,
          'type': 'post',
          'msgid': 1234
        })

        self.socket.send(str)
      },
      /**
       * 发送全班按钮
       *
       * @event bindtap
       * @param {number} submissionid;
       */
      fsqbHander (submissionid) {
        let self = this

        let str = JSON.stringify({
          'op': 'sendpost',
          'lessonid': self.lessonid,
          'postid': submissionid,
          'msgid': 1234
        })

        self.socket.send(str)
      },
      /**
       * 收藏投稿
       *
       * @event bindtap
       * @param {number, number, number} submissionid; index序号; status 0 将要取消收藏  1 将要收藏
       */
      collectSubmission (submissionid, index, status) {
        let self = this
        let url = status ? API.collectsubmission : API.collectsubmission_cancel

        let postData = {
          'tougao_id': submissionid
        }

        request.post(url, postData)
          .then(jsonData => {
            // 不需要判断success，在request模块中判断如果success为false，会直接reject
            self.submissionList[index].is_collect = !!status
          })
      },
      /**
       * 显示大图
       *
       * @event bindtap
       * @param {string} pic 大图url
       */
      showBigpic (pic, picid) {
        let self = this
        let dom = document.querySelector('#pic'+picid)
        let picwh = dom.naturalWidth / dom.naturalHeight

        self.isWider = picwh > WH
        self.isBigpicShown = true
        self.bigpicUrl = pic
      },
      /**
       * 隐藏大图
       *
       * @event bindtap
       */
      hideBigpic () {
        let self = this

        self.isBigpicShown = false
        self.bigpicUrl = ''
      },
      /**
       * 轮询有没有新的投稿
       *
       */
      pollingNewSubmission () {
        let self = this
        let url = API.submissionlist
        // 有可能还一条都没哟呢
        let start = self.submissionList[0] ? self.submissionList[0].id : 0

        // 获取数据
        request.get(url, {
          'lesson_id': self.lessonid,
          'start': start,             // 开始的id，返回时不包含本id内容
          'count': FENYE_COUNT,
          'direction': 1              // 刷新要正序查找
        }).then(jsonData => {
            self.isShowNewHint = jsonData.data.response_num
          })
      },
    }
  }
</script>

<style lang="scss" scoped>
  @import "~@/style/_variables";
  .submission-box {
    position: absolute;
    z-index: 20; /* 遮盖toolbar */
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
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

    .bigpic-mask {
      display: flex;
      align-items: center;
      position: fixed;
      z-index: 20;
      left: 0;
      right: 0;
      top: 0;
      bottom: 0;
      background: rgba(0,0,0,0.8);
      color: $white;

      img {
        display: block;
        margin: 0 auto;
        max-width: 100%;
        max-height: 100%;
      }
      .w100 {
        width: 100%;
      }
      .h100 {
        height: 100%;
      }
    }
    
    .isFetching {
      position: relative;
      z-index: 10;
      padding-top: 7.0rem;
      text-align: center;
    }
    .no-paper-box {
      box-sizing: border-box;
      height: 100%;
      background: $white;
      text-align: center;
      
      img {
        display: inline-block;
        width: 5.5rem;
        transform: translateY(100%);
      }
      .hint {
        position: absolute;
        left: 0;
        bottom: 2rem;
        width: 100%;
        color: $graybg;
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
          margin-bottom: 0.4rem;
          padding-top: 0.266667rem;

          .avatar {
            margin-right: 0.4rem;
            width: 0.986667rem;
            height: 0.986667rem;
            border-radius: 50%;
          }
          .cont {
            flex: 1;
            word-break: break-word;

            .author {
              color: $blue;
            }

            .pic {
              max-width: 7.573333rem;
              max-height: 7.04rem;
            }
          }
        }

        .action-box {
          display: flex;
          justify-content: space-between;
          align-items: center;
          height: 1rem;
          margin-left: 1.386667rem;
          
          .gray {
            color: $graybg;
          }

          .time {
            color: $graybg;
          }

          .action {
            display: flex;
            align-items: center;
            justify-content: space-between;

            .coll {
              margin-right: 0.666667rem;
              width: 2.133333rem;
            }
          }
          .cancel-post-btn {
            background: $blue;
            width: 2.346667rem;
            text-align: center;
            height: 0.826667rem;
            line-height: 0.826667rem;
            color: $white;
          }

          .qb {
            margin-right: -0.4rem;
          }

          .yfqb {
            background: $graybg;
          }

          .fsqb-innerline {
            float: left;
            margin-top: 0.2rem;
            width: 0.026667rem;
            height: 0.4rem;
            background: $white;
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
    
    .toast-box {
      position: fixed;
      left: 50%;
      top: 50%;
      width: 4.0rem;
      height: 1.466667rem;
      line-height: 1.466667rem;
      transform: translate(-50%, -50%);
      border-radius: 0.08rem;
      text-align: center;
      background: #333333;
      color: $white;
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

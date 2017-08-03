<!-- 投稿控制页面 被父组件 rc-mask-activity.vue 引用 -->
<template>
	<div class="submission-box allowscrollcallback">
    <v-touch v-show="isBigpicShown" class="bigpic-mask" v-on:tap="hideBigpic">
      <img :src="bigpicUrl" :class="[isWider ? 'w100' : 'h100']" alt="">
    </v-touch>
    <div class="isFetching f21" v-show="isFetching">正在加载中...</div>
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
                  <v-touch class="coll gray" v-show="item.is_collect" v-on:tap="collectSubmission(item.id, index, 0)">
                    <i class="iconfont icon-tougao_shoucang1 f20" style="color: #E1142D; margin-right: 0.1rem;"></i>
                    已收藏
                  </v-touch>
                  <v-touch class="coll gray J_ga" data-category="9" data-label="投稿页" v-show="!item.is_collect" v-on:tap="collectSubmission(item.id, index, 1)">
                  <i class="iconfont icon-tougao_bushoucang f20" style=" margin-right: 0.1rem;"></i>
                    收藏
                  </v-touch>

                  <v-touch  class="gray J_ga" data-category="10" data-label="投稿页" v-show="postingSubmissionid !== item.id" v-on:tap="postSubmission(item.id)">
                    <i class="iconfont icon-shiti_touping f24" style="color: #639EF4; margin-right: 0.1rem;"></i>
                    投屏
                  </v-touch>
                  <v-touch class="cancel-post-btn f17" v-show="postingSubmissionid === item.id" v-on:tap="closeSubmissionmask">退出投屏</v-touch>
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
    <div class="button-box f18">
      <v-touch class="btn" v-on:tap="refreshSubmissionlist">刷新</v-touch>
      <v-touch class="btn f18 J_ga" v-on:tap="closeSubmissionbox" data-category="15" data-label="投稿页">返回</v-touch>
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

  export default {
    name: 'RcMaskActivitySubmission',
    props: ['lessonid', 'socket', 'postingSubmissionid'],
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
      }
    },
    components: {
      Loadmore
    },
    created () {
      let self = this

      // 父组件点击 投稿 按钮时发送事件给本子组件
      self.$on('showSubmission', function (msg) {
        self.refreshSubmissionlist()
      })
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

        // 单次刷新
        request.get(url, {
          'lesson_id': self.lessonid,
          'start': self.submissionList[self.submissionList.length-1].id,
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
        this.$emit('closeSubmissionbox')
        this.closeSubmissionmask()

        typeof gaue !== 'undefined' && gaue.default.fixTrigger(evt);
      },
      /**
       * 更新试题详情的数据
       * 点击打开详情时要主动更新一下数据，所以把本方法放在本父组件中
       *
       */
      refreshSubmissionlist(){
        let self = this
        let url = API.submissionlist

        // 如果已经有内容了就不要显示正在加载中了
        if (!self.submissionList.length) {
          self.isFetching = true
        }

        // 单次刷新
        request.get(url, {
          'lesson_id': self.lessonid,
          'start': BIG_NUMBER,
          'count': BIG_NUMBER,
          'direction': 0
        }).then(jsonData => {
            let newList = jsonData.data.tougao_list
            
            self.isFetching = false

            // 如果新增的超过了FENYE_COUNT或目前投稿列表为空，则只显示最新的FENYE_COUNT个
            // 否则如果状态为已经全加载完的话，直接把所有刷新的数据赋值
            // 否则只新塞最新的数据到前面
            let newItemsCount = 0
            if (newList[0] && self.submissionList[0]) {
              newItemsCount = newList[0].id - self.submissionList[0].id
            }
            
            if (!self.submissionList.length || newItemsCount > FENYE_COUNT) {
              // 如果是刚加载展示，并且总数量小于 FENYE_COUNT，则改状态为没有更多了
              if (!self.submissionList.length && newList.length <= FENYE_COUNT) {
                self.allLoaded = true
              } else {
                self.allLoaded = false
              }

              self.submissionList = newList.slice(0, FENYE_COUNT)
            } else if (self.allLoaded) {
              self.submissionList = newList
            } else {
              self.submissionList = newList.slice(0, newItemsCount).concat(self.submissionList)
              self.allLoaded = false
            }
            
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
        width: 7.213333rem;
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

    .gap {
      height: 0.266667rem;
      background: #EDF2F6;
    }

    .list {
      padding-bottom: 1.8rem;
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
            color: #9B9B9B;
          }

          .time {
            color: #9B9B9B;
          }

          .action {
            display: flex;
            align-items: center;
            justify-content: space-between;

            .coll {
              margin-right: 0.666667rem;
            }
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
        color: #9B9B9B;

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
          background: #9B9B9B;
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
      }
    }
  }
</style>

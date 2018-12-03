<!-- 投稿控制页 -->
<template>
	<div class="submission-box">
    <slot name="ykt-msg"></slot>
    <div class="isFetching f21" v-show="isFetching">{{ $t('loading') }}...</div>

    <v-touch v-on:tap="refreshDataList" class="new-item-hint f15" :class="isShowNewHint ? 'hintfadein' : 'hintfadeout' ">{{ $t('recvpost') }}</v-touch>
    <div v-show="isShowNoNewItem" class="no-new-item f18">{{ $t('nonewpost') }}</div>
    <!-- 没有投稿 -->
    <div v-show="!isFetching && !dataList.length" class="no-paper-box">
      <img :src="notougaoImg" alt="">
      <div class="hint f12" v-html="$t('posttips')"></div>
    </div>
    <div v-show="!isFetching && dataList.length">
      <hide-some-info :isUserInfo="true" @change="showUserInfoChange"></hide-some-info>
      <div class="gap"></div>
      <!-- 上拉加载更多页，刷新返回并刷新只显示第一页 -->
      <Loadmore
         ref="Loadmore"
         :bottom-method="loadBottom"
         :bottom-all-loaded="isAllLoaded"
         :bottomPullText="$t('release')"
         :bottomDropText="$t('shifang')"
         :class="{'allLoaded': isAllLoaded}"
         >

        <section class="list">

          <div class="item-with-gap" v-for="(item, index) in dataList" :key="item.id">
            <div class="item">
              <div class="detail">
                <img :src="item.user_avatar" class="avatar" alt="">
                <div class="cont f18">
                  <span class="author f15">{{item.user_name}}</span>
                  <div>
                    {{item.fold ? item.foldContent : item.content}}
                    <span v-show="!item.hideFold">
                        <span v-show="item.fold" @click="item.fold = false">
                            <span>...</span>
                            <span class="color16">
                              <span>{{$t('showall')}}</span>
                              <span class="color12">({{item.content ? item.content.length : 0}})</span>
                            </span>
                        </span>
                        <span v-show="!item.fold" @click="item.fold = true" class="color16">
                            <i class="iconfont icon-zhankai"></i>
                            {{$t('foldall')}}
                        </span>
                    </span>
                  </div>
                  <v-touch :id="'pic' + item.id" tag="img" :src="item.thumb" v-if="item.thumb" class="pic" alt="" v-on:tap="scaleImage(item.pic, $event)"></v-touch>
                </div>
              </div>
              <div class="action-box">
                <div class="time f15">{{item.create_time.substring(11)}}</div>
                <div class="action f15">
                  <!-- 投屏的时候不显示收藏状态 -->
                  <v-touch class="coll gray" v-show="item.is_collect && postingSubmissionid !== item.id" v-on:tap="collectSubmission(item.id, index, 0)">
                    <i class="iconfont icon-tougao_shoucang1 f20" style="color: #E1142D; margin-right: 0.1rem;"></i>
                    {{ $t('stared') }}
                  </v-touch>
                  <v-touch class="coll gray J_ga" data-category="9" data-label="投稿页" v-show="!item.is_collect && postingSubmissionid !== item.id" v-on:tap="collectSubmission(item.id, index, 1)">
                    <i class="iconfont icon-tougao_bushoucang f20" style=" margin-right: 0.1rem;"></i>
                    {{ $t('star') }}
                  </v-touch>

                  <v-touch class="gray J_ga" data-category="10" data-label="投稿页" v-show="postingSubmissionid !== item.id" v-on:tap="postSubmission(item.id)">
                    <i class="iconfont icon-shiti_touping f24" style="color: #639EF4; margin-right: 0.1rem;"></i>
                    {{ $t('screenmode') }}
                  </v-touch>
                  <v-touch class="cancel-post-btn f14 J_ga" data-category="17" data-label="投稿列表页" v-show="postingSubmissionid === item.id && !postingSubmissionSent" v-on:tap="fsqbHander(item.id)">
                    {{ $t('postpublic') }}
                  </v-touch>
                  <div class="cancel-post-btn yfqb f14" v-show="postingSubmissionid === item.id && postingSubmissionSent">
                    {{ $t('postpubliced') }}
                  </div>
                  <v-touch class="cancel-post-btn f14 qxtp" v-show="postingSubmissionid === item.id" v-on:tap="closeSubmissionmask">
                    <span class="fsqb-innerline"></span>
                    {{ $t('screenmodeoff') }}
                  </v-touch>
                  
                </div>
              </div>
            </div>
            <div class="gap"></div>
          </div>

          <div v-show="isAllLoaded && isContLonger" class="nomore f15">
            <div class="bgline"></div>
            <div class="wenan">end</div>
          </div>

        </section> 
      </Loadmore>
      <div class="gap"></div>
      
    </div>
    
    <div class="toast-box f15" v-show="isAskingItemStatus || isItemDeleted">
      <span v-show="isAskingItemStatus">{{ $t('onscreenmode') }}...</span>
      <span v-show="isItemDeleted">{{ $t('postdeleted') }}</span>
    </div>
    <v-touch class="btn f18" v-on:tap="refreshDataList">{{ $t('refresh') }}</v-touch>
    <Scale></Scale>
  </div>
</template>

<script>
  import {mapGetters} from 'vuex'
  import request from '@/util/request'
  import API from '@/pages/teacher/config/api'

  import Loadmore from 'mint-ui/lib/loadmore'
  import Scale from './common/scale'
  import hideSomeInfo from '@/components/teacher-restructure/common/hideSomeInfo'

  let FENYE_COUNT = 10

  let WH = window.innerWidth/window.innerHeight
  let pollingTimer = null
  let postingTimer = null

  export default {
    name: 'Submission',
    data () {
      return {
        dataList: [],                 // 投稿列表
        isAskingItemStatus: false,    // 正在查询投稿状态
        isItemDeleted: false,         // 投稿已经被删除
        isFetching: true,             // 正在获取数据
        isAllLoaded: false,           // 上拉加载更多到底了
        isContLonger: false,          // 内容超过1屏
        isShowNoNewItem: false,       // 刷新后没有新的条目
        isShowNewHint: false,         // 上方提示有新的条目进来
        isShowBtnBox: false,          // 显示底部返回按钮
        notougaoImg: require(`images/teacher/no-tougao${i18n.t('imgafterfix')}.png`),
        isHideName: false,               // 匿名投屏
      }
    },
    computed: {
      ...mapGetters([
        'lessonid',
        'socket',
        'postingSubmissionid',
        'postingSubmissionSent'
      ])
    },
    components: {
      Loadmore,
      Scale,
      hideSomeInfo
    },
    created () {
      let self = this

      //首次加载页面投稿列表
      self.refreshDataList(true)
      self.handlePubSub()

      // 轮询投稿列表
      pollingTimer = setInterval(() => {
        self.pollingNewItem()
      }, 5000)
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
    },
    beforeDestroy(){
      this.closeSubmissionmask()
      clearInterval(pollingTimer)
      T_PUBSUB.unsubscribe('submission-msg')
    },
    watch: {
      dataList: function() {
        setTimeout(() => {
          let sbh = document.querySelector('.submission-box .list').offsetHeight
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

        // 订阅前清掉之前可能的订阅，避免多次触发回调
        T_PUBSUB.unsubscribe('submission-msg')

        T_PUBSUB.subscribe('submission-msg.postshown', (_name, msg) => {
          // socket通知投稿投屏了，要隐藏投屏中的提示
          clearTimeout(postingTimer)
          self.isAskingItemStatus = false
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
        if (!self.dataList[0]) {
          setTimeout(() => {
            // this.$refs.Loadmore.onBottomLoaded()
            self.onBottomLoaded()
          }, 100)
          return;
        }
        console.log('上拉松手了')

        let tailNow = self.dataList[self.dataList.length-1].id

        self.fetchList(tailNow).then(jsonData => {
          // 设置试卷详情数据
          // response_num 当前请求返回的投稿数量
          if (jsonData.data.response_num === 0) {
            self.isAllLoaded = true
            return
          }
          self.dataList = self.addFold(self.dataList.concat(jsonData.data.tougao_list))

          // this.$refs.Loadmore.onBottomLoaded()
          self.onBottomLoaded()
        })
      },
      /**
       * 复写 mint-ui loadmore 组件的 onBottomLoaded 方法
       * 处理首次加载容器会往上偏移50px 的问题
       *
       */
      onBottomLoaded () {
        let self = this
        var $loadmore = this.$refs.Loadmore
        $loadmore.bottomStatus = 'pull'
        $loadmore.bottomDropped = false
        this.$nextTick(() => {
          $loadmore.translate = 0
        })
        if (!$loadmore.bottomAllLoaded && !$loadmore.containerFilled) {
          $loadmore.fillContainer()
        }
      },
      /**
       * 获取答案数据
       *
       * @param {Number} start 起始位置id，返回值不包括起始位置的值， 默认 -1， 即从最新无限大处开始
       * @param {Number} direction 默认0 倒序，即向老的方向找去
       * @param {Number} is_recount 默认0 不清理未读记录，1的话是清除未读记录
       */
      fetchList(start = -1, direction = 0, is_recount = 0){
        let self = this
        let url = API.submissionlist

        let data = {
          start,
          direction,
          is_recount,
          count: FENYE_COUNT,
          lesson_id: self.lessonid,
        }

        // 单次刷新
        return request.get(url, data)
      },
      /**
       * 轮询有没有新的投稿, 根据 response_num 来判断
       *
       */
      pollingNewItem () {
        let self = this

        let headNow = self.dataList[0] ? self.dataList[0].id : 0

        self.fetchList(headNow, 1).then(jsonData => {
          self.setData({
            isShowNewHint: jsonData.data.response_num,
          })
        })
      },
      /**
       * 更新投稿列表的数据
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
        self.fetchList(-1, 0, 1).then(jsonData => {
          // 只要点击刷新按钮就去掉上方的有新弹幕的提示
          self.isShowNewHint = false
          
          setTimeout(() => {
            self.isShowBtnBox = true
          },500)

          let newList = jsonData.data.tougao_list
          // 返回的条目的个数
          let response_num = jsonData.data.response_num
          // 有可能还一条都没有呢
          let headNow = self.dataList[0] ? self.dataList[0].id : 0
          let headIndex = newList.findIndex(item => item.id === headNow)

          // 假如没有新条目的话，显示没有新条目的提示
          // 无论显示提示与否，2秒后不再显示提示
          self.isShowNoNewItem = !isInit && (!newList.length || newList[0].id === headNow)
          
          setTimeout(() => {
            self.isShowNoNewItem = false
          }, 2000)

          self.isFetching = false


          let isAllLoaded = self.isAllLoaded
          if (response_num === 0) {
            isAllLoaded = true
          } else if (headNow === 0) {
            self.setData({
              dataList: self.addFold(newList)
            })

            isAllLoaded = newList.length < FENYE_COUNT
          } else if (~headIndex) {
            // 包含
            let _list = newList.slice(0, headIndex).concat(self.dataList)
            self.setData({
              dataList: self.addFold(_list)
            })
          } else {
            self.setData({
              dataList: self.addFold(newList)
            })
            isAllLoaded = false
          }

          self.setData({
            isAllLoaded
          })

          // 刷新的话回顶部，清零投稿未读数
          setTimeout(() => {
            self.$el.scrollTop = 0
          }, 100)
          self.$store.commit('set_newtougao', 0)
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

        // 因为学生能够删除投稿，修改投屏方式为ajax
        // https://tower.im/projects/ea368aa0284f4fb3ab8993b006579460/todos/5854f6b0dd584a9fac796bba852e5ba1/#043541593c7d442e8921fbf9856a8691
        postingTimer = setTimeout(() => {
          // TODO 订阅投稿投屏咨询状态
          // self.isAskingItemStatus = true
        },800)
        
        let url = API.tougaostatus

        let postData = {
          'lesson_id': self.lessonid,
          'tougao_id': submissionid,
          // 'hide': self.isHideName
        }
        request.post(url, postData)
          .then(jsonData => {
            // 不需要判断success，在request模块中判断如果success为false，会直接reject
            // clearTimeout(postingTimer)
            // self.isAskingItemStatus = false
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
        typeof gaue !== 'undefined' && gaue.default.fixTrigger(event);
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
            self.dataList[index].is_collect = !!status
          })
      },
      /**
       * 显示大图，使用 PhotoSwipe
       *
       * @event bindtap
       * @param {string} pic 大图url
       */
      scaleImage(src, evt) {
        let targetEl = typeof event !== 'undefined' && event.target || evt.target;;
        let pswpElement = document.querySelector('.J_pswp');
        let index = 0;
        let WIDTH = window.innerWidth
        let items = [{ src: src, w: WIDTH, h: targetEl.height*WIDTH/targetEl.width }];

        let options = {
          index: index,
          maxSpreadZoom: 5,
          showAnimationDuration: 300,
          hideAnimationDuration: 300,
          showHideOpacity: true,

          closeEl: false,
          captionEl: false,
          fullscreenEl: false,
          zoomEl: false,
          shareEl: false,
          counterEl: false,
          arrowEl: false,
          preloaderEl: false,

          tapToClose: true,
          // 解决消息点击问题
          // history: false,       
        };

        // Initializes and opens PhotoSwipe
        let gallery;

        if(typeof PhotoSwipe !== 'undefined') {
          gallery = new PhotoSwipe(pswpElement, PhotoSwipeUI_Default, items, options);

          gallery.init();
        } else {
          setTimeout(()=>{
            gallery = new PhotoSwipe(pswpElement, PhotoSwipeUI_Default, items, options);
            gallery.init();
          }, 1500)
        }

      },
      /*
      * 变更投屏状态
      *  可能已废弃，以后删掉
      *
      **/ 
     showUserInfoChange(val) {
       this.isHideName = val
     },
    // 增加fold 属性
    addFold(list) {
        list.map(e => {
            if(e.content && this.getLength(e.content)> 200) {
                e.fold = true
            } else {
                e.fold = false
                e.hideFold = true
            }
            e.foldContent = e.content.slice(0, 100)
        })
        return list
    },
    getLength(str) {
        let s = str + ''
        var result = s.replace(/[^\x00-\xff]/g, '**')
        return result.length
    }
    }
  }
</script>

<style lang="scss" scoped>
  @import "~@/style/_variables";
  @import "~@/style/common";
  @function px2rem($px) {
    $rem: 75px;
    @return ($px/$rem) + rem;
  }
  .submission-box {
    position: relative;
    height: 100%;
    background: #EDF2F6;
    color: #4A4A4A;
    overflow: auto;
    -webkit-overflow-scrolling: touch;

    .hide-show-name{
      width: 100%;
      height: px2rem(88px);
      line-height: px2rem(88px);
      background-color: #fff;
      box-sizing: border-box;
      padding-left: px2rem(30px);
      font-size: 0;
      .iconfont{
        font-size: px2rem(30px);
        vertical-align: middle;
      }
      .icon-kuang{
        color: #666;
      }
      .icon-kuangxuanzhong{
        color: #639efc;
      }
      .info{
        color: #666;
        font-size: px2rem(28px);
        margin: 0 px2rem(10px);
      }
    }

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
      // background: $white;
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
      height: px2rem(20px);
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
          // margin-bottom: 0.4rem;
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
            text-align: justify;
            .author {
              color: $blue;
            }

            .pic {
              max-width: 7.573333rem;
              max-height: 7.04rem;
            }
            .color16{
              font-size: px2rem(32px);
              color: #639ef4;
              display: inline-block;
              .iconfont{
                font-size: px2rem(40px);
                vertical-align: middle;
              }
            }
            .color12{
              font-size: px2rem(24px);
              color: #639ef4;
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

          .qxtp {
            margin-right: -0.4rem;
          }

          .yfqb {
            background: $graybg;
          }

          .fsqb-innerline {
            float: left;
            margin-top: 0.2rem;
            width: 1px;
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
    .btn {
      position: fixed;
      left: 0;
      right: 0;
      bottom: 0;
      border-radius: 0;
      height: 1.466667rem;
      line-height: 1.466667rem;
      box-shadow: none;
    }
  }
</style>

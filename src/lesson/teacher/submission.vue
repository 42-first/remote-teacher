<!-- 投稿控制页 -->
<template>
	<div class="submission-box">

    <div class="isFetching f21" v-show="isFetching">{{ $t('loading') }}...</div>

    <v-touch v-on:tap="refreshDataList" class="new-item-hint f15" :class="isShowNewHint ? 'hintfadein' : 'hintfadeout' ">{{ $t('recvpost') }}</v-touch>
    <div v-show="isShowNoNewItem" class="no-new-item f18">{{ $t('nonewpost') }}</div>
    <!-- 没有投稿 -->
    <div v-show="!isFetching && !dataList.length" class="no-paper-box">
      <img :src="notougaoImg" alt="">
      <div class="hint f12" v-html="$t('posttips')"></div>
    </div>
    <div v-show="!isFetching && dataList.length">
      <hide-some-info :isUserInfo="true" position="left" @change="showUserInfoChange"></hide-some-info>
      <span v-if="addinversion >= 1.5" class="wordcloud-btn f16" @click="setWordCloudStatus">{{ postWordCloudOpen ? $t('closewordcloud') : $t('openwordcloud')}}</span>
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

          <div class="item-with-gap" v-for="(item, index) in dataList" :key="item.tougaoId">
            <div class="item">
              <div class="detail">
                <div class="cont f18">
                  <div v-if="!item.is_group">
                    <img-group :groupdata="item.team_info" :big="1"></img-group>
                  </div>
                  <div @click="showCurGroupList(index)" v-else>
                    <img-group :groupdata="item.team_info" :big="1"></img-group>
                  </div>
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
                  <v-touch :id="'pic' + item.tougaoId" tag="img" :src="item.picture+'?imageView2/2/w/568'" v-if="item.thumb || item.picture" class="pic" alt="" v-on:tap="scaleImage(item.picture, $event)"></v-touch>
                  <!-- 视频展示 -->
                  <div class="video__preview" v-if="item.video && item.video.url">
                    <video :src="item.video.url" :style="item.video|setStyle" controls :poster="item.video.thumb" ></video>
                  </div>
                </div>
              </div>
              <div class="action-box">
                <div class="time f15">{{item.createTime | formatTime}}</div>
                <div class="action f15">
                  <!-- 投屏的时候不显示收藏状态 -->
                  <v-touch class="coll gray" v-show="item.collected && postDetail.tougaoId !== item.tougaoId" v-on:tap="collectSubmission(item.tougaoId, index, 0)">
                    <i class="iconfont icon-tougao_shoucang1 f20" style="color: #E1142D; margin-right: 0.1rem;"></i>
                    {{ $t('stared') }}
                  </v-touch>
                  <v-touch class="coll gray J_ga" data-category="9" data-label="投稿页" v-show="!item.collected && postDetail.tougaoId !== item.tougaoId" v-on:tap="collectSubmission(item.tougaoId, index, 1)">
                    <i class="iconfont icon-tougao_bushoucang f20" style=" margin-right: 0.1rem;"></i>
                    {{ $t('star') }}
                  </v-touch>

                  <v-touch class="gray J_ga" data-category="10" data-label="投稿页" v-show="postDetail.tougaoId !== item.tougaoId" v-on:tap="postSubmission(item.tougaoId)">
                    <i class="iconfont icon-shiti_touping f24" style="color: #639EF4; margin-right: 0.1rem;"></i>
                    {{ $t('screenmode') }}
                  </v-touch>
                  <v-touch class="cancel-post-btn f14 J_ga" data-category="17" data-label="投稿列表页" v-show="postDetail.tougaoId === item.tougaoId && !postingSubmissionSent" v-on:tap="fsqbHander()">
                    {{ $t('postpublic') }}
                  </v-touch>
                  <div class="cancel-post-btn yfqb f14" v-show="postDetail.tougaoId === item.tougaoId && postingSubmissionSent">
                    {{ $t('postpubliced') }}
                  </div>
                  <v-touch class="cancel-post-btn f14 qxtp" v-show="postDetail.tougaoId === item.tougaoId" v-on:tap="closeSubmissionmask">
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

    <!-- 组列表 -->
    <group-list v-if="curGroupInfo" @close="hideGroupList" :groupdata="curGroupInfo"></group-list>
    <!-- 教师投稿入口 -->
    <div class="publish-btn" @click="handlePublish">
      <i class="iconfont icon-ykq_tab_tougao f24"></i>
    </div>
  </div>
</template>

<script>
  import {mapGetters} from 'vuex'
  import request from '@/util/request-v3'
  import API from '@/util/api'

  import Loadmore from 'mint-ui/lib/loadmore'
  import Scale from './common/scale'
  import hideSomeInfo from './common/hideSomeInfo'
  import groupList from '@/lesson/common/groupMembers/group-list.vue'
  import imgGroup from '@/lesson/common/groupMembers/img-group.vue'

  let FENYE_COUNT = 20

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
        isHideName: false,             // 匿名投屏
        curGroupInfo: null,            // 当前的分组
        // 当前投稿的详情
        postDetail: {
          tougaoIndex: null,
          tougaoId: null
        }               
      }
    },
    computed: {
      ...mapGetters([
        'lessonid',
        'socket',
        'postingSubmissionid',
        'postingSubmissionSent',
        'postWordCloudOpen',
        'addinversion',
        'isCloneClass'
      ])
    },
    components: {
      Loadmore,
      Scale,
      hideSomeInfo,
      groupList,
      imgGroup
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
    filters: {
      setStyle(video) {
        let width = 6.9;
        let height = width/video.width * video.height;
        let sCss = `width: ${width}rem; height: ${height}rem;`;

        return sCss;
      },
      formatTime(time){
        let date = new Date(time)
				let hours = date.getHours() > 9 ? date.getHours() : '0' + date.getHours()
				let mins = date.getMinutes() > 9 ? date.getMinutes() : '0' + date.getMinutes()
				return `${hours}:${mins}`
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
          self.getTougaoDetail(self.postingSubmissionid)
        })

        T_PUBSUB.subscribe('submission-msg.wordcloudshown', (_name, msg) => {
          self.$store.commit('set_postWordCloudOpen', true)
        })

        T_PUBSUB.subscribe('submission-msg.closepostwc', (_name, msg) => {
          self.$store.commit('set_postWordCloudOpen', false)
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

        if(this.isAllLoaded) return

        let tailNow = self.dataList[self.dataList.length-1].tougaoId

        self.fetchList(tailNow).then(res => {
          if(res && res.code === 0 && res.data){
            self.dataList = self.addFold(self.dataList.concat(res.data.items))

            self.onBottomLoaded()

            // 这里判断的是剩余未展示条数  所以判断要放在列表拼接之后
            // restNum 剩余投稿数量
            if (res.data.restNum === 0) {
              self.isAllLoaded = true
              return
            }
          }
          
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
       */
      fetchList(start = -1){
        let self = this
        let url = API.lesson.get_tougao_list

        let data = {
          'start': start,
          'count': FENYE_COUNT,
          'type': 2
        }

        // 单次刷新
        return request.get(url, data)
      },
      /**
       * 轮询有没有新的投稿, 根据 unreadNum 来判断
       *
       */
      pollingNewItem () {
        let self = this
        let URL = API.lesson.get_unread
        return request.get(URL)
        .then((res) => {
          if(res && res.code === 0 && res.data){
            const num = res.data.unreadNum
            self.setData({
              isShowNewHint: !!num
            })
          }
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
        self.fetchList(-1).then(res => {
          if(res && res.code === 0 && res.data){
            let data = res.data
            // 只要点击刷新按钮就去掉上方的有新弹幕的提示
            self.isShowNewHint = false

            setTimeout(() => {
              self.isShowBtnBox = true
            },500)

            let newList = data.items
            // 返回的条目的个数
            let response_num = data.responseNum
            // 有可能还一条都没有呢
            let headNow = self.dataList[0] ? self.dataList[0].id : 0
            let headIndex = newList.findIndex(item => item.tougaoId === headNow)

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
          }
          
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

        // 克隆班不能执行当前操作
        if (!!this.isCloneClass) {
          this.$toast({
            message: this.$t('cloneTips'),
            duration: 3e3
          });
          return
        }

        // 因为学生能够删除投稿，修改投屏方式为ajax
        // https://tower.im/projects/ea368aa0284f4fb3ab8993b006579460/todos/5854f6b0dd584a9fac796bba852e5ba1/#043541593c7d442e8921fbf9856a8691
        postingTimer = setTimeout(() => {
          // TODO 订阅投稿投屏咨询状态
          // self.isAskingItemStatus = true
        },800)

        let info = this.dataList.find((item)=>{
          return item.tougaoId === submissionid;
        })

        let addinversion = Number(this.addinversion)
        // 协议版本号>=1.5 支持播放投稿视频
        if(addinversion < 1.5 && info && info.video && info.video.url) {
          let title = this.$i18n.t('tips');
          let message = this.$i18n.t('tougaowarn');
          this.$messagebox.alert(message, title)
        }
        let URL = API.lesson.share_tougao
        let postData = {
          'tougaoId': submissionid
        }
        return request.post(URL,postData)
        .then((res) => {
          if(res && res.code === 0 && res.data){
            if (res.data.deleted){
              self.isItemDeleted = true
              setTimeout(() => {
                self.isItemDeleted = false
              }, 1000)
            }
          }
        }).catch(() => {
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
        this.postDetail.tougaoId = ''
        this.postDetail.tougaoIndex = ''
      },
      /**
       * 发送全班按钮
       *
       * @event bindtap
       * @param {number} submissionid;
       */
      fsqbHander () {
        let self = this

        let str = JSON.stringify({
          'op': 'sendpost',
          'lessonid': self.lessonid,
          'postid': self.postDetail.tougaoIndex,
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
        let URL = API.lesson.post_tag

        let action = status ? 0 : 1

        let params = {
          'type': 1,
          'action': action,
          'objId': submissionid,
          'objType': 2,
        };

        request.post( URL, params).
        then((res)=>{
          if(res && res.code === 0) {
            self.dataList[index].collected = !!status
          }
        }).
        catch(error => {
          console.log('collectSubmission:', error);
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
      // 增加fold 属性    ---- 另： 针对个人发送的投稿做数据格式处理方便按照分组的样式展示头像
      addFold(list) {
        list.map(e => {
          if(e.content && this.getLength(e.content)> 200) {
            e.fold = true
          } else {
            e.fold = false
            e.hideFold = true
          }
          e.foldContent = e.content.slice(0, 100)

          if (!e.is_group) {
            e = Object.assign(e, {
              team_info: {
                team_name: e.userName,
                members: [
                  {
                    avatar: e.userAvatar
                  }
                ]
              }
            })
          }
          return e
        })
        return list
      },
      getLength(str) {
        let s = str + ''
        var result = s.replace(/[^\x00-\xff]/g, '**')
        return result.length
    },
    /**
       * @method 词云投屏控制
       *
      */
      setWordCloudStatus(){
        // 克隆班不能执行当前操作
        if (!!this.isCloneClass) {
          this.$toast({
            message: this.$t('cloneTips'),
            duration: 3e3
          });
          return
        }

        if(!this.dataList.length) return false;
        let self = this
        let str = ''
        if(!self.postWordCloudOpen){
          str = JSON.stringify({
            'op': 'showwordcloud',
            'lessonid': self.lessonid,
            'cat': 'post',
            'msgid': 1234
          })
        }else {
          str = JSON.stringify({
            'op': 'closemask',
            'lessonid': self.lessonid,
            'type': 'wordcloud',
            'msgid': 1234
          })
        }
        self.socket.send(str)
      },
      /**
       *  展示本条投稿的分组成员列表
       */
      showCurGroupList(index) {
        let item = this.dataList[index]
        if (item) {
          this.curGroupInfo = Object.assign(item.team_info, {
            group_name: item.group_name
          })
        }
      },
      /**
       *  展示本条投稿的分组成员列表
       */
      hideGroupList() {
        this.curGroupInfo = null
      },

      // 进入发布投稿页面
      handlePublish(evt) {
        // 克隆班不能执行当前操作
        if (!!this.isCloneClass) {
          this.$toast({
            message: this.$t('cloneTips'),
            duration: 3e3
          });
          return
        }
        this.$router.push({
          name: 'postsubmission_v3',
          params: {
            'lessonID': this.lessonid
          }
        })
      },

      /** 
       * 使用旧的id查询新的id
      */
      getTougaoDetail(tougaoIndex){
        let self = this
        let URL = API.lesson.get_tougao_by_index
        let params = {
          tougaoIndex: tougaoIndex
        }

        return request.get(URL, params)
        .then((res) => {
          if(res && res.code === 0 && res.data){
            this.postDetail = res.data
            this.postDetail.tougaoIndex = tougaoIndex
          }
        })
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
          padding-top: px2rem(30px);

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
                font-size: px2rem(60px);
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
          height: px2rem(80px);

          // height: 1rem;
          // margin-left: 1.386667rem;

          .gray {
            color: $graybg;
            i{
              vertical-align: middle;
            }
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

    .wordcloud-btn {
      color: $blue;
      position: absolute;
      top: 0.26666667rem;
      right: 0.4rem;
    }
  }

  .publish-btn {
    position: fixed;
    bottom: 1.8rem;
    right: 0.533333rem;

    display: flex;
    justify-content: center;
    align-items: center;

    width: 1.173333rem;
    height: 1.173333rem;
    color: #fff;
    background: #5096F5;
    box-shadow: 0 0.08rem 0.266667rem rgba(80, 150, 245, 0.3);
    border-radius: 50%;
  }

  .video__preview video {
    background: #000;
  }
</style>

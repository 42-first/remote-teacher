/*
 * @page：学生接收器分享投稿详情
 * @author: chenzhou
 * @update: 2017.8.23
 * @desc
 *
 */

<template>
  <section class="submission__detail">
    <!-- 导航 -->
    <header class="student__header submission__header">
      <p class="student__header--back" @click="handleBack"><i class="iconfont icon-fanhui f25"></i></p>
      <h3 class="header-title f18">{{ title }}</h3>
      <p class="student__header--back"></p>
    </header>

    <div :class="['submission-wrapper', 'animated', opacity ? 'zoomIn': '']">
      <div class="submission__inner">
      <div class="submission__item">
        <!-- 投稿时间 -->
        <div class="item-avatar" v-if="result.anon || !result.is_group">
          <img class="" :src="result.userAvatar" alt="" />
        </div>
        <!-- 投稿内容 -->
        <div class="item-content">
          <p class="user-name f15" v-if="result.anon || !result.is_group">{{ result.userName }}</p>
          <div v-else @click="showCurGroupList(index)">
            <img-group :groupdata="result.team_info" :big="1"></img-group>
          </div>
          <p class="f15">{{ result.content }}</p>
          <img v-if="result.picture" class="item-image" @load="handleLoadImg" @click="handleScaleImage" :src="result.thumb" :data-src="result.picture" alt="" />
          <!-- 视频展示 -->
          <div class="video__preview" v-if="result.video && result.video.url">
            <video :src="result.video.url" :style="result.video|setStyle" controls ></video>
          </div>
          <p class="date-time f15">{{ result.createTime|formatTime('HH:mm') }}</p>
        </div>

      </div>
      </div>
    </div>
    <!-- 组列表 -->
    <group-list v-if="curGroupInfo" @close="hideGroupList" :groupdata="curGroupInfo"></group-list>
  </section>
</template>
<script>
  import API from '@/util/api'
  import groupList from '@/components/common/groupMembers/group-list.vue'
  import imgGroup from '@/components/common/groupMembers/img-group.vue'

  export default {
    name: 'submission-detail',
    data() {
      return {
        index: 0,
        opacity: 0,
        title: '',
        result: {},
        width: 0,
        height: 0,
        // 图片比例
        rate: 1,
        curGroupInfo: null,

      };
    },
    components: {
      groupList,
      imgGroup
    },
    computed: {
    },
    watch: {
    },
    filters: {
      formatTime(time, format) {
        return window.moment && moment(time).format(format || 'YYYY-MM-DD HH:mm');
      },
      setStyle(video) {
        let width = 3.466;
        let height = width/video.width * video.height;
        let sCss = `width: ${width}rem; height: ${height}rem;`;

        return sCss;
      }
    },
    mixins: [],
    methods: {
      /*
       * @method 投稿详情
       * @param
       */
      getSubmission(tougaoId) {
        let URL = API.lesson.get_tougao_by_index;;
        let params = {
          'tougaoIndex': tougaoId
        };
        // 是否匿名
        let anon = this.summary.anon;

        request.get(URL, params).
        then( res => {
          if (res && res.code === 0 && res.data) {
            let data = res.data;

            anon && Object.assign(data, {
              userAvatar: 'https://qn-sfe.yuketang.cn/o_1cvff7vi9p781opp1c0r1ot9o1n9.jpg',
              userName: this.$i18n.t('anonymous2') || '匿名',
              anon: true
            })

            this.result = data;
          }
        }).catch(error => {
          console.log('getSubmission:', error);
        })
      },

      /*
       * @method 根据ID读取投稿详情
       * @param
       */
      getPost(tougaoId) {
        let URL = API.lesson.get_tougao;;
        let params = {
          'tougaoId': tougaoId
        };
        // 是否匿名
        let anon = this.summary.anon;

        request.get(URL, params).
        then( res => {
          if (res && res.code === 0 && res.data) {
            let data = res.data;

            anon && Object.assign(data, {
              userAvatar: 'https://qn-sfe.yuketang.cn/o_1cvff7vi9p781opp1c0r1ot9o1n9.jpg',
              userName: this.$i18n.t('anonymous2') || '匿名',
              anon: true
            })

            this.result = data;
          }
        }).catch(error => {
          console.log('getPost:', error);
        })
      },

      handleLoadImg(evt) {
        let target = evt.target;
        let src = target.dataset.src || target.src;

        this.width = target.naturalWidth || target.width;
        this.height = target.naturalHeight || target.width;

        this.rate = this.width/this.height;
        this.rate > 1 && (target.style.width = '100%');

        let oImg = new Image();
        oImg.onload = (e) => {
          this.width = oImg.naturalWidth || oImg.width;
          this.height = oImg.naturalHeight || oImg.height;
        };
        oImg.src = src;
      },

      handleScaleImage() {
        let targetEl = event.target;
        let src = targetEl.dataset.src || targetEl.src;
        let pswpElement = document.querySelector('.J_pswp');
        let index = 0;
        let items = [];

        // build items array
        items.unshift({ src: src, w: this.width || 750, h: this.height || 520 });

        let options = {
          index: 0,
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

          getThumbBoundsFn: function(index) {
            // find thumbnail element
            var thumbnail = targetEl;

            // get window scroll Y
            var pageYScroll = window.pageYOffset || document.documentElement.scrollTop;
            // optionally get horizontal scroll

            // get position of element relative to viewport
            var rect = thumbnail.getBoundingClientRect();

            // w = width
            return {x:rect.left, y:rect.top + pageYScroll, w:rect.width};

          }
        };

        // Initializes and opens PhotoSwipe
        let gallery = new PhotoSwipe(pswpElement, PhotoSwipeUI_Default, items, options);

        gallery.init();
      },
      handleBack() {
        this.$router.back();
      },
      /**
       *  展示本条投稿的分组成员列表
       */
      showCurGroupList(index) {
        let item = this.result
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
    },
    created() {
      this.index = +this.$route.params.index;

      let cards = this.$parent.cards;
      this.summary = cards[this.index];

      setTimeout(()=>{
        this.opacity = 1;
      }, 20)

      if(this.summary) {
        this.title = this.$parent.title;

        const addinVersion = this.$parent.version || 1.6;
        const postid = this.summary.postid;
        // 协议版本5.0是桌面端
        if(addinVersion >= 5) {
          this.getPost(postid);
        } else {
          this.getSubmission(postid);
        }
      } else {
        this.$router.back();
      }
    },
    mounted() {
    },
    beforeDestroy() {
    }
  };
</script>

<style lang="scss" scoped>
  .submission__detail {
    z-index: 1;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;

    background: #fff;
    overflow: hidden;
    // -webkit-overflow-scrolling: touch;
    -webkit-backface-visibility: hidden;
    // -webkit-transform: translate3d(0,0,0);
  }

  .submission__header {
    z-index: 1;
    position: fixed;
    top: 0;
    left: 0;

    width: 100%;
  }

  .submission-wrapper {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    // overflow-y: auto;
    // -webkit-overflow-scrolling: touch;
  }

  .submission__inner {
    flex: 1;
    width: 100%;

    overflow-y: scroll;
    -webkit-overflow-scrolling: touch;
  }

  .submission__item {
    display: flex;
    align-items: flex-start;
    justify-content: center;

    padding: 1.533333rem 0.453333rem 0.533333rem;
    color: #333333;

    .item-avatar {
      width: 0.986667rem;
      color: #000000;

      img {
        display: block;
        width: 0.986667rem;
        height: 0.986667rem;
        // border-radius: 50%;
      }
    }

    .item-content {
      flex: 1;
      padding-left: 0.51rem;
      text-align: justify;

      word-break: break-all;
      color: #333333;

      .user-name {
        color: #4975B5;
      }

      .item-image {
        margin-top: 0.2rem;
        display: block;
        width: 6.933333rem;
        // max-width: 100%;
        // max-height: 7.04rem;
      }

      .date-time {
        padding-top: 0.4rem;
        color: #666666;
      }
    }

  }

  .video__preview video {
    background: #000;
  }
</style>

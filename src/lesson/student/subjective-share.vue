/*
 * @page：学生接收器分享主观题答案
 * @author: chenzhou
 * @update: 2017.12.04
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
        <!-- 作答人 -->
        <div class="item-avatar" v-if="avatar">
          <img class="" :src="avatar" alt="" />
        </div>

        <!-- 作答内容 -->
        <div class="item-content">
          <p class="user-name f15" v-if="name">{{ name }}</p>
          <p class="f15" v-if="result.content">{{ result.content }}</p>
          <img v-if="result.pics && result.pics.length" class="item-image" @load="handleLoadImg" @click="handleScaleImage" :src="result.pics[0].thumb" :data-src="result.pics[0].pic" alt="" />
          <p class="date-time f15">{{ result.submitTime|formatTime('HH:mm') }}</p>
        </div>
      </div>
      </div>
    </div>
  </section>
</template>
<script>
  import API from '@/util/api'

  export default {
    name: 'subjective-share',
    data() {
      return {
        lessonID: 0,
        index: 0,
        opacity: 0,
        title: '',
        result: {},
        width: 0,
        height: 0,
        // 图片比例
        rate: 1,
        // 被分享者的信息
        avatar: '',
        name: '',
        teamAvatar: 'http://sfe.ykt.io/o_1cfcr67hc3l11c0a1cit11beav89.png',
      };
    },
    components: {
    },
    computed: {
    },
    watch: {
    },
    filters: {
      formatTime(time, format) {
        return window.moment && moment(time).format(format || 'YYYY-MM-DD HH:mm');
      }
    },
    mixins: [],
    methods: {
      /*
       * @method 获取主观题分数
       * @param 接口有变更 增加了个人作答还是小组作答信息
       */
      getSubjective(spid) {
        let URL = API.lesson.get_subj_result;
        let params = {
          'problem_id': this.summary.pid,
          'index': spid
        };

        request.get(URL, params).
        then( res => {
          if (res && res.code === 0 && res.data) {
            let user = res.data.user;

            // 是否匿名
            let anon = this.summary.anon;
            if(anon) {
              this.avatar = 'http://sfe.ykt.io/o_1cvff7vi9p781opp1c0r1ot9o1n9.jpg';
              this.name = this.$i18n.t('anonymous2') || '匿名';
            } else if(user) {
              this.avatar = user.avatar;
              this.name = user.name;
            }

            this.result = res.data;
          }
        }).catch(error => {
          console.log('getSubjective:', error);
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
      }
    },
    created() {
      this.index = +this.$route.params.index;

      let cards = this.$parent.cards;
      this.summary = cards[this.index];
      this.lessonID = this.$parent.lessonID;

      setTimeout(()=>{
        this.opacity = 1;
      }, 20)

      if(this.summary) {
        this.title = this.$parent.title;
        this.getSubjective(this.summary.spid);
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

<style lang="scss">
  .submission__detail {
    z-index: 1;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;

    background: #fff;
    overflow: hidden;
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
    // height: calc(100% - 1.33rem);

    padding: 1.533333rem 0.453333rem 0.533333rem;
    color: #333333;

    .item-avatar {
      width: 0.986667rem;
      color: #000000;

      img {
        display: block;
        width: 0.986667rem;
        height: 0.986667rem;
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
</style>

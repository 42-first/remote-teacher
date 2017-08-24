/*
 * @page：学生接收器分享投稿详情
 * @author: chenzhou
 * @update: 2017.8.23
 * @desc
 *
 */

<template>
  <section class="submission__detail">
    <div :class="['submission-wrapper', 'animated', opacity ? 'zoomIn': '']">

      <div class="submission__item" v-if="result">
        <!-- 投稿时间 -->
        <div class="item-avatar">
          <img class="" :src="result.user_avatar_46" alt="" />
        </div>

        <!-- 投稿内容 -->
        <div class="item-content">
          <p class="user-name f15">{{ result.user_name }}</p>
          <p class="f15">{{ result.content }}</p>
          <img v-if="result.pic" class="item-image" @load="handlelaodImg" @click="handleScaleImage" :src="result.thumb" :data-src="result.pic" alt="" />
          <p class="date-time f15">{{ result.create_time|formatTime('HH:mm') }}</p>
        </div>

      </div>

    </div>
  </section>
</template>
<script>
  import API from '@/util/api'

  export default {
    name: 'submission-detail-page',
    data() {
      return {
        index: 0,
        opacity: 0,
        title: '',
        result: {},
        width: 0,
        height: 0,
        // 图片比例
        rate: 1
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
       * @param
       */
      getSubmission(submissionID) {
        let URL = API.student.GET_SUBMISSION;
        let param = {
          'tougao_id': submissionID
        };

        return request.get(URL, param)
          .then((res) => {
            if(res && res.data) {
              let data = res.data;

              this.result = data;

              this.summary = Object.assign(this.summary, {
                status: '已读',
                isComplete: true
              })

              return data;
            }
          });
      },

      handlelaodImg(evt) {
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

      setTimeout(()=>{
        this.opacity = 1;
      }, 20)

      if(this.summary) {
        this.title = this.$parent.courseName;
        this.getSubmission(this.summary.postid);
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
    z-index: 2;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;

    background: #fff;

    overflow-y: scroll;
    -webkit-overflow-scrolling: touch;
  }

  .submission__item {
    display: flex;
    align-items: flex-start;
    justify-content: center;

    padding: 0.533333rem 0.453333rem;
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
        max-width: 100%;
        // max-height: 7.04rem;
      }

      .date-time {
        padding-top: 0.4rem;
        color: #666666;
      }
    }

  }
</style>

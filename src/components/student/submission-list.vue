/*
 * @page：学生接收器我的投稿页面
 * @author: chenzhou
 * @update: 2017.6.16
 * @desc
 *
 */

<template>
  <section class="page-submissionlist">
    <div :class="['page-wrapper', 'animated', opacity ? 'zoomIn': '']">
      <!-- header 批量操作 删除等 -->
      <section class="header ">
        <div class="header-inner">
          <input class="" type="checkbox" />
          <p class="action"></p>
        </div>
      </section>
    </div>
  </section>
</template>
<script>
  import API from '@/util/Api'

  export default {
    name: 'submission-page',
    data() {
      return {
        opacity: 0,
        title: '我的投稿'
      };
    },
    beforeRouteEnter (to, from, next) {
      // 在渲染该组件的对应路由被 confirm 前调用
      // 不！能！获取组件实例 `this`
      // 因为当钩子执行前，组件实例还没被创建
      if(from.name === 'student-submission-page') {
        next();
      } else {
        next(vm => {
          vm.$router.go(-1);
        })
      }
    },
    components: {
    },
    computed: {
    },
    watch: {
    },
    filters: {
      formatTime(time) {
        return moment && moment(time).format('hh:mm:ss') || time;
      }
    },
    mixins: [],
    methods: {
      /*
      * @method 发送投稿
      * @param
      */
      sendSubmission() {
        let self = this;
        let URL = API.student.SEND_SUBMISSION;
        let socket = this.$parent.socket;
        const content = this.text.replace(/^\s+|\s+$/g, '');
        let params = {
          'content': content,
          'pic': this.imageURL,
          'lesson_id': this.lessonID
        }

        // 发送中
        this.sendStatus = 3;

        return request.post(URL, params)
          .then(function (res) {
            if(res) {
              let data = res;
              self.sendStatus = 4;

              setTimeout(() => {
                self.handleBack();
              }, 2000)

              self.$toast({
                message: '发送成功',
                duration: 2000
              });

              return data;
            }
          });
      },
      handlelaodImg() {
        let target = event.target;

        this.width = target.naturalWidth || target.width;
        this.height = target.naturalHeight || target.width;

        this.rate = this.width/this.height;
      },
      handleScaleImage() {
        let targetEl = event.target;
        let pswpElement = this.$el.querySelector('.J_submission_pswp');
        let index = 0;
        let items = [];

        // build items array
        items.unshift({ src: this.imageData, w: this.width || 750, h: this.height || 520 });

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
      this.lessonID = +this.$route.params.lessonID;
    },
    mounted() {
    },
    beforeDestroy() {
    }
  };
</script>

<style lang="scss">
  .page-wrapper {
    will-change: opacity;
    -webkit-transition: opacity 333ms cubic-bezier(0.4, 0, 0.22, 1);
    transition: opacity 333ms cubic-bezier(0.4, 0, 0.22, 1);
    cursor: zoom-in;
  }

  .page-submission {
    z-index: 1;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;

    background: #fff;

    overflow-y: scroll;
    -webkit-overflow-scrolling: touch;
  }


  /*------------------*\
    $ 投稿列表操作区域
  \*------------------*/

  .header {
    height: 1.173333rem;
    line-height: 1.173333rem;

    border-bottom: 1px solid #979797;
  }


</style>























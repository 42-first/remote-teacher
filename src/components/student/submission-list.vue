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
        <div class="header-inner f16">
          <input class="selected-box" type="checkbox" /><span v-if="selectedCount">{{ selectedCount }}</span>
          <p class="action" v-show="!canSelect" @click="handleSetSelected">批量操作</p>
          <p class="action delete" v-show="canSelect" @click="handleDelete">删除</p>
        </div>
      </section>

      <!-- 我的投稿列表 -->
      <section class="submission-mine">
        <ul class="submission-list">
          <li class="item">
            <!-- 选择控件 -->
            <div class="item-checkbox" v-show="canSelect"><input class="selected-box" type="checkbox" @change="handleSelect" data-id="1" /></div>

            <!-- 投稿时间 -->
            <div class="item-date">
              <p class="">
                <span class="date-day f25">{{ 1497604731249|formatTime('DD') }}</span>
                <span class="date-month f14">{{ 1497604731249|formatTime('MM月') }}</span>
              </p>
              <p class="date-time f14">{{ 1497604731249|formatTime('HH:mm') }}</p>
            </div>

            <!-- 投稿内容 -->
            <div class="item-content">
              <p class="f15">这里是文字描述，投稿限制了140个字符，这里全部显示。一二三这里是文字描述，投稿限制了140个字符，这里全部显示。一二三这里是文字描述，投稿限制了140个字符，这里全部显示。一二三这里是文字描述，投稿限制了140个字符，这里全部显示。一二三一二三这里是文字描述</p>
              <img class="item-image" src="http://sfe.ykt.io/o_1binunron17essoc1jq21km2cp09.jpeg" alt="" />
            </div>
          </li>
        </ul>
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
        title: '我的投稿',
        selectedCount: 0,
        submissionlist: null,
        canSelect: false,
        aIDs: []
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
        return moment && moment(time).format(format || 'YYYY-MM-DD HH:mm');
      }
    },
    methods: {
      /*
      * @method 读取我的投稿
      * @param
      */
      getMySubmission() {
        let self = this;
        let URL = API.student.GET_SUBMISSION_LIST;
        let params = {
          'count': 100,
          'lesson_id': this.lessonID,
          'direction': 1
        }

        return request.get(URL, params)
          .then(function (res) {
            if(res && res.data) {
              let data = res.data;

              self.submissionlist = data.tougao_list;
              return data;
            }
          });
      },

      /*
      * @method 删除投稿
      * @param
      */
      deleteSubmission(id) {
        let self = this;
        let URL = API.student.DELETE_SUBMISSION;
        let params = {
          'tougao_id': id
        }

        return request.post(URL, params)
          .then(function (res) {
            if(res) {
              return res;
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

      /*
      * @method 批量删除
      * @param
      */
      handleDelete() {
        // 批量删除
      },

      /*
      * @method 选中
      * @param
      */
      handleSelect() {
        let target = event.target;

        if(target.checked) {
          this.selectedCount++;
          this.aIDs.push(target.dataset.id);
        } else {
          this.selectedCount--;

          // 删除
        }
      },
      /*
      * @method 批量设置
      * @param
      */
      handleSetSelected() {
        this.canSelect = true;
      },
      handleBack() {
        this.$router.back();
      }
    },
    created() {
      this.lessonID = +this.$route.params.lessonID;
      this.getMySubmission();
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

  .page-submissionlist {
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

  .selected-box {
    width: 0.373333rem;
    height: 0.373333rem;
    border: 1px solid #333333;
  }


  /*------------------*\
    $ 投稿列表操作区域
  \*------------------*/

  .header {
    display: flex;
    align-items: center;
    justify-content: flex-end;

    padding: 0 0.4rem;
    height: 1.173333rem;
    line-height: 1.173333rem;

    border-bottom: 1px solid #979797;

    .header-inner {
      display: flex;
      align-items: center;
      justify-content: flex-end;

      flex: 1;

      .action {
        padding-left: 0.133333rem;
      }

      .action.delete {
        color: #D0011B;
      }

    }
  }



  /*------------------*\
    $ 我的投稿列表
  \*------------------*/


  .submission-mine {
    padding: 0 0.453333rem;

    .submission-list {

      .item {
        display: flex;
        align-items: baseline;
        justify-content: center;

        padding-top: 0.533333rem;

        color: #333333;

        .item-checkbox {
          width: 0.4rem;
        }

        .item-date {
          width: 1.666667rem;
          color: #000000;

          .date-time {
            color: #666666;
          }
        }

        .item-content {
          flex: 1;
          padding-left: 0.133333rem;
          text-align: justify;

          color: #333333;

          .item-image {
            width: 3.733333rem;
          }
        }

      }

    }
  }


</style>























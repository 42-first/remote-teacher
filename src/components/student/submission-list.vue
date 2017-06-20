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
          <input class="selected-box" type="checkbox" disabled /><span v-if="selectedCount">{{ selectedCount }}</span>
          <p class="action" v-show="!canSelect" @click="handleSetSelected">批量操作</p>
          <p class="action delete" v-show="canSelect" @click="handleDelete">删除</p>
        </div>
      </section>

      <!-- 我的投稿列表 -->
      <section class="submission-mine">
        <ul class="submission-list">
          <li class="item" v-for="(item, index) in submissionlist">
            <!-- 选择控件 -->
            <div class="item-checkbox" v-show="canSelect"><input class="selected-box" type="checkbox" @change="handleSelect" :data-id="item.id" /></div>

            <!-- 投稿时间 -->
            <div class="item-date">
              <p class="">
                <span class="date-day f25">{{ item.create_time|formatTime('DD') }}</span>
                <span class="date-month f14">{{ item.create_time|formatTime('MM月') }}</span>
              </p>
              <p class="date-time f14">{{ item.create_time|formatTime('HH:mm') }}</p>
            </div>

            <!-- 投稿内容 -->
            <div class="item-content">
              <p class="f15">{{ item.content }}</p>
              <img v-if="item.pic" class="item-image" @load="handlelaodImg" @click="handleScaleImage" :src="item.pic" alt="" />
            </div>
          </li>
        </ul>
      </section>

    </div>

    <!-- 图片放大结构 -->
    <section class="pswp J_submissionlist_pswp" tabindex="-1" role="dialog" aria-hidden="true">

      <div class="pswp__bg"></div>

      <div class="pswp__scroll-wrap">

        <div class="pswp__container">
            <div class="pswp__item"></div>
            <div class="pswp__item"></div>
            <div class="pswp__item"></div>
        </div>

        <div class="pswp__ui pswp__ui--hidden">

          <div class="pswp__top-bar">

            <div class="pswp__counter"></div>

              <div class="pswp__preloader">
                    <div class="pswp__preloader__icn">
                      <div class="pswp__preloader__cut">
                        <div class="pswp__preloader__donut"></div>
                      </div>
                    </div>
              </div>
            </div>

            <div class="pswp__caption">
                <div class="pswp__caption__center"></div>
            </div>

        </div>

      </div>

    </section>
  </section>
</template>
<script>
  import API from '@/util/Api'
  // import moment from 'moment'

  export default {
    name: 'submission-page',
    data() {
      return {
        opacity: 0,
        title: '我的投稿',
        selectedCount: 0,
        submissionlist: null,
        canSelect: false,
        optionsSet: new Set(),
        scaleImages: []
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
    methods: {
      /*
      * @method 读取我的投稿
      * @param
      */
      getMySubmission() {
        let self = this;
        let URL = API.student.GET_SUBMISSION_LIST;
        let params = {
          'start': 0,
          'count': 100,
          'lesson_id': this.lessonID,
          'direction': 0
        }

        return request.get(URL, params)
          .then(function (res) {
            if(res && res.data) {
              let data = res.data;

              self.submissionlist = data.tougao_list || data.tougou_list;
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
              // 删除成功后 将列表数据更新
              let data = [];
              self.selectedCount > 0 && self.selectedCount--;

              self.submissionlist.forEach( (submission) => {
                if(submission.id !== id) {
                  data.push(submission);
                }
              });

              self.submissionlist = data;

              return res;
            }
          });
      },

      handlelaodImg() {
        let target = event.target;

        let width = target.naturalWidth || target.width;
        let height = target.naturalHeight || target.width;
        let rate = width/height;

        rate > 1 && (target.style.width = '100%');

        this.scaleImages.push({ src: target.src, w: width || 750, h: height || 520 });
      },

      handleScaleImage() {
        let targetEl = event.target;
        let pswpElement = this.$el.querySelector('.J_submissionlist_pswp');
        let index = 0;
        let items = this.scaleImages;

        items.forEach( function(element, i) {
          if(element.src === targetEl.src){
            index = i;
          }
        });

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
        let options = [...this.optionsSet];

        if(options.length) {
          options.forEach( (id, index) => {
            this.deleteSubmission(+id);
          });
        }
      },

      /*
      * @method 选中
      * @param
      */
      handleSelect() {
        let target = event.target;
        let id = target.dataset.id;

        if(target.checked) {
          this.selectedCount++;
          this.optionsSet.add(id);
        } else {
          this.selectedCount--;

          this.optionsSet.has(id) && this.optionsSet.delete(id);
        }
      },

      /*
      * @method 批量设置
      * @param
      */
      handleSetSelected() {
        this.canSelect = true;
      },
      handleResize() {

      },
      handleBack() {
        this.$router.back();
      }
    },
    created() {
      !window.moment && require(['moment'], function(moment) {
        window.moment = moment;
      })

      this.lessonID = +this.$route.params.lessonID;
      this.getMySubmission();

      window.addEventListener('resize', this.handleResize);
    },
    mounted() {
    },
    beforeDestroy() {
      window.removeEventListener('resize', this.handleResize);
    }
  };
</script>

<style lang="scss">
  .page-submissionlist {
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

  .page-wrapper {
    width: 100%;
    min-height: 100%;
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
    z-index: 1;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 1.173333rem;
    line-height: 1.173333rem;

    display: flex;
    align-items: center;
    justify-content: flex-end;

    padding: 0 0.4rem;

    background: #fff;

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
    position: absolute;
    top: 1.173333rem;
    left: 0;
    width: 100%;
    min-height: 100%;
    padding: 0 0.453333rem;

    .submission-list {

      .item {
        display: flex;
        align-items: flex-start;
        justify-content: center;

        padding-top: 0.533333rem;

        color: #333333;

        .item-checkbox {
          width: 0.4rem;
          padding-top: 0.36rem;
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
            display: block;
            width: 3.733333rem;
          }
        }

      }

    }
  }


</style>























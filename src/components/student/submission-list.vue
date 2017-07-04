/*
 * @page：学生接收器我的投稿页面
 * @author: chenzhou
 * @update: 2017.6.16
 * @desc
 *
 */

<template>
  <section class="page-submissionlist">
    <div :class="['page-wrapper', 'animated', opacity ? 'zoomIn': '']" v-if="!isEmpty">
      <!-- header 批量操作 删除等 -->
      <section class="header ">
        <!-- 全选 v-model="selectAll"-->
        <div class="header-selectall f16" v-show="canSelect"><input class="selected-box" type="checkbox" :checked="selectAll" @change="handleCheckedAll" value="all" /><label for="all">全选</label></div>
        <div class="header-inner f16">
          <p class="action" v-show="!canSelect" @click="handleSetSelected">批量操作</p>
          <p class="action delete" v-show="canSelect" @click="handleDelete">删除</p>
        </div>
      </section>

      <!-- 我的投稿列表 -->
      <section class="submission-mine">
        <ul class="submission-list">
          <li class="item" v-for="(item, index) in submissionlist">
            <!-- 选择控件 -->
            <div class="item-checkbox" v-show="canSelect"><input class="selected-box" type="checkbox" :checked="item.checked" @change="handleSelect" :data-id="item.id" :data-index="index" /></div>

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
              <img v-if="item.pic" class="item-image" @load="handlelaodImg" @click="handleScaleImage" :src="item.thumb||item.pic" :data-src="item.pic" alt="" />
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

    <!-- 空状态 -->
    <section class="page-empty" v-if="isEmpty">
      <img class="page-empty-img" src="http://sfe.ykt.io/o_1bjmrkmlfar01uvmuden911mgj9.png" alt="" />
      <p class="page-empty-btn f18" @click="handleBack">返回</p>
    </section>

  </section>
</template>
<script>
  import API from '@/util/Api'

  export default {
    name: 'submission-list-page',
    data() {
      return {
        isEmpty: false,
        opacity: 0,
        title: '我的投稿',
        selectedCount: 0,
        submissionlist: null,
        canSelect: false,
        optionsSet: new Set(),
        selectAll: false,
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
          'start': 1000,
          'count': 100,
          'lesson_id': this.lessonID,
          'direction': 0
        }

        return request.get(URL, params)
          .then(function (res) {
            if(res && res.data) {
              let data = res.data;

              self.submissionlist = data.tougao_list || data.tougou_list;

              if(!self.submissionlist.length) {
                self.isEmpty = true;
              }
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

      handlelaodImg(evt) {
        let target = typeof event !== 'undefined' && event.target || evt.target;
        let src = target.dataset.src || target.src;

        let width = target.naturalWidth || target.width;
        let height = target.naturalHeight || target.height;
        let rate = width/height;

        rate > 1 && (target.style.width = '100%');

        let item = { src: src, w: width || 750, h: height || 520 };
        let oImg = new Image();
        oImg.onload = (e) => {
          this.scaleImages.forEach( (imgItem) => {
            if(src === imgItem.src) {
              imgItem.w = oImg.naturalWidth || oImg.width;
              imgItem.h = oImg.naturalHeight || oImg.height;
            }
          });
        };
        oImg.src = src;

        this.scaleImages.push(item);
      },

      handleScaleImage(evt) {
        let targetEl = typeof event !== 'undefined' && event.target || evt.target;
        let src = targetEl.dataset.src || targetEl.src;
        let pswpElement = this.$el.querySelector('.J_submissionlist_pswp');
        let index = 0;
        let items = this.scaleImages;

        items.forEach( function(element, i) {
          if(element.src === src){
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
        let self = this;
        // 批量删除
        let options = [...this.optionsSet];

        this.$messagebox.confirm('确定删除所选投稿?').then(action => {
          if(action === 'confirm' && options.length) {
            options.forEach( (id, index) => {
              self.deleteSubmission(+id);
            });
          }
        });

      },

      /*
      * @method 全部选中或者取消
      * @param
      */
      handleCheckedAll() {
        let target = event.target;

        this.optionsSet.clear();
        if(target.checked) {
          this.submissionlist.forEach( (item, index) => {
            item.checked = true;
            this.optionsSet.add(item.id);
          });
        } else {
          this.submissionlist.forEach( (item, index) => {
            item.checked = false;
            this.optionsSet.has(item.id) && this.optionsSet.delete(item.id);
          });
        }

        this.selectAll = target.checked;
        this.submissionlist = this.submissionlist.slice(0);
      },

      /*
      * @method 选中
      * @param
      */
      handleSelect() {
        let target = event.target;
        let id = +target.dataset.id;
        let index = +target.dataset.index;

        if(target.checked) {
          this.selectedCount++;
          this.optionsSet.add(id);
        } else {
          this.selectedCount--;

          this.optionsSet.has(id) && this.optionsSet.delete(id);
          this.selectAll = false;
        }

        this.submissionlist[index].checked = target.checked;
        this.optionsSet.size === this.submissionlist.length && (this.selectAll = true);
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
      let self = this;

      !window.moment && require(['moment'], function(moment) {
        window.moment = moment;
        self.submissionlist = self.submissionlist.slice(0);
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

    overflow: hidden;
  }

  .page-wrapper {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
  }

  .selected-box {
    width: 0.373333rem;
    height: 0.373333rem;
    border: 1px solid #333333;
  }



  /*------------------*\
    $ 空状态
  \*------------------*/

  .page-empty {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;

    .page-empty-img {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      display: block;
    }

    .page-empty-btn {
      position: absolute;
      bottom: 0;
      height: 1.466667rem;
      width: 100%;
      line-height: 1.466667rem;
      color: #fff;
      background: #639EF4;
    }
  }



  /*------------------*\
    $ 投稿列表操作区域
  \*------------------*/

  .header {
    width: 100%;
    height: 1.173333rem;
    line-height: 1.173333rem;

    display: flex;
    align-items: center;
    justify-content: flex-end;

    padding: 0 0.45rem;

    background: #fff;

    border-bottom: 1px solid #979797;

    .header-selectall {
      label {
        padding-left: 0.106667rem;
        vertical-align: 0.026667rem;
      }
    }

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
    flex: 1;
    width: 100%;
    padding: 0 0.453333rem;

    overflow-y: scroll;
    -webkit-overflow-scrolling: touch;

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
          width: 1.72rem;
          color: #000000;

          .date-time {
            color: #666666;
          }
        }

        .item-content {
          flex: 1;
          padding-left: 0.51rem;
          text-align: justify;

          word-break: break-all;

          color: #333333;

          .item-image {
            display: block;
            width: 3.466667rem;
            max-width: 100%;
            max-height: 7.04rem;
          }
        }

      }

    }
  }


</style>























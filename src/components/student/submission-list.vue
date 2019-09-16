/*
 * @page：学生接收器我的投稿页面
 * @author: chenzhou
 * @update: 2018.11.26
 * @desc
 *
 */

<template>
  <section class="page-submissionlist">
    <div :class="['page-wrapper', 'animated', opacity ? 'zoomIn': '']" v-if="!isEmpty">

      <!-- 我的投稿列表 -->
      <section class="submission-mine">
        <ul class="submission-list">
          <li class="item" v-for="(item, index) in submissionlist">
            <!-- 投稿时间 -->
            <div class="item-date">
              <p class="date-time f15">{{ item.create_time|formatTime('HH:mm') }}</p>
            </div>

            <div class="item__right">
            <!-- 投稿内容 -->
            <div class="item-content">
              <div class="content__wrap">
                <div class="f15">{{ item.text }}
                  <template v-if="item.hasMore">
                    <span class="content__expand blue f16" @click="handleCollapse(index, !item.isCollapse)" v-if="item.isCollapse"><!-- 全文 -->{{ $t('fulltext') }}<span class="f12">({{ item.content.length }})</span></span>
                    <span class="content__expand blue f16" @click="handleCollapse(index, !item.isCollapse)" v-else><i class="iconfont icon-zhankai f21"></i><!-- 收起 -->{{ $t('fold') }}</span>
                  </template>
                </div>
              </div>
              <div class="image__wrap" v-if="item.pic" >
                <img class="item-image" @load="handlelaodImg" @click="handleScaleImage" :src="item.thumb||item.pic" :data-src="item.pic" alt="" />
              </div>
              <!-- 视频展示 -->
              <div class="video__preview" v-if="item.video && item.video.url">
                <video :src="item.video.url" :style="item.video|setStyle" controls :poster="item.video.thumb" ></video>
              </div>
            </div>

            <!-- 更多删除入口 -->
            <p class="item--more blue f20" @click="handleVisibleSheet(index)" >...</p>

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
      <img class="page-empty-img" :src="$t('imgs.tougaoempty')" alt="" />
      <p class="page-empty-btn f18" @click="handleBack"><!-- 返回 -->{{ $t('back') }}</p>
    </section>

    <!-- actionsheet -->
    <mt-actionsheet :actions="actions" :cancel-text="cancelText" v-model="sheetVisible"></mt-actionsheet>

  </section>
</template>
<script>
  import 'mint-ui/lib/actionsheet/style.css'

  import Vue from 'vue'
  import { Actionsheet } from 'mint-ui';
  import API from '@/util/api'

  Vue.component(Actionsheet.name, Actionsheet);

  export default {
    name: 'submission-list-page',
    data() {
      return {
        isEmpty: false,
        opacity: 0,
        title: '我的投稿',
        selectedCount: 0,
        submissionlist: null,
        scaleImages: [],
        sheetVisible: false,
        cancelText: this.$i18n.t('cancel') || '取消',
        actions: [{
          name: this.$i18n.t('recall'),
          method: ()=>{
            this.sheetVisible = false;
            this.handleWithdraw();
            console.log('撤回');
          }
        }]
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
      },
      setStyle(video) {
        let width = 6.9;
        let height = width/video.width * video.height;
        let sCss = `width: ${width}rem; height: ${height}rem;`;

        return sCss;
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
          'start': 99999999999999999,
          'count': 100,
          'lesson_id': this.lessonID,
          'direction': 0
        }

        return request.get(URL, params)
          .then(function (res) {
            if(res && res.data) {
              let data = res.data;

              self.submissionlist = self.formatData(data.tougao_list);

              if(!self.submissionlist.length) {
                self.isEmpty = true;
              }

              return data;
            }
          });
      },

      /*
       * @method 格式化投稿控制文字收起展开
       * @param
       */
      formatData(data) {
        data.forEach((item)=>{
          if(item.content && item.content.length > 60) {
            item.text = item.content.substr(0, 45) + '…';
            item.isCollapse = true;
            item.hasMore = true;
          } else {
            item.text = item.content;
          }

        })

        return data;
      },

      /*
       * @method 展开收起投稿
       * @param
       */
      handleCollapse(index, isCollapse) {
        let submission = this.submissionlist[index];

        if(submission) {
          submission.isCollapse = isCollapse

          if(isCollapse) {
            submission.text = submission.content.substr(0, 45) + '…';
          } else {
            submission.text = submission.content;
          }
        }

      },

      /*
       * @method 显示撤回操作
       * @param
       */
      handleVisibleSheet(index) {
        this.activeIndex = index;
        this.sheetVisible = true;
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
      * @method 撤回
      * @param
      */
      handleWithdraw() {
        let msgOptions = {
          confirmButtonText: this.$i18n.t('recall'),
          cancelButtonText: this.$i18n.t('cancel')
        };
        let index = this.activeIndex;
        let title = this.$i18n.t('recallconfirm') || '确定要撤回本条投稿吗？';
        let content = this.$i18n.t('recallresult') || '撤回后老师端将同时消失';
        let submission = this.submissionlist[index];
        let id = submission && submission.id;

        this.$messagebox.confirm(content, title, msgOptions).then(action => {
          if(action === 'confirm' && id) {
            this.deleteSubmission(+id);
          }
        });

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

    },
    mounted() {
    },
    beforeDestroy() {
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
      max-width: 80%;
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
    $ 我的投稿列表
  \*------------------*/


  .submission-mine {
    flex: 1;
    width: 100%;
    padding: 0 0 0.4rem 0.4rem;

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
          width: 1.2rem;
          text-align: left;
          color: #000000;

          .date-time {
            color: #000;
          }
        }

        .item-content {
          flex: 1;
          text-align: justify;

          word-break: break-all;
          word-break: break-word;

          color: #333333;

          .item-image {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            display: block;
            width: 1.6rem;
            max-width: 100%;
            max-height: 7.04rem;
          }
        }

        .image__wrap {
          position: relative;
          margin-top: 0.133333rem;
          width: 1.6rem;
          height: 1.6rem;

          border-radius: 0.106667rem;
          overflow: hidden;
        }

      }

    }
  }

  .item__right {
    flex: 1;

    display: flex;
    align-items: flex-start;
    justify-content: space-between;

    padding-right: 0.4rem;
    padding-bottom: 0.4rem;

    border-bottom: 1px solid #eee;
  }


  .content__wrap {
    position: relative;
  }

  .content__expand {
    position: relative;
    text-align: right;
  }

  .item--more {
    position: relative;
    bottom: 0.2rem;
    padding-left: 0.4rem;
  }

  .video__preview video {
    background: #000;
  }


</style>
<style >
  .mint-actionsheet {
    background: #eee !important;
  }

  .mint-actionsheet-listitem,
  .mint-actionsheet-button {
    height: 1.2rem !important;
    line-height: 1.2rem !important;
    font-size: 0.48rem !important;
  }

</style>





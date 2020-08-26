/*
 * @page：大屏调整 学生接收器分享投稿详情
 * @author: chenzhou
 * @update: 2017.8.23
 * @desc
 *
 */

<template>
  <section class="submission__detail box-center">
    <div class="submission-wrapper">
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
  import { mapState, mapActions } from 'vuex'

  import API from '@/util/api'
  import groupList from '@/components/common/groupMembers/group-list.vue'
  import imgGroup from '@/components/common/groupMembers/img-group.vue'

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
        rate: 1,
        curGroupInfo: null,

      };
    },
    components: {
      groupList,
      imgGroup
    },
    computed: {
      // 使用对象展开运算符将 getter 混入 computed 对象中
      ...mapState([
        'lesson',
        'cards',
      ]),
    },
    watch: {
      '$route' (to, from) {
        if(to && to.params && to.name === 'submission-detail') {
          let params = to.params;
          this.index = params.index

          setTimeout(()=>{
            let cards = this.cards;
            this.summary = cards[this.index];

            if(this.summary) {
              this.getSubmission(this.summary.postid);
            }
          }, 500)
        }
      },
    },
    filters: {
      formatTime(time, format) {
        return window.moment && moment(time).format(format || 'YYYY-MM-DD HH:mm');
      },
      setStyle(video) {
        let width = 200;
        let height = width/video.width * video.height;
        let sCss = `width: ${width}px; height: ${height}px;`;

        return sCss;
      }
    },
    mixins: [],
    methods: {
      /*
       * @method 获取主观题分数
       * @param
       */
      getSubmission(tougaoId) {
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
          console.log('getSubmission:', error);
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

      let cards = this.cards;
      this.summary = cards[this.index];

      if(this.summary) {
        this.getSubmission(this.summary.postid);
      } else {
        // this.$router.back();
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
    position: relative;
    width: 100%;
    height: 100%;

    overflow: hidden;
    -webkit-backface-visibility: hidden;
  }

  .submission-wrapper {
    display: flex;
    flex-direction: column;
    width: 375px;
    height: 100%;
    // height: 667px;

    background: #fff;
    border: 2px solid #eee;
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

    padding: 40px 17px 20px;
    color: #333333;

    .item-avatar {
      width: 38px;
      color: #000000;

      img {
        display: block;
        width: 38px;
        height: 38px;
      }
    }

    .item-content {
      flex: 1;
      padding-left: 19px;
      text-align: justify;

      word-break: break-all;
      color: #333333;

      .user-name {
        color: #4975B5;
      }

      .item-image {
        margin-top: 7px;
        display: block;
        width: 100%;
      }

      .date-time {
        padding-top: 15px;
        color: #666666;
      }
    }

  }

  .video__preview video {
    background: #000;
  }
</style>

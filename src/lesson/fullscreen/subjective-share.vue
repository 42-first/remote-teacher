/*
 * @page：学生接收器分享主观题答案
 * @author: chenzhou
 * @update: 2017.12.04
 * @desc
 *
 */

<template>
  <section class="submission__detail box-center">
    <div class="submission-wrapper">
      <div class="submission__inner">
      <div class="submission__item">
        <!-- 投稿时间 -->
        <div class="item-avatar" v-if="avatar">
          <img class="" :src="avatar" alt="" />
        </div>

        <!-- 投稿内容 -->
        <div class="item-content">
          <p class="user-name f15" v-if="name">{{ name }}</p>
          <p class="f15" v-if="result.subj_result && result.subj_result.content">{{ result.subj_result.content }}</p>
          <img v-if="result.subj_result && result.subj_result.pics && result.subj_result.pics.length" class="item-image" @load="handlelaodImg" @click="handleScaleImage" :src="result.subj_result.pics[0].thumb" :data-src="result.subj_result.pics[0].pic" alt="" />
          <p class="date-time f15">{{ result.create_time|formatTime('HH:mm') }}</p>
        </div>
      </div>
      </div>
    </div>
  </section>
</template>
<script>
  import { mapState, mapActions } from 'vuex'

  import API from '@/util/api'

  export default {
    name: 'subjective-share-page',
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
        teamAvatar: 'https://qn-sfe.yuketang.cn/o_1cfcr67hc3l11c0a1cit11beav89.png',
      };
    },
    components: {
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
        if(to && to.params && to.name === 'subjective-share') {
          let params = to.params;
          this.index = params.index

          setTimeout(()=>{
            let cards = this.cards;
            this.summary = cards[this.index];

            if(this.summary) {
              this.getSubjective(this.summary.spid);
            }
          }, 500)
        }
      },
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
        let URL = API.student.GET_SUBJECTIVE;
        let param = {
          'lesson_id': this.lessonID,
          'problem_result_id': spid
        };

        return request.get(URL, param)
          .then((res) => {
            if(res && res.data) {
              let data = res.data;

              this.result = data;

              // 是否匿名
              let anon = this.summary.anon;

              if(anon) {
                this.avatar = 'https://qn-sfe.yuketang.cn/o_1cvff7vi9p781opp1c0r1ot9o1n9.jpg';
                this.name = this.$i18n.t('anonymous2') || '匿名';
              } else {
                if(data.group_answer) {
                  this.name = data.team_name;
                  // 后面使用小组头像 暂时使用个人头像
                  this.avatar = this.teamAvatar;
                } else {
                  this.name = data.users[0].user_name;
                  this.avatar = data.users[0].user_avatar;
                }
              }

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

      let cards = this.cards;
      this.summary = cards[this.index];
      this.lessonID = this.lesson.lessonID;

      if(this.summary) {
        this.getSubjective(this.summary.spid);
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

<style lang="scss">
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
    // height: 667px;
    height: 100%;

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
        // width: 180px;
        width: 100%;
      }

      .date-time {
        padding-top: 15px;
        color: #666666;
      }
    }

  }
</style>

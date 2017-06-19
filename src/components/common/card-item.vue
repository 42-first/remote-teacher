/*
 * 学生接收器 timeline item
 * @author: chenzhou
 * @update: 2017.5.31
 */

<template>
  <!--  -->
  <section class="timeline-item" v-if="item">

    <!-- type : 1消息 2ppt 3习题 4试卷 5红包 -->
    <template v-if="item.type==1"><div class="timeline__msg f15">{{ item.message }}</div></template>
    <!-- ppt模板 -->
    <template v-else-if="item.type==2">
      <div class="timeline__ppt" v-show="tabindex==1 || tabindex==item.type && !item.isRepeat">
        <span class="ppt--pageno f14" :data-language-complex='{"key":"pageIndex","values":[item.pageIndex]}'>第{{ item.pageIndex }}页</span>
        <div class="ppt__cover--wrapper" :style="{ height: (10 - 0.906667)/item.rate + 'rem' }">
          <img class="cover" :src="item.src" @click="scaleImage(item.src, item.Width, item.Height)">
        </div>
        <div class="ppt-footer">
          <p class="ppt__time f16">{{ item.time|getTimeago }}</p>
          <div class="ppt__opt f15" v-show="!observerMode">
            <p :class="['ppt--action', item.hasQuestion ? 'selected' : '']" @click="handleTag(1, item.slideID, item.presentationid)" data-language-key="student.ppt.unknow">不懂</p>
            <p :class="['ppt--action', item.hasStore ? 'selected' : '']" @click="handleTag(2, item.slideID, item.presentationid)" data-language-key="student.ppt.store">收藏</p>
          </div>
        </div>
      </div>
    </template>
    <!-- 试卷模板 -->
    <template v-else-if="item.type==4">
      <div class="timeline__paper">
        <div class="">
          <a :class="['paper-info', item.isComplete ? 'complete' : '']" :href="item.href" :data-quizid="item.quizid">
            <div class="paper-txt f18">
              <p class="paper-name">{{ item.papername }}</p>
              <p class="paper-count" :data-language-complex='{"key":"quizCount","values":[item.count]}'>共{{ item.count }}题</p>
            </div>
            <div class="">
              <img class="paper-icon" src="http://sfe.ykt.io/o_1bhjoe1sn1vhc1ltcu4o16pk344e.png">
            </div>
          </a>
        </div>
        <div class="item-footer">
          <p class="f16" :data-time="item.time">{{ item.time|getTimeago }}</p>
          <div class="f14">
            <span class="status" data-language-common="status">{{ item.status }}</span>
          </div>
        </div>
      </div>
    </template>
    <!-- 红包模板 -->
    <template v-else-if="item.type==5">
      <div class="timeline__paper">
        <router-link :to="'/'+lessonid+'/hongbao/'+index">
        <div :class="['paper-info', 'hongbao']">
            <div class="paper-txt f18">
              <p class="paper-name">{{ item.caption }}</p>
            </div>
            <div class="">
              <!--  http://sfe.ykt.io/o_1bhhfttettbskmu8u61vd91plse.png -->
              <img class="paper-icon" src="http://sfe.ykt.io/o_1bhjob08v13oh1qu29uh1hlc1d8l9.png">
            </div>
        </div>
        </router-link>
        <div class="item-footer">
          <p class="f16" :data-time="item.time">{{ item.time|getTimeago }}</p>
        </div>
      </div>
    </template>
    <!-- 习题模板 -->
    <template v-else-if="item.type==3">
     <div class="timeline__paper">
        <router-link :class="['paper-info', 'xt', item.isComplete ? 'complete' : '']" :to="'/'+lessonid+'/exercise/'+index">
            <div class="paper-txt f18">
              <p class="paper-name">{{ item.caption }}</p>
              <p class="paper-count" :data-language-complex='{"key":"problemIndex","values":[item.pageIndex]}'>第{{ item.pageIndex }}题</p>
            </div>
            <div class="">
              <img class="paper-icon" src="http://sfe.ykt.io/o_1bhjoe5h81cp41vadqbl6aidb8j.png">
            </div>
        </router-link>
        <div class="item-footer">
          <p class="f16" :data-time="item.time">{{ item.time|getTimeago }}</p>
          <div class="f14">
            <span class="status" data-language-common="status">{{ item.status }}</span>
          </div>
        </div>
      </div>
    </template>

  </section>

</template>
<script>
  import API from '@/util/Api'
  import timeago from 'timeago.js';

  // 在这里设置相对时间
  // var timeagoInstance = timeago(null, new Date());
  var timeagoInstance = timeago();

  export default {
    name: 'card-item',
    props: {
      tabindex: 1,
      index: 0,
      lessonid: 0,
      item: null
    },
    data() {
      return {
      };
    },
    watch: {
    },
    computed: {
    },
    filters: {
      getTimeago(time) {
        return timeagoInstance.format(time - 10000, language.options['lang'] === 'en' ? 'en': 'zh_CN');
      }
    },
    methods: {
      scaleImage(src, width, height) {
        let targetEl = event.target;
        let pswpElement = document.querySelector('.J_pswp');
        let index = 0;
        let items = [];

        // build items array
        let cards = this.$parent.$parent.cards;

        cards.map((card)=>{
          if(card.type === 2) {
            items.unshift({ src: card.src, w: card.Width || 750, h: card.Height || 520 });
          }
        })

        items.forEach((item, i)=>{
          if(item.src === src) {
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
      * @method ppt不懂,收藏
      * tag 1 不懂 2 收藏
      */
      handleTag(tag, slideID, presentationid) {
        let self = this;
        let URL = API.student.SET_LEESON_SILDE_TAG;
        let cards = this.$parent.$parent.cards;

        let ppts = cards.filter((card, index)=>{
          return card.slideID === slideID && card.presentationid === presentationid
        })

        // 确实是否不懂
        let tagType = ppts.length && ppts[0].hasQuestion ? 'cancel' : 'add';
        // 是否收藏
        if(tag === 2) {
          tagType = ppts.length && ppts[0].hasStore ? 'cancel' : 'add';
        }

        let param = {
          'tag': tag,
          'lessonSlideID': slideID,
          'tagType': tagType
        }

        return request.post(URL, param).
          then(function (res) {
            if(res) {
              if (res.msg === '标记已存在,不能反复提交' || res.msg === '标记不存在') {
                return;
              }

              ppts.forEach( (element, index) => {
                tag === 1 && (element.hasQuestion = !element.hasQuestion);
                tag === 2 && (element.hasStore = !element.hasStore);
              });

              return res;
            }
          });
      }
    },
    created() {
      let cards = this.$parent.$parent.cards;

      // 观看者
      this.observerMode = this.$parent.$parent.observerMode;

      // 时间动态显示 每分钟更新一次
      setInterval(() => {
        cards.forEach((item) => {
          item.time = item.time - 1;
        })
      }, 60000)
    },
    mounted() {
      let self = this;
    },
    beforeDestroy() {
    }
  };
</script>

<style lang="scss">

  .timeline-item {
    margin: 0 auto;
    width: calc(100% - 0.906667rem);
    border-bottom: 1px solid #C8C8C8;

    a {text-decoration: none;}
  }


  /*--------------------*\
    $ common
  \*--------------------*/

  .item-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  /*--------------------*\
    $ event消息
  \*--------------------*/

  .timeline__msg {
    margin: 0.4rem auto;
    display: inline-block;
    padding: 0 0.4rem;
    max-width: 14rem;
    height: 0.8rem;
    line-height: 0.8rem;

    text-align: center;
    color: #fff;
    background: rgba(155, 155, 155, 0.75);

    border-radius: 0.4rem/50%;
  }



  /*--------------------*\
    $ ppt模板
  \*--------------------*/


  .timeline__ppt {
    position: relative;
    margin: 0.266667rem auto 0.4rem;
    width: 100%;

    .ppt__cover--wrapper {
      margin: 0 auto 0.32rem;
      width: 100%;

      border: 1px solid #C8C8C8;
      overflow: hidden;

      .cover {
        display: block;
        width: 100%;
      }
    }

    .ppt--pageno {
      position: absolute;
      top: 0;
      right: 0;

      padding: 6px 14px;
      color: #fff;
      background: rgba(37,37,37, 0.6);
    }

    .ppt-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;

      .ppt__opt {
        display: flex;
        align-items: center;
        justify-content: space-between;

        .ppt--action {
          margin-left: 0.266667rem;
          display: inline-block;
          padding: 0 0.266667rem;
          /* width: 1.6rem; */
          height: 0.666667rem;

          color: #639EF4;
          border: 1px solid #639EF4;
          border-radius: 0.333333rem/50%;
        }

        .selected {
          color: #fff;
          background: #639EF4;
        }
      }
    }

  }



  /*--------------------*\
    $ 试卷模板
  \*--------------------*/


  .timeline__paper {
    margin: 0.4rem auto;

    .paper-info {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: space-between;

      margin-bottom: 0.266667rem;
      padding: 0.28rem 0.586667rem 0.32rem 0.4rem;

      color: #FFFFFF;
      background: rgba(40,207,110,0.7);

      border-radius: 4px;

      .paper-txt {
        text-align: left;
      }
    }

    .paper-info.xt {
      background: rgba(99,158,244,0.7);
    }

    .paper-info.hongbao {
      color: #FFE595;
      background: #e64340;
    }

    .paper-info.complete,
    .paper-info.xt.complete {
      background: #C8C8C8;
    }

    .paper-icon {
      display: block;
      width: 1.386667rem;
      min-height: 1.546667rem
    }
  }


</style>










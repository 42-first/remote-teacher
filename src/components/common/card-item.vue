/*
 * 学生接收器 timeline item
 * @author: chenzhou
 * @update: 2017.5.31
 */

<template>
  <!--  -->
  <section class="timeline-item" v-if="item">

    <!-- type : 1消息 2ppt 3习题 4试卷 5红包 8分组 10截图分享 11白板分享 12白板绘制 -->
    <template v-if="item.type==1"><div class="timeline__msg f15">{{ item.message }}</div></template>
    <!-- ppt模板 -->
    <template v-else-if="item.type==2">
      <div class="timeline__ppt" v-show="tabindex==1 || tabindex==item.type && !item.isRepeat">
        <span class="ppt--pageno f14" >{{ $t('pno', { number: item.pageIndex }) }}</span>
        <div class="ppt__cover--wrapper" :style="{ minHeight: (10 - 0.906667)/item.rate + 'rem' }">
          <img class="cover" :src="item.src" @click="scaleImage(item.src, item.Width, item.Height, $event)">
        </div>
        <div class="ppt-footer">
          <p class="ppt__time f16">{{ item.time|getTimeago }}</p>
          <div class="ppt__opt f15" v-show="!observerMode">
            <p :class="['ppt--action', item.hasQuestion ? 'selected' : '']" @click="handleTag(1, item.slideID, item.presentationid)">{{ $t('unknown') }}</p>
            <p :class="['ppt--action', item.hasStore ? 'selected' : '']" @click="handleTag(2, item.slideID, item.presentationid)">{{ $t('favorite') }}</p>
          </div>
        </div>
        <!-- 动画蒙版 -->
        <div class="ppt__modal" v-show="item.animation === 1">
          <div class="modal__center">
            <p class="f24"><!-- 当前页面有动画 -->{{ $t('animatepage') }}</p>
            <p class="f32"><!-- 请先听老师讲解 -->{{ $t('listenfirst') }}</p>
          </div>
        </div>
      </div>
    </template>
    <!-- 截图分享 白板分享 -->
    <template v-else-if="item.type==10 || item.type==11">
      <div class="timeline__ppt">
        <span class="ppt--pageno z1 f14"><!-- 截图分享 -->{{ item.type === 10 ? $t('screenshot') : $t('blackboard') }}</span>
        <div class="ppt__cover--wrapper screenshot" :style="{ minHeight: (10 - 0.906667)/item.rate + 'rem' }">
          <img class="screenshot--image" :src="item.src" @click="scaleImage(item.src, item.Width, item.Height, $event)" alt="雨课堂,截图分享" />
        </div>
        <div class="ppt-footer">
          <p class="ppt__time f16">{{ item.time|getTimeago }}</p>
        </div>
      </div>
    </template>
    <!-- 试卷模板 -->
    <template v-else-if="item.type==4">
      <div class="timeline__paper">
        <div class="">
          <div :class="['paper-info', item.isComplete ? 'complete' : '']" :data-quizid="item.quizid" @click="gotoQuiz(item.href)">
            <div class="paper-txt f18">
              <p class="paper-name">{{ item.papername }}</p>
              <p class="paper-count">{{ $t('totalprob', { number: item.count }) }}</p>
            </div>
            <i class="iconfont icon-shiti_shijuan f55"></i>
          </div>
        </div>
        <div class="item-footer">
          <p class="f16" :data-time="item.time">{{ item.time|getTimeago }}</p>
          <div class="f14" v-show="!observerMode">
            <span class="status">{{ item.status }}</span>
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
              <p class="paper-name" data-language-complex="gainbonus" :data-number="item.length" v-if="item.length">{{ $t('gainbonus', { number: item.length }) }}</p>
              <p class="paper-name" data-language-key="recvbonus" v-else >{{ $t('recvbonus') }}</p>
            </div>
            <i class="iconfont icon-shiti_hongbao f55"></i>
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
        <!-- 作答链接 -->
        <router-link :class="['paper-info', 'xt', item.isComplete ? 'complete' : '']" :to="item.pageURL+index" >
            <div class="paper-txt f18">
              <p class="paper-name">{{ item.caption }}</p>
              <p class="paper-count">{{ $t('pno', { number: item.pageIndex }) }}</p>
            </div>
            <i class="iconfont icon-ykq_shiti f55"></i>
        </router-link>
        <div class="item-footer">
          <p class="f16" :data-time="item.time">{{ item.time|getTimeago }}</p>
          <div class="f14" v-show="!observerMode">
            <span class="status">{{ item.status }}</span>
          </div>
        </div>
      </div>
    </template>
    <!-- 投稿分享 -->
    <template v-else-if="item.type==6">
      <div class="timeline__paper">
        <router-link class="paper-info submission" :to="'/'+lessonid+'/submission2/'+index">
          <div class="paper-txt f18">
            <p class="paper-name"><!-- Hi, 老师正在分享课堂投稿 -->{{ $t('sharepostpush') }}</p>
          </div>
          <i class="iconfont icon-ykq_tab_tougao f50"></i>
        </router-link>
        <div class="item-footer">
          <p class="f16" :data-time="item.time">{{ item.time|getTimeago }}</p>
          <div class="f14">
          </div>
        </div>
      </div>
    </template>
    <!-- 主观题答案分享 -->
    <template v-else-if="item.type==7">
      <div class="timeline__paper">
        <router-link class="paper-info submission" :to="'/'+lessonid+'/subjective_share/'+index">
          <div class="paper-txt f18">
            <p class="paper-name"><!-- Hi, 老师正在分享主观题答案 -->{{ $t('sharesubjective') }}</p>
          </div>
          <i class="iconfont icon-ykq_shiti f50"></i>
        </router-link>
        <div class="item-footer">
          <p class="f16">{{ item.time|getTimeago }}</p>
          <div class="f14"></div>
        </div>
      </div>
    </template>
    <!-- 发起了分组 -->
    <template v-else-if="item.type==8">
      <div class="timeline__paper">
        <a :class="['paper-info', 'fenzu', item.isComplete ? 'complete' : '']" :href="item.href" @click="handlecanJoin" >
          <div class="paper-txt f18" v-if="item.groupType ==='random'">
            <p class="paper-name"><!-- Hi，老师进行了随机分组 -->{{ $t('team.randomized') }}</p>
            <p class="paper-name"><!-- 查看结果 -->{{ $t('team.viewresults') }}</p>
          </div>
          <div class="paper-txt f18" v-else-if="item.groupType ==='free'">
            <p class="paper-name"><!-- Hi，老师进行了自由分组 -->{{ $t('team.freegrouping') }}</p>
            <p class="paper-name"><!-- 输入口令 -->{{ $t('team.enterpassword') }}</p>
          </div>
          <i class="iconfont icon-fenzu f50"></i>
        </a>
        <div class="item-footer">
          <p class="f16">{{ item.time|getTimeago }}</p>
          <div class="f14" v-show="!observerMode">
            <span class="status">{{ item.status }}</span>
          </div>
        </div>
      </div>
    </template>
    <!-- 发起了互评 -->
    <template v-else-if="item.type==9">
      <div class="timeline__paper">
        <router-link :class="['paper-info', 'evaluation', item.isComplete ? 'complete' : '']" :to="'/'+lessonid+'/evaluation/'+index" >
          <div class="paper-txt f18">
            <p class="paper-name"><!-- Hi，老师发起了互评 -->{{ $t('grading.launchedgrading') }}</p>
            <p class="paper-count">{{ $t('pno', { number: item.pageIndex }) }}</p>
          </div>
          <i class="iconfont icon-huping f55"></i>
        </router-link>
        <div class="item-footer">
          <p class="f16">{{ item.time|getTimeago }}</p>
          <div class="f14" v-show="!observerMode">
            <span class="status">{{ item.status }}</span>
          </div>
        </div>
      </div>
    </template>
    <!-- 白板绘制 -->
    <template v-else-if="item.type==12">
      <div class="timeline__ppt">
        <span class="ppt--pageno f14 z1"><!-- 板书 -->{{ $t('board') }}</span>
        <!-- 白板屏幕宽高 增加自定义指令解决数据改变canvas被清空大坑 -->
        <div class="ppt__cover--wrapper" :style="{ height: (10 - 0.906667)/item.rate + 'rem' }" >
          <canvas :id="'canvas_'+item.boardid" class="board__container" :width="item.devwidth" :height="item.devheight" :style="item|scaleCanvas" v-canvas="item"></canvas>
        </div>
        <div class="ppt-footer">
          <p class="ppt__time f16">{{ item.time|getTimeago }}</p>
          <div class="ppt__opt f15" v-show="!observerMode">
            <p :class="['ppt--action', item.doubt ? 'selected' : '']" @click="handleBoardTag(1, item.boardid, item.doubt)">{{ $t('unknown') }}</p>
            <p :class="['ppt--action', item.emphasis ? 'selected' : '']" @click="handleBoardTag(2, item.boardid, item.emphasis)">{{ $t('favorite') }}</p>
          </div>
        </div>
      </div>
    </template>
    <!-- 问题解析 -->
    <template v-else-if="item.type==13">
      <div class="timeline__paper">
        <!-- 作答链接 -->
        <router-link class="paper-info xt" :to="item.pageURL+index" >
          <div class="paper-txt f18">
            <p class="paper-name">{{ item.caption }}</p>
            <p class="paper-count">{{ $t('pno', { number: item.pageIndex }) }}</p>
          </div>
          <i class="iconfont icon-ykq_shiti f55"></i>
        </router-link>
        <div class="item-footer">
          <p class="f16">{{ item.time|getTimeago }}</p>
          <div class="f14">
            <!-- <span class="status">{{ item.status }}</span> -->
          </div>
        </div>
      </div>
    </template>

  </section>

</template>
<script>
  import API from '@/util/api'
  import timeago from 'timeago.js';

  let locale = window.i18n && window.i18n.locale || 'zh_CN';
  // 在这里设置相对时间
  var timeagoInstance = timeago(null, locale);

  if (locale != 'en' && locale != 'zh_CN') {
    timeago.register(locale, require('timeago.js/locales/' + locale));
  }

  export default {
    name: 'card-item',
    props: {
      tabindex: {
        type: Number,
        default: 1
      },
      index: {
        type: Number,
        default: 0
      },
      lessonid: {
        type: String,
        default: 0
      },
      item: {
        type: Object,
        default: null
      }
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
        return timeagoInstance.format(time, window.i18n && window.i18n.locale === 'en' ? 'en': 'zh_CN');
      },
      scaleCanvas(item) {
        let scaleValue = (window.innerWidth / 10 * (10 - 0.906667)) / item.devwidth;
        return { transform: 'scale(' + scaleValue + ')' };
      }
    },
    methods: {
      scaleImage(src, width, height, evt) {
        let targetEl = typeof event !== 'undefined' && event.target || evt.target;;
        let pswpElement = document.querySelector('.J_pswp');
        let index = 0;
        let items = [];

        // build items array
        let cards = this.$parent.$parent.cards;

        // ppt 截图分享 白板分享
        cards.map((card)=>{
          if(card.type === 2 && card.animation !== 1 || card.type === 10 || card.type === 11) {
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
          // 解决消息点击问题
          // history: false,

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
        let gallery;

        if(typeof PhotoSwipe !== 'undefined') {
          gallery = new PhotoSwipe(pswpElement, PhotoSwipeUI_Default, items, options);

          gallery.init();
        } else {
          setTimeout(()=>{
            gallery = new PhotoSwipe(pswpElement, PhotoSwipeUI_Default, items, options);
            gallery.init();
          }, 1500)
        }

        this.$parent.$parent.gallery = gallery;
      },

      /*
       * @method ppt不懂,收藏
       * tag 1 不懂 2 收藏
       */
      handleTag(tag, slideID, presentationid) {
        let self = this;
        let URL = API.student.SET_LEESON_SILDE_TAG;
        let cards = this.$parent.$parent.cards;

        // fix 回放没有显示之前的操作问题
        let presentation = this.$parent.$parent.presentationMap.get(presentationid);
        let pptData = presentation && presentation['Slides'];
        let slideData = pptData && pptData[this.item.pageIndex-1];

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
          then( (res) => {
            if(res) {
              if (res.msg === '标记已存在,不能反复提交' || res.msg === '标记不存在') {
                return;
              }

              ppts.forEach( (element, index) => {
                tag === 1 && (element.hasQuestion = !element.hasQuestion);
                tag === 2 && (element.hasStore = !element.hasStore);
              });

              tag === 1 && (slideData['question'] = ppts.length && ppts[0].hasQuestion ? 1 : 0);
              tag === 2 && (slideData['store'] = ppts.length && ppts[0].hasStore ? 1 : 0);

              return res;
            }
          });
      },

      /*
       * @method 白板不懂,收藏
       * boardid 白板ID tag 1 不懂 2 收藏
       */
      handleBoardTag(tag, boardid, value) {
        let URL = API.student.SET_BOARD_TAG;
        let params = {
          'lesson_id': this.lessonid,
          'sharing_file_id': boardid,
          'tag': tag,
          'tag_type': value ? 'cancel' : 'add'
        };
        let cards = this.$parent.$parent.cards;
        let boardMap = this.$parent.$parent.boardMap;

        // 同步白板信息 更新cards信息
        let boardInfo = cards.find((card, index)=>{
          return card.boardid === boardid;
        })

        request.post(URL, params).
        then( (res) => {
          if(res && res.success) {
            tag === 1 && (boardInfo.doubt = !boardInfo.doubt);
            tag === 2 && (boardInfo.emphasis = !boardInfo.emphasis);

            boardMap.set(boardid, boardInfo);
          }
        });
      },

      /*
      * @method 是否可以加入小组
      */
      handlecanJoin(evt) {
        if(this.observerMode) {
          evt.preventDefault();
          evt.stopPropagation();

          this.$toast({
            message: this.$i18n.t('cantintoteam') || '当前是协同教师身份，不参与分组',
            duration: 3000
          });

          return false;
        }

        return true;
      },
      /**
       * @method 进入试卷
      */
      gotoQuiz(url){
        if(this.observerMode){
          this.$toast({
            message: this.$i18n.t('watchmode2'),
            duration: 3000
          })
        }else {
          location.href = url
        }
      }
    },
    created() {
      // 观看者
      this.observerMode = this.$parent.$parent.observerMode;
    },
    mounted() {
    },
    beforeDestroy() {
    }
  };
</script>

<style lang="scss">

  .z1 {
    z-index: 1;
  }

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
    max-width: 9.2rem;
    height: 0.8rem;
    line-height: 0.8rem;

    text-align: center;
    color: #fff;
    background: #C1C1C1;

    border-radius: 4px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
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
      // z-index: 1;
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
          line-height: 0.666667rem;

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

    .ppt__modal {
      position: absolute;
      top: 0;
      bottom: 0.933334rem;
      left: 0;
      right: 0;

      text-align: center;

      background: rgba(0,0,0,0.95);
      box-shadow: 0 0 0.053333rem rgba(0,0,0,0.2);

      .modal__center {
        position: absolute;
        top: 50%;
        left: 50%;
        width: 8rem;
        transform: translate(-50%, -50%);
        color: #fff;
      }
    }

  }


  .screenshot {
    position: relative;
    background: #f8f8f8;
  }

  .screenshot--image {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);

    max-width: 100%;
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
      padding: .26rem .25rem .3rem .4rem;

      color: #fff;
      background: rgba(40,207,110,0.7);

      border-radius: 4px;

      .paper-txt {
        text-align: left;
        .paper-name {
          width: 6.95rem;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
        }
      }
    }

    .paper-info.xt {
      background: rgba(99,158,244,0.7);
    }

    .paper-info.submission {
      background: rgba(245,166,35,0.7);
    }

    .paper-info.hongbao {
      color: #FFE595;
      background: #e64340;
    }

    .paper-info.fenzu {
      background: #71D2A5;
    }


    .paper-info.evaluation {
      background: rgba(239,175,79,0.7);
    }

    .paper-info.complete,
    .paper-info.xt.complete,
    .paper-info.submission.complete,
    .paper-info.evaluation.complete {
      background: #C8C8C8;
    }

    .paper-icon {
      display: block;
      width: 1.386667rem;
      min-height: 1.546667rem
    }

    .iconfont {
      line-height: 1.546667rem
    }
  }

  .board__container {
    transform-origin: 0 0;
    transform: scale(0.5);
  }


</style>










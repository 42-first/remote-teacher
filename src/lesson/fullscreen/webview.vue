/*
 * @page：web上课 暂时没有的类型跳转到H5地址
 * @author: chenzhou
 * @update: 2020.3.1
 * @desc
 *
 */


<template>
  <section class="lesson__ppt">
    <!-- 内容区 -->
    <div class="cover__container box-center">
      <iframe v-if="!inspectorMode" class="webview" id="webview" :src="src" allowFullScreen></iframe>
      <div class="tips-box" v-else>
        <img src="~images/fullscreen/nopermission.png" />
        <p class="f14">{{ $t('inspectornotsupport') }}</p>
      </div>
    </div>
  </section>

</template>

<script>
import { mapState, mapActions } from 'vuex'
import $ from 'jquery'


export default {
  name: "lesson-webview",
  data() {
    return {
      index: 0,
      slide: null,
      src: '',
    };
  },
  computed: {
    // 使用对象展开运算符将 getter 混入 computed 对象中
    ...mapState([
      'lesson',
      'cards',
      'inspectorMode',
    ]),
  },
  mixins: [ ],
  created() {
    // this.index = +this.$route.params.index;
  },
  mounted() {
    this.index = +this.$route.params.index;
    this.initPubSub()
    let slide = this.cards[this.index];
    this.slide = slide;
    this.init(slide)

    window.addEventListener('message', this.handlePostMessage)
  },
  updated() {},
  beforeDestroy() {
    window.removeEventListener('message', this.handlePostMessage)
  },
  filters: {
  },
  watch: {
    '$route' (to, from) {
      if(to && to.params && to.name === 'webview') {
        let params = to.params;
        this.index = params.index
      }
    },
    index(newVal, oldVal) {
      let slide = this.cards[this.index];
      this.slide = slide;

      this.init(slide);
    },
    cards(newVal, oldVal) {
      if(!oldVal.length) {
        let slide = newVal[this.index];
        this.slide = slide;
        this.init(slide)  
      }
    }
  },
  methods: {
    ...mapActions([
      'setSlide',
      'setCards'
    ]),

    /**
     * @method 页面初始化
     * @params
     */
    init(slide) {
      if(slide && slide.type) {
        switch (slide.type) {
          // 试卷
          case 4:
            this.src = slide.href;

            setTimeout(()=>{
              let webviewEl = document.getElementById('webview').contentWindow;
              $(webviewEl).click((evt) => {
                webviewEl.$ && webviewEl.$(evt.target).trigger('tap')
              })
            }, 1500)

            break;

          // 发起了分组
          // 指令任务
          case 8:
          case 14:
          case 15:
            this.src = slide.href;
            break;

          // 白板
          case 12:
            this.src = `/lesson/student/${this.lesson.lessonID}`;
            break;

          default:
            break;
        }

      }
    },

    initPubSub(){
      let self = this
      window.PubSub.subscribe('finish', function(topic, data){
        let type = self.slide && self.slide.type
        switch(type){
          case 4:
            let quizObj = {
              status: self.$i18n.t('done'),
              isComplete: true
            }
            self.slide = Object.assign({}, self.slide, quizObj)
            self.cards.splice(self.index, 1, self.slide)

            self.setCards(self.cards)
            break;
            break;
          case 8:
            let teamObj = {
              status: self.$i18n.t('done'),
              href: `/team/studentteam/${data.teamid}?lessonid=${self.lesson.lessonID}`,
              isComplete: true
            }
            self.slide = Object.assign({}, self.slide, teamObj)
            self.cards.splice(self.index, 1, self.slide)

            self.setCards(self.cards)
            break;
        }
      })
    },

    handlePostMessage(e) {
      let data = e.data
      if(data.op == 'webviewSendLesson') {
        let type = this.slide && this.slide.type
        switch(type){
          case 14:
          case 15:
            let taskObj = {
              status: this.$i18n.t('started') || '已启动'
            }
            this.slide = Object.assign({}, this.slide, taskObj)
            this.cards.splice(this.index, 1, this.slide)

            this.setCards(this.cards)
            break;
        }
      }
    }

  }
};
</script>

<style lang="scss" scoped>
  .lesson__ppt {
    position: relative;
    width: 100%;
    height: 100%;

    background: #fff;
  }

  .cover__container {
    width: 100%;
    height: 100%;
  }

  .webview {
    width: 375px;
    height: 100%;
    box-shadow: 1px 1px 5px #999;
  }

  .tips-box {
    width: 280px;
    height: 240px;
    color: #90949D;
    padding-top: 168px;
    position: relative;

    img {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      // height: 100%;
    }
  }

</style>

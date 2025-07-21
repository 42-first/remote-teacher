<template>
  <section class="lecture_note__modal">
    <section class="lecture__container">
      <div class="header box-between">
        <div class="f17 bold"><!--课堂讲稿-->{{ $t('lectureNote') }}</div>
        <div class="actions-wrap box-center">
          <div class="translate" :class="translated ? 'blue' : ''" v-if="hasTranslateNote" @click="handleTranslate">
            <i class="iconfont icon-zhongying f20"></i>
          </div>
          <div class="close" @click="$emit('close')">
            <i class="iconfont icon-guanbi1 f20"></i>
          </div>
        </div>
      </div>
      <div
        v-if="lectureNotes.length"
        class="note__list"
        @scroll="handleScroll"
      >
        <div class="note__item" :id="`note${item.id}`" v-for="(item, index) in lectureNotes" :key="index">
          <div class="time f13">
            <div class="bgwhite">{{item.createTime | formatTime}}</div>
            <div class="last-view" v-if="lastView == item.createTime">
              <div class="text">上次学到</div>
            </div>
          </div>
          <div class="text f16">{{item.content}}</div>
        </div>
      </div>
      <div class="empty" v-else>
        <img src="https://fe-static-yuketang.yuketang.cn/fe/static/assets/remote/empty.png" alt="">
      </div>
    </section>
  </section>


</template>

<script>
 import _ from 'underscore'
  export default {
    data() {
      return {
        lectureNotes: [],
        scrollId: '',
        direction: 0,
        time: 0,
        deltaY: 0,
        hasNext: false,
        hasPrev: false,
        lastScrollTop: 0,
        isPending: false,
        lastView: 0
      }
    },

    watch: {
      scrollId(newVal) {
        let noteEl = this.$el.querySelector(`#${newVal}`);

        setTimeout(()=>{
          noteEl && noteEl.scrollIntoView({ behavior: "instant", block: 'center' });
        }, 0)
      },

      translated(newVal) {
        this.lectureNotes = []
        this.fetchLectureNotes()
      }
    },

    props: {
      pptTime: {
        type: Number,
        default: 0
      },
      translated: {
        type: Boolean,
        default: false
      },
      hasTranslateNote: {
        type: Boolean,
        default: false
      }
    },
    filters: {
      formatTime(time) {
        let dt = new Date(time);
        let sTime = dt.getHours() + ':' + dt.getMinutes();

        return typeof moment !== 'undefined' && moment(time).format('HH:mm') || sTime;
      }
    },  
    mounted() {
      if(this.pptTime) {
        this.time = this.pptTime
      }
      this.fetchLectureNotes(true)

      // 下拉加载更多
      this.scrollThrottled = _.throttle(evt => {
        let $list = evt.target
        let clientHeight = $list.clientHeight;
        let totalHeight = $list.scrollHeight;
        let scrollTop = $list && $list.scrollTop;
        let leaveHeight = totalHeight - clientHeight - scrollTop;

        if(scrollTop > this.lastScrollTop) {
          console.log('向下滚动')
          // 向下滚动
          if(leaveHeight < 150 && this.hasNext) {
            this.time = this.lectureNotes[this.lectureNotes.length - 1].createTime
            this.direction = 1

            this.fetchLectureNotes()
          }
        } else {
          console.log('向上滚动')
          if(scrollTop < 100 && this.hasPrev) {
           
            this.time = this.lectureNotes[0].createTime
            this.direction = -1

            this.fetchLectureNotes()
          }
        }

        this.lastView = 0

        this.lastScrollTop = scrollTop

      }, 100);
    },

    methods: {
      /**
       * @method 获取讲稿
       */
      fetchLectureNotes(isInit) {
        if(this.isPending) return

        this.isPending = true
        let URL = API.lesson.get_records
        let params = {
          time: this.lastView || this.time,
          direction: this.direction,
          translate: this.translated ? 1 : 0
        }

        return request.get(URL, params).then(res => {
          if(res && res.code == 0 && res.data) {
            let list = []
            if(this.direction == 0) {
              list = res.data.records.list
            } else if(this.direction == -1) {
              list = res.data.records.list.concat(this.lectureNotes)
            } else {
              list = this.lectureNotes.concat(res.data.records.list)
            }
            this.lectureNotes = [...list]
            this.hasNext = res.data.records.hasNext
            this.hasPrev = res.data.records.hasPrev
            if(isInit || this.direction == -1) {
              this.$nextTick(() => {
                let item = this.time && this.lectureNotes.find(item => item.createTime >= this.time) || this.lectureNotes[this.lectureNotes.length -1]
                this.scrollId = item && `note${item.id}` || ''
              })
            }
            
            this.isPending = false;
          }
        })
      },

      handleScroll(e) {
        this.scrollThrottled(e)
      },

      handleTranslate() {
        let wrapBounds = document.querySelector('.note__list') && document.querySelector('.note__list').getBoundingClientRect()

        for(let i = 0; i < this.lectureNotes.length; i++) {
          let item = this.lectureNotes[i]
          let el = document.querySelector(`#note${item.id}`).getBoundingClientRect()
          if(el.top >= wrapBounds.top && el.bottom <= wrapBounds.bottom) {
            this.lastView = item.createTime
            break
          }

        }

        this.$emit('translate')
      }
    }
  }
</script>

<style lang="scss" scoped>
.lecture_note__modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 9999999;
  background: rgba(17, 19, 24, 0.4);
  text-align: left;
  -webkit-overflow-scrolling: touch;

  .lecture__container {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100vw;
    max-height: calc(100vh - 1.36rem); 
    min-height: 60vh;  
    background: #fff;
    border-radius: 12px 12px 0 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;

    .header {
      width: 100%;
      height: 1.4933rem;
      border-bottom: 1px solid rgba(45, 74, 148, 0.07);
      padding: 0 0.4267rem;
      box-sizing: border-box;
      min-height: 1.4933rem;

      .close {
        color: #90949D;
      }
      
      .translate {
        margin-right: 0.4267rem;
        color: #90949D;

        &.blue {
          color: #3D7BFF;
        }
      }
    }

    .note__list {
      padding: 0.2133rem 0.32rem;
      color: #90949D;
      box-sizing: border-box;
      max-height: calc(100% - 1.4933rem);
      overflow: auto;

      .note__item {
        padding: 0 0.2133rem;
        box-sizing: border-box;
        margin-bottom: 0.4267rem;
        .time {
          line-height: 0.48rem;
          position: relative;

          .bgwhite {
            padding: 0.08rem 0.2133rem;
            background: #fff;
            z-index: 1;
            position: relative;
            display: inline-block;
          }

          .last-view {
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            right: 0;

            &::before {
              content: "";
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              background: #fff;
            }

            &::after {
              position: absolute;
              content: "";
              top: 50%;
              transform: translateY(-50%);
              right: -0.5333rem;
              width: 100vw;
              height: 0.0267rem;
              background: #3D7BFF4D;
            }

            .text {
              background: #ECF2FF;
              color: #3D7BFF;
              font-size: 0.2933rem;
              padding: 0.08rem 0.16rem;
              position: relative;
              z-index: 2;
              border-radius: 0.1067rem;
              margin: 0;
              line-height: 0.3733rem;
            }
          }
        }

        .text {
          margin-top: 2px;
          padding: 0.1067rem 0.2133rem;
          line-height: 0.6933rem;
        }
      }
    }

    .empty {
      height: 60vh;
      padding-top: 2.1333rem;
      display: flex;
      justify-content: center;

      img {
        width: 7.4667rem;
        height: 4.2667rem;
      }
    }
  } 
}




</style>
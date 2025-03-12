<template>
  <section class="lecture_note__modal">
    <section class="lecture__container">
      <div class="header box-between">
        <div class="f17 bold"><!--课堂讲稿-->{{ $t('lectureNote') }}</div>
        <div class="close" @click="$emit('close')">
          <i class="iconfont icon-guanbi1 f20"></i>
        </div>
      </div>
      <div
        v-if="lectureNotes.length"
        class="note__list"
        @scroll="handleScroll"
      >
        <div class="note__item" :id="`note${item.id}`" v-for="(item, index) in lectureNotes" :key="index">
          <div class="time f13">{{item.createTime | formatTime}}</div>
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
        isPending: false
      }
    },

    watch: {
      scrollId(newVal) {
        let noteEl = this.$el.querySelector(`#${newVal}`);

        setTimeout(()=>{
          noteEl && noteEl.scrollIntoView({ behavior: "instant", block: 'center' });
        }, 0)
      }
    },

    props: {
      pptTime: {
        type: Number,
        default: 0
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
          time: this.time,
          direction: this.direction
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
        }

        .text {
          margin-top: 2px;
          padding: 0.1067rem 0;
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
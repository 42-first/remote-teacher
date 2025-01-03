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
        class="note__list"
      >
        <div class="note__item" :id="`note${index}`" v-for="(item, index) in lectureNotes" :key="index">
          <div class="time f13">{{item.createTime | formatTime}}</div>
          <div class="text f16">{{item.content}}</div>
        </div>
      </div>
    </section>
  </section>


</template>

<script>
  export default {
    data() {
      return {
        lectureNotes: [],
        scrollId: ''
      }
    },

    watch: {
      scrollId(newVal) {
        let noteEl = this.$el.querySelector(`#${newVal}`);

        setTimeout(()=>{
          noteEl && noteEl.scrollIntoView({ behavior: "smooth", block: 'center' });
        }, 0)
      }
    },

    props: {
      time: {
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
      this.fetchLectureNotes()
    },

    methods: {
      /**
       * @method 获取讲稿
       */
      fetchLectureNotes() {
        let URL = API.lesson.get_records

        return request.get(URL).then(res => {
          if(res && res.code == 0 && res.data) {
            this.lectureNotes = res.data.records
            this.$nextTick(() => {
              let index = this.time && res.data.records.findIndex(item => item.createTime >= this.time) || -1
              this.scrollId = ~index ? `note${index}` : `note${res.data.records.length - 1}`
            })
            
          }
        })
      },
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
  } 
}




</style>
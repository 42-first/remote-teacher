<template>
  <section class="page__wrap">
    <div class="container box-center">
      <div>
        <div class="icon__wrap box-center">
          <i class="iconfont icon-shijuanku-mianzhuang f64"></i>
        </div>
        
        <p class="f20 bold">{{ slide && slide.papername }}</p>
        <div class="btn box-center pointer" @click="handleJumpExam">进入考试</div>
      </div>
    </div>
  </section>
</template>

<script>
import { mapState, mapActions } from 'vuex'
export default {
  name: 'exam',
  data() {
    return {
      index: 0,
      slide: null
    }
  },
  computed: {
    ...mapState([
      'lesson',
      'cards',
    ]),
  },
  watch: {
    '$route'(to, from) {
      if(to && to.params && to.name === 'exam') {
        let params = to.params;
        this.init(params.index)
      }
    },
  },

  methods: {
    init(index) {
      this.index = index;
      this.slide = this.cards[index]
      if(this.slide && this.slide.exam) {
        this.handleJumpExam()
      }
      
    },

    handleJumpExam() {
      window.open(`/v2/web/exam/${this.lesson.classroomId}/${this.slide.exam}`)
    }
  },

  mounted() {
    let index = +this.$route.params.index;
    this.init(index);
  }
}
</script>

<style lang="scss" scoped>
.page__wrap {
  width: 100%;
  height: 100%;
  background: #F6F7FB;
  padding: 24px;

  .container {
    width: 100%;
    height: 100%;
    border-radius: 10px;
    background: #fff;
  }

  .icon__wrap {
    width: 96px;
    height: 96px;
    border-radius: 50%;
    background: linear-gradient(330.1deg, #08BC72 8.98%, #A9FFCD 92.74%);
    margin: 0 auto 16px;
    color: #fff;
  }

  .btn {
    width: 280px;
    height: 44px;
    margin-top: 80px;
    background: #3D7BFF;
    color: #fff;
    border-radius: 36px;
  }
}
</style>
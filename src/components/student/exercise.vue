/*
 * @page：学生接收器练习题页面
 * @author: chenzhou
 * @update: 2017.06.06
 * @desc 投票 单选多选等
 *
 */

<template>
  <section class="page-exercise">
    <div :class="['exercise-wrapper', 'animated', opacity ? 'zoomIn': '']">
      <!-- 练习导航 -->
      <header class="student__header">
        <p class="student__header--back" @click="handleBack"><i class="iconfont icon-back f25"></i></p>
        <h3 class="header-title f18">{{ title }}</h3>
        <p class="student__header--back"></p>
      </header>

      <!-- 定时时间 -->
      <section class="exercise__timing" v-show="leaveTime>0">
        <p class="exercise__timing--icon"><i class="iconfont icon-clock f40"></i></p>
        <p class="exercise__timing--number f60">{{ sLeaveTime }}</p>
      </section>

      <!-- 问题内容 -->
      <section class="exercise-content">
        <p class="page-no f18"><span>6</span>/<span>9</span></p>
        <img class="cover" src="http://7xo8b6.com2.z0.glb.qiniucdn.com/FmlcR6CYp-3nV_Cl2zjc8da4kiet" />
      </section>

      <!-- 问题选项 -->
      <section class="" v-if="isShowOption">
        <ul class="exercise-options" v-if="summary">
          <li class="options-item f45" v-for="(item, index) in summary.options">
            <p class="options-label selected">{{ item.Label }}</p>
          </li>
        </ul>
        <p class="submit-btn f18" v-if="isShowSubmit">提交答案</p>
      </section>

      <div class="commit-diff" v-if="isShowSubmit"><a class="commit-diff-link f15" :href="commitDiffURL">提交有困难？</a></div>

    </div>

  </section>
</template>
<script>
  import API from '@/util/Api'

  export default {
    name: 'exercise-page',
    data() {
      return {
        index: 0,
        opacity: 0,
        title: '习题',
        leaveTime: 0,
        sLeaveTime: '00',
        summary: null,
        options: null,
        isShowSubmit: true,
        isShowOption: true,
        // 问题定时通信ID
        msgid: 1,
        timer: null,
        commitDiffURL: '/lesson/lesson_submit_difficulties/'
      };
    },
    beforeRouteEnter (to, from, next) {
      // 在渲染该组件的对应路由被 confirm 前调用
      // 不！能！获取组件实例 `this`
      // 因为当钩子执行前，组件实例还没被创建

      if(from.name === 'student-presentation-page') {
         next();
      } else {
        next(vm => {
          // history.back()
          vm.$router.go(-1)
        })
      }
    },
    components: {
    },
    computed: {
    },
    watch: {
    },
    filters: {
      formatTime(time) {
        return moment(time).format('hh:mm:ss');
      }
    },
    mixins: [],
    methods: {
      /*
      * @method 初始化习题页面
      * @param problemID 问题ID
      */
      init(data) {
        // 是否观察者模式
        if(this.observerMode) {
          this.isShowOption = false;
          this.isShowSubmit = false;
        }

        // 是否完成
        if(data.isComplete) {
          this.isShowSubmit = false;
        } else {
          // 开始启动定时
          data.limit > 0 && this.$parent.startTiming({ problemID: data.problemID, msgid: this.msgid++ });

          // todo: test测试
          this.setTiming(data.limit)
        }

      },

      /*
      * @method 设置计时器
      * @param
      */
      setTiming(leaveTime) {
        // let startTime = data.time;
        // let now = Date.now();

        this.leaveTime = leaveTime;

        if (leaveTime >= 0) {
          this.timer = setInterval(()=>{
            this.leaveTime--;
            let minutes = parseInt(this.leaveTime / 60, 10);
            let seconds = this.leaveTime % 60;
            minutes = minutes < 10 ? '0' + minutes : minutes;
            seconds = seconds < 10 ? '0' + seconds : seconds;

            this.sLeaveTime = minutes + ':' + seconds;

            this.leaveTime === 0 && clearInterval(this.timer);
          }, 1000)
        } else {
          // 时间到
        }
      },

      handleBack() {
        this.$router.back();
      }
    },
    created() {
      this.index = +this.$route.params.index;
      let cards = this.$parent.cards;
      this.summary = cards[this.index];

      let problemID = this.summary.problemID
      this.title = this.$parent.title;
      // 是否观察者模式
      this.observerMode = this.$parent.observerMode;

      this.oProblem = this.$parent.problemMap.get(problemID);

      if(problemID) {
        // this.formatData(this.summary);
        this.commitDiffURL = this.commitDiffURL + problemID;

        this.init(this.summary);
      }

    },
    mounted() {
    },
    beforeDestroy() {
      clearInterval(this.timer);
    }
  };
</script>

<style lang="scss">

  /*------------------*\
    $ 红包详情页
  \*------------------*/

  .exercise-wrapper {
    will-change: opacity;
    -webkit-transition: opacity 333ms cubic-bezier(0.4, 0, 0.22, 1);
    transition: opacity 333ms cubic-bezier(0.4, 0, 0.22, 1);
    cursor: zoom-in;
  }

  .page-exercise {
    z-index: 2;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;

    background: #fff;

    overflow-y: scroll;
    -webkit-overflow-scrolling: touch;
  }


  /*------------------*\
    $ 习题定时
  \*------------------*/

  .exercise__timing {
    display: flex;
    align-items: center;
    justify-content: center;

    padding: 0.533333rem 0 0;

    .exercise__timing--icon {
      margin-right: 0.453333rem;
      width: 1.4rem;
      height: 1.4rem;
      background: #639EF4;

      border-radius: 50%;

      .iconfont {
        line-height: 1.4rem;
        color: #fff;
      }

    }

    .exercise__timing--number {
      color: #639EF4;
    }

    .over.exercise__timing--icon {
      background: #E64340;
    }

    .over.exercise__timing--number {
      color: #E64340;
    }
  }



  /*------------------*\
    $ 习题内容
  \*------------------*/

  .exercise-content {
    position: relative;
    margin: 0.4rem 0.453333rem 0;
    padding-bottom: 0.4rem;


    border-top: 1px solid #C8C8C8;
    border-bottom: 1px solid #C8C8C8;
    .page-no {
      position: absolute;
      top: 0;
      right: 0;

      padding: 0.066667rem 0.453333rem;
      color: #fff;

      background: rgba(0,0,0,0.5);
    }

    .cover {
      display: block;
      width: 100%;

      box-shadow: 0 0 4px rgba(0,0,0,0.2);
    }
  }



  /*------------------*\
    $ 习题选项
  \*------------------*/

  .exercise-options {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    flex-wrap: wrap;

    padding: 0.7rem 0.453333rem 0;

    .options-item {
      padding: 0.1rem 0;
      width: 25%;

      .options-label {
        margin: 0 auto;
        width: 1.6rem;
        height: 1.6rem;

        line-height: 1.6rem;

        color: #fff;
        font-weight: lighter;

        background: #C8C8C8;
        border-radius: 50%;
      }

      .options-label.selected {
        background: linear-gradient(to bottom, #28CF6E, #5CA9E4);
      }
    }
  }

  .submit-btn {
    margin: 1rem auto 1.226667rem;

    width: 7.333333rem;
    height: 1.066667rem;

    line-height: 1.066667rem;

    color: #fff;
    background: #9B9B9B;

    border-radius: 4px;
  }

  .commit-diff {
    padding-bottom: 0.4rem;
    .commit-diff-link {
      color: #639EF4;
    }
  }


</style>





















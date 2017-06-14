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
      <section class="exercise__timing" v-show="summary&&summary.limit>0">
        <p :class="['exercise__timing--icon', timeOver ? 'over':'']"><i class="iconfont icon-timing"></i></p>
        <p :class="['exercise__timing--number', timeOver ? 'over f45':'f60']">{{ sLeaveTime }}</p>
      </section>

      <!-- 问题内容 -->
      <section class="exercise-content">
        <p class="page-no f18"><span>第{{ summary&&summary.pageIndex }}页</span></p>
        <img class="cover" :src="summary&&summary.cover" />
      </section>

      <!-- 问题选项 -->
      <section class="" v-if="isShowOption">
        <ul class="exercise-options" v-if="summary">
          <li :class="['options-item', 'f45', problemType]" v-for="(item, index) in options">
            <p :class="['options-label', item.selected ? 'selected' : '' ]" @click="handleSetOption(item.Label)" :data-option="item.Label">{{ item.Label }}</p>
          </li>
        </ul>
        <!-- 投票选择提示 -->
        <p class="polling-count f20" v-if="problemType==='Polling' && selectedPollingCount < pollingCount">您还可以再投{{ selectedPollingCount }}票</p>
        <p class="polling-count f20" v-if="summary && !summary.isComplete && problemType==='Polling' && selectedPollingCount === pollingCount">您还未投票</p>
        <p :class="['submit-btn', 'f18', canSubmit === 1 || canSubmit === 2 ? 'can' : '']" v-if="isShowSubmit" @click="handleSubmit">{{ canSubmit|setSubmitText }}</p>
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
        sLeaveTime: '',
        timeOver: false,
        summary: null,
        options: null,
        // 提交状态 0:不能提交 1：可以提交 2：提交中 3:提交完成
        canSubmit: 0,

        // 选择的答案
        optionsSet: new Set(),
        // 问题类型
        problemType: '',
        selectedPollingCount: 0,
        pollingCount: 0,

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
          vm.$router.back();
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
      setSubmitText(submitStatus) {
        let text = '提交答案';

        if(submitStatus) {
          switch (submitStatus) {
            case 0:
            case 1:
              text = '提交答案';
              break;
            case 2:
              text = '提交中...';
              break;
            case 3:
              text = '提交完成';
              break;
            default:
              break;
          }
        }

        return text;
      }
    },
    mixins: [],
    methods: {
      /*
      * @method 初始化习题页面
      * @param problemID 问题ID
      */
      init(data) {
        let problemID = data.problemID;
        this.title = this.$parent.title;

        if(!problemID) {
          return ;
        }

        // 是否观察者模式
        this.observerMode = this.$parent.observerMode;
        this.oProblem = this.$parent.problemMap.get(problemID)['Problem'];
        // 问题类型
        this.problemType = this.oProblem['Type'];
        // 选项
        this.options = data.options;

        // 是否观察者模式
        if(this.observerMode) {
          this.isShowOption = false;
          this.isShowSubmit = false;
        }

        // 是否完成
        if(data.isComplete) {
          this.isShowSubmit = false;

          let result = this.oProblem['Result'];

          result && result.split('').forEach((option) => {
            this.setOptions(option, true, true);
          });

          // data.limit > 0 && this.$parent.startTiming({ problemID: problemID, msgid: this.msgid++ });
          this.sLeaveTime = '已完成';
        } else {
          // 开始启动定时
          data.limit > 0 && this.$parent.startTiming({ problemID: problemID, msgid: this.msgid++ });

          // 投票类型
          if(this.problemType === 'Polling') {
            this.selectedPollingCount = this.pollingCount = parseInt(this.oProblem['Answer'], 10);
          }

          this.options.forEach((item) => {
            // 是否有选项
            if(item.selected) {
              this.canSubmit = 1;
              this.optionsSet.add(item.Label);

              this.problemType === 'Polling' && this.selectedPollingCount--;
            }
          })

          // 提交有困难地址
          this.commitDiffURL = this.commitDiffURL + problemID;

          if (process.env.NODE_ENV !== 'production') {
            // todo: test测试
            this.setTiming(data.limit)
          }
        }

        setTimeout(()=>{
          this.opacity = 1;
        }, 20)
      },

      /*
      * @method 设置计时器
      * @param
      */
      setTiming(leaveTime) {
        this.leaveTime = leaveTime;

        if (leaveTime > 0) {
          this.timer = setInterval(()=>{
            this.leaveTime--;
            let minutes = parseInt(this.leaveTime / 60, 10);
            let seconds = this.leaveTime % 60;
            minutes = minutes < 10 ? '0' + minutes : minutes;
            seconds = seconds < 10 ? '0' + seconds : seconds;

            this.sLeaveTime = minutes + ':' + seconds;

            if(this.leaveTime === 0) {
              this.sLeaveTime = '时间到';
              clearInterval(this.timer);
              this.timeOver = true;
            }

          }, 1000)
        } else {
          // 时间到
          this.timeOver = true;
          this.sLeaveTime = '时间到';
        }
      },

      /*
      * @method 设置答案选项是否选中
      * @param option: 选项
      *        isSelected: 是否选中
      *        multi: 是否多选
      */
      setOptions(option, isSelected, multi) {
        let options = this.options;

        options = options.map( (element, index) => {
          if(!isSelected) {
            // 取消
            element.Label === option && (element.selected = isSelected);
          } else {
            if(multi) {
              // 多选
              element.Label === option && (element.selected = isSelected);
            } else {
              // 单选
              if(element.Label === option) {
                element.selected = isSelected;
              } else {
                element.selected = false;
              }
            }
          }

          return element;
        });

        this.options = options;
      },

      /*
      * @method 返回主页面
      */
      handleBack() {
        this.$router.back();
      },

      /*
      * @method 设置答案选项
      */
      handleSetOption(option) {
        let targetEl = event.target;

        // 提交中或者已完成
        if(this.canSubmit === 2 || this.summary.isComplete || this.timeOver) {
          return this;
        }

        if(this.optionsSet.has(option)) {
          this.setOptions(option, false);
          this.optionsSet.delete(option);

          if(this.problemType === 'Polling') {
            this.selectedPollingCount++;
          }
        } else {
          // 是否多选
          if(this.problemType === 'MultipleChoiceMA') {
            this.setOptions(option, true, true);
            this.optionsSet.add(option);
          } else if(this.problemType === 'MultipleChoice') {
            this.setOptions(option, true, false);
            this.optionsSet.clear();
            this.optionsSet.add(option);
          } else if(this.problemType === 'Polling' && this.selectedPollingCount) {
            this.selectedPollingCount--;
            this.setOptions(option, true, true);
            this.optionsSet.add(option);
          }
        }

        // 是否可以提交
        if(this.optionsSet.size) {
          this.canSubmit = 1;
          console.log([...this.optionsSet].sort().join(''));
        } else {
          this.canSubmit = 0;
        }
      },

      /*
      * @method 提交答案
      */
      handleSubmit() {
        let self = this;
        let problemID = this.summary.problemID;
        let URL = API.student.ANSWER_LESSON_PROBLEM;

        // 是否可以提交
        if(this.canSubmit === 1) {
          // 是否超时
          if(this.timeOver) {
            this.canSubmit = 0;
            return this;
          }

          this.canSubmit = 2;

          const startTime = Math.ceil(this.summary.time/1000);
          const endTime = Math.ceil(+new Date()/1000);
          // 持续多少秒
          const duration = endTime - startTime;
          const retryTimes = 0;

          let param = {
            'duration': duration,
            'startTime': startTime,
            'submit_time': endTime,
            'lesson_problem_id': problemID,
            'result': [...this.optionsSet].sort().join(''),
            'retry_times': retryTimes
          }

          this.oProblem['Result'] = param['result'];
          let problem = self.$parent.problemMap.get(problemID)

          return request.post(URL, param)
            .then((res) => {
              if(res && res.data) {
                let data = res.data;

                self.summary = Object.assign(self.summary, {
                  status: '已完成',
                  isComplete: true
                })

                problem = Object.assign(problem, {
                  'Problem': self.oProblem
                })
                self.$parent.problemMap.set(problemID, problem);

                self.canSubmit = 3;
                clearInterval(self.timer);
                this.sLeaveTime = '已完成';

                self.$router.back();

                return data;
              }
            })
            .catch(error => {
              // 提交失败保存本地
              self.saveAnswer(param);
              self.$toast({
                message: '当前网络不畅，请检查系统已保存并将自动重复提交',
                duration: 3000
              });

              setTimeout(() => {
                self.$router.back();
              }, 3000)
            });

          clearInterval(this.timer);
        }
      },

      /*
      * @method 保存习题答案
      * @param
      */
      saveAnswer(data) {
        let key = 'answer_problem';
        let answerPostList = JSON.parse(localStorage.getItem(key)) || [];

        data.retry_times = data.retry_times + 1;
        answerPostList.push(data);

        let value = JSON.stringify(answerPostList);

        localStorage.setItem(key, value);
      }
    },
    created() {
      this.index = +this.$route.params.index;
      let cards = this.$parent.cards;
      this.summary = cards[this.index];

      if(this.summary) {
        this.init(this.summary);
      } else {
        setTimeout(()=>{
          this.init(this.summary);
        }, 1500)
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

    padding: 0.2rem 0 0;
    min-height: 2.666667rem;

    .exercise__timing--icon {
      margin-right: 0.453333rem;
      width: 1.4rem;
      height: 1.4rem;
      background: #639EF4;

      border-radius: 50%;

      .iconfont {
        font-size: 1.0rem;
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
        cursor: pointer;

        background: #C8C8C8;
        /*border-radius: 50%;*/
      }

      .options-label.selected {
        background: linear-gradient(to bottom, #28CF6E, #5CA9E4);
      }
    }

    .options-item.MultipleChoice .options-label {
      border-radius: 50%;
    }
  }

  .polling-count {
    padding-top: 0.25rem;
    text-align: center;
    color: #E64340;
  }

  .submit-btn {
    margin: 1rem auto 1.226667rem;

    width: 7.333333rem;
    height: 1.066667rem;

    line-height: 1.066667rem;

    color: #fff;
    background: #999999;

    border-radius: 4px;
    cursor: pointer;
  }

  .submit-btn.can {
    background: #639EF4;
  }

  .submit-btn.can:active {
    background: rgba(99,158,244,0.7);
  }

  .commit-diff {
    padding-bottom: 0.4rem;
    .commit-diff-link {
      color: #639EF4;
    }
  }


</style>















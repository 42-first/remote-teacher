/*
 * @page：习题答案解析页面
 * @author: chenzhou
 * @update: 2018.12.11
 * @desc 主观题客观题对应答案解析和交互
 *
 */

<template>
  <section class="page-exercise">
    <div :class="['animated', opacity ? 'zoomIn': '']">

      <!-- 问题内容 -->
      <section class="exercise-content" :style="{ minHeight: (10 - 0.906667)/rate + 'rem' }">
        <p class="page-no f12"><span>{{ $t('pno', { number: summary&&summary.pageIndex }) }}</span></p>
        <img class="cover" :src="summary&&summary.cover" @click="handleScaleImage" @load="handlelaodImg" />
      </section>

      <!-- 问题选项 -->
      <section class="" v-if="isShowOption">
        <ul class="exercise-options" v-if="summary">
          <li :class="['options-item', 'f45', problemType, pollingCount === 1 ? 'MultipleChoice': '']" v-for="(item, index) in options">
            <p :class="['options-label', item.selected ? 'selected' : '' ]" @click="handleSetOption(item.Label, $event)" :data-option="item.Label">{{ item.Label }}</p>
          </li>
        </ul>
      </section>

    </div>

  </section>
</template>
<script>
  import API from '@/util/api'
  import { isSupported } from '@/util/util'

  export default {
    name: 'problem-analysis-page',
    data() {
      return {
        index: 0,
        opacity: 0,
        problemID: 0,
        title: '习题',
        summary: null,
        options: null,
        // 选择的答案
        optionsSet: new Set(),
        // 问题类型 单选 多选tougip
        problemType: '',
        rate: 1.33,

      };
    },
    components: {
    },
    computed: {
    },
    watch: {
    },
    filters: {
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

        this.problemID = problemID;

        this.oProblem = this.$parent.problemMap.get(problemID)['Problem'];
        // 问题类型
        this.problemType = this.oProblem['Type'];
        // 选项
        this.options = data.options;

        // 是否完成
        if(data.isComplete) {
          let result = this.oProblem['Result'];

          result && result.split('').forEach((option) => {
            this.setOptions(option, true, true);
          });
        }

        setTimeout(()=>{
          this.opacity = 1;
        }, 20)
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
      * @method 设置答案选项
      */
      handleSetOption(option, evt) {
        let targetEl = typeof event !== 'undefined' && event.target || evt.target;

        // 提交中或者已完成
        if(this.canSubmit === 2 || this.summary.isComplete || this.timeOver) {
          return this;
        }

        if(this.optionsSet.has(option)) {
          this.setOptions(option, false);
          this.optionsSet.delete(option);

          if(this.problemType && this.problemType.indexOf('Polling') > -1) {
            this.selectedPollingCount++;
          }
        } else if(this.problemType) {
          // 是否多选
          if(this.problemType === 'MultipleChoiceMA') {
            this.setOptions(option, true, true);
            this.optionsSet.add(option);
          } else if(this.problemType === 'MultipleChoice') {
            this.setOptions(option, true, false);
            this.optionsSet.clear();
            this.optionsSet.add(option);
          } else if(this.problemType.indexOf('Polling') > -1 && this.selectedPollingCount && this.pollingCount > 1) {
            this.selectedPollingCount--;
            this.setOptions(option, true, true);
            this.optionsSet.add(option);
          } else if(this.problemType.indexOf('Polling') > -1 && this.pollingCount === 1) {
            this.setOptions(option, true, false);
            this.optionsSet.clear();
            this.optionsSet.add(option);
            this.selectedPollingCount > 0 && this.selectedPollingCount--;
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
            this.$toast({
              message: this.$i18n.t('timeoutnosubmit') || '时间已过，不能再提交啦～',
              duration: 3000
            });
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
                  status: this.$i18n.t('done') || '已完成',
                  isComplete: true
                })

                // 替换原来的数据
                self.$parent.cards.splice(self.index, 1, self.summary);

                problem = Object.assign(problem, {
                  'Problem': self.oProblem
                })
                self.$parent.problemMap.set(problemID, problem);

                self.canSubmit = 3;
                clearInterval(self.timer);
                this.sLeaveTime = this.$i18n.t('done') || '已完成';
                this.isComplete = true;

                // 是否重复提交了
                if(data.status_code === 4) {
                  // 此题已经作答过
                  this.$toast({
                    message: '此题已经作答过',
                    duration: 2000
                  });
                } else {
                  this.$toast({
                    message: this.$i18n.t('sendsuccess') || '提交成功',
                    duration: 2000
                  });
                }

                // this.$toast({
                //   message: this.$i18n.t('sendsuccess') || '提交成功',
                //   duration: 2000
                // });

                setTimeout(() => {
                  self.$router.back();
                }, 2000)

                return data;
              }
            })
            .catch(error => {
              // 提交失败保存本地
              self.saveAnswer(param);
              self.$toast({
                message: this.$i18n.t('neterrorpush') || '当前网络不畅，请检查系统已保存并将自动重复提交',
                duration: 3000
              });

              self.isComplete = true;

              setTimeout(() => {
                self.$router.back();
              }, 3000)
            });

          clearInterval(this.timer);
        }
      },

    },
    created() {
      this.index = +this.$route.params.index;
      let cards = this.$parent.cards;
      this.summary = cards[this.index];

      if(this.summary) {
        this.init(this.summary);
      } else {
        this.$router.back();
      }
    },
    mounted() {
    },
    beforeDestroy() {
    }
  };
</script>

<style lang="scss">

  /*------------------*\
    $ 习题详情页
  \*------------------*/

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
    $ 习题内容
  \*------------------*/

  .exercise-content {
    position: relative;
    margin: 0.4rem 0.453333rem 0;
    padding-bottom: 0.4rem;


    border-top: 1px solid #C8C8C8;
    border-bottom: 1px solid #C8C8C8;
    overflow: hidden;
    .page-no {
      position: absolute;
      top: 0;
      right: 0;

      padding: 0 0.306667rem;
      height: 0.666667rem;
      line-height: 0.666667rem;
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


</style>


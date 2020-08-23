/*
 * @page：大屏适配练习题页面
 * @author: chenzhou
 * @update: 2020.02.17
 * @desc 投票 单选多选等
 *
 */

<template>
  <section class="page-exercise">
    <div class="container">
      <!-- 定时 续时等 -->
      <section class="exercise__tips" v-show="isShowOption">
        <div class="timing" v-if="limit>0 && sLeaveTime && !hasNewExtendTime || timeOver">
          <img class="timing--icon" v-if="!warning&&!timeOver" src="https://qn-sfe.yuketang.cn/o_1bvu1nd601n5v1dku1k0b1680fi9.png">
          <img class="timing--icon" v-if="warning&&!timeOver" src="https://qn-sfe.yuketang.cn/o_1bvu1oi7k1v411l4a8e41qtt1uq8e.png">
          <p :class="['timing--number', warning || timeOver ? 'over':'', timeOver ? 'f24':'f32']">{{ sLeaveTime }}</p>
        </div>
        <div class="timing f24" v-else-if="hasNewExtendTime">{{ sExtendTimeMsg }}</div>
        <div class="timing f24" v-else-if="isComplete"><!-- 已完成 -->{{ $t('receiverdone') }}</div>
        <div class="timing f24" v-else><!-- 老师可能会随时结束答题 -->{{ $t('collectprotip') }}</div>
      </section>

      <!-- 问题内容 -->
      <section class="exercise-content" :style="{ minHeight: (10 - 0.906667)/rate + 'rem' }">
        <p class="page-no f12"><span>{{ $t('pno', { number: summary&&summary.pageIndex }) }}</span></p>
        <img class="cover" :src="summary&&summary.cover" @load="handleLoadImg" />
      </section>

      <!-- 问题选项 -->
      <section class="" v-if="isShowOption">
        <ul class="exercise-options" v-if="summary">
          <li :class="['options-item', 'f45', problemType === 1 || pollingCount === 1 ? 'MultipleChoice': '']" v-for="(item, index) in options">
            <p :class="['options-label', item.selected ? 'selected' : '' ]" @click="handleSetOption(item.label, $event)" :data-option="item.label">{{ item.label }}</p>
          </li>
        </ul>
        <!-- 投票选择提示 -->
        <p class="polling-count f20" v-if="(problemType === 3) && selectedPollingCount < pollingCount">{{ $t('voteremain', { number: selectedPollingCount }) }}</p>
        <p class="polling-count f20" v-if="summary && !summary.isComplete && (problemType === 3) && selectedPollingCount === pollingCount">{{ $t('novote') }}</p>
        <p :class="['submit-btn', 'f18', canSubmit === 1 || canSubmit === 2 ? 'can' : '']" v-if="isShowSubmit" @click="handleSubmit">{{ canSubmit|setSubmitText }}{{(anonymous && (canSubmit === 0 || canSubmit === 1)) ? $t('anonymous') : ''}}</p>
      </section>
    </div>

  </section>
</template>
<script>
  import { mapState, mapActions } from 'vuex'

  import API from '@/util/api'
  import { isSupported } from '@/util/util'
  import problemControl from '@/lesson/fullscreen/mixin/problem-control'

  export default {
    name: 'exercise-page',
    data() {
      return {
        index: 0,
        problemID: 0,
        title: '习题',
        // 是否作答完成
        isComplete: false,
        // 是否新的延时
        hasNewExtendTime: false,
        sExtendTimeMsg: '',
        limit: -1,
        leaveTime: 0,
        sLeaveTime: '00:00',
        warning: false,
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
        anonymous: false,

        isShowSubmit: true,
        isShowOption: true,
        // 问题定时通信ID
        msgid: 1,
        timer: null,
        rate: 1
      };
    },
    components: {
    },
    computed: {
      // 使用对象展开运算符将 getter 混入 computed 对象中
      ...mapState([
        'lesson',
        'cards',
        'observerMode',
      ]),
    },
    watch: {
      '$route' (to, from) {
        if(to && to.params && to.name === 'exercise') {
          let params = to.params;
          this.index = params.index

          let cards = this.cards;
          this.summary = cards[this.index];

          if(this.summary) {
            this.init(this.summary);
          }
        }
      },
    },
    filters: {
      setSubmitText(submitStatus) {
        let text = typeof i18n !== 'undefined' && i18n.t('submitansw') || '提交答案';

        if(submitStatus) {
          switch (submitStatus) {
            case 0:
            case 1:
              text = typeof i18n !== 'undefined' && i18n.t('submitansw') || '提交答案';
              break;
            case 2:
              text = typeof i18n !== 'undefined' && i18n.t('besending') || '提交中...';
              break;
            case 3:
              text = typeof i18n !== 'undefined' && i18n.t('sendsuccess') || '提交成功';
              break;
            default:
              break;
          }
        }

        return text;
      }
    },
    mixins: [ problemControl ],
    methods: {
      ...mapActions([
        'setCards',
      ]),

      /*
      * @method 重置数据
      * @param
      */
      reset() {
        this.optionsSet = new Set();
        this.timeOver = false;
        this.canSubmit = false;
        this.warning = false;
        this.limit = -1;
        this.leaveTime = 0;
        this.isShowSubmit = true;
        this.isComplete = false;
        this.anonymous = false;
      },

      /*
      * @method 初始化习题页面
      * @param problemID 问题ID
      */
      init(data) {
        let problemID = data.problemID;
        this.title = this.lesson.title;

        if(!problemID) {
          return ;
        }

        this.reset();

        this.problemID = problemID;

        // event消息订阅
        this.initPubSub();
        let problem = this.$parent.$parent.problemMap.get(problemID);
        if(!problem ) {
          setTimeout(()=>{
            this.init(data);
          }, 1500)

          return this;
        }

        this.oProblem = problem['problem'];
        // 问题类型
        this.problemType = this.oProblem['problemType'];
        // 选项
        this.options = data.options;

        // 投票类型
        if(this.problemType === 3) {
          this.selectedPollingCount = this.pollingCount = this.oProblem['pollingCount'];
          this.anonymous = this.oProblem['anonymous'];
        }

        // 是否观察者模式
        if(this.observerMode) {
          this.isShowOption = false;
          this.isShowSubmit = false;
        }

        // 是否完成
        if(data.isComplete) {
          this.isShowSubmit = false;

          let result = this.oProblem['result'];

          result && result.forEach((option) => {
            this.setOptions(option, true, true);
          });

          this.sLeaveTime = this.$i18n.t('done') || '已完成';
          this.isComplete = true;
        } else {
          // 开始启动定时
          this.$parent.$parent.startTiming({ problemID: problemID, msgid: this.msgid++ });
          this.limit = data.limit;

          this.options.forEach((item) => {
            // 是否有选项
            if(item.selected) {
              this.canSubmit = 1;
              this.optionsSet.add(item.label);

              this.problemType === 3 && this.selectedPollingCount--;
            }
          })
        }
      },

      /*
       * @method 是否点亮提交按钮
       * @params problem
       */
      canSubmitFn() {
        let hasResult = [...this.optionsSet].length;

        if(!this.isComplete && hasResult) {
          this.canSubmit = 1;
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
            element.label === option && (element.selected = isSelected);
          } else {
            if(multi) {
              // 多选
              element.label === option && (element.selected = isSelected);
            } else {
              // 单选
              if(element.label === option) {
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
        // 提交中或者已完成
        if(this.canSubmit === 2 || this.summary.isComplete || this.timeOver) {
          return this;
        }

        if(this.optionsSet.has(option)) {
          this.setOptions(option, false);
          this.optionsSet.delete(option);

          if(this.problemType && this.problemType === 3) {
            this.selectedPollingCount++;
          }
        } else if(this.problemType) {
          // 是否多选
          if(this.problemType === 2) {
            this.setOptions(option, true, true);
            this.optionsSet.add(option);
          } else if(this.problemType === 1) {
            this.setOptions(option, true, false);
            this.optionsSet.clear();
            this.optionsSet.add(option);
          } else if(this.problemType === 3 && this.selectedPollingCount && this.pollingCount > 1) {
            this.selectedPollingCount--;
            this.setOptions(option, true, true);
            this.optionsSet.add(option);
          } else if(this.problemType === 3 && this.pollingCount === 1) {
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
      async handleSubmit() {
        let self = this;
        let problemID = this.problemID;
        let problem = this.$parent.$parent.problemMap.get(problemID);

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

          let params = {
            'problemId': problemID,
            'problemType': this.problemType,
            'dt': +new Date(),
            'result': [...this.optionsSet].sort()
          };

          const code = await this.submit(params);
          if(code === 0) {
            this.$toast({
              message: this.$i18n.t('sendsuccess') || '提交成功',
              duration: 2000
            });

            this.summary = Object.assign(this.summary, {
              status: this.$i18n.t('done') || '已完成',
              isComplete: true
            })
            // 替换原来的数据
            this.cards.splice(this.index, 1, this.summary);
            this.setCards(this.cards);

            if(problem['problem']) {
              problem['problem']['result'] = params['result'];
              this.$parent.$parent.problemMap.set(problemID, problem);
            }

            this.canSubmit = 3;
            this.sLeaveTime = this.$i18n.t('done') || '已完成';
            this.isComplete = true;
          } else if(code === 50028) {
            this.$toast({
              message: '此题已经作答过',
              duration: 2000
            });
          } else if(code === -1) {
            // 提交失败保存本地
            this.saveAnswer(params);
            this.$toast({
              message: this.$i18n.t('neterrorpush') || '当前网络不畅，请检查系统已保存并将自动重复提交',
              duration: 3000
            });

            this.isComplete = true;
            this.oProblem['result'] = null;

            // 统计失败率
            typeof MtaH5 !== 'undefined' && MtaH5.clickStat('submissionfailed',{'pid': problemID});
          } else {
            // 用户由于接口时间太长超时了
            this.$toast({
              message: `提交失败(错误码：${code})`,
              duration: 2000
            });

            this.canSubmit = 0;
            this.oProblem['result'] = null;

            return this;
          }

          this.timer && clearInterval(this.timer);
        }
      },

      /*
      * @method 图片加载完成
      */
      handleLoadImg(evt) {
        let target = typeof event !== 'undefined' && event.target || evt.target;

        this.width = target.naturalWidth || target.width;
        this.height = target.naturalHeight || target.width;

        this.rate = this.width/this.height;
      },
    },
    created() {
      this.index = +this.$route.params.index;
      let cards = this.cards;
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
      this.timer && clearInterval(this.timer);
    }
  };
</script>

<style lang="scss">

  /*------------------*\
    $ 习题详情页
  \*------------------*/

  .page-exercise {
    position: relative;
    width: 100%;
    height: 100%;

    display: flex;
    justify-content: center;
    align-items: center;
  }

  .container {
    width: 375px;
    height: 100%;

    background: #fff;
    border: 2px solid #eee;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }

  .page__header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    height: 50px;
    padding: 0 20px;
  }



  /*------------------*\
    $ 习题选项
  \*------------------*/

  .exercise-options {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    flex-wrap: wrap;

    padding: 26px 17px 0;

    .options-item {
      padding: 4px 0;
      width: 25%;

      .options-label {
        margin: 0 auto;
        width: 60px;
        height: 60px;

        line-height: 60px;

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
    padding-top: 9px;
    text-align: center;
    color: #E64340;
  }


</style>



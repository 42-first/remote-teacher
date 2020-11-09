/*
 * @page：学生接收器填空题页面
 * @author: chenzhou
 * @update: 2018.08.13
 * @desc 填空题作答，作答结果展示
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

      <!-- 填空选项 -->
      <section class="blanks__wrap">
        <header class="blanks__header f20"><!-- 我的答案 -->{{ $t('myanswer') }}</header>
        <ul class="blanks__options">
          <li class="blank__item f14 mb10" v-for="(item, index) in blanks" >
            <div class="blank__order">{{ index + 1 }}</div>
            <textarea rows="1" class="blank__input f17" :readonly="!isShowSubmit" type="text" v-model="result[index]" @input="handleinput" :data-index="index" :placeholder="$t('enteranswer')" ></textarea>
          </li>
        </ul>
      </section>

      <!-- 观看者提示文字 返回 -->
      <section v-if="observerMode">
        <p class="f18">{{ $t('watchmode') }}</p>
        <p class="submit-btn can f18" @click="handleBack">{{ $t('back') }}</p>
      </section>

      <p :class="['submit-btn', 'f18', canSubmit === 1 || canSubmit === 2 ? 'can' : '']" v-if="isShowSubmit" @click="handleSubmit">{{ canSubmit|setSubmitText }}</p>

    </div>

  </section>
</template>
<script>
  import { mapState, mapActions } from 'vuex'

  import API from '@/util/api'
  import { isSupported } from '@/util/util'
  import problemControl from '@/lesson/fullscreen/mixin/problem-control'

  export default {
    name: 'blanks-page',
    data() {
      return {
        index: 0,
        problemID: 0,
        title: '填空题',
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
        // 填空题填空列表
        blanks: null,
        // 作答结果
        result: {},
        oProblem: null,
        // 提交状态 0:不能提交 1：可以提交 2：提交中 3:提交完成
        canSubmit: 0,

        observerMode: false,

        // 选择的答案
        optionsSet: new Set(),
        // 问题类型
        problemType: 4,

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
      ]),
    },
    watch: {
      '$route' (to, from) {
        if(to && to.params && to.name === 'blank') {
          let params = to.params;
          this.index = params.index

          let cards = this.cards;
          this.summary = cards[this.index];

          if(this.summary) {
            this.init(this.summary);
          } else {
            this.$router.back();
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
        this.timeOver =false;
        this.canSubmit = false;
        this.warning = false;
        this.limit = -1;
        this.leaveTime = 0;
        this.isShowSubmit = true;
        this.result = {};
        this.isComplete = false;
      },

      /*
      * @method 初始化习题页面
      * @param problemID 问题ID
      */
      init(data) {
        let problemID = data.problemID;
        this.title = this.lesson && this.lesson.title;

        if(!problemID) {
          return ;
        }

        this.reset();

        this.problemID = problemID;

        // event消息订阅
        this.initPubSub();

        let problem = this.$parent.$parent.problemMap.get(problemID);
        if(!problem) {
          setTimeout(()=>{
            this.init(data);
          }, 1500)

          return this;
        }

        this.oProblem = problem['problem'];

        // 问题类型
        this.problemType = this.oProblem['problemType'];
        this.result = this.oProblem['result'] || this.result;
        // 选项
        let blanks = this.oProblem.blanks;

        // 是否完成
        if(data.isComplete) {
          this.isShowSubmit = false;
          this.sLeaveTime = this.$i18n.t('done') || '已完成';
          this.isComplete = true;
        } else {
          // 开始启动定时
          this.$parent.$parent.startTiming({ problemID: problemID, msgid: this.msgid++ });
          this.limit = data.limit;

          blanks.forEach((item, index) => {
            // 是否有作答
            if(!this.result[index]) {
              this.result[index] = '';
            }
          })
        }

        setTimeout(()=>{
          this.$el.querySelectorAll('textarea').forEach((ele) => {
            ele.style.height = (ele.scrollHeight) + 'px';
          })
        }, 300)

        this.blanks = blanks;
      },

      /*
       * @method 是否点亮提交按钮
       * @params problem
       */
      canSubmitFn() {
        let result = this.result;
        let hasAnswer = false;

        hasAnswer = this.blanks.find((blank, index)=>{
          return result[index];
        });

        if(!this.isComplete && hasAnswer) {
          this.canSubmit = 1;
        } else if(!this.isComplete && !hasAnswer) {
          this.canSubmit = 0;
        }

        // 保存作答记录
        this.oProblem['result'] = result;
      },

      /*
      * @method 返回主页面
      */
      handleBack() {
        this.$router.back();
      },

      /*
       * @method 填空答案输入
       */
      handleinput(evt) {
        let target = evt.target;
        let index = target.dataset.index;
        let value = target.value;

        this.canSubmitFn();
        target.style.height = (target.scrollHeight) + 'px';
      },

      /*
      * @method 提交答案
      */
      async submitProblem() {
        let problemID = this.problemID;
        let problem = this.$parent.$parent.problemMap.get(problemID);
        let result = this.result;

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
            'result': Object.values(result)
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
       * @method 提交作答结果
       */
      handleSubmit() {
        let result = this.result;

        // 检测是否所有的选项都作答了
        let hasNoAnswer = this.blanks.find((blank, index)=>{
          return !result[index];
        });

        if(hasNoAnswer) {
          let msgOptions = {
            confirmButtonText: this.$i18n && this.$i18n.t('confirm') || '确定',
            cancelButtonText: this.$i18n && this.$i18n.t('cancel') || '取消'
          };
          let message = this.$i18n && this.$i18n.t('blanksnotanswer') || '有空格未填写，确认提交吗？';

          this.$messagebox.confirm(message, msgOptions).
            then( action => {
              if(action === 'confirm') {
                this.submitProblem();
              }
          });
        } else {
          this.submitProblem();
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
      }
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
    // height: 667px;
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
    $ 填空选项
  \*------------------*/

  .blanks__wrap {
    margin-top: 10px;
    padding: 20px 0;

    background: #fff;
  }

  .blanks__header {
    padding-left: 20px;
    height: 28px;
    border-left: 6px solid #639EF4;
    font-weight: bold;
    text-align: left;
  }

  .blanks__options {
    padding: 20px;
  }

  .blank__item {
    display: flex;
    min-height: 40px;
  }

  .blank__order {
    display: flex;
    justify-content: center;
    align-items: center;

    width: 40px;
    min-height: 40px;
    font-weight: bold;
    color: #5096F5;
    border: 2px solid #5096F5;
    border-radius: 4px 0 0 4px;
  }

  .blank__input {
    flex: 1;
    padding: 5px;
    min-height: 40px;
    line-height: 1.5;
    outline: none;
    border: none;
    appearance: none;
    box-sizing: border-box;
    border: 2px solid #eee;
    border-left: none;
    border-radius: 0 4px 4px 0;
  }


</style>



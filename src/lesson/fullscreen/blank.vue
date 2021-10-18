/*
 * @page：学生接收器填空题页面
 * @author: chenzhou
 * @update: 2018.08.13
 * @desc 填空题作答，作答结果展示
 *
 */

<template>
  <section class="page-exercise" v-if="summary">
    <div class="container box-center">

      <!-- 问题内容 -->
      <slide :item="summary" :canSubmit="canSubmit" @clickanswer="handleShowAnswer" :limit="limit" :sLeaveTime="sLeaveTime" :hasNewExtendTime="hasNewExtendTime" :timeOver="timeOver" :warning="warning" :sExtendTimeMsg="sExtendTimeMsg" :isComplete="isComplete"></slide>
    </div>

    <!-- 填空选项 -->
    <section class="blanks__wrap" v-show="rightType == 'blank'">
      <header class="blanks__header box-between">
        <span class="blue f14"><!-- 填空题作答 --> {{ $t('blankanswer') }}</span>
        <i class="iconfont icon-guanbi2 f16 c9b pointer" @click="handleCloseAnswer"></i>
      </header>
      <ul class="blanks__options">
        <li class="blank__item f14 mb10" v-for="(item, index) in blanks" >
          <div class="blank__order">{{ index + 1 }}</div>
          <textarea rows="1" class="blank__input f17" :readonly="!isShowSubmit" type="text" v-model="result[index]" @input="handleinput" :data-index="index" :placeholder="$t('enteranswer')" ></textarea>
        </li>
      </ul>
      <div class="btn-box" v-show="!summary.isComplete">
        <p :class="['submit-btn', 'f14', canSubmit === 1 || canSubmit === 2 ? '' : 'disable']" v-if="isShowSubmit" @click="handleSubmit">{{ canSubmit|setSubmitText }}</p>
      </div>
      
    </section>

  </section>
</template>
<script>
  import { mapState, mapActions } from 'vuex'

  import API from '@/util/api'
  import { isSupported } from '@/util/util'
  import problemControl from '@/lesson/fullscreen/mixin/problem-control'
  import slide from './components/slide'

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
        rate: 1,
        heightResult: []
      };
    },
    components: {
      slide
    },
    computed: {
      // 使用对象展开运算符将 getter 混入 computed 对象中
      ...mapState([
        'lesson',
        'cards',
        'rightType'
      ]),
    },
    watch: {
      '$route' (to, from) {
        if(to && to.params && to.name === 'blank') {
          let params = to.params;
          this.index = params.index

          let cards = this.cards;
          this.summary = cards[this.index];
          this.endTiming()
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
        'setRightType'
      ]),

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

        let key = `lessonBlank${this.problemID}`
        let result = []

        // 刷新后作答结果丢失 使用本地存储的
        if(isSupported(localStorage)){
          let value = JSON.parse(localStorage.getItem(key))
          result = value.result
          this.heightResult = value.heightResult
        }

        // 问题类型
        this.problemType = this.oProblem['problemType'];
        this.result = this.oProblem['result'] || result || this.result ;
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
              this.heightResult[index] = 40
            }
          })
        }

        setTimeout(()=>{
          this.$el.querySelectorAll('textarea').forEach((ele, i) => {
            ele.style.height = this.heightResult[i] + 'px';
          })
        }, 300)

        this.blanks = blanks;
      },

      /*
       * @method 是否点亮提交按钮
       * @params problem
       */
      canSubmitFn(height, index) {
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

        this.heightResult[index] = height

        // 存储作答结果&输入框高度
        let key = `lessonBlank${this.problemID}`
        if(isSupported(localStorage)) {
          let blankCache = JSON.parse(localStorage.getItem(key)) || {};
          blankCache = {
            result: result,
            heightResult: this.heightResult
          }
          let value = JSON.stringify(blankCache);
          localStorage.setItem(key, value); 
        }
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

        this.canSubmitFn(target.scrollHeight, index);
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
        if(this.canSubmit !== 1) return
        let result = this.result;

        // 检测是否所有的选项都作答了
        let hasNoAnswer = this.blanks.find((blank, index)=>{
          return !result[index];
        });

        if(hasNoAnswer) {

          this.$rainConfirm({
            data: {
              title: this.$i18n.t('tips') || "提示",
              message: this.$i18n.t('blanksnotanswer') || "有空格未填写，确认提交吗？",
              showCancel: true,
              confirmText: this.$i18n.t('confirm') || '确认',
              cancelText: this.$i18n.t('continue') || '继续填写',
              confirmClass: '',
              reverse: true
            },
            cancel: () => {
              
            },
            confirm: () => {
              setTimeout(() => {
                this.submitProblem()
              }, 50);
            },
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
      },

      handleShowAnswer(){
        this.setRightType('blank')
      },
      handleCloseAnswer(){
        this.setRightType('')
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

<style lang="scss" scoped>

  /*------------------*\
    $ 习题详情页
  \*------------------*/

  .page-exercise {
    position: relative;
    width: 100%;
    height: 100%;

    display: flex;
    justify-content: flex-start;
    align-items: center;
  }

  .container {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
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
    width: 380px;
    height: calc(100% - 40px);
    background: #fff;
    position: fixed;
    right: 0;
    top: 40px;
  }

  .blanks__header {
    height: 40px;
    line-height: 40px;
    padding: 0 15px;

    text-align: left;
    border-bottom: 1px solid #ddd;
  }

  .blanks__options {
    padding: 30px 20px;
    height: calc(100% - 110px);
    overflow-y: auto;
  }

  .blank__item {
    display: flex;
    min-height: 40px;
    margin-bottom: 10px;
  }

  .blank__order {
    display: flex;
    justify-content: center;
    align-items: center;

    width: 36px;
    min-height: 36px;
    font-weight: bold;
    color: #5096F5;
    border: 2px solid #5096F5;
    border-radius: 4px 0 0 4px;
    background: rgba($color: #EDF4FE, $alpha: .1);
  }

  .blank__input {
    flex: 1;
    padding: 5px 10px;
    min-height: 40px;
    line-height: 1.5;
    outline: none;
    border: none;
    appearance: none;
    box-sizing: border-box;
    border: 1px solid #ddd;
    border-left: none;
    border-radius: 0 4px 4px 0;
    background: transparent;
    color: #333;
  }

  .btn-box {
    position: absolute;
    bottom: 0;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 70px;
    border-top: 1px solid #ddd;
    background: #fff;
    z-index: 2;
    .submit-btn {
      width: 120px;
      height: 34px;
      text-align: center;
      line-height: 34px;
      border-radius: 4px;
      background: #5096f5;
      color: #fff;
      cursor: pointer;
      margin: 0 !important;
      &.disable {
        color: #9B9B9B;
        background: #ddd;
      }
    }
    
  }
</style>



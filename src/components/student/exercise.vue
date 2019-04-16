/*
 * @page：学生接收器练习题页面
 * @author: chenzhou
 * @update: 2017.06.06
 * @desc 投票 单选多选等
 *
 */

<template>
  <section class="page-exercise">
    <div :class="['animated', opacity ? 'zoomIn': '']">
      <!-- 练习导航 -->
      <header class="student__header">
        <p class="student__header--back" @click="handleBack"><i class="iconfont icon-fanhui f25"></i></p>
        <h3 class="header-title f18">{{ title }}</h3>
        <p class="student__header--back"></p>
      </header>

      <!-- 定时时间 -->
      <!-- <section class="exercise__timing" v-show="isShowOption && summary&&summary.limit>0&&sLeaveTime">
        <img class="exercise__timing--icon" v-if="!timeOver" src="http://sfe.ykt.io/o_1bkbgjnktcp5182817bgn23rk9.png">
        <img class="exercise__timing--icon" v-if="timeOver" src="http://sfe.ykt.io/o_1bkbgld3vari1isf12f21hsd1irle.png">
        <p :class="['exercise__timing--number', timeOver ? 'over f45':'f60']">{{ sLeaveTime }}</p>
      </section> -->

      <!-- 定时 续时等 -->
      <section class="exercise__tips" v-show="isShowOption">
        <div class="timing" v-if="limit>0 && sLeaveTime && !hasNewExtendTime || timeOver">
          <img class="timing--icon" v-if="!warning&&!timeOver" src="http://sfe.ykt.io/o_1bvu1nd601n5v1dku1k0b1680fi9.png">
          <img class="timing--icon" v-if="warning&&!timeOver" src="http://sfe.ykt.io/o_1bvu1oi7k1v411l4a8e41qtt1uq8e.png">
          <p :class="['timing--number', warning || timeOver ? 'over':'', timeOver ? 'f24':'f32']">{{ sLeaveTime }}</p>
        </div>
        <div class="timing f24" v-else-if="hasNewExtendTime">{{ sExtendTimeMsg }}</div>
        <div class="timing f24" v-else-if="isComplete"><!-- 已完成 -->{{ $t('receiverdone') }}</div>
        <div class="timing f24" v-else><!-- 老师可能会随时结束答题 -->{{ $t('collectprotip') }}</div>
      </section>

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
        <!-- 投票选择提示 -->
        <p class="polling-count f20" v-if="(problemType === 'Polling' || problemType === 'AnonymousPolling') && selectedPollingCount < pollingCount">{{ $t('voteremain', { number: selectedPollingCount }) }}</p>
        <p class="polling-count f20" v-if="summary && !summary.isComplete && (problemType === 'Polling' || problemType === 'AnonymousPolling') && selectedPollingCount === pollingCount">{{ $t('novote') }}</p>
        <p :class="['submit-btn', 'f18', canSubmit === 1 || canSubmit === 2 ? 'can' : '']" v-if="isShowSubmit" @click="handleSubmit">{{ canSubmit|setSubmitText }}{{(problemType === 'AnonymousPolling' && (canSubmit === 0 || canSubmit === 1)) ? $t('anonymous') : ''}}</p>
      </section>

      <!-- 观看者提示文字 返回 -->
      <section v-if="observerMode">
        <p class="f18">{{ $t('watchmode') }}</p>
        <p class="submit-btn can f18" @click="handleBack">{{ $t('back') }}</p>
      </section>

      <div class="commit-diff" v-if="isShowSubmit&&!timeOver"><a class="commit-diff-link f15" :href="commitDiffURL">{{ $t('cannotsubmit') }}？</a></div>

    </div>

    <!-- 图片放大结构 -->
    <section class="pswp J_exercise_pswp" tabindex="-1" role="dialog" aria-hidden="true">

      <div class="pswp__bg"></div>

      <div class="pswp__scroll-wrap">

        <div class="pswp__container">
            <div class="pswp__item"></div>
            <div class="pswp__item"></div>
            <div class="pswp__item"></div>
        </div>

        <div class="pswp__ui pswp__ui--hidden">

          <div class="pswp__top-bar">

            <div class="pswp__counter"></div>

              <div class="pswp__preloader">
                    <div class="pswp__preloader__icn">
                      <div class="pswp__preloader__cut">
                        <div class="pswp__preloader__donut"></div>
                      </div>
                    </div>
              </div>
            </div>

            <div class="pswp__caption">
                <div class="pswp__caption__center"></div>
            </div>

        </div>

      </div>

    </section>

  </section>
</template>
<script>
  import API from '@/util/api'
  import { isSupported } from '@/util/util'

  export default {
    name: 'exercise-page',
    data() {
      return {
        index: 0,
        opacity: 0,
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

        observerMode: false,

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
        commitDiffURL: '/lesson/lesson_submit_difficulties/',
        rate: 1
      };
    },
    components: {
    },
    computed: {
    },
    watch: {
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

        // event消息订阅
        this.initPubSub();

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

          // 投票类型
          if(this.problemType && this.problemType.indexOf('Polling') > -1) {
            this.selectedPollingCount = this.pollingCount = parseInt(this.oProblem['Answer'], 10);
          }

          let result = this.oProblem['Result'];

          result && result.split('').forEach((option) => {
            this.setOptions(option, true, true);
          });

          // data.limit > 0 && this.$parent.startTiming({ problemID: problemID, msgid: this.msgid++ });
          this.sLeaveTime = this.$i18n.t('done') || '已完成';
          this.isComplete = true;
        } else {
          // 开始启动定时
          // data.limit > 0 && this.$parent.startTiming({ problemID: problemID, msgid: this.msgid++ });
          this.$parent.startTiming({ problemID: problemID, msgid: this.msgid++ });
          this.limit = data.limit;

          // 投票类型
          if(this.problemType && this.problemType.indexOf('Polling') > -1) {
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

        // 处理弹出的消息
        this.$parent.msgBoxs.forEach((item, index) => {
          if(item.type === 3 && item.problemID == problemID) {
            this.$parent.msgBoxs.splice(index, 1);
          }
        })
      },

      /*
       * @method 初始化订阅事件
       * @param
       */
      initPubSub() {
        // 取消练习的订阅
        PubSub && PubSub.unsubscribe('exercise');

        // 订阅定时消息
        PubSub && PubSub.subscribe( 'exercise.setTiming', ( topic, data ) => {
          this.setProblemStatus(data);
        });

        // 订阅续时消息
        PubSub && PubSub.subscribe( 'exercise.extendTime', ( topic, data ) => {
          this.extendTime(data && data.problem);
        });

        // 订阅收题消息
        PubSub && PubSub.subscribe( 'exercise.closed', ( topic, data ) => {
          this.closedProblem(data && data.problemid);
        });
      },

      /*
      * @method 问题状态
      * @param
      */
      setProblemStatus(data) {
        let leaveTime = data && data.leaveTime;

        // 不限时
        if(data.limit === -1) {
          this.limit = -1;
          // 是否可以点亮提交按钮
          this.canSubmitFn();
        } else if(data.limit === 0) {
          // 已收题
          this.setTiming(0);
        } else {
          // 限时题目
          this.limit = data.limit;
          this.setTiming(data && data.leaveTime);
        }
      },

      /*
      * @method 设置计时器
      * @param
      */
      setTiming(leaveTime) {
        this.leaveTime = leaveTime > 0 ? leaveTime : 0;

        this.timer && clearInterval(this.timer)

        if (leaveTime > 0) {
          this.timer = setInterval(()=>{
            this.leaveTime--;
            let minutes = parseInt(this.leaveTime / 60, 10);
            let seconds = parseInt(this.leaveTime % 60, 10);
            minutes = minutes < 10 ? '0' + minutes : minutes;
            seconds = seconds < 10 ? '0' + seconds : seconds;

            this.sLeaveTime = minutes + ':' + seconds;

            if(this.leaveTime === 0) {
              this.sLeaveTime = this.$i18n && this.$i18n.t('receivertimeout') || '作答时间结束';

              clearInterval(this.timer);
              this.timeOver = true;
              this.warning = false;
            }

            if(this.leaveTime <= 10 && this.leaveTime > 0) {
              this.warning = true;
            }

          }, 1000)
        } else {
          // 时间到
          this.timeOver = true;
          this.sLeaveTime = this.$i18n && this.$i18n.t('receivertimeout') || '作答时间结束';
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
       * @method 答题续时
       * @params problem
       */
      extendTime(problem) {
        if(problem) {
          let id = problem.prob;
          let extend = problem.extend;
          // 续时 分钟 秒
          let minutes = parseInt(extend / 60, 10);
          let seconds = parseInt(extend % 60, 10);
          let sMsg = minutes > 0 ? this.$i18n.t('extendmin', { minutes: minutes }) || `题目续时 ${minutes}分钟` : this.$i18n.t('extendsec', { seconds: seconds }) || `题目续时 ${seconds}秒`;

          if(extend === -1) {
            sMsg = this.$i18n.t('notimelimit') || '题目不限时';
          }

          // 同一个问题续时 切没有结束
          if(id === this.problemID && !this.isComplete) {
            this.hasNewExtendTime = true;
            this.sExtendTimeMsg = sMsg;

            this.limit = problem.limit;

            if(extend > 0) {
              let leaveTime = this.limit - Math.floor((problem['now'] - problem['dt'])/1000);
              this.setTiming(leaveTime);
            } else if(extend === -1) {
              this.timer && clearInterval(this.timer)
            }

            // 是否可以点亮提交按钮
            this.canSubmitFn();

            //
            this.timeOver === true && (this.timeOver = false);
            this.warning === true && (this.warning = false);

            setTimeout(()=>{
              this.hasNewExtendTime = false;
            }, 3000)
          }
        }
      },

      /*
       * @method 收题
       * @params problemid
       */
      closedProblem(problemid) {
        if(problemid === this.problemID && !this.isComplete) {
          this.setTiming(0);
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
      handleSetOption(option, evt) {
        // let targetEl = event.target;
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
                } else if(data.status_code === 2) {
                  // 用户由于接口时间太长超时了
                  this.$toast({
                    message: `提交失败(错误码：${data.status_code})`,
                    duration: 2000
                  });
                } else {
                  this.$toast({
                    message: this.$i18n.t('sendsuccess') || '提交成功',
                    duration: 2000
                  });
                }

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

      /*
      * @method 图片加载完成
      */
      handlelaodImg(evt) {
        let target = typeof event !== 'undefined' && event.target || evt.target;

        this.width = target.naturalWidth || target.width;
        this.height = target.naturalHeight || target.width;

        this.rate = this.width/this.height;
      },

      /*
      * @method 图片放大
      */
      handleScaleImage(evt) {
        let targetEl = typeof event !== 'undefined' && event.target || evt.target;
        let pswpElement = this.$el.querySelector('.J_exercise_pswp');
        let index = 0;
        let items = [];

        // build items array
        items.unshift({ src: this.summary && this.summary.cover, w: this.width || 750, h: this.height || 520 });

        let options = {
          index: 0,
          maxSpreadZoom: 5,
          showAnimationDuration: 300,
          hideAnimationDuration: 300,
          showHideOpacity: true,

          closeEl: false,
          captionEl: false,
          fullscreenEl: false,
          zoomEl: false,
          shareEl: false,
          counterEl: false,
          arrowEl: false,
          preloaderEl: false,

          tapToClose: true,

          getThumbBoundsFn: function(index) {
            // find thumbnail element
            var thumbnail = targetEl;

            // get window scroll Y
            var pageYScroll = window.pageYOffset || document.documentElement.scrollTop;
            // optionally get horizontal scroll

            // get position of element relative to viewport
            var rect = thumbnail.getBoundingClientRect();

            // w = width
            return {x:rect.left, y:rect.top + pageYScroll, w:rect.width};

          }
        };

        // Initializes and opens PhotoSwipe
        let gallery = new PhotoSwipe(pswpElement, PhotoSwipeUI_Default, items, options);

        gallery.init();
        this.$parent.gallery = gallery;
      },

      /*
      * @method 保存习题答案
      * @param
      */
      saveAnswer(data) {
        let key = 'answer_problem';

        if(isSupported(localStorage)) {
          let answerPostList = JSON.parse(localStorage.getItem(key)) || [];

          data.retry_times = data.retry_times + 1;
          answerPostList.push(data);

          let value = JSON.stringify(answerPostList);

          localStorage.setItem(key, value);
        }
      }
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
      clearInterval(this.timer);
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
    $ 习题定时
  \*------------------*/

  .exercise__tips {
    margin: 0.133333rem auto 0.666667rem;
    width: 9.6rem;
    height: 1.6rem;
    line-height: 1.6rem;

    background: #212121;
    color: #fff;
    opacity: 0.8;

    border-radius: 0.053333rem;
    box-shadow: 0 0.066667rem 0.133333rem rgba(0,0,0,0.2);

    .timing {
      display: flex;
      align-items: center;
      justify-content: center;

      .timing--icon {
        margin-right: 0.453333rem;
        width: 0.853333rem;
        height: 0.933333rem;
      }

      .over.timing--number {
        color: #F84F41;
      }
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

  .polling-count {
    padding-top: 0.25rem;
    text-align: center;
    color: #E64340;
  }

  .submit-btn {
    margin: 0.8rem auto 1.226667rem;

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















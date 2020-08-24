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
        <img class="cover" :src="summary&&summary.cover" @click="handleScaleImage" @load="handleLoadImg" />
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
  import { mapState, mapActions } from 'vuex';
  import API from '@/util/api'
  import { isSupported } from '@/util/util'
  import problemControl from '@/lesson/student/mixin/problem-control'

  export default {
    name: 'exercise',
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
        commitDiffURL: '/lesson/lesson_submit_difficulties/',
        rate: 1
      };
    },
    components: {
    },
    computed: {
      ...mapState([
        'cards',
        'observerMode'
      ])
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
        'setCards'
      ]),

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

        this.oProblem = this.$parent.problemMap.get(problemID)['problem'];
        // 问题类型
        this.problemType = this.oProblem['problemType'];
        // 选项做下兼容
        if(data.options) {
          data.options.forEach((item)=>{
            item.label = item.label || item.key;
          })
        }
        this.options = data.options;

        // 投票类型
        if(this.problemType === 3) {
          this.selectedPollingCount = this.pollingCount = this.oProblem.pollingCount;
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
          this.$parent.startTiming({ problemID: problemID, msgid: this.msgid++ });
          this.limit = data.limit;

          this.options.forEach((item) => {
            // 是否有选项
            if(item.selected) {
              this.canSubmit = 1;
              this.optionsSet.add(item.label);

              this.problemType === 3 && this.selectedPollingCount--;
            }
          })

          // 提交有困难地址
          this.commitDiffURL = this.commitDiffURL + problemID;

          if (process.env.NODE_ENV !== 'production') {
            // this.setTiming(data.limit)
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
      * 1：单选 2：多选 3：投票
      */
      handleSetOption(option) {
        // 提交中或者已完成
        if(this.canSubmit === 2 || this.summary.isComplete || this.timeOver) {
          return this;
        }

        if(this.optionsSet.has(option)) {
          this.setOptions(option, false);
          this.optionsSet.delete(option);

          if(this.problemType === 3) {
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
        let problemID = this.problemID;
        let problem = this.$parent.problemMap.get(problemID)

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
              this.$parent.problemMap.set(problemID, problem);
            }

            this.canSubmit = 3;
            this.sLeaveTime = this.$i18n.t('done') || '已完成';
            this.isComplete = true;
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
            this.$toast({
              message: `提交失败(错误码：${code})`,
              duration: 2000
            });

            this.canSubmit = 0;
            this.oProblem['result'] = null;

            return this;
          }

          setTimeout(() => {
            this.$router.back();
          }, 2000)
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
      },

      /*
      * @method 息屏锁屏检测处理
      * @param
      */
      visibilitychange(evt) {
        if (document.hidden) {
          console.log('息屏锁屏');
        } else {
          let data = this.summary;
          let problemID = data && data.problemID;
          let isComplete = data && data.isComplete;

          if(problemID && !isComplete) {
            let socket = this.$parent.socket;

            if (socket && socket.readyState === 1) {
              setTimeout(()=>{
                this.$parent.startTiming({ problemID: problemID, msgid: this.msgid++ });
              }, 1000)
            } else {
              setTimeout(()=>{
                this.$parent.startTiming({ problemID: problemID, msgid: this.msgid++ });
              }, 2000)
            }
          }

          console.log('息屏锁屏 ->唤醒启用');
        }
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
      // 息屏锁屏检测
      document.addEventListener('visibilitychange', this.visibilitychange);
    },
    beforeDestroy() {
      this.timer && clearInterval(this.timer);
      document.removeEventListener('visibilitychange', this.visibilitychange);
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



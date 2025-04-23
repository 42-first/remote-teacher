/*
 * @page：学生接收器填空题页面
 * @author: chenzhou
 * @update: 2018.08.13
 * @desc 填空题作答，作答结果展示
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
        <img class="cover" :src="summary&&summary.cover" @click="handleScaleImage" @load="handleLoadImg" />
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

    </div>

    <div class="footer" v-if="isShowSubmit" >
      <p :class="['submit-btn', 'f18', canSubmit === 1 || canSubmit === 2 ? 'can' : '']" @click="handleSubmit">{{ canSubmit|setSubmitText }}</p>
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
    name: 'blanks',
    data() {
      return {
        index: 0,
        opacity: 0,
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
    computed: {
      ...mapState([
        'cards',
        'observerMode'
      ])
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

        try {
          // event消息订阅
          this.initPubSub();

          this.oProblem = this.$parent.problemMap.get(problemID)['problem'];
          // 问题类型
          this.problemType = this.oProblem['problemType'];
          this.result = this.oProblem['result'] || this.result;
          // 选项
          let blanks = this.oProblem.blanks;

          // 是否观察者模式
          if(this.observerMode) {
            this.isShowOption = false;
            this.isShowSubmit = false;
          }

          // 是否完成
          if(data.isComplete) {
            this.isShowSubmit = false;
            this.sLeaveTime = this.$i18n.t('done') || '已完成';
            this.isComplete = true;
          } else {
            // 开始启动定时
            this.$parent.startTiming({ problemID: problemID, msgid: this.msgid++ });
            this.limit = data.limit;

            blanks.forEach((item, index) => {
              // 是否有作答
              if(!this.result[index]) {
                this.result[index] = '';
              }
            })

            if (process.env.NODE_ENV !== 'production') {
              // this.setTiming(data.limit)
            }
          }

          setTimeout(()=>{
            this.$el.querySelectorAll('textarea').forEach((ele) => {
              ele.style.height = (ele.scrollHeight) + 'px';
            })
          }, 300)

          this.blanks = blanks;

          setTimeout(()=>{
            this.opacity = 1;
          }, 20)

          // 处理弹出的消息
          this.$parent.msgBoxs.forEach((item, index) => {
            if(item.type === 3 && item.problemID == problemID) {
              this.$parent.msgBoxs.splice(index, 1);
            }
          })
        } catch(error) {
          this.handleBack();
        }
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
        let problem = this.$parent.problemMap.get(problemID)
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
              this.$parent.problemMap.set(problemID, problem);
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

          setTimeout(() => {
            this.$router.back();
          }, 2000)
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

      if(this.summary && this.summary.problemID) {
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
    $ 填空选项
  \*------------------*/

  .blanks__wrap {
    margin-top: 0.266667rem;
    padding: 0.533333rem 0 2rem;

    background: #fff;
  }

  .blanks__header {
    padding-left: 0.293333rem;
    height: 0.746667rem;
    border-left: 0.16rem solid #639EF4;
    font-weight: bold;
    text-align: left;
  }

  .blanks__options {
    padding: 0.533333rem;
  }

  .blank__item {
    display: flex;
    // justify-content: flex-start;
    // align-items: center;

    min-height: 1.066667rem;
    // border: 2px solid #eee;
    // border-left: none;
    // border-radius: 0.106667rem;
  }

  .blank__order {
    display: flex;
    justify-content: center;
    align-items: center;

    width: 1.066667rem;
    min-height: 1.066667rem;
    font-weight: bold;
    color: #5096F5;
    border: 2px solid #5096F5;
    border-radius: 0.106667rem 0 0 0.106667rem;
  }

  .blank__input {
    flex: 1;
    // padding: 0.066667rem 0.266667rem;
    padding: 0.133333rem;
    min-height: 1.066667rem;
    line-height: 1.5;
    outline: none;
    border: none;
    appearance: none;
    box-sizing: border-box;
    border: 2px solid #eee;
    border-left: none;
    border-radius: 0 0.106667rem 0.106667rem 0;
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

  .footer {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100vw;
    height: 1.7067rem;
    box-shadow: 0px -4px 8px 0px #7B87B21A;
    background: #fff;
    padding: 0.2667rem 0.64rem;

    .submit-btn {
      margin: 0 auto;

      width: 7.7333rem;
      height: 1.1733rem;
      background: #999999;
      color: #fff;
      margin: 0 auto;
      border-radius: 44px;
      cursor: pointer;
    }
  }

</style>



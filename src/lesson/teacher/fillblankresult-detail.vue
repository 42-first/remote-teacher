<!--填空题题作答详情面板 -->
<template>
  <div class="problemresultdetail-box">

    <template v-if="loaded">

      <!-- <div class="tab">
        <header class="scroll-wrapper" :style="{width: `${(Object.keys(answer).length + 1.5) * 2.1333}rem`}">
          <v-touch :class="['tab-item', activeTab == -1 ? 'active f20' : 'f18']" v-on:tap="toggleTab(-1)">
            全部{{ $t('total') }}
          </v-touch>
          <v-touch v-for="(value, key) in answer" :key="key" :class="['tab-item', activeTab == key ? 'active f20' : 'f18']" v-on:tap="toggleTab(key)">
            填空{{key}}
          </v-touch>

        </header>

      </div> -->
      <section class="correct-box">
        <header class="header f18"><!-- 正确答案 -->{{ $t('correctanswer') }}</header>
        <ul class="list">
          <li class="item" v-for="(item, index) in answer" :key="index">
            <div class="index f14">
              <p class="wenzi">{{index + 1}}</p>
            </div>
            <span class="cont f17">{{item}}</span>
          </li>

        </ul>
      </section>

      <!-- 有解析显示解析入口 -->
      <p class="analysis--btn f17" v-if="problem && problem.hasRemark" @click="handleVisibleAnalysis"><!-- 答案解析 -->{{ $t('answerkey') }}</p>

      <section class="choice-list">
        <!-- 正确统计 -->
        <div class="choice-item" >
          <v-touch class="item-hd" v-on:tap="toggleChoiceItem(0)">
            <i :class="['iconfont', 'f20', 'icon-correct']"></i>

            <span class="f18 asw"><!-- 正确 -->{{ $t('zhengque') }}</span>
            <span class="f14" style="color: #9B9B9B;">{{correct.length}}{{ $t('ren') }}</span>
            <i :class="['iconfont', 'right', 'f20', 0 === showingIndex ? 'icon-fold' : 'icon-unfold']"></i>
          </v-touch>
          <div :class="['wrong-bd', 'mt20',  {'item-hidden': 0 !== showingIndex}]" >
            <div class="sort-wrapper">
              <span @click="sortActive">
                <span class="color6">作答时长</span>
                <div class="inline-block icon-wrapper">
                  <i :class="{active: !sortType}"></i>
                  <i :class="{active: sortType}"></i>
                </div>
              </span>
            </div>
            <div class="stu" v-for="(stu, sindex) in correct" :key="sindex">
              <img :src="stu.avatar || 'https://qn-sfe.yuketang.cn/o_1bsn23hg89klt0h1lb01p63dd69.jpg'">
              <div class="name-number-wrapper">
                <div class="name-duration">
                  <div class="text-ellipsis name">{{stu.name}}</div>
                  <span class="duration">
                    {{ stu.duration| formatDuration }}
                  </span>
                </div>
                <div class="number">
                  {{ stu.number }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 错误统计 -->
        <div class="choice-item" >
          <v-touch class="item-hd" v-on:tap="toggleChoiceItem(1)">
            <i :class="['iconfont', 'f20', 'icon-wrong']"></i>

            <span class="f18 asw"><!-- 错误 -->{{ $t('cuowu') }}</span>
            <span class="f14" style="color: #9B9B9B;">{{incorrect.length}}{{ $t('ren') }}</span>
            <i :class="['iconfont', 'right', 'f20', 1 === showingIndex ? 'icon-fold' : 'icon-unfold']"></i>
          </v-touch>
          <div :class="['wrong-bd correct', {'item-hidden': 1 !== showingIndex}]" >
            <div class="stu" v-for="stu in incorrect" :key="stu.user_id">
              <img :src="stu.avatar || 'https://qn-sfe.yuketang.cn/o_1bsn23hg89klt0h1lb01p63dd69.jpg'" alt="">
              <div class="cont f15">
                <div class="name">{{stu.name}}</div>
                <div class="stu-answer">
                  <span v-for="(value, index) in stu.result" :key="index" :class="{'wrong': !stu.blankStatus[index]}">{{value}};</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 未答统计 -->
        <div class="choice-item" >
          <v-touch class="item-hd" v-on:tap="toggleChoiceItem(2)">
            <i :class="['iconfont', 'f20', 'icon-weiwancheng', 'color63']"></i>

            <span class="f18 asw"><!-- 未答 -->{{ $t('weida') }}</span>
            <span class="f14" style="color: #9B9B9B;">{{unfinished.length}}{{ $t('ren') }}</span>
            <i :class="['iconfont', 'right', 'f20', 2 === showingIndex ? 'icon-fold' : 'icon-unfold']"></i>
          </v-touch>
          <div :class="['wrong-bd correct', {'item-hidden': 2 !== showingIndex}]" >
            <div class="stu" v-for="stu in unfinished" :key="stu.user_id">
              <img :src="stu.avatar || 'https://qn-sfe.yuketang.cn/o_1bsn23hg89klt0h1lb01p63dd69.jpg'" alt="">
              <div class="ellipsis">{{stu.name}}</div>
            </div>
          </div>
        </div>
      </section>

      <v-touch class="btn-wrapper" :class="{'abs': !isBottomBtnFixed}" v-on:tap="refreshProblemResultDetail">
        <div class="btn">
          <i class="iconfont icon-refresh"></i>
          <div>{{ $t('refresh') }}</div>
        </div>
      </v-touch>
    </template>

    <!-- 解析弹层 -->
    <analysis :problem.sync="problem" :hide-analysis="hideAnalysis" v-if="visibleAnalysis"></analysis>
  </div>
</template>

<script>
  // # 单选
  // PROBLEM_TYPE_MULTIPLE_CHOICE = 1
  // # 多选
  // PROBLEM_TYPE_MULTIPLE_CHOICE_MA = 2
  // # 投票
  // PROBLEM_TYPE_POLLING = 3
  // # 简答
  // PROBLEM_TYPE_SHORT_ANSWER = 5
  // # 匿名投票Anonymous
  // PROBLEM_TYPE_ANONYMOUS_POLLING = 8

  import request from '@/util/request-v3'
  import API from '@/util/api'
  import analysismixin from '@/lesson/common/analysis-mixin'

  export default {
    name: 'FillblankresultDetail',
    data() {
      return {
        problemid: 0,
        showingIndex: 0, // 正在展示的类型的序号 0正确 1错误 2未答
        answer: {},
        isBottomBtnFixed: false,
        isFetching: true,
        activeTab: -1, // 全部 填空1 ...
        answer: [],
        correct: [],
        incorrect: [],
        unfinished: [],
        loaded: false,
        sortType: 0
      }
    },
    components: {
      analysis: () => import('@/lesson/teacher/common/analysis.vue'),
    },
    mixins: [ analysismixin ],
    created() {
      this.init()
    },
    mounted() {
      let self = this
      let wh = window.innerHeight

      // 如果搓到底了，不要到底，防止ios上搓露底
      let boxDom = document.querySelector('.problemresultdetail-box')

      self.isBottomBtnFixed = boxDom.scrollHeight !== boxDom.offsetHeight
      boxDom.addEventListener('scroll', e => {
        self.isBottomBtnFixed = boxDom.scrollHeight !== boxDom.offsetHeight

        if (boxDom.scrollTop === boxDom.scrollHeight - boxDom.offsetHeight) {
          boxDom.scrollTop = boxDom.scrollTop - 2
        }
      })
    },
    filters: {
      formatDuration(cost = 120) {
        const second = cost - Math.floor(cost/60) * 60
        const hours = Math.floor(cost/(60*60))
        const minutes = (cost - second - hours*60*60)/60
        const hoursStr = !!hours ? `${hours}`.padStart(2, 0) + ':' : ''
        const minutesStr = `${minutes}`.padStart(2, 0) + ':'
        const secondStr = `${second}`.padStart(2, 0)
        return `${hoursStr}${minutesStr}${secondStr}`
      }
    },
    methods: {
      /**
       * 复用页面，需要watch route
       *
       */
      init() {
        let self = this

        self.problemid = self.$route.params.problemid
        self.refreshProblemResultDetail()

        this.getProlemById(this.problemid);
      },
      /**
       * 展示隐藏答案选项人名单
       *
       * @event bindtap
       * @param {object} index 被点击的答案项的序号，从0开始
       */
      toggleChoiceItem(index) {
        if (this.showingIndex === index) {
          // 收起
          this.showingIndex = -1
        } else {
          this.showingIndex = index
        }

      },
      /**
       * 更新试题详情的数据
       * 点击打开详情时要主动更新一下数据，所以把本方法放在本父组件中
       *
       */
      refreshProblemResultDetail() {
        let self = this
        let URL = API.lesson.get_blank_detail
        let params = {
          problem_id: self.problemid
        }
        return request.get(URL,params)
        .then((res) => {
          if(res && res.code === 0 && res.data){
            let jsonData = res.data
            self.answer = jsonData.answer
            self.correct = jsonData.correct
            self.incorrect = jsonData.incorrect
            self.unfinished = jsonData.unfinished
            self.loaded = true
          }else if(res.code){
            if(res.code === 50042){
              this.$toast({
                message: i18n.t('code.50042'),
                duration: 3e3
              });
              setTimeout(() => {
                this.$router.back()
              }, 3500);
              
            }
          }
        }).catch(error => {
          console.log('getResult:' + error);
        })
      },
      /**
       * 切换答题状态
       *
       */

      toggleTab(type) {
        let self = this
        // console.log(type);
        self.activeTab = type
      },

      /*
      * 变更顺序
      */
      sortActive() {
        this.sortType = !this.sortType
        this.correct.reverse()
      }

    }
  }
</script>

<style lang="scss" scoped>
  @import "~@/style/_variables";
  @import "~@/style/common_rem";
  .problemresultdetail-box {
    position: relative;
    height: 100%;
    background: $white;
    color: #4A4A4A;
    text-align: center;
    overflow: auto;

    .icon-wrong {
      color: #D0011B;
    }
    .icon-correct {
      color: #7ED321;
    }
    .icon-banduibancuo {
      color: #D0011B;
    }

    .gap {
      height: .133333rem;
      background: #EDF2F6;
    }

    .tab {
      position: relative;
      height: 1.32rem;
      background: $white;
      width: 100%;
      overflow-x: auto;
      border-bottom: 0.0267rem solid #EEEEEE;

      .scroll-wrapper {
        height: 100%;
      }

      .tab-item {
        display: inline-block;
        position: relative;
        width: 2.1333rem;
        height: 100%;
        color: #666666;
        line-height: 1.32rem;
      }

      .active {
        color: #333333;
        // border-bottom: .04rem solid #639EF4;

        &::after {
          content: "";
          position: absolute;
          width: 1.3rem;
          height: 0.04rem;
          bottom: 0;
          left: 50%;
          background: #4F95F5;
          transform: translateX(-50%);
        }
      }
    }

    .correct-box {
      text-align: left;

      .header {
        padding: 0.4rem 0.533333rem;
      }

      .list {
        margin-bottom: 0.5333rem;
        padding: 0 0.533333rem;
      }

      .item {
        display: flex;
        margin-bottom: 0.2667rem;
        min-height: 1.0667rem;
        border: 0.0267rem solid #EEEEEE;
        border-radius: 0.1067rem;

        .index {
          width: 1.0667rem;
          border: 0.0267rem solid #5096F5;
          background: rgba(80,150,245,0.1);
          border-radius: 0.1067rem 0 0 0.1067rem;
          text-align: center;
          color: #5096F5;

          .wenzi {
            position: relative;
            top: 50%;
            transform: translateY(-50%);
          }
        }

        .cont {
          flex: 1;
          padding: 0.2667rem;
          line-height: 1.5;
          color: #333333;
        }
      }
    }

    .choice-list {
      padding-bottom: 1.466667rem;
    }
    .color63{
      color: #639ef4 !important;
    }

    .choice-item {
      .item-hd {
        height: 1.2rem;
        line-height: 1.2rem;
        padding: 0 0.533333rem;
        background: #F6F6F6;
        text-align: left;
        border-top: 1px solid #C8C8C8;

        .asw {
          margin: 0 0.533333rem;
        }
        .right {
          float: right;
        }
      }
      /* 第一个顶部没有border */
      &:first-child .item-hd {
        border-top: 0;
      }

      .mt20 {
        margin-top: px2rem(20px);
      }

      .wrong-bd {
        padding: 0 0.533333rem;
        overflow: hidden;

        .sort-wrapper{
          font-size: px2rem(28px);
          height: px2rem(40px);
          line-height: px2rem(40px);
          text-align: right;
          padding: 0 px2rem(20px);
          .icon-wrapper{
            position: relative;
            height: 100%;
            vertical-align: middle;
            padding-left: px2rem(20px);
            i{
              border-color: #d8d8d8;
              display: block;
              box-sizing: border-box;
              border-left-width:  px2rem(10px);
              border-right-width:  px2rem(10px);
              border-left-color: transparent !important;
              border-right-color: transparent !important;
              border-style: solid;
            }
            i:first-child{
              margin-top:  px2rem(2px);
              border-bottom-width: px2rem(15px);
              border-top-width: 0;
            }
            i:last-child{
              border-bottom-width: 0;
              border-top-width: px2rem(15px);
              margin-top: px2rem(2px);
            }
            i.active{
              border-color: #639ef4;
            }
          }
        }

        .stu {
          display: flex;
          padding: 0.2667rem 0;
          border-bottom: 0.0267rem solid #EEEEEE;
          text-align: left;

          img {
            margin-right: 25px;
            width: 0.9867rem;
            height: 0.9867rem;
            border-radius: 50%;
          }

          .cont {
            flex: 1;

            .name {
              padding-top: 0.0667rem;
              padding-bottom: 0.1067rem;
              color: #333333;
            }

            .stu-answer {
              line-height: 1.5;
              color: #666666;

              span {
                margin-right: 0.0667rem;
              }
              .wrong {
                color: #F84F41;
              }
            }
          }

          .name-number-wrapper{
            flex: 1;
            text-align: left;
            padding-left: px2rem(26px);
            width: px2rem(300px);
            .name-duration{
              line-height: px2rem(45px);
              font-size: px2rem(32px);
              color: #333;
              display: flex;
              .name{
                flex: 1;
              }
              .duration{
                font-size: px2rem(24px);
                color: #9b9b9b;
              }
            }
            .number{
              line-height: px2rem(40px);
              font-size: px2rem(28px);
              color: #9b9b9b;
            }
          }

        }
      }

      .item-hidden {
        display: none;
      }
    }

    .btn-wrapper{
      position: fixed;
      display: inline;
      right: px2rem(50px);
      bottom: px2rem(50px);
      padding: px2rem(25px);
    }
    .btn{
      border-radius: 50%;
      width: px2rem(100px);
      height: px2rem(100px);
      line-height: 1.2;
      box-shadow: 0 px2rem(2px) px2rem(4px) rgba(0,0,0,.2);
      font-size: px2rem(24px);
      padding-top: px2rem(14px);
      i {
        font-size: px2rem(36px);
      }
    }
    .abs {
      position: absolute;
    }
  }

  .analysis--btn {
    margin: 0.533333rem auto;
    width: 7.733333rem;
    height: 1.173333rem;
    line-height: 1.173333rem;

    color: #5096F5;
    cursor: pointer;
    border: 0.026667rem solid #639EF4;
    border-radius: 0.106667rem;

  }
</style>

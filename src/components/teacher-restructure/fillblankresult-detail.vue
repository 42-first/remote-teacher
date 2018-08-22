<!--填空题题作答详情面板 -->
<template>
  <div class="problemresultdetail-box">
    <slot name="ykt-msg"></slot>
    <template v-if="problemResultDetailData">

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
          <li class="item" v-for="(value, key) in answer" :key="key">
            <div class="index f14">
              <p class="wenzi">{{key}}</p>
            </div>
            <span class="cont f17">{{value.join('/')}}</span>
          </li>

        </ul>
      </section>

      <section class="choice-list">
        <!-- 正确统计 -->
        <div class="choice-item" >
          <v-touch class="item-hd" v-on:tap="toggleChoiceItem(0)">
            <i :class="['iconfont', 'f20', 'icon-correct']"></i>

            <span class="f18 asw"><!-- 正确 -->{{ $t('zhengque') }}</span>
            <span class="f14" style="color: #9B9B9B;">{{problemResultDetailData.correct_students.length}}{{ $t('ren') }}</span>
            <i :class="['iconfont', 'right', 'f20', 0 === showingIndex ? 'icon-fold' : 'icon-unfold']"></i>
          </v-touch>
          <div :class="['item-bd', {'item-hidden': 0 !== showingIndex}]" >
            <div class="stu" v-for="stu in problemResultDetailData.correct_students" :key="stu.user_id">
              <img :src="stu.avatar || 'http://sfe.ykt.io/o_1bsn23hg89klt0h1lb01p63dd69.jpg'" alt="">
              <div class="ellipsis">{{stu.name}}</div>
            </div>
          </div>
        </div>

        <!-- 错误统计 -->
        <div class="choice-item" >
          <v-touch class="item-hd" v-on:tap="toggleChoiceItem(1)">
            <i :class="['iconfont', 'f20', 'icon-wrong']"></i>

            <span class="f18 asw"><!-- 错误 -->{{ $t('cuowu') }}</span>
            <span class="f14" style="color: #9B9B9B;">{{problemResultDetailData.incorrect_students.length}}{{ $t('ren') }}</span>
            <i :class="['iconfont', 'right', 'f20', 1 === showingIndex ? 'icon-fold' : 'icon-unfold']"></i>
          </v-touch>
          <div :class="['wrong-bd correct', {'item-hidden': 1 !== showingIndex}]" >
            <div class="stu" v-for="stu in problemResultDetailData.incorrect_students" :key="stu.user_id">
              <img :src="stu.avatar || 'http://sfe.ykt.io/o_1bsn23hg89klt0h1lb01p63dd69.jpg'" alt="">
              <div class="cont f15">
                <div class="name">{{stu.name}}</div>
                <div class="stu-answer">
                  <span v-for="(value, key) in stu.result" :key="key" :class="{'wrong': !stu.correct_blanks.includes(+key)}">{{value}};</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 未答统计 -->
        <div class="choice-item" >
          <v-touch class="item-hd" v-on:tap="toggleChoiceItem(2)">
            <i :class="['iconfont', 'f20', 'icon-weiwancheng']"></i>

            <span class="f18 asw"><!-- 未答 -->{{ $t('weida') }}</span>
            <span class="f14" style="color: #9B9B9B;">{{problemResultDetailData.not_answered.length}}{{ $t('ren') }}</span>
            <i :class="['iconfont', 'right', 'f20', 2 === showingIndex ? 'icon-fold' : 'icon-unfold']"></i>
          </v-touch>
          <div :class="['item-bd correct', {'item-hidden': 2 !== showingIndex}]" >
            <div class="stu" v-for="stu in problemResultDetailData.not_answered" :key="stu.user_id">
              <img :src="stu.avatar || 'http://sfe.ykt.io/o_1bsn23hg89klt0h1lb01p63dd69.jpg'" alt="">
              <div class="ellipsis">{{stu.name}}</div>
            </div>
          </div>
        </div>
      </section>

      <v-touch class="btn f18" :class="{'abs': !isBottomBtnFixed}" v-on:tap="refreshProblemResultDetail">
        <i class="iconfont icon-refresh f30"></i>{{ $t('refresh') }}
      </v-touch>
    </template>
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

  import request from '@/util/request'
  import API from '@/pages/teacher/config/api'

  export default {
    name: 'FillblankresultDetail',
    data() {
      return {
        problemid: 0,
        problemResultDetailData: null, // 试题柱状图详情页数据
        showingIndex: 0, // 正在展示的类型的序号 0正确 1错误 2未答
        answer: {},
        isBottomBtnFixed: false,
        isFetching: true,
        activeTab: -1, // 全部 填空1 ...
      }
    },
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
    methods: {
      /**
       * 复用页面，需要watch route
       *
       */
      init() {
        let self = this

        self.problemid = +self.$route.params.problemid
        self.refreshProblemResultDetail()
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
        let url = API.fill_blank_problem_statistics

        if (process.env.NODE_ENV === 'production') {
          url = API.fill_blank_problem_statistics + '/' + self.problemid + '/'
        }

        // 单次刷新
        request.get(url)
          .then(jsonData => {
            jsonData = jsonData.data
            // 设置试卷详情数据
            self.problemResultDetailData = jsonData
            self.answer = jsonData.answer
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
      }
    }
  }
</script>

<style lang="scss" scoped>
  @import "~@/style/_variables";
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

      .item-bd {
        display: flex;
        flex-wrap: wrap;
        justify-content: flex-start;
        width: 9.066667rem;
        margin: 0.533333rem auto 0;
        overflow: hidden;

        .stu {
          text-align: center;
          margin-right: 0.57687496rem;
          margin-bottom: 0.8rem;
          width: 1.266667rem;
          img {
            width: 0.986667rem;
            height: 0.986667rem;
            border-radius: 50%;
            margin-bottom: 0.386667rem;
          }
          &:nth-child(5n) {
            margin-right: 0;
          }
          &:last-child {
            margin-bottom: 0;
          }
        }
      }

      .wrong-bd {
        padding: 0 0.533333rem;
        overflow: hidden;

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

        }
      }

      .item-hidden {
        display: none;
      }
    }

    .btn {
      position: fixed;
      left: 50%;
      width: 4.093333rem;
      bottom: 0.666667rem;
      transform: translateX(-50%);
      border-radius: 0.106667rem;
      height: 1.466667rem;
      line-height: 1.466667rem;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 0.026667rem 0.053333rem 0 rgba(0,0,0,.5);
      i {
        margin-right: 0.133333rem;
      }
    }
    .abs {
      position: absolute;
    }
  }
</style>

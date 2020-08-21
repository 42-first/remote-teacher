<!--试题作答详情面板 -->
<template>
  <div class="problemresultdetail-box">
    <slot name="ykt-msg"></slot>
    <div v-if="problemResultDetailData">

      <div class="title f18">{{problemResultDetailData.problem_type === 3 || problemResultDetailData.problem_type === 8 ? $t('votemost') : $t('standardopt')}}</div>
      <div :class="['answer-box', {'toomany': answerList.length > 4}]">
        <template v-if="answerList.length">
  	    	<div v-for="(item, index) in answerList" :class="['anser-item', answerList.length > 4 ? 'f36' : 'f50']" :key="index">{{item}}</div>
  	    </template>

        <div v-else-if="!isFetching"><!-- 还没有学生提交 -->{{$t('nosubmit')}}</div>
      </div>
      <div v-if="problemResultDetailData.problem_type === 8" class="anonymous-hint f12"><!-- 本题为匿名投票，不显示投票人 -->{{$t('anonymouspoll')}}</div>

      <!-- 有解析显示解析入口 -->
      <p class="analysis--btn f17" v-if="problem && problem.HasRemark" @click="handleVisibleAnalysis"><!-- 答案解析 -->{{ $t('answerkey') }}</p>

      <div class="tab">
        <v-touch :class="['tab-item', activeTab == 1 ? 'active f16' : 'f17']" v-on:tap="toggleTab(1)">
          {{problemResultDetailData.problem_type === 3 || problemResultDetailData.problem_type === 8 ? $t('yitoupiao') : $t('yizuoda')}}
          <span class="f12">({{answeredNum}}人)</span>
        </v-touch>
        <v-touch :class="['tab-item', activeTab == 2 ? 'active f16' : 'f17']" v-on:tap="toggleTab(2)">
          {{problemResultDetailData.problem_type === 3 || problemResultDetailData.problem_type === 8 ? $t('weitoupiao') : $t('weizuoda')}}
          <span class="f12">({{not_answeredList.length}}人)</span>
        </v-touch>
      </div>
      <div class="choice-list" v-show="activeTab === 1">
        <template v-if="problemResultDetailData.data.length">
  				<div class="choice-item" v-for="(choiceItem, index) in problemResultDetailData.data" :key="index">
  	        <v-touch class="item-hd" v-on:tap="toggleChoiceItem(index)">
  	          <template v-if="problemResultDetailData.problem_type !== 3 && problemResultDetailData.problem_type !== 8">
  			      	<i v-if="!choiceItem.members[0].result_type" :class="['iconfont', 'f20', choiceItem.label === problemResultDetailData.answer ? 'icon-correct' : 'icon-wrong']"></i>
  			      	<i v-if="choiceItem.members[0].result_type === 1" :class="['iconfont', 'f20', 'icon-correct']"></i>
  			      	<i v-if="choiceItem.members[0].result_type === 2" :class="['iconfont', 'f20', 'icon-banduibancuo']"></i>
  			      	<i v-if="choiceItem.members[0].result_type === 3" :class="['iconfont', 'f20', 'icon-wrong']"></i>
		      		</template>
              <span class="f18 asw">{{choiceItem.label}}</span>
              <span class="f14" style="color: #9B9B9B;">{{choiceItem.members.length}}{{ $t('ren') }}</span>
              <i :class="['iconfont', 'right', 'f20', index === showingIndex ? 'icon-fold' : 'icon-unfold']" v-if="problemResultDetailData.problem_type !== 8"></i>
            </v-touch>
            <div :class="['item-bd', {'item-hidden': index !== showingIndex}]" v-if="problemResultDetailData.problem_type !== 8">
              <div class="sort-wrapper">
                <span @click="sortActive(index)">
                  <span class="color6">作答时长</span>
                  <div class="inline-block icon-wrapper">
                    <i :class="{active: !choiceItem.sortType}"></i>
                    <i :class="{active: choiceItem.sortType}"></i>
                  </div>
                </span>
              </div>
              <div class="stu" v-for="(stu, sindex) in choiceItem.members" :key="sindex">
                <img :src="stu.avatar || 'http://sfe.ykt.io/o_1bsn23hg89klt0h1lb01p63dd69.jpg'">
                <div class="name-number-wrapper">
                  <div class="name-duration">
                    <div class="text-ellipsis name">{{stu.name}}</div>
                    <span class="duration">
                      {{ stu.cost|duration }}
                    </span>
                  </div>
                  <div class="number">
                    {{ stu.school_number }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>
        <template v-else>
          <div class="gap"></div>
          <div class="empty">
            <img v-if="problemResultDetailData.problem_type === 1 || problemResultDetailData.problem_type === 2" src="~images/teacher/quanzuoda.png">
            <img v-if="problemResultDetailData.problem_type === 3" src="~images/teacher/quantoupiao.png">
            <img v-if="problemResultDetailData.problem_type === 8" src="~images/teacher/nimingtoupiao.png">
            <p class="f12">{{problemResultDetailData.problem_type === 1 || problemResultDetailData.problem_type === 2 ? $t('quanweida') : $t('quanweitoupiao')}}</p>
          </div>
        </template>
      </div>

      <div class="notAnswerList" v-show="activeTab === 2">
        <template v-if="not_answeredList.length && problemResultDetailData.problem_type !== 8">
          <div class="gap"></div>
          <div class="item-bd">
  					<div class="stu" v-for="(stu, index) in not_answeredList" :key="index">
  	          <img :src="stu.avatar || 'http://sfe.ykt.io/o_1bsn23hg89klt0h1lb01p63dd69.jpg'">
  	          <div class="name-number-wrapper">
                <div class="name-duration">
                  <div class="text-ellipsis name">{{stu.name}}</div>
                </div>
                <div class="number">
                  {{ stu.school_number }}
                </div>
              </div>
  	        </div>
          </div>
        </template>
        <template v-else-if="not_answeredList.length && problemResultDetailData.problem_type === 8">
          <div class="gap"></div>
          <div class="empty">
            <img src="~images/teacher/nimingtoupiao.png">
            <p class="f12">{{$t('nimingtoupiao')}}</p>
          </div>
        </template>
        <template v-else>
          <div class="gap"></div>
          <div class="empty">
            <img v-if="problemResultDetailData.problem_type === 3" src="~images/teacher/quantoupiao.png">
            <img v-if="problemResultDetailData.problem_type === 1 || problemResultDetailData.problem_type === 2" src="~images/teacher/quanzuoda.png">
            <img v-if="problemResultDetailData.problem_type === 8" src="~images/teacher/nimingtoupiao.png">
            <p class="f12">{{problemResultDetailData.problem_type === 1 || problemResultDetailData.problem_type === 2 ? $t('quanyida') : $t('quantoupiao')}}</p>
          </div>
        </template>
      </div>

      <v-touch class="btn-wrapper" :class="{'abs': !isBottomBtnFixed}" v-on:tap="refreshProblemResultDetail">
        <div class="btn">
          <i class="iconfont icon-refresh"></i>
          <div>{{ $t('refresh') }}</div>
        </div>
      </v-touch>
    </div>

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
  import analysismixin from '@/components/common/analysis-mixin'

  export default {
    name: 'CollumresultDetail',
    data() {
      return {
        problemid: 0,
        problemResultDetailData: null, // 试题柱状图详情页数据
        showingIndex: -1, // 正在展示的题目的序号
        answerList: [],
        not_answeredList: [],
        isBottomBtnFixed: false,
        isFetching: true,
        activeTab: 1, // 已投票1，未投票2
        answeredNum: 0    //已作答人数
      }
    },
    components: {
      analysis: () => import('@/components/teacher-restructure/common/analysis.vue'),
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
    methods: {
      /**
       * 复用页面，需要watch route
       *
       */
      init() {
        let self = this

        self.problemid = +self.$route.params.problemid
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
        let url = API.problem_result_detail + '/' + self.problemid + '/'

        if (process.env.NODE_ENV === 'production') {
          url = API.problem_result_detail + '/' + self.problemid + '/'
        }

        // 单次刷新
        request.get(url)
          .then(jsonData => {
            // 多选题判分
            // https://www.tapd.cn/20392061/prong/stories/view/1120392061001001309
            // result_type 0 默认类型；1 多选题全对；2 多选题半对；3 多选题错误
            // 设置试卷详情数据
            self.problemResultDetailData = jsonData


            // 投票类型每回要算投票数最多的
            if (jsonData.problem_type === 3 || jsonData.problem_type === 8) {
              self.findBigPoll()
            } else {
              // 投票类型不打开默认选项
              self.openRightItem(jsonData)
              self.answerList = [...jsonData.answer]

            }

            self.answeredNum = jsonData.answered_count
            self.not_answeredList = [...jsonData.not_answered]
          })
      },
      /**
       * 找到默认打开那一条：投票类型：人数最多；普通题目：正确选项
       *
       * @param {object} jsonData 详情数据
       */
      openRightItem(jsonData) {
        let self = this

        self.showingIndex = self.findRightAnswer(jsonData)
      },
      /**
       * 找出正确选项的序号
       *
       * @param {object} jsonData 详情数据
       */
      findRightAnswer(jsonData) {
        let self = this

        for (let i = 0; i < jsonData.data.length; i++) {
          if (jsonData.data[i].label === jsonData.answer) {
            return i
          }
        }
      },
      /**
       * 算出投票类型的票数最多的选项
       *
       */
      findBigPoll() {
        let self = this
        let url = API.problem_statistics

        if (process.env.NODE_ENV === 'production') {
          url = API.problem_statistics + '/' + self.problemid + '/'
        }

        // 单次刷新
        request.get(url)
          .then(jsonData => {
            let GD = jsonData.graph.data // 柱状图的数据
            let result = {
              'label': '',
              'value': -1
            }
            for (var i = 0; i < GD.length; i++) {
              if (result.value === GD[i].value) {
                result.label += GD[i].label
              } else if (result.value < GD[i].value) {
                result = {
                  'label': GD[i].label,
                  'value': GD[i].value
                }
              }
            }

            self.isFetching = false
            self.problemResultDetailData.answer = result.label
            // self.answerList = [...result.label]
            if (result.value === 0) {
              self.answerList = []
            } else {
              self.answerList = [...result.label]
            }
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
     sortActive(index) {
       this.problemResultDetailData.data.map((a, i) => {
         if (index === i) {
           return Object.assign(a, {
             sortType: !a.sortType,
             members: a.members.reverse()
           })
         }
         return a
       })
     }
    },
    filters: {
      duration(cost = 120) {
        const second = cost - Math.floor(cost/60) * 60
        const hours = Math.floor(cost/(60*60))
        const minutes = (cost - second - hours*60*60)/60
        const hoursStr = !!hours ? `${hours}`.padStart(2, 0) + ':' : ''
        const minutesStr = `${minutes}`.padStart(2, 0) + ':'
        const secondStr = `${second}`.padStart(2, 0)
        return `${hoursStr}${minutesStr}${secondStr}`
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
    .title {
      height: 2.0rem;
      line-height: 2.0rem;
    }

    .answer-box {
      height: 3.066667rem;
      display: flex;
      // align-items: center;
      justify-content: center;

      .anser-item {
        margin: 0 px2rem(10px);
        width: 2.0rem;
        height: 2.0rem;
        line-height: 2.0rem;
        border-radius: 50%;
        background: $blue;
        color: $white;
      }
    }
    .toomany .anser-item {
      width: 1.6rem;
      height: 1.6rem;
      line-height: 1.6rem;
    }

    .gap {
      height: .133333rem;
      background: #EDF2F6;
    }

    .anonymous-hint {
      height: 0.8rem;
      line-height: 0.8rem;
      padding: 0 1.0rem;
      background: #FCF9DC;
      text-align: left;
      color: #9B9B9B;
    }

    .tab {
      position: relative;
      height: 1.306667rem;
      background: $white;
      width: 100%;
      display: flex;
      justify-content: space-around;
      align-items: center;

      &::after {
        content: "";
        position: absolute;
        width: 1px;
        height: 0.586667rem;
        top: 50%;
        left: 50%;
        background: #c8c8c8;
        transform: translate(-50%, -50%);
      }

      .tab-item {
        height: 100%;
        color: #666;
        line-height: 1.306667rem;
        width: 50%;

        span {
          margin-left: .133333rem;
        }
      }

      .active {
        color: #639EF4;
        border-bottom: .04rem solid #639EF4;
      }
    }

    .choice-list, .notAnswerList {
      padding-bottom: px2rem(88px);
    }

    .choice-item,
    .notAnswerList {
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

      .item-bd{
        padding: px2rem(20px);
        overflow: hidden;
        width: 100%;
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
        .stu{
          border-bottom: px2rem(2px) solid #eee;
          width: 100%;
          display: flex;
          padding: 20px;
          img{
            width: px2rem(74px);
            height: px2rem(74px);
            border-radius: 50%;
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
        .stu:last-child{
          border: none;
        }
      }
      .item-hidden {
        display: none;
      }
    }

    .notAnswerList .item-hd {
      border-top: 0;
      color: #9b9b9b;
    }

    .empty {
      width: 100%;
      img {
        display: inline-block;
        margin: 1.333333rem auto .533333rem;
        width: 2.933333rem;
      }

      p {
        margin: 0 auto;
        color: #9b9b9b;
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

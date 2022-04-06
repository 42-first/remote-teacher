<!--填空题条形图组件 被父组件 fillblankresult.vue 引用-->
<template>
	<!-- 中间条形图，画2层，第二层盖在第一层上 -->
  <section class="fillblank-box">
    <!-- 背后格子 -->
    <div class="backgrid f12">
      <div class="grid-item">
        <span class="num">0%</span>
        <span class="line"></span>
      </div>
      <div class="grid-item">
        <span class="num">20%</span>
        <span class="line"></span>
      </div>
      <div class="grid-item">
        <span class="num">40%</span>
        <span class="line"></span>
      </div>
      <div class="grid-item">
        <span class="num">60%</span>
        <span class="line"></span>
      </div>
      <div class="grid-item">
        <span class="num">80%</span>
        <span class="line"></span>
      </div>
      <div class="grid-item">
        <span class="num">100%</span>
        <span class="line"></span>
      </div>
      <div class="rightnum"><!-- {{ $t('zqrs') }} -->人数</div>
    </div>
    
    <!-- 真实数据 -->
    <div class="realdata f14">
      <div class="real-item real-item-qb" v-if="result_graph.length > 2 && curTab == -1">
        <div class="left-bar">
          <span class="desc"><!-- 全部 -->{{ $t('total') }}</span>
          <div class="fill blue" :style="{width: `${correctNum/total*100}%`}"></div>
        </div>
        <div class="rightnum f17">{{correctNum}}</div>	
      </div>

      <div class="real-item" v-for="(item, index) in finalResult" :key="index">
        <div class="left-bar" @click="handleChangeTab(index)">
          <span class="desc" :style="{'opacity': showDesc(item)}">{{curTab == -1 ? index + 1 : curTab + 1}}</span>
          <div class="fill" :class="item.isCorrect && curTab != -1 ? 'blue' : ''" :style="{width: `${item.count/total*100}%`}"></div>
          <div class="answer ellipsis">{{item.label}}</div>
          <div class="detail box-center cfff f14" v-if="blankNum > 1 && !orderInsensitive && curTab == -1 && showEachBlankDetail">
            详情 
            <i class="iconfont icon-dakai f16"></i>
          </div>
        </div>
        <div class="rightnum f17">{{item.count}}</div>
      </div>

    </div>
  </section>
</template>

<script>
	export default {
	  name: 'FillblankBox',
	  props: ['total', 'correctNum', 'result_graph', 'orderInsensitive', 'blankDetail', 'curTab', 'showEachBlankDetail'],
	  data () {
	    return {
	    }
	  },
    computed: {
      blankNum(){
        return this.result_graph.length
      },
      // 当前选中空的错误答案
      curBlankResults() {
        if(!this.showEachBlankDetail) return []

        // 不乱序 多余一个空 
        if(this.blankNum > 1 && !this.orderInsensitive) {
          // 查看某一个空
          if(this.curTab > -1) {
            return this.blankDetail[this.curTab] || []
          }else {
            // 不乱序 全部空时不展示错误答案
            return []
          }
        } else {
          // 乱序 或者 只有一个空时直接取0
          return this.orderInsensitive ? this.blankDetail[0].splice(0,5) : this.blankDetail[0]
        }
        
      },
      // 最终展示答案列表
      finalResult(){
        // 初次打开时还没有获取到数据 会有问题
        if(!this.blankNum) return []

        // 当前选中的全部空tab 且 是多个空
        if(this.curTab == -1 && this.blankNum > 1) {
          // 乱序情况  展示答案的话 正确答案降序排序 错误答案降序排序
          if(this.orderInsensitive) {
            return [...this.result_graph.sort((a,b) => {
              return b.count - a.count
            }), ...this.curBlankResults.sort((a,b) => {
              return b.count - a.count
            })]
          } else {
            // 非乱序 不展示错误答案  直接展示graph
            return this.result_graph
          }
        }else {
          let blank = []
          // 只有一个空 默认是-1 
          if(this.curTab == -1) {
            blank = [this.result_graph[0]]
          }else {
            blank = [this.result_graph[this.curTab]]
          }

          // 展示答案 正确答案排前面  错误答案降序
          return [...blank, ...this.curBlankResults.sort((a, b) => {b.count - a.count})]
        }
      
      },
    },
	  created(){
	  },
	  methods: {
	  	handleChangeTab(index) {
        if(!this.showEachBlankDetail) return 
        this.$emit('changeTab', index)
      },
      showDesc(item){
        if(!this.showEachBlankDetail) return 1

        if(!this.orderInsensitive) {
          return item.isCorrect ? 1 : 0
        }

        return 0
      }
	  }
	}
</script>

<style lang="scss" scoped>
	@import "~@/style/_variables";
  /* 中间条形图 */
  .fillblank-box {
    position: relative;
    margin: 0.5rem auto;
    width: 8.8rem;
    height: 5.0rem;
    border-bottom: 0.0133rem solid #AAAAAA;
  }

  .backgrid {
    display: flex;
    justify-content: space-between;
    height: 100%;
    color: $white;
    opacity: 0.5;

    .grid-item {
      width: 1.24rem;
      display: flex;
      flex-direction: column;
      align-items: center;

      .num {
        padding-bottom: 15px;
      }

      .line {
        flex: 1;
        width: 0;
        border-right: 0.0267rem dashed rgba(255,255,255,0.3);
      }

    }
    .rightnum {
      flex: 1;
    }
  }
  
  .realdata {
    position: absolute;
    left: -0.23rem;
    top: 0.8rem;
    right: 0;
    bottom: 0;
    overflow: auto;
    padding-left: calc(0.62rem + 0.23rem);

    .real-item {
      display: flex;
      align-items: center;
      margin-bottom: 60px;

      .left-bar {
        position: relative;
        width: 6.2rem;
        height: 0.16rem;
        border-radius: 0.08rem;
        background: #333333;

        .desc {
          position: absolute;
          width: 0.9rem;
          left: -0.9rem;
          top: -0.16rem;
        }

        .fill {
          width: 0%;
          height: 100%;
          border-radius: 0.08rem;
          background: #9B9B9B;
          &.blue {
            background: #5096f5;
          }
        }

        .answer, .detail {
          position: absolute;
          left: 0;
          top: 32px;
          max-width: 100%;

          &.detail {
            left: unset;
            right: 0;
          }
        }
      }

      .rightnum {
        flex: 1;
        padding-left: 0.62rem;
      }
    }

    .real-item-qb {
      margin-bottom: 30px;
    }
  }

</style>

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
      <div class="rightnum"><!-- 正确人数 -->{{ $t('zqrs') }}</div>
    </div>
    
    <!-- 真实数据 -->
    <div class="realdata f14">
      <div class="real-item real-item-qb" v-if="Object.keys(result_graph).length > 2">
        <div class="left-bar">
          <span class="desc"><!-- 全部 -->{{ $t('total') }}</span>
          <div class="fill" :style="{width: `${correctNum/total*100}%`}"></div>
        </div>
        <div class="rightnum f17">{{correctNum}}</div>	
      </div>

      <div class="real-item" v-for="key in Object.keys(result_graph)" :key="key">
        <div class="left-bar">
          <span class="desc">{{key}}</span>
          <div class="fill" :style="{width: `${result_graph[key].count/total*100}%`}"></div>
          <div class="answer ellipsis">{{result_graph[key].answer}}</div>
        </div>
        <div class="rightnum f17">{{result_graph[key].count}}</div>
      </div>

    </div>
  </section>
</template>

<script>
	export default {
	  name: 'FillblankBox',
	  props: ['total', 'correctNum', 'result_graph'],
	  data () {
	    return {
	    }
	  },
	  created(){
	  },
	  methods: {
	  	
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
  
  .backbar, .realdata {
    position: absolute;
    z-index: 10;
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
        }

        .answer {
          position: absolute;
          left: 0;
          top: 32px;
          max-width: 100%;
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

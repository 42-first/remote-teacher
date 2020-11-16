<!--延时组件 被父组件 fillblankresult.vue 引用-->
<template>
	<!-- 上部时钟、人数统计 -->
  <div class="xitixushi">
    <!-- 延时相关 -->
    <div class="time-rel f15">
      <v-touch v-if="newTime <= 0 || ~limit" class="tbtn green" v-on:tap="yanshi"><!-- 延时 -->{{ $t('extend') }}</v-touch>
      <div v-else class="tbtn nobtn"><!-- 不限时 -->{{ $t('bxs') }}</div>
    </div>

    <div class="sjd f24" v-show="newTime <= 0"><!-- 作答时间结束 -->{{ $t('receivertimeout') }}</div>

    <!-- 中间秒表 -->
    <div v-show="newTime > 0" :class="['rolex', 'f36', {'warn': newTime <= 10 && ~limit}]">
      <img v-show="!~limit" class="jishi" src="~images/teacher/jishi-zheng.png" alt="">
      <img v-show="~limit && newTime > 10" class="jishi" src="~images/teacher/jishi-dao-w.png" alt="">
      <img v-show="~limit && newTime <= 10" class="jishi" src="~images/teacher/jishi-dao-r.png" alt="">
      <span class="time">{{durationLeft}}</span>
    </div>

    <!-- 收题相关 -->
    <div v-show="newTime > 0" class="pro-rel f15">
      <v-touch class="tbtn red" v-on:tap="shouti"><!-- 收题 -->{{$t('shouti')}}</v-touch>
    </div>
  </div>
</template>

<script>
  
  import {mapGetters} from 'vuex'

	export default {
	  name: 'Rolex',
	  props: ['limit', 'newTime', 'durationLeft', 'problemid'],
	  data () {
	    return {
	    }
	  },
	  created(){
	  },
	  methods: {
	  	/**
	     * 延时
	     *
	     * @event bindtap
	     */
	    yanshi () {
        // 克隆班不能执行当前操作
        if (!!this.isCloneClass) {
          this.$toast({
            message: this.$t('cloneTips'),
            duration: 3e3
          });
          return
        }
	      this.$emit('yanshi')
      },
      /**
	     * 收题
	     *
	     * @event bindtap
	     */
	    shouti () {
        // 克隆班不能执行当前操作
        if (!!this.isCloneClass) {
          this.$toast({
            message: this.$t('cloneTips'),
            duration: 3e3
          });
          return
        }
	      this.$emit('shouti')
      },

    },
    components: {
    },
    computed: {
      ...mapGetters([
        'isCloneClass'
      ])
    }
	}
</script>

<style lang="scss" scoped>
	@import "~@/style/_variables";
  @import "~@/style/common";
  /* 上部 */
  .xitixushi {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 1.866667rem;
    padding: 0 0.3rem;
    background: #212121;

    .sjd {
      padding-right: 1.333333rem;
      color: #F84F41;
    }

    .rolex .time {
      display: inline-block;
      width: 2.666667rem;
    }

    .rolex.warn {
      color: #F84F41;
      .iconfont {
        color: #F84F41;
      }
    }

    .time-rel, .pro-rel {
      align-self: center;
      color: $white;

      .tbtn {
        width: 1.733333rem;
        height: 0.8rem;
        line-height: 0.8rem;
        border: 1px solid #CCCCCC;
        border-radius: 0.4rem;
      }
      .nobtn {
        border: none;
        border-radius: 0.4rem;
        background-color: #282828;
        color: #08BC72;
      }
      .green {
        border-color: #08BC72;
        background-color: rgba(8, 188, 114, 0.2)
      }
      .red {
        border-color: #F84F41;
        background-color: rgba(248, 79, 65, 0.2)
      }
    }
  }

  .jishi {
    margin-top: -0.186667rem;
    width: 0.9rem;
    vertical-align: middle;
  }
  .yjy {
    margin-top: px2rem(32px);
    padding-top: px2rem(20px);
    height: px2rem(62px);
    color: #fff;
    font-size: px2rem(28px);
    display: flex;
    .status{
      flex: 1;
    }
    .hide-answer-wrapper{
      font-size: 0;
      i{
          font-size: px2rem(30px);
        }
      label{
        .hide-answer{
          margin-right: px2rem(10px);
          font-size: px2rem(28px);
        }
        i{
          margin: 0 px2rem(10px);
        }
      }
    }
  }

</style>

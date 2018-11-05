<!--延时组件 被父组件 fillblankresult.vue 引用-->
<template>
	<!-- 上部时钟、人数统计 -->
  <section class="upper">
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
    <hide-some-info :isUserInfo="false" :problemtype="problemtype" :isTouping="isTouping" @change="showAnswerChange" :total="total" :members="members" :problemid="problemid"></hide-some-info>
  </section>
</template>

<script>
	import hideSomeInfo from '@/components/teacher-restructure/common/hideSomeInfo'

	export default {
	  name: 'Rolex',
	  props: ['limit', 'newTime', 'durationLeft', 'total', 'members', 'isTouping', 'problemid', 'problemtype'],
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
	      this.$emit('yanshi')
      },
      /**
	     * 收题
	     *
	     * @event bindtap
	     */
	    shouti () {
	      this.$emit('shouti')
      },
      	/**
			*
			* 隐藏答案
			*
			*
			*/
			showAnswerChange(val) {
        this.$emit('showresult', val)
			}
    },
    components: {
      hideSomeInfo
    }
	}
</script>

<style lang="scss" scoped>
	@import "~@/style/_variables";
  @import "~@/style/common";
  /* 上部 */
  .upper {
    margin: 0 auto;
    width: 9.7rem;
    height: 4.0rem;
    padding-top: 0.8rem;

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
  }

</style>

<!--试题柱状图面板-->
<template>
	<div class="problemresult-box">
		<!-- 关闭按钮 -->
    <v-touch tag="i" class="iconfont icon-close f24" v-on:tap="closeProblemresult"></v-touch>

		<!-- 上部时钟、人数统计 -->
    <section class="upper">
    	<div class="f40" v-if="problemResultData.isBellset">
	      <i class="iconfont icon-clock f40"></i>
	      <span class="time">{{problemDurationLeft}}</span>
	    </div>
	    <div :class="['f18', {pt: !problemResultData.isBellset}]">
	      已经有 <span>1</span> / <span>5</span> 位同学提交了答案
	    </div>
    </section>

    <!-- 中间柱状图 -->
    <section class="histogram-box">
			<div class="histogram-item" v-for="item in problemResultData.graph.data">
        <div :class="['bar', {'right': item.isRight}]" :style="{height: item.value === 0 ? 0 : item.value/problemResultData.total*100+'%'}">
          <span class="value f18">{{item.value}}</span>
          <span class="label f18">{{item.label}}</span>
        </div>
      </div>
    </section>

    <!-- 下方按钮 -->
    <section class="group-btns">
      <v-touch class="btn-item" v-on:tap="postProblemresult">
        <img src="http://sfe.ykt.io/o_1bb62k4e41s1i1r0b1is3nf11tku9.png" />
        <div class="btn-desc f15">投屏</div>
      </v-touch>

      <v-touch class="btn-item" v-on:tap="showProblemresultdetail">
        <img src="http://sfe.ykt.io/o_1bb62l9qvf141gio1q86g6i1pdee.png" />
        <div class="btn-desc f15">查看详情</div>
      </v-touch>

      <v-touch class="btn-item" v-on:tap="">
        <img src="http://sfe.ykt.io/o_1bb62m7q7i8t1c6q1cn4150u1v8vj.png" />
        <div class="btn-desc f15">{{problemResultData.RedEnvelopeID ? '红包名单' : '课堂红包'}}</div>
      </v-touch>
    </section>
  </div>
</template>

<script>
	export default {
	  name: 'RcMaskProblemresult',
	  props: ['lessonid', 'pptData', 'current', 'socket', 'problemResultData', 'problemDurationLeft'],
	  data () {
	    return {
	    }
	  },
	  created(){
	  },
	  methods: {
	  	/**
	     * 关闭试题柱状图的按钮
	     * 涉及设置父组件 data，所以传递事件给父组件
	     *
	     * @event bindtap
	     */
	    closeProblemresult () {
	    	this.$emit('closeProblemresult')
	    },
	    /**
	     * 试题柱状图页面中的公布至屏幕按钮
	     *
	     * @event bindtap
	     */
	    postProblemresult () {
	      let self = this
	      self.data = self // hack 复用小程序代码
	      
	      let current = self.data.current - 1
	      let pptData = self.data.pptData
	      let inPageProblemID = pptData[current].Problem.ProblemID;

	      let str = JSON.stringify({
	        'op': 'postproblemresult',
	        'lessonid': self.data.lessonid,
	        'problemid': inPageProblemID
	      })

	      self.socket.send(str)
	    },
	    /**
	     * 显示试题详情的按钮：查看详情
	     *
	     * @event bindtap
	     */
	    showProblemresultdetail () {
	    	// 数据都是在 remote.vue
	      let self = this
	      self.data = self // hack 复用小程序代码
	      return

	      let current = self.data.current - 1
	      let pptData = self.data.pptData
	      let inPageProblemID = pptData[current].Problem.ProblemID;

	      self.setData({
	        isProblemResultDetailHidden: false
	      })
	      self.refreshProblemResultDetail()
	    },
	  }
	}
</script>
<!-- TODO 柱状图滑动 icon图片？ -->
<style lang="scss" scoped>
	@import "~@/style/_variables";
	.problemresult-box {
	  position: relative;
	  text-align: center;
	  color: $white;

	  .icon-close {
	  	position: absolute;
	  	right: 0.386667rem;
	  	top: 0.44rem;
	  }
		
		/* 上部 */
	  .upper {
	  	margin: 0 auto;
	  	width: 8.8rem;
	  	height: 3.466667rem;
	  	padding-top: 0.8rem;
	  	border-bottom: 1px solid #cccccc;

	  	.pt {
	  		padding-top: 1rem;
	  	}
	  }

	  /* 中间柱状图 */
	  .histogram-box {
	  	margin: 0 auto;
	  	padding-top: 1rem;
	  	width: 8.8rem;
	  	height: 6rem;
		  display: flex;
		  justify-content: space-between;
		  align-items: bottom;
		  
		  .histogram-item {
			  flex: 1;
			  position: relative;
			  border-bottom: 1px solid $white;

			  .bar {
				  position: absolute;
				  left: 50%;
				  bottom: 0;
				  transform: translateX(-50%);
				  width: 0.8rem;
				  background-color: #fff;

					span {
					  position: absolute;
					  width: 100%;
					  left: 0;
					  text-align: center;
					  color: #fff;
					}
					.value {
					  top: -0.746667rem;
					}
					.label {
					  bottom: -0.8rem;
					}
				}
				.right {
				  background-color: $blue;
				}
			}
		}
		
		/* 下方按钮 */
		.group-btns {
			margin: 0 auto;
		  display: flex;
		  align-items: center;
		  justify-content: center;
		  width: 7.466667rem;
		  padding-top: 1.866667rem;

		  .btn-item {
			  flex: 1; 
			  text-align: center;
			  font-size: 30rpx;
			  color: #fff;

			  img {
			  	margin-bottom: 0.4rem;
			  }
			}
		}
	}
</style>

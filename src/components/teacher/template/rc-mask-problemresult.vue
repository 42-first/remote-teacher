<!--试题柱状图面板、试题作答详情面板 被父组件 remote.vue 引用-->
<template>
	<div class="problem-root">
		<!--试题柱状图面板-->
		<div class="problemresult-box">
			<!-- 关闭按钮 -->
	    <v-touch tag="i" class="iconfont icon-shiti_guanbitouping f24" v-on:tap="closeProblemresult"></v-touch>

			<!-- 上部时钟、人数统计 -->
	    <section class="upper">
	    	<div class="f40" v-if="problemResultData.isBellset">
		      <i class="iconfont icon-timing f40"></i>
		      <span class="time">{{problemDurationLeft}}</span>
		    </div>
		    <div :class="['f18', {pt: !problemResultData.isBellset}]">
		      已经有 <span>{{problemResultData.total}}</span> / <span>{{problemResultData.members}}</span> 位同学提交了答案
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
	      	<div class="iconbox" style="background: #28CF6E;">
	      	  <i class="iconfont icon-shiti_touping f28"></i>
	      	</div>
	        <div class="btn-desc f14">投屏</div>
	      </v-touch>

	      <v-touch class="btn-item" v-on:tap="showProblemresultdetail">
	        <div class="iconbox" style="background: #EEBC28;">
	      	  <i class="iconfont icon-shiti_chakanxiangqing f28"></i>
	      	</div>
	        <div class="btn-desc f14">查看详情</div>
	      </v-touch>

	      <v-touch v-show="problemResultData.type !== 'Polling'" class="btn-item" v-on:tap="tapRedpacketHandler">
	        <div class="iconbox" style="background: #E64340;">
	      	  <i class="iconfont icon-shiti_hongbao f28" style="color: #DCBC83;"></i>
	      	</div>
	        <div class="btn-desc f14">{{problemResultData.RedEnvelopeID ? '红包名单' : '课堂红包'}}</div>
	      </v-touch>
	    </section>
	  </div>
		
		<!-- 试题作答详情面板 -->
		<RcMaskProblemresultDetail
			ref="RcMaskProblemresultDetail"
			v-show="!isProblemResultDetailHidden"
			@closeProblemresultdetail="closeProblemresultdetail"
		></RcMaskProblemresultDetail>

		<!-- 试题课堂红包面板 -->
		<RcMaskRedpacket
			ref="RcMaskRedpacket"
			v-show="!isRedpacketHidden"
			:problemid="problemid"
			@giveupBonus="giveupBonus"
			@connectLittleBankSuccess="connectLittleBankSuccess"
		></RcMaskRedpacket>

		<!-- 试题课堂红包名单面板 -->
		<RcMaskRedpacketlist
			ref="RcMaskRedpacketlist"
			v-show="!isRedpacketListHidden"
			:redid="problemResultData.RedEnvelopeID"
			@closeRedpacketList="closeRedpacketList"
		></RcMaskRedpacketlist>
	</div>
</template>

<script>
	// 试题作答详情面板
	import RcMaskProblemresultDetail from '@/components/teacher/template/rc-mask-problemresult-detail'
	// 试题课堂红包面板
	import RcMaskRedpacket from '@/components/teacher/template/rc-mask-redpacket'
	// 试题课堂红包名单面板
	import RcMaskRedpacketlist from '@/components/teacher/template/rc-mask-redpacketlist'

	export default {
	  name: 'RcMaskProblemresult',
	  props: ['lessonid', 'pptData', 'current', 'socket', 'problemResultData', 'problemDurationLeft'],
	  data () {
	    return {
	    	isProblemResultDetailHidden: true,      // 试题回答的详情隐藏
	    	isRedpacketHidden: true,                // 试题的发红包页面隐藏
	    	isRedpacketListHidden: true,            // 试题的红包名单列表页面隐藏
	    }
	  },
	  computed: {
	    problemid: function () {
	      return this.pptData[this.current - 1].Problem.ProblemID
	    }
	  },
	  components: {
	    RcMaskProblemresultDetail,
	    RcMaskRedpacket,
	    RcMaskRedpacketlist
	  },
	  created(){
	  },
	  methods: {
	  	/**
	     * 模仿微信小程序的 setData 用法，简易设置data
	     *
	     * @param {object} newData
	     */
	    setData (newData) {
	      let self = this
	      Object.keys(newData).forEach(attr => {
	        self[attr] = newData[attr]
	      })
	    },
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
	     * 试题柱状图页面中的 投屏 按钮
	     *
	     * @event bindtap
	     */
	    postProblemresult () {
	      let self = this

	      let str = JSON.stringify({
	        'op': 'postproblemresult',
	        'lessonid': self.lessonid,
	        'problemid': self.problemid
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

	      self.setData({
	        isProblemResultDetailHidden: false
	      })
	      self.$refs.RcMaskProblemresultDetail.$emit('refreshProblemResultDetail', self.problemid)
	    },
	    /**
	     * 关闭试题详情的按钮
	     *
	     * @event bindtap
	     */
	    closeProblemresultdetail () {
	      this.setData({
	        isProblemResultDetailHidden: true
	      })
	    },
	    
	    /**
		   * 在柱状图页面中点击按钮显示设置红包页面
		   * 被 rc-mask-problemresult.vue 引用
		   *
		   * @event bindtap
		   */
		  tapRedpacketHandler () {
		    let self = this

		    let REDID = self.problemResultData.RedEnvelopeID
		    let PROBLEMID = self.problemResultData.problemID

		    if (!REDID) {
		      self.showRedpacket()
		    } else {
		      self.showRedpacketList()
		    }
		  },
		  /**
		   * 在柱状图页面中点击按钮显示设置红包页面
		   *
		   */
		  showRedpacket () {
		    let self = this

		    self.setData({
		      isRedpacketHidden: false
		    })

		    self.$refs.RcMaskRedpacket.$emit('fetchStuBank')
		  },
		  /**
		   * 在试题的设置红包页面，点击 “不赏了，返回” 按钮
		   *
		   * @event bindtap
		   */
		  giveupBonus () {
		    this.setData({
		      isRedpacketHidden: true
		    })
		  },
		  /**
		   * 在试题的发红包页面发红包成功后接收子组件传过来的事件
		   * rc-mask-redpacket.vue -> rc-mask-problemresult.vue -> remote.vue
		   * 发送给父组件 remote.vue 设置本试题的红包id，使得课堂红包按钮文案改为红包名单
		   *
		   * @event 子组件 rc-mask-redpacket.vue 传过来的事件
		   * @param {Object} RedEnvelopeID 红包id
		   */
		  connectLittleBankSuccess (RedEnvelopeID) {
		    // 告诉父组件红包发送成功
	    	this.$emit('connectLittleBankSuccess', RedEnvelopeID)
		  },
		  /**
		   * 在已经发送红包的试题的柱状图页面中点击“红包名单”按钮显示红包名单列表页面
		   *
		   */
		  showRedpacketList () {
		    let self = this

		    self.isRedpacketListHidden = false
		    self.$refs.RcMaskRedpacketlist.$emit('refreshRedPacketDetail')
		  },
		  /**
		   * 关闭已经发送红包的试题的红包名单列表页面，返回柱状图页面
		   *
		   * @event bindtap
		   */
		  closeRedpacketList () {
		    let self = this

		    self.setData({
		      isRedpacketListHidden: true
		    })
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
	  background: #000000;

	  .icon-shiti_guanbitouping {
	  	position: absolute;
	  	right: 0.386667rem;
	  	top: 0.44rem;
	  	vertical-align: middle;
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
		  justify-content: space-between;
		  width: 7.466667rem;
		  padding-top: 1.866667rem;

		  .btn-item {
			  width: 1.6rem; 
			  text-align: center;
			  font-size: 30rpx;
			  color: #fff;

			  .iconbox {
			  	margin: 0 auto 0.4rem;
			  	width: 1.493333rem;
			  	height: 1.493333rem;
			  	line-height: 1.493333rem;
			  	text-align: center;
			  	border-radius: 50%;

			  	.iconfont {
			  		color: $white;
			  	}
			  }
			}
		}
	}
</style>

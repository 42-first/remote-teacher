<!--试题课堂红包面板 被父组件 rc-mask-problemresult.vue 引用-->
<template>
	<div class="redpacket-box" >

		<!-- 顶部红色及文案 -->
    <div class="rp-redhead">
      <div class="oval"></div>
      <div class="desc f20" v-show="redPacketDataNS.bonusTotal <= 100">您可以给回答正确且快速的<br>同学发红包以表奖励</div>
      <div class="desc f20" v-show="redPacketDataNS.bonusTotal > 100" style="color: #fff;">
      	单个红包金额不可超过
      	<span class="f36">100</span>元
      </div>
    </div>
		
		<!-- 选取、输入红包个数、金额、确认、取消 的页面 -->
    <div class="action-box">
      <div class="row f18">
      	红包个数
      	<span class="fz14">（班级共{{redPacketDataNS.totalStuNumber}}人）</span>
      </div>
      
      <div class="btn-type" v-show="redPacketDataNS.numInputHidden">
        <div class="choices">
          <div class="btns">
          	<v-touch :class="['choice-item', 'f20', {'chosen': redPacketDataNS.bonusNumber === 3}]" v-on:tap="tapBonusNumber(3)">3</v-touch>
          	<v-touch :class="['choice-item', 'f20', {'chosen': redPacketDataNS.bonusNumber === 5}]" v-on:tap="tapBonusNumber(5)">5</v-touch>
          	<v-touch :class="['choice-item', 'f20', {'chosen': redPacketDataNS.bonusNumber === 10}]" v-on:tap="tapBonusNumber(10)">10</v-touch>
          </div>
          <v-touch class="more f18" v-on:tap="openRPNumInput">更多</v-touch>
        </div>
      </div>
      
      <div class="input-type" v-show="!redPacketDataNS.numInputHidden">
        <div class="input-wrapper">
          <div class="input-box f20">
            <input type="number" placeholder="请输入红包个数" v-model="NUM_INPUT_VALUE" v-on:input="RPNumInputHandler"/>
            <span>个</span>
          </div>
          <v-touch class="back f18" v-on:tap="closeRPNumInput">返回</v-touch>
        </div>
      </div>

      <div class="row f18">
      	红包金额<span class="fz14">（单个红包）</span>
      </div>
      
      <div class="btn-type" v-show="redPacketDataNS.priceInputHidden">
        <div class="choices">
          <div class="btns">
          	<v-touch :class="['choice-item', 'f20', {'chosen': redPacketDataNS.bonusPrice === 0.5}]" v-on:tap="tapBonusPrice(0.5)">￥0.5</v-touch>
          	<v-touch :class="['choice-item', 'f20', {'chosen': redPacketDataNS.bonusPrice === 1}]" v-on:tap="tapBonusPrice(1)">￥1.00</v-touch>
          	<v-touch :class="['choice-item', 'f20', {'chosen': redPacketDataNS.bonusPrice === 2}]" v-on:tap="tapBonusPrice(2)">￥2.00</v-touch>
          </div>
          <v-touch class="more f18" v-on:tap="openRPPriceInput">更多</v-touch>
        </div>
      </div>
      
      <div class="input-type" v-show="!redPacketDataNS.priceInputHidden">
        <div class="input-wrapper">
          <div class="input-box f20">
            <input type="number" placeholder="请填写红包金额" v-model="PRICE_INPUT_VALUE" v-on:input="RPPriceInputHandler" />
            <span>元</span>
          </div>
          <v-touch class="back f18" v-on:tap="closeRPPriceInput">返回</v-touch>
        </div>
      </div>

      <div class="total f40">￥{{redPacketDataNS.bonusTotal}}</div>

      <v-touch :class="['give-btn', 'f20', {'give-active': !redPacketDataNS.isRedpacketDisabled}]" v-bind:enabled="!redPacketDataNS.isRedpacketDisabled" v-on:tap="confirmBonus">打赏</v-touch>
      <v-touch class="giveup give-btn f20" v-on:tap="giveupBonus">不赏了，返回</v-touch>
    </div>

    <!--确认金额页面-->
    <div class="paying-wrapper" v-show="!isRedpacketPayingWrapperHidden">
      <div class="paying-content confirm-box" v-show="payingStep === -1">
	      <!-- 关闭按钮 -->
		    <v-touch tag="i" class="iconfont icon-close f24" v-on:tap="closeRedpacketPayingWrapper"></v-touch>
        <div class="title f18">请确认支付</div>
        <div class="kthb f16">课堂红包</div>
        <div class="total f40">￥{{redPacketDataNS.bonusTotal}}</div>
        <div :class="['wallet', 'f16', {'nbt': redPacketDataNS.wxToPay > 0}]">雨课堂钱包<span class="gray f14">（余额￥<span>{{redPacketDataNS.bankLeft !== -1 ? redPacketDataNS.bankLeft : '加载中...'}}</span>）</span></div>
        <div class="needmoremoney f16" v-show="redPacketDataNS.wxToPay > 0">
          微信钱包
          <span class="gray f14">（支付￥{{redPacketDataNS.wxToPay}}）</span>
        </div>
        <v-touch class="confirm-btn btn f18" v-bind:enabled="redPacketDataNS.bankLeft !== -1" v-on:tap="confirmPay">
          确认支付
        </v-touch>
      </div>
      <div class="paying-content paying f24" v-show="payingStep === 0">
        支付中...
      </div>
      <div class="paying-content pay-success" v-show="payingStep === 1">
        <div class="cg f28">支付成功!</div>
        <div class="wallet f16">
          雨课堂钱包
          <span class="gray f14">（余额￥{{redPacketDataNS.bankLeft}}）</span>
        </div>
        <v-touch class="confirm-btn btn" v-on:tap="confirmPaySuccess">确认</v-touch>
      </div>
      <div class="paying-content pay-fail" v-show="payingStep === 2">
        <div class="cg f28">支付失败!</div>
        <div class="warn f18">零钱已退还至雨课堂钱包</div>
        <v-touch class="confirm-btn btn" bindtap="confirmPayFail">返回</v-touch>
      </div>
    </div>
  </div>
</template>

<script>
	// js功能模块，放到 mixins 中
	// 红包相关函数
	import redpacket from '@/util/teacher-util/redpacket'

	export default {
	  name: 'RcMaskRedpacket',
	  props: ['problemid'],
	  data () {
	    return {
		    isRedpacketPayingWrapperHidden: true,   	// 试题的发红包确认支付页面隐藏
		    NUM_INPUT_VALUE: '',									    // 记录红包个数输入框历史数值
		    PRICE_INPUT_VALUE: '',									  // 记录红包金额输入框历史数值
		    redPacketDataNS: {
		      totalStuNumber: '--',                   // 班级总人数
		      bonusNumber: 3,                         // 红包个数
		      bonusPrice: 0,                          // 红包单个金额
		      bonusTotal: '0.00',                     // 总打赏金额
		      isRedpacketDisabled: true,              // 不能打赏
		      numInputHidden: true,                   // 红包个数输入框隐藏
		      priceInputHidden: true,                 // 红包金额输入框隐藏
		      bankLeft: -1,                           // 雨课堂钱包余额（元）
		      wxToPay: 0,                             // 需要微信支付的金额的展示（元）
		    },
		    payingStep: -1,  // 发红包所处阶段，未发：-1 支付中：0 支付成功：1 支付失败：2
		    
	    }
	  },
	  created(){
	  	let self = this

	  	// 父组件点击 课堂红包 按钮时发送事件给本子组件
	  	self.$on('fetchStuBank', function (msg) {
			  self.fetchStuBank()
			})
	  },
	  mixins: [redpacket],
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
	  }
	}
</script>

<style lang="scss" scoped>
	@import "~@/style/_variables";
	.redpacket-box {
	  position: absolute;
	  left: 0;
	  right: 0;
	  top: 0;
	  bottom: 0;
	  background: $white;
	  color: #4A4A4A;
	  overflow: auto;

	  .rp-redhead {
	  	margin-bottom: 0.4rem;
		  position: relative;
		  box-sizing: border-box;
		  padding-top: 0.96rem;
		  height: 4.08rem;
		  overflow: hidden;
		  line-height: 0.8rem;
		  color: #FFE595;
		  text-align: center;

		  .oval {
			  position: absolute;
			  left: 50%;
			  transform: translate(-50%);
			  bottom: 0;
			  width: 13.333333rem;
			  height: 6.666667rem;
			  background-color: #E64340;
			  border-radius: 50%;
			}

			.desc {
			  position: relative;
			}
		}

		.action-box {
		  padding: 0 0.613333rem;

		  .row {
			  padding: 0.533333rem 0;
			}

			.input-wrapper {
			  display: flex;
			  height: 1.066667rem;
			  line-height: 1.066667rem;

				.input-box {
				  display: flex;
				  flex: 1;
				  align-items: center;
				  padding-right: 0.373333rem;
				  border: 1px solid #C8C8C8;
				  background-color: #EDF2F6;
				  text-align: right;
				  border-radius: 0.08rem;

				  input {
					  flex: 1;
					  background-color: #EDF2F6;
					  border: 0;
					  padding: 0 0.266667rem;
					  text-align: right;
					}
				}
			}

			.choices {
			  height: 1.066667rem;
			  line-height: 1.066667rem;
			  display: flex;

			  .btns {
			  	display: flex;
			  	justify-content: space-between;
			  	flex: 1;

			  	.choice-item {
					  width: 1.973333rem;
					  background-color: #EDF2F6;
					  border-radius: 0.08rem;
					  text-align: center;
					}
					.chosen {
					  background-color: #FFAE00;
					  color: #fff;
					}
			  }
			}

			.more, .back {
				text-align: right;
			  width: 1.333333rem;
			  color: #9B9B9B;
			}

			.total {
			  margin-top: 0.9rem;
			  margin-bottom: 0.266667rem;
			  height: 1.333333rem;
			  text-align: center;
			}

			.give-btn {
			  width: 7.813333rem;
			  height: 1.28rem;
			  line-height: 1.28rem;
			  margin: 0 auto 0.266667rem;
			  background-color: #F08B88;
			  border-radius: 0.08rem;
			  color: #fff;
			  text-align: center;
			}

			.give-active {
			  background-color: #E64340;
			}

			.giveup {
			  background-color: #fff;
			  border: 0;
			  color: #9B9B9B;
			}
		}

		/*支付确认弹层*/
		.paying-wrapper {
		  position: absolute;
		  top: 0;
		  bottom: 0;
		  left: 0;
		  right: 0;
		  background: rgba(0,0,0,0.72);
		  overflow: auto;

		  .paying-content {
			  position: absolute;
			  top: 50%;
			  left: 0.453333rem;
			  right: 0.453333rem;
			  transform: translateY(-50%);
			  padding: 0 0.426667rem;
			  background: $white;
			  border-radius: 0.133333rem;
			  text-align: center;
			  color: #000000;
			}
			.confirm-box {
				.icon-close {
			  	position: absolute;
			  	right: 0.506667rem;
			  	top: 0.506667rem;
			  	color: #9B9B9B;
			  }
			  .title {
				  height: 1.68rem;
				  line-height: 1.68rem;
				  border-bottom: 1px solid #C8C8C8;
				}

				.kthb {
				  height: 0.666667rem;
				  margin-top: 0.453333rem;
				}

				.total {
				  height: 1.6rem;
				}
			}

			.wallet, .needmoremoney {
			  height: 1.066667rem;
			  line-height: 1.066667rem;
			  text-align: left;
			  text-indent: 1.706667rem;
			  border-top: 1px solid #C8C8C8;
			  border-bottom: 1px solid #C8C8C8;
			  background: url(http://sfe.ykt.io/bank.png) 0.8rem center no-repeat;
			  background-size: 0.6rem;
			}
			.wallet.nbt {
				border-bottom: 0
			}
			.needmoremoney {
			  border-top: 0;
			  background-image: url(http://sfe.ykt.io/wxlogo.png);
			}
			.gray {
			  color: #9B9B9B;
			}

			.confirm-btn {
			  margin: 0.426667rem auto;
			  width: 5.44rem;
			  height: 1.066667rem;
			  line-height: 1.066667rem;
			  background-color: #FFAE00;
			}

			.paying {
			  padding: 100px;
			  color: #4A4A4A;
			}

			/*红包支付成功、失败的弹层*/
			.pay-success, .pay-fail {
			  .cg {
			  	height: 2.64rem;
				  line-height: 2.64rem;
				  color: #E64340;
			  }
			  .warn {
			  	color: #9B9B9B;
			  }
			}
		}
	}
</style>

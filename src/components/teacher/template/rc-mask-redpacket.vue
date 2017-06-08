<!--试题课堂红包面板 被父组件 rc-mask-problemresult.vue 引用-->
<template>
	<div class="redpacket-box" >
    <div class="rp-redhead">
      <div class="oval"></div>
      <div class="desc f20">您可以给回答正确且快速的<br>同学发红包以表奖励</div>
      <div class="desc f20" style="display: none; color: #fff;">
      	单个红包金额不可超过
      	<span class="f36">100</span>元
      </div>
    </div>

    <div class="action-box">
      <div class="row f18">
      	红包个数
      	<span class="fz14">（班级共{{redPacketDataNS.totalStuNumber}}人）</span>
      </div>
      
      <div class="btn-type" v-show="redPacketDataNS.numInputHidden">
        <div class="choices clearfix">
          <div class="btns">
          	<div class="choice-item f20 redPacketDataNS.bonusNumber === 3 ? 'chosen' : ''" data-value="3" bindtap="tapBonusNumber">3</div>
          	<div class="choice-item f20 redPacketDataNS.bonusNumber === 5 ? 'chosen' : ''" data-value="5" bindtap="tapBonusNumber">5</div>
          	<div class="choice-item f20 redPacketDataNS.bonusNumber === 10 ? 'chosen' : ''" data-value="10" bindtap="tapBonusNumber">10</div>
          </div>
          <div class="more f18" bindtap="openRPNumInput">更多</div>
        </div>
      </div>
      
      <div class="input-type" v-show="!redPacketDataNS.numInputHidden">
        <div class="input-wrapper">
          <div class="input-box f20">
            <input type="number" placeholder="请输入红包个数" bindinput="RPNumInputHandler"/>
            <span>个</span>
          </div>
          <div class="back f18" bindtap="closeRPNumInput">返回</div>
        </div>
      </div>

      <div class="row f18">
      	红包金额<span class="fz14">（单个红包）</span>
      </div>
      
      <div class="btn-type" v-show="redPacketDataNS.priceInputHidden">
        <div class="choices" data-role="bonusPrice" data-value="0">
          <div class="btns">
          	<div class="choice-item f20 redPacketDataNS.bonusPrice === 0.5 ? 'chosen' : ''" data-value="0.5" bindtap="tapBonusPrice">￥0.5</div>
          	<div class="choice-item f20 redPacketDataNS.bonusPrice === 1 ? 'chosen' : ''" data-value="1" bindtap="tapBonusPrice">￥1</div>
          	<div class="choice-item f20 redPacketDataNS.bonusPrice === 2 ? 'chosen' : ''" data-value="2" bindtap="tapBonusPrice">￥2</div>
          </div>
          <div class="more f18" bindtap="openRPPriceInput">更多</div>
        </div>
      </div>
      
      <div class="input-type" v-show="!redPacketDataNS.priceInputHidden">
        <div class="input-wrapper">
          <div class="input-box f20">
            <input type="number" placeholder="请填写红包金额" bindinput="RPPriceInputHandler" />
            <span>元</span>
          </div>
          <div class="back f18" bindtap="closeRPPriceInput">返回</div>
        </div>
      </div>

      <div class="total f40">￥{{redPacketDataNS.bonusTotal}}</div>

      <v-touch class="give-btn f20 !redPacketDataNS.isRedpacketDisabled ? 'give-active' : ''" :disabled="redPacketDataNS.isRedpacketDisabled" bindtap="confirmBonus">打赏</v-touch>
      <v-touch class="giveup give-btn f20" bindtap="giveupBonus">不赏了，返回</v-touch>
    </div>
    <!--确认金额页面-->
    
  </div>
</template>

<script>
	export default {
	  name: 'RcMaskRedpacket',
	  props: [],
	  data () {
	    return {
	    	redPacketDataNS: {
	    		numInputHidden: true,
	    		priceInputHidden: true
	    	}
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
			  }
				.chosen {
				  background-color: #FFAE00;
				  color: #fff;
				}
			}

			.more, .back {
				text-align: right;
			  width: 1.333333rem;
			  color: #9B9B9B;
			}

			.total {
			  margin-top: 1.2rem;
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
	}
</style>

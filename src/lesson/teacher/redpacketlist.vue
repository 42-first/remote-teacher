<!--试题课堂红包名单页-->
<template>
	<div class="redpacketlist-box">

		<!-- 顶部红色及文案 -->
    <div class="rp-redhead">
      <div class="oval"></div>
      <div class="desc f20" >{{ $t('classbonus') }}</div>
    </div>

    <div class="rplist-wrapper">
      <div class="head f16">
        {{ $t('opened') }} {{issued_count}}/{{totalNum}}, ¥{{issued_money}}/{{totalMoney}}
      </div>
      <div class="list">
        <div class="item f17" v-for="item in list">
        	<div class="left">
        		<img :src="item.profile.avatar" alt="">
        		<div class="desc ellipsis">
        			{{item.profile.name}}<br>
        			<span class="f14">{{item.time2.substring(5)}}</span>
        		</div>
        	</div>
        	<div class="right">{{price}}{{ $t('cny') }}</div>
        </div>
      </div>
    </div>

    <div class="hint f14">{{ $t('refund') }}</div>

    <div class="button-box f18">
      <v-touch class="btn" v-on:tap="refreshRedPacketDetail">{{ $t('refresh') }}</v-touch>
    </div>
   
  </div>
</template>

<script>
	import request from '@/util/request-v3'
	import API from '@/util/api'

	export default {
	  name: 'Redpacketlist',
	  data () {
	    return {
	    	redid: -1,
	    	issued_count: '--',
		    totalNum: '--',
		    issued_money: '--',
		    totalMoney: '--',
		    price: '',
		    list: []
	    }
	  },
	  created(){
	  	this.init()
	  },
	  watch: {
	  	'$route' () {
	  		this.init()
	  	}
	  },
	  methods: {
	  	/**
	     * 复用页面，需要watch route
	     *
	     */
	    init () {
		  	let self = this
		  	self.redid = +self.$route.params.redid
		  	self.refreshRedPacketDetail()
	    },
		  /**
		   * 在已经发送红包的试题的柱状图页面中点击“红包名单”按钮显示红包名单列表页面
		   *
		   */
		  refreshRedPacketDetail () {
		    let self = this

		    // 先清零红包详情
		    self.resetRedPacketDetail()
		    
		    self.getBonusWinner(function(data){
		    	let issued_count = data.issued_count
	        let price = data.amount/(data.quality*100)
	        let issued_money = Number(issued_count * price).toFixed(2)

	        self.issued_count = issued_count
		    	self.totalNum = data.quality
		    	self.issued_money = issued_money
		    	self.totalMoney = (data.amount/100).toFixed(2)
		    	self.price = price
		      self.list = data.issued_user_list
		    })
		  },
		  /**
		   * 清零领取红包的名单
		   *
		   */
		  resetRedPacketDetail () {
		    let self = this

		    self.issued_count = '--'
		    self.totalNum = '--'
		    self.issued_money = '--'
	    	self.totalMoney = '--'
		  },
		  /**
		   * 获取领取红包的名单
		   *
		   * @param {function} fn 回调函数
		   */
		  getBonusWinner (fn) {
		    let self = this
		    let url = API.red_envelope_detail

	      if (process.env.NODE_ENV === 'production') {
	        url = API.red_envelope_detail + '/' + self.redid
	      }

		    // 单次刷新
	      request.get(url)
	        .then(jsonData => {
	        	fn && fn(jsonData.data)
	        })
		  },
	  }
	}
</script>

<style lang="scss" scoped>
	@import "~@/style/_variables";
	/*红包名单列表页面*/
	.redpacketlist-box {
	  position: relative;
	  min-height: 100%;
	  background: $white;
	  color: #333333;
	  overflow: auto;

	  .rp-redhead {
	  	margin-bottom: 0.906667rem;
		  position: relative;
		  box-sizing: border-box;
		  padding-top: 0.96rem;
		  height: 3.08rem;
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

		.rplist-wrapper {
			margin-bottom: 1.066667rem;

		  .head {
			  padding: 0 0.453333rem;
			  height: 1.133333rem;
			  line-height: 1.133333rem;
			  align-items: center;
			  border-bottom: 1px solid #C8C8C8;
			  color: #9B9B9B;
			}

			.item {
			  display: flex;
			  padding: 0 0.453333rem;
			  height: 1.693333rem;
			  align-items: center;
			  border-bottom: 1px solid #C8C8C8;

			  &>div {
				  flex: 1;
				}
				.left {
					display: flex;
					width: 4.0rem;
					img {
						width: 1.2rem;
						height: 1.2rem;
						border-radius: 50%;
						margin-right: 0.4rem;
					}
					.desc {
						line-height: 1.3;
					}
				}
				.right {
					text-align: right;
				}
			}
		}

		.hint {
			text-align: center;
			color: $graybg;
			margin-bottom: 1.6rem;
		}

		.button-box {
			display: flex;
		  position: fixed;
		  left: 0;
		  right: 0;
		  bottom: 0;
		  height: 1.466667rem;
		  text-align: center;

		  .btn {
		  	flex: 1;
		  	border-radius: 0;
			  height: 1.466667rem;
			  line-height: 1.466667rem;
			}
		}
	}
</style>

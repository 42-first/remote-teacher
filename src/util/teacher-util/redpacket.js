/**
 * @module 红包相关：打开红包页面、红包名单、发送红包等
 *
 * 把用于不同组件的函数放到一个mixin中，不同的组件都引用这个mixin，
 * 只不过只是用其中某些自己需要的函数，其他的函数就让他存在。
 * 不要在这里配置 data component 之类，否则会引起错乱
 *
 */

import API from '@/config/api'
let REDID = 0              // 红包id，本模块全局使用
let PROBLEMID = 0          // 试题id，本模块全局使用
let OLD_NUM_INPUT_HIDDEN, OLD_PRICE_INPUT_HIDDEN // 记录之前input框状态，hack输入框层级最高的bug
let payPromise = null      // 发红包的promise
let payPromiseMethod = {}  // 挂载payPromise的 resolve reject 方法

// 处理小数问题
function parsePriceValue (num) {
  // 确保输入最多小数点后2位
  if (num < 0.01)
    return "0.0";
  else {
    var hNum = num * 100;
    var hNumInt = parseInt(hNum);
    if (hNum - hNumInt > 0.999999)
      hNumInt++;

    return hNumInt / 100;
  }
}


export default {
  methods: {
	  /**
	   * 在试题的设置红包页面，点击 “不赏了，返回” 按钮
	   *
	   * @event bindtap
	   */
	  giveupBonus () {
	    self.NUM_INPUT_VALUE = ''

	    this.$emit('giveupBonus')
	  },
	  /**
	   * 在已经发送红包的试题的柱状图页面中点击“红包名单”按钮显示红包名单列表页面
	   *
	   */
	  showRedpacketList () {
	    let self = this

	    // 先清零红包详情
	    self.resetRedPacketDetail()
	    self.setData({
	      isRedpacketListHidden: false
	    })

	    self.getBonusWinner(function(data){
	      let list = data.issued_user_list;
	      let redleft = data.quality - data.issued_count;
	      let moneyleft = redleft*data.amount/data.quality;
	      let redPacketDataNS = self.redPacketDataNS

	      redPacketDataNS.issuedDetail = {
	        list: list,
	        redleft: redleft,
	        moneyleft: moneyleft
	      }
	      self.resetRedPacketDataNS(redPacketDataNS)
	    })
	  },
	  /**
	   * 清零领取红包的名单
	   *
	   */
	  resetRedPacketDetail () {
	    let self = this

	    let redPacketDataNS = self.redPacketDataNS

	    redPacketDataNS.issuedDetail = {
	      list: [],
	      redleft: '--',
	      moneyleft: '--'
	    }
	    self.resetRedPacketDataNS(redPacketDataNS)
	  },
	  /**
	   * 获取领取红包的名单
	   *
	   * @param {function} fn 回调函数
	   */
	  getBonusWinner (fn) {
	    let self = this

	    app.request({
	      url: API.red_envelope_detail + '/' + REDID,
	      method: 'GET',
	      success(DATA) {
	        let data = DATA.data

	        if(data.success){
	          fn && fn(data.data)
	        }
	      },
	      fail(error) {
	        console.log('error', error);
	      }
	    })
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
	  /**
	   * 在红包图页面中点击红包个数按钮
	   *
	   * @event bindtap
	   * @param {number} num 红包个数
	   */
	  tapBonusNumber (num) {
	    let self = this

	    self.redPacketDataNS.bonusNumber = num
	    self.calcBonus()
	  },
	  /**
	   * 在红包图页面中点击红包金额
	   *
	   * @event bindtap
	   * @param {number} price 红包单价
	   */
	  tapBonusPrice (price) {
	    let self = this

	    self.redPacketDataNS.bonusPrice = price
	    self.calcBonus()
	  },
	  /**
	   * 打开红包个数输入框
	   *
	   * @event bindtap
	   */
	  openRPNumInput () {
	    let self = this

	    self.redPacketDataNS.numInputHidden = false
	    self.redPacketDataNS.bonusNumber = self.NUM_INPUT_VALUE || 0

	    self.calcBonus()
	  },
	  /**
	   * 关闭红包个数输入框
	   *
	   * @event bindtap
	   */
	  closeRPNumInput () {
	    let self = this

	    self.redPacketDataNS.numInputHidden = true
	    self.redPacketDataNS.bonusNumber = 0

	    self.calcBonus()
	  },
	  /**
	   * 打开红包金额输入框
	   *
	   * @event bindtap
	   */
	  openRPPriceInput () {
	    let self = this

	    self.redPacketDataNS.priceInputHidden = false
	    self.redPacketDataNS.bonusPrice = self.PRICE_INPUT_VALUE || 0

	    self.calcBonus()
	  },
	  /**
	   * 关闭红包金额输入框
	   *
	   * @event bindtap
	   */
	  closeRPPriceInput () {
	    let self = this
	    
	    self.redPacketDataNS.priceInputHidden = true
	    self.redPacketDataNS.bonusPrice = 0

	    self.calcBonus()
	  },
	  /**
	   * 红包个数输入框事件处理
	   *
	   * @event bindtap
	   * @param {Object} e ev对象
	   */
	  RPNumInputHandler (e) {
	    let self = this
	    let _val = e.target.value
	    let totalStuNumber = self.redPacketDataNS.totalStuNumber

	    // _val是字符串， toFixed方法返回字符串
	    if(_val == parseFloat(_val)){
	      if(_val != parseInt(_val)){
	        _val = Math.floor(_val)
	      }

	      // 班级人数少于100人，则最大100；超过100人，则最大去班级人数
	      if(totalStuNumber <= 100){
	        if(_val > 100){
	          _val = 100
	        }
	      }else{
	        if(_val > totalStuNumber){
	          _val = totalStuNumber
	        }
	      }
	    }else{
	      _val = ''
	    }
	    self.redPacketDataNS.bonusNumber = _val || 0

	    self.calcBonus()
	    self.NUM_INPUT_VALUE = _val
	  },
	  /**
	   * 红包金额输入框事件处理
	   *
	   * @event bindtap
	   * @param {Object} e ev对象
	   */
	  RPPriceInputHandler (e) {
	    let self = this
	    let _val = e.target.value

	    //是数字的话
	    if(_val == parseFloat(_val)){
	        if(_val*100 != parseInt(_val*100)){
	            _val = parsePriceValue(Math.abs(_val));// by wangshuaiguo 2017-02-17 23: 00: 01
	        }
	    }else{
	        _val = '';
	    }

	    self.redPacketDataNS.bonusPrice = _val || 0

	    self.calcBonus()
	    self.PRICE_INPUT_VALUE = _val
	  },
	  /**
	   * 计算红包金额
	   *
	   */
	  calcBonus () {
	    let self = this

	    let bonusNumber = self.redPacketDataNS.bonusNumber
	    let bonusPrice = self.redPacketDataNS.bonusPrice
	    
	    // 注意：整数、字符串不能使用toFixed
	    let temptotal = parsePriceValue(bonusNumber * bonusPrice);// 可能是0，整数、小数（小数可以用toFixed）
	    if(temptotal == 0){
	        temptotal = '0.00';
	    }else if(temptotal == parseInt(temptotal)){
	        // 整数
	        // temptotal = parseFloat(temptotal+'.00')
	        temptotal = temptotal+'.00';
	    }else{
	        temptotal = temptotal.toFixed(2);
	    }

	    if(temptotal == 0 || bonusPrice > 100){
	      self.redPacketDataNS.isRedpacketDisabled = true
	    }else{
	      self.redPacketDataNS.isRedpacketDisabled = false
	    }

	    self.redPacketDataNS.bonusTotal = temptotal
	  },
	  /**
	   * 设置redPacketDataNS数据
	   *
	   */
	  resetRedPacketDataNS (redPacketDataNS) {
	    let self = this
	    self.setData({
	      redPacketDataNS: redPacketDataNS
	    })
	  },
	  /**
	   * 获取学生人数、钱包余额
	   *
	   * @param {Function} fn 回调函数
	   */
	  fetchStuBank (fn) {
	    let self = this

	    app.request({
	      url: API.prepare_red_envelope + '/' + PROBLEMID,
	      method: 'GET',
	      success(DATA) {
	        let data = DATA.data
	        if(data.success){
	          let totalStuNumber = data.data.classroom_students_count;
	          let redPacketDataNS = self.redPacketDataNS
	          let bankLeft = data.data.balance/100;

	          bankLeft = bankLeft.toFixed(2);
	          redPacketDataNS.totalStuNumber = totalStuNumber
	          redPacketDataNS.bankLeft = bankLeft
	          self.resetRedPacketDataNS(redPacketDataNS)

	          fn && fn();
	        }
	      },
	      fail(error) {
	        console.log('error', error);
	      }
	    })
	  },
	  /**
	   * 在试题的设置红包页面，点击 “打赏” 按钮，之后弹出确认金额页面
	   *
	   * @event bindtap
	   */
	  confirmBonus () {
	  	console.log(90001)
	  	return
	    let self = this

	    self.setData({
	      isRedpacketPayingWrapperHidden: false
	    })

	    let redPacketDataNS = self.redPacketDataNS
	    // -1让钱包余额显示加载中
	    redPacketDataNS.bankLeft = -1
	    // 记录输入框的状态后把输入框隐藏掉
	    OLD_NUM_INPUT_HIDDEN = redPacketDataNS.numInputHidden
	    OLD_PRICE_INPUT_HIDDEN = redPacketDataNS.priceInputHidden
	    redPacketDataNS.numInputHidden = true
	    redPacketDataNS.priceInputHidden = true
	    self.resetRedPacketDataNS(redPacketDataNS)

	    // 获取钱包余额,确认微信需要支付多少
	    self.fetchStuBank(() => {
	      let redPacketDataNS = self.redPacketDataNS
	      let bankLeft = redPacketDataNS.bankLeft
	      let bonusTotal = redPacketDataNS.bonusTotal
	      let _wxpay = bonusTotal - bankLeft

	      // 整数使用.toFixed(2)报错
	      if (_wxpay == parseInt(_wxpay)) {
	        _wxpay += '.00'
	      } else {
	        _wxpay = _wxpay.toFixed(2)
	      }

	      redPacketDataNS.wxToPay = _wxpay
	      self.resetRedPacketDataNS(redPacketDataNS)
	    })
	  },
	  /**
	   * 在试题的红包页面，点击 “打赏” 按钮之后弹出的确认金额页面中，最终确认，点击“确认支付”按钮
	   *
	   * @event bindtap
	   */
	  confirmPay () {
	    // 协调要不要使用微信支付、钱包支付，并且回调中重置payingStep为1成功或2失败
	    let self = this
	    let redPacketDataNS = self.redPacketDataNS
	    let bonusTotal = redPacketDataNS.bonusTotal
	    let bonusNumber = redPacketDataNS.bonusNumber
	    let wxToPay = redPacketDataNS.wxToPay

	    self.setData({
	      payingStep: 0
	    })

	    payPromise = new Promise(function(resolve, reject){
	      // 挂载resolve reject函数
	      payPromiseMethod.resolve = resolve
	      payPromiseMethod.reject = reject
	      // 准备花钱
	      if(wxToPay <= 0){
	        // 钱包钱够花
	        self.connectLittleBank()
	      }else{
	        let wxmoney = Math.round(wxToPay*100)
	        // wxmoney = 1// 测试强制只充1分钱
	        self.orderWXPayThenPay(wxmoney, app.globalData.userid, function(res){
	          if(res.success){
	            self.wxpayCallback(res.out_trade_no)
	          }else{
	            payPromiseMethod.reject()
	          }
	        })
	      }
	    }).then(data => {
	      // 最终支付成功，data中包含生成的红包id
	      self.connectLittleBankSuccess(data)
	    }).catch(error => {
	      // 支付失败
	      self.setData({
	        payingStep: 2
	      })
	    })
	  },
	  /**
	   * 微信支付之前向node后端下支付订单，并在获取paySign之后真正发起微信支付
	   *
	   * @event bindtap
	   */
	  orderWXPayThenPay (money, user_id, payCB) {
	    let self = this

	    //money是0，负数，小数都会报错{"status":50000,"message":"invalid total_fee"}
	    app.request({
	      url: API.orderpay,
	      method: 'POST',
	      data: { "money": money, "user_id": user_id, "source": 'mini' },
	      success(DATA) {
	        let jsonData = DATA.data

	        if (jsonData.status === 0) {
	          wx.requestPayment({
	            timeStamp: jsonData.data.timeStamp, // 支付签名时间戳，注意微信jssdk中的所有使用timestamp字段均为小写。但最新版的支付后台生成签名使用的timeStamp字段名需大写其中的S字符
	            nonceStr: jsonData.data.nonceStr, // 支付签名随机串，不长于 32 位
	            package: jsonData.data.package, // 统一支付接口返回的prepay_id参数值，提交格式如：prepay_id=***）
	            signType: jsonData.data.signType, // 签名方式，默认为'SHA1'，使用新版支付需传入'MD5'
	            paySign: jsonData.data.paySign, // 支付签名
	            success: function (res) {
	              console.log('res', res)
	              // 支付成功后的回调函数
	              // 微信jssdk支付和小程序支付的回调不一样，jssdk是 'chooseWXPay:ok'
	              if(res.errMsg == "requestPayment:ok" ) {
	                //支付成功
	                // payCB && payCB('success');
	                payCB && payCB({success: true, out_trade_no: jsonData.data.out_trade_no});
	              }else{
	                  myToast(res.errMsg);
	              }
	            },
	            fail: function(errMsg){
	              console.log('resfail', errMsg)
	              payCB && payCB({success: false, errMsg: 'failorcancel'});
	            }
	          })
	        } else {
	          myToast(jsonData.status + jsonData.message)
	          payPromiseMethod.reject('支付失败')
	        }
	      },
	      fail(error) {
	        console.log('error', error)
	        myToast('微信订单提交失败,请稍后重试！')
	      }
	    })
	  },
	  /**
	   * 微信支付后向node后端确认支付金额已经进入小金库
	   *
	   * @param {number} out_trade_no 微信支付返回id
	   */
	  wxpayCallback (out_trade_no) {
	    let self = this

	    app.request({
	      url: API.payquery,
	      method: 'POST',
	      data: { "out_trade_no": out_trade_no, "source": 'mini'},
	      success(DATA) {
	        let data = DATA.data
	        console.log(data)
	        
	        if(data.status === 0 && data.data.trade_state === 'SUCCESS'){
	          self.connectLittleBank();
	        }else{
	          payPromiseMethod.reject('支付失败')
	        }
	      },
	      fail(error) {
	        console.log('error', error);
	      }
	    })
	  },
	  /**
	   * 向django后端发起红包支付
	   *
	   */
	  connectLittleBank () {
	    let self = this
	    let redPacketDataNS = self.redPacketDataNS
	    let bonusTotal = redPacketDataNS.bonusTotal
	    let bonusNumber = redPacketDataNS.bonusNumber

	    let postData = {
	      'cid': 1,
	      'rid': PROBLEMID,
	      'amount': parseInt((bonusTotal*100).toFixed(0)),
	      'quality': bonusNumber
	    }
	    app.request({
	      url: API.create_red_envelope,
	      method: 'POST',
	      data: postData,
	      success(DATA) {
	        let data = DATA.data
	        if(data.success){
	          payPromiseMethod.resolve(data);
	        }else{
	          payPromiseMethod.reject('支付失败')
	        }
	      },
	      fail(error) {
	        console.log('error', error);
	      }
	    })
	  },
	  /**
	   * 向雨课堂钱包发起的支付成功了（最终的成功）之后的回调函数
	   *
	   * @param {Object} data 支付成功返回，包含红包id
	   */
	  connectLittleBankSuccess (data) {
	    let self = this

	    self.setData({
	      payingStep: 1
	    })

	    // 重置钱包余额
	    self.fetchStuBank()

	    REDID = data.data.id;

	    let current = self.current - 1
	    let _pptData = self.pptData
	    let _problemResultData = self.problemResultData

	    _pptData[current].Problem.RedEnvelopeID = REDID
	    _problemResultData.RedEnvelopeID = REDID

	    self.setData({
	      // 更新 pptData 中的红包id
	      pptData: _pptData,
	      // 让柱状图中的按钮文案立即改变（否则只改上面一个也行）
	      problemResultData: _problemResultData
	    })
	  },
	  /**
	   * 在试题的红包页面，最终确认后，成功，点击“确认”按钮
	   *
	   * @event bindtap
	   */
	  confirmPaySuccess () {
	    let self = this
	    this.setData({
	      isRedpacketHidden: true,
	      isRedpacketPayingWrapperHidden: true,
	      payingStep: -1
	    })
	  },
	  /**
	   * 在试题的红包页面，最终确认后，失败，点击“确认”按钮
	   *
	   * @event bindtap
	   */
	  confirmPayFail () {
	    let self = this
	    this.setData({
	      isRedpacketHidden: true,
	      isRedpacketPayingWrapperHidden: true,
	      payingStep: -1
	    })
	  },
	  /**
	   * 在试题的红包页面，点击 “打赏” 按钮之后弹出的确认金额页面中，取消支付，点击“关闭的X”按钮
	   *
	   * @event bindtap
	   */
	  closeRedpacketPayingWrapper () {
	    let self = this

	    self.restoreInputHiddenStatus()

	    self.setData({
	      isRedpacketPayingWrapperHidden: true
	    })
	  },
	  /**
	   * 恢复红包个数、金额输入框的之前的显示状态
	   *
	   */
	  restoreInputHiddenStatus () {
	    let self = this
	    let redPacketDataNS = self.redPacketDataNS

	    // 恢复输入框的老状态
	    redPacketDataNS.numInputHidden = OLD_NUM_INPUT_HIDDEN
	    redPacketDataNS.priceInputHidden = OLD_PRICE_INPUT_HIDDEN

	    self.resetRedPacketDataNS(redPacketDataNS)
	  }
  }
}
/**
 * 仅用于 redpacket.vue 组件
 * @module 红包相关：打开红包页面、红包名单、发送红包等
 *
 * 把用于不同组件的函数放到一个mixin中，不同的组件都引用这个mixin，
 * 只不过只是用其中某些自己需要的函数，其他的函数就让他存在。
 * 不要在这里配置 data component 之类，否则会引起错乱
 *
 */

import request from '@/util/request'
import {wxpay} from '@/util/wx-util'
import Promise from 'bluebird'
import API from '@/pages/teacher/config/api'

let OLD_NUM_INPUT_HIDDEN, OLD_PRICE_INPUT_HIDDEN // 记录之前input框状态，hack输入框层级最高的bug
let payPromise = null      // 发红包的promise
let payPromiseMethod = {}  // 挂载payPromise的 resolve reject 方法

// 处理小数问题
function parsePriceValue (num) {
  // 确保输入最多小数点后2位
  if (num < 0.01)
    return "0.0"
  else {
    var hNum = num * 100
    var hNumInt = parseInt(hNum)
    if (hNum - hNumInt > 0.999999)
      hNumInt++

    return hNumInt / 100
  }
}


export default {
  methods: {
	  /**
	   * 在红包图页面中点击红包个数按钮
	   *
	   * @event bindtap
	   * @param {number} num 红包个数
	   */
	  tapNumber (num) {
	    let self = this

	    self.bonusNumber = num
	    self.calcBonus()
	  },
	  /**
	   * 在红包图页面中点击红包金额
	   *
	   * @event bindtap
	   * @param {number} price 红包单价
	   */
	  tapPrice (price) {
	    let self = this

	    self.bonusPrice = price
	    self.calcBonus()
	  },
	  /**
	   * 打开红包个数输入框
	   *
	   * @event bindtap
	   */
	  openNumInput () {
	    let self = this

	    self.isNumInputHidden = false
	    self.bonusNumber = self.NUM_INPUT_VALUE || 0

	    self.calcBonus()
	  },
	  /**
	   * 关闭红包个数输入框
	   *
	   * @event bindtap
	   */
	  closeNumInput () {
	    let self = this

	    self.isNumInputHidden = true
	    self.bonusNumber = 0

	    self.calcBonus()
	  },
	  /**
	   * 打开红包金额输入框
	   *
	   * @event bindtap
	   */
	  openPriceInput () {
	    let self = this

	    self.isPriceInputHidden = false
	    self.bonusPrice = self.PRICE_INPUT_VALUE || 0

	    self.calcBonus()
	  },
	  /**
	   * 关闭红包金额输入框
	   *
	   * @event bindtap
	   */
	  closePriceInput () {
	    let self = this
	    
	    self.isPriceInputHidden = true
	    self.bonusPrice = 0

	    self.calcBonus()
	  },
	  /**
	   * 红包个数输入框事件处理
	   *
	   * @event bindtap
	   * @param {Object} e ev对象
	   */
	  numInputHandler (e) {
	    let self = this
	    let _val = e.target.value
	    let stuNumer = self.stuNumer

	    // _val是字符串， toFixed方法返回字符串
	    if(_val == parseFloat(_val)){
	      if(_val != parseInt(_val)){
	        _val = Math.floor(_val)
	      }

	      // 班级人数少于100人，则最大100；超过100人，则最大去班级人数
	      if(stuNumer <= 100){
	        if(_val > 100){
	          _val = 100
	        }
	      }else{
	        if(_val > stuNumer){
	          _val = stuNumer
	        }
	      }
	    }else{
	      _val = ''
	    }
	    self.bonusNumber = _val || 0

	    self.calcBonus()
	    self.NUM_INPUT_VALUE = _val
	  },
	  /**
	   * 红包金额输入框事件处理
	   *
	   * @event bindtap
	   * @param {Object} e ev对象
	   */
	  priceInputHandler (e) {
	    let self = this
	    let _val = e.target.value

	    //是数字的话
	    if(_val == parseFloat(_val)){
	        if(_val*100 != parseInt(_val*100)){
	            _val = parsePriceValue(Math.abs(_val))// by wangshuaiguo 2017-02-17 23: 00: 01
	        }
	    }else{
	        _val = ''
	    }

	    self.bonusPrice = _val || 0

	    self.calcBonus()
	    self.PRICE_INPUT_VALUE = _val
	  },
	  /**
	   * 计算红包金额
	   *
	   */
	  calcBonus () {
	    let self = this

	    let bonusNumber = self.bonusNumber
	    let bonusPrice = self.bonusPrice
	    
	    // 注意：整数、字符串不能使用toFixed
	    let temptotal = parsePriceValue(bonusNumber * bonusPrice)// 可能是0，整数、小数（小数可以用toFixed）
	    if(temptotal == 0){
	        temptotal = '0.00'
	    }else if(temptotal == parseInt(temptotal)){
	        // 整数
	        // temptotal = parseFloat(temptotal+'.00')
	        temptotal = temptotal+'.00'
	    }else{
	        temptotal = temptotal.toFixed(2)
	    }

	    if(temptotal == 0 || bonusPrice > 100){
	      self.isRedpacketDisabled = true
	    }else{
	      self.isRedpacketDisabled = false
	    }

	    self.bonusTotal = temptotal
	  },
	  /**
	   * 获取学生人数、钱包余额
	   *
	   * @param {Function} fn 回调函数
	   */
	  fetchStuBank (fn) {
	    let self = this
	    let url = API.prepare_red_envelope

      if (process.env.NODE_ENV === 'production') {
        url = API.prepare_red_envelope + '/' + self.problemid
      }

      // 单次刷新
      request.get(url)
        .then(jsonData => {
        	let stuNumer = jsonData.data.classroom_students_count
          let bankLeft = jsonData.data.balance/100

          bankLeft = bankLeft.toFixed(2)
          self.stuNumer = stuNumer
          self.bankLeft = bankLeft

          fn && fn()
        }).catch(error => {
        	console.error(error)
        })
	  },
	  /**
	   * 在试题的设置红包页面，点击 “不赏了，返回” 按钮
	   *
	   * @event bindtap
	   */
	  giveupBonus () {
	  	let self = this

	  	self.isPayingWrapperHidden = true
	  	self.payingStep = -1
	    self.NUM_INPUT_VALUE = ''
	    self.$router.go(-1)
	  },
	  /**
	   * 在试题的设置红包页面，点击 “打赏” 按钮，之后弹出确认金额页面
	   *
	   * @event bindtap
	   */
	  confirmBonus () {
	    let self = this

	    self.isPayingWrapperHidden = false
	    // -1让钱包余额显示加载中
	    self.bankLeft = -1
	    // 记录输入框的状态后把输入框隐藏掉
	    OLD_NUM_INPUT_HIDDEN = self.isNumInputHidden
	    OLD_PRICE_INPUT_HIDDEN = self.isPriceInputHidden
	    self.isNumInputHidden = true
	    self.isPriceInputHidden = true

	    // 获取钱包余额,确认微信需要支付多少
	    self.fetchStuBank(() => {
	      let bankLeft = self.bankLeft
	      let bonusTotal = self.bonusTotal
	      let _wxpay = bonusTotal - bankLeft

	      // 整数使用.toFixed(2)报错
	      if (_wxpay == parseInt(_wxpay)) {
	        _wxpay += '.00'
	      } else {
	        _wxpay = _wxpay.toFixed(2)
	      }

	      self.wxToPay = _wxpay
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
	    let bonusTotal = self.bonusTotal
	    let bonusNumber = self.bonusNumber
	    let wxToPay = self.wxToPay

	    self.payingStep = 0

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
	        self.orderWXPayThenPay(wxmoney, function(res){
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
	      self.payingStep = 2
	    })
	  },
	  /**
	   * 微信支付之前向node后端下支付订单，并在获取paySign之后真正发起微信支付
	   *
	   * @event bindtap
	   */
	  orderWXPayThenPay (money, payCB) {
	    let self = this

	    wxpay(money, payCB).catch(() => {
      	payPromiseMethod.reject('支付失败')
      })
	  },
	  /**
	   * 微信支付后向node后端确认支付金额已经进入小金库
	   *
	   * @param {number} out_trade_no 微信支付返回id
	   */
	  wxpayCallback (out_trade_no) {
	    let self = this

	    let url = API.payquery_proxy
	    let postData = {
	    	op: 'query',
	      request_key: Date.now(),
	      data: {
	        "out_trade_no": out_trade_no
	      }
	    }

	    request.post(url, postData)
	    	.then(jsonData => {
        	// 不需要判断success，在request模块中判断如果success为false，会直接reject
	        if(jsonData.status === 0 && jsonData.data.trade_state === 'SUCCESS'){
	          self.connectLittleBank()
	        }else{
	          payPromiseMethod.reject('支付失败')
	        }
        	
        }).catch(() => {
        	payPromiseMethod.reject('支付失败')
        })
	  },
	  /**
	   * 向django后端发起红包支付
	   *
	   */
	  connectLittleBank () {
	    let self = this
	    let bonusTotal = self.bonusTotal
	    let bonusNumber = self.bonusNumber

	    let postData = {
	      'cid': 1,
	      'rid': self.problemid,
	      'amount': parseInt((bonusTotal*100).toFixed(0)),
	      'quality': bonusNumber
	    }

	    request.post(API.create_red_envelope, postData)
        .then(jsonData => {
        	// 不需要判断success，在request模块中判断如果success为false，会直接reject
          payPromiseMethod.resolve(jsonData)
        })
	  },
	  /**
	   * 向雨课堂钱包发起的支付成功了（最终的成功）之后的回调函数
	   *
	   * @param {Object} jsonData 支付成功返回，包含红包id
	   */
	  connectLittleBankSuccess (jsonData) {
	    let self = this
	    // 红包id： data.data.id
    	// 在柱状图页获取数据会获取 红包id，不用在这里传数据

	    self.payingStep = 1
	    console.log('支付成了')

	    // 重置钱包余额
	    self.fetchStuBank()
	  },
	  /**
	   * 在试题的红包页面，最终确认后，成功，点击“确认”按钮
	   *
	   * @event bindtap
	   */
	  confirmPaySuccess () {
	    let self = this
	    
	    // 关闭红包页面
	    self.giveupBonus()
	  },
	  /**
	   * 在试题的红包页面，最终确认后，失败，点击“确认”按钮
	   *
	   * @event bindtap
	   */
	  confirmPayFail () {
	    let self = this
	    
	    // 关闭红包页面
	    self.giveupBonus()
	  },
	  /**
	   * 在试题的红包页面，点击 “打赏” 按钮之后弹出的确认金额页面中，取消支付，点击“关闭的X”按钮
	   *
	   * @event bindtap
	   */
	  closePayingWrapper () {
	    let self = this

	    self.restoreInputHiddenStatus()
	    self.isPayingWrapperHidden = true
	  },
	  /**
	   * 恢复红包个数、金额输入框的之前的显示状态
	   *
	   */
	  restoreInputHiddenStatus () {
	    let self = this

	    // 恢复输入框的老状态
	    self.isNumInputHidden = OLD_NUM_INPUT_HIDDEN
	    self.isPriceInputHidden = OLD_PRICE_INPUT_HIDDEN
	  }
  }
}
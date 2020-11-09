/*
 * @author: zimyuan
 * @last-edit-date: 2015-11-27
 * @depend: none
 http://yuanzm.github.io/preventoverscrolljs/
 */

 /**
  * @author: liujunyang
  * 添加了 dontcallback allowscrollcallback 两种 class 的判断
  * 1. allowscrollcallback 的元素及子元素允许搓动
  * 2. dontcallback  的元素及子元素不允许搓动（主要是用在 allowscrollcallback 内不允许搓动的元素）
  *
  * 注：hack 的部分 有 hack xuetangx ljy 等关键词标志
  *
  */

 /* eslint-disable */
(function(win, doc) {
    'use strict';

    //hack xuetangx ljy 查找当前元素及其各级父元素中有没有dontcallback，有的话，可以判断为不执行tap swipe的函数
    function findClass(target, classstr){
        if(target.className.indexOf(classstr) != -1){
            //本身就是拥有dontcallback的class
            return true;
        }else{
            if(target.parentElement){
                return findClass(target.parentElement, classstr);
            }else{
                return false;
            }
        }
    }

    var startMoveYmap = {}, // 用于暂存元素开始滑动的起始位置
        // 组件默认配置
        _defaultConfig = {
            list           : [],
            containerClass : 'prevent-overscroll-container',
            styleId        : 'prevent-overscroll-style',
            styleStr       : '{overflow-y: scroll; -webkit-overflow-scrolling: touch;}'
        };
    /*
     * 微信里面放置下拉`露底`组件
     * @param {Object} options: 组件配置
     *
     * 调用方法
     * 1. 引用组件对应的脚本文件
     * 2. 给需要设定防止拉动漏黑底的元素设置id
     * 3. 可以使用与window对象绑定的组件实例`preventMoveOverScroll`,也可以自己实例化组件
     */
    function PreventMoveOverScroll(options, touchOpFunc) {
        // 通过深拷贝，扩展(替换)默认配置
        this.touchOpFunc = touchOpFunc;
        this.config = extend(_defaultConfig, options);
        this.init();

    }
    PreventMoveOverScroll.prototype = {

        // 组件初始化
        init: function() {
            this.initStyle();                   // 添加辅助样式
            this.initstartMoveMap();            // 初始滑动起始位置
            this.bindEvent(this.config.list);   // 为组件元素绑定事件处理程序
        },
        // 为容器添加类名和样式
        initStyle: function() {
            var i, il, item;

            if (checkDeviceType('ios')) {
                for (i = 0, il = this.config.list.length; i < il; i++) {
                    item = doc.getElementById(this.config.list[i]);
                    if (!item) continue;
                    item.className += ' prevent-overscroll-container';
                }
                this.appendStyle();
            }
        },
        // 为组件添加辅助样式
        appendStyle: function() {
            if (doc.getElementById(this.config.styleId)) return;
            var style = doc.createElement('style');
            style.id = this.config.styleId;
            style.innerHTML = '.' + this.config.containerClass + this.config.styleStr;
            doc.getElementsByTagName('head')[0].appendChild(style);
        },
        // 初始化所有元素的起始位置
        initstartMoveMap: function() {
            var map = this.config.list;
            for (var i = 0, il = map.length; i < il; i++) {
                startMoveYmap[map[i]] = 0;
            }
        },
        // 元素开始滑动的时候记录元素的起始位置
        startMove: function(e) {
            e = e || win.event;
            var ele = this;
            console.log('startMove.e', e)
            // 针对微信 6.6.6 版本下安卓手机点击遥控器图片翻页的时候，会全屏显示图片，进行处理
            if (e.target.tagName === 'IMG') {
                e.preventDefault()
            }

            // xuetangx
            ele.timeStamp = e.timeStamp;
            ele.swipeDown = false;
            ele.swipeUp = false;
            // xuetangx END

            startMoveYmap[this.id] = e.touches[0].clientY;
        },
        
        // xuetangx 元素结束滑动的时候判断手指的动作，从而区分tap swipeDown swipeUp
        endMove: function(e, _this) {
            var e = e || window.event,
                ele = _this,
                currentY = e.changedTouches[0].clientY,
                startY = startMoveYmap[ele.id],
                direction = '',
                isTap;//判断是不是tap

            var opAction = {};

            isTap = ((e.timeStamp - ele.timeStamp)<150 && Math.abs(currentY - startY)<20) ? true : false;

            opAction.isTap = isTap;
           
            if(ele.swipeDown && ele.swipeUp){
                //手指来回拨了
                opAction.isUpAndDown = true;
            }else{
                //手指向上，即swipeUp

                //划拨距离短视为无效
                if(Math.abs(currentY - startY) < 50){
                    opAction.isTooShort = true;
                }else{
                    opAction.isSwipeDown = ele.swipeDown;
                }
            }
            
            //不需要tap swipeUp swipeDown事件的目标dom上，加dontcallback的class即可
            /*if(e.target.className.indexOf('dontcallback') == -1){
                this.touchOpFunc && this.touchOpFunc(opAction);
            }*/
            if(!findClass(e.target, 'dontcallback')){
                this.touchOpFunc && this.touchOpFunc(opAction);
            }
        },
        // xuetangx END  元素结束滑动的时候判断手指的动作，从而区分tap swipeDown swipeUp

        // 防止过分拉动
        preventMove: function(e) {
            // 高位表示向上滚动, 底位表示向下滚动: 1容许 0禁止
            var status = '11',
                e = e || window.event,
                ele = this,
                currentY = e.touches[0].clientY,
                startY = startMoveYmap[ele.id],
                scrollTop = ele.scrollTop,
                offsetHeight = ele.offsetHeight,
                scrollHeight = ele.scrollHeight;

            if(currentY > startY){
                ele.swipeDown = true;
            }else{
                ele.swipeUp = true;
            }

            if (scrollTop === 0) {
                // 如果内容小于容器则同时禁止上下滚动
                status = offsetHeight >= scrollHeight ? '00' : '01';
            } else if (scrollTop + offsetHeight >= scrollHeight) {
                // 已经滚到底部了只能向上滚动
                status = '10';
            }
            if (status != '11') {
                // 判断当前的滚动方向
                var direction = currentY - startY > 0 ? '10' : '01';
                
                // xuetangx 
                // 操作方向和当前允许状态求与运算，运算结果为0，就说明不允许该方向滚动，则禁止默认事件，阻止滚动
                // 可能在不允许过度搓动的大框里面有一个小框是允许滚动条的。这里以 class '.allowscrollcallback'作为标志
                // 只有在3中情况禁止搓动页面（露底）：
                //      父元素没有.allowscrollcallback
                //      父元素是overflow:scroll的，有.allowscrollcallback，搓到顶了
                //      父元素是overflow:scroll的，有.allowscrollcallback，搓到底了

                var isStopMovePage = false;

                if(!findClass(e.target, 'allowscrollcallback')){
                    isStopMovePage = true;
                }else{
                    var $sc = $(e.target).closest('.allowscrollcallback');
                    // overflow:scroll的元素搓到顶了
                    var isScrollToTop = ($sc.scrollTop() <= 0 && direction == '10');
                    // overflow:scroll的元素搓到底了
                    var isScrollToBottom = $sc.scrollTop() + $sc.height() >= $sc[0].scrollHeight && direction == '01'

                    if(isScrollToTop || isScrollToBottom){
                        isStopMovePage = true;
                    }
                }

                if(isStopMovePage){
                    e.preventDefault();
                    e.stopPropagation();
                }
                return;
                // xuetangx END
            }
        },
        // 绑定事件处理程序
        bindEvent: function(eleArr) {
            var elem, _oSelf = this,
                error;

            for (var i = 0, il = eleArr.length; i < il; i++) {
                elem = document.getElementById(eleArr[i]);
                if (!elem) {
                    error = 'elem ' + eleArr[i] + 'is not exist!';
                    throw error;
                }
                addEvent(elem, 'touchstart', _oSelf.startMove);
                addEvent(elem, 'touchmove', _oSelf.preventMove);
                addEvent(elem, 'touchend', function(e){
                    if (e.target.className.indexOf('note') > -1) {
                        return
                    }
                    _oSelf.endMove(e, this);
                });
            }
        },
        push: function(id) {
            var item;

            if (id in startMoveYmap) return;
            this.config.list.push(id);
            startMoveYmap[id] = 0;
            item = doc.getElementById(id);
            item.className += this.config.containerClass;
            this.bindEvent([id]);
        },
        pop: function(id) {
            var _oSelf = this,
                elem = doc.getElementById(id);

            delete startMoveYmap[id];
            removeEvent(elem, 'touchstart', _oSelf.startMove);
            removeEvent(elem, 'touchmove', _oSelf.preventMove);
            removeEvent(elem, 'touchend', _oSelf.endMove);
        }
    }

    win.PreventMoveOverScroll = PreventMoveOverScroll;
    // win.preventMoveOverScroll = new PreventMoveOverScroll({
    //     list: ['container']
    // });
    // ----------------------------------------- 辅助函数 -------------------------------------------------
        /*
         * 检测设备类型
         * @param {String} type: 设备类型代称: ios || android
         * @return {Boolean}: 检测结果
         */
    function checkDeviceType(type) {
        var agent = navigator.userAgent,
            _isAndroid = /(Android)/i.test(agent),
            _isiOS = /(iPhone|iPad|iPod|iOS)/i.test(agent) && !_isAndroid;

        return type == 'ios' ? _isiOS : _isAndroid;
    }
    /*
     * 绑定事件处理程序的兼容性写法
     * @param {HTMLElement} dom: 需要绑定事件处理程序的DOM节点
     * @param {String} eType: 需要绑定的事件类型
     * @param {Function} handler: 绑定的事件 
     */
    function addEvent(dom, eType, handler) {
        if (dom.addEventListener) {
            dom.addEventListener(eType, handler, false);
        } else if (dom.attachEvent) {
            dom.attachEvent("on" + eType, handler);
        } else {
            dom["on" + eType] = handler;
        }
    }
    /*
     * 去除事件处理程序的兼容性写法
     * @param {HTMLElement} dom: 需要绑定事件处理程序的DOM节点
     * @param {String} eType: 需要绑定的事件类型
     * @param {Function} handler: 绑定的事件 
     */
    function removeEvent(dom, eType, handler) {
        if (dom.removeEventListener) {
            dom.removeEventListener(eType, handler, false);
        } else if (dom.detachEvent) {
            dom.detachEvent('on' + eType, handler);
        } else {
            dom["on" + eType] = null;
        }
    }
    /*
     * 判断JavaScript对象类型的函数
     * @param obj:任意的数据类型
     * @param {String} type: 对象类型 Array | Object | ... 
     */
    function is(obj, type) {
        var toString = Object.prototype.toString,
            undefined;
        return (type === 'Null' && obj === null) ||
            (type === "Undefined" && obj === undefined) ||
            toString.call(obj).slice(8, -1) === type;
    }
    /*
     * 深拷贝函数
     * @param {Object} oldObj: 被拷贝的对象
     * @param {Object} newObj: 需要拷贝的对象
     * @ return {Object} newObj: 拷贝之后的对象
     */
    function extend(oldObj, newObj) {
        for (var key in oldObj) {
            var copy = oldObj[key];
            if (oldObj === copy || key in newObj) continue; //如window.window === window，会陷入死循环，需要处理一下
            if (is(copy, "Object")) {
                newObj[key] = extend(copy, newObj[key] || {});
            } else if (is(copy, "Array")) {
                newObj[key] = [];
                newObj[key] = extend(copy, newObj[key] || []);
            } else {
                newObj[key] = copy;
            }
        }
        return newObj;
    }

    win.checkDeviceType = checkDeviceType;
})(window, document);

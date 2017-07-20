/**
* @desc 使用ga统计用户行为
* 大概思路 全局提供一套事件绑定机制（不要阻止默认 冒泡等）
* 根据开发人员配置项提取用户行为信息然后使用ga收集
* <a class="J_ga" src="" data-category="1" data-action="视频播放" data-label="学习"></a>
* @use
* category: 通常是用户与之互动的对象（例如 'Video'）
* lable:    用于对事件进行分类
* value:    与事件相关的数值
*/


var category = {
    '1': '缩略图',
    '2': '缩略图--不懂',
    '3': '缩略图--习题',
    '4': '课堂动态',
    '5': '课堂动态--当前学生XX位',
    '6': '课堂动态--弹幕',
    '7': '课堂动态--弹幕--投屛',
    '8': '课堂动态--投稿',
    '9': '课堂动态--投稿--收藏',
    '10': '课堂动态--投稿--投屛',
    '11': '更多',
    '12': '更多--随机点名'
};
var handler = function(evt) {
    var $el = $(evt.currentTarget);
    var cg = category[$el.data('category') || 1];
    var action = $el.data('action') || 'click';
    var label = $el.data('label') || '遥控器';
    var value = $el.data('value') || 0;

    ga('send', {
        hitType: 'event',
        eventCategory: cg,
        eventAction: action,
        eventLabel: label,
        eventValue: value
    });
};
var gaue = {
    selector: '.J_page',
    init: function() {
    },
    registerEl: function(selector) {
        selector = selector || '.J_page';
        // 方式一  绑定需要统计的用户行为
        $(selector).on('click', '.J_ga', handler);
    },
    remove: function() {
        var selector = this.selector || '.J_page';
        $(selector).off('click', '.J_ga', handler);
    },
    // 有些按钮无法触发click事件
    fixTrigger: function(evt){
        evt.currentTarget = $(evt.target).closest('.J_ga')
        handler(evt)
    }
}

if (typeof define === 'function' && define.amd){
    // AMD. Register as an anonymous module.
    define(function(){
        return gaue;
    });
}

export default gaue;

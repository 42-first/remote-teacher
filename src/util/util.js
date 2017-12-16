/*
 * array find function
 */

if (!Array.prototype.find) {
  Array.prototype.find = function(predicate) {
    'use strict';
    if (this == null) {
      throw new TypeError('Array.prototype.find called on null or undefined');
    }
    if (typeof predicate !== 'function') {
      throw new TypeError('predicate must be a function');
    }
    var list = Object(this);
    var length = list.length >>> 0;
    var thisArg = arguments[1];
    var value;

    for (var i = 0; i < length; i++) {
      value = list[i];
      if (predicate.call(thisArg, value, i, list)) {
        return value;
      }
    }
    return undefined;
  };
}


/**
 * 检测是否是https
 * @param
 */
export function initProtocal() {
  let url = location.href;

  // 是否是网页版
  let pubSub = window.parent && window.parent.PubSub || null;
  if(pubSub) {
    return this;
  }

  // 检测是否是http
  if(location.protocol === 'http:') {
    if(location.host.indexOf('yuketang') !== -1 || location.host.indexOf('ykt.io') !== -1) {
      url = url.replace('http:', 'https:').replace('ykt.io', 'www.yuketang.cn');

      location.replace(url);
    }
  }
}

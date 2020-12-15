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

// https://tc39.github.io/ecma262/#sec-array.prototype.findIndex
if (!Array.prototype.findIndex) {
  Object.defineProperty(Array.prototype, 'findIndex', {
    value: function(predicate) {
     // 1. Let O be ? ToObject(this value).
      if (this == null) {
        throw new TypeError('"this" is null or not defined');
      }

      var o = Object(this);

      // 2. Let len be ? ToLength(? Get(O, "length")).
      var len = o.length >>> 0;

      // 3. If IsCallable(predicate) is false, throw a TypeError exception.
      if (typeof predicate !== 'function') {
        throw new TypeError('predicate must be a function');
      }

      // 4. If thisArg was supplied, let T be thisArg; else let T be undefined.
      var thisArg = arguments[1];

      // 5. Let k be 0.
      var k = 0;

      // 6. Repeat, while k < len
      while (k < len) {
        // a. Let Pk be ! ToString(k).
        // b. Let kValue be ? Get(O, Pk).
        // c. Let testResult be ToBoolean(? Call(predicate, T, « kValue, k, O »)).
        // d. If testResult is true, return k.
        var kValue = o[k];
        if (predicate.call(thisArg, kValue, k, o)) {
          return k;
        }
        // e. Increase k by 1.
        k++;
      }

      // 7. Return -1.
      return -1;
    }
  });
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

/**
 * 检测是否支持本地storage
 * @param
 */
export function isSupported(storage) {
  try {
    const key = "__some_random_key_you_are_not_going_to_use__";
    storage.setItem(key, key);
    storage.removeItem(key);
    return true;
  } catch (e) {
    // const QUOTA_EXCEEDED_ERR_CODE = 22;
    if (e.code === 22) {
      storage.clear();
    }

    return false;
  }
}
/**
 * 字符串字符数量 汉字等是两个字符
 * @param str
 */
export function getLength(str) {
  let result = 0;
  let length = str.length;
  while (length--) {
    if (/^[\u0000-\u00ff]$/.test(str.charAt(length))) {
      result += 1;
    } else {
      result += 2;
    }
  }

  return result;
}

/**
 * 字符串截取 英文*2
 * @param str maxLength
 */
export function substr(str, maxLength) {
  let re = new RegExp("^[a-zA-Z]|[0-9]+$");
  let length = str.length;
  let result = 0;
  let index = 0;

  for(let i = 0; i < str.length; i++){
    if (/^[\u0000-\u00ff]$/.test(str.charAt(i))) {
      result += 1;
    } else {
      result += 2;
    }
    if(result >= maxLength * 2){
      index = i + 1
      break
    }
  }

  /**
   * 如果是开头英文最后是中文的正则检测为true
   * 此时字符串截取就出错了
   * 所以改为上面的方法

   if (re.test(str)) {
     maxLength = maxLength * 2;
   }
   *
   */

  return str.substr(0, index);
}

/**
 * @method 将base64转换为文件
 * @params
 */
export function dataURLtoFile(dataurl, filename) {
  let arr = dataurl.split(',');
  let mime = arr[0].match(/:(.*?);/)[1];
  let bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);

  while(n--){
    u8arr[n] = bstr.charCodeAt(n);
  }

  return new File([u8arr], filename, { type: mime });
}


/**
 * @method 版本号比较
 * @params
 */
export function compareVersion(v1, v2) {
  v1 = v1.split('.')
  v2 = v2.split('.')
  const len = Math.max(v1.length, v2.length)

  while (v1.length < len) {
    v1.push('0')
  }
  while (v2.length < len) {
    v2.push('0')
  }

  for (let i = 0; i < len; i++) {
    const num1 = parseInt(v1[i])
    const num2 = parseInt(v2[i])

    if (num1 > num2) {
      return 1
    } else if (num1 < num2) {
      return -1
    }
  }

  return 0
}

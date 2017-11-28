/**
 * @module 公用功能函数
 */

function formatTime(time) {
  if (typeof time !== 'number' || time < 0) {
    return time
  }

  var hour = parseInt(time / 3600)
  time = time % 3600
  var minute = parseInt(time / 60)
  time = time % 60
  var second = time

  return ([hour, minute, second]).map(function (n) {
    n = n.toString()
    return n[1] ? n : '0' + n
  }).join(':')
}

/**
 * 将秒数转换成 MM:SS 格式
 *
 * @param {number} sec 秒数
 */
function sec2str (sec) {
  if(sec <= 0){
      return '时间到';
  }

  var str = '';
  var fen = Math.floor(sec/60);
  var miao = sec%60;//
  miao = (miao<10) ? ('0'+miao) : miao;
  fen = fen < 10 ? ('0'+fen) : fen;

  str += fen + ':' + miao;
  return str;
}

/**
 * 从高到低排序"不懂""
 *
 * @param {Array} doubtList 原始的只有数字的数组
 */
function sortDoubt (doubtList) {
  let arr = []

  for (let i = doubtList.length - 1; i >= 0; i--) {
    arr[i] = {
      'index': i,
      'val': doubtList[i]
    }
  }

  arr.sort((a, b) => b.val - a.val)
  return arr
}

export {
  formatTime,
  sec2str,
  sortDoubt,
}

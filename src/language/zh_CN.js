/*
 * 雨课堂 国际化静态文字
 * @author: chenzhou
 * @update: 2017.6.12
 * @desc 国际化 命名空间格式 page-module-lable
 *
 */

let pages = {
  // 学生遥控器
  "ykt": "雨课堂",
  "undone": "未完成",
  "done": "已完成",

  "pno": "第{number}页",
  "totalprob": "共$number$题",

  "total": "全部",
  "slide": "PPT",
  "prob": "习题",
  "quiz": "试卷",
  "bonus": "红包",

  "unknown": "不懂",
  "star": "收藏",

  "newfeed": "您有新的课堂动态",
  "connerr": "连接异常，$second$秒后尝试重连",
  "connnow": "立即重连",

  "newpost": "发送投稿",
  "newbullet": "发送弹幕",
  "bulletban": "老师暂时还未开放弹幕，等等吧～",
  "tips": "提示",

  "newprob": "你有新的课堂习题",
  "newvote": "你有新的投票",
  "recvbonus": "Hi，本题有课堂红包发送",
  "gainbonus": "$number$位同学已赢得课堂红包",

  "submitansw": "提交答案",
  "cannotsubmit": "提交有困难"

};



if (typeof define === 'function' && define.amd){
    // AMD. Register as an anonymous module.
    define(['exports'], function(){
      return pages;
    });
} else if (typeof exports === 'object' && typeof module === 'object') {
  module.exports = pages; // nodejs support
}

export default pages;

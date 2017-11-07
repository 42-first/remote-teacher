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
  "totalprob": "共{number}题",

  "total": "全部",
  "slide": "PPT",
  "prob": "习题",
  "quiz": "试卷",
  "bonus": "红包",

  "unknown": "不懂",
  "star": "收藏",

  "newfeed": "您有新的课堂动态",
  "connerr": "连接异常，{second}秒后尝试重连",
  "connnow": "立即重连",

  "newpost": "发送投稿",
  "newbullet": "发送弹幕",
  "bulletban": "老师暂时还未开放弹幕，等等吧～",
  "tips": "提示",

  "newprob": "你有新的课堂习题",
  "newvote": "你有新的投票",
  "recvbonus": "Hi，本题有课堂红包发送",
  "gainbonus": "{number}位同学已赢得课堂红包",

  "submitansw": "提交答案",
  "cannotsubmit": "提交有困难",
  "voteremain": "您还可以再投{number}票",
  "novote": "您还未投票",
  "watchmode": "当前为观看模式，无法答题",
  "autosubmitansw": "第{number}页习题已自动提交成功",

  "bulletdflt": "说点啥好~",
  "wordrvwtip": "温馨提示：发送前请自行审查用词",

  "sendcfm": "确认发送",
  "besending": "发送中",
  "sendsuccess": "发送成功",

  "isempty": "这里可以为空",
  "uploadonepic": "上传图片（只能添加1张）",
  "viewpost": "查看我的投稿",

  "back": "返回",
  "selall": "全选",
  "batchoperation": "批量操作",
  "del": "删除",
  "delselectedpost": "确定删除所选投稿"

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

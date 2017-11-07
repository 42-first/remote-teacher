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
  "cannotsubmit": "提交有困难",

  // 遥控器
  "classsignal": "课堂暗号",
  "zoomin": "点击放大",
  "zoomout": "点击缩小",
  "startclass": "开始上课",
  "contclass": "继续上课",
  "curslide": "当前幻灯片",
  "nextslide": "下一幻灯片",
  "sendprob": "发送此题",
  "viewans": "查看答案",
  "timelimit": "限时发送",
  "problimit": "$number$分钟",
  "senddirectly": "直接发送",
  "submittotal": "已有$number$位同学提交了答案",
  "noanssubmit": "还没有人提交，耐心等待一会儿吧",
  "newans": "您有新的答案",
  "mark": "打分",
  "screenmode": "投屏",
  "viewdetails": "查看详情",
  "classbonus": "课堂红包",
  "standardopt": "本题正确选项为$answer$",
  "bonustips": "您可以给回答增强且快速的同学发红包以表奖励",
  "quantity": "红包个数（班级共$number$人）",
  "amounteach": "红包金额（单个红包）",
  "nobonus": "不赏了，返回",
  "preparebonus": "打赏",
  "setquantity": "请填写红包个数",
  "setamount": "请填写红包金额",
  "mark": "打分",
  "bonuslimit": "单个红包金额不可超过100元",
  "plsconfpay": "请确认支付",
  "classbonus": "课堂红包",
  "yktwallet": "雨课堂钱包",
  "wxwallet": "微信钱包",
  "cfmpay": "确认支付",
  "paysuccess": "支付成功",
  "payfailed": "支付失败",
  "standardans": "本题答案",
  "correctopt": "正确选项",
  "wrongopt": "错误选项",
  "remotectrl": "遥控器",
  "thumbnail": "缩略图",
  "classact": "课堂动态",
  "readmore": "更多",
  "qrcode": "二维码",
  "radomrollcall": "随机点名",
  "endshow": "退出放映",
  "slide": "PPT",
  "unknown": "不懂",
  "prob": "习题",
  "activeno": "当前学生$number$位",
  "quiz": "试卷",
  "bullet": "弹幕",
  "post": "投稿",
  "on": "已开启",
  "off": "已关闭",
  "bulletintro": "开启弹幕，头脑风暴一下",
  "nomail": "信箱空空的",
  "myquiz": "我的试卷库",
  "publishquiz": "发布试卷",
  "cancel": "取消",
  "publish": "发布",
  "back": "返回",
  "refresh": "刷新",
  "posttips": "试试让学生在手机端 + 号中投稿吧",
  "loading": "正在加载中...",
  "recvpost": "你有新的投稿",
  "nonewpost": "没有新的投稿",
  "favorites": "收藏...",
  "screenmode": "投屏",
  "postpublic": "发送全班",
  "screenmodeoff": "取消投屏",
  "release": "上拉加载更多",
  "totalstudent": "当前班级人数",
  "attendingno": "当前共有$number$位学生进入课堂",
  "toberolling": "即将开始随机点名",
  "rolling": "开始滚动",
  "norolling": "当前班级没有学生，不能点名",
  "radomrolling": "正在随机筛选...",
  "keeprolling": "继续滚动",
  "selhim": "就是Ta了",
  "endclass": "结束本次授课",
  "showended": "已退出全屏放映",
  "showconnecting": "或放映正在连接中",
  "otherslogin": "其他老师已登录",
  "forcelogout": "您已被迫下线",
  "studentrole": "以学生身份进入",
  "loginagain": "我要夺回主权",
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

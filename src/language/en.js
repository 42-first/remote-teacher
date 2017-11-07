/*
 * 雨课堂 国际化静态文字
 * @author: chenzhou
 * @update: 2017.6.12
 * @desc 国际化 命名空间格式 page-module-lable
 *
 */

let pages = {
  // 学生遥控器
  "ykt": "ykt",
  "undone": "undone",
  "done": "done",

  "pno": "di{number}ye",
  "totalprob": "toatal{number}prob",

  "total": "total1",
  "slide": "PPT2",
  "prob": "prob3",
  "quiz": "quiz4",
  "bonus": "bonus",

  "unknown": "unknown1",
  "star": "star1",

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

  "bulletdflt": "说点啥好",
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
  "delselectedpost": "确定删除所选投稿",


  // 遥控器
  "classsignal": "classsignal",
  "zoomin": "zoomin",
  "zoomout": "zoomout",
  "startclass": "startclass",
  "contclass": "contclass",
  "curslide": "curslide",
  "nextslide": "nextslide",
  "sendprob": "sendprob",
  "viewans": "viewans",
  "timelimit": "timelimit",
  "problimit": "$number$分钟",
  "senddirectly": "senddirectly",
  "submittotal": "已有$number$位同学提交了答案",
  "noanssubmit": "还没有人提交，耐心等待一会儿吧",
  "newans": "newans",
  "mark": "mark",
  "screenmode": "screenmode",
  "viewdetails": "viewdetails",
  "classbonus": "classbonus",
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
  "remotectrl": "remotectrl",
  "thumbnail": "thumbnail",
  "classact": "classact",
  "readmore": "readmore",
  "qrcode": "qrcode",
  "radomrollcall": "radomrollcall",
  "endshow": "endshow",
  "slide": "PPT",
  "unknown": "unknown",
  "prob": "prob",
  "activeno": "当前学生$number$位",
  "quiz": "quiz",
  "bullet": "bullet",
  "post": "post",
  "on": "on",
  "off": "off",
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

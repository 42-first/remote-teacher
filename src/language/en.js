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
  "classsignal": "Class Code",
  "zoomin": "Zoom in",
  "zoomout": "Zoom out",
  "startclass": "Start | Continue",
  "curslide": "Current Slide",
  "nextslide": "Next Slide",
  "sendprob": "Send | View Answer",
  "timelimit": "Time-limited",
  "onemin": "$number$ mins",
  "senddirectly": "Send",
  "submittotal": "$number$ students submitted",
  "noanssubmit": "No submission, please wait",
  "newans": "New Submission",
  "mark": "Mark",
  "screenmode": "Screen Mode",
  "viewdetails": "View Details",
  "classbonus": "Bonus",
  "standardopt": "Correct Answer: $answer$",
  "bonustips": "Reward students with fast and correct answer",
  "quantity": "Quantity($number$ students)",
  "amounteach": "Amount Each",
  "nobonus": "Cancel",
  "preparebonus": "Send Bonus",
  "setquantity": "Enter number",
  "setamount": "Enter amount",
  "bonuslimit": "Up to 100CNY each bonus",
  "plsconfpay": "Please confirm the payment",
  "classbonus": "Bonus",
  "yktwallet": "Rain Classroom Wallet",
  "wxwallet": "Wechat Wallet",
  "cfmpay": "Confirm Payment",
  "paysuccess": "Pay Successfully",
  "payfailed": "Pay Failed",
  "standardans": "Correct Answer",
  "correctopt": "Correct Answer",
  "wrongopt": "Wrong Answer",

  "remotectrl": "Remote Control",
  "thumbnail": "Thumbnail",
  "classact": "Activity",
  "readmore": "More",
  "qrcode": "QR Code",
  "radomrollcall": "Random Roll Call",
  "endshow": "End Show",
  "slide": "PPT",
  "unknown": "Unclear",
  "prob": "Question",
  "activeno": "{activeno} Active Students",
  "quiz": "Test",
  "bullet": "Danmu",
  "post": "Post",
  "onoff": "On | Off",
  "off": "off",
  "bulletintro": "Turn on the Danmu. Let's brainstorming!",
  "nomail": "Nothing",
  "myquiz": "My Test",
  "publishquiz": "Publish Test",
  "cancel": "Cancel",
  "publish": "Publish",
  "back": "Back",

  "refresh": "Refresh",
  "posttips": "Tell students to explore post function by clicking +",
  "loading": "loading",
  "recvpost": "You have a new post",
  "nonewpost": "No new post",
  "star": "Save",
  "postpublic": "Send",
  "screenmodeoff": "Exit Screen Mode",
  "release": "Release",

  "totalstudent": "Active Students",
  "attendingno": "$number$students in the class",
  "toberolling": "Random Roll Call is about to begin",
  "rolling": "Rolling",
  "norolling": "No student yet. Random Roll Call is unavailable",
  "radomrolling": "Random Rolling",
  "keeprolling": "Keep Rolling",
  "selhim": "Bingo!",
  "endclass": "End Class",
  "showended": "End",
  "showconnecting": "or connecting",
  "otherslogin": "Your account has been logged in by others",
  "forcelogout": "You have been force logged out",
  "studentrole": "Access in student role",
  "loginagain": "Login again",
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

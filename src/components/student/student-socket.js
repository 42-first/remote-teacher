/*
 * 学生接收器 socket协议
 * @author: chenzhou
 * @update: 2017.5.27
 * @desc 课堂实时进度，课堂实时活动,提醒等
 *
 */


// 上线修改host
const SOCKET_HOST = location.host || 'b.xuetangx.com';
window.socket = null;

var mixin = {
  methods: {
    /*
    * @method 关闭websocket
    */
    closews() {
      let socket = this.socket;
      try {
        socket.close();
        socket.onopen = null;
        socket.onmessage = null;
      } catch(e) {
      }
    },
    /*
    * @method 初始化创建websocket实例
    */
    initws() {
      let self = this;

      this.socket && this.closews();

      window.socket = this.socket = new WebSocket('ws://' + SOCKET_HOST + '/wsapp/');

      // 关闭
      this.socket.onclose = function(event) {

      }

      // 接收socket信息
      this.socket.onopen = function(event) {
        self.socket.onmessage = function (event) {
          var msg = JSON.parse(event.data);
          console.log(msg);

          self.processMessage(msg);
        }

        self.socket.send(JSON.stringify({
          'op':"hello",
          'userid': self.userID,
          'avatar': self.avatar,
          'role': "inspector",
          'auth': self.userAuth,
          'lessons': self.alessonids
        }));

      }
    },
    /*
    * @method 根据websocket信息策略处理
    */
    processMessage(msg) {
      if(msg.op) {
        switch(msg.op) {
          case 'hello':
            this.getPresentationList(msg.lessons);

            break;

          // 加入课程
          case 'joinlesson':
            this.getPresentationList(msg.lessons);

            break;

          // 幻灯片 结束放映
          case 'showfinished':
            this.getPresentation(msg.lessonid, msg.presentation, msg.slideindex||1);
            break;

           // 下课啦
          case 'lessonfinished':
            this.quitCourseLive(msg.lessonid);
            break;

          // 幻灯片换页通知
          case 'slidenav':
            this.getPresentation(msg.lessonid, msg.slide.pres, msg.slide.si);
            break;

          default: break;
        }
      }
    },
    /*
    * @method 九宫格直播数据读取
    */
    getPresentationList(lessons) {
      let lesson = null;

      if(lessons && lessons.length) {
        for(let i = 0, count = lessons.length; i<count; i++) {
          lesson = lessons[i];

          this.getPresentation(lesson.lessonid, lesson.presentation, lesson.slideindex);
        }
      }
    },
    /*
    * @method 退出直播
    */
    exitLive(lessons) {
      let msg = JSON.stringify({
        "op": "quitlesson",
        "lessons": lessons
      });

      this.socket.send(msg);

      console.log(msg);
    },
    /*
    * @method 加入课程直播
    */
    joinSocketLive(lessons) {
      this.socket.send(JSON.stringify({
        "op": "joinlesson",
        "lessons": lessons
      }));
    }
  }
}


export default mixin;

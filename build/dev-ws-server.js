/*
 * @page：雨课堂本地模拟socket通信
 * @author: chenzhou
 * @update: 2017.06.06
 * @desc 模拟发消息，ppt， 试卷，试题，红包等
 *
 */

 var mock = require('../src/components/student/socket-mock')

console.log(mock);

const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8888 });

wss.on('connection', function connection(ws) {

  ws.on('message', function incoming(message) {
    console.log('received: %s', message);

    var data = JSON.parse(message);
    var msgBack = { op: data.op };
    var room = data.lessonid ? getRoom(data.lessonid) : null;

    if (room) {
        msgBack['lessonid'] = room.lesson;
    }

    switch(data.op) {
      case 'hello':
        var uid = data.userid;

        ws['uid'] = uid;
        ws['role'] = data.role;

        switch (data.role) {
          case 'lecturer':
            lecturers[uid] = ws;
            room.enterRoom(ws, data.role);

            if (data.presentation) {
              room.presentation = data.presentation;
            }

            if (room.presentation) {
              msgBack['shownow'] = room.showNow;
              msgBack['presentation'] = room.presentation;
              msgBack['slideindex'] = room.slideIndex;
              msgBack['slidesshown'] = room.getSlideShown(room.presentation);
              msgBack['unlockedproblem'] = room.getUnlockedProblem(room.presentation);
            }

            break;

          case 'student':
            members[uid] = ws;
            room.enterRoom(ws, data.role);

            if (data.presentation) {
              room.presentation = data.presentation;
            }

            if (room.presentation) {
              msgBack['presentation'] = room.presentation;
              msgBack['slideindex'] = room.slideIndex;
              msgBack['slidesshown'] = room.getSlideShown(room.presentation);
              msgBack['unlockedproblem'] = room.getUnlockedProblem(room.presentation);

              // timeline
              msgBack = Object.assign(mock.hello, msgBack);
            }

            break;
        }

        try {
          ws.send(JSON.stringify(msgBack));
        } catch(ex) {console.log(ex.message);}

        break;

        case 'showpresentation':
          room.presentation = data.presentation;
          room.showNow = true;
          room.slidenav(data.presentation, data.slideindex);
          msgBack['presentation'] = room.presentation;
          msgBack['slideindex'] = room.slideIndex;
          msgBack['slidesshown'] = room.getSlideShown(room.presentation);
          msgBack['unlockedproblem'] = room.getUnlockedProblem(room.presentation);
          room.broadcastStudents(JSON.stringify(msgBack));

          try {
            room.remote.send(JSON.stringify(msgBack));
          } catch(ex) {console.log(ex.message);}

        break;

        case 'endshow':
          msgBack['presentation'] = data.presentation;
          room.presentation = null;
          room.showNow = false;
          room.broadcastAll(JSON.stringify(msgBack));

          break;

        case 'slidenav':
          room.slidenav(data.presentation, data.to);
          msgBack['slideindex'] = room.slideIndex = data.to;
          msgBack['presentation'] = room.presentation = data.presentation;
          msgBack['slidesshown'] = room.getSlideShown(room.presentation);
          msgBack['unlockedproblem'] = room.getUnlockedProblem(room.presentation);
          msgBack['shownow'] = room.showNow;

          if (room.showNow) {
            room.broadcastAll(JSON.stringify(msgBack));
          } else {
            try {
              var currentCmd = JSON.stringify(msgBack);
              room.addin.send(currentCmd);
              room.lecturer.send(currentCmd);
            } catch(ex) {console.log(ex.message);}
          }

          break;

        case 'unlockproblem':
          room.unlockproblem(data.presentation, data.slideindex);
          msgBack['slideindex'] = room.slideIndex = data.slideindex;
          msgBack['presentation'] = room.presentation = data.presentation;
          msgBack['problemid'] = data.problemid;
          msgBack['slidesshown'] = room.getSlideShown(room.presentation);
          msgBack['unlockedproblem'] = room.getUnlockedProblem(room.presentation);
          room.broadcastAll(JSON.stringify(msgBack));

          break;

        case 'newquiz':
          msgBack['quizid'] = data.quizid;
          room.broadcastAll(JSON.stringify(msgBack));
          break;

        case '':

          break;
      }

  });

  // ws.send(JSON.stringify({ mock.hello }));

});


var members = {};
var rooms = {};
var addins = {};
var lecturers = {};


function getRoom(lessonid) {
  if(!rooms[lessonid]) {
    rooms[lessonid] = new RainRoom(lessonid);
  }

  return rooms[lessonid];
}


class RainRoom {
  constructor(lessonid) {
    this.lesson = lessonid;
    this.remote = null;
    this.addin = null;
    this.showNow = false;
    this.students = [];
    this.presentation = null;
    this.slideIndex = 0;
    this.slidesShown = {};
    this.unlockedProblem = {};
  }
  /*
   * @method 角色进入班级
   */
  enterRoom(ws, role) {
    console.log("a " + role + " is entering room ...");

    if (ws['room']) {
        if (ws['room'] == this)
            return;
        if (role == 'lecturer')
            ws['room'].remote = null;
        else if (role == 'student')
            this.leaveRoom(this, ws);
    }

    ws['room'] = this;

    if (role == 'lecturer')
        this.remote = ws;
    else if (role == 'student')
        this.students.push(ws);

  }
  leaveRoom() {

  }
  /*
   * @method 向学生广播消息
   */
  broadcastStudents(msg) {
    try {
      this.students.forEach(function each(client) {
        console.log("broadcast - student:" + msg);
        client.send(msg);
      });
    } catch(ex) {
      console.log(ex.message);
    }
  }
  /*
   * @method 向各端广播消息
   */
  broadcastAll(msg) {
    this.broadcastStudents(msg);

    try {
      if (this.addin != null)
        this.addin.send(msg);

      if (this.remote != null)
        this.remote.send(msg);
    } catch(ex) {console.log(ex.message);}
  }
  slidenav(pres, index) {
    if (this.slidesShown[pres]) {
      if (this.slideIndex && this.slidesShown[pres].indexOf(this.slideIndex) == -1)
        this.slidesShown[pres].push(this.slideIndex);
    } else {
      this.slidesShown[pres] = [];
    }

    this.slideIndex = index;
  }
  unlockproblem(pres, index) {
    if (this.getUnlockedProblem(pres).indexOf(index) == -1)
      this.getUnlockedProblem(pres).push(index);

    if (this.slidesShown[pres]) {
      if (this.slidesShown[pres].indexOf(index) == -1)
        this.slidesShown[pres].push(index);
    } else {
      this.slidesShown[pres] = [index];
    }
  }
  getSlideShown(pres) {
    if (!this.slidesShown[pres]) {
      this.slidesShown[pres] = [];
    }

    return this.slidesShown[pres];
  }
  getUnlockedProblem(pres) {
    if (!this.unlockedProblem[pres]) {
      this.unlockedProblem[pres] = [];
    }

    return this.unlockedProblem[pres];
  }
}


class Teacher {
  constructor() {
    this.lessonID = 1000;
    this.presentationID = 1000;
    this.danmu = false;
  }
  creatTimeLine() {
  }
  getPPT() {
  }
}














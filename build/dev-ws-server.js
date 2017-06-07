/*
 * @page：学生接收器模拟socket通信
 * @author: chenzhou
 * @update: 2017.06.06
 * @desc 模拟发消息，ppt， 试卷，试题，红包等
 *
 */

const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8888 });

wss.on('connection', function connection(ws) {
  ws.on('message', function incoming(message) {
    console.log('received: %s', message);
  });

  ws.send('something');
});

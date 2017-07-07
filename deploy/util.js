//noinspection JSUnresolvedFunction
/**
 * Created by huangsuoyuan on 2016/11/17.
 */

var path = require('path');
var process = require('child_process');
var fs = require('fs');
var colors = require('colors/safe');

function getFullImageName(){
  var imageName = "build.ykt.io/profession-vue:";
  var projectDir = path.dirname(__dirname);
  var packagePath = path.join(projectDir, 'package.json');
  var obj = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  return imageName + obj.version;
}

function dummyAsyncCmd(cmd, args){
	console.log(colors.yellow('[exec cmd] ') + colors.green(cmd + ' ' + args.join(' ')));
	var child = process.spawn(cmd, args);

	child.stdout.on('data', data => {
		var dateStr = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
		console.log(`${dateStr} [INFO]: ${data}`);
	});

	child.stderr.on('data', data => {
		var dateStr = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
		console.log(`${dateStr} [ERROR]: ${data}`);
	});

	child.on('close', code => {
		if (code != 0){
			console.log(colors.red('process exited with code' + code));
		} else {
			console.log(colors.green('Success!'));
		}
	})
}

exports.getImageName = getFullImageName;
exports.dummyAsyncCmd = dummyAsyncCmd;

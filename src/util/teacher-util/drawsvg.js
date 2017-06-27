/**
 * @module 画饼图
 */

let DPR = document.querySelector('html').dataset.dpr - 0
let CENTER, RADIUS_OUTTER, RADIUS_INNER // 圆环中心，圆环外径，圆环内径
let TEXTCONFIG // 右侧文字间距的设置

// 圆心位置
switch (DPR) {
  case 1:
    CENTER = {
      x: 50,
      y: 50
    }
    RADIUS_OUTTER = 50
    RADIUS_INNER = 40
    TEXTCONFIG = {
      zhushixiayi: 10,    // 右侧标注向下的偏移
      kuandu: 160,        // 圆点左侧距离右侧边界的距离，就是注释部分有多宽
      circle: 5,          // 圆点半径
      fanwei: 10,         // 分数范围距离圆点的距离 text1
      renshu: 85,         // 人数距离范围的距离 text2
      xiegang: 30,        // 斜杠距离人数的距离 text3
      zongrenshu: 5,      // 总人数距离斜杠的距离 text4
      hangjianju: 20,     // 注释文案的行间距
      wenzipianyi: 5,     // 文字比圆点往下的偏移
      zongrenshufz: 12    // 总人数的字体大小
    }
    break
  case 2:
    CENTER = {
      x: 100,
      y: 100
    }
    RADIUS_OUTTER = 100
    RADIUS_INNER = 80
    TEXTCONFIG = {
      zhushixiayi: 20,     // 右侧标注向下的偏移
      kuandu: 320,         // 圆点左侧距离右侧边界的距离，就是注释部分有多宽
      circle: 10,          // 圆点半径
      fanwei: 20,          // 分数范围距离圆点的距离 text1
      renshu: 170,         // 人数距离范围的距离 text2
      xiegang: 60,         // 斜杠距离人数的距离 text3
      zongrenshu: 10,      // 总人数距离斜杠的距离 text4
      hangjianju: 40,      // 注释文案的行间距
      wenzipianyi: 10,     // 文字比圆点往下的偏移
      zongrenshufz: 24     // 总人数的字体大小
    }
    break
  case 3:
    CENTER = {
      x: 150,
      y: 150
    }
    RADIUS_OUTTER = 150
    RADIUS_INNER = 120
    TEXTCONFIG = {
      zhushixiayi: 30,     // 右侧标注向下的偏移
      kuandu: 480,         // 圆点左侧距离右侧边界的距离，就是注释部分有多宽
      circle: 15,          // 圆点半径
      fanwei: 30,          // 分数范围距离圆点的距离 text1
      renshu: 255,         // 人数距离范围的距离 text2
      xiegang: 90,         // 斜杠距离人数的距离 text3
      zongrenshu: 15,      // 总人数距离斜杠的距离 text4
      hangjianju: 60,      // 注释文案的行间距
      wenzipianyi: 15,     // 文字比圆点往下的偏移
      zongrenshufz: 36     // 总人数的字体大小
    }
    break
}

// 把人数补全到3位，如 1 补全为001
function add3wei (num) {
  if (num < 10) {
    return '    ' + num 
  } else if (num < 100) {
    return '  ' + num
  }
  return num
}

//计算在一定的圆心和半径的圆上，某个角度上的点的位置
function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
  var angleInRadians = (angleInDegrees-90) * Math.PI / 180.0;

  return {
    x: centerX + (radius * Math.cos(angleInRadians)),
    y: centerY + (radius * Math.sin(angleInRadians))
  };
}

//配置一段弧线的路径
function describeArc(x, y, radius, startAngle, endAngle){

  var start = polarToCartesian(x, y, radius, endAngle);
  var end = polarToCartesian(x, y, radius, startAngle);

  var arcSweep = endAngle - startAngle <= 180 ? "0" : "1";

  var d = [
    "M", start.x, start.y,
    "A", radius, radius, 0, arcSweep, 0, end.x, end.y
  ].join(" ");

  return d;
}

function describeSliceOfPie(x, y, r, start, end, arcSweep){

  var d = [
    "M", x , y,
    "L", start.x, start.y,
    "A", r, r, 0, arcSweep, 1, end.x, end.y, "Z"
  ].join(" ");
  return d;
}
//创建svg元素
function createSVG(tag)
{
  return document.createElementNS('http://www.w3.org/2000/svg', tag);
}

//画弧线
//var arr = [20,30,150];
function drawPie (ele, arr){
  // var arr = [0,0,0];

  //1.算比例
  var sum=0;
  for(var i=0;i<arr.length;i++)sum+=arr[i];

  //如果班级一个人都没有，则不画饼图
  if(sum == 0)return;

  var aScale=[];
  for(var i=0;i<arr.length;i++)
  {
    aScale[i]=arr[i]/sum;
  }

  //2.算角度
  var aAngle=[];
  for(var i=0;i<arr.length;i++)
  {
    aAngle[i]=240*aScale[i];
  }

  var svgDom=document.querySelector(ele);

  var r = 70;
  var centX = 150,centY=75;

  var path=createSVG('path');
  path.setAttribute("d", describeArc(centX, centY,r, 240, 240+aAngle[0]));
  path.setAttribute("style","fill:white;stroke:#3fe3c2;stroke-width:4");
  svgDom.appendChild(path);

  var path2=createSVG('path');
  path2.setAttribute("d", describeArc(centX, centY, r, 240+aAngle[0],240+aAngle[0]+aAngle[1]));
  path2.setAttribute("style","fill:white;stroke:#c8cfdb;stroke-width:4");
  svgDom.appendChild(path2);

  var path3=createSVG('path');
  path3.setAttribute("d", describeArc(centX, centY, r, 240+aAngle[0]+aAngle[1],240+240 ));
  path3.setAttribute("style","fill:white;stroke:#e7e7e7;stroke-width:2");
  svgDom.appendChild(path3);
};

//var range = ['2.85~3.0','2.55~2.85','2.25~2.55','1.8~2.25','0~1.8']
//var arr1 = [0,0,0,0,1];
function drawPieSolid (ele, range, arr1, config){
  var svgDom=document.querySelector(ele);

  while (svgDom.lastChild) {
    svgDom.removeChild(svgDom.lastChild);
  }
  var sum1 = 0;
  for(var i = 0; i < arr1.length; i++) sum1 += arr1[i];

  // var color = ['#9fe0f6','#3fe3c3','#9defbf','#f4d4ad','#f5f185'];
  var color = ['#346EB9', '#8BFFE5', '#51F3CF', '#3ACCD3', '#3AA4D3']
  if(sum1 > 0){
    var aScale1=[];
    for(var i=0;i<arr1.length;i++)
    {
      aScale1[i]=arr1[i]/sum1;
    }

    //2.算角度
    var aAngle1=[];
    for(var i=0;i<arr1.length;i++)
    {
      aAngle1[i]=360*aScale1[i];
      if (aAngle1[i]==360){
        aAngle1[i] = 359;
      }
    }

    var r1 = RADIUS_OUTTER;
    var centX1 = CENTER.x, centY1 = CENTER.y, startAngle1 = 0, endAngle1 = aAngle1[0];

    var start = {}, end = {}, arcSweep;


    for(var i = 0; i < arr1.length; i++)
    {
      endAngle1 = startAngle1 + aAngle1[i];
      start = polarToCartesian(centX1, centY1, r1, startAngle1)
      end = polarToCartesian(centX1, centY1, r1, endAngle1);
      arcSweep = endAngle1-startAngle1 <= 180 ? "0" : "1";

      var tpath=createSVG('path');
      tpath.setAttribute("d", describeSliceOfPie(centX1, centY1,r1, start, end, arcSweep));
      tpath.setAttribute("style","fill:"+color[i]+";stroke-width:1;stroke:#c7cfda;opacity:0.8");
      svgDom.appendChild(tpath);
      startAngle1 += aAngle1[i];
    }

    //return;
  }else{
    var r1 = RADIUS_OUTTER;
    var centX1 = CENTER.x, centY1 = CENTER.y;
    var tpath=createSVG('circle');
    tpath.setAttribute("cx",centX1);
    tpath.setAttribute("cy",centY1);
    tpath.setAttribute("r",r1);
    tpath.setAttribute("style","fill:#c8cfdb;stroke-width:1;stroke:#c7cfda;opacity:0.8");
    svgDom.appendChild(tpath);
  }


  var x, y;
  var svgWidth = svgDom.parentElement.offsetWidth
  for(var i = 0; i < arr1.length; i++)
  {
    var circle = createSVG('circle');
    var text1 = createSVG('text');
    var text2 = createSVG('text');
    var text3 = createSVG('text');
    var text4 = createSVG('text');
    x = svgWidth-TEXTCONFIG.kuandu; y = TEXTCONFIG.zhushixiayi+TEXTCONFIG.hangjianju*i;
    circle.setAttribute("cx", x);
    circle.setAttribute("cy", y);
    circle.setAttribute("r", TEXTCONFIG.circle);
    circle.setAttribute("fill", color[i]);

    text1.setAttribute("x", x+TEXTCONFIG.fanwei+"px");
    text1.setAttribute("y", y+TEXTCONFIG.wenzipianyi+"px");

    text2.setAttribute("x", x+TEXTCONFIG.fanwei+TEXTCONFIG.renshu+"px");
    text2.setAttribute("y", y+TEXTCONFIG.wenzipianyi+"px");

    text3.setAttribute("x", x+TEXTCONFIG.fanwei+TEXTCONFIG.renshu+TEXTCONFIG.xiegang+"px");
    text3.setAttribute("y", y+TEXTCONFIG.wenzipianyi+"px");

    text4.setAttribute("x", x+TEXTCONFIG.fanwei+TEXTCONFIG.renshu+TEXTCONFIG.xiegang+TEXTCONFIG.zongrenshu+"px");
    text4.setAttribute("y", y+TEXTCONFIG.wenzipianyi+"px");


    text1.setAttribute("fill", "#FFFFFF");
    text2.setAttribute("fill", "#FFFFFF");
    text3.setAttribute("fill", "#FFFFFF");
    text4.setAttribute("fill", "#FFFFFF");
    text4.setAttribute("style", "font-size: "+TEXTCONFIG.zongrenshufz+"px");
    text2.setAttributeNS("http://www.w3.org/XML/1998/namespace", "xml:space", "preserve");

    text1.textContent = range[i];
    text2.textContent = add3wei(arr1[i]);
    text3.textContent = '/';
    text4.textContent = sum1;
    svgDom.appendChild(text1);
    svgDom.appendChild(circle);
    svgDom.appendChild(text2);
    svgDom.appendChild(text3);
    svgDom.appendChild(text4);
  }

  //添加总分显示
  if (arguments.length>=4){
    x = svgWidth-170; y = 37+15+20*5;
    var text5 = createSVG('text');
    text5.setAttribute("x", x+"px");
    text5.setAttribute("y", y+"px");
    text5.setAttribute("style", "font-size:16px");
    text5.textContent = "总分:"+config.total+"分";
    svgDom.appendChild(text5);
  }

};

function drawRingSolid (ele, range,arr1){
  var svgDom=document.querySelector(ele);
  drawPieSolid(ele, range, arr1);
  var centX1 = CENTER.x, centY1 = CENTER.y, r1 = RADIUS_INNER;
  var circle = createSVG('circle');
  circle.setAttribute("cx", centX1);
  circle.setAttribute("cy", centY1);
  circle.setAttribute("r", r1>>1);
  circle.setAttribute("fill", "#000000");
  svgDom.appendChild(circle);
}

export {drawPieSolid, drawRingSolid}
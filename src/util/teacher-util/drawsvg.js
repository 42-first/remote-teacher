/**
 * @module 画饼图
 */

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
function drawPie (arr){
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

  var svg=$('#piecontainer').find('svg')[0];

  var r = 70;
  var centX = 150,centY=75;

  var path=createSVG('path');
  path.setAttribute("d", describeArc(centX, centY,r, 240, 240+aAngle[0]));
  path.setAttribute("style","fill:white;stroke:#3fe3c2;stroke-width:4");
  svg.appendChild(path);

  var path2=createSVG('path');
  path2.setAttribute("d", describeArc(centX, centY, r, 240+aAngle[0],240+aAngle[0]+aAngle[1]));
  path2.setAttribute("style","fill:white;stroke:#c8cfdb;stroke-width:4");
  svg.appendChild(path2);

  var path3=createSVG('path');
  path3.setAttribute("d", describeArc(centX, centY, r, 240+aAngle[0]+aAngle[1],240+240 ));
  path3.setAttribute("style","fill:white;stroke:#e7e7e7;stroke-width:2");
  svg.appendChild(path3);
};

//var range = ['2.85~3.0','2.55~2.85','2.25~2.55','1.8~2.25','0~1.8']
//var arr1 = [0,0,0,0,1];
function drawPieSolid (range,arr1,config){
  var sum1 = 0;
  for(var i = 0; i < arr1.length; i++) sum1 += arr1[i];

  var color = ['#9fe0f6','#3fe3c3','#9defbf','#f4d4ad','#f5f185'];
  var svg1=document.querySelector('#quizpie');
  console.log(svg1)
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

    var r1 = 70;
    var centX1 = 80, centY1 = 80, startAngle1 = 0, endAngle1 = aAngle1[0];

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
      svg1.appendChild(tpath);
      startAngle1 += aAngle1[i];
    }

    //return;
  }else{
    var r1 = 70;
    var centX1 = 80, centY1 = 80;
    var tpath=createSVG('circle');
    tpath.setAttribute("cx",centX1);
    tpath.setAttribute("cy",centY1);
    tpath.setAttribute("r",r1);
    tpath.setAttribute("style","fill:#c8cfdb;stroke-width:1;stroke:#c7cfda;opacity:0.8");
    svg1.appendChild(tpath);
  }


  var x, y;
  // var svgWidth = $("#pieSolid")[0].offsetWidth;
  var svgWidth = document.querySelector('#pieSolid').offsetWidth
  for(var i = 0; i < arr1.length; i++)
  {
    var rect = createSVG('rect');
    var text1 = createSVG('text');
    var text2 = createSVG('text');
    var text3 = createSVG('text');
    var text4 = createSVG('text');
    x = svgWidth-170; y = 37+20*i;
    rect.setAttribute("x", x+"px");
    rect.setAttribute("y", y+"px");
    rect.setAttribute("width","16px");
    rect.setAttribute("height","10px");
    rect.setAttribute("style","fill:"+color[i]+";pacity:0.8");

    text1.setAttribute("x", x+20+"px");
    text1.setAttribute("y", y+10+"px");

    text2.setAttribute("x", x+105+"px");
    text2.setAttribute("y", y+10+"px");

    text3.setAttribute("x", x+130+"px");
    text3.setAttribute("y", y+10+"px");

    text4.setAttribute("x", x+137+"px");
    text4.setAttribute("y", y+10+"px");


    text1.setAttribute("fill", "#FFFFFF");
    text2.setAttribute("fill", "#FFFFFF");
    text3.setAttribute("fill", "#FFFFFF");
    text4.setAttribute("fill", "#FFFFFF");


    text1.textContent = range[i];
    text2.textContent = arr1[i];
    text3.textContent = '/';
    text4.textContent = sum1;
    svg1.appendChild(text1);
    svg1.appendChild(rect);
    svg1.appendChild(text2);
    svg1.appendChild(text3);
    svg1.appendChild(text4);
  }

  //添加总分显示
  if (arguments.length>=3){
    x = svgWidth-170; y = 37+15+20*5;
    var text5 = createSVG('text');
    text5.setAttribute("x", x+"px");
    text5.setAttribute("y", y+"px");
    text5.setAttribute("style", "font-size:16px");
    text5.textContent = "总分:"+config.total+"分";
    svg1.appendChild(text5);
  }

};

function drawRingSolid (range,arr1){
  drawPieSolid(range,arr1);
  var svg1=document.querySelector('#quizpie');
  var centX1 = 80, centY1 = 80, r1 = 70;
  var circle = createSVG('circle');
  circle.setAttribute("cx", centX1);
  circle.setAttribute("cy", centY1);
  circle.setAttribute("r", r1>>1);
  circle.setAttribute("fill", "#fff");
  svg1.appendChild(circle);
}

var svg1=document.querySelector('#quizpie')
// console.log(svg1.offsetWidth)

export default drawRingSolid
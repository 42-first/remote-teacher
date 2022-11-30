var watermark = {}

function setWatermark(pls,args) {
	//声明一个怪异一点的变量，确保id的唯一性
    var id = '111.222.333.456';
    var xIndex = 20;//绘制文本的 x 坐标位置
    var yIndex = 190;//绘制文本的 y 坐标位置
    var xInterval = 25//有多个参数时的行间间隔
    if (document.getElementById(id) !== null) {
        document.querySelector(pls).removeChild(document.getElementById(id));
    }
	//利用canvas绘制水印信息
    var canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 220;
    var shuiyin = canvas.getContext('2d');
    shuiyin.rotate(-30 * Math.PI / 180);
    shuiyin.font = '18px Vedana';
    shuiyin.fillStyle = 'rgba(153, 153, 153, 0.2)';
    shuiyin.textAlign = 'center';
    let content = args.join(' '); //多个标签拼接
    //content="徐同学123 xutongxue  11112222333344445555 风测试"
    // 判断内容是否可以一行绘制完毕
    //console.log(shuiyin.measureText(content).width)
    if(shuiyin.measureText(content).width <= 210) {
        var drawTxt = ''; // 当前绘制的内容
        var drawLine = 1; // 第几行开始绘制
        var drawIndex = 0; // 当前绘制内容的索引
        shuiyin.fillText(content.substring(drawIndex, i), xIndex, yIndex,200);
    } else {
        for (var i = 0; i < content.length; i++) {
            drawTxt += content[i];
            if (shuiyin.measureText(drawTxt).width >= 210) {               
                if (drawLine >= 3) {
                shuiyin.fillText(content.substring(drawIndex, i) + '..', xIndex, yIndex,200);
                break;
                } else {
                shuiyin.fillText(content.substring(drawIndex, i + 1), xIndex, yIndex, 200);
                drawIndex = i + 1;
                drawLine += 1;
                yIndex += xInterval;
                drawTxt = '';
                }
            } else {
                // 内容绘制完毕，但是剩下的内容宽度不到200
                if (i === content.length - 1) {
                    shuiyin.fillText(content.substring(drawIndex), xIndex, yIndex);
                }
            }
        }
    }
    //创建div用于显示
    var watermark = document.createElement('div');
    watermark.id=id
    const styleStr = `
        position:absolute;
        top:0;
        left:0;
        width:100%;
        height:100%;
        z-index:0;
        pointer-events:none;
        background-repeat:repeat;
        background-position: left top;
        mix-blend-mode: multiply;
        background-image:url('${canvas.toDataURL("image/png")}')`;

    watermark.setAttribute('style', styleStr);
    watermark.classList.add('watermark')
    document.querySelector(pls).appendChild(watermark);
    //此方法是防止用户通过控制台修改样式去除水印效果
    /* MutationObserver 是一个可以监听DOM结构变化的接口。 */
    const observer = new MutationObserver(() => {
        const wmInstance = document.querySelector('.watermark');
        if ((wmInstance && wmInstance.getAttribute('style') !== styleStr) || !wmInstance) {
            //如果标签在，只修改了属性，重新赋值属性
            if (wmInstance) {
                // 避免一直触发
                // observer.disconnect();
                // console.log('水印属性修改了');
                wmInstance.setAttribute('style', styleStr);
            } else {
                observer.disconnect();
            }
        }
    })
    observer.observe(document.body, {
        attributes: true,
        subtree: true,
        childList: true,
    });
    return id;
}
watermark.set = function(){
  let args =Array.prototype.slice.apply(arguments);
    setWatermark(args[0],args[1]);
    //在窗口大小改变之后,自动触发加水印事件
    window.onresize = function(){
        setWatermark(args[0],args[1]);
    }
}
watermark.close = function(pls){
    
    let watermark = document.querySelector('.watermark')
    if(watermark){
        document.querySelector(pls).removeChild(watermark)
    }
    
}

export default watermark
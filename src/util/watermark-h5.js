var watermark = {}

function setWatermark(pls, args) {
  //声明一个怪异一点的变量，确保id的唯一性
  var id = '111.222.333.456';

  if (document.getElementById(id) !== null) {
    document.querySelector(pls).removeChild(document.getElementById(id));
  }
  //利用canvas绘制水印信息
  var canvas = document.createElement('canvas');
  canvas.width = 300;
  canvas.height = 200;
  var ctx = canvas.getContext('2d');
  let textArr1 = [...args]
  let textArr2 = []

  if (textArr1.length > 2) {
    textArr2 = textArr1.splice(2)
  }

  let text1 = textArr1.join(' ')
  let text2 = textArr2.length ? textArr2.join(' ') : ''


  ctx.rotate(-20 * Math.PI / 180);
  ctx.font = "18px PingFang SC";
  ctx.fillStyle = "rgba(153, 153, 153, 0.2)";
  ctx.textAlign = 'center';

  let drawY = 0
  let text1Width = ctx.measureText(text1).width
  let text2Width = ctx.measureText(text2).width

  if (text1Width < 300 && text2Width < 300) {
    drawY = 130
  } else if (text1Width > 300 && text2Width > 300) {
    drawY = 88
  } else {
    drawY = 116
  }

  if (text1Width < 300) {
    ctx.fillText(text1, (300 - text1Width) / 2, drawY, 300);
  } else {
    textArr1.forEach((item, i) => {
      if (ctx.measureText(item).width < 300) {
        let len = Math.ceil(ctx.measureText(item).width)
        ctx.fillText(item, (300 - len) / 2, drawY + i * 28, 300);
      } else {
        ctx.fillText(item, 0, drawY + i * 28, 300);
      }
    })

    drawY += textArr1.length * 28
  }

  if (text2) {
    if (ctx.measureText(text2).width < 300) {
      let len = Math.ceil(ctx.measureText(text1).width)
      ctx.fillText(text2, (300 - len) / 2, drawY + 28, 300);
    } else {
      textArr2.forEach((item, i) => {
        if (ctx.measureText(item).width < 300) {
          let len = Math.ceil(ctx.measureText(item).width)
          ctx.fillText(item, (300 - len) / 2, drawY + i * 28, 300);
        } else {
          ctx.fillText(item, 0, drawY + i * 28, 300);
        }
      })
    }
  }


  //创建div用于显示
  var watermark = document.createElement('div');
  watermark.id = id
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
        background-size: 400px;
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
watermark.set = function () {
  let args = Array.prototype.slice.apply(arguments);
  setWatermark(args[0], args[1]);
  //在窗口大小改变之后,自动触发加水印事件
  window.onresize = function () {
    setWatermark(args[0], args[1]);
  }
}
watermark.close = function (pls) {

  let watermark = document.querySelector('.watermark')
  if (watermark) {
    document.querySelector(pls).removeChild(watermark)
  }

}

export default watermark

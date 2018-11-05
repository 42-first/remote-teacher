/*
 * 白板绘制模块
 * @author: chenzhou
 * @update: 2018.10.19
 * @desc 白板绘制功能汇总
 *
 */


let boardMixin = {
  methods: {
    /*
     * @method canvas上下文信息
     * @param
     */
    getContext(boardid) {
      let domID = `#canvas_${boardid}`;
      let canvasEl = document.querySelector(domID);

      if(canvasEl) {
        // type webgl/2d
        let context = canvasEl.getContext('2d');

        return context;
      } else {
        return null;
      }
    },

    /*
     * @method 划线
     * @param context画板上下文 coords 轨迹点, color: id 白板的ID
     */
    drawLine(context, coords, color, id) {
      context = context || this.getContext(id);

      if(!context) {
        return null;
      }

      // 线的颜色
      color = color || '#000000';
      context.fillStyle = color;
      context.strokeStyle = color;
      // 线的类型
      context.lineCap = 'round';
      context.lineJoin = 'round';

      if(context && coords && coords.length) {
        // 方案一 正常划线
        let start = coords[0];
        // 线的宽度
        context.lineWidth = start.w;

        context.beginPath();
        // 先移动到第一个点
        context.moveTo(start.x, start.y);
        // 然后lineTo绘制线
        for(let i = 1; i < coords.length; i++) {
          let point = coords[i];
          context.lineTo(point.x, point.y);
          // context.fillRect(point.x, point.y, point.w, point.h);
        }

        // 描边
        context.stroke();
        // 状态继续存储 方便后面回退
        context.save();
      }

    },

    /*
     * @method 擦除
     * @param context画板上下文 coords 轨迹点, id:板子ID
     */
    eraseLine(context, coords, id) {
      context = context || this.getContext(id);

      if(!context) {
        return null;
      }

      let color = '#ffffff';
      context.fillStyle = color;
      context.strokeStyle = color;

      if(context && coords && coords.length) {
        // 方案一 正常划线
        let start = coords[0];
        // 线的宽度
        context.lineWidth = start.w;

        context.beginPath();
        // 先移动到第一个点
        context.moveTo(start.x, start.y);
        // 然后lineTo绘制线
        for(let i = 1; i < coords.length; i++) {
          let point = coords[i];
          context.lineTo(point.x, point.y);
          context.fillRect(point.x, point.y, point.w, point.h);
          context.clearRect(point.x, point.y, point.w, point.h);
        }

        // 状态继续存储 方便后面回退
        context.save();
      }
    },

    /*
     * @method 滚动到白板
     * @param
     */
    scrollIntoBoard(boardid) {
      let domID = `#canvas_${boardid}`;
      let canvasEl = document.querySelector(domID);

      if(canvasEl) {
        canvasEl.scrollIntoView();
        this.hasMsg = false;
      }
    },

    /*
     * @method 白板置顶
     * @param
     */
    setTopping(boardInfo) {
      let id = boardInfo.boardid;
      // 找到之前的板子
      let targetIndex = this.cards.findIndex((item) => {
        return item.type === 12 && item.boardid === id;
      })

      // 删除之前的白板
      targetIndex && this.cards.splice(targetIndex, 1);

      // 新建白板
      this.cards.push(boardInfo);

      // 将原来的所有线重新复原
      this.restore(boardInfo);
      // setTimeout(()=>{
      //   // 将原来的所有线重新复原
      //   this.restore(boardInfo);
      // }, 1000)

    },

    /*
     * @method 清屏
     * @param
     */
    restore(boardInfo, context) {
      let id = boardInfo.boardid;

      if(boardInfo.lines) {
        boardInfo.lines.forEach((line) => {
          let isErase = line.type === 'erase' ? true : false;
          if(isErase) {
            this.eraseLine(context, line.coords, id);
          } else {
            this.drawLine(context, line.coords, line.color, id);
          }
        })
      }

    },

    /*
     * @method 清屏
     * @param
     */
    clearScreen(id) {
      let context = this.getContext(id);
      let boardInfo = this.boardMap.get(id);

      if(!context) {
        return null;
      }

      context.clearRect(0, 0, boardInfo.devwidth, boardInfo.devheight);
    }

  }
}


export default boardMixin;

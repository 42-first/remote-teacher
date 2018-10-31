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
     * @param id 白板的ID coords 轨迹点, isErase: 是否擦除
     */
    drawLine(id, coords, isErase = false) {
      let context = this.getContext(id);
      let boardInfo = this.boardMap.get(id);

      if(!context) {
        return null;
      }

      // 线的颜色
      let color = boardInfo.color || '#000000';
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
     * @param id 白板的ID coords 轨迹点, isErase: 是否擦除
     */
    eraseLine(id, coords) {
      let context = this.getContext(id);

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

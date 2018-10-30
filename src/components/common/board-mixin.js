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
     * @method 创建白板
     * @param boardInfo
     */
    createBoard(boardInfo) {
      // 创建canvas画板
      // 根据boardID 拿到canvas上下文
      let domID = `#canvas_${boardInfo.boardid}`;
      let canvasEl = document.querySelector(domID);
      // type webgl/2d
      let context = canvasEl.getContext('2d');
      this.canvasContext = context;

    },

    /*
     * @method canvas上下文信息
     * @param
     */
    getContext(boardid) {
      let domID = `#canvas_${boardid}`;
      let canvasEl = document.querySelector(domID);
      // type webgl/2d
      let context = canvasEl.getContext('2d');

      return context;
    },

    /*
     * @method 划线
     * @param id 白板的ID coords 轨迹点, isErase: 是否擦除
     */
    drawLine(id, coords, isErase = false) {
      let context = this.getContext(id);
      let boardInfo = this.boardMap.get(id);

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
      // let boardInfo = this.boardMap.get(id);

      let color = '#ffffff';
      context.fillStyle = color;
      context.strokeStyle = color;

      if(context && coords && coords.length) {
        // 擦除点的区域
        /*
        for(let i = 0; i < coords.length; i++) {
          let point = coords[i];
          context.clearRect(point.x, point.y, point.w, point.h);
          context.fillRect(point.x, point.y, point.w, point.h);
        }
        */

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

      context.clearRect(0, 0, boardInfo.devwidth, boardInfo.devheight);
    }

  }
}


export default boardMixin;

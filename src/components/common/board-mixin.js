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
      let self = this;
      // 创建canvas画板
      // 根据boardID 拿到canvas上下文
      let domID = `canvas_${boardInfo.id}`;
      let canvasEl = document.querySelector(domID);
      // canvasEl.parentNode.getBoundingClientRect(); width
      // type webgl/2d
      let context = canvasEl.getContext('2d');
      this.canvasContext = context;
      // 缩放 原本画布宽高 设备宽 算出对应比例
      // 计算宽高比
      // context.scale(0.75, 0.75);
      // 缩放后如果不居中 可以计算后通过 translate() 移动位置

    },

    /*
     * @method 划线
     * @param id 白板的ID coords 轨迹点, isErase: 是否擦除
     */
    drawLine(id, coords, isErase = false) {
      let context = this.canvasContext;

      // 线的颜色
      // context.fillStyle = color;
      // 线的宽度
      // context.lineWidth = value;

      // 先移动到第一个点
      // context.moveTo(positionA[0], positionA[1]);
      // 然后lineTo绘制线
      // context.lineTo(positionB[0], positionB[1]);

      if(context && coords && coords.length) {
        // 先移动到第一个点
        context.moveTo(coords[0].x, coords[1].y);
        // 然后lineTo绘制线
        for(let i = 1; i < coords.length; i++) {
          context.lineTo(coords[i].x, coords[i].y);
        }

        // 描边
        context.stroke();
        // 状态继续存储 方便后面回退
        context.save();
      }

    },

    /*
     * @method 白板清屏
     * @params
     */
    handleplay() {

    },

  }
}


export default boardMixin;

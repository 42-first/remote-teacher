/*
 * 学生接收器 直播视频移动
 * @author: chenzhou
 * @update: 2019.9.27
 * @desc
 *
 */


let eventMixin = {
  data() {
    return {
      shape: {},
      // 移动相对位置
      offset: {
        offsetX: 0,
        offsetY: 0
      },
      // 形状尺寸位置
      resizeState: {
        isResizing: false,
        startX: 0,
        startY: 0,
        direction: '',
      }
    }
  },
  methods: {
    /**
     * @method 事件监听
     * @params
     */
    initEvent() {
      let videoEl = this.$el.querySelector('.J_live');
      let videoWrapEl = this.$el.querySelector('.J_live_wrap');

      videoEl.addEventListener('mousedown', (evt) => {
        if(evt.target.parentElement.className.indexOf('volume_list') != -1) return
        evt.preventDefault();

        // resize 过程中不移动
        if(this.resizeState.isResizing) {
          return this;
        }

        this.canMove = true;

        const cssStyles = getComputedStyle(videoWrapEl);
        let xVal = String(cssStyles.getPropertyValue('--x')).trim();
        let yVal = String(cssStyles.getPropertyValue('--y')).trim();
        xVal = parseInt(xVal, 10);
        yVal = parseInt(yVal, 10);

        const x = evt.clientX - xVal;
        const y = evt.clientY - yVal;
        this.lastPoint = { x, y };

        console.dir(cssStyles);
      }, true)

      videoEl.addEventListener('mouseup', (evt) => {
        evt.preventDefault();

        this.canMove = false;

        setTimeout(()=>{
          videoEl.querySelector('#player').play();
        }, 400)
      }, true)

      videoEl.addEventListener('mouseout', (evt) => {
        evt.preventDefault();

        this.canMove = false;
      }, true)

      videoEl.addEventListener('mousemove', (evt)=>{
        evt.preventDefault();

        if(this.canMove) {
          let lastPoint = this.lastPoint;
          let x = evt.clientX - lastPoint.x;
          let y = evt.clientY - lastPoint.y;
          let offset = { x, y };

          if(Math.abs(x) > 10 || Math.abs(y) > 10) {
            this.translateContent(offset);
          }

          return false;
        }
      }, true)

      let anchorEls = this.$el.querySelectorAll('.J_anchor');
      anchorEls.forEach((anchorEl)=>{
        anchorEl.addEventListener('mousedown', this.handleAnchorMousedown);
      })
    },

    translateContent(offset) {
      let videoWrapEl = this.$el.querySelector('.J_live_wrap');
      let offsetX = offset.x;
      let offsetY = offset.y;

      videoWrapEl.style.setProperty('--x', offsetX + 'px');
      videoWrapEl.style.setProperty('--y', offsetY + 'px');
    },

    /**
     * @method resize锚点激活
     * @params
     */
    handleAnchorMousedown(evt) {
      console.log('anchorEl mousedown');
      evt.stopPropagation();

      let shapeEl = this.$el.querySelector('.J_live_wrap');
      let width = shapeEl.clientWidth;
      let height = shapeEl.clientHeight;

      let target = evt.currentTarget;
      let direction = target.dataset.direction;
      this.resizeState = {
        isResizing: true,
        startX: evt.pageX,
        startY: evt.pageY,
        direction: direction,
        width,
        height
      };

      this.addResizeEventListeners(target);
    },

    addResizeEventListeners(el) {
      el.addEventListener('mousemove', this.handleResize)
      el.addEventListener('mouseup', this.handleResizeEnd)

      document.addEventListener('mousemove', this.handleResize)
      document.addEventListener('mouseup', this.handleResizeEnd)
    },

    removeResizeEventListeners(el) {
      el.removeEventListener('mousemove', this.handleResize)
      el.removeEventListener('mouseup', this.handleResizeEnd)

      document.removeEventListener('mousemove', this.handleResize)
      document.removeEventListener('mouseup', this.handleResizeEnd)
    },

    /**
     * @method 计算移动位置
     * @params
     */
    getOffset(evt) {
      let movingState = this.resizeState;
      let offsetX = evt.pageX - movingState.startX;
      let offsetY = evt.pageY - movingState.startY;
      let offset = { offsetX, offsetY };

      this.offset = offset;

      return offset;
    },

    /**
     * @method shape改变尺寸
     * @params
     */
    handleResize(evt) {
      evt.preventDefault();

      if(!this.resizeState.isResizing) {
        return false;
      }

      let shapeEl = this.$el.querySelector('.J_live_wrap');
      let { direction, width, height} = this.resizeState;
      let offset = this.getOffset(evt);

      const cssStyles = getComputedStyle(shapeEl);
      let xVal = String(cssStyles.getPropertyValue('--x')).trim();
      let yVal = String(cssStyles.getPropertyValue('--y')).trim();
      let offsetX  = parseInt(xVal, 10);
      let offsetY = parseInt(yVal, 10);

      console.log(direction)

      switch (direction) {
        case 'north-west':
          // 宽度都变化
          width -= offset.offsetX;

          shapeEl.style.width = `${width}px`;
          shapeEl.style.transform = `matrix(1, 0, 0, 1, ${offsetX}, ${offsetY})`;

          break;

        case 'north-east':
          // 宽度都变化
          width += offset.offsetX
          offsetX += offset.offsetX
          offsetY -= offset.offsetX

          shapeEl.style.width = `${width}px`;
          shapeEl.style.transform = `matrix(1, 0, 0, 1, ${offsetX}, ${offsetY})`;

          break;

        case 'south-east':
          // 宽度都变化
          width += offset.offsetX
          offsetX += offset.offsetX

          shapeEl.style.width = `${width}px`;
          shapeEl.style.transform = `matrix(1, 0, 0, 1, ${offsetX}, ${offsetY})`;

          break;

        case 'south-west':
          // 宽度都变化
          width -= offset.offsetX

          shapeEl.style.width = `${width}px`;
          shapeEl.style.transform = `matrix(1, 0, 0, 1, ${offsetX}, ${offsetY})`;

          break;

        default:
          break;
      }

    },

    /**
     * @method shape改变尺寸
     * @params
     */
    handleResizeEnd(evt) {
      let target = evt.currentTarget;
      let shapeEl = this.$el.querySelector('.J_live_wrap');
      shapeEl.style.transform = '';

      let { direction } = this.resizeState;
      let offset = this.getOffset(evt);
      const cssStyles = getComputedStyle(shapeEl);
      let xVal = String(cssStyles.getPropertyValue('--x')).trim();
      let yVal = String(cssStyles.getPropertyValue('--y')).trim();
      let offsetX  = parseInt(xVal, 10);
      let offsetY = parseInt(yVal, 10);

      switch (direction) {
        case 'north-west':
          // 宽度都变化
          width -= offset.offsetX;
          shapeEl.style.width = `${width}px`;

          break;

        case 'north-east':
          // 宽度都变化
          width += offset.offsetX
          offsetX += offset.offsetX
          offsetY -= offset.offsetX

          shapeEl.style.width = `${width}px`;
          shapeEl.style.setProperty('--x', offsetX + 'px');
          shapeEl.style.setProperty('--y', offsetY + 'px');

          break;

        case 'south-east':
          // 宽度都变化
          width += offset.offsetX
          offsetX += offset.offsetX

          shapeEl.style.width = `${width}px`;
          shapeEl.style.setProperty('--x', offsetX + 'px');

          break;

        case 'south-west':
          // 宽度都变化
          width -= offset.offsetX

          shapeEl.style.width = `${width}px`;

          break;

        default:
          break;
      }

      let width = shapeEl.clientWidth;
      let height = shapeEl.clientHeight;
      this.resizeState = Object.assign(this.resizeState, { width, height, isResizing: false });

      this.removeResizeEventListeners(target);
    },


  }
}


export default eventMixin;

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
      // 移动相对位置
      offset: {
        offsetX: 0,
        offsetY: 0
      },
    }
  },
  methods: {
    /**
     * @method 事件监听
     * @params
     */
    initEvent() {
      let meetingEl = document.querySelector('.J_meeting');

      meetingEl.addEventListener('mousedown', (evt) => {
        if(evt.target.parentElement && evt.target.parentElement.className.indexOf('J_action') != -1) return;
        // evt.preventDefault();

        this.canMove = true;

        const cssStyles = getComputedStyle(meetingEl);
        let xVal = String(cssStyles.getPropertyValue('--x')).trim();
        let yVal = String(cssStyles.getPropertyValue('--y')).trim();
        xVal = parseInt(xVal, 10);
        yVal = parseInt(yVal, 10);

        const x = evt.clientX - xVal;
        const y = evt.clientY - yVal;
        this.lastPoint = { x, y };

        this.addEventListeners();
      }, true)
    },

    translateContent(offset) {
      let meetingEl = this.$el;
      let offsetX = offset.x;
      let offsetY = offset.y;

      meetingEl.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
      meetingEl.style.setProperty('--x', offsetX + 'px');
      meetingEl.style.setProperty('--y', offsetY + 'px');
    },

    addEventListeners() {
      this.$el.addEventListener('mousemove', this.handleMove)
      this.$el.addEventListener('mouseup', this.handleMoveEnd)

      document.addEventListener('mousemove', this.handleMove)
      document.addEventListener('mouseup', this.handleMoveEnd)
    },

    removeEventListeners() {
      this.$el.removeEventListener('mousemove', this.handleMove)
      this.$el.removeEventListener('mouseup', this.handleMoveEnd)

      document.removeEventListener('mousemove', this.handleMove)
      document.removeEventListener('mouseup', this.handleMoveEnd)
    },

    /**
     * @method shape移动
     * @params
     */
    handleMove(evt) {
      evt.preventDefault();

      if(!this.canMove) {
        return false;
      }

      let lastPoint = this.lastPoint;
      let x = evt.clientX - lastPoint.x;
      let y = evt.clientY - lastPoint.y;
      let offset = { x, y };

      if(Math.abs(x) + Math.abs(y) > 5) {
        this.translateContent(offset);
      }
    },

    handleMoveEnd(evt) {
      this.removeEventListeners();
      this.canMove = false;
    },

  }
}


export default eventMixin;

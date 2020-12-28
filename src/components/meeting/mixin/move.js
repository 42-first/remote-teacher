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
        if(evt.target.parentElement.className.indexOf('J_action') != -1) return;
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

        console.dir(cssStyles);
      }, true)

      meetingEl.addEventListener('mouseup', (evt) => {
        evt.preventDefault();

        this.canMove = false;
      }, true)

      meetingEl.addEventListener('mouseout', (evt) => {
        evt.preventDefault();

        this.canMove = false;
      }, true)

      meetingEl.addEventListener('mousemove', (evt)=>{
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
    },

    translateContent(offset) {
      let meetingEl = document.querySelector('.J_meeting');
      let offsetX = offset.x;
      let offsetY = offset.y;

      meetingEl.style.setProperty('--x', offsetX + 'px');
      meetingEl.style.setProperty('--y', offsetY + 'px');
    },

  }
}


export default eventMixin;

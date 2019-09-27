/*
 * 学生接收器 直播视频移动
 * @author: chenzhou
 * @update: 2019.9.27
 * @desc
 *
 */


let eventMixin = {
  methods: {
    /**
     * @method 事件监听
     * @params
     */
    initEvent() {
      let videoEl = this.$el.querySelector('#player');
      videoEl.addEventListener('mousedown', (evt) => {
        evt.preventDefault();

        this.canMove = true;

        const cssStyles = getComputedStyle(videoEl);
        let xVal = String(cssStyles.getPropertyValue('--x')).trim();
        let yVal = String(cssStyles.getPropertyValue('--y')).trim();
        xVal = parseInt(xVal, 10);
        yVal = parseInt(yVal, 10);

        const x = evt.clientX - xVal;
        const y = evt.clientY - yVal;
        this.lastPoint = { x, y };

        console.dir(cssStyles);
      })

      videoEl.addEventListener('mouseup', (evt) => {
        evt.preventDefault();

        this.canMove = false;

        setTimeout(()=>{
          videoEl.play();
        }, 400)
      })

      videoEl.addEventListener('mouseout', (evt) => {
        evt.preventDefault();

        this.canMove = false;
      })

      videoEl.addEventListener('mousemove', (evt)=>{
        evt.preventDefault();

        if(this.canMove) {
          let lastPoint = this.lastPoint;
          let x = evt.clientX - lastPoint.x;
          let y = evt.clientY - lastPoint.y;
          let point = { x, y };

          if(Math.abs(x) > 10 || Math.abs(y) > 10) {
            this.translateContent(point);
          }

          return false;
        }
      })
    },

    translateContent(point) {
      let videoEl = this.$el.querySelector('#player');
      let lastPoint = this.lastPoint;

      let offsetX = point.x;
      let offsetY = point.y;

      videoEl.style.setProperty('--x', offsetX + 'px');
      videoEl.style.setProperty('--y', offsetY + 'px');
    },

  }
}


export default eventMixin;

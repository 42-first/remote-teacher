/**
 * @author [涂秋爽]
 * @email [tuqiushuang@xuetangx.com]
 * @create date 2024-11-21 13:22:03
 * @modify date 2024-11-21 13:22:03
 * @desc [chat会话]
 */

<template>
  <div class="chat-wrapper">
    <div class="drag-handle J_drag"></div>
    <div class="close box-center" @click="$emit('close')">
      <i class="iconfont icon-guanbi1 f14"></i>
    </div>
    <div class="container">
      <iframe :src="chatUrl" frameborder="0"></iframe>
    </div>
  </div>
</template>
<script>

  export default {
    data() {
      return {
        // 移动相对位置
        offset: {
          offsetX: 0,
          offsetY: 0
        },
      }
    },
    computed: {
     
    },
    watch: {
      
    },
    props: {
      chatUrl: String
    },
    methods: {
      /**
       * @method 初始化状态
       */
      init() {
        this.initEvent();
      },

       /**
       * @method 事件监听
       * @params
       */
      initEvent() {
        let dragEl = this.$el.querySelector('.J_drag');

        dragEl.addEventListener('mousedown', (evt) => {
          this.canMove = true;

          const cssStyles = getComputedStyle(dragEl);
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
        let chatEl = this.$el;
        let offsetX = offset.x;
        let offsetY = offset.y;

        chatEl.style.transform = `translate(${offsetX}px, ${offsetY}px)`;

        chatEl.style.setProperty('--x', offsetX + 'px');
        chatEl.style.setProperty('--y', offsetY + 'px');
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

        this.translateContent(offset);
      },

      handleMoveEnd(evt) {
        this.removeEventListeners();
        this.canMove = false;
      },
    },
    created() {
    },
    mounted() {
      this.init();
    },
    beforeDestroy() {
    
    }
  }
</script>
<style lang="scss" scoped>
  .chat-wrapper {
    position: fixed;
    top: 40px;
    right: 50px;
    width: 400px;
    height: calc(100vh - 100px);
    z-index: 99999;
    background: #f7f9ff;
    border: 1px solid #b5ccfc;
    border-radius: 12px;
    box-shadow: 0 6px 26px 0 rgba(123, 135, 178, .14);
    display: flex;
    flex-direction: column;

    .drag-handle {
      width: 100%;
      height: 20px;
      cursor: move;
      position: absolute;
      top: 0;
      left: 0;
    }

    .close {
      position: absolute;
      width: 26px;
      height: 26px;
      top: -12px;
      right: -12px;
      z-index: 2;
      cursor: pointer;
      background: #f4f9ff;
      border: 1px solid #b5ccfc;
      border-radius: 50%;

      &:hover {
        background: #e7f0ff;
      }
    }
    iframe {
      width: 100%;
      height: 100%;
    }

    .container {
      flex: 1;
      overflow: hidden;
      border-radius: 12px;
    }
  }

</style>
<style>
  .chat-wrapper {
    --x: 0px;
    --y: 0px;

    transform: translate(var(--x), var(--y));
  }
</style>
/*
 * 大屏接收器 指令监听
 * @author: chenzhou
 * @update: 2020.3.1
 * @desc 状态指令监听 组件间通信策略 交互触发 消息发送
 *
 */


import { mapState, mapActions } from 'vuex';


var commandMixin = {
  computed: {
    // 使用对象展开运算符将 getter 混入 computed 对象中
    ...mapState([
      'slideIndex',
    ])
  },
  watch: {
    slideIndex(newVal, oldVal) {
      if(newVal) {
        let slide = this.cards[newVal];

        this.handleViewDetail(slide, newVal);
      }
    },
  },
  methods: {
    /**
     * @method timeline详情
     * @params
     */
    handleViewDetail(item, index) {
      if(item && item.type) {
        let path = '';
        switch (item.type) {
          // ppt
          case 2:
            path = `/${this.lesson.lessonID}/ppt/${index}`;
            this.$router.replace({ path });

            break;

          // 截图
          case 10:
          case 11:
            // ppt
            path = `/${this.lesson.lessonID}/ppt/${index}`;
            this.$router.replace({ path });

            break;

          // 习题
          case 3:
            path = item.pageURL + item.index;
            this.$router.replace({ path });
            break;

          // 试卷
          case 4:
            path = `/${this.lesson.lessonID}/webview/${index}`;
            this.$router.replace({ path });
            break;

          // 白板
          case 12:
            path = `/${this.lesson.lessonID}/webview/${index}`;
            this.$router.replace({ path });
            break;

          default:
            break;
        }
      }
    },

  }
}


export default commandMixin;

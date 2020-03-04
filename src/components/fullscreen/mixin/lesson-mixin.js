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
      'msg',
    ])
  },
  watch: {
    slideIndex(newVal, oldVal) {
      if(newVal) {
        let slide = this.cards[newVal];

        this.handleViewDetail(slide, newVal);

        // 点击的最新动态关闭消息
        if(this.msg && this.msg.index === newVal) {
          this.setMsg(null);
        }
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

            break;

          // 截图
          case 10:
          case 11:
            // ppt
            path = `/${this.lesson.lessonID}/ppt/${index}`;

            break;

          // 习题
          case 3:
            path = item.pageURL + item.index;

            break;

          // 试卷
          case 4:
            path = `/${this.lesson.lessonID}/webview/${index}`;

            break;

          // 红包
          case 5:
            path = `/${this.lesson.lessonID}/hongbao/${index}`;

            break;

          // 投稿分享
          case 6:
            path = `/${this.lesson.lessonID}/submission_share/${index}`;

            break;

          // 主观题答案分享
          case 7:
            path = `/${this.lesson.lessonID}/subjective_share/${index}`;

            break;

          // 发起了分组
          case 8:
            path = `/${this.lesson.lessonID}/webview/${index}`;

            break;

          // 发起了互评
          case 9:
            path = `/${this.lesson.lessonID}/evaluation/${index}`;

            break;

          // 白板
          case 12:
            path = `/${this.lesson.lessonID}/webview/${index}`;

            break;

          // 问题解析
          case 13:
            path = `/${this.lesson.lessonID}/analysis/${index}`;

            break;

          default:
            break;
        }

        // this.$router.replace({ path });
        this.$router.push({ path });
      }
    },

  }
}


export default commandMixin;

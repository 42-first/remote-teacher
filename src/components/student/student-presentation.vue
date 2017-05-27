/*
 * @page：学生接收器页面级组件
 * @author: chenzhou
 * @update: 2017.5.27
 * @desc 课堂ppt接收，课堂习题，课堂试卷，课堂红包和老师遥控器实时通信等
 *
 */

<template>
  <section class="page">
    <!-- header 返回 弹幕 投稿 标题 -->
    <header class="student__header">
      <p class="student__header--back"><i class="iconfont icon-back"></i></p>
      <h3 class="header-title"></h3>
      <div class="student__header--more">
        <i class="iconfont icon-add"></i>
        <div class="none"></div>
      </div>
    </header>

    <!-- tab  -->
    <selction class="">
      <ul class="student__tabs"></ul>
    </selction>

  </section>
</template>
<script>
  import moment from 'moment'
  import request from '@/util/request';
  import _ from 'underscore';
  import wsmixin from '@/components/student/student-socket';

  export default {
    name: 'student-page',
    props: {
    },
    data() {
      return {
        pptWidth: 0,
        pptHeight: 0,
        // 是否有课程锁定
        isLock: false,
        date: '',
        // 直播的位置
        sindex: 0,
        socket: null,
        userID: 0,
        avatar: '',
        userAuth: '',
        // 后端交互获取的直播lessonIDs
        allLessonIDs: [],
        // 课程IDs
        alessonids: null,
        // 结构保持和九宫格统一
        oLessons: {},
        alessons: [],
        // 直播映射表：九宫格那个格子在直播 直播对应的ID
        lessonsMap: [],
        // 没有直播的课程池
        unLivePool: []
      };
    },
    components: {
    },
    computed: {
    },
    watch: {
      pptHeight: function (Height) {
        this.pptWidth && this.pptHeight && this.handleResize();
      }
    },
    filters: {
    },
    mixins: [ wsmixin],
    methods: {
      /*
      * @method 直播初始化
      */
      init(){
        let self = this;
      },
      /*
      * @method 直播悬停反面等事件
      */
      initEvent(){

      },

      /*
      * @method 读取直播的课程列表和auth信息
      * @param  init: 是否初始化socket
      */
      getLiveLessons(init) {
        let self = this;
        let URL = '';
        let alessonids = [];
        let unLivePool = [];

        if (process.env.NODE_ENV === 'production') {
          URL = '/edu_admin/president/get_on_lessons/';
        } else {
          URL = '/static/mock/live/live.json';
        }

        // lessons
        request.get(URL)
          .then(function (res) {
            if(res.data.success) {
              let data = res.data.data;
              let ids = data.lesson_ids;
              let lessonid = null;

              self.allLessonIDs = ids;
              self.userID = data.user_id;
              self.userAuth = data.professional_auth_code;

              for(let i = 0, count = ids.length; i<count; i++) {
                lessonid = ids[i].lesson_id;
                // 加入直播的课程
                alessonids.push(lessonid);

                // 九宫格随机显示课程
                init && !self.oLessons[lessonid] && self.setLesson(lessonid);
                // 初始化socket后未直播的课程池
                !init && !self.oLessons[lessonid] && unLivePool.push(lessonid);

                // 模拟websocket
                if (process.env.NODE_ENV !== 'production') {
                  self.oLessons[lessonid] && self.getPresentation(lessonid, 100, parseInt(Math.random()*6+1));
                }
              }

              // 初始化socket后每分钟更新直播课程
              !init && self.updateLive(alessonids, unLivePool);
              self.unLivePool = unLivePool;

              // websocket通信使用
              self.alessonids = alessonids.length > 9 ? alessonids.slice(0, 9) : alessonids.slice(0);
              init && ids.length && self.initws();
            }
          })
          .catch(function (error) {
            console.log(error);
          });

        this.setDate();
      },

      /*
       * @method 浏览器窗口变化数据变化
       * 比例 4:3 16:9
       */
      handleResize() {
        // 比例根据PPT计算下
        let iHeight = $(window).height()-70;
        let iWidth = iHeight * (16/9);

        this.pptHeight && this.pptWidth && (iWidth = iHeight * ( this.pptWidth / this.pptHeight));
        $(this.$el).find('.J_course_list').width(iWidth);
        $(this.$el).find('.J_live_header').width(iWidth);
      },
      /*
       * @method 返回上一页
       *
       */
      doBack(){
        this.$router.back();
      },
      /*
       * @method 刷新数据
       *
       */
      doRefresh(){
        location.reload();
      }
    },
    created() {
      this.init();
    },
    mounted() {
    },
    beforeDestroy() {

    }
  };
</script>

<style lang="scss">
  @import "~@/style/font/iconfont/iconfont.css";

  .page {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }


</style>

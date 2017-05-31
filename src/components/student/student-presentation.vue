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
      <p class="student__header--back"><i class="iconfont icon-back f25"></i></p>
      <h3 class="header-title f18">学生遥控器</h3>
      <div class="student__header--more">
        <i class="iconfont icon-add f25"></i>
        <div class="none"></div>
      </div>
    </header>

    <!-- tab  -->
    <section class="">
      <ul class="student__tabs f15">
        <li class="tab-item curr">全部</li>
        <li class="tab-item">PPT</li>
        <li class="tab-item">习题</li>
        <li class="tab-item">试卷</li>
        <li class="tab-item">红包</li>
      </ul>
    </section>

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
        // 课程ID
        lessonID: 0,
        // pptID
        presentationID: 0,

        // 权限相关
        userID: 0,
        avatar: '',
        userAuth: 0,

        // 当前tab下标
        currTabIndex: 0,

        // 是否观看模式
        observerMode: false,
        presentationList: null,
        quizList: null,
        commitDiffURL: '/lesson/lesson_submit_difficulties'
      };
    },
    components: {
    },
    computed: {
    },
    watch: {
      pptHeight: function (Height) {
      }
    },
    filters: {
    },
    mixins: [ wsmixin],
    methods: {
      /*
      * @method 接收器初始化
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

            }
          })
          .catch(function (error) {
            console.log(error);
          });
      },

      /*
       * @method 浏览器窗口变化数据变化
       * 比例 4:3 16:9
       */
      handleResize() {
        // 比例根据PPT计算下
        let iHeight = $(window).height()-70;
        let iWidth = iHeight * (16/9);
      },
      /*
       * @method 返回上一页
       *
       */
      doBack(){
        this.$router.back();
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



  /*-------------------*\
    $ header
  \*-------------------*/


  .student__header {
    display: flex;
    align-items: center;
    justify-content: center;

    height: 1.33rem;
    color: #2A2A2A;
    background: #EDF2F6;
    /* box-shadow: 0 4px 6px rgba(0,0,0, 0.2); */

    .student__header--back, .student__header--more {
      width: 1rem;
    }

    .header-title {
      flex: 1;
    }
  }

  /*
  .student__header:after {
    content: '';
    position: absolute;
    left: 0;
    bottom: 0;
    right: auto;
    top: 1.33rem;
    height: 1px;
    width: 100%;
    background-color: #c4c4c4;
    display: block;
    z-index: 15;
    -webkit-transform-origin: 50% 100%;
    transform-origin: 50% 100%;
  }
  */




  /*-------------------*\
    $ header
  \*-------------------*/


  .student__tabs {
    display: flex;
    align-items: center;
    justify-content: space-around;

    height: 1rem;

    box-shadow: 0 4px 6px rgba(0,0,0, 0.2);

    .tab-item {
      height: 100%;
      line-height: 1rem;
      padding: 0 0.5rem;
    }

    .curr {
      color: #639EF4;
      border-bottom: 4px solid #639EF4;
    }

  }


</style>





















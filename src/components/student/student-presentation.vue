/*
 * @page：学生接收器页面级组件
 * @author: chenzhou
 * @update: 2017.5.27
 * @desc 课堂ppt接收，课堂习题，课堂试卷，课堂红包和老师遥控器实时通信等
 *
 */

<template>
  <section class="page">
    <section class="page-fixed">
      <!-- header 返回 弹幕 投稿 标题 -->
      <header class="student__header">
        <p class="student__header--back"><i class="iconfont icon-back f25"></i></p>
        <h3 class="header-title f18">{{ title }}</h3>
        <div class="student__header--more">
          <i class="iconfont icon-add f25"></i>
          <div class="none"></div>
        </div>
      </header>

      <!-- tab  -->
      <ul class="student__tabs f15" @click="handleShowTab">
        <li :class="['tab-item', currTabIndex == 1 ? 'curr' : '']" data-index="1">全部</li>
        <li :class="['tab-item', currTabIndex == 2 ? 'curr' : '']" data-index="2">PPT</li>
        <li :class="['tab-item', currTabIndex == 3 ? 'curr' : '']"data-index="3">习题</li>
        <li :class="['tab-item', currTabIndex == 4 ? 'curr' : '']"data-index="4">试卷</li>
        <li :class="['tab-item', currTabIndex == 5 ? 'curr' : '']" data-index="5">红包</li>
      </ul>
    </section>


    <!-- 接收器 时间轴 -->
    <section class="student__timeline-wrapper">
      <loadmore :top-method="refeshLoad" @translate-change="translateChange" :top-status.sync="topStatus" ref="loadmore">

        <section class="student__timeline">
          <!-- 时间轴内容列表 -->
          <div class="timeline-wrapper" v-for="item in cards">
            <Card-Item-Component :item="item" v-if="currTabIndex===item.type||currTabIndex===1"></Card-Item-Component>
          </div>
        </section>

        <!--  <div slot="top" class="mint-loadmore-top">
          <span v-show="topStatus !== 'loading'" :class="{ 'rotate': topStatus === 'drop' }">↓</span>
          <span v-show="topStatus === 'loading'">Loading...</span>
        </div> -->

      </loadmore>
    </section>


    <!-- 接收器 新消息提醒 -->
    <section class="student__msg">
      <!-- <p class="">您有新的课堂动态</p> -->
    </section>

  </section>
</template>
<script>
  // import moment from 'moment'
  // import Promise from 'bluebird'
  import request from '@/util/request'
  import API from '@/util/Api'
  // import _ from 'underscore'
  import CardItemComponent from '@/components/common/card-item.vue'
  import wsmixin from '@/components/student/student-socket'
  import actionsmixin from '@/components/student/actions-mixin'

  export default {
    name: 'student-page',
    props: {
    },
    data() {
      return {
        isResetSocket: false,
        socket: null,
        topStatus: '',
        //
        title: '',
        // 课程ID
        lessonID: 0,
        // pptID
        presentationID: 0,

        // 权限相关
        userID: 0,
        avatar: '',
        userAuth: 0,

        // 当前tab下标
        currTabIndex: 1,

        // 是否观看模式
        observerMode: false,
        presentationList: null,
        presentationMap: new Map(),
        quizList: null,
        quizMap: new Map(),
        // timeline列表
        cards: [],
        // 记录全部的事件
        allEvents: [],
        // 时间轴数据
        timeline: {},
        commitDiffURL: '/lesson/lesson_submit_difficulties'
      };
    },
    components: {
      CardItemComponent
    },
    computed: {
    },
    watch: {
      pptHeight: function (Height) {
      }
    },
    filters: {
    },
    mixins: [ wsmixin, actionsmixin ],
    methods: {
      /*
      * @method 接收器初始化
      */
      init(){
        let self = this;

        this.lessonID = this.$route.params.lessonID;

        this.iniTimeline(this.lessonID);
      },
      /*
      * @method 等事件
      */
      initEvent() {

      },
      /*
      * @method 直播悬停反面等事件
      */
      iniTimeline() {
        let self = this;
        // this.getPresentationList();

        Promise.all([this.getPresentationList()]).then(()=>{
          self.testTimeline();
        });
      },

     /*
      * @method 测试环境初始化timeline
      */
      testTimeline() {
        this.addMessage({ type: 1, message:"开课啦" });

        this.addPPT({ type: 2, pageIndex:1, time: Date.now(), presentationid: this.presentationID });
        this.addPPT({ type: 2, pageIndex:2, time: "2017-01-15 12:00:00", presentationid: this.presentationID });
        this.addPPT({ type: 2, pageIndex:3, time: "2016-01-15 12:00:00", presentationid: this.presentationID });
        this.addPPT({ type: 2, pageIndex:3, time: "2016-01-15 12:00:00", presentationid: this.presentationID });

        this.addPaper({ type: 4, title:"xxx", total: 10, quiz: 1, time: "2017-05-15 12:00:00" });
        this.addPaper({ type: 4, title:"试卷测试数据", total: 12, quiz: 12, time: "2017-05-18 12:00:00" });

        this.addProblem({ type: 3, pageIndex: 4, time:"2016-01-15 12:00:00", presentationid: this.presentationID });
        this.addProblem({ type: 3, pageIndex: 5, time:"2016-01-15 12:00:00", presentationid: this.presentationID });

        this.addHongbao({ type: 5, probid: 5, time: "2017-01-15 12:00:00", count: 5 });
      },

      /*
      * @method 读取直播的课程列表和auth信息
      * @param  init: 是否初始化socket
      */
      getPresentationList() {
        let self = this;
        let URL = API.student.GET_PRESENTATION_LIST;
        let alessonids = [];
        let unLivePool = [];
        let param = {
          "lessonID": this.lessonID
        }

        // if (process.env.NODE_ENV === 'production') {
        // }

        // lessons
        return request.get(URL, param)
          .then(function (data) {
            if(data) {
              self.presentationList = data.presentationList;
              self.quizList = data.quizList;

              // set presentation map
              if(self.presentationList.length) {
                self.presentationID = self.presentationList[0].presentationID;

                for(let i = 0; i < self.presentationList.length; i++) {
                  let presentation = self.presentationList[i];
                  let pptData = presentation['Slides'];

                  if(pptData.length) {
                    pptData.forEach( (slide, index) => {
                      // 收藏 不懂
                      if( slide['Tag'] && slide['Tag'].length ) {
                        slide['Tag'].forEach((tag)=>{
                          tag === 1 && (slide['question'] = 1);
                          tag === 2 && (slide['store'] = 1);
                        })
                      }

                      // 问题结果
                      if (slide['Problem'] && slide['Result']) {
                        slide['Problem']['Result'] = slide['Result'];
                      }
                    });

                    presentation['Slides'] = pptData;
                  }

                  self.presentationMap.set(presentation.presentationID, presentation);
                }
              }

              // set quiz map
              if(self.quizList.length) {
                self.quizList.forEach( function(quiz, index) {
                  self.quizMap.set(quiz.quizID, quiz);
                });
              }

              // set title
              let presentation = self.presentationMap.get(self.presentationID);
              self.title = document.title = presentation.Title;

              return data;
            }
          });
      },
      /*
      * @method 下拉刷新回调
      * @param
      */
      refeshLoad(id) {
        setTimeout(()=>{
          this.$refs.loadmore.onTopLoaded();
          this.addPPT({ type: 2, pageIndex: 6, time: "2016-01-15 12:00:00", presentationid: this.presentationID });
        }, 1500)
      },
      /*
      * @method 下拉刷新touchend 回调
      * @param
      */
      translateChange(translate) {
        if(this.$refs.loadmore.topStatus === 'loading') {
          this.$refs.loadmore.translate = 100;
        }
      },
      /*
      * @method 展示tab选项
      * @param
      */
      handleShowTab() {
        let target = event.target;
        let tabIndex = +target.dataset['index'];

        if(tabIndex) {
          this.currTabIndex = tabIndex;
        }

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

  /*------------------*\
    $ 组件样式重写
  \*------------------*/

  .mint-loadmore-spinner {
    width: 0.533333rem !important;
    height: 0.533333rem !important;
  }

  .mint-loadmore-top, .mint-loadmore-bottom {
    margin-top: -1.333333rem;
    text-align: center;
    height: 1.333333rem !important;
    line-height: 1.333333rem !important;
    font-size: 0.426667rem;
  }

  .page {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  .page-fixed {
    z-index: 2;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
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

      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
  }




  /*-------------------*\
    $ header
  \*-------------------*/


  .student__tabs {
    display: flex;
    align-items: center;
    justify-content: space-around;

    height: 1rem;
    background: #fff;
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



  /*-------------------*\
    $ 时间轴 列表
  \*-------------------*/


  .student__timeline-wrapper {
    position: absolute;
    top: 2.33rem;
    left: 0;
  }

  .student__timeline {
    display: flex;
    flex-direction: column-reverse;
    align-items: center;
    justify-content: center;

    width: 10rem;

    .timeline-wrapper {
      width: 100%;
    }
  }


</style>





















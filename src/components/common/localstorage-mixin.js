/*
 * 学生接收器 本地缓存模块
 * @author: chenzhou
 * @update: 2020.2.6
 * @desc 接口数据缓存，作答结果缓存交互缓存
 * { base: {}, dt: 1580980595192 }
 *
 *
 */

import { isSupported } from '@/util/util'


let localstorageMixin = {
  methods: {
    /*
    * @method 保存数据
    * @params
    */
    setLocalData(name, value) {
      let id = this.lessonID;
      let key = 'yktstudent'+id;

      if(isSupported(localStorage)) {
        try {
          let data = JSON.parse(localStorage.getItem(key)) || {};

          data[name] = value;
          // 记录更新时间
          data['dt'] = (new Date()).getTime();

          let temp = JSON.stringify(data);
          localStorage.setItem(key, temp);
        } catch(e) {
          console.dir(e);
        }
      }
    },

    /*
     * @method 读取本都存储数据
     * @params
     */
    getLocalData(name) {
      let id = this.lessonID;
      let key = 'yktstudent'+id;
      let value = null;

      if(isSupported(window.localStorage)) {
        let info = JSON.parse(localStorage.getItem(key)) || null;

        if(info && name && info[name]) {
          value = info[name];
        } else {
          value = info;
        }
      }

      return value;
    },

    /*
     * @method 删除本地缓存
     * @params
     */
    delLocalData() {
      let id = this.lessonID;
      let key = 'yktstudent'+id;

      if(isSupported(window.localStorage)) {
        localStorage.removeItem(key)
      }
    },

    /*
     * @method 使用缓存数据恢复接收器
     * @params force: 强制只用缓存
     */
    initByLocalData(force) {
      // 本地缓存是都存在
      let info = this.getLocalData();

      if(info && info['base']) {
        let base = info['base'];
        const timeLimit = 5;
        const dt = info['dt'] || 0;
        const now = (new Date()).getTime();
        const timeInterval = (now - dt)/1000/60;

        if(timeInterval < timeLimit || force) {
          this.initLesson(base);

          return base;
        }
      }

      // 没有缓存和超时周期的继续请求接口
      return false;
    },

    /*
     * @method 初始化上课状态
     * @params
     */
    initLesson(data) {
      let self = this;
      this.pro_perm_info = data.pro_perm_info
      // auth
      this.userID = data.userID;
      this.avatar = data.avatar;
      this.userAuth = data.userAuth;

      this.presentationList = data.presentationList;
      this.quizList = data.quizList;
      this.presentationID = data.activePresentationID;
      this.groupList = data.groupList;
      this.groupReviewList = data.groupReviewList;
      this.liveInfo = data.liveList || null;
      // 白板不懂收藏
      this.boardList = data.share_board_track || null;

      // classroom
      this.classroom = data.classroom;
      // 是否web版开课
      this.isWebLesson = data.is_web || false;

      // set presentation map
      if(this.presentationList.length) {
        this.presentationList.forEach((presentation)=>{
          // todo: 课件tag和作答结果如何恢复
          self.formatSlides(presentation);
        })
      }

      // set quiz map
      if(this.quizList && this.quizList.length) {
        this.quizList.forEach( (quiz, index) => {
          this.quizMap.set(quiz.quizID, quiz);
        });
      }

      // set groupMap
      if(this.groupList && this.groupList.length) {
        this.groupList.forEach( (group, index) => {
          this.groupMap.set(group.group_id, group);
        });
      }

      // set groupReviewMap
      if(this.groupReviewList && this.groupReviewList.length) {
        this.groupReviewList.forEach( (review) => {
          this.groupReviewMap.set(review.group_review_id, review);
        });
      }

      // set boardMap
      if(this.boardList && this.boardList.length) {
        this.boardList.forEach( (board) => {
          this.boardMap.set(board.board_id, board);
        });
      }

      // set title
      let presentationData = null;

      if(this.presentationID) {
        presentationData = this.presentationMap.get(this.presentationID);
        presentationData && presentationData.Title && (this.title = presentationData.Title);
      }

      // 直播处理 1为直播中，2为已结束
      if(this.liveInfo && this.liveInfo.status === 1) {
        this.liveurl = this.liveInfo.live_url;
        this.liveURL = this.liveInfo.live_url.hls;

        this.liveType = this.liveInfo.type || 1;
        if(this.liveType === 1) {
          this.Hls && this.supportHLS(this.Hls);
        } else if(this.liveType === 2) {
          setTimeout(()=>{
            this.supportFLV();
          }, 3000)
        }

        // 日志上报
        setTimeout(() => {
          this.handleLogEvent();
        }, 1000)
      }

      // 课程title
      document.title = this.courseName = data.classroom && data.classroom.courseName;

      // 初始化websocket
      setTimeout(() => {
        this.initws();
      }, 20)
    },

    /*
     * @method 格式化ppt数据
     * @param
     */
    formatSlides(presentation) {
      if(presentation) {
        let slides = presentation['Slides'];

        // 增加本地缓存更新
        let info = this.getLocalData();
        let cards = info && info['cards'];
        let problemMap = info && info['problemMap'];

        if(slides.length) {
          slides.forEach( (slide, index) => {
            // timeline卡片中缓存的数据
            let card = cards && cards.find((item)=>{
              return item.sid === slide.lessonSlideID;
            })

            // 收藏 不懂
            if( slide['tag'] && slide['tag'].length ) {
              slide['tag'].forEach((tag)=>{
                tag === 1 && (slide['question'] = 1);
                tag === 2 && (slide['store'] = 1);
              })
            }

            // 缓存中在处理一下
            if(card) {
              slide['question'] = card['hasQuestion'] ? 1 : 0;
              slide['store'] = card['hasStore'] ? 1 : 0;
            }

            // 问题结果
            if (slide['Problem']) {
              let pid = slide['Problem']['ProblemID'];
              let problem = problemMap && problemMap[pid];

              if(problem && problem['Result']) {
                slide['Problem']['Result'] = problem['Result'];
              } else if(slide['Result']) {
                slide['Problem']['Result'] = slide['Result'];
              }
            }
          });

          presentation['Slides'] = slides;
        }

        this.presentationMap.set(presentation.presentationID, presentation);
      }
    },

    /*
     * @method 保存课件状态和作答结果
     * @param
     */
    saveSlideTag() {
      // 保存下课件信息和试题状态
      this.setLocalData('cards', this.cards);
      // Map格式转换成
      if(this.problemMap.size) {
        let problems = {};
        this.problemMap.forEach((problem, id)=>{
          problems[id] = problem;
        })

        this.setLocalData('problemMap', problems);
      }
    },

  },

}


export default localstorageMixin;

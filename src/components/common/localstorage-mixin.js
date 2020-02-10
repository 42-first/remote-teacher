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
          if(name === 'base') {
            data['dt'] = (new Date()).getTime();
          }

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
    initByLocalData() {
      // 本地缓存是都存在
      let info = this.getLocalData();

      if(info && info['cards']) {
        this.cards = info['cards'];
      }

      if(info && info['base']) {
        let base = info['base'];
        const timeLimit = 5;
        const dt = info['dt'] || 0;
        const now = (new Date()).getTime();
        const timeInterval = (now - dt)/1000/60;

        if(timeInterval < timeLimit) {
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
      // auth
      this.userID = data.userID;
      this.avatar = data.avatar;
      this.userAuth = data.userAuth;

      this.presentationList = data.presentationList;
      this.presentationID = data.activePresentationID;

      // classroom
      this.classroom = data.classroom;
      // 是否web版开课
      this.isWebLesson = data.is_web || false;

      // 课程title
      document.title = this.courseName = data.classroom && data.classroom.courseName;

      // 读取课程状态数据
      this.getLessonStatus(this.lessonID);
    },

    /*
     * @method 获取课程状态数据
     * @param
     */
    getLessonStatus(id) {
      let self = this;
      let URL = API.student.GET_LESSON_STATUS;
      let param = {
        'lesson_id': this.lessonID
      };

      request.get(URL, param)
      .then((res) => {
        if(res && res.data) {
          let data = res.data;

          this.tags = data.slides;
          this.problemList = data.problemList;
          this.quizList = data.quizList;
          this.groupList = data.groupList;
          this.groupReviewList = data.groupReviewList;
          this.liveInfo = data.liveList || null;
          // 白板不懂收藏
          this.boardList = data.share_board_track || null;

          // set presentation map
          if(self.presentationList.length) {
            for(let i = 0; i < self.presentationList.length; i++) {
              let presentation = self.presentationList[i];

              self.formatSlides(presentation, presentation.presentationID);
            }
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

          // 直播处理 1为直播中，2为已结束
          if(this.liveInfo && this.liveInfo.status === 1) {
            this.liveurl = this.liveInfo.live_url;
            this.liveURL = this.liveInfo.live_url.hls;

            this.liveType = this.liveInfo.type || 1;
            if(this.liveType === 1) {
              let isWeb = this.isWeb;
              if(isWeb) {
                setTimeout(()=>{
                  this.supportFLV();
                }, 3000)
              } else {
                this.Hls && this.supportHLS(this.Hls);
              }
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

          // set title
          let presentationData = null;
          if(this.presentationID) {
            presentationData = this.presentationMap.get(this.presentationID);
            presentationData && presentationData.Title && (this.title = presentationData.Title);
          }

          // 初始化websocket
          setTimeout(() => {
            this.initws();
          }, 1000)
        }
      })
      .catch(error => {
        console.log(error);
      });
    },

    /*
     * @method 格式化ppt数据
     * @param
     */
    formatSlides(presentation, id) {
      if(presentation) {
        let slides = presentation['Slides'];
        let problemList = this.problemList;
        let tags = this.tags;

        if(slides.length) {
          slides.forEach( (slide, index) => {
            let slideTag = tags && tags.find((item)=>{
              return item.lessonSlideID === slide.lessonSlideID;
            })

            // 收藏 不懂
            if(slideTag && slideTag['tag'] && slideTag['tag'].length) {
              slideTag['tag'].forEach((tag)=>{
                tag === 1 && (slide['question'] = 1);
                tag === 2 && (slide['store'] = 1);
              })
            }

            // 问题结果
            if (slide['Problem']) {
              let pid = slide['Problem']['ProblemID'];
              let problem = problemList && problemList.find((item)=>{
                return item.ProblemID === pid;
              })

              if(problem && problem['result']) {
                slide['Problem']['Result'] = problem['result'];
              }
            }
          });

          presentation['Slides'] = slides;
        }

        this.presentationMap.set(id || presentation.presentationID, presentation);
      }
    },

    /*
     * @method 保存课件状态和作答结果
     * @param
     */
    saveSlideTag() {
      // 保存下课件信息和试题状态
      this.setLocalData('cards', this.cards);
    },

    /*
     * @method 更新课件到本地缓存
     * @param
     */
    updateSlides(id, presentation) {
      let base = this.getLocalData('base');
      if(base && base.presentationList) {
        let list = base.presentationList;
        let index = list.findIndex((item)=>{
          return id === item.presentationID;
        })

        if(~index) {
          // list.splice(index, 1, presentation);
          list[index] = presentation;
        } else {
          list.push(presentation)
        }

        base.presentationList = list;
        this.setLocalData('base', base);
      }
    }
  }

}


export default localstorageMixin;

/** 
 * 学生接收器 升级接口新流程
 * @author: chenzhou
 * @update: 2020.8.20
 * @desc 主要是之前lesso_info_v2接口拆分成签到 课程基本 班级基本信息
 *       课件读取，不懂收藏读取，数据格式化等
 */


let lessonMixin = {
  methods: {
    /*
     * @method 进入课堂初始化流程
     * @param id: 课程ID
     */
    async initLesson(id, source) {
      // 先使用本地缓存显示
      this.initByLocalData();

      // 先签到
      source = source || this.source;
      // let joined = await this.checkin(source);
      let { code, data, msg } = await this.checkin(source) || {};
      // 签到发现没有权限处理
      if(code !== 0) {
        // 50004 lesson end
        if(code === 50004) {
          location.href = `/m/v2/lesson/student/${this.lessonID}`;
        } else if(code === 50002 || code === 50027) {
          // 无权限
          this.$router.push({
            path: `/v3/${this.lessonID}/join/`
          })
        } else if(code === 50019) {
          // 未绑定专业版
          this.bindSchool(data);
        } else {
          // 一直提示等用户处理
          let msgOptions = {
            confirmButtonText: this.$t('gotit') || '知道了'
          };
          let message = this.$t(`code.${code}`) || '';
          this.$messagebox.alert(message, msgOptions).then(action => {
            if(action === 'confirm') {
              history.back();
            }
          });
        }

        return this;
      }

      let user = await this.getUser();
      let lesson = await this.getLesson();
      // 是否下课
      if(lesson && lesson.endTime > 0) {
        return this;
      }

      if(lesson && lesson.teacher) {
        this.teacherName = lesson.teacher.name;
      }

      // 是否开启了动态二维码
      this.qrCodeState = lesson.qrCodeState

      // 导播课设置
      if(lesson && lesson.hasLiveCaster) {
        this.hasLiveCaster = lesson.hasLiveCaster;
        // mode 0录制 1导播模式
        this.liveCasterMode = lesson.liveCasterMode;
      }

      // 是否开启了讲伴
      this.lessonCompanionState = lesson.lessonCompanionState
      // 是否展示课堂讲稿
      this.showRealTimeLectureNote = lesson.showRealTimeLectureNote

      // 班级信息
      let classroom = lesson && await this.getClassroom(lesson.classroomId);
      // 获取班级所在课程是否在白名单内  在的话新用户不展示信息弹窗
      let inWhiteList = await this.checkClassInWhiteList(classroom && classroom.courseId)

      // 初始化websocket
      setTimeout(() => {
        this.token && this.initws();
      }, 20)

      // 是否新用户
      if(user.edited === false && !inWhiteList) {
        this.showGuide = true;
      }
    },

    /**
     * @method 读取课上的所有课件
     * @param pid
     */
    async getAllPres(data) {
      let lessonTags = await this.getLessonTags();
      // 课件ID列表哪里去哪到
      let presRequestList = [];
      let presSet = new Set();

      let timeline = data.timeline;
      // 当前课件
      let pres = data.presentation;
      if(pres) {
        presSet.add(pres);
      }

      // 是否有直播
      let liveid = data.liveid;
      // liveid && this.getLive(liveid);
      if(liveid && !this.reJoin) {
        this.getLive(liveid);
        this.liveId = liveid;
      }

      // 是否有试卷
      let hasQuiz = false

      // 是否有分组
      let hasGroup = false
      let hasReview = false
      let hasInstructionTask = false

      if(timeline && timeline.length) {
        timeline.forEach(item => {
          if(item.pres && !presSet.has(item.pres)) {
            presSet.add(item.pres);
          }

          if(!this.presentationID) {
            this.presentationID = item.pres;
          }

          // 格式化白板
          if(item.type === 'board' && item.action === 'new') {
            this.formatBoard(item, lessonTags);
          }

          if(item.type === 'quiz') {
            hasQuiz = true
          }

          if(item.type === 'group') {
            hasGroup = true
          }

          if(item.type === 'review'){
            hasReview = true
          }

          if(item.type === 'instruction' || item.type === 'agent') {
            hasInstructionTask = true
          }
        })
      }

      // 有试卷
      hasQuiz && await this.getQuizStatus()

      // 有分组
      hasGroup && await this.getGroupStatus()
      // 有互评
      hasReview && await this.getReviewStatus()

      // 有指令任务
      hasInstructionTask && await this.getInstructionTasks()


      // 有课件
      if(presSet.size) {
        presSet.forEach((pres)=>{
          presRequestList.push(this.getPresentation(pres));
        })

        Promise.all(presRequestList).
        then(res => {
          console.log(res);
          res && res.forEach((presentation, index)=>{
            this.formatPresentation(presentation, lessonTags);

            if(index === 0 && presentation) {
              this.title = presentation.title;
            }
          })

          // 渲染timeline
          this.setCards([])
          this.setTimeline(timeline);

          // 防止请求中间数据遗漏
          WebSocket.OPEN === this.socket.readyState &&
          this.socket.send(JSON.stringify({
            'op': 'fetchtimeline',
            'lessonid': this.lessonID,
            'msgid': this.msgid++
          }));
        })
      } else {
        this.setCards([])
        this.setTimeline(timeline);
      }

      setTimeout(() => {
        this.loading = false;
      }, 300)
    },

    /**
     * @method 获取实时更新的数据
     * @param pid
     */
    async updatePresentation(pid) {
      // 防止1s多次请求
      // const canFetch = this.limitPresFetchTimes(pid);
      // if(canFetch === false) {
      //   return this;
      // }

      if(this.updatingPPT) {
        return this;
      } else {
        this.updatingPPT = true;
      }

      let pres = await this.getPresentation(pid);

      // set presentation map
      let oldPres = this.presentationMap.get(pid);
      this.formatUpdatePresentation(pres, oldPres);

      // 更新完成
      this.updatingPPT = false;

      // 更新ppt刷新timeline
      WebSocket.OPEN === this.socket.readyState &&
      this.socket.send(JSON.stringify({
        'op': 'fetchtimeline',
        'lessonid': this.lessonID,
        'msgid': this.msgid++,
      }));
    },

    /**
     * @method 限制更新pres请求次数
     * @param presId
     */
    limitPresFetchTimes(presId) {
      let canFetch = true;

      try {
        // 增加机制防止1s多次请求
        if (!this.presFetchTimerMap) {
          this.presFetchTimerMap = new Map();
        }

        const presFetchTimerMap = this.presFetchTimerMap;
        // 是否存在presId的记录
        if(presFetchTimerMap.has(presId)) {
          const currPresTimerInfo = presFetchTimerMap.get(presId);

          if(currPresTimerInfo) {
            const { timer, dt } = currPresTimerInfo;
            const now = Date.now();

            // 如果在1s内有请求，延时请求
            if(now - dt < 1000) {
              if(timer) {
                clearTimeout(timer);
              }

              const fetchTimer = setTimeout(() => {
                this.updatePresentation(presId);
              }, 1002);

              // update fetch pres timer
              presFetchTimerMap.set(presId, {
                timer: fetchTimer,
                dt: now
              });

              canFetch = false;
            }
          }
        }

        // 记录请求时间
        presFetchTimerMap.set(presId, {
          timer: null,
          dt: Date.now()
        });

        return canFetch;
      } catch(error) {
        console.log(error);

        return canFetch;
      }
    },

    /**
     * @method 用户基本信息
     * @param
     */
    getUser() {
      let URL = API.lesson.get_user;

      return request.get(URL).
      then( res => {
        if (res && res.code === 0 && res.data) {
          let data = res.data;
          this.userID = data.id;
          // 日活上报增加
          window.userId = data.id;

          return data;
        }
      }).catch(error => {
        console.log('getUser:', error);
      })
    },

    /**
     * @method 用户虚id
     * @param
     */
    async getUserIdentity() {
      let user = await this.getUser();
      let URL = API.lesson.get_user_identity;
      let params = {
        'lessonId': this.lessonID
      };

      return request.get(URL, params).
      then( res => {
        if (res && res.code === 0 && res.data) {
          return res.data;
        }
      }).catch(error => {
        return {
          "name": user.name,
          "schoolNumber": user.schoolNumber,
          "department": ''
        }
        console.log('get_user_identity:', error);
      })
    },

    /**
     * @method 课程基本信息
     * @param
     */
    getLesson() {
      let URL = API.lesson.get_lesson_base;

      return request.get(URL).
      then( res => {
        if (res && res.code === 0 && res.data) {
          let data = res.data;

          return data;
        }
      }).catch(error => {
        console.log('getLesson:', error);
      })
    },

    /**
     * @method 班级基本信息
     * @param
     */
    getClassroom(rid) {
      let URL = API.lesson.get_classroom;
      let params = {
        'classroom_id': rid
      };

      return request.get(URL, params).
      then( res => {
        if (res && res.code === 0 && res.data) {
          let data = res.data;
          data.classroomId = rid;
          console.log(data);

          // 课程title
          document.title = data.courseName;
          this.classroom = data;

          if(data.pro) {
            this.getWaterMarkInfo()
          }

          return data
        }
      }).catch(error => {
        console.log('getClassroom:', error);
        return {}
      })
    },

    /**
     * @method 签到
     * @param source: 场景值
     */
    checkin(source = 1, code) {
      let URL = API.lesson.checkin;
      let params = {
        'source': +source
      };

      if(code) {
        params['inviteCode'] = code;
      } else {
        params['lessonId'] = this.lessonID;
      }

      return request.post(URL, params).
      then((res)=>{
        if(res && res.code === 0) {
          let data = res.data;
          this.token = data.lessonToken;

          if(data.role) {
            this.role = data.role;
          }

          // 设置当前userid 专业版是虚ID 基础本是实ID
          if(data.identityId) {
            this.identityId = data.identityId;
            this.identityInfo = {
              name: data.identityName,
              schoolNumber: data.identityNumber
            }
          }

          // 是否导播嘉宾
          if(data.isGuest) {
            this.isGuest = data.isGuest;
          }
        }

        // return res.code;
        return res;
      }).
      catch(error => {
        console.log('checkin:', error);
        return { code: -1 };
      })
    },

    /**
     * @method 读取课堂课件
     * @param pid
     */
    getPresentation(pid) {
      let URL = API.lesson.get_presentation;
      let params = {
        'presentation_id': pid
      };

      return request.get(URL, params).
      then((res)=>{
        if(res && res.code === 0) {
          let data = res.data;
          data.id = pid;

          // TODO：测试
          // this.presentationMap.set(pid, data);

          return data;
        }
      }).
      catch(error => {
        console.log('getPresentation:', error);
        return null;
      })
    },

    /**
     * @method 课上不懂列表
     * @param pid
     */
    getLessonTags() {
      let URL = API.lesson.get_lesson_tag;

      if(this.observerMode) {
        return {};
      }

      return request.get(URL).
      then((res)=>{
        if(res && res.code === 0) {
          let data = res.data;

          return data;
        }
      }).
      catch(error => {
        console.log('getLessonTags:', error);
        return null;
      })
    },

    /**
     * @method 直播信息
     * @param
     */
    getLive(id) {
      let URL = API.lesson.get_live_info;
      let params = {
        'live_id': id
      };

      request.get(URL, params).
      then( res => {
        if (res && res.code === 0 && res.data) {
          let data = res.data;

          this.liveurl = data;
          this.liveURL = data.hls;

          this.liveType = data.type || 1;
          // 有清晰度切换 默认使用最高清晰度低一个清晰度
          if(data.adaptiveFlv.length > 1) {
            let len = data.adaptiveFlv.length > 2 ? data.adaptiveFlv.length : 2
            this.liveurl = {
              hls: data.adaptiveHls[len - 2].url,
              flv: data.adaptiveFlv[len - 2].url
            }

            this.hasDefinition = true
            this.definitionData = {
              hls: data.adaptiveHls,
              flv: data.adaptiveFlv,
              level: data.adaptiveHls.map(item => item.quality)
            }
            this.curLevel = len - 2
            this.liveURL = this.liveurl.hls
          }

          if(this.liveType === 1) {
            let isWeb = this.isWeb;
            if(isWeb) {
              setTimeout(()=>{
                this.supportFLV();
              }, 1000)
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
            this.handleLogEvent(this.hasMeeting ? 'kwai_rtmp' : '');
          }, 30000)
        }
      }).catch(error => {
        console.log('getLive:', error);
      })
    },

    /**
     * @method 获取会议基本信息 token channel
     * @param
     */
    getMeeting() {
      let URL = API.lesson.get_meeting_config;

      request.get(URL).
      then( res => {
        if (res && res.code === 0 && res.data) {
          let data = res.data;

          // 腾讯 SDK
          if(data && data.provider === 2) {
            this.meeting = data;
          }
        }
      }).catch(error => {
        return {};
      })
    },

    /**
     * @method 格式化ppt数据
     * @param
     */
    formatPresentation(presentation, lessonTags) {
      if(presentation) {
        let id = presentation.id;
        let slides = presentation['slides'];

        if(slides.length && lessonTags) {
          slides.forEach( (slide) => {
            // 不懂
            if(lessonTags.doubtSlideList) {
              let hasQuestion = lessonTags.doubtSlideList.find((item)=>{
                return item === slide.id;
              })

              if(hasQuestion) {
                slide['question'] = 1;
              }
            }

            // 收藏
            if(lessonTags.collectSlideList) {
              let hasStore = lessonTags.collectSlideList.find((item)=>{
                return item === slide.id;
              })

              if(hasStore) {
                slide['store'] = 1;
              }
            }

            // todo: 问题的作答结果
          });

          presentation['slides'] = slides;
        }

        this.presentationMap.set(id, presentation);
      }
    },

    /**
     * @method 格式化ppt更新数据
     * @param
     */
    formatUpdatePresentation(presentation, oldPresentation) {
      if(presentation) {
        let id = presentation.id;
        let slidesResult = [];
        let slides = presentation['slides'];
        let oldSildes = oldPresentation && oldPresentation['slides'];

        if(slides.length) {
          slidesResult = slides.map( (slide, index) => {
            // 是否存在旧的数据
            if(oldSildes) {
              let oldSlide = this.getSlideData(oldSildes, index + 1, slide.id);
              oldSlide && (slide = Object.assign({}, oldSlide, slide));
            }

            return slide;
          });

          // 有可能存在更新的情况
          presentation['slides'] = slidesResult;
        }

        this.presentationMap.set(id, presentation);
      }
    },

    /**
     * @method 格式化白板数据
     * @param
     */
    formatBoard(board, lessonTags) {
      if(board) {
        let { boardid, devheight, devwidth } = board;
        let doubt = false;
        let emphasis = false;

        // 是否存在不懂
        if(lessonTags && lessonTags.doubtFileSharingList) {
          doubt = lessonTags.doubtFileSharingList.find((item)=>{
            return item == boardid;
          });
        }

        if(lessonTags && lessonTags.collectFileSharingList) {
          emphasis = lessonTags.collectFileSharingList.find((item)=>{
            return item == boardid;
          });
        }

        board.doubt = !!doubt;
        board.emphasis = !!emphasis;

        this.boardMap.set(boardid, board);
      }
    },

    /**
     * @method 获取已交卷的试卷id
     */
    getQuizStatus(){
      let URL = API.lesson.get_quiz_status

      return request.get(URL)
      .then(res => {
        if(res && res.code === 0 && res.data){
          res.data.answered.forEach(item => {
            let quizObJ = {
              answered:true
            }
            this.quizMap.set(+item, quizObJ);
          })
          return res.data
        }
      })
    },

    /**
     * @method 获取分组状态
    */
    getGroupStatus(){
      let URL = API.lesson.get_group_info
      let params = {
        lesson_id: this.lessonID
      }

      return request.get(URL, params)
      .then(res => {
        console.log(res)
        if(res && res.success){
          res.data.groupList.length && res.data.groupList.forEach(group => {
            this.groupMap.set(group.group_id, group);
          })
          return res.data
        }
      })
    },

    /**
     *
     * @method 获取课上互评状态
    */
    getReviewStatus(){
      let self = this
      let URL = API.lesson.get_review_status_list
      return request.get(URL)
      .then(res => {
        if(res && res.code === 0 && res.data){
          res.data.length && res.data.forEach(review => {
            this.groupReviewMap.set(review.reviewId, review);
          })
          return res.data
        }
      }).catch(error => {
        console.log('getReviewStatus:', error)
        return {}
      })
    },

    /**
     * @method 专业版班级绑定引导
     */
    bindSchool(data) {
      const { university_id, university_name: name, university_authen_url } = data || {};
      const errorTips = this.$t('lesson.isprotips', { name }) || `您未作身份绑定，该班级只允许${name}人员进入，请绑定后重新加入班级。`
      const bindURL = university_authen_url ? `/v/index/bindSchool_cas/${university_id}` : `/v/index/bindSchool/${university_id}`;

      // 国际化confirm
      const msgOptions = {
        confirmButtonText: '点击绑定',
        cancelButtonText: '已完成绑定'
      };

      this.$messagebox.confirm(errorTips, msgOptions)
      .then(action => {
        if(action === 'confirm') {
          location.href = bindURL;
        } else {
          this.init();
        }
      });
    },

    /**
     * @method 获取水印信息
     */
    getWaterMarkInfo() {
      let URL = API.lesson.get_watermark
      return request.get(URL)
        .then(res => {
          if(res && res.code == 0) {
            this.watermarkInfo = res.data
          }
        })
    },

    /**
     * @method 切换清晰度
     * @param {*} index 
     */
    handleChangeDefinition(index) {
      let liveEl = document.getElementById('player');
      if(this.curLevel == index) return
      let lastLevel = this.definitionData.level[this.curLevel]
      this.curLevel = index
      this.liveurl = {
        hls: this.definitionData.hls[index].url,
        flv: this.definitionData.flv[index].url
      }
      this.liveURL = this.liveurl.hls

      this.handleToggleDefinition()

      this.supportFLV()

      // 超清提示
      if(this.definitionData.level[index] == 'HIGH' && lastLevel == 'STANDARD') {
        this.definitionTips = this.$t('hightips') || '超清模式对设备性能要求较高，请注意！'

        setTimeout(() => {
          this.definitionTips = ''
        }, 5000)
      }

      setTimeout(() => {
        liveEl.play()
      }, 2000)
    },

    /**
     * @method 展示清晰度列表
     */
    handleToggleDefinition() {
      this.showDefinition = !this.showDefinition
    },

    /**
     * @method 获取已发布指令任务
     */
    getInstructionTasks() {
      let self = this
      let URL = API.lesson.get_ai_task_status_list
      let params = {
        status: 0
      }
      return request.get(URL, params)
      .then(res => {
        if(res && res.code === 0 && res.data){
          let { tasks } = res.data
          tasks.length && tasks.forEach(task => {
            this.instructionTaskMap.set(task.taskId, task);
          })
          return res.data
        }
      }).catch(error => {
        console.log('getInstructionTasks:', error)
        return {}
      })
    },

    /**
     * @method 检测班级是否在新用户白名单内
     */
    checkClassInWhiteList(cid) {
      let URL = API.lesson.check_course_white_list
      let params = {
        courseId: cid
      }

      return request.get(URL, params)
      .then(res => {
        if(res && res.code === 0 && res.data) {
          return res.data.skipPermission
        }
      }).catch(error => {
        console.log('checkClassInWhiteList:', error)
        return false
      })
    },

    /**
     * @method 展示课堂讲稿
     */
    handleOpenLectureNote(time) {
      this.visibleLectureNote = true
      this.lectureNoteTime = time

      document.querySelector('.student__timeline-wrapper').style.overflowY = 'hidden'
    },

    /**
     * @method 关闭课堂讲稿
     */
    handleClosedLectureNote() {
      this.visibleLectureNote = false
      document.querySelector('.student__timeline-wrapper').style.overflowY = 'auto'
    }
  }
}


export default lessonMixin;

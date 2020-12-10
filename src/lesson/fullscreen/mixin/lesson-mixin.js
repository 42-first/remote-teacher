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
            path = `/v3/${this.lesson.lessonID}/ppt/${index}`;

            break;

          // 截图
          case 10:
          case 11:
            // ppt
            path = `/v3/${this.lesson.lessonID}/ppt/${index}`;

            break;

          // 习题
          case 3:
            path = item.pageURL + item.index;

            break;

          // 试卷
          case 4:
            path = `/v3/${this.lesson.lessonID}/webview/${index}`;

            break;

          // 红包
          case 5:
            path = `/v3/${this.lesson.lessonID}/hongbao/${index}`;

            break;

          // 投稿分享
          case 6:
            path = `/v3/${this.lesson.lessonID}/submission_share/${index}`;

            break;

          // 主观题答案分享
          case 7:
            path = `/v3/${this.lesson.lessonID}/subjective_share/${index}`;

            break;

          // 发起了分组
          case 8:
            path = `/v3/${this.lesson.lessonID}/webview/${index}`;

            break;

          // 发起了互评
          case 9:
            path = `/v3/${this.lesson.lessonID}/evaluation/${index}`;

            break;

          // 白板
          case 12:
            path = `/v3/${this.lesson.lessonID}/board/${index}`;

            break;

          // 问题解析
          case 13:
            path = `/v3/${this.lesson.lessonID}/analysis/${index}`;

            break;

          default:
            break;
        }

        // this.$router.replace({ path });
        this.$router.push({ path });
      }
    },

    /*
     * @method 进入课堂初始化流程
     * @param id: 课程ID
     */
    async initLesson(id, source) {

      // 先签到
      source = source || this.source;
      let joined = await this.checkin(source);
      // TODO： 签到发现没有权限处理
      if(joined !== 0) {
        // 50004 lesson end
        if(joined === 50004) {
          location.href = '/v/index/lessonend';

          return this;
        }
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

      // 班级信息
      lesson && this.getClassroom(lesson.classroomId);

      // 初始化websocket
      setTimeout(() => {
        this.token && this.initws();
      }, 20)

      // 课程基本信息
      this.setLesson({
        lessonID: id
      })

      window.user = user;
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
      liveid && this.getLive(liveid);

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
        })
      }

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

          return data;
        }
      }).catch(error => {
        console.log('getUser:', error);
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

      request.get(URL, params).
      then( res => {
        if (res && res.code === 0 && res.data) {
          let data = res.data;
          data.classroomId = rid;
          console.log(data);

          // 课程title
          document.title = data.courseName;
          this.classroom = data;
        }
      }).catch(error => {
        console.log('getClassroom:', error);
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

          let role = data.role;
          if(role === 2 || role === 3) {
            this.setObserverMode(true);
          }
        }

        return res.code;
      }).
      catch(error => {
        console.log('checkin:', error);
        return -1;
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

          this.liveType = data.type || 1;
          this.liveurl = data;
          this.liveURL = data.flv;
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

          // 本地会议？
          if(data && data.provider === 3) {
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

  }
}


export default commandMixin;

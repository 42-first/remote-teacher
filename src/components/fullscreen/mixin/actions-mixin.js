/*
 * 学生接收器 各种类型处理
 * @author: chenzhou
 * @update: 2020.2.29
 * @desc 新增ppt，新增加红包，新增试卷，新增试题等
 *
 */


let actionsMixin = {
  methods: {
    /*
    * @method 创建更新timeline
    * @param timeline isFetch
    */
    setTimeline(timeline, isFetch) {
      if (timeline && timeline.length) {
        timeline.forEach( (item, index) => {
          switch(item['type']) {
            // ppt
            case 'slide':
              this.addPPT({ type: 2, sid: item['sid'], pageIndex: item['si'], time: item['dt'], presentationid: item['pres'], event: item, isFetch: isFetch, isTimeline: true });

              break;

            // 幻灯片换页通知
            case 'problem':
              this.addProblem({ type: 3, sid: item['sid'], pageIndex: item['si'], time: item['dt'], presentationid: item['pres'], limit: item.limit, event: item });

              break;

            // 试卷
            case 'quiz':
              this.addPaper({ type: 4, quiz: item['quiz'], title: item['title'], total: item['total'], time: item['dt']});

              break;

            // event
            case 'event':
              this.addMessage({ type: 1, message: item['title'], time: item['dt'], event: item, isFetch: isFetch });

              break;

            // 红包
            case 'redpacket':
            case 'updateredpacket':
              this.addHongbao({ type: 5, redpacketID: item.redpacket, count: item.count, length: item.detail.length, time: item.dt, event: item });

              break;

            // 投稿分享
            case 'post':
              this.addSubmission({ type: 6, postid: item['postid'], anon: item['anon'], time: item['dt'], event: item, isFetch: isFetch });

              break;

            // 分享协议合并 主观题分享20171204
            case 'share':
              if(item['cat'] === 'post') {
                this.addSubmission({ type: 6, postid: item['postid'], anon: item['anon'], time: item['dt'], event: item, isFetch: isFetch });
              } else if(item['cat'] === 'subjective') {
                this.addSubjective({ type: 7, spid: item.spid, anon: item['anon'], time: item['dt'], event: item, isFetch: isFetch });
              } else if(item['cat'] === 'capture') {
                this.addCapture({ type: 10, cat: item['cat'], url: item['url'], time: item['dt'], event: item, isFetch: isFetch });
              } else if(item['cat'] === 'board') {
                this.addBoard({ type: 11, board: item, time: item['dt'], event: item, isFetch: isFetch });
              }

              break;

            // 分组创建分组
            case 'group':
              this.launchGroup({ type: 8, teamid: item['teamid'], groupid: item['groupid'], cat: item['cat'], time: item['dt'], event: item, isFetch: isFetch });

              break;

            // 分组互评
            case 'review':
              this.launchReview({ type: 9, reviewid: item['reviewid'], prob: item['prob'], time: item['dt'], event: item, isFetch: isFetch });

              break;

            // 白板创建
            case 'board':
              if(item.action === 'new') {
                this.setBoardInfo( Object.assign(item, {type: 12, isFetch: isFetch}) );
              } else if(item.action === 'nav') {
                this.boardNav(Object.assign(item, { from: 'timeline', isFetch: isFetch }));
              } else if(item.action === 'clear') {
                this.clearBoard(Object.assign(item, { from: 'timeline', isFetch: isFetch }));
              } else if(item.action === 'autosave') {
                this.setBoardCover(Object.assign(item, { from: 'timeline', isFetch: isFetch }));
              }

              break;

            // 白板绘制
            case 'draw':
              this.setBoardline(Object.assign(item, { from: 'timeline', isFetch: isFetch }));

              break;

            // 问题解析
            case 'remark':
              this.addAnalysis({ type: 13, remark: item, time: item['dt'], event: item, isFetch: isFetch });

              break;

            default: break;
          }
        });

        // 定位到最新
        if(!isFetch) {
          let slideIndex = 0;

          setTimeout(()=>{
            this.cards.forEach( (item, index) => {
              if(item.type !== 1) {
                slideIndex = index;
              }
            });

            // 上一次和这次计算的结果一致不更新
            // slideIndex && this.setSlideIndex(slideIndex);
            if(slideIndex) {
              if(slideIndex !== this.slideIndex) {
                this.setSlideIndex(slideIndex);
              } else {
                let slide = this.cards[slideIndex];
                this.handleViewDetail(slide, slideIndex);

                let slideEl = this.$el.querySelector(`.J_slide[data-index="${slideIndex}"]`);
                slideEl && slideEl.scrollIntoView();
              }
            }
          }, 1000)
        }
      }
    },

    /*
    * @method 新增提醒消息
    * data: { type: 1, message: '', time: '', event: item, isFetch: false }
    */
    addMessage(data) {
      // 是否含有重复数据
      let hasEvent = this.cards.find((item) => {
        return item.type === 1 && item.oriMessage === data.message && data.isFetch;
      })

      // 保留原来的msg 方便对比
      data.oriMessage = data.message;

      // 消息统一国际化
      if(!hasEvent && data.event && data.event['code']) {
        let code = data.event && data.event['code'];
        let aReplace = data.event && data.event['replace'] || [];
        let sMsg = aReplace.length ? this.$i18n.t(code, aReplace) : this.$i18n.t(code);

        data.message = sMsg;

        // 标记这是一堂直播远程课 方便后面对直播远程课处理
        if(code === 'LIVE_ON') {
          !this.isLive && (this.isLive = true);
        }
      }

      if(!hasEvent) {
        this.cards.push(data);
        this.setCards(this.cards)
      }
    },

    /*
     * @method 取slideData 新版本1.1 指纹需求
     * param: slides, si, sid
     */
    getSlideData(slides, si, sid) {
      let slideData = slides && slides[si-1];

      // 1.1 版本统一使用sid替换pageIndex, 之前版本还是使用si
      if(+this.version >= 1.1 && typeof sid !== 'undefined' && sid > 0 && slides) {
        // ppt不一致 通过sid取slideData
        slideData = slides.find((slide)=>{
          return slide.lessonSlideID === sid;
        });
      }

      return slideData;
    },

    /*
     * @method 取slideData 新版本1.1 问题是否修改废弃
     * param: slides, problemID
     */
    filterProblem(slides, problemID) {
      let hasProblem = true;

      // 1.1 版本
      if(+this.version >= 1.1 && problemID) {
        // ppt不一致 通过sid取slideData
        hasProblem = slides.find((slide) => {
          return slide.Problem && slide.Problem.ProblemID === problemID;
        });
      }

      return hasProblem;
    },

    /*
    * @method 新增PPT
    * data: { type: 2, sid: 1234, pageIndex: 2, presentationid: 100, time: '', event }
    */
    addPPT(data) {
      let self = this;
      let presentation = this.presentationMap.get(data.presentationid);
      let pptData = presentation && presentation['Slides'];
      // let slideData = pptData && pptData[data.pageIndex-1];
      let slideData = this.getSlideData(pptData, data.pageIndex, data.sid);
      let index = this.cards.length;
      let cover = slideData && slideData['Cover'] || '';

      if (!slideData) {
        // fixed 息屏切换ppt问题
        !presentation && this.getUpdatePPTData(data.presentationid);
        return;
      }

      // 是否含有重复数据
      let hasPPT = this.cards.find((item)=>{
        return item.type === 2 && item.slideID === slideData.lessonSlideID && item.presentationid === data.presentationid;
      })

      // 如果是习题图片，则不添加 ppt图片加载
      if (!cover || slideData && slideData['Problem'] || hasPPT && data.isFetch ) {
        return;
      }

      if (slideData['Cover']=='rain://error/upload-error') {
        if(!data.isFetch) {
          this.addMessage({ type: 1, message: '幻灯片上传失败' });
        }
      } else if(slideData['Cover']=='rain://error/export-error'){
        if(!data.isFetch) {
          this.addMessage({ type: 1, message: '幻灯片解析失败' });
        }
      } else {
        // 预加载图片
        let oImg = new Image();
        oImg.onload = (evt) => {
          if(index !== -1) {
            // 暂时去掉 因为目前很多使用 splice 导致顺序短时间内错乱
            // let data = self.cards[index - 1];
            // data.src = slideData['Cover'];
          }
        };

        oImg.src = slideData['Cover'];

        let cardItem = {
          index,
          src: slideData['Cover'],
          rate: presentation.Width / presentation.Height,
          hasQuestion: slideData['question'] == 1 ? true : false,
          hasStore: slideData['store'] == 1 ? true : false,
          Width: presentation.Width,
          Height: presentation.Height,
          slideID: slideData['lessonSlideID'],
          isRepeat: hasPPT ? true : false
        };
        // 是否web开课的动画 Shapes里面有动画步骤
        let Shapes = slideData.Shapes;
        let isWebLesson = this.isWebLesson;

        // ppt 动画处理 animation 0: 没有动画 1：动画开始 2:动画结束 !data.isTimeline
        if(data.event && typeof data.event.total !== 'undefined' && data.event.total > 0) {
          if(isWebLesson) {
            let step = data.event.step;
            if(step <= Shapes.length) {
              let shape = Shapes[step];

              // 之前播放过的动画展示全部 最新两条数据不是当前PPT就认为之前播放过
              if(hasPPT) {
                let lastCards = this.cards.slice(-2);
                let oldppt = lastCards.find((item) => {
                  return item.type === 2 && item.slideID === cardItem.slideID;
                })

                if(oldppt) {
                  shape && Object.assign(oldppt, data, cardItem, { src: shape.url })
                } else {
                  Object.assign(data, cardItem);
                  this.cards.push(data);
                }
              } else {
                shape && Object.assign(data, cardItem, { src: shape.url })
                this.cards.push(data);
              }
            }
          } else {
            // step === 0 开始动画 正常插入
            if(data.event.step >= 0 && data.event.step < data.event.total) {
              // 之前没有播放过这个ppt
              if(!hasPPT) {
                // 直播默认动画不遮挡
                if(this.liveurl && this.visibleAnimation) {
                  data = Object.assign(data, cardItem, { animation: 0 })
                } else {
                  data = Object.assign(data, cardItem, { animation: 1 })
                }

                // data = Object.assign(data, cardItem, { animation: 1 })
              } else {
                // 之前播放了这一页 再次播放就不用蒙版了
                data = Object.assign(data, cardItem, { animation: 0 })
              }

              !data.isFetch && this.cards.push(data);
            } else if(data.event.step === -1 || data.event.step === data.event.total) {
              // step === -1 total > 1 动画结束 替换原来的数据 取到原来的ppt位置
              if(hasPPT) {
                // 需要替换的index
                let targetIndex = this.cards.findIndex((item, i) => {
                  return item.type === 2 && item.slideID === cardItem.slideID && item.animation === 2;
                })

                Object.assign(hasPPT, data, cardItem, { animation: 2, isRepeat: false })
                // targetIndex && this.cards.splice(targetIndex, 1, data);

                if(targetIndex > 0 && !data.isFetch) {
                  // 克隆版单独处理 上一个是重复ppt就不处理了
                  if(targetIndex < this.cards.length - 1) {
                    Object.assign(data, cardItem, { animation: 2, isRepeat: false })
                    this.cards.push(data);
                  }
                }
              } else {
                // 如果直接收到动画结束
                data = Object.assign(data, cardItem, { animation: 2 })
                !data.isFetch && this.cards.push(data);
              }
            }
          }
        } else {
          // 没有动画
          data = Object.assign(data, cardItem, { animation: 0 })
          this.cards.push(data);
        }

        this.setCards(this.cards)

        // 新PPT也提醒
        if(!data.isTimeline) {
          this.setMsg(data);
        }
      }
    },

    /*
    * @method 新增试卷
    * data: { type: 4, quiz: 'quizID', title: '最新考试', total: '10', time: '' }
    */
    addPaper(data) {
      let oQuiz = this.quizMap.get(data.quiz);
      // 是否含有重复数据
      let hasEvent = this.cards.find((item)=>{
        return item.type === 4 && item.quiz === data.quiz;
      })

      let index = this.cards.length;

      data = Object.assign(data, {
        index,
        papername: data.title,
        quizid: data.quiz,
        href: '/v/quiz/quiz_result/' + data.quiz,
        count: data.total,
        time: data.time,
        status: oQuiz && oQuiz.answered ? this.$i18n.t('done') || '已完成' : this.$i18n.t('undone') || '未完成',
        isComplete: oQuiz && oQuiz.answered || false
      })

      // 消息box弹框
      data.isPopup && this.setMsg(data);

      if(!hasEvent) {
        this.cards.push(data);
        this.setCards(this.cards)
      }
    },

    /*
    * @method 新增习题
    * { type: 3, sid: item['sid'], pageIndex: item['si'], time: item['dt'], presentationid: item['pres'], limit: item.limit, event: item }
    */
    addProblem(data) {
      let presentation = this.presentationMap.get(data.presentationid);
      let pptData = presentation && presentation['Slides'];
      // let slideData = pptData && pptData[data.pageIndex-1];
      let slideData = this.getSlideData(pptData, data.pageIndex, data.sid);
      let index = this.cards.length;

      // 过滤下 问题是否过期
      let hasProblem = this.filterProblem(pptData, data.event['prob']);

      if(!slideData || !hasProblem) {
        let targetIndex = this.cards.findIndex((item) => {
          return item.type === 3 && item.problemID === data.event['prob'];
        })

        // 问题被删除了
        targetIndex !== -1 && this.cards.splice(targetIndex, 1);

        // 删除消息
        if(targetIndex !== -1 && this.msgBoxs.length && this.msgBoxs[0].problemID === data.event['prob']) {
          this.msgBoxs = [];
        } else if(this.msgBoxs.length && this.msgBoxs[0].problemID) {
          // 矫正消息
          let msgProblem = this.msgBoxs[0];
          let msgIndex = this.cards.findIndex((item) => {
            return item.type === 3 && item.problemID === msgProblem.problemID;
          })

          this.msgBoxs = [ Object.assign(msgProblem, {
            index: msgIndex
          }) ];
        }

        return this;
      }

      // slideData['Problem'] && this.problemMap.set(slideData['Problem']['ProblemID'], slideData);
      // 问题类型
      let problemType = slideData['Problem']['Type'];
      let pageURL = `/${this.lessonID}/`;

      if(problemType) {
        switch (problemType) {
          // 主观题
          case 'ShortAnswer':
            // pageURL += `subjective/${index}`;
            pageURL += 'subjective/';
            break;
          // 填空题
          case 'FillBlank':
            // pageURL += `blank/${index}`;
            pageURL += 'blank/';
            break;
          // 多选单选投票
          default:
            // pageURL += `exercise/${index}`;
            pageURL += 'exercise/';
            break;
        }
      }

      data = Object.assign(data, {
        pageIndex: data.pageIndex,
        presentationid: data.presentationid,
        time: data.time,
        problemType: problemType,
        caption: problemType === 'Polling' || problemType === 'AnonymousPolling' ? this.$i18n.t('newvote') || 'Hi,你有新的投票' : this.$i18n.t('newprob') || 'Hi,你有新的课堂习题',
        status: slideData['Problem']['Result'] ? this.$i18n.t('done') || '已完成' : this.$i18n.t('undone') || '未完成',
        isComplete: slideData['Problem']['Result'] ? true : false,
        problemID: slideData['Problem']['ProblemID'],
        options: slideData['Problem']['Bullets'],
        cover: slideData['Cover'],
        src: slideData['Cover'],
        index,
        pageURL,
        groupid: data.event['groupid']
      })

      // 消息box弹框
      data.isPopup && this.setMsg(data);

      // 预加载习题图片
      let oImg = new Image();
      oImg.src = slideData && slideData['Cover'];

      // 是否含有重复数据
      let hasEvent = this.cards.find((item)=>{
        return item.type === 3 && item.problemID === data.event['prob'];
      })

      // fixed cover为空
      if(hasEvent && !hasEvent.cover) {
        hasEvent.cover = slideData && slideData['Cover'];
      }

      if(!hasEvent) {
        this.cards.push(data);
        slideData['Problem'] && this.problemMap.set(slideData['Problem']['ProblemID'], slideData);
        this.setCards(this.cards)
      }
    },

    /**
     * @method 分享答案解析
     * { type: 13, remark, event: item }
     */
    addAnalysis(data) {
      // 找到对应问题
      let remark = data.remark;
      let slideData = this.problemMap.get(remark.prob);
      let index = this.cards.length;

      if(slideData) {
        // 组织解析数据
        let pageURL = `/${this.lessonID}/analysis/`;
        Object.assign(data, {
          pageIndex: slideData.Index,
          problemID: slideData['Problem']['ProblemID'],
          pageURL,
          caption: this.$i18n.t('answerpublished') || '老师公布了习题的答案解析',
          index
        })

        // 是否含有重复数据
        let hasEvent = this.cards.find((item) => {
          return item.type === 13 && item.problemID === data.problemID && data.isFetch;
        })

        if(!hasEvent) {
          this.cards.push(data);
          this.setCards(this.cards)

          // 消息box弹框
          data.isPopup && this.setMsg(data);
        }
      }

    },

    /*
     * @method 新增分享投稿20170823
     * { type: 6, postid: 123, isFetch: false }
     */
    addSubmission(data) {
      let index = this.cards.length;
      // 是否含有重复数据
      let hasEvent = this.cards.find((item) => {
        return item.type === 6 && item.postid === data.postid && data.isFetch;
      })

      data = Object.assign(data, {
        status: '未读',
        isComplete: false,
        index
      })

      if(!hasEvent) {
        this.cards.push(data);
        this.setCards(this.cards)

        // 消息box弹框
        data.isPopup && this.setMsg(data);
      }
    },

    /*
     * @method 新增分享主观题20171204
     * { type: 7, spid: 123 , isFetch: false }
     */
    addSubjective(data) {
      let index = this.cards.length;
      // 是否含有重复数据
      let hasEvent = this.cards.find((item) => {
        return item.type === 7 && item.spid === data.spid && data.isFetch;
      })

      data = Object.assign(data, {
        status: '未读',
        isComplete: false,
        index
      })

      if(!hasEvent) {
        this.cards.push(data);
        this.setCards(this.cards)

        // 消息box弹框
        data.isPopup && this.setMsg(data);
      }
    },

    /*
    * @method 计时习题 计算剩余时间
    * @params
    */
    calcLeaveTime(leaveTime, probID, limit) {
      // 记录问题剩余时间并开始计时
      let oProblem = this.problemMap.get(probID);
      if(oProblem) {
        oProblem.leaveTime = leaveTime

        // 订阅发布定时
        PubSub && PubSub.publish('exercise.setTiming', {
          msg: 'exercise.setTiming',
          leaveTime: leaveTime,
          limit: limit
        });

      }
    },

    /*
    * @method 答题续时
    * @params problem
    */
    extendTime(problem) {
      if(problem) {
        // 订阅发布答题续时
        PubSub && PubSub.publish('exercise.extendTime', {
          msg: 'exercise.extendTime',
          problem: problem
        });
      }
    },

    /*
    * @method 收题
    * @params problemid
    */
    closedProblem(problemid) {
      if(problemid) {
        // 订阅发布收题
        PubSub && PubSub.publish('exercise.closed', {
          msg: 'exercise.closed',
          problemid: problemid
        });
      }
    },

    /*
    * @method 新增红包
    * data: { type: 5, redpacketID: 123, count: 6, length: '',  time: '', event: all }
    */
    addHongbao(data) {
      let caption = this.$i18n.t('gainbonus', { number: data.length }) || data.length + '位同学已赢得课堂红包';

      if (data.length == 0) {
        caption = this.$i18n.t('recvbonus') || 'Hi，本题有课堂红包发送';
      }

      data = Object.assign(data, {
        caption: caption
      })

      // 是否含有重复数据 红包重复需要更新数目
      let hasEvent = false;
      this.cards.forEach((item) => {
        if(item.type === 5 && item.redpacketID === data.redpacketID) {
          item = Object.assign(item, {
            caption: caption,
            event: data.event
          })

          hasEvent = true;
        }
      })

      if(!hasEvent) {
        this.cards.push(data);
        this.setCards(this.cards)

        // 消息box弹框
        data.isPopup && this.setMsg(data);
      }
    },

    /*
     * @method 发起分组
     * @param { type: 8, teamid: '', groupid: item['groupid'], cat: item['cat'], event: all }
     */
    launchGroup(data) {
      let oGroup = this.groupMap.get(data.groupid);
      // 是否含有重复数据
      let hasEvent = this.cards.find((item) => {
        return item.type === 8 && item.groupid === data.groupid && data.isFetch;
      })

      if(oGroup && oGroup.deleted) {
        return this;
      }

      let teamid = data.teamid || oGroup && oGroup.team_id;
      let groupType = data.cat;
      let href = '';
      let lessonID = this.lessonID;
      if(teamid) {
        href = `/team/studentteam/${teamid}?lessonid=${lessonID}`;
      } else if(groupType === 'free') {
        href = `/team/join/${data.groupid}?lessonid=${lessonID}`;
      } else {
        href = `/team/studentteam/${teamid}?lessonid=${lessonID}`;
      }

      Object.assign(data, {
        groupid: data.groupid,
        groupType: groupType,
        href: href,
        status: teamid ? this.$i18n.t('done') : this.$i18n.t('undone'),
        isComplete: teamid ? true : false
      })


      // 消息box弹框
      data.isPopup && !this.observerMode && this.setMsg(data);

      if(!hasEvent) {
        this.cards.push(data);
        this.setCards(this.cards)
      }
    },

    /*
     * @method 取消分组
     * @param { type: 8, groupid: 2, event: all }
     */
    cancelGroup(data) {
      let targetIndex = this.cards.findIndex((item) => {
        return item.type === 8 && item.groupid === data.groupid;
      })

      // 可以确认分组被取消了
      if(targetIndex !== -1) {
        this.cards.splice(targetIndex, 1);
        this.setCards(this.cards)
      }
    },

    /*
     * @method 完成分组
     * @param { type: 8, groupid: item['groupid'], teamid: item['teamid'], event: all }
     */
    finishGroup(data) {
      let group = this.cards.find((item) => {
        return item.type === 8 && item.groupid === data.groupid;
      })

      group && Object.assign(group, {
        href: `/team/studentteam/${data.teamid}`,
        status: this.$i18n.t('undone'),
        isComplete:  true
      })

      this.setCards(this.cards)
    },

    /*
     * @method 发起互评
     * @param { type: 9, reviewid: 2, prob: 1002, dt: 1510000, event: all }
     */
    launchReview(data) {
      let oReview = this.groupReviewMap.get(data.reviewid);
      let isComplete = oReview && oReview.finished || false;
      // 是否含有重复数据
      let hasEvent = this.cards.find((item) => {
        return item.type === 9 && item.reviewid === data.reviewid && data.isFetch;
      })
      let index = this.cards.length;

      // 互评题目信息
      let slideData = this.problemMap.get(data.prob);

      Object.assign(data, {
        pageIndex: slideData && slideData.Index,
        cover: slideData && slideData['Cover'],
        score: slideData && slideData['Problem'] && slideData['Problem']['Score'],
        status: isComplete ? this.$i18n.t('done') : this.$i18n.t('undone'),
        isComplete,
        index
      })

      // 消息box弹框
      data.isPopup && !this.observerMode && this.setMsg(data);

      if(!hasEvent) {
        this.cards.push(data);
        this.setCards(this.cards)
      }
    },

    /*
     * @method 截图分享
     * @param { type: 10, cat: 'capture', url: ‘’, event: all }
     */
    addCapture(data) {
      let presentation = this.presentationMap.get(this.presentationID);
      // 是否含有重复数据
      let hasEvent = this.cards.find((item) => {
        return item.type === 10 && item.url === data.url && data.isFetch;
      })

      // 预加载图片
      let oImg = new Image();
      oImg.onload = (evt) => {
        // 矫正宽高
        let target = evt.target;
        data.Width = target.naturalWidth || target.width;
        data.Height = target.naturalHeight || target.height;
      };

      oImg.src = data.url;

      let cardItem = {
        src: data.url,
        rate: presentation.Width / presentation.Height,
        Width: presentation.Width,
        Height: presentation.Height,
      };

      data = Object.assign(data, cardItem)

      if(!hasEvent) {
        this.cards.push(data);
        this.setCards(this.cards)
      }
    },

    /*
     * @method 板书分享
     * @param { type: 11, board: { url: '', }, time: '', event: all }
     */
    addBoard(data) {
      let presentation = this.presentationMap.get(this.presentationID);
      let url = data.board && data.board.url;
      // 是否含有重复数据
      let hasEvent = this.cards.find((item) => {
        return item.type === 11 && item.src === url && data.isFetch;
      })

      // 预加载图片
      let oImg = new Image();
      oImg.onload = (evt) => {
        // 矫正宽高
        let target = evt.target;
        data.Width = target.naturalWidth || target.width;
        data.Height = target.naturalHeight || target.height;
      };

      oImg.src = url;

      let cardItem = {
        src: url,
        rate: presentation.Width / presentation.Height,
        Width: presentation.Width,
        Height: presentation.Height,
      };

      data = Object.assign(data, cardItem)

      if(!hasEvent) {
        this.cards.push(data);
        this.setCards(this.cards)
      }
    },

    /*
     * @method 开始直播
     * @param {
        "lessonid": 298,
        "type": 1,    //1音频 2视频
        "code": "RainLive-8201d0bf-e0d441b3",
        "liveurl": {
          "httpflv": "http://vdn-flv.xuetangx.com/xuetanglive/RainLive-8201d0bf-e0d441b3.flv",
          "hls": "http://vdn-hls.xuetangx.com/xuetanglive/RainLive-8201d0bf-e0d441b3/index.m3u8",
          "rtmp": "rtmp://vdn-push.xuetangx.com/xuetanglive/RainLive-8201d0bf-e0d441b3"
        }}
     */
    startLive(data) {
      if(data && data.liveurl) {
        this.liveurl = data.liveurl;
        // 直播类型
        this.liveType = data.type;
        this.liveURL = data.liveurl.httpflv;

        this.addMessage({ type: 1, message: this.$i18n.t('LIVE_ON'), event: data });

        // 标记这是一堂远程课
        !this.isLive && this.liveURL && (this.isLive = true);

        // 日志上报
        setTimeout(() => {
          this.handleLogEvent();
        }, 1000)
      }
    },

    /*
     * @method 切换直播地址
     * @param
     */
    changeLive(data) {
      if(data && data.url) {
        this.liveurl = data.url;
        // 直播类型
        this.liveType = data.type;
        this.liveURL = data.url.httpflv;
      }
    },

    /*
     * @method 结束直播
     * @param
     */
    endLive(data) {
      this.addMessage({ type: 1, message: this.$i18n.t('LIVE_OFF'), event: data });

      setTimeout(()=>{
        // 快手上报
        if(this.qos) {
          this.qos.sendSummary();
          // 拉流之前先解绑
          this.destroyKwai();
        }

        this.liveURL = '';
        this.liveType = 0;
        this.playState = 0;
      }, 3000)

      // 关闭弹幕直播
      this.isLive && (this.isLive = false);
    },

    /*
     * @method 设置课件title
     * @param
     */
    setPresentationTitle(presentationID) {
      let presentation = this.presentationMap.get(presentationID);

      if(presentation && presentation.Title) {
        this.title = presentation.Title;
      }
    },

    /*
     * @method 设置白板基本信息
     * @param  { type: 12, board: , lenunit: '', event: all }
     */
    setBoardInfo(data) {
      let id = data.boardid;
      let index = this.cards.length;
       // 是否含有重复数据
      let hasEvent = this.cards.find((item) => {
        return item.type === 12 && item.boardid === id && data.isFetch;
      });
      let boardInfo = this.boardMap.get(id);

      if(data) {
        data = Object.assign(data, {
          rate: data.devwidth / data.devheight,
          time: data.dt,
          doubt: false,
          emphasis: false,
          index
        }, boardInfo);

        // 记录当前白板信息
        this.boardMap.set(id, data);
        this.boardInfo = data;

        if(!hasEvent) {
          this.cards.push(data);
          this.setCards(this.cards)

          // 新消息提醒
          this.setMsg(data);
        }
      }
    },

    /*
     * @method 设置白板画线
     * @param
     */
    setBoardline(data) {
      if(data && !data.isFetch) {
        let id = data.boardid || this.boardInfo.boardid;
        let boardInfo = this.boardMap.get(id);

        if(boardInfo) {
          boardInfo = Object.assign({}, boardInfo);
          !boardInfo.lines && (boardInfo.lines = []);
          boardInfo.lines.push(data);
          this.boardMap.set(id, boardInfo);

          if(data.from !== 'timeline') {
            this.setBoardMsg(data);
          }
        }

      }
    },

    /*
     * @method 白板翻页
     * @param { "type": "board", "action": "nav", "boardid": 1 }
     */
    boardNav(data) {
      if(data && !data.isFetch) {
        let id = data.boardid;
        // 找到之前的板子
        let targetIndex = this.cards.findIndex((item) => {
          return item.type === 12 && item.boardid === id;
        })

        if(data.from === 'timeline') {
          return this;
        }

        // 删除之前的白板
        if(~targetIndex) {
          // let originBoards = this.cards.splice(targetIndex, 1);

          // if(originBoards.length) {
          //   this.cards.push(originBoards[0]);
          //   this.setCards(this.cards)
          // }
        }
      }
    },

    /*
     * @method 白板清屏
     * @param
     */
    clearBoard(data) {
      if(data && !data.isFetch) {
        let id = data.boardid;
        // this.clearScreen(id, true);

        this.setBoardMsg(data);

        let boardMap = this.boardMap;
        let boardInfo = boardMap.get(id);

        boardInfo.lines = [];
        boardMap.set(id, boardInfo);
      }
    },

    /**
     * @method 设置board当前状态的图片URL
     * @param { "type": "board", "action": "nav", "boardid": 1, "url": "" }
     */
    setBoardCover(data) {
      if(data && !data.isFetch) {
        let id = data.boardid;
        let boardInfo = this.boardMap.get(id);

        if(boardInfo) {
          boardInfo = Object.assign({}, boardInfo, { url: data.url, lines: [] })
          this.boardMap.set(id, boardInfo);

          // 将白板线路图改成图片
          // this.drawImage(boardInfo);
        }
      }
    },

    /*
     * @method 弹幕接收
     * @param
     */
    receiveDanmu(data) {
      if(data && !data.isFetch) {
        this.danmus.push(data);
      }
    },

    /*
     * @method 十秒内没有新弹幕清理弹幕列表
     * @param
     */
    clearDanmus(data) {
      if(this.danmus && this.danmus.length) {
        this.danmus = [];
      }
    },

    /**
     * @method 更新视频状态提示
    */
    changeLiveStatusTips(status, voice){
      let self = this
      switch (status) {
        case 1:
          if(this.liveVisible) {
            if(this.lastStatus !== 1 && this.lastStatus !== -3) {
              this.needNew = true
            }

            this.liveStatusTips = ''

            this.changliveTimer && clearTimeout(this.changliveTimer);
            this.changliveTimer = setTimeout(()=>{
              // 初始化
              this.initKwai();
            }, 3000)
          }

          break
        case -1:
          this.liveStatusTips = this.$i18n.t('isconnecting') || '老师端直播连接中...'
          break
        case -2:
          this.liveStatusTips = this.$i18n.t('ispoor') || '老师端网络信号不佳'
          break
        case -3:
          this.liveStatusTips = voice == 1 ? this.$i18n.t('offsilentmood') : this.$i18n.t('silentmood')
          break
        case -4:
          this.liveStatusTips = this.$i18n.t('switchinglivecontent') || '老师正在切换直播内容'
          break
      }

      this.isMute = voice == -1 ? true : false
      this.lastStatus = status

      setTimeout(() => {
        self.liveStatusTips = ''
      }, 5000)
    }

  }
}


export default actionsMixin;

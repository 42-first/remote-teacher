/*
 * 学生接收器 各种类型处理
 * @author: chenzhou
 * @update: 2017.5.31
 * @desc 新增ppt，新增加红包，新增试卷，新增试题等
 *
 */


var actionsMixin = {
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

              this.timeline['problem'][item['prob']] = item;
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
              this.addSubmission({ type: 6, postid: item['postid'], time: item['dt'], event: item, isFetch: isFetch });

              break;

            // 分享协议合并 主观题分享20171204
            case 'share':
              if(item['cat'] === 'post') {
                this.addSubmission({ type: 6, postid: item['postid'], time: item['dt'], event: item, isFetch: isFetch });
              } else if(item['cat'] === 'subjective') {
                this.addSubjective({ type: 7, spid: item.spid, time: item['dt'], event: item, isFetch: isFetch });
              }

              break;

            default: break;
          }
        });
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
      }

      !hasEvent && this.cards.push(data);
      this.allEvents.push(data);
    },

    /*
     * @method 取slideData 新版本1.1 指纹需求
     * param: slides, si, sid
     */
    getSlideData(slides, si, sid) {
      let slideData = slides && slides[si-1];

      // 1.1 版本统一使用sid替换pageIndex, 之前版本还是使用si
      if(+this.version >= 1.1 && typeof sid !== 'undefined' && sid > 0) {
        // if(slideData && slideData.lessonSlideID !== sid) {
        //   // ppt不一致 通过sid取slideData
        //   slideData = slides.find((slide)=>{
        //     return slide.lessonSlideID === sid;
        //   });
        // }

        // ppt不一致 通过sid取slideData
        slideData = slides.find((slide)=>{
          return slide.lessonSlideID === sid;
        });
      }

      return slideData;
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
      let index = -1;
      let cover = slideData && slideData['Cover'] || '';

      if (!slideData) {
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
          this.addMessage({ type: 1, message: '幻灯片解析失败' });
        }
      } else if(slideData['Cover']=='rain://error/export-error'){
        if(!data.isFetch) {
          this.addMessage({ type: 1, message: '幻灯片上传失败' });
        }
      } else {
        // 预加载图片
        let oImg = new Image();
        oImg.onload = (evt) => {
          if(index !== -1) {
            let data = self.cards[index - 1];
            data.src = slideData['Cover'];
          }
        };

        oImg.src = slideData['Cover'];

        let cardItem = {
          src: slideData['Thumbnail'],
          rate: presentation.Width / presentation.Height,
          hasQuestion: slideData['question'] == 1 ? true : false,
          hasStore: slideData['store'] == 1 ? true : false,
          Width: presentation.Width,
          Height: presentation.Height,
          slideID: slideData['lessonSlideID'],
          isRepeat: hasPPT ? true : false
        };

        // ppt 动画处理 animation 0: 没有动画 1：动画开始 2:动画结束 !data.isTimeline
        if(data.event && typeof data.event.total !== 'undefined' && data.event.total > 0) {
          // step === 0 开始动画 正常插入
          if(data.event.step === 0) {
            // 之前没有播放过这个ppt
            if(!hasPPT) {
              data = Object.assign(data, cardItem, { animation: 1 })
            } else {
              data = Object.assign(data, cardItem, { animation: 0 })
            }

            this.cards.push(data);
          } else if(data.event.step === -1) {
            // step === -1 total > 1 动画结束 替换原来的数据 取到原来的ppt位置
            if(hasPPT) {
              // 需要替换的index
              let targetIndex = this.cards.findIndex((item, i) => {
                return item.type === 2 && item.slideID === cardItem.slideID && item.animation === 1;
              })

              data = Object.assign(data, cardItem, { animation: 2, isRepeat: false })
              targetIndex && this.cards.splice(targetIndex, 1, data);
            }
          }
        } else {
          // 没有动画
          data = Object.assign(data, cardItem, { animation: 0 })
          this.cards.push(data);
        }

        index = this.cards.length;
      }

      this.allEvents.push(data);
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

      data = Object.assign(data, {
        papername: data.title,
        quizid: data.quiz,
        href: '/quiz/quiz_info/' + data.quiz,
        count: data.total,
        time: data.time,
        status: oQuiz && oQuiz.answered ? this.$i18n.t('done') || '已完成' : this.$i18n.t('undone') || '未完成',
        isComplete: oQuiz && oQuiz.answered || false
      })

      // 消息box弹框
      // data.isPopup && this.msgBoxs.push(data);
      data.isPopup && (this.msgBoxs = [data]);

      !hasEvent && this.cards.push(data);
      this.allEvents.push(data);
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

      if(!slideData) {
        let targetIndex = this.cards.findIndex((item) => {
          return item.type === 3 && item.problemID === data.event['prob'];
        })

        // 问题被删除了
        targetIndex !== -1 && this.cards.splice(targetIndex, 1);

        // 删除消息
        if(targetIndex !== -1 && this.msgBoxs.length && this.msgBoxs[0].problemID === data.event['prob'] ) {
          this.msgBoxs = [];
        }

        return this;
      }

      slideData['Problem'] && this.problemMap.set(slideData['Problem']['ProblemID'], slideData);
      // 问题类型
      let problemType = slideData['Problem']['Type'];

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
        index: index
      })

      // 消息box弹框
      // data.isPopup && this.msgBoxs.push(data);
      data.isPopup && (this.msgBoxs = [data]);

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

      !hasEvent && this.cards.push(data);
      this.allEvents.push(data);
    },

    /*
     * @method 新增分享投稿20170823
     * { type: 6, postid: 123, isFetch: false }
     */
    addSubmission(data) {
      // 是否含有重复数据
      let hasEvent = this.cards.find((item) => {
        return item.type === 6 && item.postid === data.postid && data.isFetch;
      })

      data = Object.assign(data, {
        status: '未读',
        isComplete: false
      })

      !hasEvent && this.cards.push(data);
      this.allEvents.push(data);
    },

    /*
     * @method 新增分享主观题20171204
     * { type: 7, spid: 123 , isFetch: false }
     */
    addSubjective(data) {
      // 是否含有重复数据
      let hasEvent = this.cards.find((item) => {
        return item.type === 7 && item.spid === data.spid && data.isFetch;
      })

      data = Object.assign(data, {
        status: '未读',
        isComplete: false
      })

      !hasEvent && this.cards.push(data);
      this.allEvents.push(data);
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

        // 习题组件实例中的定时方法
        // this.$children[2] && this.$children[2].setTiming && this.$children[2].setTiming(leaveTime);
        // this.$children[3] && this.$children[3].setTiming && this.$children[3].setTiming(leaveTime);
        // this.$children[4] && this.$children[4].setTiming && this.$children[4].setTiming(leaveTime);

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

      !hasEvent && this.cards.push(data);
      this.allEvents.push(data);
    }
  }
}


export default actionsMixin;

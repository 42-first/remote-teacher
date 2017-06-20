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
              this.addPPT({ type: 2, pageIndex: item['si'], time: item['dt'], presentationid: item['pres'], isFetch: isFetch });

              break;

            // 幻灯片换页通知
            case 'problem':
              this.addProblem({ type: 3, pageIndex: item['si'], time: item['dt'], presentationid: item['pres'], limit: item.limit, event: item });

              this.timeline['problem'][item['prob']] = item;
              break;

            // 试卷
            case 'quiz':
              this.addPaper({ type: 4, quiz: item['quiz'], title: item['title'], total: item['total'], time: item['dt']});

              break;

            // event
            case 'event':
              this.addMessage({ type: 1, message: item['title'], time: item['dt'] });

              break;

            // 红包
            case 'redpacket':
            case 'updateredpacket':
              this.addHongbao({ type: 5, redpacketID: item.redpacket, count: item.count, length: item.detail.length, time: item.dt, event: item });

              break;

            default: break;
          }
        });
      }
    },

    /*
    * @method 新增提醒消息
    * data: { type: 1, message: '', time: '' }
    */
    addMessage(data) {
      // 是否含有重复数据
      let hasEvent = this.cards.find((item) => {
        return item.type === 1 && item.message === data.message;
      })

      !hasEvent && this.cards.push(data);
      this.allEvents.push(data);
    },

    /*
    * @method 新增PPT
    * data: { type: 2, pageIndex: 2, presentationid: 100, time: '' }
    */
    addPPT(data) {
      let self = this;
      let presentation = this.presentationMap.get(data.presentationid);
      let pptData = presentation['Slides'];
      let slideData = pptData[data.pageIndex-1];
      let index = -1;

      // 是否含有重复数据
      let hasPPT = this.cards.find((item)=>{
        return item.type === 2 && item.pageIndex === data.pageIndex && item.presentationid === data.presentationid;
      })

      // 如果是习题图片，则不添加
      if (!slideData || slideData && slideData['Problem'] || hasPPT && data.isFetch ) {

        // slideData && slideData['Problem'] && data.isFetch &&
        // this.addProblem({ type: 3, pageIndex: data.pageIndex, time: data.time, presentationid: data.presentationid, limit: -1, event: null });

        return;
      }

      if (slideData['Cover']=='rain://error/upload-error') {
        if(!data.refresh) {
          this.addMessage({ type: 1, message: '幻灯片解析失败' });
        }
      } else if(slideData['Cover']=='rain://error/export-error'){
        if(!data.refresh) {
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

        // 缓存中
        // if(oImg.complete || oImg.width) {
        // }

        data = Object.assign(data, {
          src: slideData['Thumbnail'],
          rate: presentation.Width / presentation.Height,
          hasQuestion: slideData['question'] == 1 ? true : false,
          hasStore: slideData['store'] == 1 ? true : false,
          Width: presentation.Width,
          Height: presentation.Height,
          slideID: slideData['lessonSlideID'],
          isRepeat: hasPPT ? true : false
        })

        this.cards.push(data);
        index = this.cards.length;

        // tab是全部或者ppt 滚动到视线位置
        if( this.currTabIndex === 1 || this.currTabIndex === 2 ) {
          // this.$el.querySelector('').scrollIntoView(true);
        }
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
        status: oQuiz && oQuiz.answered ? '已完成' : '未完成',
        isComplete: oQuiz && oQuiz.answered || false
      })

      !hasEvent && this.cards.push(data);
      this.allEvents.push(data);
    },

    /*
    * @method 新增习题
    * { type: 3, pageIndex: item['si'], time: item['dt'], presentationid: item['pres'], limit: item.limit, event: item }
    */
    addProblem(data) {
      let presentation = this.presentationMap.get(data.presentationid);
      let pptData = presentation['Slides'];
      let slideData = pptData[data.pageIndex-1];

      slideData['Problem'] && this.problemMap.set(slideData['Problem']['ProblemID'], slideData);

      data = Object.assign(data, {
        pageIndex: data.pageIndex,
        presentationid: data.presentationid,
        time: data.time,
        caption: slideData['Problem']['Type'] === 'Polling' ? 'Hi,你有新的投票' :'Hi,你有新的课堂习题',
        status: slideData['Problem']['Result'] ? '已完成' : '未完成',
        isComplete: slideData['Problem']['Result'] ? true : false,
        problemID: slideData['Problem']['ProblemID'],
        options: slideData['Problem']['Bullets'],
        cover: slideData['Cover']
      })

      // 是否含有重复数据
      let hasEvent = this.cards.find((item)=>{
        return item.type === 3 && item.pageIndex === data.pageIndex && item.presentationid && data.presentationid;
      })

      !hasEvent && this.cards.push(data);
      this.allEvents.push(data);
    },

    /*
    * @method 计时习题 计算剩余时间
    * @params
    */
    calcLeaveTime(leaveTime, probID) {
      // 记录问题剩余时间并开始计时
      let oProblem = this.problemMap.get(probID);
      if(oProblem) {
        oProblem.leaveTime = leaveTime

        // 习题组件实例中的定时方法
        this.$children[2] && this.$children[2].setTiming(leaveTime);
      }
    },

    /*
    * @method 新增红包
    * data: { type: 5, redpacketID: 123, count: 6, length: '',  time: '', event: all }
    */
    addHongbao(data) {
      let caption = data.length + '位同学已赢得课堂红包';

      if (data.length == 0) {
        caption = 'Hi，本题有课堂红包发送';
      }

      data = Object.assign(data, {
        caption: caption
      })

      // 是否含有重复数据
      let hasEvent = this.cards.find((item)=>{
        return item.type === 5 && item.redpacketID === data.redpacketID;
      })

      !hasEvent && this.cards.push(data);
      this.allEvents.push(data);
    }
  }
}


export default actionsMixin;

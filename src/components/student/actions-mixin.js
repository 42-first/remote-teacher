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
    */
    setTimeline(timeline) {
      if (timeline && timeline.length) {
        timeline.forEach( (item, index) => {
          switch(item['type']) {
            // ppt
            case 'slide':
              this.addPPT({ type: 2, pageIndex: item['si'], time: item['dt'], presentationid:item['pres'] });

              break;

            // 幻灯片换页通知
            case 'problem':
              this.addProblem({ type: 3, pageIndex: item['si'], time: item['dt'], presentationid: item['pres'] });

              // socket_config['problem'][item['prob']] = item;
              timeline['problem'][item['prob']] = item;
              // 当前问题需要计时
              break;

            // 试卷
            case 'quiz':
              this.addPaper({ type: 4, quiz: item['quiz'], title: item['title'], total: item['total'], time: item['dt']});

            // event
            case 'event':
              this.addPaper({ type: 4, quiz: item['quiz'], title: item['title'], total: item['total'], time: item['dt']});

              break;

            default: break;
          }

          // if(item['type'] == 'slide'){
          //                   addPPT({pageIndex:item['si'],time:item['dt'],presentationid:item['pres']});
          // }else if(item['type'] == 'problem'){
          //                   addXT({pageIndex:item['si'], time:item['dt'],presentationid:item['pres']});
          //                   socket_config['problem'][item['prob']] = item;
          //                   if(mainView.activePage.name=='exercisepage'){
          //                       showTimelime(item['prob']);
          //                   }
          // }else if(item['type'] == 'quiz'){
          //                   addPaper({quiz:item['quiz'],title:item['title'],total:item['total'],time:item['dt']});
          // }else if(item['type'] == 'event'){
          //                   addMessageSection({message:item['title']});
          // }else if(item['type'] == 'redpacket'){
          //                   Stu_hongbao.redpacket_hash[item.redpacket] = item.detail;
          //                   Stu_hongbao.redpacket_info[item.redpacket] ={
          //                       count:item.count
          //                   };
          //                   Stu_hongbao.addHongBao({probid:item.redpacket, time:item.dt,count:item.detail.length});
          // }else if(item['type'] == 'updateredpacket'){
          //                   //删除原来的消息
          //                   Stu_hongbao.deleteHongBao({probid:item.redpacket});
          //                   Stu_hongbao.redpacket_hash[item.redpacket] = item.detail;
          //                   Stu_hongbao.redpacket_info[item.redpacket] ={
          //                       count:item.count
          //                   };
          //                   Stu_hongbao.addHongBao({probid:item.redpacket, time:item.dt,count:item.detail.length});
          //               }
        });
      }
    },
    /*
    * @method 新增提醒消息
    * data: { type: 1, message: '' }
    */
    addMessage(data) {
      data.type = 1;

      this.cards.push(data);
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

      if (slideData['Cover']=='rain://error/upload-error') {
        if(!data.refresh) {
          this.addMessage({ type: 1, message: '幻灯片解析失败' });
        }
      } else if(slideData['Cover']=='rain://error/export-error'){
        if(!data.refresh) {
          this.addMessage({ type: 1, message: '幻灯片上传失败' });
        }
      } else {
        // 是否含有重复数据
        let hasPPT = this.cards.find((item)=>{
          return item.type === 2 && item.pageIndex === data.pageIndex && item.presentationid === data.presentationid;
        })

        // todo: 预加载图片
        let oImg = new Image();
        oImg.onload = () => {
          if(index !== -1) {
            let data = self.cards[index - 1];
            data.src = slideData['Cover'];
          }
        };

        oImg.src = slideData['Cover'];

        if(!hasPPT) {
          data.src = slideData['Thumbnail'];
          // 宽高比
          data.rate = presentation.Width / presentation.Height;
          data.hasQuestion = slideData['question'] == 1 ? true : false;
          data.hasStore = slideData['store'] == 1 ? true : false;

          this.cards.push(data);
          index = this.cards.length;
        }

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

      data = Object.assign(data, {
        papername: data.title,
        quizid: data.quiz,
        href: '/quiz/quiz_info/' + data.quiz,
        count: data.total,
        time: data.time,
        status: oQuiz.answered ? '已完成' : '未完成',
        isComplete: oQuiz.answered
      })

      this.cards.push(data);
      this.allEvents.push(data);
    },


    /*
    * @method 新增习题
    */
    addProblem(data) {
      let presentation = this.presentationMap.get(data.presentationid);
      let pptData = presentation['Slides'];
      let slideData = pptData[data.pageIndex-1];

      data = Object.assign(data, {
        pageIndex: data.pageIndex,
        presentationid: data.presentationid,
        time: data.time,
        caption: slideData['Problem']['Type'] === 'Polling' ? 'Hi,你有新的投票' :'Hi,你有新的课堂习题',
        status: slideData['Problem']['Result'] ? '已完成' : '未完成',
        isComplete: slideData['Problem']['Result'] ? true : false
      })


      this.cards.push(data);
      this.allEvents.push(data);
    },

    /*
    * @method 新增习题
    */
    addHongbao(data) {
      let caption = data.count + '位同学已赢得课堂红包';

      if (data.count == 0) {
        caption = 'Hi，本题有课堂红包发送';
      }

      data = Object.assign(data, {
        time: data.time,
        caption: caption
      })


      this.cards.push(data);
      this.allEvents.push(data);
    }
  }
}


export default actionsMixin;

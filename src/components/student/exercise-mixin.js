/*
 * 学生接收器 习题
 * @author: chenzhou
 * @update: 2017.6.12
 * @desc
 *
 */


var exerciseMixin = {
  methods: {
    /*
    * @method 保存习题到
    * data: { type: 1, message: '', time: '' }
    */
    addMessage(data) {
      // 是否含有重复数据
      let hasEvent = this.cards.find((item)=>{
        return item.type === 1 && item.message === data.message && item.time === data.time;
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

      // 如果是习题图片，则不添加
      if (slideData['Problem']){
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
        // 是否含有重复数据
        let hasPPT = this.cards.find((item)=>{
          return item.type === 2 && item.pageIndex === data.pageIndex && item.presentationid === data.presentationid;
        })

        // todo: 预加载图片
        let oImg = new Image();
        oImg.onload = (evt) => {
          if(index !== -1) {
            let data = self.cards[index - 1];
            data.src = slideData['Cover'];
          }
        };

        oImg.src = slideData['Cover'];

        // 缓存中
        if(oImg.complete || oImg.width) {
        } else {
        }


        if(!hasPPT) {
          data = Object.assign(data, {
            src: slideData['Thumbnail'],
            rate: presentation.Width / presentation.Height,
            hasQuestion: slideData['question'] == 1 ? true : false,
            hasStore: slideData['store'] == 1 ? true : false,
            Width: presentation.Width,
            Height: presentation.Height,
            slideID: slideData['lessonSlideID']
          })

          this.cards.push(data);
          index = this.cards.length;
        }

        // tab是全部或者ppt 滚动到视线位置
        if( this.currTabIndex === 1 || this.currTabIndex === 2 ) {
          // this.$el.querySelector('').scrollIntoView(true);
        }
      }

      this.allEvents.push(data);
    }


  }
}


export default exerciseMixin;

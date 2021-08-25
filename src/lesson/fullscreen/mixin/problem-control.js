/*
 * 课堂习题控制
 * @author: chenzhou
 * @update: 2020.8.21
 * @desc 订阅事件 定时 延时续时 提交失败缓存答案等
 */

import { isSupported } from '@/util/util'


let problemControl = {
  methods: {
    /**
     * @method 初始化订阅事件
     * @param
     */
    initPubSub() {
      // 取消练习的订阅
      PubSub && PubSub.unsubscribe('exercise');

      // 订阅定时消息
      PubSub && PubSub.subscribe( 'exercise.setTiming', ( topic, data ) => {
        this.setProblemStatus(data);
      });

      // 订阅续时消息
      PubSub && PubSub.subscribe( 'exercise.extendTime', ( topic, data ) => {
        this.extendTime(data && data.problem);
      });

      // 订阅收题消息
      PubSub && PubSub.subscribe( 'exercise.closed', ( topic, data ) => {
        this.closedProblem(data && data.problemid);
      });
    },

    /**
     * @method 问题状态
     * @param
     */
    setProblemStatus(data) {
      let leaveTime = data && data.leaveTime;

      // 不限时
      if(data.limit === -1) {
        this.limit = -1;
        // 是否可以点亮提交按钮
        this.canSubmitFn();
      } else if(data.limit === 0) {
        // 已收题
        this.setTiming(0);
      } else {
        // 限时题目
        this.limit = data.limit;
        this.setTiming(data && data.leaveTime);
      }
    },

    /**
     * @method 设置计时器
     * @param
     */
    setTiming(leaveTime) {
      this.leaveTime = leaveTime > 0 ? leaveTime : 0;

      this.timer && clearInterval(this.timer)

      if (leaveTime > 0) {
        this.timer = setInterval(()=>{
          this.leaveTime--;
          let minutes = parseInt(this.leaveTime / 60, 10);
          let seconds = parseInt(this.leaveTime % 60, 10);
          minutes = minutes < 10 ? '0' + minutes : minutes;
          seconds = seconds < 10 ? '0' + seconds : seconds;

          this.sLeaveTime = minutes + ':' + seconds;

          if(this.leaveTime === 0) {
            this.sLeaveTime = this.$i18n && this.$i18n.t('receivertimeout') || '作答时间结束';

            clearInterval(this.timer);
            this.timeOver = true;
            this.warning = false;
          }

          if(this.leaveTime <= 10 && this.leaveTime > 0) {
            this.warning = true;
          }

        }, 1000)
      } else {
        // 时间到
        this.timeOver = true;
        this.sLeaveTime = this.$i18n && this.$i18n.t('receivertimeout') || '作答时间结束';
      }
    },

    /**
     * @method 答题续时
     * @params problem
     */
    extendTime(problem) {
      if(problem) {
        let id = problem.prob;
        let extend = problem.extend;
        // 续时 分钟 秒
        let minutes = parseInt(extend / 60, 10);
        let seconds = parseInt(extend % 60, 10);
        let sMsg = minutes > 0 ? this.$i18n && this.$i18n.t('extendmin', { minutes: minutes }) || `题目续时 ${minutes}分钟` : this.$i18n && this.$i18n.t('extendsec', { seconds: seconds }) || `题目续时 ${seconds}秒`;

        if(extend === -1) {
          sMsg = this.$i18n && this.$i18n.t('notimelimit') || '题目不限时';
        }

        // 同一个问题续时 切没有结束
        if(id === this.problemID && !this.isComplete) {
          this.hasNewExtendTime = true;
          this.sExtendTimeMsg = sMsg;

          this.limit = problem.limit;

          if(extend > 0) {
            let leaveTime = this.limit - Math.floor((problem['now'] - problem['dt'])/1000);
            this.setTiming(leaveTime);
          } else if(extend === -1) {
            this.timer && clearInterval(this.timer)
          }

          // 是否可以点亮提交按钮
          this.canSubmitFn();

          //
          this.timeOver === true && (this.timeOver = false);
          this.warning === true && (this.warning = false);

          setTimeout(()=>{
            this.hasNewExtendTime = false;
          }, 3000)
        }
      }
    },

    /**
     * @method 收题
     * @params problemid
     */
    closedProblem(problemid) {
      if(problemid === this.problemID && !this.isComplete) {
        this.setTiming(0);
      }
    },

    /**
     * @method 保存习题答案
     * @param
     */
    saveAnswer(data) {
      let key = 'answer_problem';

      if(isSupported(localStorage)) {
        let answerPostList = JSON.parse(localStorage.getItem(key)) || [];

        data.retry_times = data.retry_times + 1;
        answerPostList.push(data);

        let value = JSON.stringify(answerPostList);
        localStorage.setItem(key, value);
      }
    },

    /**
     * @method 提交答案
     */
    submit(params) {
      let URL = API.lesson.answer_problem;

      console.log(params);

      return request.post(URL, params).
      then((res)=>{
        return res.code;
      }).
      catch(error => {
        console.log('submit:', error);
        return -1;
      })
    },

    /** 
     * @method 切换习题 停止计时
    */
    endTiming(){
      this.timer && clearInterval(this.timer)
    },

    /*
     * @method 重置数据
     * @param
    */
    reset() {
      if([1,2,3].includes(this.problemType)){
        this.optionsSet = new Set()
        this.pollingCount = 0
      }else if(this.problemType == 4){
        this.result = [];
      }else if(this.problemType == 5){
        this.text = '';
        this.hasImage = false;
        this.loading = false;
        this.imageURL = '';
        this.imageThumbURL = '';
        this.ispreview =false;
        this.sendStatus = 0;
        this.teamVisible = false;
        this.answerType = 0;
        this.noTeam = false;
        this.getScore = undefined;
        this.team = null;
      }
      this.timeOver = false;
      this.canSubmit = 0;
      this.warning = false;
      this.limit = -1;
      this.leaveTime = 0;
      this.isShowSubmit = true;
      this.isComplete = false;
      this.sLeaveTime = '--:--';
    },

  }
}


export default problemControl;

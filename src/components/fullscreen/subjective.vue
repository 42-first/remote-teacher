/*
 * @page：学生接收器主观题作答页面
 * @author: chenzhou
 * @update: 2017.8.8
 * @desc 小组作答 websocket命令是否是小组作答
 *
 */

<template>
  <section class="page-subjective">

    <div class="subjective-wrapper">

      <!-- 定时 续时等 -->
      <section class="exercise__tips">
        <div class="timing" v-if="limit>0 && sLeaveTime && !hasNewExtendTime || timeOver">
          <img class="timing--icon" v-if="!warning&&!timeOver" src="https://qn-sfe.yuketang.cn/o_1bvu1nd601n5v1dku1k0b1680fi9.png">
          <img class="timing--icon" v-if="warning&&!timeOver" src="https://qn-sfe.yuketang.cn/o_1bvu1oi7k1v411l4a8e41qtt1uq8e.png">
          <p :class="['timing--number', warning || timeOver ? 'over':'', timeOver ? 'f24':'f32']">{{ sLeaveTime }}</p>
        </div>
        <div class="timing f24" v-else-if="hasNewExtendTime">{{ sExtendTimeMsg }}</div>
        <div class="timing f24" v-else-if="isComplete"><!-- 已完成 -->{{ $t('receiverdone') }}</div>
        <div class="timing f24" v-else><!-- 老师可能会随时结束答题 -->{{ $t('collectprotip') }}</div>
      </section>

      <!-- 问题内容 cover -->
      <section class="subjective-content" >
        <div class="content_wrapper">
          <p class="page-no f12"><span><!-- 第{{ summary&&summary.pageIndex }}页 -->{{ $t('pno', { number: summary&&summary.pageIndex }) }}</span></p>
          <div class="cover__wrapper" :style="{ minHeight: (10 - 0.906667)/pptRate + 'rem' }">
            <img class="cover J_preview_img" :src="summary&&summary.cover" @load="handlelaodImg(1, $event)" />
          </div>
        </div>
      </section>

      <!-- 小组作答 显示 未进组不显示小组详情 -->
      <section class="team__intro" v-if="team && !noTeam">
        <p class="team__intro--name ellipsis f18 c333"><!-- 小组作答： -->{{ $t('team.groupanswered') }}{{ team.team_name }}</p>
        <p class="f14 blue" @click="handleshowTeam"><!-- 详情 -->{{ $t('team.info') }}</p>
      </section>

      <h3 class="subjective__answer--lable f17" v-if="!ispreview"><!-- 作答区域 -->{{ $t('answerarea') }}<span class="tip f12">（<!-- 内容限制140字可插入1张图片 -->{{ $t('contentsizelimit') }}）</span></h3>
      <h3 class="subjective__answer--lable answer__header f17" v-else >
        <p><!-- 我的回答 -->{{ $t('myanswer') }}</p>
        <p @click="handleedit" v-if="answerType && !hasAnswered"><i class="iconfont icon-bianji f25 blue"></i></p>
      </h3>
      <!-- 编辑状态-->
      <div class="subjective-inner" v-if="!ispreview">
        <!-- 文字编辑 -->
        <section class="submission__text">
          <div class="submission__textarea--wrapper f17">
            <textarea class="submission-textarea J_feed_content" maxlength="1000" :placeholder="$t('subjectivetext')" v-model="text"></textarea>
            <div class="submission-footer">
              <p class="">(<span class="">{{ count }}</span>/1000)</p>
            </div>
          </div>
        </section>

        <!-- 图片 -->
        <section class="submission__pic">
          <div v-if="!hasImage&&!loading">
            <div class="submission__pic--add" ><input type=file accept="image/jpeg,image/png,image/jpg" class="camera" @change="handleChooseImageChange" ></div>
            <p class="submission__pic--remark f14">{{ $t('uploadonepic') }}</p>
          </div>
          <div class="pic-view" v-show="hasImage||loading">
            <img :class="['J_preview_img', rate < 1 ? 'higher' : 'wider']" alt="" v-show="hasImage" :src="fileData||imageURL" @load="handlelaodImg(2, $event)" @click="handleScaleImage(2, $event)" v-if="imageURL" />
            <img class="img--loading" :src="imageThumbURL" alt="雨课堂" v-else />
            <!-- 解决image 在微信崩溃的问题采用canvas处理 -->
            <p class="delete-img" @click="handleDeleteImg" v-show="hasImage"><i class="iconfont icon-wrong f18"></i></p>
          </div>
        </section>
      </div>
      <!-- 预览状态 -->
      <div class="subjective__answer" v-if="ispreview && result">
        <div class="answer__inner">
          <p class="answer--text f17">{{ result.content }}</p>
          <div class="answer--image" v-if="result.pics.length && result.pics[0].pic">
            <img class="J_preview_img" :src="result.pics[0].pic" alt="主观题作答图片" @load="handlelaodImg(3, $event)" @click="handleScaleImage(3, $event)" />
          </div>
        </div>
        <!-- 打分显示 -->
        <div class="answer-score" v-if="getScore !== -1">
          <i class="iconfont blue icon-ykq_dafen f18"></i>
          <span class="lable f15" >{{ $t('stuscore') }}: <!-- {{getScore}}分 -->{{ $t('getpoint', { score: getScore }) }}</span>
        </div>
      </div>

      <!-- 小组提示 -->
      <div class="team__tip" v-show="answerType">
        <span class="f18 yellow">*</span>
        <p class="f14 c9b" v-if="noTeam"><!-- 当前题目为小组作答，您还没有进组 -->{{ $t('team.withoutteamhint') }}</p>
        <p class="f14 c9b" v-else-if="forceTempTeam">{{ $t('team.forcetempteam') }}</p>
        <p class="f14 c9b" v-else-if="isGuestStudent">{{ $t('team.guestStudent') }}</p>
        <p class="f14 c9b" v-else>{{ $t('team.groupansweredtip') }}</p>
      </div>

      <!-- 提交按钮 -->
      <p :class="['submit-btn', 'f18', sendStatus === 0 || sendStatus === 1 || sendStatus >= 4 || isGuestStudent ? 'disable': '']" v-show="!ispreview" @click="handleSend" ><!-- 提交答案 -->{{ $t('submitansw') }}</p>

    </div>

    <!-- 小组成员列表 -->
    <section class="members__wrap" v-if="teamVisible">
      <div class="team__members">
        <header class="members--closed"><i class="iconfont icon-shiti_guanbitouping f28 c333" @click="handleclosedTeam"></i></header>
        <div class="members__header">
          <p class="members__title f20 c333">{{ team.team_name }}</p>
          <p class="members__total f14 c9b">{{ team.member_count }}人</p>
        </div>
        <ul class="">
          <li class="member__info" v-for="member in team.members">
            <img class="member--avatar" :src="member.avatar" :alt="member.name" >
            <div class="member--name f16 c666"><span class="name">{{ member.name }}</span></div>
          </li>
        </ul>
      </div>
    </section>

  </section>
</template>

<script>
  import { mapState, mapActions } from 'vuex'

  import API from '@/util/api'
  import {compress} from '@/util/image'
  import { isSupported } from '@/util/util'
  import { configWX } from '@/util/wx-util'
  import imagemixin from '@/components/common/image-mixin'
  import upload from '@/util/upload'


  export default {
    name: 'subjective-page',
    data() {
      return {
        ispreview: false,
        // 是否作答完成
        isComplete: false,
        // 是否新的延时
        hasNewExtendTime: false,
        sExtendTimeMsg: '',
        limit: 0,
        leaveTime: 0,
        sLeaveTime: '00:00',
        warning: false,
        timeOver: false,
        // 作答结果
        result: null,
        // 0 初始化状态 1图片上传中 2可以发送 3发送中 4发送完成 5课程已结束
        sendStatus: 0,
        text: '',
        imageURL: '',
        imageThumbURL: '',
        // 本地图片base64/二进制
        fileData: null,
        hasImage: false,
        // 图片加载中
        loading: false,
        count: 0,
        imageData: null,
        width: 0,
        height: 0,
        // 题目图片比例
        pptRate: 1,
        // 图片比例
        rate: 1,
        msgid: 0,
        summary: null,
        // star count 获得星星的数量
        starCount: 0,
        getScore: -1,
        // 个人作答还是小组作答 0 个人作答 1小组作答
        answerType: 0,
        // 小组详情
        team: null,
        teamVisible: false,
        // 分组 我是否作答过
        hasAnswered: true,
        // 是否强制临时组
        forceTempTeam: false,
        // 是否进组
        noTeam: false,
        // 是否再次编辑状态
        isEdit: false,
        retryTimes: 0,
        // 是否旁听生
        isGuestStudent: false,
        timer: null
      };
    },
    components: {
    },
    computed: {
      // 使用对象展开运算符将 getter 混入 computed 对象中
      ...mapState([
        'lesson',
        'cards',
      ]),
    },
    watch: {
      text(newValue, oldValue) {
        // 课程结束啦
        if(this.sendStatus === 5) {
          return this;
        }

        let value = newValue && newValue.substr(0, 1000);

        this.count = value && value.length || 0;
        this.text = value;

        if(this.count) {
          this.sendStatus === 0 && (this.sendStatus = 2);
          this.cacheResult();
        } else {
          !this.hasImage && (this.sendStatus = 0);
        }
      },
      sendStatus(newValue, oldValue) {
        if(newValue === 3) {
          this.submitText = this.$i18n.t('besending') || '正在发送';
        } else if(newValue === 1) {
          this.submitText = this.$i18n.t('picuploading') || '图片上传中';
        } else if(newValue === 2) {
          this.submitText = this.$i18n.t('submitansw') || '提交答案';
        } else if(newValue === 4) {
          this.submitText = this.$i18n.t('sendsuccess') || '发送成功';
        } else if(newValue === 5) {
          this.submitText = this.$i18n.t('classended') || '课程已结束';
        }
      },
      '$route' (to, from) {
        if(to && to.params && to.name === 'subjective-page') {
          let params = to.params;
          this.index = params.index

          let cards = this.cards;
          this.summary = cards[this.index];

          this.timer && clearInterval(this.timer)

          if(this.summary) {
            this.init(this.summary);
          } else {
            this.$router.back();
          }
        }
      },
    },
    filters: {
    },
    mixins: [ imagemixin ],
    methods: {
      ...mapActions([
        'setCards',
      ]),

      /*
      * @method 重置数据
      * @param
      */
      reset() {
        this.text = '';
        this.hasImage = false;
        this.loading = false;
        this.imageURL = '';
        this.imageThumbURL = '';
        this.fileData = null;
        this.ispreview =false;
        this.sendStatus = 0;
        this.teamVisible = false;
        this.answerType = 0;
        this.noTeam = false;
        this.timeOver =false;
        this.warning = false;
        // 重置的时候完成状态都为false
        this.isComplete = false;
        this.team = null
      },

      /*
      * @method 初始化习题页面
      * @param problemID 问题ID
      */
      init(data) {
        let problemID = data.problemID;

        if(!problemID) {
          return ;
        }

        this.reset();

        this.problemID = problemID;

        // event消息订阅
        this.initPubSub();

        let problem = this.$parent.$parent.problemMap.get(problemID);
        if(!problem ) {
          setTimeout(()=>{
            this.init(data);
          }, 1500)

          return this;
        }

        // TODO：检测这个问题是否分组
        let isTeam = data.groupid || false;
        isTeam && this.getTeamInfo(problemID);

        this.oProblem = problem['Problem'];
        // 问题分数
        let score = this.oProblem['Score'];
        let getScore = this.oProblem['getScore'];

        if(score && getScore > 0) {
          this.starCount = getScore / score * 5;
          this.getScore = getScore;
        }

        // 是否完成
        if(data.isComplete) {
          this.sendStatus = 5;
          this.ispreview = true;

          this.result = this.oProblem['Result'];

          this.getScoreFn(problemID);

          this.sLeaveTime = this.$i18n.t('done') || '已完成';
          this.isComplete = true;
        } else {
          // 开始启动定时
          this.$parent.$parent.startTiming({ problemID: problemID, msgid: this.msgid++ });
          this.limit = data.limit;

          // 恢复作答结果
          let sResult = localStorage.getItem('lessonsubjective'+problemID);
          if(sResult && !this.observerMode) {
            let result = JSON.parse(sResult);
            this.text = result.content;
            // 是否有图片
            if(result.pics.length) {
              this.hasImage = true;
              this.imageURL = result.pics[0].pic;
              this.imageThumbURL = result.pics[0].thumb;

              setTimeout(()=>{
                let imgEl = this.$el.querySelector('.pic-view .J_preview_img');
                imgEl.src = this.imageURL;
              }, 300)
            }

            this.sendStatus = 2;
          }

          if (process.env.NODE_ENV !== 'production') {
            // this.setTiming(data.limit)
          }
        }

        // 预加载图片
        let oImg = new Image();
        oImg.src = 'https://fe-static-yuketang.yuketang.cn/fe/static/vue_images/2.2.561/images/loading-3.gif';
      },

      /*
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

      /*
       * @method 是否小组作答，拉取小组列表，作答结果 是否可以提交答案
       * @param
       */
      getTeamInfo(problemID) {
        let URL = API.student.GET_GROUP_STATUS;
        let param = {
          'problem_id': problemID,
          'lesson_id': this.lessonID
        };

        // 小组作答
        this.answerType = 1;

        request.get(URL, param)
          .then((res) => {
            if(res && res.data) {
              let data = res.data;

              // 小组信息
              let team = data.team_info;
              // 当前学生是否进入分组
              let noTeam = team && team.no_team;
              // 学生是否作答过
              this.hasAnswered = data.user_answered;
              // 是否强制临时组作答
              this.forceTempTeam = data.user_force_temp_team;

              // 拉取小组成员
              team.team_id && this.getMembers(team.team_id);

              // 作答结果
              let problemResult = data.team_problem_result;
              if(problemResult) {
                let result = problemResult.team_result_data;
                this.text = result.content;
                // 计数
                this.text && (this.count = this.text.length);
                // 是否有图片
                if(result.pics && result.pics.length && result.pics[0].pic) {
                  this.hasImage = true;
                  this.imageURL = result.pics[0].pic;
                  this.imageThumbURL = result.pics[0].thumb;
                }

                this.result = result;
                this.ispreview = true;
              }

              // 未进组提示
              if(noTeam) {
                this.noTeam = true;
              }
            }
          })
          .catch((error) => {
            if(error.status_code == 604){
              this.isGuestStudent = true
            }
          });
      },

      /*
       * @method 小组成员
       * @param
       */
      getMembers(teamID) {
        let URL = API.student.GET_TEAM_DETAIL;
        let param = {
          'team_id': teamID
        };

        request.get(URL, param)
          .then((res) => {
            if(res && res.data) {
              let data = res.data;

              // 小组成员
              this.team = data;
            }
          });
      },

      /*
       * @method 是否小组有小组作答结果
       * @param
       */
      getTeamResult(problemID) {
        let URL = API.student.GET_GROUP_STATUS;
        let param = {
          'problem_id': problemID,
          'lesson_id': this.lessonID
        };

        request.get(URL, param)
          .then((res) => {
            if(res && res.data) {
              let data = res.data;

              let problemResult = data.team_problem_result;
              // 答案覆盖提示
              if(problemResult) {
                let msgOptions = {
                  confirmButtonText: this.$i18n && this.$i18n.t('submit') || '提交',
                  cancelButtonText: this.$i18n && this.$i18n.t('cancel') || '取消'
                };
                let title = this.$i18n && this.$i18n.t('team.teamhasanswer') || '已有人提交答案';
                let message = this.$i18n && this.$i18n.t('team.teamanswercover') || '已有本组同学提交了答案，提交后将会覆盖已提交的答案';

                this.$messagebox.confirm(message, title, msgOptions).
                then( action => {
                  if(action === 'confirm') {
                    this.sendSubjective();
                  }
                });
              } else {
                this.sendSubjective();
              }
            }
          });
      },

      handleshowTeam() {
        this.teamVisible = true;
      },

      handleclosedTeam() {
        this.teamVisible = false;
      },

      /*
       * @method 编辑答案
       * @param
       */
      handleedit() {
        this.ispreview = false;
        this.sendStatus = 2;
        this.isEdit = true;
      },

      /*
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

      /*
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

      /*
       * @method 是否点亮提交按钮
       * @params problem
       */
      canSubmitFn() {
        let hasResult = this.text || this.imageURL;

        if(!this.isComplete && hasResult) {
          this.sendStatus = 2;
        }
      },

      /*
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
          let sMsg = minutes > 0 ? this.$i18n.t('extendmin', { minutes: minutes }) || `题目续时 ${minutes}分钟` : this.$i18n.t('extendsec', { seconds: seconds }) || `题目续时 ${seconds}秒`;

          if(extend === -1) {
            sMsg = this.$i18n.t('notimelimit') || '题目不限时';
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

      /*
       * @method 收题
       * @params problemid
       */
      closedProblem(problemid) {
        if(problemid === this.problemID) {
          this.setTiming(0);
        }
      },

      /*
       * @method 获取主观题分数
       * @param
       */
      getScoreFn(problemID) {
        let URL = API.student.PROBLEM_SCORE;
        let param = {
          'problem_id': problemID,
          'lesson_id': this.lessonID
        };

        return request.get(URL, param)
          .then((res) => {
            if(res && res.data) {
              let data = res.data;

              this.getScore = data.score;

              return data;
            }
          });
      },

      /*
       * @method 缓存作答结果
       * @param
       */
      cacheResult() {
        // 定时保存
        clearTimeout(this.cacheTimer);
        this.cacheTimer = setTimeout(() => {
          // 缓存到本地
          let key = 'lessonsubjective'+this.summary.problemID;
          let result = {
            'content': this.text,
            'pics': []
          };

          if(this.imageURL) {
            result.pics.push({
              'pic': this.imageURL,
              'thumb': this.imageThumbURL
            });
          }

          localStorage.removeItem(key);
          localStorage.setItem(key, JSON.stringify(result));
        }, 3000)
      },

      /*
      * @method 发送主观题
      * @param
      */
      sendSubjective() {
        let self = this;
        let problemID = this.summary.problemID;
        let URL = API.student.ANSWER_LESSON_PROBLEM;
        const content = this.text.replace(/^\s+|\s+$/g, '');

        // 是否超时
        if(this.timeOver) {
          this.$toast({
            message: this.$i18n.t('timeoutnosubmit') || '时间已过，不能再提交啦～',
            duration: 3000
          });

          self.sendStatus = 4;
          return this;
        }

        // 发送中
        this.sendStatus = 3;

        const startTime = Math.ceil(this.summary.time/1000);
        const endTime = Math.ceil(+new Date()/1000);
        // 持续多少秒
        const duration = endTime - startTime;
        const retryTimes = 0;

        let param = {
          'duration': duration,
          'startTime': startTime,
          'submit_time': endTime,
          'lesson_problem_id': problemID,
          'result': {
            'content': content,
            'pics': [ { 'pic': this.imageURL, 'thumb': this.imageThumbURL} ]},
          'retry_times': retryTimes
        };

        this.oProblem['Result'] = param['result'];
        let problem = self.$parent.$parent.problemMap.get(problemID)

        console.log(param);

        return request.post(URL, param)
          .then((res) => {
            if(res && res.data) {
              let data = res.data;

              // 先处理异常状态
              if(data.status_code === 4) {
                // 此题已经作答过
                this.$toast({
                  message: '此题已经作答过',
                  duration: 2000
                });
              } else if(data.status_code === 2) {
                // 用户由于接口时间太长超时了
                this.$toast({
                  message: `提交失败(错误码：${data.status_code})`,
                  duration: 2000
                });

                this.sendStatus = 4;
                this.oProblem['Result'] = null;
                return this;
              } else {
                this.$toast({
                  message: this.$i18n.t('sendsuccess') || '提交成功',
                  duration: 2000
                });
              }

              self.sendStatus = 4;

              self.summary = Object.assign(self.summary, {
                status: this.$i18n.t('done') || '已完成',
                isComplete: true
              })

              // 替换原来的数据
              self.cards.splice(self.index, 1, self.summary);
              self.setCards(self.cards);

              problem = Object.assign(problem, {
                'Problem': self.oProblem
              })
              self.$parent.$parent.problemMap.set(problemID, problem);

              clearInterval(self.timer);

              this.sLeaveTime = this.$i18n.t('done') || '已完成';
              this.isComplete = true;

              // setTimeout(() => {
              //   self.$router.back();
              // }, 2000)

              return data;
            }
          })
          .catch(error => {
            // 提交失败保存本地
            self.saveAnswer(param);
            self.$toast({
              message: self.$i18n.t('neterrorpush') || '当前网络不畅，请检查系统已保存并将自动重复提交',
              duration: 3000
            });
          });
      },

      /*
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

      /*
       * @method 上传图片
       * @param
       */
      uploadImage(data, fileType) {
        let self = this;
        let URL = API.student.UPLOAD_PIC;
        let params = {
          'pic_type': ''
        };

        let picType = fileType && fileType.split('/').length === 2 && fileType.split('/')[1];
        // let sBase64 = data.substr(data.indexOf(',') + 1);
        // params['pic_data'] = sBase64;
        // params['pic_type'] = picType;

        // jpg,jpeg,bmp,png,gif
        if(!/png|jpg|jpeg/.test(picType)) {
          this.$toast({
            message: this.$i18n.t('reuploadpiconly') || '当前仅支持图片格式，请重新上传',
            duration: 2000
          });

          this.imageURL = '';
          this.imageThumbURL = '';
          this.hasImage = false;

          return this;
        }

        this.sendStatus = 1;

        // 上传七牛
        Promise.all([upload.getToken()]).
        then(() => {
          let randomNumber = parseInt(Math.random()*10000, 10);
          let fileName = `${this.lessonID}${data.length}${randomNumber}.${picType}`;
          // let file = dataURLtoFile(data, fileName);
          // data.name = fileName;
          this.uploadFile(data).
          then((res)=>{
            if(res.url) {
              this.imageURL = res.url;
              this.imageThumbURL = `${res.url}?imageView2/2/w/568`;
              this.sendStatus = 2;

              this.cacheResult();
            } else {
              this.retryUpload(data, fileType);
            }
          }).
          catch(error => {
            this.retryUpload(data, fileType);
          });
        });

        // return request.post(URL, params)
        //   .then( (res) => {
        //     if(res && res.data) {
        //       let data = res.data;

        //       self.imageURL = data.pic_url;
        //       self.imageThumbURL = data.thumb_url
        //       self.sendStatus = 2;

        //       self.cacheResult();

        //       return self.imageURL;
        //     }
        //   }).catch(error => {
        //     self.retryUpload(data, fileType);

        //     return null;
        //   });
      },

      /**
       * method 上传七牛
       * params
       */
      uploadFile(file) {
        let domain = upload.qiniuDomain;

        return new Promise((resolve, reject)=>{
          let observer = {
            next(res) {
              let total = res.total;
              let percent = total.percent;

              console.log("进度：" + percent + "% ");
            },
            error(err) {
              console.log(err);
              reject({ url: '' });
            },
            complete(res) {
              console.log(res);
              let url = domain + res.key;

              console.log("url:" + url);
              resolve({ url });
            }
          };

          upload.upload(file, observer);
        });
      },

      /*
       * @method 上传图片失败重试策略
       * @param
       */
      retryUpload(data, fileType) {
        // 重试次数
        let retryTimes = this.retryTimes + 1;

        if(retryTimes < 4) {
          setTimeout(()=>{
            this.uploadImage(data, fileType);
          }, 2000 * retryTimes)

          this.retryTimes = retryTimes;
        } else {
          this.$toast({
            message: this.$i18n.t('networkerror') || '网络不佳，图片上传失败，请重新上传',
            duration: 3000
          });

          // 帮用户清空上传
          this.hasImage = false;
          this.imageURL = '';
          this.imageThumbURL = '';
          this.text && (this.sendStatus = 2);
          this.retryTimes = 0;
        }
      },

      /*
       * @method 选择拍照后触发事件
       * @param
       */
      handleChooseImageChange(evt) {
        let self = this;
        let targetEl = typeof event !== 'undefined' && event.target || evt.target;
        let imgEl = this.$el.querySelector('.pic-view .J_preview_img');

        let file = targetEl.files[0];
        let fileType = file.type;

        console.log('MIME类型：' + fileType);
        // 课程结束啦
        if(this.sendStatus === 5) {
          return this;
        }

        if(file.size) {
          const size = parseInt(file.size/1024/1024, 10);

          if(size >= 10) {
            this.$toast({
              message: this.$i18n.t('picsizelimit') || '图片不可超过10M，请重试',
              duration: 2000
            });

            return this;
          }
        }

        // 图片处理参数
        let options = {
          compress: {
            width: 1600,
            height: 1600,
            quality: .6
          }
        };

        // 压缩 浏览器旋转 微信崩溃等问题
        this.hasImage = true;
        this.imageThumbURL = 'https://fe-static-yuketang.yuketang.cn/fe/static/vue_images/2.2.561/images/loading-3.gif';
        this.uploadImage(file, fileType);
        // compress(file, options, function(dataUrl) {
        //   if(dataUrl) {
        //     self.fileData = dataUrl;

        //     // 上传图片
        //     self.uploadImage(dataUrl, fileType, file.name);
        //     // self.hasImage = true;
        //   }
        // });
      },

      /*
       * @method 选择拍照后触发事件
       * @param type 1 ppt图片 2 上传图片 3 完成后预览
       */
      handlelaodImg(type, evt) {
        let target = typeof event !== 'undefined' && event.target || evt.target;

        let width = target.naturalWidth || target.width;
        let height = target.naturalHeight || target.width;
        let rate = width/height;

        if(type === 1) {
          this.pptRate = rate;
          this.pptWidth = width;
          this.pptHeight = height;
        } else if(type === 2) {
          this.rate = rate;

          this.width = width;
          this.height = height;
        } else if(type === 3) {
          rate > 1 && (target.style.width = '100%');
          this.width = width;
          this.height = height;
        }
      },
      handleDeleteImg() {
        let self = this;

        this.$messagebox.confirm(this.$i18n.t('cfmdelpic') || '确定删除图片?').then(action => {
          if(action === 'confirm') {
            self.hasImage = false;
            self.imageURL = '';
            self.imageThumbURL = '';

            !self.text && (self.sendStatus = 0);
          }
        });
      },

      /*
       * @method 图片放大
       * @param
       */
      handleScaleImage(type, evt) {
        let targetEl = evt.target;
        // let pswpElement = this.$el.querySelector('.J_submission_pswp');
        let pswpElement = document.querySelector('.J_pswp');
        let index = 0;
        let items = [];
        let src = this.fileData || this.imageURL;
        let width = this.width;
        let height = this.height;

        if(type === 1 || type === 3) {
          src = targetEl.src;
        }

        if(type === 1) {
          width = this.pptWidth;
          height = this.pptHeight;
        }

        // build items array
        items.unshift({ src: src, w: width || 750, h: height });

        let options = {
          index: 0,
          maxSpreadZoom: 5,
          showAnimationDuration: 300,
          hideAnimationDuration: 300,
          showHideOpacity: true,

          closeEl: false,
          captionEl: false,
          fullscreenEl: false,
          zoomEl: false,
          shareEl: false,
          counterEl: false,
          arrowEl: false,
          preloaderEl: false,

          tapToClose: true,

          getThumbBoundsFn: function(index) {
            // find thumbnail element
            var thumbnail = targetEl;

            // get window scroll Y
            var pageYScroll = window.pageYOffset || document.documentElement.scrollTop;
            // optionally get horizontal scroll

            // get position of element relative to viewport
            var rect = thumbnail.getBoundingClientRect();

            // w = width
            return {x:rect.left, y:rect.top + pageYScroll, w:rect.width};

          }
        };

        // Initializes and opens PhotoSwipe
        let gallery = new PhotoSwipe(pswpElement, PhotoSwipeUI_Default, items, options);

        gallery.init();
      },
      handleSend() {
        // 是否可以提交
        // 是否小组作答
        // 小组作答先看下有没有人提交 提示覆盖信息

        if(this.sendStatus === 2) {
          if(this.answerType === 1 && !this.isEdit) {
            // 是否进组
            if(this.noTeam || this.forceTempTeam) {
              let msgOptions = {
                confirmButtonText: this.$i18n && this.$i18n.t('confirm') || '确定',
                cancelButtonText: this.$i18n && this.$i18n.t('cancel') || '取消'
              };
              let title = this.$i18n && this.$i18n.t('team.noteam') || '未进组';
              let message = this.$i18n && this.$i18n.t('team.tempteamtip');

              if(this.forceTempTeam) {
                message = this.$i18n && this.$i18n.t('team.forcetempteamtip');
              }

              this.$messagebox.confirm(message, title, msgOptions).
              then( action => {
                if(action === 'confirm') {
                  this.sendSubjective();
                }
              });
            } else {
              this.getTeamResult(this.summary.problemID);
            }
          } else {
            this.sendSubjective();
          }
        }
      },
      handleBack() {
        this.$router.back();
      }
    },
    created() {
      this.index = +this.$route.params.index;

      this.lessonID = this.lesson && this.lesson.lessonID;
      let cards = this.cards;
      this.summary = cards[this.index];

      if(this.summary) {
        this.init(this.summary);
      } else {
        this.$router.back();
      }

    },
    mounted() {
    },
    beforeDestroy() {
      this.timer && clearInterval(this.timer)
    }
  };
</script>

<style lang="scss" scoped>
  .page-subjective {
    position: relative;
    width: 100%;
    height: 100%;

    display: flex;
    justify-content: center;
    align-items: center;
  }

  .subjective-wrapper {
    width: 375px;
    // height: 667px;
    height: 100%;

    background: #fff;
    border: 2px solid #eee;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }

  .page__header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    height: 50px;
    padding: 0 20px;
  }

  .problem-tag {
    border-left: 15px solid #4A90E2;
  }

  .subjective__header {
    z-index: 1;
    position: fixed;
    top: 0;
    left: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;

    padding: 0 17px;
    width: 100%;
    height: 50px;
    color: #2A2A2A;
    background: #fff;
    box-shadow: 0 4px 6px rgba(0,0,0, 0.2);

    .heade-action {
      min-width: 25px;
      color: #639EF4;
    }

    .subjective--back {
      margin-left: -9px;
      color: #4a4a4a;
    }

    .heade-action.disable {
      color: #999999;
    }

    .heade-action:active:not(.disable) {
      color: rgba(99,158,244,0.7);
    }
  }



  .submit-btn {
    margin: 10px auto 15px;
    width: 290px;
    height: 44px;
    line-height: 44px;

    color: #fff;
    background: #639EF4;
    border-radius: 4px;
  }

  .submit-btn.disable {
    background: #9B9B9B;
  }

  .submit-btn:active:not(.disable) {
    background: rgba(99,158,244,0.7);
  }


  /*------------------*\
    $ 习题内容
  \*------------------*/

  .subjective-content {
    // padding-top: 61.8px;

    .content_wrapper {
      position: relative;
      margin: 10px 0 10px;
      background: #fff;
      overflow: hidden;
    }

    .content__header {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: flex-start;

      padding-right: 15px;
      width: 100%;
      height: 45px;
      color: #4A4A4A;
       background: #fff;

      .header-item {
        margin-left: 15px;
        text-align: center;
      }
    }

    .page-no {
      position: absolute;
      top: 0;
      right: 1px;

      padding: 0 12px;
      height: 25px;
      line-height: 25px;
      color: #fff;

      background: rgba(0,0,0,0.5);
    }

    .cover {
      display: block;
      width: 100%;
    }
  }


  .subjective__answer--lable {
    padding: 0 17px 17px;
    color: #333;
    font-weight: normal;
    text-align: left;

    .tip {
      color: #9B9B9B;
    }
  }

  .answer__header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
  }

  .subjective-inner {
    background: #fff;
  }


  /*------------------*\
    $ 投稿文字
  \*------------------*/

  .submission__text {
    position: relative;
    margin: 0 17px 10px;

    background: #fff;
    border-bottom: 1px solid #C8C8C8;

    .submission-textarea {
      margin-bottom: 20px;
      padding: 10px;

      width: 100%;
      height: 160px;
      border-width: 0;
      -webkit-user-select: auto;
    }

    .submission-textarea::-webkit-input-placeholder {
      color: #9B9B9B
    }

    .submission-footer {
      position: absolute;
      bottom: 5px;
      right: 2.5px;

      color: #9B9B9B
    }

  }



  /*------------------*\
    $ 图片
  \*------------------*/

  .submission__pic {
    margin: 40px auto 10px;
    padding-bottom: 75px;

    .submission__pic--add {
      position: relative;
      margin: 0 auto;
      width: 72px;
      height: 72px;

      border: 2px solid #C8C8C8;
      border-radius: 4px;

      .camera {
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        width: 100%;
        opacity: 0;
      }
    }

    .submission__pic--add:before,
    .submission__pic--add:after {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: 37px;
      height: 2px;

      transform: translate(-50%, -50%);

      background: #C8C8C8;
    }

    .submission__pic--add:after {
      width: 2px;
      height: 37px;
    }

    .submission__pic--remark {
      padding-top: 15px;
      color: #C8C8C8;
    }

    .pic-view {
      position: relative;
      margin: 0 auto;
      width: 250px;
      height: 250px;

      background: #C8C8C8;
      overflow: hidden;

      img {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
      }

      .pic--loading {
        width: 75%;
      }

      .img--loading {
        width: 70px;
      }

      .higher {
        max-width: 100%;
      }

      .wider {
        max-height: 100%;
      }

      .delete-img {
        position: absolute;
        top: 0;
        right: 0;

        width: 29px;
        height: 29px;
        line-height: 28px;

        color: #fff;
        background: rgba(0,0,0,0.6);
      }

    }

  }


  /*------------------*\
    $ 作答完成预览
  \*------------------*/

  .subjective__answer {
    margin-bottom: 40px;
    padding: 12.5px 15px;
    color: #333;
    background: #fff;

    .answer__inner {
      padding: 0 7px 15px;
      border-bottom: 1px solid #C8C8C8;
    }

    .answer--text {
      text-align: left;
      word-wrap: break-word;
    }

    .answer--image {
      padding-top: 10px;
      img {
        display: block;
        width: 260px;
        max-width: 100%;
      }
    }

    .answer-score {
      padding: 10px 7.5px 0;
      color: #9B9B9B;
      text-align: left;

      .lable {
        vertical-align: 2.5px;
      }

      .iconfont {
        color: #F5A623;
      }

      .iconfont.blue {
        color: #639EF4;
      }
    }

  }


  /*------------------*\
    $ 小组详情
  \*------------------*/

  .team__intro {
    display: flex;
    align-items: center;
    justify-content: space-between;

    margin: 5px 0;
    padding: 0 20px;
    height: 65px;
    line-height: 65px;
    background: #fff;

    .team__intro--name {
      flex: 1;
      text-align: left;
    }
  }

  .team__tip {
    display: flex;
    justify-content: center;
    align-items: flex-start;
    margin-top: -40px;
    padding: 0 20px 30px;
    text-align: justify;

    background: #fff;
  }

  .members--closed {
    height: 50px;
    line-height: 50px;
    padding: 0 15px;
    text-align: left;
    border-bottom: 1px solid #C8C8C8;
  }

  .team__members {
    z-index: 1;
    position: fixed;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);

    width: 375px;
    height: 75vh;
    overflow-y: auto;
    background: #fff;

    .members__header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 20px 10px;

      .members__title {
        font-weight: bold;
      }
    }

    .member__info {
      display: flex;
      justify-content: flex-start;
      align-items: center;

      padding-left: 20px;
      height: 56px;
      line-height: 56px;

      .member--avatar {
        display: block;
        width: 35px;
        height: 35px;
        border-radius: 50%;
      }

      .member--name {
        flex: 1;
        text-align: left;
        border-bottom: 1px solid #eee;

        .name {
          padding-left: 15px;
        }
      }
    }
  }

  .members__wrap:after {
    content: '';
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;

    background: rgba(0,0,0,0.45);
  }


</style>

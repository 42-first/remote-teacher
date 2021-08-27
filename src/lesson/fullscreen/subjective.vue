/*
 * @page：学生接收器主观题作答页面
 * @author: chenzhou
 * @update: 2017.8.8
 * @desc 小组作答 websocket命令是否是小组作答
 *
 */

<template>
  <section class="page-subjective">
    <section class="page-container">

      <!-- 问题内容 cover -->
      <div class="content_wrapper J_container box-center">
        <!-- <p class="page-no f12"><span>第{{ summary&&summary.pageIndex }}页</span></p> -->
        <slide v-if="summary" :item="summary" :canSubmit="sendStatus" @clickanswer="handleShowAnswer" :limit="limit" :sLeaveTime="sLeaveTime" :hasNewExtendTime="hasNewExtendTime" :timeOver="timeOver" :warning="warning" :sExtendTimeMsg="sExtendTimeMsg" :isComplete="isComplete"></slide>
        
      </div>
    </section>

    <section class="answer__wrapper" :class="ispreview ? 'nopb' : ''" v-show="rightType == 'subject'">
      <header class="answer__header box-between">
        <span class="blue f14"><!-- 主观题作答 --> {{ $t('answerarea') }} </span>
        <i class="iconfont icon-guanbi2 f16 c9b pointer" @click="handleCloseAnswer"></i>
      </header>
      <section class="answer__content">
        <!-- 得分 -->
        <div class="score-box" v-if="ispreview && result">
          <div class="box-between">
            <p class="answer--label bold c333"><!-- 得分 --> {{ $t('stuscore') }} </p>
            <p class="f12 c9b bold"><!-- 本题总分{{totalScore / 100}}分 --> {{ $t('newtotalscore', {total: totalScore / 100}) }} </p>
          </div>
          
          <div class="score f20 orange bold">
            <template v-if="getScore > -1">
              <span class="f40">{{getScore}}</span><!-- 分 --> {{ $t('stutestscore') }} 
            </template>
            <span v-else><!-- 未打分 --> {{ $t('ungrade') }} </span>
          </div>
          <div class="grade-tips f14 orange mt20" v-if="isReview">
            <!-- * 本题得分由互评分数和教师评分构成，当前分数可能不是最终得分 -->{{ $t('reviewtip') }}
          </div>
        </div>
        
        <!-- 小组提示 -->
        <div class="team__tip" v-show="answerType && !hasAnswered">
          <!-- 由于获取小组信息状态接口不再处理旁听生的异常 优先展示旁听生提示 -->
          <p v-if="isGuestStudent">{{ $t('team.guestStudent') }}</p>
          <p v-else-if="noTeam"><!-- 当前题目为小组作答，您还没有进组 -->{{ $t('team.withoutteamhint') }}</p>
          <p v-else-if="forceTempTeam">{{ $t('team.forcetempteam') }}</p>
          <p v-else>{{ $t('team.groupansweredtip') }}</p>
        </div>
        <!-- 小组成员 -->
        <team-cmp v-if="answerType && team && !noTeam && !isGuestStudent" :team="team"></team-cmp>
        <!-- 编辑状态-->
        <div class="subjective-inner" v-if="!ispreview">
          <!-- 文字编辑 -->
          <section class="submission__text" :class="{'focus': isFocus}">
            <textarea class="submission-textarea J_feed_content f14" maxlength="1000" :placeholder="$t('subjectivetext')" v-model="text" @focus="isFocus = true" @blur="isFocus = false"></textarea>
            <p class="count">({{count}}/1000)</p>
          </section>
          <!-- 图片 -->
          <section class="submission__pic">
            <div style="text-align: left;" v-if="!hasImage&&!loading">
              <div class="submission__pic--add f12" >
                <input type=file accept="image/jpeg,image/png,image/jpg" class="camera" :disabled="lessonStatus ? true : false" @change="handleChooseImageChange" >
                <i class="iconfont icon--tianjiatupiancopy f16"></i><!-- 添加图片 --> {{ $t('addpic') }} 
              </div>
            </div>
            <div class="pic-view" v-show="hasImage||loading">
              <div class="image__item">
                <img class="image--thumb J_preview_img" alt="" v-show="hasImage" :src="fileData||imageURL" @click="handleScaleImage($event)" v-if="imageURL" />
                <div class="donut"  v-else>
                  <i class="iconfont f40 icon--jiazaiwubaidi1"></i>
                  <!-- 正在上传 --> {{ $t('uploading') }} 
                </div>
                <p class="delete-img" @click="handleDeleteImg" v-show="hasImage && imageURL"><i class="iconfont icon-ykq_shanchu f18"></i></p>
              </div>
            </div>
          </section>
        </div>
        <!-- 预览状态 -->
        <div class="subjective__answer" v-if="ispreview && result">
          <p v-if="!answerType" class="answer--label c333 bold"><!-- 我的答案 --> {{ $t('myanswer') }} </p>
          <div class="box-between" v-else>
            <span class="c333 bold"><!-- 本组答案 --> {{ $t('teamanswer') }} </span>
            <span class="f12 c9b">
              <!-- 最后提交： --> {{ $t('lastsubmit') }} {{lastSubmitInfo.time | formatTime('MM-DD HH:mm')}} {{lastSubmitInfo.user}}
              <i class="iconfont icon-bianji f25 blue" v-if="!hasAnswered" @click="handleedit"></i>
            </span>
          </div>
          <div class="answer__inner">
            <p class="answer--text f17">{{ result.content }}</p>
            <div class="answer--image" v-if="result.pics.length && result.pics[0].pic">
              <ul class="pic-view">
                <li class="image__item" v-for="(item,index) in result.pics" :key="index">
                  <img class="image--thumb" :src="item.pic" :data-src="item.pic" alt="雨课堂" v-if="item.pic" @click="handleScaleImage($event)"/>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
      
      <div class="btn-box" v-show="!ispreview">
        <p :class="['submit-btn', 'f14', sendStatus === 0 || sendStatus === 1 || sendStatus >= 4 || isGuestStudent ? 'disable': '']" v-if="!ispreview" @click="handleSend">{{sendStatus | setSubmitText}}</p>
      </div>
    </section>
  </section>
</template>

<script>
  import { mapState, mapActions } from 'vuex'
  import moment from 'moment'

  import API from '@/util/api'
  import {compress} from '@/util/image'
  import { isSupported } from '@/util/util'
  import { configWX } from '@/util/wx-util'
  import upload from '@/util/upload'
  import problemControl from '@/lesson/fullscreen/mixin/problem-control'
  import slide from './components/slide'
  import imagemixin from './mixin/image-mixin.js'

  import teamCmp from './components/team.vue'

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
        problemType: 5,
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
        // // 是否旁听生 从store中获取
        // isGuestStudent: false,
        timer: null,
        isFocus: false,
        lastSubmitInfo: {},
        // 该提是否发起了互评
        isReview: false,
        // 本题总分
        totalScore: 0,
      };
    },
    components: {
      slide,
      teamCmp
    },
    computed: {
      // 使用对象展开运算符将 getter 混入 computed 对象中
      ...mapState([
        'lesson',
        'cards',
        'isGuestStudent',
        'observerMode',
        'rightType',
        'lessonStatus'
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
        if(to && to.params && to.name === 'subjective') {
          let params = to.params;
          this.index = params.index

          let cards = this.cards;
          this.summary = cards[this.index];

          this.endTiming()
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
      setSubmitText(sendStatus){
        let text = i18n.t('submitansw') || '提交答案'
        switch(sendStatus){
          case 0:
          case 2: 
            text = i18n.t('submitansw') || '提交答案';
            break;
          case 3:
            text = i18n.t('submiting') || '提交中...';
            break;
          case 4:
            text = i18n.t('submitok') || '提交成功';
            break;
          case 5:
            text = i18n.t('classended') || '课程已结束';
            break;
        }
        return text
      },
      formatTime(time, format) {
        return moment(time).format(format || 'YYYY-MM-DD HH:mm');
      },
    },
    mixins: [ problemControl, imagemixin ],
    methods: {
      ...mapActions([
        'setCards',
        'setRightType'
      ]),

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
        isTeam && this.getTeamInfo(problemID, data.groupid);

        this.oProblem = problem['problem'];
        // 问题分数
        let score = this.oProblem['score'];
        let getScore = this.oProblem['getScore'];

        if(score && getScore > 0) {
          this.getScore = getScore;
        }

        this.totalScore = score

        // 是否观察者模式
        if(this.observerMode) {
          this.sendStatus = 5;
        }

        // 是否完成
        if(data.isComplete) {
          this.sendStatus = 5;
          this.ispreview = true;

          this.result = this.oProblem['result'];

          !getScore && this.getScoreFn(problemID);

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
        }

        // 预加载图片
        let oImg = new Image();
        oImg.src = '/vue_images/images/loading-3.gif';
      },

      /*
       * @method 是否小组作答，拉取小组列表，作答结果 是否可以提交答案
       * @param
       */
      getTeamInfo(problemID, groupID) {
        let URL = API.lesson.get_group_status;
        let param = {
          'problem_id': problemID,
          'group_id': groupID
        };

        // 小组作答
        this.answerType = 1;

        request.get(URL, param)
          .then((res) => {
            if(res && res.code == 0 && res.data) {
              let data = res.data;

              // 小组信息
              let team = data.teamInfo;
              // 当前学生是否进入分组
              let noTeam = team && !+team.teamId;
              // 学生是否作答过
              this.hasAnswered = data.userAnswered;
              // 是否强制临时组作答
              this.forceTempTeam = data.user_force_temp_team;

              // 拉取小组成员
              team.teamId && this.getMembers(team.teamId);

              // 作答结果  未作答时返回的是{}
              let problemResult = data.lastResult.result;
              if(problemResult && data.lastResult.lastAnswerUserId) {
                this.text = problemResult.content;
                // 计数
                this.text && (this.count = this.text.length);
                // 是否有图片
                if(problemResult.pics && problemResult.pics.length && problemResult.pics[0].pic) {
                  this.hasImage = true;
                  this.imageURL = problemResult.pics[0].pic;
                  this.imageThumbURL = problemResult.pics[0].thumb;
                }

                this.result = problemResult;
                this.ispreview = true;

                this.lastSubmitInfo = {
                  time: data.lastResult.submitTime,
                  user: data.lastResult.lastAnswerUserName.length > 5 ? data.lastResult.lastAnswerUserName.substring(0,5) + '...' : data.lastResult.lastAnswerUserName
                }
              }

              // 未进组提示
              if(noTeam) {
                this.noTeam = true;
              }
            }
          })
          .catch((error) => {
            console.log('getTeamInfo:', error)
          });
      },

      /*
       * @method 小组成员
       * @param
       */
      getMembers(teamID) {
        let URL = API.lesson.get_team_detail;
        let param = {
          'team_id': teamID
        };

        request.get(URL, param)
          .then((res) => {
            if(res && res.code == 0 && res.data) {
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
      getTeamResult(problemID, groupID) {
        let URL = API.lesson.get_group_status;
        let param = {
          'problem_id': problemID,
          'group_id': groupID
        };

        request.get(URL, param)
          .then((res) => {
            if(res && res.code === 0 && res.data) {
              let data = res.data;

              let problemResult = data.lastResult.lastAnswerUserId;
              // 答案覆盖提示
              if(problemResult) {
                this.$rainConfirm({
                  data: {
                    title: this.$i18n && this.$i18n.t('team.teamhasanswer') || '已有人提交答案',
                    message: this.$i18n && this.$i18n.t('team.teamanswercover') || '已有本组同学提交了答案，提交后将会覆盖已提交的答案',
                    showCancel: true,
                    confirmText: this.$i18n && this.$i18n.t('submit') || '提交',
                    cancelText: this.$i18n && this.$i18n.t('cancel') || '取消',
                  },
                  cancel: () => {
                  },
                  confirm: () => {
                    this.sendSubjective();
                  },
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
       * @method 获取主观题分数
       * @param
       */
      getScoreFn(problemID) {
        let URL = API.lesson.get_problem_answer;
        let param = {
          'problem_id': problemID
        };

        request.get(URL, param)
        .then((res) => {
          if(res && res.code === 0 && res.data) {
            let data = res.data;

            this.getScore = data.score > 0 ? data.score/100 : data.score;
            this.isReview = data.isReview
          }
        })
        .catch(error => {
        });
      },

      /*
       * @method 缓存作答结果
       * @param
       */
      cacheResult() {
        // 定时保存
        this.cacheTimer && clearTimeout(this.cacheTimer);
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

          if(isSupported) {
            localStorage.removeItem(key);
            localStorage.setItem(key, JSON.stringify(result));
          }
        }, 3000)
      },

      /*
      * @method 发送主观题
      * @param
      */
      async sendSubjective() {
        let self = this;
        let problemID = this.problemID;
        let problem = this.$parent.$parent.problemMap.get(problemID)
        const content = this.text.replace(/^\s+|\s+$/g, '');

        // 是否超时
        if(this.timeOver) {
          this.$toast({
            message: this.$i18n.t('timeoutnosubmit') || '时间已过，不能再提交啦～',
            duration: 3000
          });

          this.sendStatus = 4;
          return this;
        }

        // 发送中
        this.sendStatus = 3;
        let params = {
          'problemId': problemID,
          'problemType': this.problemType,
          'dt': +new Date(),
          'result': {
            'content': content,
            'pics': [ { 'pic': this.imageURL, 'thumb': this.imageThumbURL} ]
          }
        };

        const code = await this.submit(params);
        if(code === 0) {
          this.$toast({
            message: this.$i18n.t('sendsuccess') || '提交成功',
            duration: 2000
          });

          this.summary = Object.assign(this.summary, {
            status: this.$i18n.t('done') || '已完成',
            isComplete: true
          })
          // 替换原来的数据
          this.cards.splice(this.index, 1, this.summary);
          this.setCards(this.cards);

          if(problem['problem']) {
            problem['problem']['result'] = params['result'];
            this.$parent.$parent.problemMap.set(problemID, problem);
          }

          this.sendStatus = 4;
          this.sLeaveTime = this.$i18n.t('done') || '已完成';
          this.isComplete = true;
          this.ispreview = true

          this.result = params['result']
          this.endTiming()

          this.answerType && !this.hasAnswered && this.getTeamInfo(this.problemID, this.summary.groupid)
        } else if(code === 50028) {
          this.$toast({
            message: '此题已经作答过',
            duration: 2000
          });
        } else if(code === -1) {
          // 提交失败保存本地
          this.saveAnswer(params);
          this.$toast({
            message: this.$i18n.t('neterrorpush') || '当前网络不畅，请检查系统已保存并将自动重复提交',
            duration: 3000
          });

          this.isComplete = true;
          this.oProblem['result'] = null;

          // 统计失败率
          typeof MtaH5 !== 'undefined' && MtaH5.clickStat('submissionfailed',{'pid': problemID});
        } else {
          // 用户由于接口时间太长超时了
          this.$toast({
            message: `提交失败(错误码：${code})`,
            duration: 2000
          });

          this.sendStatus = 4;
          this.oProblem['result'] = null;

          return this;
        }
      },

      /*
       * @method 选择拍照后触发事件
       * @param type 1 ppt图片 2 上传图片 3 完成后预览
       */
      handleLoadImg(type, evt) {
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
        this.$rainConfirm({
          data: {
            title: this.$i18n.t('tips') || "提示",
            message: this.$i18n.t('cfmdelpic') || '确定删除图片?',
            showCancel: true,
            confirmText: '删除',
            cancelText: '取消',
            confirmClass: 'del',
            reverse: true
          },
          cancel: () => {
          },
          confirm: () => {
            self.hasImage = false;
            self.imageURL = '';
            self.imageThumbURL = '';

            !self.text && (self.sendStatus = 0);
          },
        });
      },

      handleSend() {
        // 是否可以提交
        // 是否小组作答
        // 小组作答先看下有没有人提交 提示覆盖信息

        // 小组作答 旁听生身份不能提交
        if(this.answerType && this.isGuestStudent) {
          return this;
        }

        if(this.sendStatus === 2) {
          if(this.answerType === 1) {
            // 是否进组
            if(this.noTeam || this.forceTempTeam) {
              let message = this.$i18n && this.$i18n.t('team.tempteamtip');

              if(this.forceTempTeam) {
                message = this.$i18n && this.$i18n.t('team.forcetempteamtip');
              }

              this.$rainConfirm({
                data: {
                  title: this.$i18n.t('team.noteam') || '未进组',
                  message: message,
                  showCancel: true,
                  confirmText: this.$i18n.t('confirm') || '确定',
                  cancelText: this.$i18n.t('cancel') || '取消',
                  confirmClass: ''
                },
                cancel: () => {
                },
                confirm: () => {
                  this.sendSubjective();
                },
              });

            } else {
              this.getTeamResult(this.problemID, this.summary.groupid);
            }
          } else {
            this.sendSubjective();
          }
        }
      },
      handleBack() {
        this.$router.back();
      },

      handleShowAnswer(){
        this.setRightType('subject')
      },
      handleCloseAnswer(){
        this.setRightType('')
      },
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
      this.timer && clearInterval(this.timer);
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

  .page-container {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
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

  .content_wrapper {
    width: 100%;
    height: 100%;
  }

  .answer__wrapper {
    width: 380px;
    height: calc(100% - 40px);
    background: #fff;
    position: fixed;
    right: 0;
    top: 40px;
    display: flex;
    flex-direction: column;
    padding: 40px 0 70px;
    &.nopb {
      padding-bottom: 0;
    }
  }

  .answer__header {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 40px;
    line-height: 40px;
    padding: 0 15px;

    text-align: left;
    border-bottom: 1px solid #ddd;
  }

  .answer__content {
    flex: 1;
    overflow-y: auto;
  }

  .orange {
      color: #FEA300;
    }
  .score-box {
    padding: 20px 0;
    margin: 0 20px;
    border-bottom: 1px solid #ddd;
    margin-bottom: 20px;
    .score {
      margin: 40px 0 20px;
      height: 56px;
      vertical-align: bottom;
    }
    .grade-tips {
      padding: 10px 20px;
      text-align: left;
      background: rgba($color: #FEA300, $alpha: .1);
      line-height: 20px;
    }
  }

  .subjective__answer, .subjective-inner {
    padding: 0 20px;
    margin-top: 10px;
  }

  /*------------------*\
    $ 投稿文字
  \*------------------*/

  .submission__text {
    position: relative;
    padding: 10px 0 26px 10px;
    height: 290px;
    border-radius: 2px;
    border: 1px solid #ddd;
    &.focus {
      border-color: #9b9b9b;
    }

    .submission-textarea {
      font-size: 16px;
      color: #666;
      width: 100%;
      height: 245px;
      border-width: 0;
      -webkit-user-select: auto;
      background: transparent;
      padding-right: 10px;
    }

    .submission-textarea::-webkit-input-placeholder {
      color: #9B9B9B
    }

    .count {
      position: absolute;
      bottom: 9px;
      right: 20px;
      font-size: 14px;
      color: #9b9b9b;
    }

  }



  /*------------------*\
    $ 图片
  \*------------------*/

  .submission__pic {
    margin: 10px 0 20px;

    .submission__pic--add {
      position: relative;
      padding: 7px 15px;
      min-width: 98px;
      height: 30px; 
      white-space: nowrap;    

      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: #666;
      color: #5096f5;
      border-radius: 44px;
      background: rgba($color: #5096f5, $alpha: .1);
      cursor: pointer;

      // &:hover {
      //   background: rgba(80, 150, 245, .2);
      // }

      &.disabled {
        background: rgba(255,255,255,.2);
        color: #9b9b9b;
      }
      .iconfont {
        margin-right: 5px;
      }
    }
    .camera {
      position: absolute;
      top: 0;
      left: 0;
      bottom: 0;
      width: 100%;
      opacity: 0;
      cursor: pointer;
    }

  }

  .team__tip {
    width: 100%;
    padding: 10px 20px;
    line-height: 20px;
    background: rgba($color: #FEA300, $alpha: .1);
    color: #FEA300;
    font-size: 13px;
    text-align: left;
  }

  .btn-box {
    position: absolute;
    bottom: 0;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 70px;
    border-top: 1px solid #ddd;
    z-index: 2;
    .submit-btn {
      width: 120px;
      height: 34px;
      text-align: center;
      line-height: 34px;
      border-radius: 4px;
      background: #5096f5;
      color: #fff;
      cursor: pointer;
      margin: 0;
       &.disable {
        color: #9B9B9B;
        background: #ddd;
      }
    }
  }
  .pic-view {
      position: relative;
      margin: 20px auto;
      
      display: flex;
      align-items: center;
      flex-wrap: wrap;

      .image__item {
        width: 180px;
        height: 180px;
        border-radius: 4px;
        overflow: hidden;
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #f5f5f5;
        margin-bottom: 10px;
        &:not(:nth-of-type(3n)){
          margin-right: 10px;
        }

        img {
          width: 180px;
          height: 180px;
          object-fit: cover;
        }

        @keyframes donut-spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        .donut {
          font-size: 12px;
          position: absolute;
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          color: #9b9b9b;
          .iconfont {
            animation: donut-spin 1.2s linear infinite;
          }
        }
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
        bottom: 0;
        left: 0;
        z-index: 2;
        width: 100%;
        height: 28px;
        line-height: 28px;

        color: #fff;
        background: rgba(248, 79, 65,.7);

      }

    }
  /*------------------*\
    $ 作答完成预览
  \*------------------*/

  .subjective__answer {
    margin-bottom: 40px;
    color: #666;

    .answer--label {
      font-size: 16px;
      color: #333;
      line-height: 18px;
      text-align: left;
    }

    .answer__inner {
      margin-top: 10px;
      &.score {
        text-align: left;
        margin-bottom: 20px;
      }
    }

    .answer--text {
      text-align: left;
      word-wrap: break-word;
      line-height: 22px;
      font-size: 14px;
      white-space: pre-wrap;
    }

    .answer--image {
      padding-top: 10px;
    }

  }


</style>

/*
 * @page：学生接收器主观题作答页面
 * @author: chenzhou
 * @update: 2017.8.8
 * @desc 小组作答 websocket命令是否是小组作答
 *
 */

<template>
  <section class="page-subjective">
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

    <div :class="['subjective-wrapper', 'animated', opacity ? 'zoomIn': '']">
      <!-- 问题内容 cover -->
      <section class="subjective-content" >
        <div class="content_wrapper">
          <p class="page-no f12"><span><!-- 第{{ summary&&summary.pageIndex }}页 -->{{ $t('pno', { number: summary&&summary.pageIndex }) }}</span></p>
          <div class="cover__wrapper" :style="{ minHeight: (10 - 0.906667)/pptRate + 'rem' }">
            <img class="cover J_preview_img" :src="summary&&summary.cover" @click="handleScaleImage(1, $event)" @load="handleLoadImg(1, $event)" />
          </div>
        </div>
      </section>

      <!-- 小组作答 显示 未进组不显示小组详情 -->
      <section class="team__intro" v-if="team && !noTeam">
        <p class="team__intro--name ellipsis f18 c333"><!-- 小组作答： -->{{ $t('team.groupanswered') }}{{ team.teamName }}</p>
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
            <div class="submission__pic--add" v-if="huawei" @click="handleChooseImage"></div>
            <div class="submission__pic--add" v-else ><input type=file accept="image/jpeg,image/png,image/jpg" class="camera" @change="handleChooseImageChange" ></div>
            <p class="submission__pic--remark f14">{{ $t('uploadonepic') }}</p>
          </div>
          <div class="pic-view" v-show="hasImage||loading">
            <img :class="['J_preview_img', rate < 1 ? 'higher' : 'wider']" alt="" v-show="hasImage" :src="fileData||imageURL" @load="handleLoadImg(2, $event)" @click="handleScaleImage(2, $event)" v-if="imageURL" />
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
            <img class="J_preview_img" :src="result.pics[0].pic" alt="主观题作答图片" @load="handleLoadImg(3, $event)" @click="handleScaleImage(3, $event)" />
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

      <!-- 观看者提示文字 返回 -->
      <section v-if="observerMode">
        <p class="f18">{{ $t('watchmode') }}</p>
        <p class="submit-btn f18" @click="handleBack">{{ $t('back') }}</p>
      </section>
      <!-- 提交按钮 -->
      <p :class="['submit-btn', 'f18', sendStatus === 0 || sendStatus === 1 || sendStatus >= 4 || isGuestStudent ? 'disable': '']" v-show="!ispreview" @click="handleSend" v-else><!-- 提交答案 -->{{ $t('submitansw') }}</p>

    </div>

    <!-- 小组成员列表 -->
    <section class="members__wrap" v-if="teamVisible">
      <div class="team__members">
        <header class="members--closed"><i class="iconfont icon-shiti_guanbitouping f28 c333" @click="handleclosedTeam"></i></header>
        <div class="members__header">
          <p class="members__title f20 c333">{{ team.teamName }}</p>
          <p class="members__total f14 c9b">{{ team.memberCount }}人</p>
        </div>
        <ul class="">
          <li class="member__info" v-for="member in team.memberList">
            <img class="member--avatar" :src="member.avatar" :alt="member.userName" >
            <div class="member--name f16 c666"><span class="name">{{ member.userName }}</span></div>
          </li>
        </ul>
      </div>
    </section>

  </section>
</template>

<script>
  import { mapState, mapActions } from 'vuex';
  import API from '@/util/api'
  import {compress} from '@/util/image'
  import { isSupported } from '@/util/util'
  import { configWX } from '@/util/wx-util'
  import imagemixin from '@/components/common/image-mixin'
  import problemControl from '@/lesson/student/mixin/problem-control'
  import upload from '@/util/upload'
  // 是否华为特殊手机 P20 P20-pro
  const ua = navigator.userAgent.toLowerCase();
  const huawei = ua.match(/huaweiclt|huaweieml/i);

  export default {
    name: 'subjective-page',
    data() {
      return {
        ispreview: false,
        opacity: 0,
        title: '主观题作答',
        problemType: 5,
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
        // 是否华为特殊手机
        huawei: !!huawei,
        timer: null
      };
    },
    components: {
    },
    computed: {
      ...mapState([
        'lessonId',
        'cards',
        'observerMode'
      ])
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
        if(to && to.params && to.name === 'student-subjective') {
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
    mixins: [ imagemixin, problemControl ],
    methods: {
      ...mapActions([
        'setCards'
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

        this.problemID = problemID;

        // 检测这个问题是否分组
        let isTeam = data.groupid || false;
        isTeam && this.getTeamInfo(problemID, data.groupid);

        // event消息订阅
        this.initPubSub();

        this.oProblem = this.$parent.problemMap.get(problemID)['problem'];
        // 问题分数
        let score = this.oProblem['score'];
        let getScore = this.oProblem['getScore'];

        if(score && getScore > 0) {
          this.getScore = getScore/100;
        }

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
          this.$parent.startTiming({ problemID: problemID, msgid: this.msgid++ });
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

        setTimeout(()=>{
          this.opacity = 1;
        }, 20)

        // 处理弹出的消息
        this.$parent.msgBoxs.forEach((item, index) => {
          if(item.type === 3 && item.problemID == problemID) {
            this.$parent.msgBoxs.splice(index, 1);
          }
        })

        // 预加载图片
        let oImg = new Image();
        oImg.src = '/vue_images/images/loading-3.gif';

        // huawei 使用微信自己的图片选择
        if(this.huawei) {
          configWX();
        }
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

              // 作答结果 未作答时返回的是{}
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
      async sendSubjective() {
        let problemID = this.problemID;
        let problem = this.$parent.problemMap.get(problemID);
        let URL = API.student.ANSWER_LESSON_PROBLEM;
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
            this.$parent.problemMap.set(problemID, problem);
          }

          this.sendStatus = 4;
          this.sLeaveTime = this.$i18n.t('done') || '已完成';
          this.isComplete = true;
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

        setTimeout(() => {
          this.$router.back();
        }, 2000)
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
          let fileName = `${this.lessonId}${data.length}${randomNumber}.${picType}`;
          // let file = dataURLtoFile(data, fileName);
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
        this.imageThumbURL = '/vue_images/images/loading-3.gif';
        this.uploadImage(file, fileType);

        compress(file, options, function(dataUrl) {
          if(dataUrl) {
            self.fileData = dataUrl;

            // 上传图片
            // self.uploadImage(dataUrl, fileType);
          }
        });
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

      /*
      * @method 息屏锁屏检测处理
      * @param
      */
      visibilitychange(evt) {
        if (document.hidden) {
          console.log('息屏锁屏');
        } else {
          let data = this.summary;
          let problemID = data && data.problemID;
          let isComplete = data && data.isComplete;

          if(problemID && !isComplete) {
            let socket = this.$parent.socket;

            if (socket && socket.readyState === 1) {
              setTimeout(()=>{
                this.$parent.startTiming({ problemID: problemID, msgid: this.msgid++ });
              }, 1000)
            } else {
              setTimeout(()=>{
                this.$parent.startTiming({ problemID: problemID, msgid: this.msgid++ });
              }, 2000)
            }
          }

          console.log('息屏锁屏 ->唤醒启用');
        }
      }
    },
    created() {
      this.index = +this.$route.params.index;
      let cards = this.cards;
      this.summary = cards[this.index];

      if(this.summary) {
        this.init(this.summary);
      } else {
        this.$router.back();
      }

      // 课程结束啦
      this.$parent.lessonStatus === 1 && (this.sendStatus = 5);

      // 分组作答主观题状态接口不会处理旁听生的逻辑 且后端产品确认同一堂课学生身份不做转换  故直接使用签到时的身份判断是否旁听生
      this.$parent.role === 6 && (this.isGuestStudent = true)
    },
    mounted() {
      // 息屏锁屏检测
      document.addEventListener('visibilitychange', this.visibilitychange);
    },
    beforeDestroy() {
      this.timer && clearInterval(this.timer)
      document.removeEventListener('visibilitychange', this.visibilitychange);
    }
  };
</script>

<style lang="scss" scoped>
  .page-subjective {
    z-index: 1;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    height: 100vh;

    background: #f6f7f8;

    overflow-y: scroll;
    -webkit-overflow-scrolling: touch;
  }

  .subjective-wrapper {
    width: 100%;
    min-height: 100%;
    min-height: 100vh;
    // overflow-y: scroll;
    // -webkit-overflow-scrolling: touch;
  }

  .problem-tag {
    border-left: 0.4rem solid #4A90E2;
  }

  .subjective__header {
    z-index: 1;
    position: fixed;
    top: 0;
    left: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;

    padding: 0 0.453333rem;
    width: 100%;
    height: 1.33rem;
    color: #2A2A2A;
    background: #fff;
    box-shadow: 0 4px 6px rgba(0,0,0, 0.2);

    .heade-action {
      min-width: 0.666667rem;
      color: #639EF4;
    }

    .subjective--back {
      margin-left: -0.25rem;
      color: #4a4a4a;
    }

    .heade-action.disable {
      color: #999999;
    }

    .heade-action:active:not(.disable) {
      color: rgba(99,158,244,0.7);
    }
  }

  /*------------------*\
    $ 习题定时
  \*------------------*/

  .exercise__tips {
    z-index: 1;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;

    margin: 0.133333rem auto;
    width: 9.6rem;
    height: 1.6rem;
    line-height: 1.6rem;

    background: #212121;
    color: #fff;
    opacity: 0.8;

    border-radius: 0.053333rem;
    box-shadow: 0 0.066667rem 0.133333rem rgba(0,0,0,0.2);
    overflow: hidden;

    .timing {
      display: flex;
      align-items: center;
      justify-content: center;

      .timing--icon {
        margin-right: 0.453333rem;
        width: 0.853333rem;
        height: 0.933333rem;
      }

      .over.timing--number {
        color: #F84F41;
      }
    }
  }


  .submit-btn {
    margin: 0.266667rem auto 0.4rem;
    width: 7.733333rem;
    height: 1.173333rem;
    line-height: 1.173333rem;

    color: #fff;
    background: #639EF4;
    border-radius: 0.106667rem;
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
    padding-top: 1.65rem;

    .content_wrapper {
      position: relative;
      margin: 0.266667rem 0 0.266667rem;
      background: #fff;
      overflow: hidden;
    }

    .content__header {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: flex-start;

      padding-right: 0.4rem;
      width: 100%;
      height: 1.2rem;
      color: #4A4A4A;
       background: #fff;

      .header-item {
        margin-left: 0.4rem;
        text-align: center;
      }
    }

    .page-no {
      position: absolute;
      top: 0;
      right: 1px;

      padding: 0 0.306667rem;
      height: 0.666667rem;
      line-height: 0.666667rem;
      color: #fff;

      background: rgba(0,0,0,0.5);
    }

    .cover__wrapper {
      // margin-top: -0.55rem;
    }

    .cover {
      display: block;
      width: 100%;
    }
  }


  .subjective__answer--lable {
    padding: 0 0.453333rem 0.186667rem;
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
    margin: 0 0.453333rem 0.266667rem;

    background: #fff;
    border-bottom: 1px solid #C8C8C8;

    .submission-textarea {
      margin-bottom: 0.52rem;
      padding: 0.133333rem;

      width: 100%;
      height: 4.266667rem;
      border-width: 0;
      -webkit-user-select: auto;
    }

    .submission-textarea::-webkit-input-placeholder {
      color: #9B9B9B
    }

    .submission-footer {
      position: absolute;
      bottom: 0.133333rem;
      right: 0.066667rem;

      color: #9B9B9B
    }

  }



  /*------------------*\
    $ 图片
  \*------------------*/

  .submission__pic {
    margin: 1.066667rem auto 0.266667rem;
    padding-bottom: 2rem;

    .submission__pic--add {
      position: relative;
      margin: 0 auto;
      width: 1.92rem;
      height: 1.92rem;

      border: 2px solid #C8C8C8;
      border-radius: 0.106667rem;

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
      width: 0.986667rem;
      height: 2px;

      transform: translate(-50%, -50%);

      background: #C8C8C8;
    }

    .submission__pic--add:after {
      width: 2px;
      height: 0.986667rem;
    }

    .submission__pic--remark {
      padding-top: 0.4rem;
      color: #C8C8C8;
    }

    .pic-view {
      position: relative;
      margin: 0 auto;
      width: 6.666667rem;
      height: 6.666667rem;

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
        width: 2.0rem;
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

        width: 0.773333rem;
        height: 0.773333rem;
        line-height: 0.75rem;

        color: #fff;
        background: rgba(0,0,0,0.6);
      }

    }

  }


  /*------------------*\
    $ 作答完成预览
  \*------------------*/

  .subjective__answer {
    margin-bottom: 1.066667rem;
    padding: 0.333333rem 0.4rem;
    color: #333;
    background: #fff;

    .answer__inner {
      padding: 0 0.2rem 0.4rem;
      border-bottom: 1px solid #C8C8C8;
    }

    .answer--text {
      text-align: left;
      word-wrap: break-word;
    }

    .answer--image {
      padding-top: 0.266667rem;
      img {
        display: block;
        width: 6.933333rem;
        max-width: 100%;
      }
    }

    .answer-score {
      padding: 0.266667rem 0.2rem 0;
      color: #9B9B9B;
      text-align: left;

      .lable {
        vertical-align: 0.066667rem;
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

    margin: 0.133333rem 0;
    padding: 0 0.533333rem;
    height: 1.733333rem;
    line-height: 1.733333rem;
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
    margin-top: -1.066667rem;
    padding: 0 0.533333rem 0.8rem;
    text-align: justify;

    background: #fff;
  }

  .members--closed {
    height: 1.333333rem;
    line-height: 1.333333rem;
    padding: 0 0.4rem;
    text-align: left;
    border-bottom: 1px solid #C8C8C8;
  }

  .team__members {
    z-index: 1;
    position: fixed;
    bottom: 0;
    left: 0;

    width: 100vw;
    height: 75vh;
    overflow-y: auto;
    background: #fff;

    .members__header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.533333rem 0.533333rem 0.266667rem;

      .members__title {
        font-weight: bold;
      }
    }

    .member__info {
      display: flex;
      justify-content: flex-start;
      align-items: center;

      padding-left: 0.533333rem;
      height: 1.493333rem;
      line-height: 1.493333rem;

      .member--avatar {
        display: block;
        width: 0.933333rem;
        height: 0.933333rem;
        border-radius: 50%;
      }

      .member--name {
        flex: 1;
        text-align: left;
        border-bottom: 1px solid #eee;

        .name {
          padding-left: 0.4rem;
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

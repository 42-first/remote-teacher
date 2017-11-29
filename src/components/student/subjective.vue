/*
 * @page：学生接收器主观题作答页面
 * @author: chenzhou
 * @update: 2017.8.8
 * @desc
 *
 */

<template>
  <section class="page-subjective">
    <!-- 练习导航 -->
    <header class="subjective__header">
      <p class="heade-action subjective--back" @click="handleBack" v-if="ispreview"><i class="iconfont icon-fanhui f25"></i></p>
      <p class="heade-action f18" @click="handleBack" v-else>取消</p>
      <h3 class="header-title f18" v-if="limit>0 && !hasNewExtendTime">{{ sLeaveTime }}</h3>
      <div class="timing f24" v-else-if="hasNewExtendTime">{{ sExtendTimeMsg }}</div>
      <!-- <div class="timing f24" v-else-if="limit===0">老师可能会随时结束答题</div> -->
      <h3 class="header-title f18" v-else>{{ title }}</h3>
      <p :class="['heade-action', 'f18', sendStatus === 0 || sendStatus === 1 || sendStatus >= 4 ? 'disable': '']" @click="handleSend" >{{ ispreview ? '': '提交' }}</p>
    </header>
    <div :class="['subjective-wrapper', 'animated', opacity ? 'zoomIn': '']">
      <!-- 问题内容 cover -->
      <section class="subjective-content" >
        <div class="content_wrapper">
          <header class="content__header problem-tag">
            <p class="header-item f18">主观题</p>
            <p class="header-item f15">第{{ summary&&summary.pageIndex }}页</p>
            <p class="header-item f15">{{ oProblem&&oProblem.Score }}分</p>
          </header>
          <div class="cover__wrapper" :style="{ minHeight: (10 - 0.906667)/pptRate + 'rem' }">
            <img class="cover J_preview_img" :src="summary&&summary.cover" @click="handleScaleImage(1, $event)" @load="handlelaodImg(1, $event)" />
          </div>
        </div>
      </section>

      <h3 class="subjective__answer--lable f17" v-if="!ispreview">作答区域<span class="tip f12">（内容限制140字可插入1张图片）</span></h3>
      <h3 class="subjective__answer--lable f17" v-else >我的回答</h3>
      <!-- 编辑状态-->
      <div class="subjective-inner" v-if="!ispreview">
        <!-- 文字编辑 -->
        <section class="submission__text">
          <div class="submission__textarea--wrapper f17">
            <textarea class="submission-textarea J_feed_content" maxlength="140" placeholder="输入文字" v-model="text"></textarea>
            <div class="submission-footer">
              <p class="">(<span class="">{{ count }}</span>/140)</p>
            </div>
          </div>
        </section>

        <!-- 图片 -->
        <section class="submission__pic">
          <div v-if="!hasImage&&!loading">
            <div class="submission__pic--add" ><input type=file accept="image/*" class="camera" @change="handleChooseImageChange" ></div>
            <p class="submission__pic--remark f14">上传图片（只能添加1张）</p>
          </div>
          <div class="pic-view" v-show="hasImage||loading">
            <img :class="['J_preview_img', rate < 1 ? 'higher' : 'wider']" alt="" v-show="hasImage" @load="handlelaodImg(2, $event)" @click="handleScaleImage(2, $event)" />
            <img class="J_loading_img" alt="" v-show="loading" />
            <!-- 解决image 在微信崩溃的问题采用canvas处理 -->
            <p class="delete-img" @click="handleDeleteImg" v-show="hasImage"><i class="iconfont icon-wrong f18"></i></p>
          </div>
        </section>
      </div>
      <!-- 预览状态 -->
      <div class="subjective__answer" v-if="ispreview">
        <div class="answer__inner">
          <p class="answer--text f17">{{ result.content }}</p>
          <div class="answer--image" v-if="result.pics.length && result.pics[0].pic"><img class="J_preview_img" :src="result.pics[0].pic" alt="主观题作答图片" @load="handlelaodImg(3, $event)" @click="handleScaleImage(3, $event)" /></div>
        </div>
        <!-- 打分显示 -->
        <div class="answer-score" v-if="getScore !== -1">
          <i class="iconfont blue icon-ykq_dafen f18"></i>
          <span class="lable f15" >得分: {{getScore}}分</span>
        </div>
      </div>

    </div>

  </section>
</template>

<script>
  import API from '@/util/api'
  import {compress} from '@/util/image'

  export default {
    name: 'subjective-page',
    data() {
      return {
        ispreview: false,
        opacity: 0,
        title: '主观题作答',
        // 是否新的延时
        hasNewExtendTime: false,
        sExtendTimeMsg: '',
        limit: 0,
        leaveTime: 0,
        sLeaveTime: '00:00',
        timeOver: false,
        // 作答结果
        result: null,
        // 0 初始化状态 1图片上传中 2可以发送 3发送中 4发送完成 5课程已结束
        sendStatus: 0,
        text: '',
        imageURL: '',
        imageThumbURL: '',
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
        getScore: -1
      };
    },
    components: {
    },
    computed: {
    },
    watch: {
      text(newValue, oldValue) {
        // 课程结束啦
        if(this.sendStatus === 5) {
          return this;
        }

        let value = newValue && newValue.substr(0, 140);

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
          this.submitText = '正在发送';
        } else if(newValue === 1) {
          this.submitText = '图片上传中';
        } else if(newValue === 2) {
          this.submitText = '确认发送';
        } else if(newValue === 4) {
          this.submitText = '发送成功';
        } else if(newValue === 5) {
          this.submitText = '课程已结束';
        }
      }
    },
    filters: {
    },
    mixins: [],
    methods: {
      /*
      * @method 初始化习题页面
      * @param problemID 问题ID
      */
      init(data) {
        let problemID = data.problemID;

        if(!problemID) {
          return ;
        }

        // event消息订阅
        this.initPubSub();

        // 是否观察者模式
        this.observerMode = this.$parent.observerMode;
        this.oProblem = this.$parent.problemMap.get(problemID)['Problem'];
        // 问题分数
        let score = this.oProblem['Score'];
        let getScore = this.oProblem['getScore'];

        if(score && getScore > 0) {
          this.starCount = getScore / score * 5;
          this.getScore = getScore;
        }

        // 是否观察者模式
        if(this.observerMode) {
          this.sendStatus = 5;
        }

        // 是否完成
        if(data.isComplete) {
          this.sendStatus = 5;
          this.ispreview = true;

          this.result = this.oProblem['Result'];

          this.getScoreFn(problemID);
          this.sLeaveTime = '已完成';
        } else {
          // 开始启动定时
          data.limit > 0 && this.$parent.startTiming({ problemID: problemID, msgid: this.msgid++ });
          this.limit = data.limit;

          // 恢复作答结果
          let sResult = localStorage.getItem('lessonsubjective'+problemID);
          if(sResult) {
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
          }

          if (process.env.NODE_ENV !== 'production') {
            this.setTiming(data.limit)
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
          this.setTiming(data && data.leaveTime);
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
            let seconds = this.leaveTime % 60;
            minutes = minutes < 10 ? '0' + minutes : minutes;
            seconds = seconds < 10 ? '0' + seconds : seconds;

            this.sLeaveTime = minutes + ':' + seconds;

            if(this.leaveTime <= 0) {
              this.sLeaveTime = '作答时间结束';
              clearInterval(this.timer);
              this.timeOver = true;
              this.warning = false;
            }

            if(this.leaveTime === 10) {
              this.warning = true;
            }

          }, 1000)
        } else {
          // 时间到
          this.timeOver = true;
          this.sLeaveTime = '作答时间结束';
        }
      },

      /*
       * @method 答题续时
       * @params problem
       */
      extendTime(problem) {
        if(problem) {
          let id = problem.prob;
          let limit = problem.limit;
          // 续时 分钟 秒
          let minutes = parseInt(limit / 60, 10);
          let seconds = limit % 60;
          let sMsg = minutes > 0 ? `延时 ${minutes}分钟 成功` : `延时 ${seconds}秒 成功`;

          // 同一个问题续时
          if(id === this.problemID) {
            this.hasNewExtendTime = true;
            this.sExtendTimeMsg = sMsg;

            this.limit = limit;
            let leaveTime = this.leaveTime > 0 ? this.leaveTime : 0;
            this.setTiming(leaveTime + limit);
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

              this.starCount = data.score / data.source_score * 5;

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
            message: '时间已过，不能再提交啦～',
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
        let problem = self.$parent.problemMap.get(problemID)

        console.log(param);

        return request.post(URL, param)
          .then((res) => {
            if(res && res.data) {
              let data = res.data;
              self.sendStatus = 4;

              self.summary = Object.assign(self.summary, {
                status: '已完成',
                isComplete: true
              })

              problem = Object.assign(problem, {
                'Problem': self.oProblem
              })
              self.$parent.problemMap.set(problemID, problem);

              clearInterval(self.timer);
              this.sLeaveTime = '已完成';

              this.$toast({
                message: '提交成功',
                duration: 2000
              });

              setTimeout(() => {
                self.$router.back();
              }, 2000)

              return data;
            }
          })
          .catch(error => {
            // 提交失败保存本地
            self.saveAnswer(param);
            self.$toast({
               message: '当前网络不畅，请检查系统已保存并将自动重复提交',
              duration: 3000
            });

            setTimeout(() => {
              self.$router.back();
            }, 3000)
          });
      },

      /*
       * @method 保存习题答案
       * @param
       */
      saveAnswer(data) {
        let key = 'answer_problem';
        let answerPostList = JSON.parse(localStorage.getItem(key)) || [];

        data.retry_times = data.retry_times + 1;
        answerPostList.push(data);

        let value = JSON.stringify(answerPostList);

        localStorage.setItem(key, value);
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
        let sBase64 = data.substr(data.indexOf(',') + 1);
        params['pic_data'] = sBase64;
        params['pic_type'] = picType;

        // jpg,jpeg,bmp,png,gif
        if(!/png|jpg|jpeg/.test(picType)) {
          this.$toast({
            message: '当前仅支持图片格式，请重新上传',
            duration: 2000
          });

          this.imageURL = '';
          this.imageThumbURL = '';
          this.hasImage = false;

          return this;
        }

        this.sendStatus = 1;
        return request.post(URL, params)
          .then( (res) => {
            if(res && res.data) {
              let data = res.data;

              self.imageURL = data.pic_url;
              self.imageThumbURL = data.thumb_url
              self.sendStatus = 2;

              self.cacheResult();

              return self.imageURL;
            }
          });
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
              message: '图片不可超过10M，请重试',
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

        // this.$toast({
        //   message: '图片上传中',
        //   duration: 2000
        // });

        // 压缩 浏览器旋转 微信崩溃等问题
        this.loading = true;
        let loadingEl = this.$el.querySelector('.J_loading_img');
        loadingEl.src = '/vue_images/images/loading-3.gif';

        compress(file, options, function(dataUrl) {
          if(dataUrl) {
            self.loading = false;
            imgEl.src = dataUrl;

            // 上传图片
            self.uploadImage(dataUrl, fileType);
            self.hasImage = true;
          }
        });
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

        this.$messagebox.confirm('确定删除图片?').then(action => {
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
        let src = this.imageURL;
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
        this.sendStatus === 2 && this.sendSubjective();
      },
      handleBack() {
        this.$router.back();
      }
    },
    created() {
      this.index = +this.$route.params.index;
      this.lessonID = this.$parent.lessonID;
      let cards = this.$parent.cards;
      this.summary = cards[this.index];

      if(this.summary) {
        this.init(this.summary);
      } else {
        this.$router.back();
      }

      // 课程结束啦
      this.$parent.lessonStatus === 1 && (this.sendStatus = 5);
    },
    mounted() {
    },
    beforeDestroy() {
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

    background: #f6f7f8;

    // overflow-y: scroll;
    -webkit-overflow-scrolling: touch;
  }

  .subjective-wrapper {
    width: 100%;
    height: 100%;
    overflow-y: scroll;
    -webkit-overflow-scrolling: touch;
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
    $ 习题内容
  \*------------------*/

  .subjective-content {
    padding-top: 1.33rem;

    .content_wrapper {
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

    .cover__wrapper {
      margin-top: -0.55rem;
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
      width: 3.493333rem;
      height: 3.493333rem;

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
      width: 1.8rem;
      height: 2px;

      transform: translate(-50%, -50%);

      background: #C8C8C8;
    }

    .submission__pic--add:after {
      width: 2px;
      height: 1.8rem;
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


</style>

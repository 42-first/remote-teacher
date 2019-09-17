/*
 * @page：学生接收器投稿页面
 * @author: chenzhou
 * @update: 2017.6.8
 * @desc
 *
 */

<template>
  <section class="page-submission">
    <div :class="['submission-wrapper', 'h100', 'animated', opacity ? 'zoomIn': '']">
      <div class="text-left contributor-wrapper">
        <div class="title">选择分组</div>
        <div class="handler-wrapper" @click="showPicker">
          <span>{{ selectedVal }}</span>
          <i class="iconfont icon-dakai ver-middle font20"></i>
        </div>
      </div>
      <div class="submission-inner">

      <!-- 文字编辑 -->
      <section class="submission__text">
        <div class="submission__textarea--wrapper f17">
          <textarea class="submission-textarea J_feed_content" maxlength="1000" :placeholder="$t('isempty')" v-model="text"></textarea>
          <div class="submission-footer">
            <p class="">(<span class="">{{ count }}</span>/1000)</p>
          </div>
        </div>
      </section>

      <!-- 图片 -->
      <section class="submission__pic">
        <div v-if="!hasImage">
          <div class="submission__pic--add" v-if="huawei" @click="handleChooseImage"></div>
          <div class="submission__pic--add" v-else><input type=file accept="image/*" class="camera" @change="handleChooseImageChange" ></div>
          <p class="submission__pic--remark f14">{{ $t('uploadonepic') }}</p>
        </div>
        <div class="pic-view" v-show="hasImage">
          <img :class="['J_preview_img', rate < 1 ? 'higher' : 'wider' ]" :src="fileData||imageThumbURL" alt="" @load="handlelaodImg" @click="handleScaleImage" v-if="imageURL" />
          <img class="img--loading" :src="imageThumbURL" alt="雨课堂" v-else />
          <!-- 解决image 在微信崩溃的问题采用canvas处理 -->
          <p class="delete-img" @click="handleDeleteImg"><i class="iconfont icon-wrong f18"></i></p>
        </div>
      </section>

      </div>

      <!-- 提示 -->
      <p class="submission--tip f14"><!-- 温馨提示：投稿可能会被老师公开发送给全班 -->{{ $t('posttip') }}</p>

      <section :class="['submission__submit', 'f17', sendStatus === 0 || sendStatus === 1 || sendStatus >= 4 ? 'disable': '']" @click="handleSend">{{ submitText }}</section>

      <router-link :to="'/'+lessonID+'/submission_list/'" tag="p" class="submission-mine-link f15">{{ $t('viewpost') }}</router-link>

      <section class="camera-list none">
        <a><input type=file accept="image/*" value="拍照/选择照片" >拍照/选择照片</a>
        <a><input type=file accept="image/*" capture="camera" value="拍照" >拍照</a>
        <a><input type=file accept="image/*" capture="user" value="自拍" >自拍</a>
      </section>

    </div>

    <!-- 图片放大结构 -->
    <section class="pswp J_submission_pswp" tabindex="-1" role="dialog" aria-hidden="true">

      <div class="pswp__bg"></div>

      <div class="pswp__scroll-wrap">

        <div class="pswp__container">
            <div class="pswp__item"></div>
            <div class="pswp__item"></div>
            <div class="pswp__item"></div>
        </div>

        <div class="pswp__ui pswp__ui--hidden">

          <div class="pswp__top-bar">

            <div class="pswp__counter"></div>

              <div class="pswp__preloader">
                    <div class="pswp__preloader__icn">
                      <div class="pswp__preloader__cut">
                        <div class="pswp__preloader__donut"></div>
                      </div>
                    </div>
              </div>
            </div>

            <div class="pswp__caption">
                <div class="pswp__caption__center"></div>
            </div>

        </div>

      </div>

    </section>

    <!-- picker -->
    <picker :list="groupList" :selectedindex="selectedIndex" :text="pickerText" @close="pickerClose" v-if="isShowPicker"></picker>
  </section>
</template>
<script>
  import API from '@/util/api'
  import {compress} from '@/util/image'
  import picker from '@/components/common/picker/index.vue'
  import { configWX } from '@/util/wx-util'
  import imagemixin from '@/components/common/image-mixin'
  // 是否华为特殊手机 P20 P20-pro
  const ua = navigator.userAgent.toLowerCase();
  const huawei = ua.match(/huaweiclt|huaweieml/i);

  export default {
    name: 'submission-page',
    data() {
      return {
        index: 0,
        opacity: 0,
        title: this.$i18n.t('post') || '课堂投稿',
        // 0 初始化状态 1图片上传中 2可以发送 3发送中 4发送完成 5课程已结束
        sendStatus: 0,
        submitText: this.$i18n.t('sendcfm') || '确认发送',
        text: '',
        imageURL: '',
        imageThumbURL: '',
        // 本地图片base64/二进制
        fileData: null,
        hasImage: false,
        count: 0,
        imageData: null,
        width: 0,
        height: 0,
        // 图片比例
        rate: 1,
        retryTimes: 0,
        classroomid: 0,
        selectedIndex: [0], // 选择的分组
        groupList: [], // 分组列表
        pickerText: {
          title: '选择分组/个人',
          cancel: '取消',
          confirm: '确定'
        },
        selectedVal: '',
        group_id: 0,
        team_id: 0,
        isShowPicker: false,
        // 是否华为特殊手机
        huawei: !!huawei
      };
    },
    components: {
      picker
    },
    computed: {
    },
    watch: {
      text(newValue, oldValue) {
        // 课程结束啦
        if(this.sendStatus === 5) {
          return this;
        }

        // let value = newValue && newValue.replace(/^\s+|\s+$/g, '').substr(0, 140);
        let value = newValue && newValue.substr(0, 1000);

        this.count = value && value.length || 0;
        this.text = value;

        if(this.count) {
           this.sendStatus === 0 && (this.sendStatus = 2);
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
          this.submitText = this.$i18n.t('sendcfm') || '确认发送';
        } else if(newValue === 4) {
          this.submitText = this.$i18n.t('sendsuccess') || '发送成功';
        } else if(newValue === 5) {
          this.submitText = this.$i18n.t('classended') || '课程已结束';
        }
      }
    },
    filters: {
      formatTime(time) {
        return moment && moment(time).format('hh:mm:ss') || time;
      }
    },
    mixins: [ imagemixin ],
    methods: {
      /*
      * @method 发送投稿
      * @param
      */
      sendSubmission() {
        let self = this;
        let URL = API.student.SEND_SUBMISSION;
        const content = this.text.replace(/^\s+|\s+$/g, '');
        let params = {
          'content': content,
          'pic': this.imageURL,
          'thumb': this.imageThumbURL,
          'lesson_id': this.lessonID,
          'team_id': this.team_id,
          'group_id': this.group_id
        }

        // 发送中
        this.sendStatus = 3;

        return request.post(URL, params)
          .then( (res) => {
            if(res) {
              let data = res;
              self.sendStatus = 4;

              setTimeout(() => {
                self.handleBack();
              }, 2000)

              self.$toast({
                message: this.$i18n.t('sendsuccess') || '发送成功',
                duration: 2000
              });

              return data;
            }
          }).catch(error => {
            this.sendStatus = 2;

            this.$toast({
              message: this.$i18n.t('networkerror2') || '网络不佳，答案提交失败，请重试',
              duration: 3000
            });

            return null;
          });
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

              return self.imageURL;
            }
          }).catch(error => {
            self.retryUpload(data, fileType);

            return null;
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
      compress2(res, fileType) {
        let self = this;
        let img = new Image();
        // 需要处理下微信header高度
        let maxHeight = window.innerHeight || 1214;

        img.onload = function () {
          let cvs = document.createElement('canvas'),
            ctx = cvs.getContext('2d');

          // if(img.height > maxHeight) {
          //   img.width *= maxHeight / img.height;
          //   img.height = maxHeight;
          // }

          cvs.width = img.width;
          cvs.height = img.height;
          ctx.clearRect(0, 0, cvs.width, cvs.height);
          ctx.drawImage(img, 0, 0, img.width, img.height);

          let dataUrl = cvs.toDataURL(fileType || 'image/jpeg', 0.6);
          let imgEl = self.$el.querySelector('.J_preview_img');
          imgEl.src = dataUrl;

          // 上传图片
          self.uploadImage(dataUrl, fileType);
          self.hasImage = true;
        }

        img.src = res;
      },
      handleChooseImageChange(evt) {
        let self = this;
        let targetEl = typeof event !== 'undefined' && event.target || evt.target;

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
            quality: .65
          }
        };

        // 压缩 浏览器旋转 微信崩溃等问题
        this.hasImage = true;
        this.imageThumbURL = '/vue_images/images/loading-3.gif';
        compress(file, options, function(dataUrl) {
          if(dataUrl) {
            self.fileData = dataUrl;

            // 上传图片
            self.uploadImage(dataUrl, fileType);
          }
        });

      },
      handlelaodImg(evt) {
        let target = typeof event !== 'undefined' && event.target || evt.target;

        this.width = target.naturalWidth || target.width;
        this.height = target.naturalHeight || target.width;

        this.rate = this.width/this.height;
      },
      handleDeleteImg() {
        let self = this;
        // 国际化confirm options改造
        let msgOptions = {
          confirmButtonText: this.$i18n.t('confirm'),
          cancelButtonText: this.$i18n.t('cancel')
        }

        this.$messagebox.confirm(this.$i18n.t('cfmdelpic') || '确定删除图片?', msgOptions).then(action => {
          if(action === 'confirm') {
            self.hasImage = false;
            self.imageURL = '';
            self.imageThumbURL = '';

            !self.text && (self.sendStatus = 0);
          }
        });
      },
      handleScaleImage() {
        let targetEl = event.target;
        let pswpElement = this.$el.querySelector('.J_submission_pswp');
        let index = 0;
        let items = [];

        // build items array
        items.unshift({ src: this.fileData || this.imageURL, w: this.width || 750, h: this.height || 520 });

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
        this.sendStatus === 2 && this.sendSubmission();
      },
      handleBack() {
        this.$router.back();
      },
      /**
       * 获取 学生班级的分组列表
       */
      getGroupList() {
        let url = API.student.GET_ALL_GROUP_LIST
        return request.get(url, {
          classroom_id: this.classroomid
        }).then(e => {
          if (e.success) {
            return e.data.team_list || []
          }
        })
      },
      /**
       * picker: 分组列表数据展示
       */
      pickerDataInit() {
        this.getGroupList().then(list => {
          list.map(item => {
            item = Object.assign(item, {
              value: item.group_id,
              text: item.group_name
            })
            return item
          })
          list.unshift({
            value: 0,
            text: '个人'
          })
          this.selectedVal = list[0].text
          this.groupList = [list]
        })
      },
      /**
       * 展示picker
       */
      showPicker() {
        this.isShowPicker = true
      },
      /**
       * 关闭 picker
       */
      pickerClose(data) {
        if (data) {
          let index = 0
          if (data.selectedIndex) {
            index = data.selectedIndex[0]
          }
          let item = this.groupList[0][index]
          if(item) {
            if (item.team_info) {
              this.group_id = item.group_id
              this.team_id = item.team_info.team_id
            } else {
              this.group_id = this.team_id = 0
            }
          }
          this.selectedVal = item.text
        }
        this.isShowPicker = false
        return null
      }
    },
    created() {
      this.lessonID = +this.$route.params.lessonID;
      document.title = this.$i18n.t('post') || '投稿';
      this.classroomid = this.$route.query.classroomid
      // 课程结束啦
      this.$parent.lessonStatus === 1 && (this.sendStatus = 5);
      // 获取学生分组列表
      this.pickerDataInit()
      // huawei 使用微信自己的图片选择
      if(this.huawei) {
        configWX();
      }
    },
    mounted() {
    },
    beforeDestroy() {
    }
  };
</script>

<style lang="scss">
  @import "~@/style/common_rem";
  /* 
    设置投稿人
  */
  .contributor-wrapper{
    height: px2rem(98px);
    line-height: px2rem(98px);
    background-color: #f8f8f8;
    color: #666;
    font-size: px2rem(34px);
    display: flex;
    padding: 0 px2rem(30px);
    .title{
      flex: 1;
    }
    .handler-wrapper{
      color: #333;
    }
  }
  /*------------------*\
    $ 文字编辑
  \*------------------*/

  .page-submission {
    z-index: 1;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;

    // background: #EDF2F6;
    background: #fff;

    overflow-y: scroll;
    -webkit-overflow-scrolling: touch;
    text-align: center;
  }

  .submission-inner {
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

  .submission__submit {
    margin: 0 auto 0.533333rem;
    width: 7.733333rem;
    height: 1.173333rem;
    line-height: 1.173333rem;

    color: #fff;
    background: #639EF4;

    border-radius: 0.106667rem;
  }

  .submission__submit.disable {
    background: #999999;
  }

  .submission__submit:active:not(.disable) {
    background: rgba(99,158,244,0.7);
  }

  .camera-list {
    a {
      position: relative;
      display: block;
      height: 1rem;
    }
    input {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      margin: auto;
      display: block;
      height: 1rem;

      opacity: 0;
    }
  }


  .submission--tip {
    padding: 0.266667rem 0;
    color: #C7C7C7;
  }

  .submission-mine-link {
    color: #639EF4;
    text-decoration: underline;
  }




</style>

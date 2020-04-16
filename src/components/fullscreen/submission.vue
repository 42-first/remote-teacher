/*
 * @page：学生接收器投稿页面
 * @author: chenzhou
 * @update: 2017.6.8
 * @desc
 *
 */

<template>
  <section class="page-submission box-center">
    <!-- 关闭页面 -->
    <div class="page__back" @click="handleBack">
      <i class="iconfont icon-shangyigex1"></i><span class="btn-txt">返回</span>
    </div>
    <div class="submission-wrapper">
      <!-- <div class="text-left contributor-wrapper" v-if="classroomid">
        <div class="title">选择分组</div>
        <div class="handler-wrapper" @click="showPicker">
          <span>{{ selectedVal }}</span>
          <i class="iconfont icon-dakai ver-middle font20"></i>
        </div>
      </div> -->

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
            <div class="submission__pic--add">
              <!-- <input type=file accept="image/*" class="camera" @change="handleChooseImageChange" > -->
              <input type=file accept="image/*,video/mp4,video/mpeg" class="camera" @change="handleChooseImageChange" >
            </div>
            <p class="submission__pic--remark f14">可上传一张图片或一个小视频</p>
          </div>
          <div class="pic-view" v-show="hasImage">
            <img :class="['J_preview_img', rate < 1 ? 'higher' : 'wider' ]" :src="fileData||imageThumbURL" alt="" @load="handlelaodImg" @click="handleScaleImage" v-if="imageURL" />
            <img class="img--loading" :src="imageThumbURL" alt="雨课堂" v-else-if="imageThumbURL" />
            <!-- 视频 -->
            <video class="video--preview" :src="video.url" controls :poster="video.thumb" v-if="video && video.url" >
            </video>
            <!-- 解决image 在微信崩溃的问题采用canvas处理 -->
            <p class="delete-img" @click="handleDeleteImg"><i class="iconfont icon-wrong f18"></i></p>
          </div>
        </section>

      </div>

      <!-- 提示 -->
      <p class="submission--tip f14"><!-- 温馨提示：投稿可能会被老师公开发送给全班 -->{{ $t('posttip') }}</p>
      <section :class="['submission__submit', 'f17', sendStatus === 0 || sendStatus === 1 || sendStatus >= 4 ? 'disable': '']" @click="handleSend">{{ submitText }}</section>
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
    <!-- <picker :list="groupList" :selectedindex="selectedIndex" :text="pickerText" @close="pickerClose" v-if="isShowPicker"></picker> -->
  </section>
</template>
<script>
  import API from '@/util/api'
  import {compress} from '@/util/image'
  import picker from '@/components/common/picker/index.vue'
  import { configWX } from '@/util/wx-util'
  import imagemixin from '@/components/common/image-mixin'
  import upload from '@/util/upload'
  import $ from 'jquery'


  export default {
    name: 'submission-page',
    data() {
      return {
        index: 0,
        title: this.$i18n.t('post') || '课堂投稿',
        // 0 初始化状态 1图片上传中 2可以发送 3发送中 4发送完成 5课程已结束
        sendStatus: 0,
        submitText: this.$i18n.t('sendcfm') || '确认发送',
        text: '',
        imageURL: '',
        imageThumbURL: '',
        // 视频部分
        video: {
          url: '',
          // thumb: '',
          duration: '',
          size: '',
          width: '',
          height: ''
        },
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
          'group_id': this.group_id,
          'video': this.video
        }

        // 发送中
        this.sendStatus = 3;

        request.post(URL, params)
        .then( (res) => {
          if(res) {
            let data = res;
            self.sendStatus = 4;

            self.$toast({
              message: this.$i18n.t('sendsuccess') || '发送成功',
              duration: 2000
            });

            setTimeout(() => {
              self.$router.back();
            }, 2000)
          }
        }).catch(error => {
          this.sendStatus = 2;

          this.$toast({
            message: this.$i18n.t('networkerror2') || '网络不佳，答案提交失败，请重试',
            duration: 3000
          });
        });
      },

      /*
      * @method 返回主页面
      */
      handleBack() {
        this.$router.back();
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

          let isVideo = 'video/mp4' === fileType;
          if(isVideo) {
            if(size >= 50) {
              this.$toast({
                message: '视频不可超过50M，请重试',
                duration: 2000
              });

              return this;
            }

            Promise.all([upload.getToken()]).then(() => {
              // 上传七牛
              this.uploadFile(file).then((res)=>{
                res && this.getVideoInfo(res.url);
              });
            });

            return this;
          } else {
            if(size >= 10) {
              this.$toast({
                message: '图片不可超过10M，请重试',
                duration: 2000
              });

              return this;
            }
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

      /**
       * method 视频上传七牛
       * params
       */
      uploadFile(file) {
        let self = this;
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
              // todo: 给一个失败图图片吗 后面还需要重试吗 放入失败的队列
              reject(Object.assign(file, { url: '' }));
            },
            complete(res) {
              console.log(res);
              let url = domain + res.key;

              console.log("视频url:" + url);
              resolve(Object.assign(file, { url }));
            }
          };

          upload.upload(file, observer, 'file');
        });
      },

      /**
       * method 视频源信息(?avinfo)
       * params
       */
      getVideoInfo(url) {
        let URL = url + '?avinfo';

        $.ajax({
          type: 'GET',
          url: URL,
          dataType: 'json',
          success: (res) => {
            let data = res;

            if(data) {
              let streams = data.streams;
              let info = streams[0];
              let iofo2 = streams[1];
              let format = data.format;
              let width = info.width || iofo2.width;
              let height = info.height || iofo2.height;
              let video =  {
                'url': url,
                'thumb': `${url}?vframe/jpg/offset/2/w/${width}/h/${height}`,
                'duration': info.duration,
                'size': format.size,
                'height': height,
                'width': width
              };

              console.dir(video);

              this.hasImage = true;
              this.sendStatus = 2;
              this.video = video;
            }
          },
          error: (xhr, type) => {
          }
        })
      },

      handlelaodImg(evt) {
        let target = typeof event !== 'undefined' && event.target || evt.target;

        this.width = target.naturalWidth || target.width;
        this.height = target.naturalHeight || target.width;

        this.rate = this.width/this.height;
      },
      handleDeleteImg() {
        this.hasImage = false;
        this.imageURL = '';
        this.imageThumbURL = '';
        this.video = {
          url: '',
          duration: '',
          size: '',
          width: '',
          height: ''
        };

        !this.text && (this.sendStatus = 0);
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
        console.log(this.classroomid)
        // todo: 投稿分组，针对老师的特殊处理
        if (!this.classroomid) {
          this.selectedVal = "个人"
          this.groupList = [{
            value: 0,
            text: '个人'
          }]
        } else {
          this.getGroupList().then(data => {
            const list = data.filter(item => {
              const { team_info } = item
              if (team_info.joined) {
                item = Object.assign(item, {
                  value: team_info.team_id,
                  text: team_info.team_name
                })
              return item
              }
              return false
            })
            list.unshift({
              value: 0,
              text: '个人'
            })
            this.selectedVal = list[0].text
            this.groupList = [list]
          })
        }
      },
      /**
       * 展示picker
       */
      showPicker() {
        if (!this.classroomid) {
          return
        }
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
      this.classroomid = this.$route.query.classroomid

      // 获取学生分组列表
      this.pickerDataInit()
    },
    mounted() {
    },
    beforeDestroy() {
    }
  };
</script>

<style lang="scss" scoped>
  /*
    设置投稿人
  */
  .contributor-wrapper{
    height: 49px;
    line-height: 49px;
    background-color: #f8f8f8;
    color: #666;
    font-size: 17px;
    display: flex;
    padding: 0 15px;
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
    position: relative;
    width: 100%;
    height: 100%;

    text-align: center;
    align-items: flex-start;
  }

  .page__back {
    display: flex;
    justify-content: center;
    align-items: center;

    margin-left: -90px;
    margin-right: 12px;
    width: 78px;
    height: 32px;

    color: #5096f5;
    border: 1px solid #5096f5;
    border-radius: 16px/16px;

    cursor: pointer;
  }

  .submission-wrapper {
    position: relative;
    width: 375px;
    height: 100%;
    background: #fff;

    overflow-y: scroll;
    -webkit-overflow-scrolling: touch;
    border: 2px solid #eee;
  }

  .submission-inner {
    width: 375px;
    // height: 100%;
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
      padding: 5px;

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

      .img--loading {
        width: 75px;
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
        line-height: 29px;

        color: #fff;
        background: rgba(0,0,0,0.6);
      }

      .video--preview {
        width: 100%;
        height: 100%;
      }

    }

  }

  .submission__submit {
    margin: 0 auto 20px;
    width: 290px;
    height: 44px;
    line-height: 44px;

    color: #fff;
    background: #639EF4;

    border-radius: 4px;
  }

  .submission__submit.disable {
    background: #999999;
  }

  .submission__submit:active:not(.disable) {
    background: rgba(99,158,244,0.7);
  }


  .submission--tip {
    padding: 10px 0;
    color: #C7C7C7;
  }

  .submission-mine-link {
    color: #639EF4;
    text-decoration: underline;
  }


</style>

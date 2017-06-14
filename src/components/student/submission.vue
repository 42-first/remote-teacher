/*
 * @page：学生接收器投稿页面
 * @author: chenzhou
 * @update: 2017.6.8
 * @desc
 *
 */

<template>
  <section class="page-submission">
    <div :class="['hongbao-wrapper', 'animated', opacity ? 'zoomIn': '']">
      <!-- 文字编辑 -->
      <section class="submission__text">
        <div class="submission__textarea--wrapper f17">
          <textarea class="submission-textarea J_feed_content" maxlength="400" placeholder="这里可以为空" v-model="text"></textarea>
          <div class="submission-footer">
            <p class="">(<span class="">{{ count }}</span>/140)</p>
          </div>
        </div>
      </section>

      <!-- 图片 -->
      <section class="submission__pic">
        <div v-if="!hasImage">
          <div class="submission__pic--add" ><input type=file accept="image/*" class="camera" @change="handleChooseImageChange"></div>
          <p class="submission__pic--remark f14">上传图片（只能添加1张）</p>
        </div>
        <div class="pic-view" v-show="hasImage">
          <img :class="['J_preview_img', rate < 1 ? 'higher' : 'wider' ]" src="" alt="" @load="handlelaodImg" @click="handleScaleImage" />
          <p class="delete-img" @click="handleDeleteImg"><i class="iconfont icon-wrong f18"></i></p>
        </div>
      </section>

      <section :class="['submission__submit', 'f17', sendStatus === 0 || sendStatus === 3 ? 'disable': '']" @click="handleSend">确认发送</section>

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

  </section>
</template>
<script>
  import API from '@/util/Api'

  export default {
    name: 'submission-page',
    data() {
      return {
        index: 0,
        opacity: 0,
        title: '投稿',
        // 0 初始化状态 1可以发送 2发送中 3发送完成
        sendStatus: 0,
        text: '',
        imageURL: '',
        hasImage: false,
        count: 0,
        imageData: null,
        width: 0,
        height: 0,
        // 图片比例
        rate: 1
      };
    },
    beforeRouteEnter (to, from, next) {
      // 在渲染该组件的对应路由被 confirm 前调用
      // 不！能！获取组件实例 `this`
      // 因为当钩子执行前，组件实例还没被创建

      if(from.name === 'student-presentation-page') {
         next();
      } else {
        next(vm => {
          // history.back()
          vm.$router.go(-1)
        })
      }
    },
    components: {
    },
    computed: {
    },
    watch: {
      text(newValue, oldValue) {
        let value = newValue && newValue.substr(0, 140);

        this.count = value && value.length || 0;
        this.text = value;

        if(this.count) {
          this.sendStatus = 1;
        } else {
          this.sendStatus = 0;
        }
      },
      sendStatus(newValue, oldValue) {
        if(newValue === 2) {
          this.submitText = '正在发送';
        } else if(newValue === 3) {
          this.submitText = '发送完成';
        }
      }
    },
    filters: {
      formatTime(time) {
        return moment && moment(time).format('hh:mm:ss') || time;
      }
    },
    mixins: [],
    methods: {
      init(){
        wx.config({
          debug: true,
          appId: 'wx025cddf4e326abb7',
          timestamp: '1496904200',
          nonceStr: '7ku72mub2ch5xxe',
          signature: 'b4b003b2400a99e370beaab84d6025aceecb0b12',
          jsApiList: [ 'chooseImage', 'previewImage', 'uploadImage', 'downloadImage', 'getNetworkType',  'scanQRCode' ]
         });
      },
      /*
      * @method 发送投稿
      * @param
      */
      sendSubmission() {
        let self = this;
        let URL = API.student.SEND_SUBMISSION;
        let socket = this.$parent.socket;
        const content = this.text.replace(/^\s+|\s+$/g, '');
        let params = {
          'content': content,
          'pic': this.imageURL,
          'lesson_id': this.lessonID
        }

        // 发送中
        this.sendStatus = 2;

        return request.post(URL, params)
          .then(function (res) {
            if(res) {
              let data = res;

              setTimeout(() => {
                self.sendStatus = 3;
                self.handleBack();
              }, 3000)

              self.$toast({
                message: '发送成功',
                duration: 3000
              });

              return data;
            }
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

        return request.post(URL, params)
          .then(function (res) {
            if(res && res.data) {
              let data = res.data;

              self.imageURL = data.pic_url;
              console.log(self.imageURL);

              if(self.sendStatus === 0) {
                self.sendStatus = 1;
              }

              return self.imageURL;
            }
          });
      },
      handleChooseImage() {
        console.log(wx);

        wx.chooseImage({
          count: 1, // 默认9
          sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
          sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
          success: function (res) {
            var localIds = res.localIds; // 返回选定照片的本地ID列表，localId可以作为img标签的src属性显示图片
          }
        });
      },
      handleChooseImageChange() {
        let self = this;
        let targetEl = event.target;

        let file = targetEl.files[0];
        let reader = new FileReader();

        reader.onload = function(e) {
          let data = e.target.result;

          let imgEl = self.$el.querySelector('.J_preview_img');
          imgEl.src = self.imageData = data;

          // 上传图片
          self.uploadImage(data, file.type)
          self.hasImage = true;
        };

        reader.readAsDataURL(file);
        console.log(file);
      },
      handlelaodImg() {
        let target = event.target;

        this.width = target.naturalWidth || target.width;
        this.height = target.naturalHeight || target.width;

        this.rate = this.width/this.height;
      },
      handleDeleteImg() {
        let self = this;

        this.$messagebox.confirm('确定删除图片?').then(action => {
          if(action === 'confirm') {
            self.hasImage = false;
          }
        });

        // this.hasImage = false;
      },
      handleScaleImage() {
        let targetEl = event.target;
        let pswpElement = this.$el.querySelector('.J_submission_pswp');
        let index = 0;
        let items = [];

        // build items array
        items.unshift({ src: this.imageData, w: this.width || 750, h: this.height || 520 });

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
         this.sendStatus === 1 && this.sendSubmission();
      },
      handleBack() {
        this.$router.back();
      }
    },
    created() {
      this.lessonID = +this.$route.params.lessonID;
    },
    mounted() {
    },
    beforeDestroy() {
    }
  };
</script>

<style lang="scss">

  /*------------------*\
    $ 文字编辑
  \*------------------*/

  .hongbao-wrapper {
    will-change: opacity;
    -webkit-transition: opacity 333ms cubic-bezier(0.4, 0, 0.22, 1);
    transition: opacity 333ms cubic-bezier(0.4, 0, 0.22, 1);
    cursor: zoom-in;
  }

  .page-submission {
    z-index: 2;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;

    background: #fff;

    overflow-y: scroll;
    -webkit-overflow-scrolling: touch;
  }


  /*------------------*\
    $ 投稿文字
  \*------------------*/

  .submission__text {
    position: relative;
    margin: 0.266667rem 0.453333rem;

    background: #fff;
    border-bottom: 1px solid #C8C8C8;

    .submission-textarea {
      padding: 0.133333rem;

      width: 100%;
      height: 4.266667rem;
      border-width: 0;
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
    margin: 1.066667rem auto 2.266667rem;

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
        right: 0;
        bottom: 0;
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

        width: 0.693333rem;
        height: 0.693333rem;

        color: #fff;
        background: rgba(0,0,0,0.6);
      }

    }

  }

  .submission__submit {
    margin: 0.68rem auto 1.333333rem;
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




</style>



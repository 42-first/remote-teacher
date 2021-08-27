import upload from '@/util/upload'

let Photoswipe = require('photoswipe');
let PhotoSwipeUI_Default = require('photoswipe/dist/photoswipe-ui-default');
import 'photoswipe/dist/photoswipe.css'
window.PhotoSwipe = Photoswipe;
window.PhotoSwipeUI_Default = PhotoSwipeUI_Default; 

let imageMixin = {
  data: () => {
    return {
      retryTimes: 0
    }
  },
  methods: {
    resetPic(){
      this.imageURL = '';
      this.imageThumbURL = '';
      this.hasImage = false;
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

      // 课程结束啦
      if (this.sendStatus === 5) {
        return this;
      }

      if (file.size) {
        const size = parseInt(file.size / 1024 / 1024, 10);

        if (size >= 10) {
          this.$toast({
            message: this.$i18n.t('student.picsizelimit') || '图片不可超过10M，请重试',
            duration: 2000,
            type: 'warning'
          });

          return this;
        }
      }

      let picType = fileType && fileType.split('/').length === 2 && fileType.split('/')[1];
      // jpg,jpeg,bmp,png,gif
      if (!/png|jpg|jpeg/.test(picType)) {
        this.$toast({
          message: this.$i18n.t('student.reuploadpiconly') || '当前仅支持图片格式，请重新上传',
          duration: 2000,
          type: 'warning'
        });

        this.resetPic()

        return this;
      }

      this.hasImage = true;
      this.uploadImage(file, fileType);
    },
    /*
     * @method 上传图片
     * @param
     */
    uploadImage(data, fileType) {
      let self = this;

      // 上传七牛
      Promise.all([upload.getToken()]).
      then(() => {

        this.uploadFile(data).
        then((res) => {
          if (res.url) {
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
    },

    /**
     * method 上传七牛
     * params
     */
    uploadFile(file) {
      let domain = upload.qiniuDomain;

      return new Promise((resolve, reject) => {
        let observer = {
          next(res) {
            let total = res.total;
            let percent = total.percent;
          },
          error(err) {
            reject({
              url: ''
            });
          },
          complete(res) {
            let url = domain + res.key;
            resolve({
              url
            });
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

      if (retryTimes < 4) {
        setTimeout(() => {
          this.uploadImage(data, fileType);
        }, 2000 * retryTimes)

        this.retryTimes = retryTimes;
      } else {
        this.$toast({
          message: this.$i18n.t('student.networkerror') || '网络不佳，图片上传失败，请重新上传',
          duration: 3000,
          type: 'error'
        });

        // 帮用户清空上传
        this.resetPic()
        this.text && (this.sendStatus = 2);
        this.retryTimes = 0;
      }
    },
    /*
    * @method 图片放大
    * @param
    */
    handleScaleImage(evt) {
      let targetEl = evt.target;
      let pswpElement = document.querySelector('.J_pswp');
      let index = 0;
      let items = [];
      let src = targetEl.src;
      let width = targetEl.naturalWidth;
      let height = targetEl.naturalHeight;

      // build items array
      items.unshift({ src: src, w: width || 750, h: height });

      let options = {
        index: index,
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
      };

      // Initializes and opens PhotoSwipe
      let gallery;

      if(typeof PhotoSwipe !== 'undefined') {
        gallery = new PhotoSwipe(pswpElement, PhotoSwipeUI_Default, items, options);

        gallery.init();
      } else {
        setTimeout(()=>{
          gallery = new PhotoSwipe(pswpElement, PhotoSwipeUI_Default, items, options);
          gallery.init();
        }, 1500)
      }
    },
  },
}

export default imageMixin
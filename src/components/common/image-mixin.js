/*
 * 图片上传处理 华为P20等机型不触发input change事件 通过微信jssdk
 * @author: chenzhou
 * @update: 2019.08.2
 * @desc 图片选择 上传 预览
 *
 */


let wxMixin = {
  methods: {
    /*
     * @method 拍照选择图片后触发事件
     * @param
     */
    handleChooseImage(evt) {
      let self = this;

      wx.chooseImage({
        count: 1, // 默认9
        sizeType: ['original', 'compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          var localIds = res.localIds;

          localIds && localIds.every((localId) => {
            self.uploadImageToWx(localId);

            return true;
          });
        }
      });
    },

    /*
     * @method 上传图片
     * @param file 文件详情
     */
    uploadImage2(serverId) {
      let URL = '/v/quiz/image_upload_from_weixin';
      let params = {
        'media_id': serverId
      }

      return request.post(URL, params)
        .then((res) => {
          if(res && res.data) {
            let data = res.data;

            return { 'pic': data.pic_url, 'thumb': data.pic_url_thumb };
          }
        }).catch(error => {
          // 提交失败保存本地
          this.$toast({
            message: this.$i18n.t('networkerror2') || '网络不佳，答案提交失败，请重试',
            duration: 3000
          });

          return null;
        });
    },

    /*
     * @method 上传图片到微信服务器
     * @param file 文件详情
     */
    uploadImageToWx(localId) {
      let self = this;
      wx.uploadImage({
        localId: localId, // 需要上传的图片的本地ID，由chooseImage接口获得
        isShowProgressTips: 1, // 默认为1，显示进度提示
        success: (res) => {
          // 返回图片的服务器端ID
          var serverId = res.serverId;

          // 上传图片
          Promise.all([self.uploadImage2(serverId)])
          .then((res) => {
            let oPic = res[0];

            if(oPic) {
              self.hasImage = true;
              self.imageURL = oPic.pic;
              self.imageThumbURL = oPic.thumb;
              self.sendStatus = 2;

              if(typeof self.cacheResult === 'function') {
                self.cacheResult();
              }
            }
          });
        }
      });
    }

  }
}


export default wxMixin;

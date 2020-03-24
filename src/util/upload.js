/*
 * @page：雨课堂封装七牛上传
 * @author: chenzhou
 * @update: 2018.11.08
 * @desc 雨课堂上传七牛组件
 *
 */

import request from '@/util/request'
import * as qiniu from 'qiniu-js'


let fileupload = {
  qiniuDomain: 'https://qn-scd0.yuketang.cn/',
  bucketName: 'cms-attachment',
  tokenExpiredTime: 3600,

  config: {
    useCdnDomain: false,
    region: null, //qiniu.region.z1,
    retryCount: 3
  },

  putExtra: {
    fname: "",
    params: {},
    mimeType: null
  },

  /*
   * @method 获取七牛token
   */
  getToken() {
    let URL = '/pc/generate_qiniu_token';
    let params = {
      bucket_name: this.bucketName,
      expired_time: this.tokenExpiredTime
    };

    return request.post(URL, params)
    .then((res) => {
      if(res && res.data) {
        let data = res.data;

        this.uptoken = data.token;
        console.log("uptoken----s:"+ this.uptoken);

        return this.uptoken;
      }
    });
  },

  /*
   * @method 七牛上传
   * @params type: 文件类型 默认图片
   */
  upload(file, cbObserver, type, compress = true) {
    let time = (new Date()).getTime();
    let key = time + file.name;
    let domain = this.qiniuDomain;
    let observer = Object.assign({
      next(res) {
        let total = res.total;
        console.log("进度：" + total.percent + "% ");
      },
      error(err) {
        console.log(err);
      },
      complete(res) {
        console.log(res);
        let url = domain + res.key;
      }
    }, cbObserver);


    let subscription;
    // 调用sdk上传接口获得相应的observable，控制上传和暂停
    // 图片要考虑压缩处理
    let options = {
      quality: compress ? 0.7 : 1,
      noCompressIfLarger: true
      // maxWidth: 1000,
      // maxHeight: 618
    };

    // 文件上传
    if(type === 'file') {
      let observable = qiniu && qiniu.upload(file, key, this.uptoken, this.putExtra, this.config);
      observable.subscribe(observer);

      return observable;
    }

    qiniu.compressImage(file, options).then(data => {
      let observable = qiniu && qiniu.upload(data.dist, key, this.uptoken, this.putExtra, this.config);
      observable.subscribe(observer)
    })
  },

  /*
   * @method 初始化配置
   */
  init() {
    // tocken
    this.getToken();

    // 每小时拉取一下token
    this.timer = setInterval(()=>{
      this.getToken();
    }, 1000*60*60)
  }
}

// 上传初始化
// fileupload.init();

if (typeof define === 'function' && define.amd){
    // AMD. Register as an anonymous module.
    define(['exports'], function(){
        return fileupload;
    });
}

export default fileupload

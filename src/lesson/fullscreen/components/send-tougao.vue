/**
* @author [tuqiushuang]
* @email [tuqiushuang@xuetangx.com]
* @create date 2020-05-06 14:20:23
* @modify date 2020-05-06 14:20:23
* @desc [发送投稿]
*/
<template>
  <section class='sendTougao__page'>
    <div class="user" v-if="false">
      <span class="f12 c9b"><!-- 投稿人： --> {{ $t('student.poster') }}</span> 
      <span class="f12 cfff"><!-- (自己) --> {{ $t('student.own') }}</span>
      <!-- <span class="switch-icon">
        <svg class="icon f24 cc8" aria-hidden="true" >                 
          <use xlink:href="#icon16-xiaojiantou-xia" ></use>
        </svg>
      </span> -->
    </div>
    <section class="send__container">
      <div class="text__box">
        <textarea class="tougao-textarea" maxlength="1000" :placeholder="$t('postplaceholder')" v-model="text"></textarea>
        <p class="count">({{count}}/1000)</p>
      </div>
      <div class="pic__box">
        <div style="text-align: left;" v-if="!hasImage&&!loading">
          <div class="pic--add f12" >
            <input type=file accept="image/*,video/mp4,video/mpeg" class="camera" :disabled="lessonStatus ? true : false" @change="handleChooseImageChange" >
            <i class="iconfont icon--tianjiatupiancopy f16"></i><!-- 添加图片{{ $t('addpic') }}  --> 可上传一张图片或一个小视频
          </div>
        </div>
        <div class="pic-view" v-show="hasImage||loading">
          <div class="image__item">
            <img class="image--thumb J_preview_img" alt="" v-show="hasImage" :src="imageURL" @click="handleScaleImage($event)" v-if="imageURL" />
            <div class="donut"  v-else-if="!imageURL && !video">
              <i class="iconfont f40 icon--jiazaiwubaidi1"></i>
              <!-- 正在上传 --> {{ $t('uploading') }} 
            </div>
            <!-- 视频 -->
            <video class="video--preview" :src="video.url" controls :poster="video.thumb" v-if="video && video.url" >
            </video>
            <p class="delete-img" @click="handleDeleteImg" v-show="hasImage && (imageURL || (video && video.url))"><i class="iconfont icon-ykq_shanchu f18"></i></p>
          </div>
        </div>
      </div>
    </section>
    <div class="submit pointer" :class="sendStatus === 0 || sendStatus === 1 || sendStatus >= 4 || lessonStatus ? 'disable': ''" @click="handleSend">{{submitText}}</div>
  </section>
</template>

<script>

import imageMixin from '../mixin/image-mixin.js'
import {  mapState, mapActions } from 'vuex'

import { isSupported } from '@/util/util'


export default {
  name: "send-tougao",
  components: {},
  data() {
    return {
      text: '',
      imageURL: '',
      imageThumbURL: '',
      hasImage: false,
      // 图片加载中
      loading: false,
      count: 0,
      // 0 初始化状态 1图片上传中 2可以发送 3发送中 4发送完成 5课程已结束
      sendStatus: 0,
      submitText: this.$i18n.t('confirmsend') || '确认发送',
      // 视频部分
      video: null,
    };
  },
  filters: {},
  props: {},
  mixins: [ imageMixin ],
  computed: {
    ...mapState([
      'lesson',
      'lessonStatus'
    ]),
    lessonID(){
      return this.lesson.lessonId
    }
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
        this.cacheResult();
      } else {
        !this.hasImage && (this.sendStatus = 0);
      }
    },
    sendStatus(newValue, oldValue) {
      if(newValue === 3) {
        this.submitText = this.$i18n.t('issending') || '正在发送';
      } else if(newValue === 1) {
        this.submitText = this.$i18n.t('picuploading') || '图片上传中';
      } else if(newValue === 2 || newValue === 0) {
        this.submitText = this.$i18n.t('confirmsend') || '确认发送';
      } else if(newValue === 4) {
        this.submitText = this.$i18n.t('sendsucc') || '发送成功';
      } else if(newValue === 5) {
        this.submitText = this.$i18n.t('lessonend') || '课程已结束';
      }
    },
    lessonStatus(newVal){
      this.sendStatus = 5
    }
  },
  methods: {
    handleSend() {
      this.sendStatus === 2 && this.sendSubmission();
    },
    /*
     * @method 发送投稿
     * @param
    */
    sendSubmission() {
      let self = this;
      let URL = API.lesson.add_tougao;
      const content = this.text.replace(/^\s+|\s+$/g, '');
      let params = {
        'content': content,
        'picture': this.imageURL,
        // 'video': this.video
        // 'group_id': self.data.group_id,
        // 'team_id': self.data.team_id,
      };

      if(this.video) {
        params['video'] = this.video;
      }

      // 发送中
      this.sendStatus = 3;

      request.post(URL, params).
      then((res)=>{
        if(res && res.code === 0) {
          this.sendStatus = 4;

          setTimeout(() => {
            this.resetData();
            this.$emit('updateList')
          }, 2000)

          this.$toast({
            message: this.$i18n.t('sendsuccess') || '发送成功',
            duration: 2000
          });

          this.removeCache();
        }
      }).
      catch(error => {
        console.log('add_tougao:', error);
        this.sendStatus = 2;

        this.$toast({
          message: this.$i18n.t('networkerror2') || '网络不佳，答案提交失败，请重试',
          duration: 3000
        });
      })
    },
    /*
     * @method 缓存投稿
     * @param
    */
    cacheResult() {
      // 定时保存
      this.cacheTimer && clearTimeout(this.cacheTimer);
      this.cacheTimer = setTimeout(() => {
        // 缓存到本地
        let key = 'lessontougao' + this.lessonID;
        let result = {
          'text': this.text
        };

        result['imageURL'] = this.imageURL;
        result['imageThumbURL'] = this.imageThumbURL;

        if(isSupported) {
          localStorage.removeItem(key);
          localStorage.setItem(key, JSON.stringify(result));
        }
      }, 3000)
    },

    resetData(){
      this.text = ''
      this.imageURL = ''
      this.imageThumbURL = ''
      this.hasImage = false
      this.loading = false
      this.sendStatus = 0
      this.video = null
    },

    /*
     * @method 删除缓存
     * @param
    */
    removeCache() {
      let key = 'lessontougao' + this.lessonID;
      if(isSupported) {
        this.cacheTimer && clearTimeout(this.cacheTimer);
        localStorage.removeItem(key);
      }
    },
  
    handleDeleteImg(index) {
      let self = this;
      this.$rainConfirm({
        data: {
          title: this.$i18n.t('tips') || "提示",
          message: this.video ? '确定删除视频？' : this.$i18n.t('cfmdelpic') || '确定删除图片?',
          showCancel: true,
          confirmText: '删除',
          cancelText: '取消',
          confirmClass: 'del',
          reverse: true
        },
        cancel: () => {
        },
        confirm: () => {
          this.resetPic()
          !self.text && (self.sendStatus = 0);
          self.cacheResult();
        },
      });
    },
    
    /*
     * @method 恢复作答结果
     * @param
    */
    restore() {
      // 恢复作答结果
      let sResult = localStorage.getItem('lessontougao' + this.lessonID);
      if(sResult) {
        let result = JSON.parse(sResult);
        this.text = result.text;
        // 是否有图片
        if(result.imageURL) {
          this.hasImage = true;
          this.imageURL = result.imageURL;
          this.imageThumbURL = result.imageThumbURL;

          setTimeout(()=>{
            let imgEl = this.$el.querySelector('.pic-view .J_preview_img');
            imgEl.src = this.imageURL;
          }, 300)
        }

        this.sendStatus = 2;
      }
    },
  },
  created() {
    this.lessonStatus == 1 && (this.sendStatus = 5)
    !this.lessonStatus && this.restore()
  },
  mounted() {},
  updated() {},
  beforeDestroy() {},
  destroyed() {}
};
</script>
<style lang='scss' scoped>
.sendTougao__page {
  width: 100%;
  height: 100%;
  padding: 0 20px;
  overflow: hidden;
  .user {
    padding-left: 10px;
    text-align: left;
  }
  .send__container {
    // margin-top: 10px;
    width: 100%;
    height: calc(100% - 70px);
    
    overflow: hidden;
    overflow-y: auto;
    // padding: 0 5px;
    
    .text__box {
      position: relative;
      padding: 15px 10px 26px;
      height: 261px;
      border: 1px solid #ddd;
      border-radius: 4px;

      .tougao-textarea {
        font-size: 16px;
        color: #666;
        width: 100%;
        height: 215px;
        border-width: 0;
        -webkit-user-select: auto;
        background: transparent;

      }

      .tougao-textarea::-webkit-input-placeholder {
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
    .pic__box {
      padding: 10px 0;
      
      .pic--add {
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
      .pic-view {
        position: relative;
        // margin: 20px auto;
        
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
            max-width: 100%;
            max-height: 100%;
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

        .video--preview {
          width: 100%;
          height: 100%;
        }

      }
    }
  }

  .submit {
    width: 100%;
    height: 34px;
    text-align: center;
    line-height: 34px;
    border-radius: 4px;
    background: #5096F5;
    color: #ffff;
    margin: 20px auto;
    &.disable {
      background: #ddd;
      color: #9B9B9B;
    }
  }
}
</style>
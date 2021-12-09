/**
* @author [tuqiushuang]
* @email [tuqiushuang@xuetangx.com]
* @create date 2020-05-06 14:20:23
* @modify date 2020-05-06 14:20:23
* @desc [已发送投稿列表]
*/
<template>
<section class='tougao__list'>
  <template v-if="loaded">
    <ul class="list__wrap" v-if="submissionlist.length">
      <li class="list__item box-between" v-for="(item, index) in submissionlist" :key="item.tougaoId">
        <div class="time f14 c333">
          {{ item.createTime | getTimeago }}
          <div class="delete-btn box-center pointer" @click="handleWithdraw(index, item.tougaoId)">
            <i class="iconfont icon-ykq_shanchu f20 color-f8"></i>
          </div>
        </div>
        <div class="content_box">
          <div v-if="item.content" class="text f12 c333">
            {{item.text}}
            <template v-if="item.hasMore">
              <span class="content__expand pointer blue f16" :class="{'rotate': item.isCollapse}" @click="handleCollapse(index, !item.isCollapse)">
              <svg class="icon f16 blue " aria-hidden="true">
                <use xlink:href="#icon16-xialashuangjiantouxiangshang" ></use>
              </svg>
              </span>
            </template>
          </div>
          <div class="img__box" v-if="item.thumb || item.picture">
            <img v-if="item.thumb || item.picture" :src="item.thumb || item.picture" alt="" @click="handleScaleImage($event)">
          </div>
          <!-- 视频展示 -->
          <div class="video__preview" v-if="item.video && item.video.url">
            <video :src="item.video.url" :poster="poster" ref="video" controls ></video>
          </div>
        </div>
      </li>
    </ul>
    <section v-else class="empty box-center">
      <svg class="icon f40 c7a" aria-hidden="true">
        <use xlink:href="#icon40-kong" ></use>
      </svg>
      <p class="f14 c7a mt10"><!--暂无投稿--> {{ $t('nopost') }} </p>
    </section>
  </template>
  <template v-else>
    <div class="loading box-center">
      <img class="loading--icon " src="https://qn-sfe.yuketang.cn/o_1cm4avc11ima6l71v0f19lb1fqq9.png" alt="">
      <p class="pr10 f16 c9b"><!-- 正在加载，请稍后... --> {{ $t('toploading') }} </p>
    </div>
  </template>
</section>
</template>

<script>
import timeago from 'timeago.js';

let locale = window.i18n && window.i18n.locale || 'zh_CN';
// 在这里设置相对时间
let timeagoInstance = timeago(null, locale);

if (locale != 'en' && locale != 'zh_CN') {
  timeago.register(locale, require('timeago.js/locales/' + locale));
}
import imagemixin from '../mixin/image-mixin'
// import videoCmp from './video'

export default {
  name: "tougao-detail",
  components: {
    // videoCmp
  },
  data() {
    return {
      submissionlist: [],
      loaded: false
    };
  },
  filters: {
    getTimeago(time) {
      return timeagoInstance.format(time, window.i18n && window.i18n.locale === 'en' ? 'en': 'zh_CN');
    }
  },
  props: {},
  mixins: [ imagemixin ],
  computed: {},
  watch: {
    
  },
  methods: {
    /** 
     * @method 获取已发送的投稿列表
     * @params
    */
    getMySubmission(){
      let URL = API.lesson.get_tougao_list;
      let params = {
        'start': -1,
        'count': 100,
        'type': 1
      };

      request.get(URL, params)
      .then( res =>{
        if (res && res.code === 0 && res.data) {
          let data = res.data;

          if(data.totalNum) {
            if (data.items && data.items.length) {
              let list = this.formatData(data.items);
              
              this.submissionlist = list;

              console.log('getMySubmission:', list);
            } else {
              this.submissionlist = []
            }
          } else {
            this.isEmpty = true;
          }
          this.loaded = true
        }
      }).
      catch(error => {
        this.loaded = true
        this.submissionlist = [];
        console.log('getMySubmission:', error);
      });
    },
    /*
     * @method 撤回
     * @param
    */
    handleWithdraw(index, id) {
      this.$rainConfirm({
        data: {
          title: this.$i18n.t('recallconfirm') || "确定要撤回本条投稿吗？",
          message: this.$i18n.t('recallresult') || "撤回后老师端将同时消失",
          showCancel: true,
          confirmText: this.$i18n.t('recall') || '撤回',
          cancelText: this.$i18n.t('cancel') || '取消',
          confirmClass: 'del'
        },
        cancel: () => {
          console.log("取消撤回");
        },
        confirm: () => {
          this.deleteSubmission(index, id);
        },
      });
    },
    /*
     * @method 删除投稿
     * @param
    */
    deleteSubmission(index, id) {
      let URL = API.lesson.delete_tougao;
      let params = {
        'tougaoId': id
      };

      request.post(URL, params).
      then((res)=>{
        if(res && res.code === 0) {
          this.submissionlist.splice(index, 1)
        }
      }).
      catch(error => {
        console.log('delete_tougao:', error);
      })
    },
    /*
     * @method 格式化投稿控制文字收起展开
     * @param
    */
    formatData(data) {
      data.forEach((item)=>{
        if(item.content && item.content.length > 69) {
          item.text = item.content.substr(0, 60) + '…';
          item.isCollapse = true;
          item.hasMore = true;
        } else {
          item.text = item.content;
        }
      })

      return data;
    },
    /*
     * @method 展开收起投稿
     * @param
    */
    handleCollapse(index, isCollapse) {
      let submission = this.submissionlist[index];

      if(submission) {
        submission.isCollapse = isCollapse

        if(isCollapse) {
          submission.text = submission.content.substr(0, 60) + '…';
        } else {
          submission.text = submission.content;
        }
      }

    },
  },
  created() {
    this.getMySubmission()
  },
  mounted() {
    
  },
  updated() {},
  beforeDestroy() {},
  destroyed() {}
};
</script>
<style lang='scss' scoped>
.color-f8 {
  color: #F84F41;
}
.tougao__list {
  height: 100%;
  overflow: hidden;
  .list__wrap {
    width: 100%;
    height: 100%;
    overflow-y: auto;
    text-align: left;
    .list__item {
      padding: 10px;
      border-radius: 4px;
      align-items: flex-start;
      margin-bottom: 10px;
      &:hover {
        // background: #18191A;
        .delete-btn {
          display: flex;
          width: 32px;
          height: 32px;
          border-radius: 50%;

          // background: #FFA1A1;
          margin-top: 20px;
        }
      }
      .time {
        width: 60px;
      }
      .delete-btn {
        display: none;
      }
      .content_box {
        margin-left: 10px;
        flex: 1;
        overflow: hidden;
        .text {
          line-height: 17px;
        }
        .content__expand {
          display: inline-block;
          transition: all .3s ease-in;
          &.rotate {
            transform: rotate(180deg);
          } 
        }
        
      }
      .img__box {
        width: 120px;
        height: 120px;
        background: transparent;
        text-align: left;
        margin-top: 10px;
        img {
          max-width: 100%;
          max-height: 100%;
        }
      }
      .video__preview {
        margin-top: 10px;
        video {
          width: 100%;
        }
      }
    }
  }
  .empty {
    width: 100%;
    height: 100%;
    flex-direction: column;
    margin-top: -50px;
  }

  .loading {
    width: 100%;
    height: 100%;
    margin-top: -50px;

    .loading--icon {
      width: 40px;
      height: 40px;
      animation: rotating 2s linear infinite;
    }
  }
  @keyframes rotating {
    0% {
      transform: rotate(0deg);
    }

    100% {
      transform: rotate(1turn);
    }
  }
}
</style>
<template>
  <section class="page__discuss">
    <header class="page__header box-between">
      <div class="title box-center">
        <i class="iconfont icon-a-fenzujiegouzuo f24"></i>
        <span class="f17 bold">{{teamName}}</span>
      </div>
      <div class="box-center">
        <div class="box-center detail" v-if="!visibleEventDetail" @click="handleToggleEventDetail">
          <i class="iconfont icon-jiaoxueneirong-7taolun f16 mr4"></i>
          <span class="f13"><!--查看主题 --> {{ $t('viewdiscusstopic') }} </span> 
        </div>
        <div class="close box-center"  @click="handleBack">
          <i class="iconfont icon-cuowu f20"></i>
        </div>
      </div>
    </header>
    <div class="discuss-info box-between" v-if="visibleEventDetail">
      <div class="name f16">{{ eventInfo.name }}</div>
      <div class="close box-center" @click="handleToggleEventDetail">
        <i class="iconfont icon-cuowu f16"></i>
      </div>
    </div>
    <section class="chat__wrap" @scroll="handleScroll">
      <div
        class="msg--item"
        :class="[item.senderId == mineId ? 'me' : '', `J_msg-${index}`]"
        v-for="(item, index) in chatRecords"
        :key="index"
      >
        <div class="msg">
          <div class="avatar">
            <img :src="userInfos[item.senderId].avatar" alt="" />
          </div>
          <div class="content_box">
            <p class="user-name f12">
              {{ userInfos[item.senderId].name }}
              <template v-if="item.senderId == mineId"><!-- (我)-->{{ $t('danmume') }}</template>
            </p>
            <div class="content" :class="item.content.text ? 'bg' : ''">
              <img :class="item.content.text ? 'h120' : 'h160'" v-if="item.content.pic" :src="item.content.pic" />
              <div v-if="item.content.text" class="text">{{ item.content.text }}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
    <footer class="page__footer" :class="hasImage ? 'heightauto': ''">
      <div class="btns box-start" v-if="eventInfo.requireSummary">
        <div class="btn f15" @click="handleShowSubmitSummary"><!-- 提交结果 -->{{ $t('submitsummary') }}</div>
      </div>
      <div class="input-box" :class="focus ? 'active' : ''">
        <div class="pic-preview box-start" v-if="hasImage">
          <img :src="pic" alt="">
          <div class="clear" @click="handleClearPic">
            <i class="iconfont icon-guanbi f16"></i>
          </div>
        </div>
        <input
          type="text"
          v-model="sendMsg"
          @focus="focus = true"
          @blur="focus = false"
          :placeholder="$t('pleaseenter')"
          class="input f16"
        />
        <div class="box-between">
          <div class="pics box-center">
            <input
              :disabled="isEnd"
              type="file"
              class="file-input"
              accept="images/*"
              @change="handleChooseImageChange"
            />
            <i class="iconfont icon-tianjiatupian- f24"></i>
          </div>
          <div class="btn box-center" :class="{ disabled: !sendMsg && !pic }" @click="handleSendMsg">
            <i class="iconfont icon-48fabu f20"></i>
          </div>
        </div>
      </div>
    </footer>

    <section class="submit-summary" v-if="visibleSubmitSummary">
      <div class="container">
        <div class="header box-center">
          <div class="close box-start" @click="handleCloseSummary">
            <i class="iconfont icon-cuowu f20"></i>
          </div>
          <div class="f17 bold title"><!-- 提交结果 -->{{ $t('submitsummary') }}</div>
          <div class="submit box-center" @click="handleSubmitSummary"><!-- 提交 -->{{ $t('submit') }}</div>
        </div>

        <div class="content-box">
          <textarea class="f15" v-model="tempSummary" name="" id="" :placeholder="$t('enterteamsummary')"></textarea>
        </div>
      </div>
    </section>
  </section>
</template>

<script>
import { mapState, mapActions } from "vuex";
import { compress } from "@/util/image";
import imagemixin from "@/components/common/image-mixin";
import upload from "@/util/upload";
import _ from 'underscore'

export default {
  name: "group-discuss",
  props: {},
  data() {
    return {
      teamid: 0,
      eventid: 0,
      team: null,
      chatRecords: [],
      mineId: "",
      userInfos: null,
      sendMsg: "",
      pic: '',
      hasImage: false,
      retryTimes: 0,
      visibleSubmitSummary: false,
      summary: '',
      teamName: '',
      eventInfo: {},
      visibleEventDetail: false,
      focus: false,
      isEnd: false,
      tempSummary: ''
    };
  },
  computed: {
    ...mapState(["lessonId", "observerMode", "cards"]),
  },
  filters: {},
  methods: {
    ...mapActions(['setCards']),

    init() {
      this.fetchData();

      this.initPubSub();

      // 处理弹出的消息
      this.$parent.msgBoxs.forEach((item, index) => {
        if(item.type === 16 && item.eventid == this.eventid) {
          this.$parent.msgBoxs.splice(index, 1);
        }
      })

      // 下拉加载更多
      this.scrollThrottled = _.throttle(evt => {
        let $list = evt.target
        let clientHeight = $list.clientHeight;
        let totalHeight = $list.scrollHeight;
        let scrollTop = $list && $list.scrollTop;
        let leaveHeight = totalHeight - clientHeight - scrollTop;

        if(scrollTop > this.lastScrollTop) {
          if(scrollTop - this.lastScrollTop > 100) {
            this.scrollLock = false
          }
        } else {
          if(this.lastScrollTop - scrollTop > 100) {
            this.scrollLock = true
          }
        }

        this.lastScrollTop = scrollTop

      }, 100);
    },

    /**
     * @method 初始化订阅事件
     * @param
     */
    initPubSub() {
      // 取消练习的订阅
      PubSub && PubSub.unsubscribe("groupevent");

      // 订阅定时消息
      PubSub && PubSub.subscribe("groupevent.groupchat", (topic, data) => {
        if (data.eventid == this.eventid) {
          this.addNewMsg(data);
        }
      });

      PubSub && PubSub.subscribe("groupevent.gefinished", (topic, data) => {
        if (data.eventid == this.eventid) {
          this.isEnd = true
        }
      });

      PubSub && PubSub.subscribe("groupevent.geext", (topic, data) => {
        if (data.eventid == this.eventid) {
          this.isEnd = false
        }
      });

      PubSub && PubSub.subscribe("groupevent.groupresult", (topic, data) => {
        if(data.eventid == this.eventid && data.teamid == this.teamid) {
          this.summary = data.result
        }
      })
    },

    addNewMsg(data) {
      this.chatRecords.push({
        senderId: data.uid,
        type: data.type,
        content: data.content,
      });
    },

    fetchData() {
      let URL = API.lesson.get_group_chat_message
      let params = {
        eventId: this.eventid,
        teamId: this.teamid
      }

      return request.get(URL, params)
      .then(res => {
        if(res && res.code == 0 && res.data) {
          let data = res.data
          this.eventInfo = data.eventInfo
          this.teamName = data.teamName
          this.chatRecords = data.chatRecords
          this.userInfos = data.userInfos.reduce((acc, item) => {
            acc[item.identityId] = item
            return acc
          }, {})
          this.teamid = data.teamId
          this.summary = data.summary
          this.tempSummary = data.summary

          this.mineId = this.$parent.identityId || this.$parent.userID || window.identityId || window.userId;
        }
      })
    },

    fetchDiscussInfo() {},

    /*
     * @method 选择拍照后触发事件
     * @param
     */
    handleChooseImageChange(evt) {
      let self = this;
      let targetEl =
        (typeof event !== "undefined" && event.target) || evt.target;

      let file = targetEl.files[0];
      if (file) {
        let fileType = file.type;

        console.log("MIME类型：" + fileType);
        let picType = fileType && fileType.split("/").length === 2 && fileType.split("/")[1];

        if (!/png|jpg|jpeg/.test(picType)) {
        this.$toast({
          message:
            this.$i18n.t("reuploadpiconly") || "当前仅支持图片格式，请重新上传",
          duration: 2000,
        });

        this.hasImage = false;

        return this;
      }

        if (file.size) {
          const size = parseInt(file.size / 1024 / 1024, 10);
          if (size >= 10) {
            this.$toast({
              message:
                this.$i18n.t("picsizelimit") || "图片不可超过10M，请重试",
              duration: 2000,
            });

            return this;
          }
        }
        // 图片处理参数
        let options = {
          compress: {
            width: 1600,
            height: 1600,
            quality: 0.6,
          },
        };

        compress(file, options, function (dataUrl) {
          if (dataUrl) {
            self.hasImage = true
            self.pic = ''
            // 上传图片
            // self.uploadImage(dataUrl, fileType);
            self.uploadImage(file, fileType);
          }
        });
      }
    },

    /*
     * @method 上传图片
     * @param
     */
    uploadImage(data, fileType) {
      let self = this;
      let URL = API.student.UPLOAD_PIC;
      let params = {
        pic_type: "",
      };

      let picType = fileType && fileType.split("/").length === 2 && fileType.split("/")[1];

      // 上传七牛
      Promise.all([upload.getToken()]).then(() => {
        let randomNumber = parseInt(Math.random() * 10000, 10);
        let fileName = `${this.lessonId}${data.length}${randomNumber}.${picType}`;
        // let file = dataURLtoFile(data, fileName);
        this.uploadFile(data)
          .then((res) => {
            if (res.url) {
              this.pic = res.url
            } else {
              this.retryUpload(data, fileType);
            }
          })
          .catch((error) => {
            this.retryUpload(data, fileType);
          });
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
        this.pic = ''
        this.hasImage = false;
        this.retryTimes = 0;
      }
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

    handleClearPic() {
      this.pic = '';
      this.hasImage = false
    },

    handleSubmitSummary() {
      if(this.isEnd) {
        this.$toast({
          message: this.$t('discussisend') || '当前讨论已结束',
          duration: 3000
        });

        return
      }

      let URL = API.lesson.submit_group_summary
      let params = {
        teamId: this.teamid,
        summary: this.tempSummary,
        eventId: this.eventid
      }

      return request.post(URL, params).then(res => {
        if(res && res.code == 0 && res.data) {
          this.visibleSubmitSummary = false
          this.summary = this.tempSummary
          
          let data = this.cards[this.index]
          data.status = this.$t('done') || '已完成'
          data.finishedStatus = 2
          // 替换原来的数据
          this.cards.splice(this.index, 1, data);
          this.setCards(this.cards);
        }else if(res.code == 50100) {
          this.$toast({
            message: this.$t('discussisend') || '当前讨论已结束',
            duration: 3000
          })
        }
      })
    },

    handleBack() {
      this.$router.back()
    },

    handleToggleEventDetail() {
      this.visibleEventDetail = !this.visibleEventDetail
    },

    handleSendMsg() {
      if(this.isEnd) {
        this.$toast({
          message: this.$t('discussisend') || '当前讨论已结束',
          duration: 3000
        });

        return
      }
      let URL = API.lesson.send_group_message
      let params = {
        teamId: this.teamid,
        content: {
          text: this.sendMsg,
          pic: this.pic
        },
        eventId: this.eventid
      }

      return request.post(URL, params).then(res => {
        if(res && res.code == 0 && res.data) {
          this.chatRecords.push({
            senderId: this.mineId,
            content: params.content,
          })

          this.sendMsg = ''
          this.pic = ''
          this.hasImage = false

          let data = this.cards[this.index]
          data.status = !data.finishedStatus ? this.$t('underway') || '进行中' : data.status
          data.finishedStatus = !data.finishedStatus ? 1 : data.finishedStatus
          // 替换原来的数据
          this.cards.splice(this.index, 1, data);
          this.setCards(this.cards);
        }else if(res.code == 50100) {
          this.$toast({
            message: this.$t('discussisend') || '当前讨论已结束',
            duration: 3000
          })
        }
      })
    },

    handleScroll(e) {
      this.scrollThrottled(e)
    },

    handleCloseSummary() {
      this.tempSummary = this.summary
      this.visibleSubmitSummary = false
    },

    handleShowSubmitSummary() {
      this.tempSummary = this.summary
      this.visibleSubmitSummary = true
    }
  },
  watch: {
    '$route' (to, from) {
      if(to && to.params && to.name === 'group-discuss') {
        let {eventid, index} = to.params
        this.index = index
        this.eventid = eventid;
        if(eventid) {
          this.fetchData()
          this.summary = ''
          this.sendMsg = ''
          this.pic = ''
          this.hasImage = false
          this.visibleSubmitSummary = false
          this.isEnd = false
        }
        // 处理弹出的消息
        this.$parent.msgBoxs.forEach((item, index) => {
          if(item.type === 16 && item.eventid == eventid) {
            this.$parent.msgBoxs.splice(index, 1);
          }
        })
      }
    },

    chatRecords(newVal) {
      if(newVal.length) {
        let index = newVal.length - 1
        this.$nextTick(() => {
          let el = this.$el.querySelector(`.J_msg-${index}`)
          setTimeout(()=>{
           !this.scrollLock && el && el.scrollIntoView({ behavior: "instant", block: 'center' });
          }, 0)
        })
        
      }
    }
  },
  created() {
    let { eventid, index } = this.$route.params;
    this.eventid = eventid;
    this.index = index;

    this.init();
  },
  mounted() {},
  beforeDestroy() {},
};
</script>


<style lang="scss" scoped>
.page__discuss {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 1;
  background: #f7f9ff;

  display: flex;
  flex-direction: column;
  overflow: hidden;

  .page__header {
    padding: 0.2133rem 0.4267rem;
    color: #2b2e35;
    .title {
      .iconfont {
        margin-right: 0.1067rem;
        background: linear-gradient(
          98.52deg,
          #19c2d8 0.29%,
          #5cb0ff 50.14%,
          #83e7ff 100%
        );
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }
    }

    .close {
      width: 0.96rem;
      height: 0.96rem;

      .iconfont {
        color: #6984bd;
      }
    }

    .detail {
      padding: 0 0.3733rem;
      height: 0.7467rem;
      box-sizing: border-box;
      border: 1px solid var(--border-border-gray-02, #2D4A9424);
      border-radius: 0.96rem;
      color: #90949D;
    }
  }

  .discuss-info  {
    padding: 0.16rem 0.4267rem 0.16rem 0.64rem;
    box-sizing: border-box;
    border: 1px solid #B6D3FF;
    background: #B6D3FF25;
    border-radius: 0.16rem;
    margin: 0.2133rem 0.4267rem 0.64rem;
    line-height: 0.6933rem;
    color: #2B2E35;
    text-align: left;

    .close {
      color: #B6BAC5;
      width: 0.7467rem;
      height: 0.7467rem;
      margin-left: 0.32rem;
      align-self: flex-start;
    }
  }

  .chat__wrap {
    flex: 1;
    overflow: auto;
    padding: 0 0.4267rem;

    .msg--item {
      margin-bottom: 0.4267rem;
      text-align: left;
      .msg {
        display: inline-flex;
      }
      &.me {
        text-align: right;
        .msg {
          flex-direction: row-reverse;

          .content {
            &.bg {
              background: #d0e2ff;
              border-radius: 0.32rem 0 0.32rem 0.32rem;
            }
            text-align: left;
          }
        }
      }

      .h120 {
        max-height: 3.2rem;
        max-width: 3.2rem;
      }

      .h160 {
        max-height: 4.2667rem;
        max-width: 4.2667rem;
      }

      .avatar {
        width: 48px;
        height: 48px;

        img {
          width: 100%;
          height: 100%;
          border-radius: 50%;
        }
      }

      .content_box {
        max-width: 6.2667rem;

        margin: 0 0.2133rem;

        .user-name {
          color: #90949d;
          margin-bottom: 0.1067rem;
        }

        .content {
          &.bg {
            border-radius: 0 24rpx 24rpx 24rpx;
            background: #fff;
            padding: 0.32rem 0.5333rem;
            box-sizing: border-box;
            text-align: left;
          }
        }

        .img {
          max-width: 6.2667rem;
        }
      }
    }
  }

  .page__footer {
    width: 100%;
    height: 4.2667rem;
    padding: 0.4267rem 0.4267rem 0.2667rem;

    &.heightauto {
      height: auto;
    }

    .btns {
      .btn {
        padding: 0.1333rem 0.32rem;
        border: 0.0267rem solid #bde8ff;
        background: #ddf3ff;
        color: #2b2e35;
        border-radius: 6px;
        line-height: 0.5333rem;
      }
    }

    .input-box {
      margin-top: 0.32rem;
      padding: 0.32rem 0.32rem 0.2667rem;
      border-radius: 0.32rem;
      position: relative;
      background: #fff;

      &::before {
        content: '';
        position: absolute;
        width: calc(100% + 0.08rem);
        height: calc(100% + 0.08rem);
        background: var(--border-border-gray-02, #2D4A9424);
        border-radius: 0.32rem;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: -1;
      }

      &.active {
        &::before {
          background: linear-gradient(90deg, #EEA3EE 0%, #A79DF9 29.15%, #AAC8FB 56.75%, #ACF1FD 75.36%, #5698F4 100%);
        }
      }

      .iconfont {
        line-height: 1;
      }

      .pic-preview {
        width: 2.1333rem;
        height: 2.1333rem;
        position: relative;

        img {
          width: 100%;
          height: 100%;
          border-radius: 0.16rem;
          background: rgba(0,0,0,.1);
        }

        .clear {
          position: absolute;
          top: -0.2133rem;
          right: 0;
        }
      }

      .input {
        width: 100%;
        height: 0.6933rem;
        background: transparent;
        border: none;
        margin-bottom: 0.2667rem;
      }

      .pics {
        width: 0.7467rem;
        height: 0.7467rem;
        margin-left: -0.1067rem;
        position: relative;

        .file-input {
          position: absolute;
          opacity: 0;

          width: 100%;
        }
      }

      .btn {
        width: 1.1733rem;
        height: 0.8533rem;
        background: #3d7bff;
        border-radius: 0.16rem;
        color: #fff;
        &.disabled {
          background: #d2d7e5;
          pointer-events: none;
        }
      }
    }
  }

  .submit-summary {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    z-index: 3;
    background: var(--mask-Mask-02, #11131866);

    .container {
      height: 90%;
      width: 100%;
      position: absolute;
      bottom: 0;
      left: 0;
      background: #fff;
      border-radius: 0.4267rem 0.4267rem 0 0;
      display: flex;
      flex-direction: column;

      .header {
        padding: 0 0.4267rem;
        height: 1.4933rem;
        position: relative;
        
        .title {
          color: #2B2E35;
          flex: 1;
          text-align: center;
        }

        .close {
          color: #90949D;
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          left: 0.4267rem;
        }

        .submit {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          right: 0.4267rem;
          height: 0.7467rem;
          padding: 0 0.3733rem;
          color: #fff;
          background: #3d7bff;
          border-radius: 0.96rem;
        }
      }

      .content-box {
        padding: 0.4267rem;
        flex: 1;

        textarea {
          width: 100%;
          height: 100%;
          border: none;
        }
      }
    }
  }
}
</style>
<template>
  <section class="page__discuss">
    <header class="page__header box-between">
      <div class="title box-center">
        <i class="iconfont icon-a-fenzujiegouzuo f24"></i>
        <span class="f17 bold">{{teamName}}</span>
      </div>
      <div class="close box-center">
        <i class="iconfont icon-cuowu f20"></i>
      </div>
    </header>
    <div class="discuss-info">{{ eventInfo.name }}</div>
    <section class="chat__wrap">
      <div
        class="msg--item"
        :class="item.senderId == mineId ? 'me' : ''"
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
              <template v-if="item.senderId == mineId">(我)</template>
            </p>
            <p class="content" v-if="item.type == 1">{{ item.content }}</p>
            <img class="img" v-else :src="item.content" alt="" />
          </div>
        </div>
      </div>
    </section>
    <footer class="page__footer" :class="hasImage ? 'heightauto': ''">
      <div class="btns box-start" v-if="eventInfo.requireSummary">
        <div class="btn f15" @click="visibleSubmitSummary = true">提交结果</div>
      </div>
      <div class="input-box">
        <div class="pic-preview box-start" v-if="hasImage">
          <img :src="pic.pic" alt="">
          <div class="info">
            <p class="name f13">{{ pic.name }}</p>
            <p class="f12" v-if="pic.pic">{{ pic.size }} 上传成功</p>
          </div>

          <div class="clear" @click="handleClearPic">
            <i class="iconfont icon-guanbi f16"></i>
          </div>
        </div>
        <input
          type="text"
          v-model="sendMsg"
          placeholder="请输入"
          class="input f16"
        />
        <div class="box-between">
          <div class="pics box-center">
            <input
              type="file"
              class="file-input"
              accept="images/*"
              @change="handleChooseImageChange"
            />
            <i class="iconfont icon-tianjiatupian- f24"></i>
          </div>
          <div class="btn box-center" :class="{ disabled: !sendMsg && !pic }">
            <i class="iconfont icon-48fabu f20"></i>
          </div>
        </div>
      </div>
    </footer>

    <section class="submit-summary" v-if="visibleSubmitSummary">
      <div class="container">
        <div class="header box-between">
          <div class="close box-start" @click="visibleSubmitSummary = false">
            <i class="iconfont icon-cuowu f20"></i>
          </div>
          <div class="f17 bold title">提交结果</div>
          <div class="submit box-center" @click="handleSubmitSummary">提交</div>
        </div>

        <div class="content-box">
          <textarea class="f15" v-model="summary" name="" id="" placeholder="请输入小组组最终要提交的结果"></textarea>
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
      pic: null,
      hasImage: false,
      retryTimes: 0,
      visibleSubmitSummary: false,
      summary: '',
      teamName: '',
      eventInfo: null
    };
  },
  computed: {
    ...mapState(["lessonId", "observerMode"]),
  },
  filters: {},
  methods: {
    ...mapActions([]),

    init() {
      this.fetchData();

      this.initPubSub();
      this.mineId = window.identityId || window.userId;
    },

    /**
     * @method 初始化订阅事件
     * @param
     */
    initPubSub() {
      // 取消练习的订阅
      PubSub && PubSub.unsubscribe("groupchat");

      // 订阅定时消息
      PubSub &&
        PubSub.subscribe("groupchat.newMsg", (topic, data) => {
          if (data.eventid == this.eventid) {
            this.addNewMsg(data);
          }
        });
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
            acc[item.userId] = item
            return acc
          }, {})
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
            self.pic = {
              pic: '',
              thumb: '',
              name: file.name
            }
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

      if (!/png|jpg|jpeg/.test(picType)) {
        this.$toast({
          message:
            this.$i18n.t("reuploadpiconly") || "当前仅支持图片格式，请重新上传",
          duration: 2000,
        });

        this.hasImage = false;

        return this;
      }

      // 上传七牛
      Promise.all([upload.getToken()]).then(() => {
        let randomNumber = parseInt(Math.random() * 10000, 10);
        let fileName = `${this.lessonId}${data.length}${randomNumber}.${picType}`;
        // let file = dataURLtoFile(data, fileName);
        this.uploadFile(data)
          .then((res) => {
            if (res.url) {
              Object.assign(this.pic, {
                pic: res.url,
                thumb: res.url ? `${res.url}?imageView2/2/w/568` : "",
              })
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
        this.pic = null
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
      this.pic = null;
      this.hasImage = false
    },

    handleSubmitSummary() {
      let URL = ''
      let params = {

      }

      return request.post(URL, params)
      .then(res => {
        this.visibleSubmitSummary = false
      })
    }
  },
  created() {
    let { teamid, eventid } = this.$route.params;
    this.teamid = teamid;
    this.eventid = eventid;

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
            background: #d0e2ff;
            border-radius: 0.32rem 0 0.32rem 0.32rem;
          }
        }
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
          border-radius: 0 0.32rem 0.32rem 0.32rem;
          background: #fff;
          padding: 0.32rem 0.5333rem;
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
      border: 0.0533rem solid var(--border-border-gray-02, #2d4a9424);
      border-radius: 0.32rem;

      .iconfont {
        line-height: 1;
      }

      .pic-preview {
        background: rgba(123, 135, 178, .1);
        border-radius: 0.16rem;
        height: 1.3333rem;
        position: relative;
        padding: 0 0.32rem;

        img {
          width: 56px;
          height: 56px;
          border-radius: 0.16rem;
          background: rgba(0,0,0,.1);
          margin-right: 0.2133rem;
        }

        .info {
          color: #90949d;
          .name {
            color: #2b2e35;
          }
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

      .header {
        padding: 0 0.4267rem;
        height: 1.4933rem;
        
        .title {
          color: #2B2E35;
          flex: 1;
          text-align: center;
        }

        .close {
          color: #90949D;
        }

        .submit {
          height: 0.7467rem;
          padding: 0 0.3733rem;
          color: #fff;
          background: #3d7bff;
          border-radius: 0.96rem;
        }
      }

      .content-box {
        padding: 0.4267rem;

        textarea {
          width: 100%;
          height: auto;
          border: none;
        }
      }
    }
  }
}
</style>
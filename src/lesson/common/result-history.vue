<template>
  <section class="page__wrap">
    <header class="page__header box-center f17">
      <div class="back" @click="handleBack">
        <i class="iconfont icon-jiantoudan-xiangzuo f24"></i>
      </div>
      作答历史记录
    </header>
    <div class="container">
      <div
        class="result-item"
        v-for="(item, index) in list"
        :key="index"
        @click="handleCheckDetail(index)"
      >
        <div class="box-between text-gray-01 f15 bold">
          <p class="person">提交人: {{ item.user.name }}</p>
          <p class="time">{{ item.submitTime | formatTime }}</p>
        </div>
        <div class="content text-gray-02 f15">
          <div class="word f15">{{ item.result.content }}</div>
          <div
            class="anser__imgs"
            :class="[
              item.result.pics.length > 1 ? 'grid' : '',
              item.result.content ? 'mt8' : '',
            ]"
          >
            <template v-for="(pic, i) in item.result.pics">
              <img
                :src="pic.thumb || pic.pic"
                :key="i"
                class="pic"
                alt=""
                @click.stop="scaleImage(pic.pic, $event)"
              />
            </template>
          </div>
          <div
            class="anser__videos"
            :class="item.result.content || item.result.pics[0].pic ? 'mt8' : ''"
            v-if="item.result.videos.length"
          >
            <video
              v-for="(video, index) in item.result.videos"
              :key="index"
              class="video--preview"
              :src="video.url"
              controls
              :poster="video.thumb"
            ></video>
          </div>
        </div>
        <template v-if="isTeacher">
          <div
            class="screen box-center"
            v-if="screenIndex == index"
            @click.stop="handleCancelScreen(index)"
          >
            取消投屏
          </div>
          <div
            class="screen box-center"
            v-else
            @click.stop="handleScreen(index)"
          >
            <i
              class="iconfont icon-shiti_touping f16 ver-middle"
              style="margin-right: 0.1rem"
            ></i>
            投屏
          </div>
        </template>
        
      </div>
    </div>

    <section class="modal" v-if="visibleDetail">
      <div class="detail">
        <div class="box-between text-gray-01 f15 bold">
          <p class="person">提交人: {{ curResult.user.name }}</p>
          <p class="time">{{ curResult.submitTime | formatTime }}</p>
        </div>
        <p class="text-gray-02">{{ curResult.result.content }}</p>
        <div
          class="anser__imgs"
          :class="[
            curResult.result.pics.length > 1 ? 'grid' : '',
            curResult.result.content ? 'mt8' : '',
          ]"
        >
          <template v-for="(pic, i) in curResult.result.pics">
            <img
              :src="pic.thumb || pic.pic"
              class="pic"
              :key="i"
              alt=""
              @click="scaleImage(pic.pic, $event)"
            />
          </template>
        </div>
        <div
          class="anser__videos"
          :class="
            curResult.result.content || curResult.result.pics[0].pic
              ? 'mt8'
              : ''
          "
          v-if="curResult.result.videos.length"
        >
          <video
            v-for="(video, index) in curResult.result.videos"
            :key="index"
            class="video--preview"
            :src="video.url"
            controls
            :poster="video.thumb"
          ></video>
        </div>

        <div class="footer box-center f16 bold">
          <div
            class="btn box-center screen"
            v-if="isTeacher"
            @click="handleScreen(resultIndex)"
          >
            投屏
          </div>
          <div class="btn box-center text-gray-02" @click="handleCloseDetail">
            关闭
          </div>
        </div>
      </div>
    </section>
    <Scale></Scale>
  </section>
</template>

<script>
import Scale from "@/lesson/teacher/common/scale";
import request from "@/util/request-v3";
import API from "@/util/api";
import Moment from "moment";
import { mapGetters } from "vuex";
export default {
  name: "subjective-team-history",
  data() {
    return {
      list: [],
      isTeacher: false,
      visibleDetail: false,
      curResult: null,
      problemId: "",
      teamId: "",
      spid: "",
      resultIndex: -1,
      screenIndex: -1,
    };
  },
  components: {
    Scale,
  },
  filters: {
    formatTime(time) {
      return Moment(time).format("HH:mm");
    },
  },
  computed: {
    ...mapGetters(["lessonid", "socket", "postingSubjectiveid"]),
  },
  watch: {},
  methods: {
    init() {
      this.fetchHistory();
      this.isTeacher && this.handlePubSub();
    },

    fetchHistory() {
      let URL = API.lesson.get_team_history;
      let params = {
        problem_id: this.problemId,
        team_id: this.teamId,
      };

      return request.get(URL, params).then((res) => {
        if (res.code == 0 && res.data) {
          this.list = res.data.list;
        }
      });
    },

    // 查看详情
    handleCheckDetail(index) {
      this.curResult = this.list[index];
      this.visibleDetail = true;
      this.resultIndex = index;
    },

    handleScreen(index) {
      let str = JSON.stringify({
        op: "showsproblem",
        lessonid: this.lessonid,
        spid: this.spid,
        msgid: 1234,
        teamid: this.teamId,
        resultindex: index,
      });
      this.socket.send(str);
    },

    handleCancelScreen() {
      let self = this

      let str = JSON.stringify({
        'op': 'closemask',
        'lessonid': self.lessonid,
        'type': 'subjective',
        'msgid': 1234
      })

      self.socket.send(str)
    },

    handleCloseDetail() {
      this.visibleDetail = false;
    },

    /**
     * 显示大图，使用 PhotoSwipe
     *
     * @event bindtap
     * @param {string} pic 大图url
     */
    scaleImage(src, evt) {
      let targetEl =
        (typeof event !== "undefined" && event.target) || evt.target;
      let pswpElement = document.querySelector(".J_pswp");
      let index = 0;
      let WIDTH = window.innerWidth;
      console.log(targetEl);
      let items = [
        {
          src: src,
          w: WIDTH,
          h: (targetEl.naturalHeight * WIDTH) / targetEl.naturalWidth,
        },
      ];

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
        // 解决消息点击问题
        // history: false,
      };

      // Initializes and opens PhotoSwipe
      let gallery;

      if (typeof PhotoSwipe !== "undefined") {
        gallery = new PhotoSwipe(
          pswpElement,
          PhotoSwipeUI_Default,
          items,
          options
        );

        gallery.init();
      } else {
        setTimeout(() => {
          gallery = new PhotoSwipe(
            pswpElement,
            PhotoSwipeUI_Default,
            items,
            options
          );
          gallery.init();
        }, 1500);
      }
    },

    handlePubSub() {
      let self = this
      // 订阅前清掉之前可能的订阅，避免多次触发回调
      T_PUBSUB.unsubscribe('pro-msg')
      T_PUBSUB.subscribe('pro-msg.sproblemshown', (_name, msg) => {
        self.screenIndex = msg.resultindex
      })
      T_PUBSUB.subscribe('call-msg.closedmask', (_name, msg) => {
        self.screenIndex = -1
      })
      
    },

    handleBack() {
      this.$router.back()
    }
  },
  created() {
    this.isTeacher = this.$route.name == "subjective_team_history_t_v3";
    let { pid, tid, index } = this.$route.params;
    this.problemId = pid;
    this.teamId = tid;
    this.spid = index;
  },
  mounted() {
    this.init();
  },
  beforeDestroy() {},
};
</script>

<style lang="scss" scoped>
.page__wrap {
  z-index: 1;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  height: 100vh;

  background: #fff;

  display: flex;
  flex-direction: column;
  overflow: hidden;

  .page__header {
    position: relative;
    height: 1.28rem;
    color: #2B2E35;
    box-shadow: 0px 6px 32px 0px #7B87B21A;

    .back {
      position: absolute;
      top: 50%;
      left: 0.3733rem;
      transform: translateY(-50%);
    }
  }

  .mt8 {
    margin-top: 0.2133rem;
  }

  .container {
    flex: 1;
    overflow-y: scroll;
    -webkit-overflow-scrolling: touch;
    padding: 0 0.4267rem;

    .result-item {
      margin-top: 0.4267rem;
      padding: 0.2133rem 0.32rem;
      background: #f6f7fb;
      overflow: hidden;

      .content {
        padding: 0.32rem 0;

        .word {
          text-align: left;
          word-break: break-word;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 4;
          -webkit-box-orient: vertical;
        }
      }

      .screen {
        width: 2.08rem;
        height: 0.7467rem;
        float: right;
        margin-top: 0.32rem;
        border: 1px solid var(--border-border-gray-02, #2d4a9424);
        border-radius: 36px;
        color: #90949d;
      }
    }
  }

  .anser__imgs.grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.2133rem;
    min-height: 2.64rem;

    .pic {
      width: 100%;
      height: 100%;
      object-fit: cover;
      background: #ccc;
    }
  }

  .anser__videos {
    video {
      max-width: 100%;
      max-height: 5.68rem;
      object-fit: cover;
    }
  }

  .pic {
    max-width: 100%;
    max-height: 5.68rem;
    display: block;
  }

  .text-gray-01 {
    color: #2b2e35;
  }

  .text-gray-02 {
    color: #656a72;
  }

  .bold {
    font-weight: bold;
  }

  .modal {
    position: absolute;
    width: 100vw;
    height: 100vh;
    top: 0;
    left: 0;
    background: var(--mask-Mask-02, #11131866);

    .detail {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 80vh;
      background: #fff;
      border-radius: 36px 36px 0 0;
      padding: 0.7467rem 0.4267rem 0.64rem;

      .footer {
        position: absolute;
        bottom: 0.64rem;
        left: 0;
        width: 100%;
        padding: 0 0.4267rem;
        .btn {
          flex: 1;
          max-width: 7.4667rem;
          background: #ebedf4;
          border-radius: 72px;
          height: 1.1733rem;

          &.screen {
            margin-right: 0.32rem;
            color: #fff;
            background: #5096f5;
          }
        }
      }
    }
  }
}
</style>
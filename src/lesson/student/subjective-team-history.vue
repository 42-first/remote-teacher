<template>
  <section class="page__wrap">
    <header class="page__header box-center">
      <div class="back">
        <i class="iconfont icon-jiantoudan-xiangzuo f20"></i>
      </div>
      作答历史记录
    </header>
    <div class="container">
      <div class="result-item" v-for="(item, index) in list" :key="index" @click="handleCheckDetail(index)">
        <div class="box-between text-gray-01 f15 bold">
          <p class="person">提交人: 吕强</p>
          <p class="time">11:34</p>
        </div>
        <div class="content text-gray-02 f15">
          支械麻烟阎截阀！窗贝君茫砍哈籼逮蒙鹿敞嫌你捉叹闺缺虑咕官子骗肪膝点螬框兹蒲腔痛领万哎、愧蛋抚诬炊畸酵御煌苷虾省欣囊黎肺戒慧绵仪疡白府羞…沫疼艘怨效置兴邵愧代望嘿槽釉懂享抽托仁闸莎羞浓键迭恭判桩术步随俺搅钙沫阅组茂浆释馈沫患晋走努哀册醇沃挠费截季画沪户崎膨锯会割荣？
        </div>
        <div class="screen box-center" v-if="isTeacher" @click.stop="handleScreen">
          <i class="iconfont icon-shiti_touping f24 ver-middle" style="margin-right: 0.1rem;"></i>
          投屏
        </div>
      </div>
    </div>

    <section class="modal" v-if="visibleDetail">
      <div class="detail">
        <div class="box-between text-gray-01 f15 bold">
          <p class="person">提交人: 吕强</p>
          <p class="time">11:34</p>
        </div>
        <p class="text-gray-02">支械麻烟阎截阀！窗贝君茫砍哈籼逮蒙鹿敞嫌你捉叹闺缺虑咕官子骗肪膝点螬框兹蒲腔痛领万哎、愧蛋抚诬炊畸酵御煌苷虾省欣囊黎肺戒慧绵仪疡白府羞…沫疼艘怨效置兴邵愧代望嘿槽釉懂享抽托仁闸莎羞浓键迭恭判桩术步随俺搅钙沫阅组茂浆释馈沫患晋走努哀册醇沃挠费截季画沪户崎膨锯会割荣？</p>
        <div class="pics"></div>

        <div class="footer box-center f16 bold">
          <div class="btn box-center screen" v-if="isTeacher">投屏</div>
          <div class="btn box-center text-gray-02" @click="handleCloseDetail">关闭</div>
        </div>
      </div>
    </section>
  </section>
</template>

<script>
export default {
  name: 'subjective-team-history',
  data() {
    return {
      list: [111, 221],
      isTeacher: false,
      visibleDetail: false,
      curResult: null
    }
  },
  components: {},
  computed: {},
  watch: {},
  methods: {
    // 查看详情
    handleCheckDetail(index) {
      this.curResult = this.list[index]
      this.visibleDetail = true
    },

    handleScreen() {
      
    },

    handleCloseDetail() {
      this.visibleDetail = false
    }
  },
  created() {
    this.isTeacher = this.$route.name == 'team-history-result'
  },
  mounted() {

  },
  beforeDestroy(){

  }
}
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

    .back {
      position: absolute;
      top: 50%;
      left: 20px;
      transform: translateY(-50%);
    }
  }

  .container {
    flex: 1;
    overflow-y: scroll;
    -webkit-overflow-scrolling: touch;
    padding: 0 0.4267rem;

    .result-item {
      margin-top: 0.4267rem;
      padding: 0.2133rem 0.32rem;
      background: #F6F7FB;
      overflow: hidden;

      .content {
        text-align: left;
        word-break: break-word;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 4;
        -webkit-box-orient: vertical;
      }

      .screen {
        width: 2.08rem;
        height: 0.7467rem;
        float: right;
        margin-top: 0.32rem;
        border: 1px solid var(--border-border-gray-02, #2D4A9424);
        border-radius: 36px;
        color: #90949D;
      }
    }
  }

  .text-gray-01 {
    color: #2B2E35;
  }

  .text-gray-02 {
    color: #656A72;
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
          background: #EBEDF4;
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
/**
 * @page：腾讯会议绑定引导提示
 * @author: chenzhou
 * @update: 2021.11.24
 * @desc
 *
 */


<template>
  <section class="meeting__bind box-center">
    <section class="bind__container">
      <!-- logo -->
      <div class="bind__logos box-center">
        <div class="logo__wrap box-center">
          <img class="icon-logo" src="https://qn-sfe.yuketang.cn/o_1fld9r4eslh51s9s16v711vu1p2t9.png" >
        </div>
      </div>

      <!--  -->
      <section class="bind__tips f17 c333">
        <p>请先绑定腾讯会议账号</p>
        <p>以便在腾讯会议中使用雨课堂</p>
      </section>

      <section class="bind--btn box-center f17 cfff" v-show="!hasBind" @click="handleBindMeetAccount">前往绑定</section>

      <!-- 关闭 -->
      <p class="bind__closed cfff" @click="handleClosed">
        <i class="iconfont icon-guanbi1 f16"></i>
      </p>
    </section>
  </section>
</template>

<script>
import { mapState } from 'vuex';

const AllHosts = {
  'pre-apple-ykt.xuetangonline.com': 'https://pre-apple-ykt.xuetangonline.com',
  'www.yuketang.cn': 'https://www.yuketang.cn',
  'pro.yuketang.cn': 'https://www.yuketang.cn',
  'changjiang.yuketang.cn': 'https://www.yuketang.cn',
  'huanghe.yuketang.cn': 'https://www.yuketang.cn',
  'rain.xuetangonline.com': 'https://www.yuketang.cn'
};
let host = AllHosts[location.host] || 'www.yuketang.cn';
let origin = `https://${host}`;


let AllApp = {
  'pre-apple-ykt.xuetangonline.com': {
    corpId: '200042044',
    sdkId: '17980163426'
  },
  'www.yuketang.cn': {
    corpId: '200042044',
    sdkId: '18220104717'
  }
};
let txmeetApp = AllApp[host] || {
  corpId: '200042044',
  sdkId: '18220104717'
};

const corpId = txmeetApp.corpId;
const sdkId = txmeetApp.sdkId;


export default {
  name: 'meeting-bind',
  data() {
    return {
      // 腾讯会议绑定地址
      bindUri: location.origin + '/authorize/bind',
      // 回调地址
      redirectUri: origin + '/authorize/callback',
      // 是否绑定
      hasBind: false,
    };
  },
  components: {
  },
  mixins: [ ],
  computed: {
    ...mapState([
      'lessonId',
      'invitationLink'
    ])
  },
  created() {
  },
  mounted() {
    this.init()
  },
  updated() {},
  beforeDestroy() {
  },
  filters: {
  },
  watch: {
  },
  methods: {
    /**
     * @method 页面初始化
     * @params
     */
    async init() {
      try {
        console.log('lessonId:', this.lessonId);

        this.verifyBinding();
      } catch (error) {
        console.error('[init] exception:%s', error);
      }
    },

    /**
     * @method 腾讯会议账号是否绑定到雨课堂
     */
    async verifyBinding() {
      // 需要返回状态
      // 没有绑定需要oauth授权登录

      try {
        let url = API.lesson.check_bind;
        let res = await request.get(url);
        console.log('verifyBinding:', res);
        if (res && res.code == 0) {
          let { bind, bindList } = res.data;

          if(bind) {
            let { openId }= bindList[0] || {};
            if(openId) {
              this.openId = openId;
            }

            if(this.invitationLink) {
              location.href = this.invitationLink;
            } else {
              this.getInvitation(this.lessonId);
            }
          }
        }
      } catch(error) {
        console.info(error);
      }
    },

    /**
     * @method 绑定会议账号
     */
    handleBindMeetAccount(evt) {
      // location.href = this.bindUri + `?id=${this.lessonId}`;

      // 新增绑定
      let redirect = this.redirectUri;
      let pathname = this.bindUri + `?id=${this.lessonId}`;
      let next = encodeURIComponent(pathname);
      redirect = redirect + encodeURIComponent(`?next=${next}`);

      let authorizeLink = encodeURIComponent(`authorize.html?corp_id=${corpId}&sdk_id=${sdkId}&redirect_uri=${redirect}&&state=STATE`);
      location.href = `https://meeting.tencent.com/mobile/login.html?redirect_link=${authorizeLink}`;
    },

    /**
     * @method 获取会议邀请信息
     */
    async getInvitation(id) {
      // 通过lessonId读取会议邀请信息
      try {
        let url = API.lesson.get_meet_invitation;
        let params = {
          lessonId: id
        }

        let res = await request.get(url, params);
        console.log('getInvitation:', res);
        if (res && res.code == 0) {
          let { meetingId, joinUrl } = res.data;

          if(joinUrl) {
            location.href = joinUrl;
          }
        }
      } catch(error) {
        console.info(error);
      }
    },

    handleClosed(evt) {
      this.$router.back();
    }

  }
};
</script>

<style lang="scss" scoped>
  .meeting__bind {
    z-index: 1;

    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;

    background: rgba(0, 0, 0, 0.75);
  }

  .bind__container {
    position: relative;
    width: 7.199999999999999rem;
    height: 8.120000000000001rem;

    border-radius: 0.16rem;
    background: #fff;

    .bind__logos {
      padding-top: 0.8rem;

      .logo__wrap {
        width: 2.92rem;
        height: 1.56rem;

        // border-radius: 50%;
        // background: #F1F7FF;

        .icon-logo {
          width: 2.92rem;
          height: 1.56rem;
        }
      }
    }

    .bind__tips {
      padding-top: 0.8rem;
    }

    .bind--btn {
      position: absolute;
      bottom: 0.8rem;
      left: 0;
      right: 0;

      margin: 0 auto;
      width: 3.466666666666667rem;
      height: 1.1733333333333333rem;

      border-radius: 0.58667rem/50%;
      background: #5096F5;
    }
  }

  .bind__closed {
    position: absolute;
    bottom: -1.76rem;
    left: 0;
    right: 0;

    margin: 0 auto;
    width: 0.6933333333333334rem;
    height: 0.6933333333333334rem;

    border-radius: 50%;
    border: 2px solid #fff;
  }

</style>

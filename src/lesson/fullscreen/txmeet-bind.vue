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
      <section class="bind__tips f16 c666">
        <p>为了在腾讯会议中使用你当前的雨课堂账号</p>
        <p>请先绑定腾讯会议账号</p>
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
import { isSupported } from '@/util/util'

// 本地缓存KEY
const LocalTokenKey = 'tx.meeting.next';
const AllHosts = {
  'pre-apple-ykt.xuetangonline.com': 'pre-apple-ykt.xuetangonline.com',
  'www.yuketang.cn': 'www.yuketang.cn',
  'pro.yuketang.cn': 'www.yuketang.cn',
  'changjiang.yuketang.cn': 'www.yuketang.cn',
  'huanghe.yuketang.cn': 'www.yuketang.cn',
  'rain.xuetangonline.com': 'www.yuketang.cn'
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
      location.href = this.bindUri + `?id=${this.lessonId}`;
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
    z-index: 11;

    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;

    background: rgba(0, 0, 0, 0.75);
  }

  .bind__container {
    position: relative;
    padding: 0 30px;
    width: 380px;
    height: 310px;

    border-radius: 7px;
    background: #fff;

    .bind__logos {
      padding-top: 40px;

      .logo__wrap {
        width: 112px;
        height: 60px;

        .icon-logo {
          width: 112px;
          height: 60px;
        }
      }
    }

    .bind__tips {
      padding: 30px 0 40px;
      border-bottom: 1px solid #ddd;
    }

    .bind--btn {
      position: absolute;
      bottom: 30px;
      left: 0;
      right: 0;

      margin: 0 auto;
      width: 140px;
      height: 34px;

      border-radius: 4px;
      background: #5096F5;
      cursor: pointer;
    }
  }

  .bind__closed {
    position: absolute;
    bottom: -40px;
    left: 0;
    right: 0;

    margin: 0 auto;
    width: 28px;
    height: 28px;

    border-radius: 50%;
    border: 1px solid #fff;
    cursor: pointer;
  }

</style>

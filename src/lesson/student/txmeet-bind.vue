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

      <section class="bind--btn box-center f17 cfff">前往绑定</section>

      <!-- 关闭 -->
      <p class="bind__closed cfff" @click="handleClosed">
        <i class="iconfont icon-guanbi1 f16"></i>
      </p>
    </section>
  </section>
</template>

<script>
import { mapState } from 'vuex';


export default {
  name: 'meeting-bind',
  data() {
    return {
      // 回调地址
      redirectUri: location.origin + '/authorize/bind',
    };
  },
  components: {
  },
  mixins: [ ],
  computed: {
    ...mapState([
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
      } catch (error) {
        console.error('[init] exception:%s', error);
      }
    },

    /**
     * @method 腾讯会议账号是否绑定到雨课堂
     *
     */
    async verifyBinding() {
      // 需要返回状态
      // 1、有没有绑定
      // 2、token是否过期
      //
      // 老师已经绑定过 就可以继续创建会议（如果token过期了后面需要调接口刷token）
      // 没有绑定需要oauth授权登录

      try {
        let url = API.check_bind;
        let res = await request.get(url);
        console.log('verifyBinding:', res);
        if (res && res.code == 0) {
          let { bind, bindList } = res.data;

          if(bind) {
            this.openId = bindList[0];
          } else {
            // 授权绑定
            this.getAuthorize();
          }
        }
      } catch(error) {
        console.info(error);
      }
    },

    /**
     * @method 获取会议邀请信息
     */
    getInvitation(id) {
      // TODO：通过lessonId读取会议邀请信息
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

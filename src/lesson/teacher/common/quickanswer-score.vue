<template>
  <section class="jumpin__score__wrapper" @click.stop="handleClose">
    <div class="container" @click.stop="">
      <div class="close box-center" @click="handleClose">
        <i class="iconfont icon-cuowu f24"></i>
      </div>
      <div class="header f19 bold"><!-- 加分 -->{{ $t('quickansweraddscore') }}</div>
      <div class="user-info box-start">
        <img class="avatar" :src="editUser.avatar" alt="">
        <div class="info">
          <p class="f15 bold">{{editUser.name}}</p>
          <p class="f13">{{editUser.number}}</p>
        </div>
      </div>

      <div class="setting-box box-center">
        <p class="settings__content--reduce box-center" @click="handlereduce"><i class="iconfont icon-jiafenjianhao f24 blue"></i></p>
        <input class="settings__content--input" type="tel" v-model="score" :max="MaxScore" @focus="isFocus = true" @blur="isFocus = false"/>
        <p class="settings__content--reduce box-center" @click="handleadd"><i class="iconfont icon-jiafenjiahao f24 blue"></i></p>
      </div>

      <div class="actions-btns box-center">
        <div class="actions-btn box-center f16 bold" @click="handleClose"><!-- 取消 --> {{ $t('cancel') }} </div>
        <div class="actions-btn box-center f16 bold confirm" @click="handleScore"><!-- 确定 --> {{ $t('confirm') }} </div>
      </div>
    </div>
  </section>
</template>

<script>
const MaxScore = 10
export default {
  name: "jumpin-score",
  data() {
    return {
      score: 0,
      MaxScore,
    }
  },
  props: {
    editUser: Object
  },
  computed: {
   
  },

  methods: {
    // 分数减
    handlereduce() {
      if(this.score > 0) {
        this.score--
      }
    },

    // 分数加
    handleadd() {
      if(this.score < MaxScore) {
        this.score++;
      }
    },

    handleClose() {
      this.$emit('toggleEdit')
    },

    handleScore() {
      this.$emit('updateScore', this.editUser.id, this.score * 100)
    }
  },

  created() {
    this.score = this.editUser.score ? this.editUser.score / 100 : 0
  },

  beforeDestroy() {
    
  },
}
</script>

<style lang="scss" scoped>
@import "~@/style/common_rem";
.jumpin__score__wrapper {
  background: var(--mask-Mask-02, #11131866);
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 9999;

  .blue {
    color: #3D7BFF;
  }

  .container {
    width: 100%;
    height: px2rem(868px);
    background: #fff;
    border-radius: px2rem(24px) px2rem(24px) 0 0;
    position: absolute;
    left: 0;
    bottom: 0;
    padding: px2rem(56px) px2rem(64px) px2rem(48px);
    color: #2B2E35;


    .close {
      position: absolute;
      top: px2rem(16px);
      right: px2rem(16px);
      width: px2rem(72px);
      height: px2rem(72px);
      color: #90949D;
    }

    .header {
      text-align: center;
    }

    .user-info {
      margin: px2rem(32px) 0 px2rem(120px);
      background: var(--fill-gray-fill-gray-04, #F0F2FA);
      padding: px2rem(16px) px2rem(24px);
      border-radius: px2rem(16px);

      .avatar {
        width: px2rem(80px);
        height: px2rem(80px);
        border-radius: 50%;
        margin-right: px2rem(24px);
      }
    }

    .setting-box {
      gap: px2rem(48px);
      .settings__content--reduce {
        width: px2rem(88px);
        height: px2rem(88px);
        border: 1px solid var(--border-border-gray-03, #2D4A9412);
        border-radius: px2rem(32px);
        cursor: pointer;
      }

      .settings__content--input {
        width: px2rem(200px);
        height: px2rem(200px);
        border-radius: px2rem(32px);
        background: var(--bg-bg-dp-01-ai, #F4F9FF);
        border: 1px solid var(--border-border-gray-03, #2D4A9412);
        color: #2B2E35;
        margin: 0 px2rem(48px);
        text-align: center;
        font-size: px2rem(112px);

        &:focus,
        &:hover {
          border-color: #B5CCFC;
        }
      }
    }

    .actions-btns {
      gap: px2rem(24px);
      margin-top: px2rem(160px);

      .actions-btn {
        flex: 1;
        height: px2rem(88px);
        background: #EBEDF4;
        color: var(--text-text-gray-02, #656A72);
        border-radius: px2rem(72px);


        &.confirm {
          background: #3D7BFF;
          color: #fff;
        }
      }
    }
  }
}
</style>
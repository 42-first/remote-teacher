<template>
  <section class="jumpin__result__wrapper">
    <div class="box-center">
      <img src="~images/teacher/jumpin-success.png" class="mr12" alt="">
      <span class="f19 bold">抢答成功</span>
    </div>
    <div class="card-container box-center">
      <div class="user-box box-center">
        <img class="avatar" :src="user.avatar" alt="">
        <p class="name f19 bold">{{ user.name }}</p>
        <p class="number f13">{{user.number}}</p>

        <div class="score box-center" v-if="score">
          <span class="f15 bold">加分: </span>
          <span class="num f21 bold yellow">+{{score}}</span>
          <span class="edit" @click="handleVisibleEdit">
            <i class="iconfont icon-bianji f20"></i>
          </span>
        </div>
      </div>
    </div>
    <div class="add-score box-center">
      <div class="item box-center" v-for="item in scoreList" :key="item" @click="handleToggleScore(item)"><i class="iconfont icon-tianjia1 f16 mr4"></i> <span class="f16 bold">{{ item }}</span></div>
    </div>
  </section>
</template>

<script>
export default {
  name: "jumpin-result",
  data() {
    return {
      scoreList: [1, 3, 5, 10],
      score: 0,
    }
  },
  props: {
    user: Object
  },
  computed: {
   
  },

  watch: {
    user:  {
      handler(newVal) {
        this.score = newVal.score / 100 
      }, 
      deep: true
      
    }
  },

  methods: {
    handleToggleScore(num) {
      if(this.score == num) {
        this.score = 0
      } else {
        this.score = num
      }

      this.$emit('updateScore', this.user.id, this.score * 100)
    },

    handleVisibleEdit() {
      this.$emit('toggleEdit', Object.assign(this.user, {score: this.score * 100}))
    }
  },

  created() {
  },

  beforeDestroy() {
    
  },
}
</script>

<style lang="scss" scoped>
@import "~@/style/common_rem";

.jumpin__result__wrapper {
  .mr12 {
    margin-right: px2rem(24px);
  }

  .mr4 {
    margin-right: px2rem(8px);
  }
  .card-container {
    margin: px2rem(32px) auto;
    width: px2rem(510px);
    height: px2rem(600px);
    background: #11215CB2;
    border-radius: px2rem(36px);

    .user-box {
      width: px2rem(480px);
      height: px2rem(570px);
      background: #11215C;
      position: relative;
      border-radius: px2rem(36px);  
      flex-direction: column;


      &::before {
        position: absolute;
        content: "";
        width: calc(100% + 4px);
        height: calc(100% + 4px);
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        background: radial-gradient(115.02% 101.06% at 97.1% 2.81%, rgba(255, 255, 255, 0.7) 0%, rgba(0, 92, 250, 0.19) 100%) ,
          radial-gradient(80.09% 70.37% at 8.43% 98.55%, rgba(255, 255, 255, 0.7) 0%, rgba(0, 92, 250, 0.19) 100%);
        border-radius: px2rem(36px);  
        z-index: -1;
        animation: rotate .5s linear infinite;
      }

      .avatar {
        width: px2rem(166px);
        height: px2rem(166px);
        border-radius: 50%;
        margin-bottom: px2rem(36px);
      }

      .name {
        margin-bottom: px2rem(6px);
      }

      .score {
        margin-top: px2rem(88px);
        gap: px2rem(16px);
      }
    }
  }

  @keyframes rotate {
    0% {
      background: linear-gradient(0deg, rgba(0, 92, 250, 0.19), rgba(255, 255, 255, 0.7));
    }
    25% {
      background: linear-gradient(90deg, rgba(0, 92, 250, 0.19), rgba(255, 255, 255, 0.7));
    }
    50% {
      background: linear-gradient(180deg, rgba(0, 92, 250, 0.19), rgba(255, 255, 255, 0.7));
    }
    75% {
      background: linear-gradient(270deg, rgba(0, 92, 250, 0.19), rgba(255, 255, 255, 0.7));
    }
    100% {
      background: linear-gradient(360deg, rgba(0, 92, 250, 0.19), rgba(255, 255, 255, 0.7));
    }
  }

  .yellow {
    color: #F78600;
  }

  .add-score {
    gap: px2rem(24px);

    .item {
      width: px2rem(140px);
      height: px2rem(72px);
      background: #FFFFFF1A;
      border: 1px solid #FFFFFF66;
      border-radius: px2rem(36px);  
      color: #fff;
    }
  }
}
</style>
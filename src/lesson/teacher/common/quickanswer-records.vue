<template>
  <section class="jumpin__records__wrapper">
    <div class="header box-between">
      <span class="f15 bold">已抢答</span>
      <span class="close" @click="handleClose">
        <i class="iconfont icon-cuowu f18"></i>
      </span>
    </div>
    <div class="list">
      <div class="item box-between" v-for="item in records" :key="item.id">
        <div class="user box-start">
          <img class="avatar" :src="item.avatar" alt="">
          <div>
            <p class="f17 bold">{{item.name}}</p>
            <p class="f13 number">{{item.number}}</p>
          </div>
        </div>
        <div class="score" v-if="item.score">
          <span class="f18 yellow">+{{item.score / 100}}</span>
          <i class="iconfont icon-bianji f18 ml8" @click="handleScore(item)"></i>
        </div>
        <div class="add-score box-center" v-else @click="handleScore(item)">
          <i class="iconfont icon-tianjia1 f16"></i>
          加分
        </div>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: "jumpin-records",
  data() {
    return {
     
    }
  },
  props: {
    records: Array
  },
  computed: {
   
  },

  methods: {
    handleClose() {
      this.$emit('toggleRecords')
    },


    handleScore(item) {
      this.$emit('toggleEdit', item)
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
.jumpin__records__wrapper {
  width: px2rem(636px);
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  background: #1E2141;
  box-shadow: 6px 0px 32px 0px #7B87B21A;
  border-radius: 0 px2rem(40px) px2rem(40px) 0;
  padding: px2rem(40px) 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;

  .ml8 {
    margin-left: px2rem(16px);
  }

  .header {
    padding: 0 px2rem(40px);
  }

  .list {
    flex: 1;
    overflow: auto;
    padding: 0 px2rem(40px);

    .item {
      margin-top: px2rem(48px);
      .avatar {
        width: px2rem(80px);
        height: px2rem(80px);
        border-radius: 50%;
        margin-right: px2rem(24px);
      }

      .number {
        color: #96A0AD;
      }

      .add-score {
        padding: px2rem(18px) 0;
        width: px2rem(152px);
        color: #3D7BFF;
        background: var(--fill-colorful-fill-pri-0810, #3D7BFF1A);
        border-radius: px2rem(72px);

        .iconfont {
          margin-right: px2rem(8px);
        }
      }
    }
  }

}
</style>
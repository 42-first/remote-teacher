<template>
    <div class="color4a pointer user">
      <div @click="up = !up">
        <img :src="info.avatar_96" class="inline-block" />
        <div class="inline-block font18">{{info.name}}</div>
        <i class="iconfont fonnt14 icon-unfold" v-show="!up"></i>
        <i class="iconfont fonnt14 icon-fold" v-show="up"></i>
      </div>
      <div class="font18 text-center color4a list" v-show="up">
        <div class="item">
          你好，{{info.name}}
        </div>
        <div class="color-e4 item" @click="logout">
            退出
        </div>
      </div>
    </div>
</template>

<script>
  import request from '@/util/request'
  import Api from '@/util/api'

  export default {
    data () {
      return {
        up: !1
      }
    },
    props: ['info'],
    methods: {
      logout: function () {
        request.get(Api.market.logout).then(response => {
          window.location.href = location.origin + '/web'
        })
      }
    },
    created: function () {
    }
  }
</script>
<style lang="scss" scoped>
  @import "~@/style/market/common";
  .user{
    width: 200px;
    position: relative;
    text-align: left;
    height: 64px;
    line-height: 64px;
    z-index: 3;
    background-color: #fff;
    padding-bottom: 10px;
    img{
      border-radius: 50%;
      width: 64px;
    }
    .list{
      width: 190px;
      box-shadow: 0px 2px 6px #000;
      position: absolute;
      background-color: #fff;
      z-index: 1;
      top: 74px;
      .item{
        width: 160px;
        height: 40px;
        line-height: 40px;
        margin: 0 auto;
        border-bottom: 1px solid #979797;
      }
      .item:last-child{
        border-bottom: none;
      }
    }
  }
</style>

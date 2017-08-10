<template>
  <div class="back">
    <div class="banner">
      <img src="../images/market/banner/banner_activate.png"/>
    </div>
    <div class="con-width verify-con" v-if="1">
      <div class="insert text-center">
        <div class="inline-block info">
          <span class="inline-block font20 color4a">请输入序列号</span>
          <input type="text" class="font24 color63 text-center active"/>
        </div>
        <span class="inline-block"></span>
        <input type="text" class="font24 color63 text-center had"/>
        <span class="inline-block"></span>
        <input type="text" class="font24 color63 text-center"/>
        <span class="inline-block"></span>
        <input type="text" class="font24 color63 text-center error"/>
      </div>
      <div class="con-width">
        <div class="font20 error-info">
          输入的序列号有误，请重新输入，或者联系客服
        </div>
      </div>
      <div class="con-width text-center">
        <input type="button" value="确认激活" class="color63 font16 activate"/>
      </div>
    </div>
    <div class="con-width text-center relative verify-success" v-if="1">
      <div class="inline-block color63 font48">
        <i class="iconfont icon-dui"></i>
        <span class="inline-block">验证成功</span>
      </div>
      <div class="con-width text-left font0 courseware-info">
        <img src="~images/market/demo/img_courseware.png"/>
        <div class="over inline-block detail">
          <div class="font18 color0">
            电路原理电路原理电路原理电路原理电路原理电路原理电路原理
          </div>
          <div class="font18 color9b">
            清华大学 于歆杰
          </div>
          <div class="font16 color63 pointer download">
            <i class="iconfont icon-xiazai"></i>
            <span class="inline-block">
              下载雨课件
            </span>
          </div>
        </div>
      </div>
      <div class="con-width text-center">
        <input type="button" value="继续验证" class="color63 font16 pointer continue"/>
      </div>
    </div>
    <div class="relative con-width">
      <i class="iconfont icon-kefu color63 text-center pointer im"></i>
    </div>
  </div>
</template>

<script>
  import request from '../util/request'
  import API from '../util/api'
  import PubSub from 'pubsub-js'
  export default {
    name: 'List',
    data () {
      return {
        name: ''
      }
    },
    created: function () {
      this.$store.commit('increment', {
        name: '溢价'
      })
      request.get(API.header).then(function (e) {
        // let data = e.data.data
      })
    },
    methods: {
      change: function () {
        this.$store.commit('increment', {
          name: this.name
        })
        PubSub.publish('info', this.name)
      }
    },
    watch: {
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
  @import "../style/common";

  .back {
    min-width: 960px;
    background-color: #fff;
    margin-top: 66px;
    .banner {
      width: 100%;
      margin: 0 auto;
      font-size: 0px;
      img {
        width: 100%;
      }
    }
    .verify-con{
      background-color: #fff;
      height: 576px;
      padding-top: 80px;
      .insert{
        .info{
          width: 120px;
          position: relative;
          span{
            position: absolute;
            width: 100%;
            left: 0;
            top: -30px;
            border:none;
            margin: 0;
            padding: 0;
          }
        }
        input{
          border:1px solid #c8c8c8;
          width: 120px;
          height: 60px;
        }
        span{
          width: 20px;
          border-bottom:1px solid #c8c8c8;
          margin: 30px 10px;
        }
        input.active{
          border: #639EF4 solid 1px;
        }
        input.had{
          border:none;
          background-color: #f8f8f8;
        }
        input.error{
          border:1px solid #F84F41;
        }
      }
      .error-info{
        color: #F84F41;
        width: 420px;
        margin-left: 234px;
        margin-top: 20px;
      }
      .activate{
        width: 124px;
        height: 38px;
        background-color: #fff;
        border:1px solid #639EF4;
        border-radius: 19px;
        margin-top: 30px;
      }
    }
    .verify-success{
      background-color: #fff;
      padding-top: 40px;
      .font48{
        height: 100px;
        line-height: 100px;
        margin-bottom: 30px;
        i{
          font-size: 100px;
          margin-right: 30px;
        }
        span{
          height: 100%;
        }
      }
      .courseware-info{
        background-color: #F8F8F8;
        padding: 30px 150px;
        width: 960px;
        img{
          width: 236px;
          height: 148px;
        }
        .detail{
          height: 148px;
          width: 390px;
          position: relative;
          margin-left: 30px;
          padding: 10px;
        }
        .download{
          position: absolute;
          bottom:0;
          right: 0;
          height: 28px;
          line-height: 28px;
          i{
            font-size: 28px;
          }
          span{
            height: 100%;
          }
        }
      }
    }
    .continue{
      height: 38px;
      width: 124px;
      border:1px solid #639EF4;
      border-radius: 19px;
      line-height: 38px;
      margin: 40px 0;
      background-color: #fff;
    }
    .im{
      position: absolute;
      bottom:60px;
      right: -70px;
      font-size: 38px;
      width: 54px;
      border:1px solid #639EF4;
    }
  }
</style>

<template>
  <div class="back">
    <div class="banner">
      <img src="~images/market/banner/banner_search.png"/>
    </div>
    <div class="flow">
      <div class="font36 text-center">
        购买流程

      </div>
      <div class="con-width text-center">
        <div class="inline-block back-image item item-1">购买雨课件</div>
        <div class="inline-block font12 color9b narrate">短信发送</div>
        <div class="inline-block back-image item item-2">获得序列号</div>
        <div class="inline-block font12 color9b narrate">验证地址</div>
        <div class="inline-block back-image item item-3">输入序列号激活</div>
        <div class="inline-block font12 color9b narrate">打开雨课堂</div>
        <div class="inline-block back-image item item-4">正常使用</div>
      </div>
    </div>
    <div class="detail over">
      <div class="con-width font36 text-center title">
        商品详情

      </div>
      <ul class="con-width  text-center">
        <li class="over inline-block">
          <div class="img over">
            <img src=""/>
          </div>
          <div class="font18 color0 text-left over name">
            电路原理电路原理电路原理电路原理电路咯最多两行字最多两行字最多两行字最
            电路原理电路原理电路原理电路原理电路咯最多两行字最多两行字最多两行字最

          </div>
          <div class="font18 color9b text-left author">
            清华大学 于歆杰

          </div>
          <div class="color4a font20 describe">
            普通版

          </div>
          <div class="font20 price">
            ¥ 1000.0
          </div>
          <a href="" class="inline-block font16">立即购买</a>
        </li>
      </ul>
      <div class="con-width text-center">
        <div class="inline-block font20  activate">
        如果您已购买，请直接激活 <!--<router-link :to="{name: 'Verification'}" class="inline-block btn">激活<i class="iconfont icon-jiantou"></i></router-link>-->
        </div>
      </div>
    </div>
    <div class="text-center con-width relative rule">
      <div class="font36 title">
        使用规则
      </div>
      <div class="con-width text-left font18">
        这里是雨课件的介绍和使用说明。<br/>
        雨课件是什么什么什么，你买了之后就可以拥有它的编辑权，可以上课、上传什么的，就可以变成你自己的课件了。就可以变成你自己的课件了。
        <br/><br/>
        这里是雨课件的介绍和使用说明。<br/>
        雨课件是什么什么什么，你买了之后就可以拥有它的编辑权，可以上课、上传什么的，就可以变成你自己的课件了。就可以变成你自己的课件了。
      </div>
      <i class="iconfont icon-kefu color63 text-center pointer im"></i>
    </div>
  </div>
</template>

<script>
  import request from '@/util/request'
  import API from '@/util/api'
  import $ from 'jquery'
  export default {
    name: 'market',
    data () {
      return {
        name: ''
      }
    },
    created: function () {
      request
      API
    },
    methods: {
      change: function () {
      }
    },
    directives: {
      paste: {
        inserted: function (e, binding) {
          $(e).on('paste', function (e) {
            console.log(e)
            return false
          })
        }
      }
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
  @import "~@/style/market/common";

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
    .flow {
      height: 334px;
      padding-top: 40px;
      .font36 {
        margin-bottom: 30px;
      }
      .con-width {
        margin: 0 auto;
        .item {
          width: 114px;
          height: 180px;
          background-repeat: no-repeat;
          background-size: 100% auto;
          background-position: 0 0;
          padding-top: 100px;
        }
        .item-1 {
          background-image: url("~images/market/icon/icon_1.png");
        }
        .item-2 {
          background-image: url("~images/market/icon/icon_2.png");
        }
        .item-3 {
          background-image: url("~images/market/icon/icon_3.png");
        }
        .item-4 {
          background-image: url("~images/market/icon/icon_4.png");
        }
        .narrate {
          height: 20px;
          line-height: 20px;
          width: 60px;
          margin: 70px 6px 0 6px;
          border-bottom: 1px solid #979797;
        }
      }
    }
    .detail {
      background-color: #F5F5F5;
      padding-bottom: 30px;
      .title {
        margin: 36px auto;
      }
      ul {
        li {
          width: 380px;
          height: 500px;
          background-color: #fff;
          border: 1px solid #c8c8c8;
          margin-bottom: 20px;
          .img {
            width: 100%;
            height: 236px;
            img {
              width: 100%;
            }
          }
          .name {
            width: 100%;
            text-overflow: ellipsis;
            padding: 10px 20px;
            line-height: 22px;
            max-height: 55px;
            display: -webkit-box;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 2;
            overflow: hidden;
          }
          .author {
            height: 40px;
            width: 360px;
            border-bottom: 1px solid #979797;
            margin: 0 auto;
            padding: 0 10px;
            line-height: 40px;
          }
          .describe {
            height: 30px;
            line-height: 30px;
            margin: 10px auto;
          }
          .price {
            height: 30px;
            line-height: 30px;
            color: #F5A623;
          }
          a {
            background-color: #F5A623;
            color: #fff;
            width: 128px;
            height: 38px;
            border-radius: 19px;
            line-height: 38px;
            margin: 20px auto;
          }
        }
      }
      .activate{
        .btn{
          height: 38px;
          width: 88px;
          color:#639EF4;
          border:1px solid #639EF4;
          border-radius: 19px;
          line-height: 38px;
          margin-left: 30px;
          i{
            margin-left: 10px;
          }
        }
      }
    }
    .rule{
      background-color: #fff;
      padding: 20px 0 40px 0;
      position: relative;
      .title{
        height: 50px;
      }
    }
    .im{
      position: absolute;
      bottom:180px;
      right: -70px;
      font-size: 38px;
      width: 54px;
      border:1px solid #639EF4;
    }
  }
</style>

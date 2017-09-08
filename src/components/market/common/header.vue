<template>
  <nav id="nav" class="nav">
    <div id="navbg" class="bg"></div>
    <div class="box clearfix">
      <a href="/">
        <img class="logo" src="http://ykt.io/static/images/home/logo.png?dt=20160914" alt="logo">
      </a>
      <!--<a class="right header" v-if="name">
        <img :src="avatar"/>
        <span>{{name}}</span>
      </a>-->
      <!--<a href="/join_us" class="right">加入我们</a>-->
      <a href="/help" class="right">帮助中心</a>
      <a href="/download" class="right">下载</a>
      <a href="/lesson/market/courseware" class="right color_curr">雨课件</a>
      <a href="/flippen" class="right">翻页笔</a>
      <a href="/web" class="right" target="_blank">雨课堂网页版</a>
    </div>
  </nav>
</template>

<script>
  import request from '@/util/request'
  import API from '@/util/api'
  export default {
    name: 'header',
    data () {
      return {
        name: '',
        avatar: ''
      }
    },
    created: function () {
      this._init()
    },
    components: {},
    methods: {
      _init: function () {
        let self = this
        request.get(API.market.user_info).then(function (e) {
          let data = e.data
          if (e.success) {
            self.name = data.user_profile.name
            self.avatar = data.user_profile.avatar_96
          }
        }).catch(function (e) {
          // window.location.href = location.origin + '/web?next=' + location.pathname + '&type=1'
        })
      }
    }
  }
</script>
<style lang="scss" scoped>
  @import "~@/style/market/insert.css";
  /*导航条*/
  .nav {
    position: fixed;
    z-index: 50;
    width: 100%;
    left: 0;
    top: 0;
    color: #9b9b9b;
    background-color: #282C2F;
  }

  .nav .bg {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: #282C2F;
    display: none;
  }

  .nav .box {
    position: relative;
    width: 1080px;
    margin: 0 auto;
    height: 60px;
  }

  .nav .box .logo {
    float: left;
    width: 94px;
    margin-left: 25px;
    margin-top: 15px;
  }

  .nav .box .right {
    float: right;
    margin-right: 20px;
    line-height: 60px;
    font-size: 15px;
    padding-top: 1px;
    box-sizing: border-box;
  }

  .nav .box .beta {
    width: 29px;
    vertical-align: super;
  }

  .nav .box a {
    color: #9b9b9b;
  }
  .nav .box a.color_curr{
    color: #fff;
  }
  .nav .box .header {
    display: inline-block;
    height: 100%;
    line-height: 60px;
    margin-left: 40px;
    img {
      width: 42px;
      height: 42px;
      border-radius: 50%;
      vertical-align: middle;
    }
  }

</style>

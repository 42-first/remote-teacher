<template>
  <nav id="nav" class="nav">
    <div id="navbg" class="bg"></div>
    <div class="box clearfix">
      <a class="a_logo" href="/">
        <img class="logo" src="http://sfe.ykt.io/o_1bpfrptlcaflochlas11h1s1c9.png" alt="logo">
      </a>
      <a href="/web" target="_blank" class="right loginweb">登录网页版</a>
      <a href="/help" class="right">帮助中心</a>
      <a href="/lesson/market/courseware" id="rainMarket" class="right">雨课件</a>
      <a href="/presenter" class="right">翻页笔</a>
      <a href="/download" class="right">下载</a>
      <a href="/" class="right active">首页</a>
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
  /*导航条background-color: #282C2F; */
  .nav {position: fixed; z-index: 50; width: 100%; left: 0; top: 0; color: #fff;background-color:rgba(0,0,0,0.8);}
  .nav .bg {position: absolute; left: 0; top: 0; width: 100%; height: 100%; display: none;}
  .nav .box {position: relative; width: 1170px; margin: 0 auto; height: 74px;}
  .nav .box .logo {float: left; width: 94px; margin-top: 22px;}

  .nav .box .right {float: right; margin-left: 50px;margin-top:20px;   font-size: 13px; padding-top: 1px; box-sizing: border-box; height: 34px;line-height: 34px;}
  .nav .box .beta{width: 29px; vertical-align: super;}
  .nav .box a {color: #9B9B9B;display: inline-block;text-align: center;border-radius: 5px;}
  .nav .box a.active{color: #ffffff;}
  .nav .box a:hover{color: #ffffff;}
  .nav .box a.loginweb{
    background-color: #5096F5;color: #fff;
    width: 100px;
  }


  .contentbox{ width: 1170px;margin: 0 auto; }
  .flex{display: flex;}
  .flexcol{flex: 1;}
  .tl{text-align: left;}
  .tr{text-align: right;}


  .section2{
    background-color: #151527;
    color: #ffffff;
  }

</style>

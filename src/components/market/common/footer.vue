<template>
  <!-- footer-->
  <div>
    <div class="footer">
      <div class="footer-wrapper clearfix">
        <div class="fl">
          <p class="footer-links">
            <a href="/join_us" class="right" style="padding-left: 0;">加入我们</a>|<a href="/download" class="right">下载中心</a>|<a href="/help" class="right">帮助中心</a>
          </p>
          <div class="footer-cr">
            <p>©2017 清华大学&学堂在线</p>
            <p>京ICP证140571号 | 京公网安备 11010802017721</p>
          </div>
          <!-- <p>京公网安备 11010802017721</p> -->
        </div>
        <div class="footer-right fr">
          <img class="link-time" src="http://sfe.ykt.io/o_1bpfokdd1k9d53cifn1n271p1n9.png" alt="雨课堂客服">
          <p class="link-tel">010-82152560</p>
          <!-- 联系方式 -->
          <div class="link-us clearfix">
            <div class="link-us-email fr">
              <div class="linkus-email-number">
                <p><a href="mailto:yuketang@xuetangx.com">yuketang@xuetangx.com</a></p>
                <p class="remark">邮箱</p>
              </div>
              <img class="link-img" src="http://sfe.ykt.io/o_1bfogbbac1laj2ojlb8ur7c2o.png" alt="邮件" />
            </div>
            <div class="link-us-qq fr">
              <div class="link-us-qqgroup">
                <p>QQ:487470016（推荐）</p>
                <p>QQ:470686527（已满）</p>
                <p>QQ:314940327（已满）</p>
                <p class="remark">雨课堂官方QQ群</p>
              </div>
              <img class="link-img" src="http://sfe.ykt.io/o_1bfogaie01q2c1q53l811k74r62j.png" alt="qq" />
            </div>
            <div class="link-us-wechat fr">
              <div class="link-us-qcode"><img src="http://sfe.ykt.io/o_1bfog83r555e54q11fh7a51c399.png" alt="雨课堂微信客服"></div>
              <img class="link-img" src="http://sfe.ykt.io/o_1bfog9qnn1v2m8t6tb11oqn190ue.png" alt="微信" />
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="color63 text-center pointer im" @mouseover="codeShow = !0 " @mouseleave="codeShow = !1" v-bind:class="{imShow: !imShow}">
      <div class="img text-center" v-show="codeShow">
        <img src="~images/market/icon/289ba82d3d4581a99b3f70f164cfca6d.png"/>
        <div class="font14 color0 name">雨课堂微信客服</div>
      </div>
    </div>
  </div>
</template>

<script>
  import $ from 'jquery'
  export default {
    name: 'header',
    data: function () {
      return {
        codeShow: !1,
        imShow: !0
      }
    },
    created: function () {
      let self = this
      $(window).on('scroll', function () {
        let footer = $('.footer')
        let im = $('.im')
        let footerTop = footer[0].getBoundingClientRect().top
        let imTop = im[0].getBoundingClientRect().top
        if (footerTop > imTop) {
          self.imShow = !0
        } else {
          self.imShow = !1
        }
      })

      setTimeout(function () {
        var bodyHeight = document.body.clientHeight
        var windowHeight = window.innerHeight
        if (bodyHeight < windowHeight) {
          $('.back').css({'minHeight': (windowHeight - 180)})
        }
      }, 1)
    }
  }
</script>
<style lang="scss" scoped>
  @import "~@/style/market/insert.css";
  @import "~@/style/market/common";
  /*-------------------------*\
      $footer common
    \*-------------------------*/


  .footer { z-index: 2; position: relative;bottom: 0; width: 100%; background: #282C2F; }
  .footer-wrapper {
    box-sizing: border-box;
    margin: 0 auto;
    width: 1080px;
    height: 180px;
    color: #9B9B9B;
    font: 14px/1.5 'PingFang SC',arial,Helvetica Neue,tahoma,"Hiragino Sans GB",Microsoft YaHei,\5b8b\4f53;
  }
  .footer-cr {
    line-height: 25px;
    font-size: 12px;
    color: #666666;
  }

  .footer-links {
    padding-top: 48px;
    padding-bottom: 30px;
  }

  .footer-links a {
    padding: 0 15px;
    color: #9B9B9B;
    font-size: 14px;
  }

  .footer-right {
    padding-top: 48px;
    font-size: 20px;
  }

  .link-tel {
    padding-top: 8px;
    color: #9B9B9B;
  }
  .link-time {
    display: block;
    width: 137px;
  }

  .link-us {
    padding-top: 10px;
  }

  .link-us .link-us-wechat,
  .link-us .link-us-qq,
  .link-us .link-us-email {
    position: relative;
    margin-left: 15px;
    text-align: center;
    cursor: pointer;
    font-size: 16px;
  }

  .link-img {
    width: 26px;
    height: 26px;
  }

  .link-us-qcode,
  .link-us-qqgroup,
  .linkus-email-number {
    position: absolute;
    top: -215px;
    left: 50%;
    margin-left: -100px;
    padding: 20px;
    text-align: center;
    font-size: 16px;
    color: #333;
    background: #fff;
    border: 1px solid #282C2F;

    visibility: hidden;
    opacity: 0;
    cursor: default;
    transition: opacity 0.3s ease-in-out;
  }

  .link-us-qcode:after,
  .link-us-qqgroup:after,
  .linkus-email-number:after {
    position: absolute;
    left: 50%;
    margin-left: -15px;
    border-width: 12px 12px 0;
    border-style: solid;
    display: block;
    content: '.';
    font-size: 0;
    line-height: 0;
    width: 1px;
    height: 0;
    bottom: -11px;
    border-color: #fff transparent transparent transparent;
  }

  .link-us-qcode:before,
  .link-us-qqgroup:before,
  .linkus-email-number:before {
    position: absolute;
    left: 0;
    bottom: -20px;
    display: block;
    content: '.';
    width: 100%;
    height: 20px;
    background: transparent;
  }

  .link-us-qcode img{ display: block; margin: auto; width: 160px; height: 160px; }

  .link-us-qqgroup {
    top: -188px;
    width: 213px;
    box-sizing: border-box;
    padding: 20px 10px;
    margin-left: -105px;
    line-height: 30px;
  }
  .link-us-qqgroup .remark,
  .linkus-email-number .remark {
    padding-top: 15px;
  }

  .linkus-email-number {
    top: -129px;
    width: 200px;
    box-sizing: border-box;
    padding: 20px 10px;
    margin-left: -98px;
    line-height: 30px;
  }

  .linkus-email-number a {
    color: #4a90e2;
    text-decoration: underline;
  }

  .link-us-wechat:hover .link-us-qcode,
  .link-us-qq:hover .link-us-qqgroup,
  .link-us-email:hover .linkus-email-number {
    opacity: 1;
    visibility: visible;
  }
  /* 客服 */
  .im{
    position: fixed;
    bottom:180px;
    left: 50%;
    transform: translate(520px, 0);
    font-size: 38px;
    width: 45px;
    height: 43px;
    background-image: url("~images/market/icon/kefu.png");
    background-repeat: no-repeat;
    background-position: center center;
    background-size: 100% 100%;
    border-radius: 4px;
    z-index: 0;
    .img{
      position: absolute;
      bottom:50px;
      right: 0px;
      padding:10px;
      background-color: #fff;
      border:1px solid #c8c8c8;
      img{
        width: 100px;
        height: 100px;
      }
      .name{
        padding-top: 7px;
        line-height: 14px;
      }
    }
  }
  .imShow{
    opacity: 0;
  }
</style>

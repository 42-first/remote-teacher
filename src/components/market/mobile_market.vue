<template>
  <div class="over app">
    <div class="banner">
      <img src="~images/market/banner/mobile-banner.jpg"/>
    </div>
    <div class="product">
      <div class="color3 list-name">
        雨课件市场


      </div>
      <ul class="con-width">
        <li class="over text-center inline-block" v-for="i in list">
          <div class="container">
            <div class="img over">
              <img :src="i.cover"/>
            </div>
            <div class="text-con">
              <div class="color0 text-left over name">
                {{i.title}}


              </div>
              <div class="color9b text-left author">
                <div v-line-bottom>
                  {{i.school}} {{i.author}}


                </div>
              </div>
              <div class="price">
                ¥ {{i.discount_price}}


              </div>
              <div class="font14 old-price">
                ¥ {{i.price}}


              </div>
              <a :href="i.buy_link" class="inline-block font16 buy" target=_blank>立即购买</a>
            </div>
          </div>
        </li>
        <li class="inline-block text-center expect">
          <div class="container">
            <div class="over img-con">
              <i class="iconfont icon-logo-book"></i>
              <div class="show"><span>
                  更多雨课件<br/>敬请期待……
                </span></div>
            </div>
            <div class="font12 colora text-left text">
              <p>雨课堂盼望具有丰富教学经验的老师出品自己的雨课件，以共建共享完善的教学方案体系。</p>
              <p>联系客服获取更多信息。</p>
              <p>邮箱：</p>
              <p class="color6">yuketang@xuetangx.com</p>
            </div>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
  import request from '@/util/request'
  import API from '@/util/api'
  import $ from 'jquery'

  export default {
    data () {
      return {
        list: []
      }
    },
    created: function () {
      this._init()
    },
    methods: {
      _init: function () {
        let self = this
        request.get(API.market.get_rain_courseware_list).then(function (e) {
          let data = e.data
          self.list = data.rain_courseware_list
        })
        setTimeout(function () {
          self.wxInit()
        }, 1e3)
      },
      wxInit: function () {
        let self = this

        $.ajax({
          type: 'POST',
          url: '/v/course_meta/weixin_index_parameter',
          data: JSON.stringify({url: location.href}),
          dataType: 'json',
          success: function (res) {
            var data = res.data.js_config
            // 微信分享配置
            window.wx && window.wx.config({
              debug: false,
              appId: data.appId,
              timestamp: data.timestamp,
              nonceStr: data.nonceStr,
              signature: data.signature,
              jsApiList: ['onMenuShareTimeline', 'onMenuShareAppMessage', 'onMenuShareQQ', 'onMenuShareWeibo', 'onMenuShareQZone']
            })

            self.setWX()
          },
          error: function (xhr, type) {}
        })
      },
      setWX: function () {
        var wxdata = {
          title: '⎡雨课堂⎦雨课件',
          desc: '名师教学资源，经验共筑共享',
          lineLink: location.href,
          imgUrl: 'http://sfe.ykt.io/o_1bpnulcdpabglmaf7uo3q14j79.png'
        }

        window.wx && window.wx.ready(function () {
          // 发送给朋友
          window.wx && window.wx.onMenuShareAppMessage({
            title: wxdata.title, // 分享标题
            desc: wxdata.desc, // 分享描述
            link: wxdata.lineLink, // 分享链接
            imgUrl: wxdata.imgUrl, // 分享图标
            type: '', // 分享类型,music、video或link，不填默认为link
            dataUrl: '', // 如果type是music或video，则要提供数据链接，默认为空
            success: function () {
              // 用户确认分享后执行的回调函数
            },
            cancel: function () {
              // 用户取消分享后执行的回调函数
            }
          })

          // 分享到朋友圈
          window.wx && window.wx.onMenuShareTimeline({
            title: wxdata.title, // 分享标题
            link: wxdata.lineLink, // 分享链接
            imgUrl: wxdata.imgUrl, // 分享图标
            success: function () {
            },
            cancel: function () {
              // 用户取消分享后执行的回调函数
            }
          })
        })
      }
    },
    directives: {
      lineBottom: {
        inserted: function (el) {
          let $rect = el.getBoundingClientRect()
          let $height = $rect.height
          let $text = el.innerHTML
          if ($height < 30) {
            el.innerHTML = '<br/>' + $text
          }
        }
      }
    }
  }
</script>
<style lang="scss" scoped>
  .app {
    margin: .8rem auto;
    background-color: #f5f5f5;
    max-width: 12rem;
    word-wrap: break-word;
    word-break: normal;
    .banner {
      width: 100%;
      font-size: 0;
      img {
        width: 100%;
      }
    }
    .product {
      width: 100%;
      padding: 0 .16rem;
      .con-width {
        width: auto;
      }
      .list-name {
        font-size: .32rem;
        height: .8rem;
        line-height: .8rem;
      }
      ul {
        font-size: 0;
        padding-bottom: .4rem;
        li {
          width: 50%;
          height: 5.3rem;
          padding-right: .1rem;
          box-sizing: border-box;
          margin-top: .2rem;
          overflow: hidden;
          div.container {
            height: 100%;
            border: .02rem solid #c8c8c8;
            background-color: #fff;
            overflow: hidden;
            .img {
              width: 100%;
              height: 1.92rem;
              img {
                width: 100%;
              }
            }
            .text-con {
              width: 100%;
              font-size: .32rem;
              line-height: .5rem;
              .name {
                width: 100%;
                text-overflow: ellipsis;
                padding-left: .1rem;
                height: .4rem;
                margin-top: .06rem;
                line-height: .4rem;
                overflow: hidden;
              }
              .author {
                width: 100%;
                border-bottom: .02rem solid #c8c8c8;
                margin: 0 auto .2rem auto;
                padding: 0 0 .1rem .1rem;
                box-sizing: content-box;
                line-height: .3rem;
                height: .6rem;
                overflow: hidden;
                font-size: .28rem;
              }
              .price {
                height: .4rem;
                color: #F5A623;
                font-size: .32rem;
                margin-top: .2rem;
              }
              .old-price {
                font-size: .28rem;
                line-height: .4rem;
                color: #9b9b9b;
                text-decoration: line-through;
                text-decoration-color: #979797;
              }
              a {
                background-color: #F5A623;
                color: #fff;
                width: 1.5rem;
                height: .5rem;
                border-radius: .4rem;
                line-height: .5rem;
                font-size: .28rem;
                margin: .12rem auto;
              }
            }
          }
        }
        li.expect {
          div.container {
            .img-con {
              width: 100%;
              height: 3.06rem;
              margin-bottom: .2rem;
              line-height: 3.1rem;
              background-color: #B1CEF9;
              position: relative;
              i {
                font-size: 1.8rem;
                color: rgba(255, 255, 255, .3);
              }
              .show {
                position: absolute;
                top: 0;
                left: 0;
                height: 100%;
                width: 100%;
                line-height: 3.06rem;
                text-align: center;
                color: #fff;
                z-index: 2;
                font-size: .3rem;
                span {
                  display: inline-block;
                  line-height: .3rem;
                }
              }
            }
            .text {
              padding: 0 .1rem;
              font-size: .2rem;
            }
          }
        }
        li:nth-child(even) {
          padding-right: 0;
          padding-left: .1rem;
        }
        li:nth-child(1), li:nth-child(2) {
          margin-top: 0;
        }
      }
    }
  }
</style>

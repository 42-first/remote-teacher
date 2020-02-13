<template>
  <div class="over app">
    <div class="banner">
      <img src="http://sfe.ykt.io/o_1bq1tobqeap3ov9slt1tof1q1lf.jpg"/>
    </div>
    <div class="product">
      <div class="color3 list-name">
        雨课件市场


      </div>
      <ul class="con-width">
        <li class="over text-center inline-block" v-for="i in list">
          <div class="container">
            <div class="course_info">
              <div class="img over">
                <img :src="i.cover"/>
              </div>
              <div class="text-con">
                <div class="color0 text-left over name">{{i.title}}</div>
                <div class="color9b text-left author">{{i.school}} {{i.author}}</div>
              </div>
            </div>
            <div class="actions-box">
              <div class="price">
                ¥ {{i.discount_price}}
              </div>
              <div class="font14 old-price">
                ¥ {{i.price}}
              </div>
              <a :href="i.buy_link" class="inline-block font16 buy" target=_blank>立即购买</a>
              <a href="javascript:alert('请在电脑上打开 \n pro.yuketang.cn \n下载样章');" class="download_courseware inline-block font16" @click="handleTip">免费下载样章</a>
            </div>
          </div>
        </li>
        <li class="inline-block text-center expect">
          <div class="container">
            <div class="course_info">
              <div class="over img-con">
                <i class="iconfont icon-logo-book"></i>
                <div class="show"><span>
                    更多雨课件敬请期待……
                  </span></div>
              </div>
            </div>

            <div class="font12 colora text-left text">
              <p>雨课堂盼望具有丰富教学经验的老师出品自己的雨课件，以共建共享完善的教学方案体系。</p>
              <p class="mt20">联系客服获取更多信息。</p>
              <p>客服邮箱：</p>
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
      this.init()
    },
    methods: {
      init: function () {
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
          title: '「雨课堂」雨课件',
          desc: '名师教学资源，经验共筑共享',
          lineLink: location.href,
          imgUrl: 'http://sfe.ykt.io/o_1bppvh39sj5josf15s8m431itf9.png'
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
      },
      handleTip(evt) {
        let host = location.host;
        alert(`请在电脑上打开 \n ${host} \n下载样章`);
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
      padding: 0 .2rem;
      box-sizing: border-box;
      .con-width {
        width: 100%;
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
          width: 100%;
          height: 3.24rem;
          box-sizing: border-box;
          margin-top: .3rem;
          overflow: hidden;
          div.container {
            display: flex;
            justify-content: space-between;
            width: 100%;
            height: 100%;
            background: #fff;
            .img {
              width: 3.44rem;
              height: 1.92rem;
              img {
                width: 100%;
              }
            }
            .text-con {
              width: 100%;
              font-size: .32rem;
              line-height: .5rem;
              margin-top: .22rem;
              padding-left: .08rem;
              .name {
                width: 3.44rem;
                text-overflow: ellipsis;
                white-space: nowrap;
                height: .4rem;
                line-height: .4rem;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
              }
              .author {
                width: 3.44rem;
                height: .32rem;
                font-size: .28rem;
                line-height: .32rem;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
              }
            }
            .actions-box {
              flex: 1;
              padding: .2rem 0 .3rem;

              .price {
                height: .66rem;
                color: #F5A623;
                font-size: .48rem;
                line-height: .66rem;
                margin: 0;
              }
              .old-price {
                font-size: .24rem;
                line-height: .32rem;
                color: #9b9b9b;
                text-decoration: line-through;
                text-decoration-color: #979797;
              }
              a {
                background-color: #F5A623;
                color: #fff;
                width: 2.2rem;
                height: .6rem;
                border-radius: .4rem;
                line-height: .6rem;
                font-size: .28rem;
                margin: .24rem auto .3rem;
              }
              a.download_courseware {
                width: 2.2rem;
                height: .6rem;
                border-radius: .4rem;
                line-height: .6rem;
                font-size: .28rem;
                border: 1px solid #639EF4;
                display: block;
                background: #fff;
                color: #639EF4;
                margin: 0 auto;
                box-sizing: border-box;
              }
            }

          }
        }
        li.expect {
          div.container {
            .img-con {
              width: 3.44rem;
              height: 3.24rem;
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
                font-size: .22rem;
                span {
                  display: inline-block;
                  line-height: .3rem;
                }
              }
            }
            .text {
              padding: .4rem .15rem .14rem .15rem;
              p {
                font-size: .24rem;
                line-height: 1.4;
              }
              .mt20 {
                margin-top: .4rem;
              }
            }
          }
        }
        li:first-child {
          margin-top: 0;
        }
      }
    }
  }
</style>

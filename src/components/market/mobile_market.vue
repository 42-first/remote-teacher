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
                  {{i.school}} {{i.author}}
          </div>
                <div class="price">
                  ¥ {{i.discount_price}}
          </div>
                <div class="font14 old-price">
                  ¥ {{i.price}}
          </div>
                <a :href="i.buy_link" class="inline-block font16 buy" target = _blank>立即购买</a>
              </div>
            </div>
          </li>
          <li class="inline-block text-center expect">
            <div class="container">
              <div class="over img-con">
                <i class="iconfont icon-logo-book"></i>
              </div>
              <div class="font12 colora text-left text">
                <p>雨课堂盼望在各学科领域具有丰富教学经验的老师出品自己的雨课件，以共建共享完善的教学方案体系。</p>
                <p>请联系客服获取更多信息。</p>
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
      }
    }
  }
</script>
<style lang="scss" scoped>
  .app{
    margin: .8rem auto;
    background-color: #f5f5f5;
    max-width: 12rem;
    word-wrap: break-word;
    word-break: normal;
    .banner{
      width: 100%;
      font-size: 0;
      img{
        width: 100%;
      }
    }
    .product{
      width: 100%;
      padding: 0 .16rem;
      .con-width{
        width: auto;
      }
      .list-name{
        font-size: .32rem;
        height: .8rem;
        line-height: .8rem;
      }
      ul {
        font-size: 0;
        padding-bottom: .4rem;
        li {
          width: 50%;
          height: 5.8rem;
          padding-right: .1rem;
          box-sizing: border-box;
          margin-top: .2rem;
          div.container{
            height: 100%;
            border: .02rem solid #c8c8c8;
            background-color: #fff;
            .img {
              width: 100%;
              height: 2rem;
              img {
                width: 100%;
              }
            }
            .text-con{
              width: 100%;
              padding:.1rem;
              font-size: .32rem;
              line-height: .5rem;
              .name {
                width: 100%;
                text-overflow: ellipsis;
                padding-left: .1rem;
                display: -webkit-box;
                -webkit-box-orient: vertical;
                -webkit-line-clamp: 2;
                line-height: .4rem;
                overflow: hidden;
              }
              .author {
                width: 100%;
                border-bottom: .02rem solid #c8c8c8;
                margin: 0 auto;
                padding: 0px 0px .2rem .1rem;
                line-height: .28rem;
              }
              .price {
                height: .4rem;
                color: #F5A623;
                margin-top:.2rem;
              }
              .old-price{
                font-size: .3rem;
                line-height: .4rem;
                color: #9b9b9b;
                text-decoration: line-through;
                text-decoration-color: #979797;
                margin-top: .16rem;
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
        li.expect{
          font-size: .2rem;
          div.container{
            .img-con{
              width: 100%;
              height: 3.1rem;
              margin-bottom: .2rem;
              line-height: 3.1rem;
              background-color: #B1CEF9;
              i{
                font-size: 1.8rem;
                color: rgba(255,255,255,.3);
              }
            }
            .text{
              padding:0 .1rem;
            }
          }
        }
        li:nth-child(even){
          padding-right: 0;
          padding-left: .1rem;
        }
        li:nth-child(1),li:nth-child(2){
          margin-top: 0;
        }
      }
    }
  }
</style>

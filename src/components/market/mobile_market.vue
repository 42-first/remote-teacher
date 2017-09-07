<template>
    <div class="app">
      <ul class="con-width  text-center">
        <li class="over inline-block" v-for="i in list">
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
        </li>
        <li class="inline-block expect">
          <div>
            <div class="over img-con">
              <i class="iconfont icon-logo-book"></i>
            </div>
            <div class="font12 colora text-left text">
              <p>雨课堂盼望熟练使用雨课堂，在各学科领域具有丰富教学经验的老师出品自己的雨课件，以共建共享更加完善的教学方案体系。</p>
              <p>请联系客服获取更多相关信息。</p>
              <p>客服邮箱：<span class="color6">yuketang@xuetangx.com</span></p>
            </div>
          </div>
        </li>
      </ul>
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
    width: 100%;
    min-height: 8rem;
    background-color: #fff;
    margin-top: .9rem;
    .con-width{
      width: auto;
    }
    ul {
      li {
        width: 3.44rem;
        height: 4.6rem;
        background-color: #fff;
        border: .02rem solid #c8c8c8;
        margin: .2rem .2rem 0 .2rem;
        background-color: #fff;
        .img {
          width: 100%;
          height: 2rem;
          img {
            width: 100%;
          }
          background-color: #ffae00;
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
            height: .5rem;
            display: -webkit-box;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 2;
            overflow: hidden;
          }
          .author {
            height: .28rem;
            width: 100%;
            border-bottom: .02rem solid #c8c8c8;
            margin: 0 auto;
            padding: 0px 0px .5rem .1rem;
            line-height: .28rem;
          }
          .price {
            height: .4rem;
            color: #F5A623;
          }
          .old-price{
            font-size: .3rem;
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
            margin: .1rem auto;
          }
        }
      }
      li:nth-child(2){
        margin-right: 0;
      }
      li.expect{
        font-size: .2rem;
        .img-con{
          width: 100%;
          height: 2rem;
          margin-bottom: .2rem;
          line-height: 2rem;
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
  }
</style>

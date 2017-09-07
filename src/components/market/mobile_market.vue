<template>
    <div class="app">
      <ul class="con-width  text-center">
        <li class="over inline-block" v-for="i in list">
          <div class="img over">
            <img :src="i.cover"/>
          </div>
          <div class="color0 text-left over name">
            {{i.title}}
          </div>
          <div class="font18 color9b text-left author">
            {{i.school}} {{i.author}}
          </div>
          <div class="color4a font20 describe">
            <!--{{i.introduce}}-->
          </div>
          <div class="font20 price">
            ¥ {{i.discount_price}}
          </div>
          <div class="font14 old-price">
            ¥ {{i.price}}
          </div>
          <a :href="i.buy_link" class="inline-block font16 buy" target = _blank>立即购买</a>
        </li>
        <li class="inline-block expect">
          <div>
            <div class="over img-con">
              <img src="~images/market/icon/expect.png"/>
            </div>
            <div class="font12 colora text-left text">
              <p>雨课堂盼望熟练使用雨课堂，在各学科领域具有丰富教学经验的老师出品自己的雨课件，以共建共享更加完善的教学方案体系。</p>

              <p>请联系客服获取更多相关信息。</p>
              <p>客服邮箱：yuketang@xuetangx.com</p>
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
    min-height: 400px;
    background-color: #fff;
    margin-top: 45px;
    .con-width{
      width: 354px;
    }
    ul {
      li {
        width: 172px;
        height: 230px;
        background-color: #fff;
        border: 1px solid #c8c8c8;
        margin: 10px 10px 0 10px;
        .img {
          width: 100%;
          height: 102px;
          img {
            width: 100%;
          }
        }
        .name {
          width: 100%;
          text-overflow: ellipsis;
          padding-left: 10px;
          padding-top: 5px;
          line-height: 10px;
          max-height: 24px;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
          overflow: hidden;
          font-size: 1rem;
        }
        .author {
          height: 14px;
          width: 100px;
          border-bottom: 1px solid #c8c8c8;
          margin: 0 auto;
          padding: 0px 0px 18px 5px;
          line-height: 14px;
        }
        .describe {
          height: 10px;
          line-height: 10px;
        }
        .price {
          height: 14px;
          line-height: 14px;
          color: #F5A623;
        }
        .old-price{
          height: 10px;
          line-height: 10px;
          color: #9b9b9b;
          text-decoration: line-through;
          text-decoration-color: #979797;
        }
        a {
          background-color: #F5A623;
          color: #fff;
          width: 64px;
          height: 18px;
          border-radius: 9px;
          line-height: 18px;
          margin: 5px auto;
        }
      }
      li:nth-child(2){
        margin-right: 0;
      }
      li.expect{
        background-color: #f8f8f8;
        .img-con{
          width: 100%;
          height: 136px;
          margin-bottom: 10px;
        }
        .text{
          padding:0 10px;
        }
      }
    }
  }
</style>

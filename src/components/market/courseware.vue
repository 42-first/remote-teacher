<template>
  <div class="back">
    <banner :type="2"></banner>
    <div class="detail over">
      <div class="con-width over market-title">
        <div class="font26 title">
          雨课件市场
        </div>
        <div class="text-right btn-con">
          <!--<router-link :to="{name: 'verification',query: {date: timestamp()}}" class="inline-block btn-blue font16 text-center btn">激活</router-link>
          <router-link :to="{name: 'market',query: {date: timestamp()}}" class="inline-block btn-blue font16 text-center btn mine">我的雨课件</router-link>-->
          <a @click="goLogin('verification')" class="inline-block btn-blue font16 text-center pointer btn">激活</a>
          <a @click="goLogin('index')" class="inline-block btn-blue font16 text-center btn pointer mine">我的雨课件</a>
        </div>
      </div>
      <ul class="con-width">
        <li class="over text-center inline-block" v-for="i in list">
          <div class="img over">
            <img :src="i.cover"/>
          </div>
          <div class="font18 color0 text-left over name">
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
            <div class="over text-center img-con">
              <i class="iconfont icon-logo-book"></i>
              <div class="font22">
                更多雨课件，敬请期待……
              </div>
            </div>
            <div class="font12 colora text-left text">
              <p>雨课堂盼望熟练使用雨课堂，在各学科领域具有丰富教学经验的老师出品自己的雨课件，以共建共享更加完善的教学方案体系。请联系客服获取更多相关信息。</p>
              <p>&nbsp;</p>
              <p>请联系客服获取更多相关信息。</p>
              <p >客服邮箱：<span class="color6">yuketang@xuetangx.com</span></p>
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
  import courseware from '@/components/market/common/courseware.vue'
  import banner from '@/components/market/common/banner.vue'
  export default {
    name: 'market',
    data () {
      return {
        name: '',
        list: [],
        rc: '',
        downloadList: []
      }
    },
    created: function () {
      setTimeout(function () {
        document.body.scrollTop = 0
      }, 2)
      let query = this.$route.query
      let rc = query.rc
      this.rc = rc
      if (process.env.NODE_ENV !== 'production') {
        request.post = request.get
      }
      this.init()
    },
    methods: {
      init: function () {
        let self = this
        let params = {}
        this.rc && (params = {rc: this.rc})
        request.get(API.market.get_rain_courseware_list, params).then(function (e) {
          let data = e.data
          self.list = data.rain_courseware_list
          self.support()
        })
      },
      order: function () {
        window.open('https://i.weidian.com/order/list.php?type=0')
      },
      goLogin: function (i) {
        let self = this
        this.needLogin(function () {
          self.$router.push({name: i, query: {date: self.timestamp()}})
        })
      },
      needLogin: function (fn) {
        request.get(API.market.user_info).then(function () {
          fn && fn()
        }).catch(function () {
          window.location.href = location.origin + '/web?next=' + location.pathname + '&type=1'
        })
      },
      timestamp: function () {
        return new Date().getTime()
      },
      support: function () {
        var bodyHeight = document.body.clientHeight
        var windowHeight = window.innerHeight
        if (bodyHeight < windowHeight) {
          document.querySelector('.detail').style.minHeight = ((windowHeight - 600) + 'px')
        }
      }
    },
    directives: {
    },
    components: {
      courseware,
      banner
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
  @import "~@/style/market/common";

  .back {
    background-color: #F5F5F5;
    margin-top: 60px;
    .con-width{
      width: 840px;
    }
    .detail {
      background-color: #F5F5F5;
      padding: 20px 0 50px 0;
      .market-title{
        margin: 0 auto;
        border-bottom:1px solid #d8d8d8;
        padding-left: 4px;
        display: flex;
        padding-bottom: 10px;
        .title{
          width: 300px;
          padding-top: 10px;
        }
        .btn-con{
          width: 100%;
          .btn{
            height: 38px;
            color:#639EF4;
            border:1px solid #639EF4;
            border-radius: 19px;
            line-height: 38px;
            margin-top: 6px;
            text-align: center;
            width: 90px;
          }
          .mine{
            width: 130px;
            margin-left: 30px;
          }
        }
      }
      ul {
        font-size: 0px;
        li {
          width: 380px;
          height: 424px;
          background-color: #fff;
          border: 1px solid #c8c8c8;
          margin: 20px 34px 0 0;
          .img {
            width: 100%;
            height: 204px;
            img {
              width: 100%;
            }
          }
          .name {
            width: 100%;
            text-overflow: ellipsis;
            padding-left: 20px;
            padding-top: 10px;
            line-height: 22px;
            max-height: 55px;
            display: -webkit-box;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 2;
            overflow: hidden;
          }
          .author {
            height: 30px;
            width: 360px;
            border-bottom: 1px solid #c8c8c8;
            margin: 0 auto;
            padding: 0px 0px 38px 10px;
            line-height: 30px;
          }
          .describe {
            height: 20px;
            line-height: 20px;
          }
          .price {
            height: 30px;
            line-height: 30px;
            color: #F5A623;
          }
          .old-price{
            height: 20px;
            line-height: 20px;
            color: #9b9b9b;
            text-decoration: line-through;
            text-decoration-color: #979797;
          }
          a {
            background-color: #F5A623;
            color: #fff;
            width: 128px;
            height: 38px;
            border-radius: 19px;
            line-height: 38px;
            margin: 10px auto;
          }
        }
        li:nth-child(even){
          margin-left: 34px;
          margin-right: 0;
        }
        li.expect{
          background-color: #f8f8f8;
          .img-con{
            width: 100%;
            height: 274px;
            margin-bottom: 20px;
            background-color: #B1CEF9;
            line-height: 274px;
            position: relative;
            i.icon-logo-book{
              font-size: 140px;
              color: rgba(255,255,255,.3);
              position: relative;
            }
            div{
              position: absolute;
              width: 100%;
              height: 100%;
              color: #fff;
              z-index: 5;
              top:0;
              left:0;
            }
          }
          .text{
            padding:0 20px;
          }
        }
      }
    }
  }
</style>

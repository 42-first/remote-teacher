<template>
  <div class="back">
    <div class="banner">
      <img src="~images/market/banner/banner_search.png"/>
    </div>
    <div class="con-width font20 color4a tab" v-if="ismarket">
      <div class="tab-con">
        <div class="inline-block text-center pointer" @click="tab = 0" v-bind:class="{active:!tab}">雨课件市场</div>
        <div class="inline-block text-center pointer" @click="tab = 1" v-bind:class="{active:tab}">我的雨课件</div>
      </div>
    </div>
    <div class="con-width font18 color3" v-show="ismarket && !tab">
      雨课件是由雨课堂出品的智慧教学全周期课程包，由高等教育学府高级教师编写，为多个学科提供教学参考方案，实现教学经验共建共享   <a class="color63" href="">详情>></a>
    </div>
    <div class="over flow" v-show="!tab">
      <div class="font24 color3 con-width">
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
    <div class="detail over" v-show="!tab">
      <ul class="con-width  text-center">
        <li class="over inline-block" v-for="i in list">
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
            {{i.introduce}}
          </div>
          <div class="font20 price">
            ¥ {{i.price}}
          </div>
          <a :href="i.buy_link" class="inline-block font16 buy" target = _blank>立即购买</a>
        </li>
        <li class="inline-block expect" v-if="ismarket">
          <div>
            <img src="~images/market/icon/expect.png"/>
            <div class="font12 colora text-left text">
              <p>雨课堂非常希望熟练使用雨课堂，且在各学科领域具有丰富教学经验的老师出品自己的雨课件，以共建共享更加完善的教学方案体系。</p>

              <p>请联系客服获取更多相关信息。</p>
              <p>客服邮箱：yuketang@xuetangx.com</p>
            </div>
          </div>
        </li>
      </ul>
      <div class="con-width text-center">
        <div class="inline-block font20  activate">
        如果您已购买，请直接激活 <router-link :to="{name: 'Verification'}" class="inline-block btn" target="_blank">激活<i class="iconfont icon-jiantou"></i></router-link>
        </div>
      </div>
    </div>
    <div class="con-width download-list" v-show="tab">
      <div class="con-width text-center color63 btn-con">
        <router-link :to="{name:'Verification'}">
          <input type="button" value="已购买，去激活" class="font16 color63" />
        </router-link>
        <input type="button" value="查看我的雨课件订单" class="font16 color63" @click="order" />
      </div>
      <div class="font24 color3">
        我激活的雨课件
      </div>
      <div class="con-width">
        <courseware v-for="i in downloadList" :item="i" key></courseware>
      </div>
    </div>
    <div class="text-center con-width relative rule" v-show="!ismarket">
      <div class="font36 text-center title">
        雨课堂介绍
      </div>
      <div class="con-width text-left font18">
        <p> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          雨课件是由雨课堂出品的智慧教学全周期课程包，由高等教育学府高级教师编写，
        基于雨课堂“课前预习—实时课堂-课后作业”的智慧教学模式，为多个学科提供教学参考方案，助力教学水平提升，实现教学经验共建共享。
      雨课件作为教师知识产权的产物，在雨课堂的平台中，将以一种有偿的资源形式共享，教师购买并激活后，即拥有它的编辑权和使用权，方便用于雨课堂教学。</p>
        <div class="con-width text-center demo">
          <div class="color9b text-center">课件事例</div>
          <img src="~images/market/demo/course.png"/>
        </div>
        <p>
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          雨课堂非常希望熟练使用雨课堂，且在各学科领域具有丰富教学经验的老师出品自己的雨课件，以共建共享更加完善的教学方案体系。
        </p>
        <p>
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;请联系客服获取更多相关信息。客服邮箱：yuketang@xuetangx.com
        </p>
      </div>
    </div>
  </div>
</template>

<script>
  import request from '@/util/request'
  import API from '@/util/api'
  import $ from 'jquery'
  import courseware from '@/components/market/common/courseware.vue'
  export default {
    name: 'market',
    data () {
      return {
        name: '',
        list: [],
        rc: '',
        ismarket: !1,
        tab: 0,
        downloadList: []
      }
    },
    created: function () {
      let query = this.$route.query
      let rc = query.rc
      this.rc = rc
      let name = this.$route.name
      name === 'courseware' && (this.ismarket = !0)
      if (process.env.NODE_ENV !== 'production') {
        request.post = request.get
      }
      this.init()
      this.ismarket && this.getList()
    },
    methods: {
      init: function () {
        let self = this
        let params = {}
        this.rc && (params = {rc: this.rc})
        request.get(API.market.get_rain_courseware_list, params).then(function (e) {
          let data = e.data
          self.list = data.rain_courseware_list
        })
      },
      getList: function () {
        let self = this
        request.post(API.market.rain_courseware_list).then(function (e) {
          let data = e.data
          self.downloadList = data.rain_courseware_list
        })
      },
      order: function () {
        location.href = 'https://i.weidian.com/order/list.php?type=0'
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
    },
    components: {
      courseware
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
    .tab{
      margin: 20px auto;
      height: 50px;
      line-height: 50px;
      border-bottom:1px solid #eee;
      .tab-con{
        margin: -1px auto;
        width: 360px;
        display: flex;
        div{
          width: 50%;
        }
        div.active{
          border-bottom: 2px solid #639EF4;
          color: #639EF4;
        }
      }
    }
    .flow {
      height: 226px;
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
      padding: 30px 0;
      .title {
        margin: 36px auto;
      }
      ul {
        li {
          width: 380px;
          height: 436px;
          background-color: #fff;
          border: 1px solid #c8c8c8;
          margin: 20px;
          .img {
            width: 100%;
            height: 214px;
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
            margin: 10px auto;
          }
        }
        li:nth-child(2){
          margin-right: 0;
        }
        li.expect{
          background-color: #f8f8f8;
          .text{
            padding:0 20px;
          }
        }
      }
      .activate{
        margin: 30px 0 50px 0;
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
      .demo{
        margin: 10px auto;
        div{
          width: 690px;
          border-bottom: 1px solid #d8d8d8;
          margin: 0 auto;
        }
        img{
          width: 690px;
          margin: 20px auto;
        }
      }
    }
    .download-list{
      padding-bottom: 30px;
      .btn-con{
        input{
          width: 208px;
          height: 38px;
          border: 1px solid #639ef4;
          border-radius: 19px;
          background-color: #fff;
          margin: 20px 30px;
        }
      }
    }
  }
</style>

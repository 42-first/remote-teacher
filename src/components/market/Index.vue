<template>
  <div class="back">
    <banner :type="0" :text="'我的雨课件'"></banner>
    <div class="con-width download-list">
      <div class="con-width color63 btn-con">
        <user-info :info="userInfo"></user-info>
        <div class="text-right btn-coat">
          <router-link :to="{name:'verification',query: {date: timestamp()}}">
            <input type="button" value="已购买，去激活" class="font16 color63 pointer btn-blue" />
          </router-link>
          <input type="button" value="查看我的雨课件订单" class="font16 color63 pointer btn-blue" @click="order" />
        </div>
      </div>
      <div class="font24 color3">
        我激活的雨课件
      </div>
      <div class="con-width">
        <courseware v-if="downloadList && downloadList.length" v-for="i in downloadList" :item="i" key></courseware>
        <div class="text-center over no-courseware" v-if="!downloadList || !downloadList.length">
          <div class="color0 font18 text">当前暂无雨课件，可先购买再激活使用</div>
          <router-link :to="{name:'courseware',query: {date: timestamp()}}" >
            <input type="button" class="color63 pointer font16 btn-blue buy" value="去购买"/>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import request from '@/util/request'
  import API from '@/util/api'
  import courseware from '@/components/market/common/courseware.vue'
  import banner from '@/components/market/common/banner.vue'
  import userInfo from '@/components/market/common/userInfo.vue'
  export default {
    name: 'market',
    data () {
      return {
        downloadList: [],
        userInfo: {}
      }
    },
    created: function () {
      if (process.env.NODE_ENV !== 'production') {
        request.post = request.get
      }
      this.init()
    },
    methods: {
      init: function () {
        this.needLogin()
        this.getList()
      },
      getList: function () {
        let self = this
        request.post(API.market.rain_courseware_list).then(function (e) {
          let data = e.data
          self.downloadList = data.rain_courseware_list
          self.downloadList = []
        })
      },
      order: function () {
        window.open('https://i.weidian.com/order/list.php?type=0')
      },
      needLogin: function () {
        let self = this
        request.get(API.market.user_info).then(function (e) {
          let data = e.data
          self.userInfo = data.user_profile
        }).catch(function () {
          window.location.href = location.origin + '/web?next=' + location.pathname + '&type=1'
        })
      },
      timestamp: function () {
        return new Date().getTime()
      }
    },
    components: {
      courseware,
      banner,
      userInfo
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
    .no-courseware{
      height: 208px;
      background-color: #f8f8f8;
      .text{
        margin: 60px 0 30px;
      }
      .buy{
        width: 106px;
        height: 38px;
        border:1px solid #639EF4;
        border-radius: 19px;
        background-color: rgba(255, 255, 255, 0);
      }
    }
    .download-list{
      padding-bottom: 30px;
      .btn-con{
        margin-top: 50px;
        border-bottom:1px solid #d8d8d8;
        padding-bottom: 20px;
        margin-bottom: 20px;
        display: flex;
        .btn-coat{
          width: 100%;
        }
        input{
          width: 208px;
          height: 38px;
          border: 1px solid #639ef4;
          border-radius: 19px;
          background-color: #fff;
          margin: 20px 0 20px 30px;
        }
      }
    }
  }
</style>

<template>
  <div class="con-width text-left font0 courseware-info" v-if="item">
    <img :src="item.cover"/>
    <div class="over inline-block detail">
      <div class="font18 color0">
        {{item.title}}
      </div>
      <div class="font18 color9b">
        {{item.school}} {{item.author}}
      </div>
      <a :href="'/v/rain_courseware/download/' + item.id">
        <div class="font16 color63 pointer download">
          <i class="iconfont icon-xiazai"></i>
          <span class="inline-block">
              下载雨课件
            </span>
        </div>
      </a>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'courseware',
    data () {
      return {}
    },
    props: ['item'],
    created: function () {
      this._init()
    },
    methods: {
      _init: function () {
      }
    }
  }
</script>
<style lang="scss" scoped>
  @import "~@/style/market/common";
  .courseware-info {
    background-color: #F8F8F8;
    padding: 30px 150px;
    width: 960px;
    margin-top: 10px;
    img {
      width: 236px;
      height: 148px;
    }
    .detail {
      height: 148px;
      width: 390px;
      position: relative;
      margin-left: 30px;
      padding: 10px;
    }
    .download {
      position: absolute;
      bottom: 0;
      right: 0;
      height: 28px;
      line-height: 28px;
      i {
        font-size: 28px;
      }
      span {
        height: 100%;
      }
    }
  }
</style>

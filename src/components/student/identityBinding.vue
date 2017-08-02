<template>
  <div class="supernatant">
    <div class="identy">
      <div class="binding" v-if="type === 1 && is_can_audit === 'true'">
        <img src="../../images/binding.png" class="banner"/>
        <div class="info-con">
          <div class="font-all info">
            此课程由选课系统同步导入<br/>
            绑定 <span class="font-blue">{{university_name}}</span> 教务系统账号后可<br/>
            进入课堂

          </div>
          <input type="button" value="去绑定身份" class="font-all blue-btn" @click="goUrl"/>
        </div>
        <div class="font-all audit">
          您也可以选择旁听身份进入<br/>
          未绑定身份时，您的课堂数据将无法被保留<br/>
          教师也无法获取您的课堂数据<br/>
          <input type="button" class="blue-line-btn go-audit" value="以旁听身份进入" @click="this.showMasking = !0;"/>
        </div>
      </div>
      <div class="binding" v-if="type === 1 && is_can_audit === 'false'">
        <img src="../../images/binding.png" class="banner"/>
        <div class="info-con">
          <div class="font-all info">
            此课程由选课系统同步导入<br/>
            绑定 <span class="font-blue">{{university_name}}</span> 教务系统账号后可<br/>
            进入课堂

          </div>
          <input type="button" value="去绑定身份" class="font-all blue-btn" @click="goUrl"
                 v-bind:style="{marginTop:'110px'}"/>
        </div>
      </div>
      <div class="binding" v-if="type === 2">
        <img src="../../images/binding.png" class="banner"/>
        <div class="info-con">
          <div class="font-all info">
            您已绑定教务系统账号<br/>
            但检测到您未选此课

          </div>
          <div class="font-grey">
            请您在选课系统中进行选课，选课信息将<br/>
            自动导入。<br/>
            如您已选此课，选课信息更新会有一定延<br/>
            迟，请耐心等待。

          </div>
          <input type="button" value="以旁听身份进入" class="font-all blue-btn" @click="goClassroom"
                 v-bind:style="{marginTop:'40px'}"/>
        </div>
      </div>
      <div class="masking" v-show="showMasking">
        <div class="alert font-all">
          旁听身份下，教师无法获取你的任<br/>何课程数据，确定要以旁听身份<br/>进入课程吗？

          <div class="btn-con">
            <div @click="showMasking=!1">取消</div>
            <div @click="goClassroom">确定</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<style lang="sass" scoped>
  * {
    box-sizing:border-box; }
    .supernatant{
      position:fixed;
        top:0;
        left:0;
        height: 100%;
        width: 100%;
        background-color: rgba(0, 0, 0, .6);
        z-index: 9999;
      .identy{
        position:absolute;
        margin:auto;
        top:0;
        left:0;
        right: 0;
        bottom:0;
        width: 80%;
        height: 80%;
      .font-all{
        font-size: 16px;
        color:#333;
  }
    .font-grey{
      font-size: 16px;
      color:#9B9B9B;
  }
    .font-blue{
    color: #639EF4; }
    .blue-btn{
      background-color:#639EF4;
      height: 40px;
      border:none;
      outline:none;
      color:#fff;
      border-radius: 4px;
  }
    .blue-line-btn{
      background-color:#fff;
      height: 40px;
      border:1px solid #639EF4;
      outline:none;
      color:#639EF4;
      border-radius: 4px;
  }
    .hide{
      display:none;
  }
    .masking{
      background-color: rgba(0, 0, 0, .6);
      text-align:center;
      position:fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      .alert{
        width: 300px;
        height: 201px;
        background-color: #fff;
        border-radius:4px;
        display:inline-block;
        margin-top: 120px;
        box-sizing:border-box;
        padding-top: 30px;
        line-height: 30px;
        .btn-con{
          width: 100%;
          height: 40px;
          margin-top: 40px;
          border-top:1px solid #c8c8c8;
          display:flex;
          div {
            height: 100%;
            width: 50%;
            line-height: 40px;
        }
          div:first-child{
            border-right: 1px solid #c8c8c8;
            color:#b9b9b9;
        }
          div:last-child{
            color:#639ef4;
      } }
  } }
    .binding{
      width: 100%;
      text-align:center;
      .banner{
        width: 100%;
        display:block;
  }
    .info-con{
      width: 100%;
      background-color: #fff;
      overflow:hidden;
      text-align:center;
      padding:4px;
      padding-bottom: 30px;
      .info{
        height:50px;
        text-align:center;
        margin: 30px auto;
  }
    .blue-btn{
      width: 260px;
  }
    .title{
      margin: 30px auto;
  } }
    .audit{
    text-align:center;
    padding-top: 10px;
    background-color: #F6F7F8; }
    .go-audit{
    width: 260px;
    margin: 20px auto; } } } }
</style>
<script>
  import $ from 'jquery'
  export default {
    data () {
      return {
        showMasking: !1
      }
    },
    props: ['type', 'is_can_audit', 'university_name', 'url'],
    created () {
      this.is_can_audit = this.is_can_audit + ''
      this._init()
    },
    methods: {
      _init: function () {
      },
      goClassroom: function () {
        $('.supernatant').remove()
      },
      goUrl: function () {
        window.location.href = this.url
      }
    }
  }
</script>

<template>

  <div class="supernatant">
    <div class="identy">
      <div class="binding" v-if="type == 1 && is_can == 'true'">
        <img src="~images/student/binding.png" class="banner"/>
        <div class="info-con">
          <div class="font-all info">
            此课程由选课系统同步导入<br/>
            绑定 <span class="font-blue">{{university_name}}</span> 教务系统账号后可
            进入课堂

          </div>
          <input type="button" value="去绑定身份" class="font-all blue-btn" @click="goUrl"/>
        </div>
        <div class="font-all audit">
          您也可以选择旁听身份进入<br/>
          未绑定身份时，您的课堂数据将无法被保留<br/>
          教师也无法获取您的课堂数据<br/>
          <input type="button" class="blue-line-btn go-audit" value="以旁听身份进入" @click="showMasking = !0;"/>
        </div>
      </div>
      <div class="binding" v-if="type == 1 && is_can == 'false'">
        <img src="~images/student/binding.png" class="banner"/>
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
      <div class="binding" v-if="type == 2">
        <img src="~images/student/binding.min.png" class="banner"/>
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

<style lang="scss" scoped>
    .supernatant{

        position:fixed;
        top:0;
        left:0;
        height: 100%;
        width: 100%;
        background-color: rgba(0, 0, 0, .6);
        z-index: 9999;
      -webkit-appearance : none ;/*解决ios上按钮的圆角问题*/
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
        font-size: .4rem;
        color:#333;
  }
    .font-grey{
      font-size: .4rem;
      color:#9B9B9B;
  }
    .font-blue{
    color: #639EF4; }
    .blue-btn{
      background-color:#639EF4;
      height: 1rem;
      border:none;
      outline:none;
      color:#fff;
      border-radius: .1rem;
      -webkit-appearance : none ;/*解决ios上按钮的圆角问题*/
  }
    .blue-line-btn{
      background-color:#fff;
      height: 1rem;
      border:1px solid #639EF4;
      outline:none;
      color:#639EF4;
      border-radius: .1rem;
      -webkit-appearance : none ;/*解决ios上按钮的圆角问题*/
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
        width: 7.5rem;
        height: 5rem;
        background-color: #fff;
        border-radius:.1rem;
        display:inline-block;
        margin-top: 3rem;
        box-sizing:border-box;
        padding-top: .75rem;
        line-height: .75rem;
        .btn-con{
          width: 100%;
          height: 1rem;
          margin-top: 1rem;
          border-top:1px solid #c8c8c8;
          display:flex;
          div {
            height: 100%;
            width: 50%;
            line-height: 1rem;
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
        box-sizing:border-box;
      padding:.1rem;
      padding-bottom: .75rem;
      .info{
        height:1.25rem;
        text-align:center;
        margin: .75rem auto;
  }
    .blue-btn{
      width: 6.5rem;
  }
    .title{
      margin: .75rem auto;
  } }
    .audit{
      text-align:center;
      box-sizing:border-box;
      padding-top: 10px;
      background-color: #F6F7F8; }
      .go-audit{
      width: 6.5rem;
      margin: .5rem auto;
      }
    }
    }
    }
</style>
<script>
  import $ from 'jquery'
  export default {
    data () {
      return {
        showMasking: !1,
        is_can: 'false'
      }
    },
    props: ['type', 'is_can_audit', 'university_name', 'url'],
    created () {
      this.is_can = this.is_can_audit + ''
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

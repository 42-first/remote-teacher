<template>
  <div class="back">
    <div class="banner">
      <img src="~images/market/banner/banner_activate.png"/>
    </div>
    <div class="con-width over user">
      <img :src="user && user.avatar" />
      <div class="inline-block">
        <div class="color4a font20">{{user && user.name}}</div>
        <div class="color9b font14">激活后仅授权当前用户使用</div>
      </div>
    </div>
    <div class="con-width verify-con" v-if="goVeri">
      <div class="insert text-center">
        <div class="inline-block info">
          <span class="inline-block font20 color4a">请输入序列号</span>
          <input type="text" class="font24 color63 text-center" v-model="code1" v-mouse-input @focus="toRight"
                 v-bind:class="{error:error}" @paste="paste($event, 1)"/>
        </div>
        <span class="inline-block"></span>
        <input type="text" class="font24 color63 text-center" v-model="code2" v-mouse-input @focus="toRight"
               v-bind:class="{error:error}" @paste="paste($event, 2)"/>
        <span class="inline-block"></span>
        <input type="text" class="font24 color63 text-center" v-model="code3" v-mouse-input @focus="toRight"
               v-bind:class="{error:error}" @paste="paste($event, 3)"/>
        <span class="inline-block"></span>
        <input type="text" class="font24 color63 text-center" v-model="code4" v-mouse-input @focus="toRight"
               v-bind:class="{error:error}" @paste="paste($event, 4)"/>
      </div>
      <div class="con-width err-con">
        <div class="font20 error-info" v-show="error">
          <span v-show="status == 1">
            您输入的序列号有误，请重新输入，或联系客服人员。
          </span>
          <span v-show="status == 2">
            您输入的序列号有误，请重新输入，或联系客服人员。
          </span>
          <span v-if ="status == 3">
            您已激活过该序列号，请直接<a class="color63" :href="link">下载</a>
          </span>
          <span v-show="status == 5">
            您输入的序列号已被其他用户激活，请重新输入，或联系客服人员。
          </span>
          <span v-if="status == 4">
            您已激活过《{{vData && vData.title}}》课件，无需再次激活，请直接<a class="color63" :href="link">下载</a>
          </span>
        </div>
      </div>
      <div class="con-width text-center">
        <input type="button" value="确认激活" class="color63 font16 activate" @click="goVerify"/>
      </div>
    </div>
    <div class="con-width text-center relative verify-success" v-if="vSuccess">
      <div class="inline-block color63 font48">
        <i class="iconfont icon-dui"></i>
        <span class="inline-block">验证成功</span>
      </div>
      <courseware :item="vData"></courseware>
      <div class="con-width text-center">
        <input type="button" value="继续验证" class="color63 font16 pointer continue" @click="continueVer"/>
      </div>
    </div>
    <div class="relative con-width">
      <i class="iconfont icon-kefu color63 text-center pointer im" @mouseover="codeShow = !0 "
         @mouseleave="codeShow = !1 ">
        <div class="img text-center" v-show="codeShow">
          <img src="~images/market/icon/289ba82d3d4581a99b3f70f164cfca6d.png"/>
          <div class="font14 color0">雨课堂微信客服</div>
        </div>
      </i>
    </div>
  </div>
</template>

<script>
  import request from '@/util/request'
  import API from '@/util/api'
  import $ from 'jquery'
  import courseware from '@/components/market/common/courseware.vue'
  export default {
    name: 'Verification',
    data () {
      return {
        goVeri: !0,
        vSuccess: !1,
        code: '',
        code1: '',
        code2: '',
        code3: '',
        code4: '',
        error: !1,
        vData: null,
        codeShow: !1,
        status: 0,
        user: null,
        link: ''
      }
    },
    created: function () {
      if (process.env.NODE_ENV !== 'production') {
        request.post = request.get
      }
      this.getUser()
    },
    methods: {
      goVerify: function () {
        let self = this
        self.code = this.code1 + this.code2 + this.code3 + this.code4
        request.post(API.market.bind_serial_number, {serial_number: self.code}).then(function (e) {
          let data = e.data
          let status = e.status
          switch (status) {
            case 0:
              data && (self.vData = data)
              self.vSuccess = !0
              self.goVeri = !1
              break
            case 1:
              self.status = 1
              self.error = !0
              break
            case 2:
              self.status = 2
              self.error = !0
              break
            case 3:
              self.status = 3
              self.error = !0
              self.link = '/v/rain_courseware/download/' + data.id
              break
            case 4:
              self.status = 4
              data && (self.vData = data)
              self.link = '/v/rain_courseware/download/' + data.id
              self.error = !0
              break
          }
        })
      },
      toRight: function () {
        this.error = !1
      },
      continueVer: function () {
        this.error = this.vSuccess = this.error = !1
        this.code1 = this.code2 = this.code3 = this.code4 = this.code = ''
        this.goVeri = !0
      },
      paste: function (e, i) {
        this.clip(e, i)
      },
      clip: function (e, index) {
        var cbd = e.clipboardData
        var ua = window.navigator.userAgent
        let self = this
        // 如果是 Safari 直接 return
        if (!(e.clipboardData && e.clipboardData.items)) {
          return
        }

        // Mac平台下Chrome49版本以下 复制Finder中的文件的Bug Hack掉
        if (cbd.items && cbd.items.length === 2 && cbd.items[0].kind === 'string' && cbd.items[1].kind === 'file' &&
          cbd.types && cbd.types.length === 2 && cbd.types[0] === 'text/plain' && cbd.types[1] === 'Files' &&
          ua.match(/Macintosh/i) && Number(ua.match(/Chrome\/(\d{2})/i)[1]) < 49) {
          return
        }
        for (var i = 0; i < cbd.items.length; i++) {
          var item = cbd.items[i]
          if (item.kind === 'string') {
            item.getAsString(function (str) {
              str = str.replace(/-/g, '')
              let j = 0
              while (index < 5) {
                let text = str.substring(j * 5, (j + 1) * 5)
                text && (self['code' + index] = text)
                j++
                index++
              }
            })
          }
        }
      },
      getUser: function () {
        let self = this
        request.get(API.market.user_info).then(function (e) {
          let data = e.data
          self.user = {
            name: data.user_profile.name,
            avatar: data.user_profile.avatar_96
          }
        })
      }
    },
    directives: {
      mouseInput: {
        inserted: function (e) {
          $(e).on('focus', function () {
            let $this = $(this)
            $this.removeClass('had').removeClass('error')
            $this.addClass('active')
          })
          $(e).on('blur', function () {
            let $this = $(this)
            let $val = $this.val()
            $this.removeClass('active')
            if ($val) {
              $this.addClass('had')
            } else {
              // $this.addClass('had')
            }
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
    .user{
      border-bottom: 1px solid #eee;
      padding-left: 168px;
      margin-top: 50px;
      padding-bottom: 10px;
      img,div{
        vertical-align: bottom;
      }
      img{
        width: 80px;
        height: 80px;
        border: 1px solid #979797;
        margin-right: 20px;
      }
    }
    .verify-con {
      background-color: #fff;
      height: 576px;
      padding-top: 90px;
      .insert {
        .info {
          width: 120px;
          position: relative;
          span {
            position: absolute;
            width: 100%;
            left: 0;
            top: -30px;
            border: none;
            margin: 0;
            padding: 0;
          }
        }
        input {
          border: 1px solid #c8c8c8;
          width: 120px;
          height: 60px;
        }
        span {
          width: 20px;
          border-bottom: 1px solid #c8c8c8;
          margin: 30px 10px;
        }
        input.active {
          border: #639EF4 solid 1px;
        }
        input.had {
          border: none;
          background-color: #f8f8f8;
        }
        input.error {
          border: 1px solid #F84F41;
        }
      }
      .err-con {
        height: 30px;
        .error-info {
          color: #F84F41;
          width: 420px;
          margin-left: 234px;
          margin-top: 20px;
        }
      }
      .activate {
        width: 124px;
        height: 38px;
        background-color: #fff;
        border: 1px solid #639EF4;
        border-radius: 19px;
        margin-top: 30px;
      }
    }
    .verify-success {
      background-color: #fff;
      padding-top: 40px;
      .font48 {
        height: 100px;
        line-height: 100px;
        margin-bottom: 30px;
        i {
          font-size: 100px;
          margin-right: 30px;
        }
        span {
          height: 100%;
        }
      }
    }
    .continue {
      height: 38px;
      width: 124px;
      border: 1px solid #639EF4;
      border-radius: 19px;
      line-height: 38px;
      margin: 40px 0;
      background-color: #fff;
    }
    .im {
      position: absolute;
      bottom: 60px;
      right: -70px;
      font-size: 38px;
      width: 54px;
      border: 1px solid #639EF4;
      .img {
        position: absolute;
        width: 140px;
        top: -180px;
        left: -40px;
        padding: 10px;
        background-color: #fff;
        border: 1px solid #c8c8c8;
        img {
          width: 100%;
        }
      }
    }
  }
</style>

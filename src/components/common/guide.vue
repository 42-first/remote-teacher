/*
 * @page：接收器引导页
 * @author: chenzhou
 * @update: 2018.03.01
 * @desc 用户第一次进入雨课堂接收器引导使用
 *       一共5步 1、欢迎 2、完善信息 3、投稿弹幕 4、PPT提示 5、操作提示
 *
 */


<template>
  <!-- 引导 -->
  <div class="guide__wrap" aria-cmp="guide">
    <!-- 第一步 欢迎页 -->
    <section class="guide__step1" v-show="step===1">
      <div class="guide__banner ">
        <img class="banner" src="http://sfe.ykt.io/o_1c7gia6u4d8d1q801u071b1i1feb9.png">
        <h3 class="step1__title">欢迎来到雨课堂</h3>
        <div class="step1__intro">这是一个可以用手机直接参与互动的<br>智慧课堂</div>
      </div>

      <!-- content -->
      <div class="step1__text">
        <p>你已加入 <span>***老师</span> 的课堂</p>
        <p>准备开始上课吧</p>
      </div>

      <!-- btn -->
      <p class="step1--go" @click="handlego">走起</p>
    </section>

    <!-- 第二步 信息完善 -->
    <!-- 第三步 投稿弹幕 -->
    <section class="guide__step3" v-show="step===3">
      <div class="step3__more">
        <div class="more__actions">
          <p class="action f17">
            <i class="iconfont icon-ykq_tab_danmu f25"></i>
            <span>{{ $t('sendbullet') }}</span>
          </p>
          <p class="action f17">
            <i class="iconfont icon-ykq_tab_tougao f25"></i>
            <span>{{ $t('sendpost') }}</span>
          </p>
        </div>
      </div>

      <!-- content -->
      <div class="step3__arrow">
        <img class="arrow__img" src="http://sfe.ykt.io/o_1c7ijl41pqvehgse841h3vo34e.png">
        <h3 class="arrow__title">这里可以发弹幕和投稿</h3>
      </div>

      <!-- btn -->
      <p class="step3--go" @click="handlegoStep3">知道了</p>
    </section>

    <!-- 第四步 ppt引导 -->
    <section class="guide__step4" v-show="step===4">
      <div class="step3__more">
        <div class="more__actions">
          <p class="action f17">
            <i class="iconfont icon-ykq_tab_danmu f25"></i>
            <span>{{ $t('sendbullet') }}</span>
          </p>
          <p class="action f17">
            <i class="iconfont icon-ykq_tab_tougao f25"></i>
            <span>{{ $t('sendpost') }}</span>
          </p>
        </div>
      </div>

      <!-- content -->
      <div class="step3__arrow">
        <img class="arrow__img" src="http://sfe.ykt.io/o_1c7ijl41pqvehgse841h3vo34e.png">
        <h3 class="arrow__title">这里可以发弹幕和投稿</h3>
      </div>

      <!-- btn -->
      <p class="step3--go" @click="handlegoStep3">知道了</p>
    </section>
  </div>
</template>
<style lang="scss">
  .guide__wrap {
    z-index: 2;
    position: fixed;
    top: 0;
    left: 0;

    width: 100%;
    height: 100%;

    background: rgba(0, 0, 0, 0.7);
  }



  /*-------------------*\
    $ 欢迎来到雨课堂
  \*-------------------*/


  .guide__step1 {
    position: absolute;
    top: 50%;
    left: 50%;

    width: 8.933333rem;
    height: 11.866667rem;
    transform: translate(-50%, -50%);

    background: #fff;
    border-radius: 0.16rem;

    .guide__banner {
      position: relative;
      // height: 3.2rem;
      padding: 0.173333rem;

      font-size: 0.64rem;
      color: #333;
      border-radius: 0.16rem 0.16rem 0 0;

      .banner {
        display: block;
        margin: 0 auto;
        width: 7.933333rem;
        height: 3.04rem;
      }

      .step1__title {
        position: absolute;
        top: 1.746667rem;
        left: 0;
        right: 0;
        text-align: center;
      }

      .step1__intro {
        padding: 0.56rem 0;
        font-size: 0.4rem;
        color: #666;
      }
    }

    .step1__text {
      padding: 1.106667rem 0 1.733333rem;
      font-size: 0.48rem;
      color: #333;
      text-align: center;
    }

    .step1--go {
      margin: 0 auto 0.4rem;
      width: 5.333333rem;
      height: 1.173333rem;
      line-height: 1.173333rem;
      font-size: 0.48rem;
      color: #fff;
      text-align: center;
      background: #5096F5;
      border-radius: 0.533333rem/50%;
      box-shadow: 0 0.106667rem 0.186667rem rgba(80, 150, 245, 0.4);
    }

  }



  /*-------------------*\
    $ 投稿弹幕介绍
  \*-------------------*/


  .guide__step3 {
    position: relative;
    height: 100%;

    .step3__more {
      position: absolute;
      top: 0;
      right: 0;
      width: 4.666667rem;
      height: 5.266667rem;

      background-image: url(http://sfe.ykt.io/o_1c7ij49f756rnam1asj1es714779.png);
      background-size: cover;
      background-repeat: no-repeat;
      background-position: center center;

      .more__actions {
        position: absolute;
        bottom: 0.733333rem;
        left: 0;
        right: 0;
        color: #fff;

        .iconfont {
          padding-right: 0.266667rem;
          font-weight: bolder;
        }

        .action {
          display: flex;
          justify-content: center;
          align-items: center;

          padding-top: 0.266667rem;
        }
      }
    }

    .step3__arrow {
      position: relative;
      top: 5.933333rem;
      font-size: 0.64rem;
      font-weight: bold;
      color: #fff;

      .arrow__img {
        position: absolute;
        top: 0;
        width: 1.56rem;
        height: 2.573333rem;
        right: 2.253333rem;
      }

      .arrow__title {
        padding-top: 3.2rem;
        padding-left: 1.333333rem;
      }
    }

    .step3--go {
      position: absolute;
      bottom: 1.733333rem;
      left: 0;
      right: 0;
      margin: auto;
      width: 3.293333rem;
      height: 1.373333rem;
      line-height: 1.2rem;

      text-align: center;
      font-size: 0.48rem;
      font-weight: bolder;
      color: #333;

      background-image: url(http://sfe.ykt.io/o_1c7il47hqna51cta14facr6bv9.png);
      background-size: cover;
      background-repeat: no-repeat;
      background-position: center center;
    }

  }





  /*-------------------*\
    $ 投稿弹幕介绍
  \*-------------------*/

  /*-------------------*\
    $ 投稿弹幕介绍
  \*-------------------*/







</style>
<script>

  export default {
    props: {
      showGuide: {
        type: Boolean,
        default: false
      },
      step: {
        type: String,
        default: 1
      },
      refresh: {
        type: Function
      }
    },
    data() {
      return {
        miniprogram: false,
        // 是否可以提交
        cansubmit: false
      }
    },
    watch: {
      'step'(newVal, oldVal) {
        newVal && this.stepChange(newVal);
      }
    },
    methods: {
      /**
       * @method 提示步骤切换
       * @param
       */
      stepChange(step) {
      },


      /**
       * @method 走起
       * @param
       */
      handlego(evt) {
        this.step = 3;

        this.stepChange(this.step);
      },

      /**
       * @method step2 go
       * @param
       */
      handlegoStep3(evt) {
        this.step = 4;

        this.stepChange(this.step);
      },

      /**
       * @method 提交个人信息
       * @param
       */
      handleconfirm(evt) {
        let URL = '/course_meta/simple_user_info';
        let params = {
          'name': this.name,
          'school': this.school,
          'role': this.role,
          'school_number': this.school_number
        };

        if(this.cansubmit) {
          this.cansubmit = false;

          request.post(URL, params)
          .then((res) => {
            if(res.success) {
              if(typeof this.refresh === 'function') {
                this.refresh();
              } else {
                location.reload();
              }
            }
          });
        }
      }
    },
    created() {
      let self = this;
      this.getUser();
    }
  }
</script>

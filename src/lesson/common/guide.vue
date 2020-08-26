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
  <div class="guide__wrap" aria-cmp="guide" v-show="show">
    <!-- 第一步 欢迎页 -->
    <section class="guide__step1" v-show="step===1">
      <div class="guide__banner ">
        <img class="banner" src="https://qn-sfe.yuketang.cn/o_1c7gia6u4d8d1q801u071b1i1feb9.png">
        <h3 class="step1__title"><!-- 欢迎来到雨课堂 -->{{ $t('guide.welcome') }}</h3>
        <div class="step1__intro" v-html="$t('guide.welcomeintro')">这是一个可以用手机直接参与互动的<br>智慧课堂</div>
      </div>

      <!-- content -->
      <div class="step1__text">
        <p v-html="$t('guide.joinclass', { name: name })"><!-- 你已加入 <span>***老师</span> 的课堂 --></p>
        <p><!-- 准备开始上课吧 -->{{ $t('guide.ready') }}</p>
      </div>

      <!-- btn -->
      <p class="step1--go" @click="handlego"><!-- 走起 -->{{ $t('guide.go') }}</p>
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
        <img class="arrow__img" src="https://qn-sfe.yuketang.cn/o_1c7ijl41pqvehgse841h3vo34e.png">
        <h3 class="arrow__title"><!-- 这里可以发弹幕和投稿 -->{{ $t('guide.howsenddanmu') }}</h3>
      </div>

      <!-- btn -->
      <p class="step3--go" @click="handlegoStep3"><!-- 知道了 -->{{ $t('guide.iknown') }}</p>
    </section>

    <!-- 第四步 ppt引导 -->
    <section class="guide__step4" v-show="step===4">
      <h3 class="step4__title" v-html="$t('guide.pptgood')">课上不用拍PPT啦，课下也能<br>随时查看！</h3>

      <!-- ppt -->
      <div class="step4__ppt">
        <section class="ppt__area">
          <div class="ppt__wrap">
            <img class="ppt__cover" :src="cover">
            <div class="ppt__footer">
              <p class="ppt__time f16"><!-- 5分钟前 -->{{ $t('guide.minunts5') }}</p>
              <div class="ppt__opt f15">
                <p class="ppt--action" >{{ $t('unknown') }}</p>
                <p class="ppt--action selected">{{ $t('favorite') }}</p>
              </div>
            </div>
          </div>
        </section>
      </div>

      <!-- btn -->
      <p class="step--go" @click="handlegoStep4"><!-- 知道了 -->{{ $t('guide.iknown') }}</p>
    </section>

    <!-- 第五步 操作引导 -->
    <section class="guide__step5" v-show="step===5">
      <!-- 操作 -->
      <div class="step5__intro">
        <h3 class="intro__title"><!-- 可以点击不懂或收藏进行标注 -->{{ $t('guide.howmarkppt') }}</h3>
        <div class="intro__desc" v-html="$t('guide.unknownanonymous')">不懂是匿名发送给老师的噢<br>收藏仅自己可见</div>
        <img class="intro__arrow" src="https://qn-sfe.yuketang.cn/o_1c7iqttup2j31t8g1o8k13no1r929.png">
        <div class="ppt__opt f15">
          <div class="opt__wrap">
            <p class="ppt--action" >{{ $t('unknown') }}</p>
            <p class="ppt--action selected">{{ $t('favorite') }}</p>
          </div>
        </div>
      </div>

      <!-- btn -->
      <p class="step--go" @click="handlegoStep5"><!-- 好的 -->{{ $t('guide.ok') }}</p>
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

    background: rgba(0, 0, 0, 0.8);
  }

  .step--go {
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

    background-image: url(https://qn-sfe.yuketang.cn/o_1c7il47hqna51cta14facr6bv9.png);
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center center;
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

      background-image: url(https://qn-sfe.yuketang.cn/o_1c7ij49f756rnam1asj1es714779.png);
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

      background-image: url(https://qn-sfe.yuketang.cn/o_1c7il47hqna51cta14facr6bv9.png);
      background-size: cover;
      background-repeat: no-repeat;
      background-position: center center;
    }

  }



  /*-------------------*\
    $ ppt引导
  \*-------------------*/


  .guide__step4 {
    .step4__title {
      display: flex;
      justify-content: center;
      align-items: center;

      width: 100%;
      height: 2.866667rem;
      font-size: 0.64rem;
      color: #fff;
    }

    .ppt__area {
      padding: 0.2rem 0;
      border-top: 0.04rem dashed #fff;
      border-bottom: 0.04rem dashed #fff;
    }

    .ppt__wrap {
      margin: 0 auto;
      padding: 0.453333rem;
      // width: 9.093333rem;
      background: #fff;

      .ppt__cover {
        display: block;
        width: 100%;
        min-height: 6rem;
      }

      .ppt__footer {
        display: flex;
        align-items: center;
        justify-content: space-between;

        .ppt__opt {
          display: flex;
          align-items: center;
          justify-content: space-between;

          .ppt--action {
            margin-left: 0.266667rem;
            display: inline-block;
            padding: 0 0.266667rem;
            height: 0.666667rem;
            line-height: 0.666667rem;

            color: #639EF4;
            border: 1px solid #639EF4;
            border-radius: 0.333333rem/50%;
          }

          .selected {
            color: #fff;
            background: #639EF4;
          }
        }
      }

    }
  }



  /*-------------------*\
    $ 投稿弹幕介绍
  \*-------------------*/


  .guide__step5 {

    .step5__intro {
      position: absolute;
      top: 45%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 100%;

      padding-left: 0.84rem;
      color: #fff;
      text-align: left;
    }

    .intro__title {
      padding-bottom: 1.2rem;
      font-size: 0.64rem;
      font-weight: bold;
    }

    .intro__desc {
      font-size: 0.48rem;
    }

    .intro__arrow {
      width: 3.586667rem;
      height: 3.386667rem;
      padding: 0.133333rem 0 0 0.666667rem;
    }

    .ppt__opt {
      position: absolute;
      bottom: -0.533333rem;
      right: 0.133333rem;

      width: 4.466667rem;
      height: 1.586667rem;

      padding: 0.093333rem;

      border-radius: 0.106667rem;
      border: 0.04rem dashed #fff;

      .opt__wrap {
        display: flex;
        align-items: center;
        justify-content: space-around;

        height: 100%;
        background: #fff;
        border-radius: 0.106667rem;
      }

      .ppt--action {
        margin-left: 0.266667rem;
        display: inline-block;
        padding: 0 0.266667rem;
        height: 0.666667rem;
        line-height: 0.666667rem;
        min-width: 1.6rem;
        text-align: center;

        color: #639EF4;
        border: 1px solid #639EF4;
        border-radius: 0.333333rem/50%;
      }

      .selected {
        color: #fff;
        background: #639EF4;
      }

    }
  }




</style>
<script>

  export default {
    props: {
      cover: {
        type: String,
        default: ''
      },
      step: {
        type: String,
        default: 1
      },
      name: {
        type: String,
        default: ''
      },
      hideGuide: {
        type: Function
      }
    },
    data() {
      return {
        show: true
      }
    },
    watch: {
      'step'(newVal, oldVal) {
        newVal > oldVal && this.stepChange(newVal);
      },
      'cover'(newVal, oldVal) {
        newVal && this.stepChange(this.step);
      }
    },
    methods: {
      /**
       * @method 提示步骤切换
       * @param
       */
      stepChange(step) {
        if(step === 2) {
          this.show = false;
        } else if(step === 4) {
          if(this.cover) {
            this.show = true;
          }
        } else {
          this.show = true;
        }
      },

      /**
       * @method 走起
       * @param
       */
      handlego(evt) {
        this.step = 2;

        // 显示完善信息
        this.$parent.showInfo = 2;
      },

      /**
       * @method step3 go
       * @param
       */
      handlegoStep3(evt) {
        // 当存在图片的时候才显示下一引导页
        if(!this.cover){
          this.show = false;
        }

        this.step = 4;
        this.$parent.step = 4;
      },

      /**
       * @method step4 go
       * @param
       */
      handlegoStep4(evt) {
        this.step = 5;
      },

      /**
       * @method 完成
       * @param
       */
      handlegoStep5(evt) {
        if(typeof this.hideGuide === 'function') {
          this.hideGuide();
        }
      }
    },
    created() {
      let self = this;
    }
  }
</script>

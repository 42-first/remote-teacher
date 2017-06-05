/*
 * @page：学生接收器页红包组件
 * @author: chenzhou
 * @update: 2017.5.27
 * @desc 课堂ppt接收，课堂习题，课堂试卷，课堂红包和老师遥控器实时通信等
 *
 */

<template>
  <section class="page-hongbao">
    <div class="hongbao-wrapper">
      <!-- 红包头部信息 -->
      <section class="hongbao__header">
        <div class="hongbao__banner">
          <p class="hongbao__title f25">你收到一个课堂红包</p>
          <p class="hongbao__close" @click="handleBack"><i class="iconfont icon-wrong f25"></i></p>
        </div>
        <!-- 头像 -->
        <div :class="['hongbao__user', isMine ? '' : 'mb100']" >
          <img class="user-avatar" src="http://wx.qlogo.cn/mmopen/Q3auHgzwzM6qXaOqwUEg80MB7fL3frUJsMtQeMNkmNyy5pTNFzPIPgULia5q9eVyLI3c2rXw2KBic6SCZ0PVCu8Q/46" >
          <p class="user-name f15"><span class="teacher_name">姓名</span>的课堂红包</p>
        </div>
      </section>

      <!-- 我的红包 -->
      <section class="hongbao__mine" v-if="isMine">
        <p class="hongbao__mine--praise f25">好样的～，再接再厉</p>
        <p class="hongbao__mine--money f40">￥ 5.00</p>
        <P class="hongbao__mine--bank f15">已存入<a class="link" href="/v/index/bank">我的小金库</a></P>
      </section>

      <!-- 红包列表 -->
      <section class="hongbao__list-wrapper">
        <div class="hongbao--count f18">已领 5/9 个红包</div>
        <ul class="">
          <li class="hongbao-item">
            <div class="rank hex"><p class="rank-order">1</p></div>
            <div class="avatar">
              <img src="http://wx.qlogo.cn/mmopen/Q3auHgzwzM6qXaOqwUEg80MB7fL3frUJsMtQeMNkmNyy5pTNFzPIPgULia5q9eVyLI3c2rXw2KBic6SCZ0PVCu8Q/46" />
            </div>
            <div class="hongbao-item--content">
              <div class="name-tiem">
                <p class="name f18">小明</p>
                <p class="time f15">13:30</p>
              </div>
              <p class="f21">￥ 5.00</p>
            </div>
          </li>

           <li class="hongbao-item">
            <div class="rank hex"><p class="rank-order">1</p></div>
            <div class="avatar">
              <img src="http://wx.qlogo.cn/mmopen/Q3auHgzwzM6qXaOqwUEg80MB7fL3frUJsMtQeMNkmNyy5pTNFzPIPgULia5q9eVyLI3c2rXw2KBic6SCZ0PVCu8Q/46" />
            </div>
            <div class="hongbao-item--content">
              <div class="name-tiem">
                <p class="name f18">小明</p>
                <p class="time f15">13:30</p>
              </div>
              <p class="f21">￥ 5.00</p>
            </div>
          </li>

           <li class="hongbao-item">
            <div class="rank hex"><p class="rank-order">1</p></div>
            <div class="avatar">
              <img src="http://wx.qlogo.cn/mmopen/Q3auHgzwzM6qXaOqwUEg80MB7fL3frUJsMtQeMNkmNyy5pTNFzPIPgULia5q9eVyLI3c2rXw2KBic6SCZ0PVCu8Q/46" />
            </div>
            <div class="hongbao-item--content">
              <div class="name-tiem">
                <p class="name f18">小明</p>
                <p class="time f15">13:30</p>
              </div>
              <p class="f21">￥ 5.00</p>
            </div>
          </li>

           <li class="hongbao-item">
            <div class="rank hex"><p class="rank-order">1</p></div>
            <div class="avatar">
              <img src="http://wx.qlogo.cn/mmopen/Q3auHgzwzM6qXaOqwUEg80MB7fL3frUJsMtQeMNkmNyy5pTNFzPIPgULia5q9eVyLI3c2rXw2KBic6SCZ0PVCu8Q/46" />
            </div>
            <div class="hongbao-item--content">
              <div class="name-tiem">
                <p class="name f18">小明</p>
                <p class="time f15">13:30</p>
              </div>
              <p class="f21">￥ 5.00</p>
            </div>
          </li>
        </ul>
      </section>


    </div>

  </section>
</template>
<script>
  export default {
    name: 'hongbao-page',
    data() {
      return {
        index: 0,
        isMine: false
      };
    },
    beforeRouteEnter (to, from, next) {
      // 在渲染该组件的对应路由被 confirm 前调用
      // 不！能！获取组件实例 `this`
      // 因为当钩子执行前，组件实例还没被创建

      if(from.name === 'student-presentation-page') {
         next();
      } else {
        next(vm => {
          history.back()
          // vm.router.go(-1)
        })
      }
    },
    components: {
    },
    computed: {
    },
    watch: {
    },
    filters: {
    },
    mixins: [],
    methods: {
      handleBack() {
        this.$router.back();
      }
    },
    created() {
      this.index = +this.$route.params.index;
      let cards = this.$parent.cards;

      let data = cards[this.index];
    },
    mounted() {

    },
    beforeDestroy() {
    }
  };
</script>

<style lang="scss">

  /*------------------*\
    $ 红包详情页
  \*------------------*/

  .hongbao-wrapper {
  }

  .page-hongbao {
    z-index: 2;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;

    background: #fff;

    overflow-y: scroll;
    -webkit-overflow-scrolling: touch;
  }

  .hongbao__header {
    position: relative;
    width: 100%;

    color: #FFE595;

    .hongbao__banner {
      position: relative;
      height: 4.0rem;

      color: #FFE595;
      background-image: url('http://sfe.ykt.io/o_1bhriotgh176ansqjom1kelmdfe.png');
    }

    .hongbao__title {
      padding-top: 0.866667rem;
    }

    .hongbao__close {
      position: absolute;
      top: 0;
      right: 0;

      width: 1.333333rem;
      height: 1.333333rem;

      color: #4a4a4a;
      background-color: #FFE595;

      border-radius:0 0 0 100%;

      .iconfont {
        margin-right: -0.2rem;
      }
    }

  }

  .hongbao__user {
    position: relative;

    color: #4A4A4A;

    .user-avatar {
      margin: -1.066667rem auto 0;

      display: block;
      width: 2.4rem;
      height: 2.4rem;
      border: 4px solid #fff;
      box-shadow: 0 0 6px rgba(0,0,0,0.2);
      border-radius: 50%;
    }

    .user-name {
      padding: 0.24rem 0;
    }
  }

  .mb100 {
    margin-bottom: 1.333333rem;
  }



  /*------------------*\
    $ 红包我的
  \*------------------*/


  .hongbao__mine {
    padding-bottom: 1.333333rem;

    .hongbao__mine--praise {
      padding-bottom: 0.533333rem;
      color: #DCBC83;
    }

    .hongbao__mine--money {
      color: #4a4a4a;
    }

    .hongbao__mine--bank {
      color: #C8C8C8;
      a {
        color: #639EF4;
      }
    }
  }


  /*------------------*\
    $ 红包列表
  \*------------------*/

  .hongbao__list-wrapper {
    padding: 0 0.453333rem;
    .hongbao--count {
      padding-bottom: 28px;

      text-align: left;
      color: #9B9B9B;

      border-bottom: 1px solid #979797;
    }

    .hongbao-item {
      display: flex;
      align-items: center;
      justify-content: center;

      padding: 0.4rem 0 0;

      .rank {
        position: relative;
        width: 0.573333rem;
        margin-right: 0.266667rem;
        margin-bottom: 0.2rem;

        .rank-order {
          z-index: 1;
          position: absolute;
          top: -0.12rem;
          left: 0;
          width: 100%;

          color: #fff;
        }
      }

      .avatar {
        margin-bottom: 0.2rem;
        width: 1.2rem;
        img {
          display: block;
          width: 0.986667rem;
          height: 0.986667rem;
          border-radius: 50px;
        }
      }

      .hongbao-item--content {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding-bottom: 0.293333rem;

        border-bottom: 1px solid rgba(151, 151, 151, 0.5);

        .name-tiem {
          padding-left: 0.133333rem;
        }
        .time {
          color: #9B9B9B;
        }
      }
    }
  }

  .hex {
    box-sizing: border-box;
    position: relative;
    width: 0.56rem;
    height: 0.28rem;
    background-color: #FFAE00;
    position: relative;
    text-align:center;
    border-left: 1px solid #fff;
    border-right: 1px solid #fff;
  }

  .hex::before,
  .hex::after {
    content: "";
    box-sizing: border-box;
    display: block;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: inherit;
    overflow: hidden;
    backface-visibility: hidden;
  }

  .hex::before {
    transform: rotate(60deg);
  }

  .hex::after {
    transform: rotate(-60deg);
  }

</style>





















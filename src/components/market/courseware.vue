<template>
  <section class="courseware__page">
    <!-- 雨课件 banner -->
    <section class="banner__wrap">
      <img class="banner--img" src="http://sfe.ykt.io/o_1d0tmhi961p0n13q91bg81336e19.png" alt="雨课堂,雨课件" />
    </section>
    <!-- 雨课件列表 -->
    <section class="courseware__info">
      <header class="courseware__header" >
        <h3 class="font24">雨课件市场</h3>
        <div class="actions font16">
          <button class="action" type="" @click="goLogin('verification')" >激活</button>
          <button class="action active" type="" @click="goLogin('index')" >我的雨课件</button>
        </div>
      </header>
      <ul class="courseware__list">
        <li class="item__wrap" v-for="item in list" >
          <article class="card__item">
            <section class="cover__wrap">
              <img class="card--cover" :src="item.cover" :alt="item.title" >
            </section>
            <section class="card__text">
              <h4 class="card--title font16 color3">{{item.title}}</h4>
              <p class="card__desc font12 ">
                <span>{{ item.school }}</span>
                <span>{{ item.author }}</span>
              </p>
            </section>
            <section class="card__buy text-center">
              <div class="front">
                <p class="card--price font24">¥ {{item.discount_price|formatPrice}}</p>
                <p class="card--price2 font12">¥ {{item.price|formatPrice}}</p>
              </div>
              <div class="back">
                <a class="buy-btn font14" :href="item.buy_link">立即购买</a>
                <a class="font12 color63" :href="item.example_link">免费下载样章</a>
              </div>
            </section>
          </article>

        </li>
        <!-- 联系介绍 -->
        <li class="item__wrap">
          <article class="card__item item__intro">
            <section class="font14 ">
              <p>雨课堂非常希望熟练使用雨课堂、在各学科领域具有丰富教学经验的老师出品自己的雨课件，以共建共享更加完善的教学方案体系</p>
              <p>请联系客服获取更多相关信息。</p>
            </section>
            <section class="logo__wrap" >
              <div class="logo--line" ></div>
              <i class="logo iconfont icon-logo-book"></i>
            </section>
            <section class="text-center font16">
              <p class="">客服邮箱：</p>
              <p class="blue">yuketang@xuetangx.com</p>
            </section>
          </article>
        </li>
      </ul>
    </section>
  </section>
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
    filters: {
      formatPrice(price) {
        if(price) {
          return parseFloat(price).toFixed(2)
        } else {
          return '0.00'
        }
      }
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
<style lang="scss">
  @import "~@/style/base.css";
  @import "~@/style/market/common";

  button {
    border: none;
    border-color: transparent;
    background-color: transparent;
  }

  .courseware__page {
    min-height: calc(100vh - 180px);
    padding-top: 74px;
    background-color: #F5F5F5;
  }

  .banner__wrap {
    display: flex;
    justify-content: center;
    align-items: center;

    height: 396px;
    background: #fff;
  }

  .courseware__info {
    margin: 0 auto;
    padding: 40px 0;
    width: 960px;
  }

  .courseware__header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    padding-bottom: 8px;
    border-bottom: 1px solid #D8D8D8;
  }

  .action {
    margin-left: 15px;
    padding: 5px 30px;
    color: #639EF4;
    font-size: 16px;

    cursor: pointer;

    border: 1px solid #639EF4;
    border-radius: 18px/50%;
  }

  .action.active {
    color: #fff;
    background: #639EF4;
  }




  .courseware__list {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    flex-wrap: wrap;

    width: 100%;
  }

  .item__wrap {
    display: flex;
    justify-content: center;
    align-items: center;

    padding: 20px 0 10px;
    width: 33.33%;
  }

  .card__item {
    width: 300px;
    height: 320px;

    background: #fff;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    border-radius: 2px;
  }

  .item__intro {
    box-sizing: border-box;
    padding: 30px 24px;
    color: #9b9b9b;
    background: #F5F5F5;
    box-shadow: none;
    border: 1px solid #D8D8D8;
    box-shadow: 0 0 -20px rgba(0,0,0,0.5);
  }

  .cover__wrap {
    width: 100%;
    height: 168px;
    overflow: hidden;
  }

  .card--cover {
   display: block;
    width: 100%;
    border-radius: 2px 2px 0 0;
  }

  .card__text {
    padding: 10px 20px;
  }

  .card--title {
    padding-bottom: 5px;
    color: #000;
  }

  .card__desc {
    color: #aaa;
  }

  .card__buy {
    position: relative;
    padding: 5px 0;
    height: 90px;

    cursor: pointer;

    perspective: 1000px;
    transform-style: preserve-3d;
    transition: all 300ms;
  }

  .card__item:hover .card__buy {
     transform: rotateX(180deg);
  }

  .card--price {
    color: #F84F41;
    font-weight: bold;
  }

  .card--price2 {
    text-decoration: line-through;
  }

  .front,
  .back {
    position: absolute;
    width: 100%;
    height: 100%;

    backface-visibility: hidden;
  }

  .back {
    transform: rotateX(180deg);

    a {
      display: block;
    }
  }

  .buy-btn {
    margin: 15px auto 5px;
    width: 150px;
    height: 32px;
    line-height: 32px;
    text-align: center;
    color: #fff;
    background: #F84F41;
    border-radius: 16px/50%;
  }


  .logo__wrap {
    position: relative;
    padding: 50px 0 35px;
    text-align: center;

    .logo--line {
      margin: 0 auto;
      padding-top: 15px;
      width: 212px;
      border-bottom: 1px solid #D8D8D8;
    }

    .logo {
      position: absolute;
      top: 40px;
      left: 50%;
      transform: translateX(-50%);

      padding: 0 20px;
      background: #F5F5F5;
    }
    .iconfont {
      font-size: 34px;
      color: #c8c8c8;
    }
  }

</style>

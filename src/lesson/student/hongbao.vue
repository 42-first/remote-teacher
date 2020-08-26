/*
 * @page：学生接收器页红包组件
 * @author: chenzhou
 * @update: 2017.5.27
 * @desc 课堂ppt接收，课堂习题，课堂试卷，课堂红包和老师遥控器实时通信等
 *
 */

<template>
  <section class="page-hongbao">
    <div :class="['hongbao-wrapper', 'animated', opacity ? 'zoomIn': '']">
      <!-- 红包头部信息 -->
      <section class="hongbao__header">
        <div class="hongbao__banner">
          <p class="hongbao__title f18">{{ title }}</p>
        </div>
        <!-- 头像 -->
        <div :class="['hongbao__user', mine ? '' : 'mb100']">
          <img class="user-avatar" :src="teacher&&teacher.avatar_96" :alt="teacher&&teacher.name" >
          <p class="user-name f14" v-html="$t('whosebonus', {name: teacher&&teacher.name})"></p>
        </div>
      </section>

      <!-- 我的红包 -->
      <section class="hongbao__mine" v-if="mine">
        <p class="hongbao__mine--praise f14">{{ mine.praise }}</p>
        <p class="hongbao__mine--money f20">￥<span class="f50">{{ (mine.earning/100).toFixed(2) }}</span></p>
        <P class="hongbao__mine--bank f15"><a class="link" href="/v/index/bank"><!-- 已存入我的钱包 -->{{ $t('savedinpacket') }}</a></P>
      </section>

      <!-- 红包列表 -->
      <section class="hongbao__list-wrapper" v-if="hongbaoList&&summary">
        <div class="hongbao--count f18">{{ $t('numopenedbonus', { count: hongbaoList&&hongbaoList.length, total: summary && summary.count }) }}</div>
        <ul class="hongbao__list">

          <li class="hongbao-item" v-for="(item, index) in hongbaoList">
            <div class="avatar">
              <img :src="item.profile.avatar" :alt="item.profile.name" />
              <div :class="['rank', index < 3 ? 'hex': '', 'hex' + index ]"><p class="rank-order" v-if="index<3">{{ index + 1 }}</p></div>
            </div>
            <div class="hongbao-item--content">
              <div class="name-time">
                <p class="name f14">{{ item.profile.name }}</p>
                <p class="time f12">{{ item.time|formatTime }}</p>
              </div>
              <p class="f14">￥ {{ (item.amount/100).toFixed(2) }}</p>
            </div>
          </li>

        </ul>
      </section>


    </div>

  </section>
</template>
<script>
  import API from '@/util/api'

  export default {
    name: 'hongbao',
    data() {
      return {
        index: 0,
        opacity: 0,
        title: this.$i18n.t('classbonus') || '课堂红包',
        summary: null,
        mine: null,
        teacher: null,
        hongbaoList: null,
        userID: null
      };
    },
    beforeRouteEnter (to, from, next) {
      // 在渲染该组件的对应路由被 confirm 前调用
      // 不！能！获取组件实例 `this`
      // 因为当钩子执行前，组件实例还没被创建

      if(from.name === 'student-presentation') {
         next();
      } else {
        next(vm => {
          vm.$router.go(-1)
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
      formatTime(time) {
        let dt = new Date(time);
        let sTime = dt.getHours() + ':' + dt.getMinutes() + ':' + dt.getSeconds();

        return typeof moment !== 'undefined' && moment(time).format('HH:mm:ss') || sTime;
      }
    },
    mixins: [],
    methods: {
      /*
      * @method 是否是我的红包
      * @param problemID 问题ID
      */
      formatData(data) {
        // 随机文案
        let titleAry = [
          this.$i18n.t('receiverexcellent') || "答对了！你真棒！",
          this.$i18n.t('receiverthumbsup') || "答对了！赞一个！",
          this.$i18n.t('receiverwonderful') || "答得漂亮~再接再厉~",
          this.$i18n.t('receivergoodforu') || "是的，必须奖励下你！",
          this.$i18n.t('receiverfabulous') || "答题小能手，红包接好~",
          this.$i18n.t('receiverbrilliant') || "答题小能手，我记住你了~",
          this.$i18n.t('receiverawesome') || "机智如你，必须奖励~",
          this.$i18n.t('receiverwelldone') || "聪颖如你，必须奖励~",
          this.$i18n.t('receiversuperb') || "好样的，答得又快又准！",
          this.$i18n.t('receiverbravo') || "真棒！答得又快又准！" ];

        //
        let mine = data.event && data.event.detail.find((item)=>{
          return item.uid === this.userID;
        });

        console.log(mine);
        this.mine = mine;

        if(mine) {
          this.title = this.$i18n.t('receiveclassbonus') || '你收到一个课堂红包';
          mine.praise = titleAry[parseInt(Math.random()*9, 10)];
        }

        setTimeout(()=>{
          this.opacity = 1;
        }, 20)
      },

      /*
      * @method 红包详情
      * @param problemID 问题ID
      */
      getRedEnvelopDetail(redpacketID) {
        let self = this;
        let URL = API.student.GET_RED_ENVELOPE_DETAIL;


        if (process.env.NODE_ENV === 'production') {
          URL = URL + redpacketID;
        }

        return request.get(URL)
          .then(function (res) {
            if(res && res.data) {
              let data = res.data;

              self.teacher = data.issuer.profile;
              self.hongbaoList = data.issued_user_list;

              return data;
            }
          });

      },
      handleBack() {
        this.$router.back();
      }
    },
    created() {
      this.index = +this.$route.params.index;
      let cards = this.$parent.cards;
      this.userID = this.$parent.userID;

      this.summary = cards[this.index];

      if(this.summary) {
        console.log(this.summary);

        this.formatData(this.summary);
        this.getRedEnvelopDetail(this.summary.redpacketID);
      }

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
      // height: 4.0rem;
      height: 2.933333rem;

      color: #FFE595;
      background-image: url('https://qn-sfe.yuketang.cn/o_1bhriotgh176ansqjom1kelmdfe.png');
      background-size: 100% 100%;
    }

    .hongbao__title {
      padding-top: 0.533333rem;
    }

    // .hongbao__close {
    //   position: absolute;
    //   top: 0;
    //   right: 0;

    //   width: 1.333333rem;
    //   height: 1.333333rem;

    //   color: #4a4a4a;
    //   background-color: #FFE595;

    //   border-radius:0 0 0 100%;

    //   .iconfont {
    //     margin-right: -0.2rem;
    //   }
    // }

  }

  .hongbao__user {
    position: relative;

    color: #4A4A4A;

    .user-avatar {
      margin: -0.933333rem auto 0;

      display: block;
      width: 1.866667rem;
      height: 1.866667rem;
      border: 2px solid #FFE595;
      box-shadow: 0 0 6px rgba(0,0,0,0.2);
      border-radius: 50%;
    }

    .user-name {
      padding: 0.186667rem 0;
      color: #333;
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
      padding-bottom: 0.8rem;
      color: #9B9B9B;
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
    // padding: 0 0.453333rem;
    .hongbao--count {
      padding: 0 0.4rem 0.266667rem;

      text-align: left;
      color: #9B9B9B;

      border-bottom: 1px solid #EEEEEE;
    }

    .hongbao__list {
      padding: 0 0.4rem 0.4rem;
    }

    .hongbao-item {
      display: flex;
      align-items: center;
      justify-content: center;

      padding: 0.4rem 0 0;

      .rank {
        position: absolute;
        bottom: -0.276667rem;
        left: 50%;
        transform: translateX(-50%);

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
        position: relative;
        margin-bottom: 0.2rem;
        // width: 1.2rem;
        img {
          display: block;
          width: 1.066667rem;
          height: 1.066667rem;
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

        .name-time {
          padding-left: 0.266667rem;
          text-align: left;
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
    background-color: #FFD24F;
    position: relative;
    text-align:center;
    border-left: 0.013333rem solid #fff;
    border-right: 0.013333rem solid #fff;
  }

  .hex1 {
    background-color: #9B9B9B;
  }

  .hex2 {
    background-color: #D5ADAD;
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
    border-left: 0.013333rem solid #fff;
    border-right: 0.013333rem solid #fff;
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


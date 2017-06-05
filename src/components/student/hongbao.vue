/*
 * @page：学生接收器页红包组件
 * @author: chenzhou
 * @update: 2017.5.27
 * @desc 课堂ppt接收，课堂习题，课堂试卷，课堂红包和老师遥控器实时通信等
 *
 */

<template>
  <section class="page-ppt">
  <div class="popup popup-showHongBao">
  <div class="hb-header">
    <div class="close-box-outer">
      <div class="close-box">
        <div>
          <span class="iconfont icon-wrong"></span>
        </div>
      </div>
    </div>
    <p class="hb-title2">你收到一个课堂红包</p>
  </div>
  <div class="hb-content">
    <p class="headericon teacher_avatar"><img src="http://7xo8b6.com2.z0.glb.qiniucdn.com/FjNek73jH7dFrKinHxsNd9hMXD8k"></p>
    <p class="hb-name"><span class="teacher_name">姓名</span>的课堂红包</p>
    <div class="isMe">
      <p class="hb-title">好样的～，再接再厉</p>
      <p class="hb-money"><span>￥ 5.00</span></p>
      <P class="hb-jinku">已存入<a class="hb-jk external" href="/v/index/bank">我的小金库</a></P>
    </div>
    <div class="hb-count">
      <span>已领0/0个红包</span>
    </div>
    <div class="split"></div>
    <div class="hb-detail">
      <ul>
        <li>
          <div class="sybmol first"></div><div class="headericon-d">
          <img src="http://7xo8b6.com2.z0.glb.qiniucdn.com/FjNek73jH7dFrKinHxsNd9hMXD8k"></div>
          <div class="name-box"><p class="name">小明</p><p class="time">13:30</p></div><div class="money">5.00元</div>
          <div class="clear"></div>
          <div class="split-box">
            <div class="split"></div>
          </div>
        </li>
        <li>
          <div class="sybmol first"></div><div class="headericon-d">
          <img src="http://7xo8b6.com2.z0.glb.qiniucdn.com/FjNek73jH7dFrKinHxsNd9hMXD8k"></div>
          <div class="name-box"><p class="name">小明</p><p class="time">13:30</p></div><div class="money">5.00元</div>
          <div class="clear"></div>
        </li>
      </ul>
    </div>
  </div>
</div>
  </section>
</template>
<script>
  export default {
    name: 'ppt-page',
    props: {
    },
    data() {
      return {
        index: 0
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
        // vm.$router
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
    },
    created() {
      this.index = +this.$route.params.index;
      // this.$router
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
    $ 组件样式重写
  \*------------------*/

  .page-ppt {
    z-index: 2;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;

    background: #fff;
  }


</style>





















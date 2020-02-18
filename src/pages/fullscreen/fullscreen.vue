<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
  export default {
    name: 'student-fullscreen'
  }
</script>

<style>
  @import "~@/style/base.css";

  #app {
    width: 100%;
    height: 100%;

    text-align: center;
  }

  html * {
    box-sizing: border-box;
    text-size-adjust: 100%;
    -webkit-touch-callout: none;
    /* -webkit-user-select: none; */
  }

  .w30 {
    width: 30px;
  }

  .ponter {
    cursor: pointer;
  }

  .f12 {
    font-size: 12px;
  }

  .f14 {
    font-size: 14px;
  }

  .f15 {
    font-size: 15px;
  }

  .f16 {
    font-size: 16px;
  }

  .f17 {
    font-size: 17px;
  }

  .f18 {
    font-size: 18px;
  }

  .f19 {
    font-size: 19px;
  }

  .f20 {
    font-size: 20px;
  }

  .f21 {
    font-size: 21px;
  }

  .f24 {
    font-size: 24px;
  }

  .f25 {
    font-size: 25px;
  }

  .f28 {
    font-size: 28px;
  }

  .f30 {
    font-size: 30px;
  }

  .f32 {
    font-size: 32px;
  }

  .f36 {
    font-size: 36px;
  }

  .f40 {
    font-size: 40px;
  }

  .f45 {
    font-size: 45px;
  }

  .f50 {
    font-size: 50px;
  }

  .f55 {
    font-size: 55px;
  }

  .f60 {
    font-size: 60px;
  }

</style>

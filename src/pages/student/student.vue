<template>
  <div id="app">
    <p>学生遥控器</p>
    <router-view></router-view>
  </div>
</template>

<script>
  export default {
    name: 'student-presentation'
  }
</script>

<style>
  @import "~@/style/font/base.css";

  #app {
    width: 100%;
    height: 100%;

    text-align: center;
  }
</style>

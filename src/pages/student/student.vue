<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
  export default {
    name: 'student-presentation'
  }
</script>

<style>
  @import "~@/style/base.css";

  #app {
    width: 100%;
    height: 100%;

    text-align: center;
  }
</style>

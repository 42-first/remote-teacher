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
  #app {
    width: 100%;
    height: 100%;

    font-family: -apple-system-font,"Helvetica Neue","PingFang SC","Hiragino Sans GB","Microsoft YaHei",sans-serif;
    -webkit-font-smoothing: antialiased;
    text-align: center;
    color: #4A4A4A;
  }
</style>

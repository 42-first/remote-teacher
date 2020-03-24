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
  @import "~@/style/font/iconfont/iconfont.css";
  @import "~@/style/base.css";

  #app {
    width: 100%;
    height: 100%;

    text-align: center;
  }

 html,
  body {
    width: 100%;
    height: 100%;
    font: 14px/1.5 "Helvetica Neue","PingFang SC","Hiragino Sans GB","Microsoft YaHei",sans-serif;
    color: #333;
    background-color: #fff;
    -webkit-font-smoothing: antialiased;
    -webkit-overflow-scrolling: touch;
    /* 解决iOS 字体放大问题 */
    -webkit-text-size-adjust: 100% !important;
    text-size-adjust: 100% !important;
  }

  * {
    box-sizing: border-box;
  }


  /*-----------------------------*\
    $ 样式重置 reset
  \*-----------------------------*/

  body, div, dl, dt, dd,ul,ol,li,h1,h2,h3,h4,h5,h6,pre,form,fieldset,input,textarea,p,blockquote，th,td{margin:0;padding:0;}
  table{border-collapse:collapse;border-spacing:0;}
  fieldset,img {border:0;}
  address,caption, cite,code,dfn,em,strong,th,var{font-style:normal;font-weight:normal;}
  ol,ul {list-style:none;}
  caption,th{text-align:left;}
  h1,h2,h3,h4,h5,h6{font-size:100%;font-weight:normal;}

  q:before, q:after{content:' ';}
  abbr,acronym{border:0;}
  a {text-decoration: none; -webkit-tap-highlight-color: rgba(0,0,0,0); }
  input, textarea { outline: none; resize: none; appearance: none; border: none;}

  .none { display: none; }
  .ellipsis{
    white-space:nowrap; text-overflow:ellipsis; overflow: hidden;
  }

  .mr5 {
    margin-right: 5px;
  }

  .ml5 {
    margin-left: 5px;
  }

  .mt5 {
    margin-top: 5px;
  }

  .ml8 {
    margin-left: 8px;
  }

  .ml15 {
    margin-left: 15px;
  }

  .ml16 {
    margin-left: 16px;
  }

  .mr10 {
    margin-right: 10px;
  }

  .mr16 {
    margin-right: 16px;
  }

  .mr20 {
    margin-right: 20px;
  }
  .pr2 {
    padding-right: 2px;
  }
  .pr3 {
    padding-right: 3px;
  }
  .pr5 {
    padding-right: 5px;
  }

  .pl5 {
    padding-left: 5px;
  }

  .pl9 {
    padding-left: 9px;
  }

  .pl10 {
    padding-left: 10px;
  }


  .pr7 {
    padding-right: 7px;
  }

  .pr10 {
    padding-right: 10px;
  }

  .pt5 {
    padding-top: 5px;
  }

  .pl15 {
    padding-left: 15px;
  }

  .pr20 {
    padding-right: 20px;
  }

  .pt20 {
    padding-top: 20px;
  }

  .pb15 {
    padding-bottom: 15px;
  }

  .pb20 {
    padding-bottom: 20px;
  }

  .pb10 {
    padding-bottom: 10px;
  }

  .pb40 {
    padding-bottom: 40px;
  }

  .pl25 {
    padding-left: 25px;
  }

  .pl30 {
    padding-left: 30px;
  }

  .mb15 {
    margin-bottom: 15px;
  }
  .mb20 {
    margin-bottom: 20px;
  }

  .mb60 {
    margin-bottom: 60px;
  }

  .left {
    text-align: left;
  }

  /*-----------------------*\
      $ 常用颜色
  \*-----------------------*/

  .c333 {
    color: #333;
  }

  .c666 {
    color: #666;
  }

  .c9b {
    color: #9B9B9B;
  }

  .cc8 {
    color: #c8c8c8;
  }

  .cddd {
    color: #ddd;
  }

  .c4a {
    color: #4a4a4a;
  }

  .blue {
    color: #5096F5;
  }

  .blue2 {
    color: #87BAFF;
  }

  .blue3 {
    color: #84B5F8;
  }

  .red {
    color: #F84F41;
  }
  .purple {
    color: #B684C8;
  }
  .cfff {
    color: #fff;
  }

  .yellow {
    color: #FEA300;
  }

  .yellow2 {
    color: #FFD02F;
  }

  .yellow3 {
    color: #FFC35A;
  }

  .clink {
    color: #636FA6;
  }

  .green {
    color: #08BC72;
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

  .f20 {
    font-size: 20px;
  }

  .f24 {
    font-size: 24px;
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

  .f34 {
    font-size: 34px;
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

  .f48 {
    font-size: 48px;
  }

  .f64 {
    font-size: 64px;
  }

  .f76 {
    font-size: 76px;
  }

  .f96 {
     font-size: 96px;
  }

  .f100 {
    font-size: 100px;
  }


  .bold {
    font-weight: bold;
  }

  .pointer {
    cursor: pointer;
  }

  .notallowed {
    cursor: not-allowed;
  }

  .flex {
    display: flex;
  }

  .box-between {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .box-center {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .box-start {
    display: flex;
    justify-content: flex-start;
    align-items: center;
  }

  .box-end {
    display: flex;
    justify-content: flex-end;
    align-items: center;
  }

  .icon {
    width: 1em;
    height: 1em;
    vertical-align: -0.15em;
    fill: currentColor;
    overflow: hidden;
  }

  ::-webkit-scrollbar {
    width: 3px;
    height: 3px;
  }
  ::-webkit-scrollbar-thumb {
    border-radius: 3px;
    background: #ddd;
  }
  ::-webkit-scrollbar-track {
    border-radius: 3px;
    background: #fff;
  }

  .w30 {
    width: 30px;
  }

  .ponter {
    cursor: pointer;
  }



</style>

<!-- loading组件 -->
<template>
	<div class="loading-wrapper">
    <div><span></span></div>
    <div><span></span></div>
    <div><span></span></div>
    <div><span></span></div>
  </div>
</template>
<script>
	export default {
	  name: 'loading',
	  props: [],
	  data () {
	    return {
	    }
	  },
	  created(){
	  },
	  methods: {}
	}
</script>

<style lang="scss" scoped>
  @import "~@/style/common";
  .loading-wrapper{
    width: px2rem(px2rem(100px));
    height: px2rem(100px);
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
  .loading-wrapper div{
    width: 100%;
    height: 100%;
    position: absolute;
    -webkit-animation: load 2.08s linear infinite;
  }
  .loading-wrapper div span{
    display: inline-block;
    width: px2rem(20px);
    height: px2rem(20px);
    border-radius: 50%;
    background: #639ef4;
    position: absolute;
    left: 50%;
    margin-top: px2rem(-10px);
    margin-left: px2rem(-10px);
  }
  @-webkit-keyframes load{
    0%{
      -webkit-transform: rotate(0deg);
    }
    10%{
      -webkit-transform: rotate(45deg);
    }
    50%{
      opacity: 1;
      -webkit-transform: rotate(160deg);
    }
    62%{
      opacity: 0;
    }
    65%{
      opacity: 0;
      -webkit-transform: rotate(200deg);
    }
    90%{
      -webkit-transform: rotate(340deg);
    }
    100%{
      -webkit-transform: rotate(360deg);
    }
  }
  .loading-wrapper div:nth-child(1){
    -webkit-animation-delay:0.2s;
  }
  .loading-wrapper div:nth-child(2){
    -webkit-animation-delay:0.4s;
  }
  .loading-wrapper div:nth-child(3){
    -webkit-animation-delay:0.6s;
  }
  .loading-wrapper div:nth-child(4){
    -webkit-animation-delay:0.8s;
  }
</style>

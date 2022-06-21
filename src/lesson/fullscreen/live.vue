/**
 * @author [tuqiushuang]
 * @email [tuqiushuang@xuetangx.com]
 * @create date 2022-06-21 16:35:29
 * @modify date 2022-06-21 16:35:29
 * @desc [直播页面]
 */


<template>
  <section class="live__page" >
    <video id="player" class="live__container video__container" webkit-playsinline playsinline autobuffer controls autoplay></video>
  </section>
</template>
<script>
  import { loadScript } from '@/util/util'
  import liveMixin from './mixin/live-kwai.js'

  export default {
    props: {
    },
    data() {
      return {
        
      }
    },
    mixins: [liveMixin],
    watch: {
      
    },
    methods: {
      init(){
        var jsonSrc = 'https://ykt-fe.yuketang.cn/liveJson.js'
        loadScript(jsonSrc).then(res => {
          let data = jsonData

          this.liveType = data.type || 1;
          this.liveurl = data;
          this.liveURL = data.flv;

          this.handleplayVideo()
        })

       
      }
    },
    created() {
      this.init()
    },
    beforeDestroy() {
      
    }
  }
</script>
<style lang="scss" scoped>
.live__page {
  width: 100vw;
  height: 100vh;
  
  video {
    width: 100vw;
    height: 100vh;
  }
}  

</style>

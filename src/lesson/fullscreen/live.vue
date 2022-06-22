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
    <div class="play-btn" v-if="showBtn" @click="handlePlay">
      <i class="iconfont icon-bofang1 cfff"></i>
    </div>
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
        cid: 0,
        showBtn: true
      }
    },
    mixins: [liveMixin],
    watch: {
      
    },
    methods: {
      init(){
        let liveData = localStorage.getItem('liveData') || {}
        let curData = liveData[this.cid]

        if(curData) {
          this.liveType = data.type || 1;
          this.liveurl = data;
          this.liveURL = data.flv;

          this.handleplayVideo()

          return 
        }

        this.fetchLiveData()
      },

      fetchLiveData(){
        var jsonSrc = `https://ykt-fe.yuketang.cn/liveData.js?_t=${new Date().getTime()}`
        loadScript(jsonSrc).then(res => {
          let data = jsonData[this.cid]

          this.liveType = data.type || 1;
          this.liveurl = data;
          this.liveURL = data.flv;

          this.handleplayVideo()
        })
      },

      handlePlay(){
        let videoEl = document.getElementById('player');

        videoEl.play()
        this.showBtn = false
      },

      initEvent(){
        let videoEl = document.getElementById('player');

        videoEl.addEventListener('timeupdate', this.handleTimeUpdate)
      },

      handleTimeUpdate(){
        let videoEl = document.getElementById('player');
        this.showBtn = false
        if(videoEl.paused) {
          this.showBtn = true
        }
      }
    },
    created() {
      this.cid = this.$route.params.cid

      this.init()
    },
    mounted() {
      this.initEvent()
    },
    beforeDestroy() {
      let videoEl = document.getElementById('player');

      videoEl.removeEventListener('timeupdate', this.handleTimeUpdate)
    }
  }
</script>
<style lang="scss" scoped>
.live__page {
  width: 100vw;
  height: 100vh;

  display: flex;
  align-items: center;
  justify-content: center;
  
  video {
    width: 100%;
    max-height: 100%;
  }

  .play-btn {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    .iconfont {
      font-size: 80px;
    }
  }
}  

</style>

/**
 * @author [tuqiushuang]
 * @email [tuqiushuang@xuetangx.com]
 * @create date 2022-06-21 16:35:29
 * @modify date 2022-06-21 16:35:29
 * @desc [直播页面]
 */


<template>
  <section class="live__page" >
    <div class="toLog f14" v-if="!type" @click="handleGoLog">关闭直播</div>
    <video id="player" class="live__container video__container" webkit-playsinline playsinline autobuffer controls autoplay></video>
    <div class="play-btn" v-if="showBtn" @click="handlePlay">
      <i class="iconfont icon-bofang1 cfff" :class="!type ? 'f40' : 'f80'"></i>
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
        showBtn: true,
        type: 0
      }
    },
    mixins: [liveMixin],
    watch: {
      
    },
    methods: {
      init(){
        let liveData = sessionStorage.getItem('liveData') || {}
        let curData = liveData[this.cid]

        if(curData) {
          this.handleSetData(curData)

          return 
        }

        this.fetchLiveData()
      },

      fetchLiveData(){
        var jsonSrc = `https://ykt-fe.yuketang.cn/liveData.js?_t=${new Date().getTime()}`
        loadScript(jsonSrc).then(res => {
          let data = window.jsonData[this.cid]

          this.handleSetData(data)
        })
      },

      handleSetData(data){
        this.liveurl = data;
        this.liveURL = data.flv;
        this.courseid = data.courseid

        this.handleplayVideo()
        document.title = data.coursename
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
      },

      handleGoLog(){
        location.href = `/v/index/course/normalcourse/logs/${this.courseid}/${this.cid}`;
      }
    },
    created() {
      this.cid = this.$route.params.cid
      this.type = this.$route.query.type || 0

      if(!this.type) {
        const addMeta = (name, content) => {
          const meta = document.createElement('meta');
          meta.content = content;
          meta.name = name;
          document.getElementsByTagName('head')[0].appendChild(meta);
        };
 
        addMeta(
          'viewport',
          'width=device-width,initial-scale=1,minimum-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover',
        );
      }

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

  .toLog {
    position: absolute;
    top: 12px;
    left: 12px;
    padding: 4px 13px;
    border: 1px solid #639EF4;
    color: #639EF4;
    border-radius: 100px;
  }

  .play-btn {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    .f80 {
      font-size: 80px;
    }
    .f40 {
      font-size: 40px;
    }
  }
}  

</style>

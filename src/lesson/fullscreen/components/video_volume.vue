<template>
  <section class="volume__wrap" :class="{'full': fullscreen}">
    <i class="iconfont icon-quxiaojingyinx" v-if="!mute" @click="handleSetMute"></i>
    <i class="iconfont icon-jingyin" v-else @click="handleSetSound"></i>
    <div class="volume_list">
      <span v-for="n in 10" @click="setVolume(n)" :key="n" :class="n <= volume ? 'active' : ''" ></span>
    </div>
  </section>
</template>

<script>
export default {
  name: 'video_volume',
  data(){
    return {
      volume: 10,
      mute: false,
      tempVolume: 0
    }
  },
  props: {
    fullscreen: Boolean
  },
  components: {
  },
  computed: {
  },
  watch: {
    
  },
  methods: {
    setVolume(volume){
      this.volume = volume
      this.mute = false
      this.$emit('setvolume', volume/10)
    },
    handleSetMute(){
      this.tempVolume = this.volume
      this.volume = 0
      this.mute = true
      this.$emit('setvolume', 0)
    },
    handleSetSound(){
      this.volume = this.tempVolume
      this.mute = false
      this.$emit('setvolume', this.volume/10)
    }
  },
  created() {

  },
  mounted() {
    
  },
  beforeDestroy() {

  }
}
</script>

<style lang="scss">
  .volume__wrap {
    display: flex;
    align-items: center;
    margin-right: 12px;
    &.full {
      margin-right: 24px;
    }
    .iconfont {
      font-size: 20px;
    }
    .volume_list {
      margin-left: 4px;
      display: flex;
      justify-content: space-between;
      width: 48px;
      span {
        width: 3px;
        height: 12px;
        background: #fff;
        border-radius: 3px;
        &.active {
          background: #5096f5
        }
      }
    }
  }
</style>

<template>
  <div class="masking"  @click.self="close" v-show="show">
    <section>
      <div class="title">
        <div class="button" @click.self="close">{{$t('cancel')}}</div>
        <div class="center">{{$t('studentsVisible')}}</div>
        <div class="button active"  @click.self="confirm">{{$t('confirm')}}</div>
      </div>
      <div class="picker-wrappper-masking"></div>
      <div class="picker-mm" ref="picker" id="pickermm">
        <div class="picker-wheel-wrapper">
          <div class="picker-wheel-item">{{$t('visibleAll')}}</div>
          <div class="picker-wheel-item">{{$t('visibleStu')}}</div>
        </div>
      </div>
      <div class="picker-wrappper-masking picker-wrappper-masking-bottom"></div>
    </section>
  </div>
</template>

<script>
  import BScroll from 'better-scroll'
  export default {
    name: 'pickermin',
    data () {
      return {
        show: false,
        index: 0,
        betterScroll: null
      }
    },
    props: ['pickershow'],
    methods: {
      close() {
        this.$emit('close', this.index)
      },
      confirm() {
        this.close()
        console.log(this.index, this.betterScroll)
        this.$emit('yes', this.index || 0)
      },
      init() {
        let self = this
        let picker = this.$refs.picker || document.querySelector('#pickermm')
        this.betterScroll = new BScroll(picker, {
          wheel:{
            selectedIndex: this.index,
            rotate: 25,
            adjustTime: 400,
            wheelWrapperClass: 'picker-wheel-wrapper',
            wheelItemClass: 'picker-wheel-item'
          }
        })
        this.betterScroll.on('scrollEnd', (pos) => {
          console.log(this.betterScroll.selectedIndex)
          self.index = this.betterScroll.selectedIndex
        })
      }
    },
    watch: {
      pickershow(n) {
        this.show = n
        if (n) {
          !this.betterScroll && this.init()
        }
      }
    }
  }

</script>
<style scoped lang="scss">
  @function px2rem($px) {
    $rem: 75px;
    @return ($px/$rem) + rem;
  }
  .masking{
    width: 100%;
    height: 100%;
    background-color: rgba(0,0,0,.1);
    position: fixed;
    top: 0;
    left: 0;
    overflow: hidden;
  }
  section{
    width: 100%;
    background-color: #fff;
    position: absolute;
    bottom: 0;
    left: 0;
    height: px2rem(800px);
    .title{
      height: px2rem(88px);
      line-height: px2rem(88px);
      width: 100%;
      display: flex;
      font-size: px2rem(40px);
      background-color: rgb(248, 248, 248);
      text-align: center;
      .button{
        padding: 0 px2rem(20px);
        color: rgb(51, 51, 51);
      }
      .center{
        height: 100%;
        font-size: px2rem(32px);
        color: rgb(155, 155, 155);
        flex: 1;
      }
      .button.active{
        color: #639ef4;
      }
    }
    .picker-wrappper-masking{
      // background-color: rgba(0, 0, 0, .2);
      height: px2rem(88px);
      position: relative;
      z-index: 2;
      background: linear-gradient(hsla(0,0%,100%,.9), hsla(0,0%,100%,.1));
    }
    .picker-wrappper-masking-bottom{
      background: linear-gradient(bottom,hsla(0,0%,100%,.9), hsla(0,0%,100%,.1));
    }
    .picker-mm{
      width: 100%;
      height: px2rem(88px);
      line-height: px2rem(88px);
      text-align: center;
      border: px2rem(2px) solid #c8c8c8;
      border-left: none;
      border-right: none;
      font-size: px2rem(40px);
      position: relative;
      z-index: 1;
      .picker-wheel-item{
        height: px2rem(88px);
      }
    }
  }
</style>

<template>
  <div class="masking" @click.self="close">
    <mt-picker :slots="arr" :item-height="height" @change="pickerend" :showToolbar="true" :defaultIndex="[1]" ref="picker">
      <div class="toolbar-wrapper" slot>
        <div class="picker-toolbars">
          <div class="button" @click="close">{{$t('cancel')}}</div>
          <div class="picker-title text-center">{{$t('studentsVisible')}}</div>
          <div class="button color63" @click="confirm">{{$t('confirm')}}</div>
        </div>
      </div>
    </mt-picker>
  </div>
</template>

<script>
  
  export default {
    name: 'picker',
    data () {
      return {
        valuelist: [this.$t('visibleAll'), this.$t('visibleStu')],
        arr: [
          {
          flex: 1,
          values: [this.$t('visibleAll'), this.$t('visibleStu')],
          className: 'slot1',
          textAlign: 'center'
        }],
        height: 36,
        arrIndex: 0
      }
    },
    props: [],
    created(){
      this.height = 36 * window.dpr || 72
    },
    methods: {
      pickerend(picker, values){
				 let value = values[0];
         this.arrIndex = this.valuelist.indexOf(value)
         console.log(values)
			 },
      confirm(){
        this.close()
        this.$emit('change', this.arrIndex)
      },
      close() {
        this.$emit('close')
      }
    },
    mounted(){
      const picker = this.$refs.picker
      console.log(picker)
      picker.setValues([this.valuelist[1]])
    }
  }

</script>
<style lang="scss">
  @import "~@/style/common";
  @function px2rem($px) {
    $rem: 75px;
    @return ($px/$rem) + rem;
  }
  .picker-toolbar{
    position: relative;
    z-index: 100000;
  }
  .picker-center-highlight::before,.picker-center-highlight::after{
    background-color: transparent;
  }
</style>
<style scoped lang="scss">
  @import "~@/style/common";
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
    .toolbar-wrapper{
      height: px2rem(88px);
      line-height: px2rem(88px);
    }
    .picker-toolbars{
      height: px2rem(88px);
      line-height: px2rem(88px);
      padding: 0 px2rem(20px);
      font-size: px2rem(32px);
      display: flex;
      color: rgb(51, 51, 51);
      .picker-title{
        flex: 1;
        font-size: px2rem(28px);
        color: rgb(155, 155, 155);
      }
    }
  }
</style>

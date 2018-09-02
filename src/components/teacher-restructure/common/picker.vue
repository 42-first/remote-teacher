<template>
  <div class="masking">
    <mt-picker :slots="arr" :item-height="height" @change="pickerend" :showToolbar="true" :defaultIndex="1">
      <div slot>
        <div class="picker-toolbar">
          <div class="button">{{$t('cancel')}}</div>
          <div class="picker-title">{{$t('studentsVisible')}}</div>
          <div class="button color63">{{$t('confirm')}}</div>
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
        arr: [
          {
          flex: 1,
          values: [this.$t('visibleAll'), this.$t('visibleStu')],
          className: 'slot1',
          textAlign: 'center'
        }],
        height: 35
      }
    },
    props: [],
    created(){
      this.height = 35 * window.dpr || 70
    },
    methods: {
      pickerend(e) {
        console.log(e)
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
    .picker-toolbar{
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

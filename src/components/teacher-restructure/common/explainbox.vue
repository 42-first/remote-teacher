<!-- 教师遥控器工具栏 被父组件 home.vue activity.vue 引用 -->
<template>
	<div class="masking">
		<div class="explain-wrapper">
      <div class="header text-center color3">{{title}}</div>
      <div class="color6 content">
        <slot name="content"></slot>
      </div>
      <div class="text-center color63 close" @touchend="close()">{{$t('close')}}</div>
    </div>
	</div>
</template>

<script>
  export default {
    name: 'explain',
    props: ['title'],
    data () {
      return {}
    },
    computed: {
    },
    created () {
    },
    methods: {
      close() {
        this.$emit('close')
      }
    }
  }
</script>

<style lang="scss" scoped>
  @import "~@/style/_variables";
  @import "~@/style/common";
  .masking{
    background-color: rgba(0, 0, 0, .5);
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    .explain-wrapper{
      width: px2rem(590px);
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      overflow: hidden;
      border-radius: px2rem(6px);
      background-color: #fff;
      .header{
        height: px2rem(160px);
        line-height: px2rem(160px);
        font-size: px2rem(36px);
        background-color: #F8F8F8;
      }
      .content{
        padding: px2rem(34px) px2rem(30px);
        font-size: px2rem(28px);
        line-height: px2rem(80px);
        border: px2rem(1px) solid #c8c8c8;
        border-left-width: 0;
        border-right-width: 0;
      }
      .close{
        height: px2rem(96px);
        line-height: px2rem(96px);
        font-size: px2rem(34px);
      }
    }
  }
</style>

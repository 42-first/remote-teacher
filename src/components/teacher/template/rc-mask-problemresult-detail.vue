<!--试题作答详情面板 被父组件 rc-mask-problemresult.vue 引用-->
<template>
	<div class="problemresultdetail-box">
    <!-- 关闭按钮 -->
    <v-touch tag="i" class="iconfont icon-close f24" v-on:tap="closeProblemresultdetail"></v-touch>
    <div class="title">本题正确选项为：</div>
    <div class="list-head">
      <div class="flex-item">姓名</div>
      <div class="flex-item">选项</div>
    </div>
    
    <button class="" size="mini" type="primary"  bindtap="refreshProblemResultDetail">刷新详情</button>
  </div>
</template>

<script>
	export default {
	  name: 'RcMaskProblemresultDetail',
	  props: [],
	  data () {
	    return {
	    }
	  },
	  created(){
	  },
	  methods: {
	  	/**
	     * 关闭试题详情的按钮
	     * 涉及设置父组件 data，所以传递事件给父组件
	     *
	     * @event bindtap
	     */
	    closeProblemresultdetail () {
	      this.$emit('closeProblemresultdetail')
	    },
	  }
	}
</script>

<style lang="scss" scoped>
	@import "~@/style/_variables";
	.problemresultdetail-box {
	  position: absolute;
	  left: 0;
	  right: 0;
	  top: 0;
	  bottom: 0;
	  background: $white;
	  padding-top: 20rpx;
	  color: #4A4A4A;
	  overflow: auto;

	  .icon-close {
	  	position: absolute;
	  	right: 0.386667rem;
	  	top: 0.44rem;
	  }

	  .table-box {
		  height: 500rpx;
		}
	}
</style>

<!--连接异常，倒计时重连、立即重连面板 被父组件 home.vue 引用-->
<template>
	<div class="mask-content reconnect-box f18">
    <div v-show="isConnectingHidden">
      <div class="" v-html="$t('connerr', { second: connectCountDown })">
        <!-- 连接异常，<span>{{connectCountDown}}</span>秒后尝试重连 -->
      </div>
      <v-touch class="btn retry-btn" v-on:tap="triggerReconnect">{{ $t('connnow') }}</v-touch>
    </div>
    <div v-show="!isConnectingHidden">
      <span>{{ $t('loading') }}...</span>
    </div>
  </div>
</template>

<script>
	export default {
	  name: 'Reconnect',
	  props: ['connectCountDown', 'isConnectingHidden'],
	  data () {
	    return {
	    }
	  },
	  created(){
	  },
	  methods: {
		   /**
		   * WebSocket 立即重连
		   *
		   */
		  triggerReconnect () {
		    let self = this

		    self.$emit('triggerReconnect')
		  },
	  }
	}
</script>

<style lang="scss" scoped>
	@import "~@/style/_variables";
	.reconnect-box {
	  .retry-btn {
	  	margin: 0.666667rem auto;
	  	width: 4.0rem;
	  }
	}
</style>

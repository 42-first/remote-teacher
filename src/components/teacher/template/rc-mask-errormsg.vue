<!--组合错误信息面板 被父组件 remote.vue 引用 -->
<template>
  <div class="mask-content f20" v-html="errMsgList[errType]"></div>
</template>

<script>
import config from '@/config/config'

export default {
  name: 'RcMaskErrormsg',
  props: ['errType'],
  data () {
    return {
      errMsgList: config.errMsgList
    }
  }
}
</script>

<!-- 课堂动态面板 被父组件 remote.vue 引用 -->
<template>
	<div class="activity-box">
    课堂动态
  </div>
</template>

<script>
  import request from '@/util/request'
  import API from '@/config/api'

  export default {
    name: 'RcMaskActivity',
    props: ['lessonid', 'presentationid', 'pptData', 'current', 'total', 'socket'],
    data () {
      return {
      }
    },
    
    created () {
      
    },
    methods: {
      
    }
  }
</script>

<style lang="scss" scoped>
  @import "~@/style/_variables";
  .activity-box {
    color: $white;
  }
</style>

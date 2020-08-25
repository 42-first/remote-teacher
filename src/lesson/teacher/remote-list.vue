<template>
  <!-- 教师遥控器列表 -->
  <div class="hello">
    <h1 class=" title f20">您可以控制的遥控器</h1>
    <div class="list" v-for="item in list">
      <div class="item">
        <router-link :to="'/' + item.id" class="link f18">遥控器：{{item.title}}</router-link>
      </div>
    </div>
  </div>
</template>

<script>
import request from '@/util/request-v3'
import API from '@/util/api'

export default {
  name: 'remote-list',
  data () {
    return {
      list: []
    }
  },
  created () {
    this.fetchList()
  },
  methods: {
    fetchList () {
      let self = this

      request.get(API.remote_control_list)
        .then(jsonData => {
          if (jsonData.success) {
            self.list = jsonData.data.on_lessons
          }
        })
        .catch(function (error) {
          console.log(error)
        })
    }
  }
}
</script>

<style lang="scss" scoped>
  @import "~@/style/_variables";
  .title {
    margin: 0.5rem;
    text-align: center;
  }
  .list {
    
    .item {
      margin-bottom: 0.266667rem;
      padding: 0 1rem;
      background: $blue;

      .link {
        color: $white;
      }
    }
  }
</style>

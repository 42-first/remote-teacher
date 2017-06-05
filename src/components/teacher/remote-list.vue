<template>
  <!-- 教师遥控器列表 -->
  <div class="hello">
    <h1>遥控器列表</h1>
    <button>刷新还是轮询？</button>
    <div v-for="item in list">
      <router-link :to="'/' + item.id">遥控器id：{{item.id}}</router-link>
    </div>
  </div>
</template>

<script>
import request from '@/util/request'
import API from '@/config/api'

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

<style scoped>
h1, h2 {
  font-weight: normal;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  display: inline-block;
  margin: 0 10px;
}

a {
  color: #42b983;
}
</style>

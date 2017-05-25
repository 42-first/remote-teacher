<template>
  <!-- 教师遥控器列表 -->
  <div class="hello">
    <h1>遥控器列表</h1>
    <div v-for="item in list">遥控器id：{{item.id}}</div>
  </div>
</template>

<script>
import axios from 'axios'
import API from '../config/api'

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
      console.log(99)
      axios.get(API.remote_control_list)
        .then(function (response) {
          let jsonData = response.data

          if (jsonData.success) {
            self.list = jsonData.data.on_lessons
          };
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

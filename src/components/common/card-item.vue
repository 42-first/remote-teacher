/*
 * 表格单元格 二级页面 课程中学生综合榜单
 * @author: chenzhou
 * @update: 2017.4.18
 */

<template>
  <!-- 表格单元格 -->
  <div v-if="column&&item">

    <!-- type : 1序号 2文本 3用户名 4百分比 5分数 6日期 7数字 8标题(图标) 9查看详情 10反馈内容，弹幕内容 -->
    <template v-if="column.type==1"><p class="table-cell number">{{ item[column.key] }}</p></template>
    <template v-else-if="column.type==2"><p :class="[column.isLeft ? 'tl' : '', 'table-cell']">{{ item[column.key] }}</p></template>
     <template v-else-if="column.type==10"><p :class="[column.isLeft ? 'tl' : '', 'table-cell']">“{{ item[column.key] }}”</p></template>
    <template v-else-if="column.type==4"><p class="rate table-cell">{{ parseInt(item[column.key] * 100)}}% </p></template>
    <template v-else-if="column.type==5"><p class="score table-cell number">{{ item[column.key] }}</p></template>
    <template v-else-if="column.type==3">
      <div class="student table-cell">
        <img class="avatar" :src="item.avatar" />
        <p class="name">{{ item[column.key] }}</p>
      </div>
    </template>
    <template v-else-if="column.type==6"><p class="datetime table-cell" v-line>{{ item[column.key]|date('YYYY-MM-DD HH:mm:ss') | newLine}}</p></template>
    <template v-else-if="column.type==9"><p class="link table-cell">{{ column['title'] }}</p></template>
    <template v-else-if="column.type==8">
      <div class="log-title table-cell">
        <p class="log-icon"><i :class="item.type|getTypeIcon"></i></p>
        <p class="title">{{ item[column.key] }}</p>
      </div>
    </template>

  </div>

</template>
<script>
  import Vue from 'vue'
  Vue.directive('line', {
      inserted: function (el) {
          let $this = $(el);
          let $text = $this.text();
          $this.html($text.replace(/\s/, '<br/>'))
      }
  })
  export default {
    name: 'Cell',
    props: {
      index: null,
      column: null,
      item: null
    },
    data() {
      return {
      };
    },
    watch: {
    },
    computed: {

    },
    filters: {
        getTypeIcon(type){
        let iconClass = 'icon-beforeclass';

        if(type) {
          switch(type) {
            // 课前
            case 1:
            case 2:
              iconClass = 'icon-before-class'
              break;

            // 课中
            case 3:
              iconClass = 'icon-classroom'
              break;
            // 课后
            case 4:
            case 5:
              iconClass = 'icon-after-class'
              break;

            default:
              iconClass = 'icon-classroom';
               break;
          }

        }

        return `iconfont ${iconClass}`;
        },
        newLine(time){
            return time.replace(/\s+/gi, "\r\n");
        }
    },
    methods: {
    },
    created() {
    },
    mounted() {
    },
    beforeDestroy() {
    }
  };
</script>

<style lang="scss">
  /*--------------------*\
    $ 表格中单元格内容
  \*--------------------*/


  .table-cell {
    font-size: 16px;
    color: #4a4a4a;
    text-align: center;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: normal;
    word-break: break-all;
    box-sizing: border-box;
  }

  .header .table-cell {
    font-size: 18px;
  }

  .table-cell.tl {
    text-align: left;
    padding: 0 30px 0 30px;
  }

  .table-cell.student {
    display: flex; align-items: flex-start; justify-content: flex-start;
    font-size: 14px;
    padding-left: 25px;

    .avatar {
      display: block;
      width: 30px;
      height: 30px;
      border-radius: 50%;
    }
    .name {
      padding-left: 7px;
      max-width: 58px;
      line-height: 30px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .table-cell.score {
    font-size: 24px;
    color: #639EF4;
  }

  .link {
    color: #639EF4;
  }

  .table-cell.datetime {
    margin: auto;
    font-size: 14px;
  }

  .log-title {
    display: flex; align-items: flex-start; justify-content: flex-start;
    padding-left: 40px;
    line-height: 50px;

    .log-icon {
      i {
        /*color: #639EF4;*/
        font-size: 36px;
      }
    }

    .title {
      padding-left: 15px;
    }

  }

</style>

<!-- 投稿控制页 -->
<template>
	<div class="page">
    <div class="ppt-show-set w100 color6 border-box" @click="pptShowSetLink">
      <span class="text">
          <span>{{ $t('studentsVisible') }}:</span><!--学生可见-->
          <span v-show="show_presentation === 'film'">{{ $t('visibleStu') }}</span><!--课上讲解的-->
          <span v-show="show_presentation === 'all' || !show_presentation">{{ $t('visibleAll') }}</span><!--全部课件-->
      </span>
      <div class="icon-span"><i class="iconfont icon-kejiankejianqiehuan color63"></i></div>
    </div>
  </div>
</template>

<script>
  import axios from 'axios'
  import {mixin} from '../util/mix_ppt_show_set'
  import MessageBoxMin from './messagebox.vue'

  export default {
    name: 'StateSet',
    data () {
      return {
        show_presentation: 'all'
      }
    },
    mixins: [mixin],
    components: {
      MessageBoxMin
    },
    created () {
      this.init()
    },
    beforeDestroy () {
    },
    methods: {
      init () {
        let url = 'pc/web_ppt_config'
        axios.post(this.urlMock(url), {
          'op': 'get_config'
        }).then(e => {
          let data = e.data
          if (data.success) {
            this.show_presentation = data.data.show_presentation
          }
        })
      },
      pptShowSetLink () {
        this.pptShowSet({
          get_config: this.show_presentation
        })
      },
      urlMock (url) {
        if (process.env.NODE_ENV !== 'production') {
          return 'http://apimock.xuetangx.com/mock/115/' + url
        }
        return '/' + url
      }
    }
}
</script>
<style lang="scss">
  @import "~@/style/common";
  .page{
    background-color: #F6F7F8;
    height: 100%;
    overflow: hidden;
    .ppt-show-set{
      margin-top: 0.267rem;
      font-size: 0.373rem;
      height: 1.2rem;
      line-height: 1.2rem;
      padding: 0 0.4rem;
      display: flex;
      background-color: #fff;
      .text{
        flex: 1;
      }
      .icon-span{
        i{
          font-size: 0.8rem;
        }
      }
    }
  }
</style>

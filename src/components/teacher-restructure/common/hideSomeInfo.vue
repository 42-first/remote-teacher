<template>
	<div class="w100">
    <div class="hide-show-answer w100" v-if="!isUserInfo">
      <div class="status text-left">{{ $t('submittotal2', { ss1: total, ss2: members }) }}</div>
      <div class="text-right hide-answer-wrapper">
        <label @click="showAnswerHandle" class="ver-middle inline-block">
          <i class="iconfont icon-kuang ver-middle" v-show="!showAnswer"></i>
          <i class="iconfont icon-kuangxuanzhong color-f ver-middle" v-show="showAnswer"></i>
          <span class="hide-answer ver-middle">{{$t("showanwer")}}</span>
        </label>
        <i class="iconfont icon-question ver-middle" @click="explainShow = true"></i>
      </div>
    </div>
    <div class="text-right w100">
      <span class="hide-show-name color6 back-f inline-block" v-if="isUserInfo">
        <label @click="hideNameHandle" class="ver-middle inline-block">
          <i class="iconfont icon-kuang ver-middle" v-show="isHideName"></i>
          <i class="iconfont icon-kuangxuanzhong color63 ver-middle" v-show="!isHideName"></i>
          <span class="info ver-middle">{{$t('HideStuInfo')}}</span>
        </label>
        <i class="iconfont icon-question ver-middle" @click="explainShow = true"></i>
      </span>
    </div>
    <explainbox :title="$t('toupingexplaintitle')" v-show="explainShow" @close="explainShow = false">
			<div slot="content">
				<p>{{$t('toupingexplain')}}</p>
			</div>
		</explainbox>
  </div>
</template>

<script>
  import {mapGetters} from 'vuex'
  import axios from 'axios'
  import explainbox from "@/components/teacher-restructure/common/explainbox"
  export default {
    name: 'hideSomeInfo',
    props: ['isTouping', 'isUserInfo', 'total', 'members'],
    computed: {
      ...mapGetters([
        'lessonid',
        'socket',
        'userid',
        'auth'
      ])
    },
    data () {
      return {
        showAnswer: true,
        isHideName: false,
        explainShow: false
      }
    },
    created () {
      this.isUserInfo ? this.getShowUserInfo() : this.getShowAnswer()
    },
    methods: {
      // 隐藏答案
			showAnswerHandle() {
				this.showAnswer = !this.showAnswer
	      let str = JSON.stringify({
	        'op' : 'postproblemresult',
	        'lessonid': this.lessonid,
					'problemid': this.problemid,
					'showresult': this.showAnswer
        })
        console.log(this.isTouping)
        this.isTouping && this.socket.send(str)
        this.$emit('change', this.showAnswer)
      },
      // 点击是否显示学生姓名
      hideNameHandle() {
        this.isHideName = !this.isHideName;
        axios.post('/pc/web_ppt_config',{
          "op":"set_config",
          "set_data": {
            "show_user_profile": !this.isHideName
          }
        })
        this.$emit('change', !this.isHideName)
      },
      // 是否显示答案
      getShowAnswer() {
        axios.get('/v/lesson/get_problem_show_answer_config/').then(e => {
          let data = e.data.data

          this.showAnswer = !!data.problem_show_answer
          this.$emit('change', this.showAnswer)
        })
      },
      // 是否显示用户信息
      getShowUserInfo() {
        axios.get('/v/lesson/get_show_user_profile_config/').then(e => {
          let data = e.data.data

          this.isHideName = !data.show_user_profile
          this.$emit('change', this.isHideName)
        })
      }
    },
    components: {
      explainbox
    }
  }
</script>

<style lang="scss" scoped>
  @import "~@/style/_variables";
  @import "~@/style/common";
  .hide-show-name{
    width: 100%;
    height: px2rem(88px);
    line-height: px2rem(88px);
    background-color: #fff;
    box-sizing: border-box;
    padding: 0 px2rem(30px);
    font-size: 0;
    position: relative;
    .iconfont{
      font-size: px2rem(30px);
      vertical-align: middle;
    }
    .icon-kuang{
      color: #666;
    }
    .icon-kuangxuanzhong{
      color: #639efc;
    }
    .info{
      color: #666;
      font-size: px2rem(28px);
      margin: 0 px2rem(10px);
    }
  }
  .hide-show-name::before{
    content: "";
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: calc(100% - 0.4rem);
    border-top: 1px solid #aaa;
  }
  .hide-show-answer{
    margin-top: px2rem(32px);
    padding: 0 px2rem(30px);
    height: px2rem(88px);
    line-height: px2rem(88px);
    color: #fff;
    font-size: px2rem(28px);
    display: flex;
    border-top: px2rem(1px) solid #aaa;
    .status{
      flex: 1;
    }
    .hide-answer-wrapper{
      font-size: 0;
      i{
          font-size: px2rem(30px);
        }
      label{
        .hide-answer{
          margin-right: px2rem(10px);
          font-size: px2rem(28px);
        }
        i{
          margin: 0 px2rem(10px);
        }
      }
    }
  }
</style>

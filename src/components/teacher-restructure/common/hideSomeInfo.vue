<template>
	<div class="w100 show-wrapper" :class="{'large': size == 'large'}">
    <div class="hide-show-answer w100" v-if="!isUserInfo">
      <div class="status text-left">{{ $t('submittotal2', { ss1: total, ss2: members }) }}</div>
      <div class="text-right hide-answer-wrapper" v-if="showAnswerText">
        <label @click="showAnswerHandle" class="ver-middle inline-block">
          <i class="iconfont icon-kuang ver-middle" v-show="!showAnswer"></i>
          <i class="iconfont icon-kuangxuanzhong color-f ver-middle" v-show="showAnswer"></i>
          <span class="hide-answer ver-middle">{{$t("showanwer")}}</span>
        </label>
        <i class="iconfont icon-question ver-middle" @click="explainShow = true"></i>
      </div>
    </div>
    <div class="w100" :class="position == 'left' ? 'text-left' : 'text-right'" v-if="pptversion >= 1.3">
      <span class="hide-show-name color6 back-f inline-block" v-if="isUserInfo" :class="{'no-border': !problemtype}">
        <label @click="hideNameHandle" class="ver-middle inline-block">
          <i class="iconfont icon-kuang ver-middle" v-show="!isHideName"></i>
          <i class="iconfont icon-kuangxuanzhong color63 ver-middle" v-show="isHideName"></i>
          <span class="info ver-middle">{{$t('HideStuInfo')}}</span>
        </label>
        <!-- <i class="iconfont icon-question ver-middle" @click="explainShow = true"></i> -->
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
    props: ['isTouping', 'isUserInfo', 'total', 'members', 'problemid', 'problemtype', 'position', 'size'],
    computed: {
      ...mapGetters([
        'lessonid',
        'socket',
        'userid',
        'auth',
        'addinversion',
        'isCloneClass'
      ])
    },
    data () {
      return {
        showAnswer: true,
        isHideName: false,
        explainShow: false,
        showAnswerText: true,
        pptversion: 0
      }
    },
    created () {
      let num = Number(this.addinversion)
      let type = this.problemtype
      console.log(num, this.addinversion, type)
      this.pptversion = num
      this.showAnswerText = num && num >= 1.3 && type!=='Polling'&& type!=='AnonymousPolling'
      if (num >= 1.3) {
        this.isUserInfo ? this.getShowUserInfo() : this.getShowAnswer()
      }
    },
    methods: {
      // 隐藏答案
			showAnswerHandle() {

        // 克隆班不能执行当前操作
        if (!!this.isCloneClass) {
          this.$toast({
            message: this.$t('cloneTips'),
            duration: 3e3
          });
          return
        }

				this.showAnswer = !this.showAnswer
	      let str = JSON.stringify({
	        'op' : 'postproblemresult',
	        'lessonid': this.lessonid,
					'problemid': this.problemid,
					'showresult': this.showAnswer
        })
        this.isTouping && this.socket.send(str)
        this.$emit('change', this.showAnswer)
      },
      // 点击是否显示学生姓名
      hideNameHandle() {

        // 克隆班不能执行当前操作
        if (!!this.isCloneClass) {
          this.$toast({
            message: this.$t('cloneTips'),
            duration: 3e3
          });
          return
        }

        this.isHideName = !this.isHideName;
        // let str = JSON.stringify({
        //   "op": "protectprivacy",
        //   "lessonid": this.lessonid,
        //   "hide": this.isHideName
        // })
        // this.socket.send(str)
        this.hideNameHandleConfig()
        // this.$emit('change', this.isHideName)
      },
      hideNameHandleConfig () {
        axios.post('/pc/web_ppt_config',{
          "op": "set_config",
          "set_data": {
            "show_user_profile": !this.isHideName
          },
          "lesson_id": this.lessonid
        })
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
          // this.$emit('change', this.isHideName)
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
  .show-wrapper{
    height: px2rem(40px);
    &.large {
      height: px2rem(88px);

      .hide-show-name {
        height: px2rem(88px);
        line-height: px2rem(88px);
        margin-top: 0;

        &::before {
          border-top: 1px solid #aaa;
        }
      }

      .hide-show-answer{
        margin-top: px2rem(32px);
        height: px2rem(88px);
        line-height: px2rem(88px);
        border-top: px2rem(1px) solid #aaa;
      }
    }
  }
  .hide-show-name{
    width: 100%;
    height: px2rem(40px);
    line-height: px2rem(40px);
    background-color: #fff;
    box-sizing: border-box;
    padding: 0 px2rem(30px);
    font-size: 0;
    position: relative;
    margin-top: 0.26666667rem;
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
    // border-top: 1px solid #aaa;
  }
  .no-border::before{
    border-top: none;
  }
  .hide-show-answer{
    margin-top: px2rem(20px);
    padding: 0 px2rem(30px);
    height: px2rem(40px);
    line-height: px2rem(40px);
    color: #fff;
    font-size: px2rem(28px);
    display: flex;
    // border-top: px2rem(1px) solid #aaa;
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

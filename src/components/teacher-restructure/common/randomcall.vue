<!-- 随机点名面板 被父组件 remote.vue 引用 -->
<template>
	<div class="random-roll-box">
    <v-touch class="close f18" v-on:tap="giveupRoll">
      <i class="iconfont icon-ykq-shiti-guanbi f32" style="color: #FFFFFF;"></i>
    </v-touch>

    <div class="upper">
      <div class="desc f24" v-show="step === 0">
        当前共有 <span class="num f32">{{signInCount}}</span> 位学生进入课堂<br>即将开始随机点名
      </div>
      <div class="desc f24" v-show="step === 1">正在随机筛选...</div>
      <div class="desc f24" v-show="step === 2">就是Ta了</div>
      <v-touch class="roll_btn_box" v-on:tap="rollBtnHandler">
        <img v-show="step !== 1" src="~images/teacher/light-pause.png" alt="" class="light_box">
        <img v-show="step === 1" src="~images/teacher/light-roll.png" alt="" class="light_box rolling">
        <div class="wenzi f24">{{btnText}}</div>
      </v-touch>
      <div class="blink f20" v-show="!isNostuhintHidden">当前班级没有学生，不能点名</div>
    </div>

    <div v-show="calledlist.length || nowchosen.name" class="down">
      <div v-show="step !== 1 && nowchosen.sid" class="now ellipsis f24">
        {{nowchosen.name}}<br>
        {{nowchosen.sid}}
      </div>
      <div v-show="step !== 1 && !nowchosen.sid" class="now single ellipsis f24">
        {{nowchosen.name}}
      </div>
      <div v-show="step === 1" class="now ellipsis f24"></div>
      <ul class="list allowscrollcallback">
        <li class="f16" v-for="item in calledlist">
          <div class="left ellipsis">{{item.name}}</div>
          <div class="right ellipsis">{{item.sid}}</div>
        </li>
      </ul>
    </div>

  </div>
</template>

<script>
  import {mapGetters} from 'vuex'

  let rollBtnTimer = null // 记录socket延迟
  export default {
    name: 'RcMaskRandomcall',
    props: [],
    data () {
      return {
        signInCount: '--',
        step: 0,                  // 0 初次进入， 1 正在筛选， 2已经停止，可以继续滚动
        calledlist: [],
        isNostuhintHidden: true,  // 当前没有学生可以点名的提示文案
        nowchosen: {
          name: '',
          num: ''
        }
      }
    },
    computed: {
      btnText: function () {
        switch (this.step) {
          case 0:
            return '开始滚动'
            break
          case 1:
            return '暂停'
            break
          case 2:
            return '继续滚动'
            break
        }
      },
      ...mapGetters([
        'lessonid',
        'socket',
      ])
    },
    created () {
      let self = this

      // 点击 随机点名 按钮 父组件收到node回执后发送事件给本子组件
      self.$on('callwokeup', function (msg) {
        clearTimeout(rollBtnTimer)
        self.signInCount = msg.sc
      })

      // 点击 滚动 按钮 父组件收到node回执后发送事件给本子组件
      self.$on('callstarted', function (msg) {
        clearTimeout(rollBtnTimer)
        // remoteNS.MSGID_BACK = msg.msgid
        self.step = 1
      })

      // 点击 暂停 按钮 父组件收到node回执后发送事件给本子组件
      self.$on('callpaused', function (msg) {
        clearTimeout(rollBtnTimer)
        // remoteNS.MSGID_BACK = msg.msgid
        self.step = 2
        self.nowchosen = {
          name: msg.name,
          sid: msg.sid
        }
      })

      // 刷新遥控器得知正在点名 咨询 calledlist 父组件收到node回执后发送事件给本子组件
      self.$on('calledlist', function (msg) {
        self.step = 0
        self.calledlist = msg.calledlist
      })

      // 点击 继续上课 按钮 父组件收到node回执后发送事件给本子组件
      self.$on('closedmask', function (msg) {
        clearTimeout(rollBtnTimer)
        self.step = 0
        self.isNostuhintHidden = true

        // 清理当前人到列表中
        self.moveChosen2List()
      })
    },
    methods: {
      /**
       * 继续上课 按钮
       *
       * @event bindtap
       */
      giveupRoll () {
        let self = this

        let str = JSON.stringify({
          'op': 'closemask',
          'lessonid': self.lessonid,
          'type': 'call'
        })

        self.socket.send(str)
      },
      /**
       * 中间点名大圆按钮：开始滚动、暂停、继续滚动
       *
       * @event bindtap
       */
      rollBtnHandler () {
        let self = this

        if(self.signInCount === 0){
          self.isNostuhintHidden = false
          return
        }

        // remoteNS.MSGID++
        let str = JSON.stringify({
          'op': self.step === 1 ? 'callpause': 'callstart',
          'lessonid': self.lessonid,
          'type': 'call',
          'msgid': 1234
        })

        self.socket.send(str)

        // 清理当前人到列表中
        self.step !== 1 && self.moveChosen2List()

        // rollBtnTimer = setTimeout(function(){
        //   if(remoteNS.MSGID_BACK != remoteNS.MSGID){
        //     myToast('网络不佳')
        //   }
        // }, 2000)
      },
      /**
       * 将选中的人放进list
       *
       */
      moveChosen2List () {
        let self = this

        // 清理当前人到列表中
        if (self.nowchosen.name) {
          self.calledlist.unshift({
            name: self.nowchosen.name,
            sid: self.nowchosen.sid
          })

          self.nowchosen = {name: '', sid: ''}
        }
      },
    }
  }
</script>

<style lang="scss" scoped>
  @import "~@/style/_variables";
  .random-roll-box {
    display: flex;
    height: 100%;
    flex-direction: column;
    justify-content: space-between;
    color: $white;
    text-align: center;
    overflow: hidden;

    .close {
      position: absolute;
      right: 0.666667rem;
      top: 0.666667rem;
      color: $blue;
    }

    .upper {
      .desc {
        padding-top: 2.346667rem;
        height: 5.0rem;

        .num {
          color: $blue;
        }
      }

      .roll_btn_box {
        margin: 0 auto 0.8rem;
        width: 4rem;
        height: 3.506667rem;

        .light_box {
          margin: 0 auto;
          width: 3.506667rem;
          height: 3.506667rem;
        }

        .wenzi {
          position: relative;
          top: -2.35rem;
          color: $blue;
        }
      }
    }

    .down {
      flex: 1;
      display: flex;
      flex-direction: column;
      position: relative;
      border-top: 1px solid #639EF4;
      background: rgba(99,158,244,0.1);

      .now {
        height: 2.0rem;
        line-height: 1.0rem;
      }
      .single {
        line-height: 2.0rem;
      }

      .list {
        flex: 1;
        margin: 0 0.6rem;
        box-sizing: border-box;
        overflow: scroll;
        border-top: 1px solid #496596;

        li {
          display: flex;
          margin: 0.4rem 0;
          color: $blue;

          .left {
            flex: 1;
            text-align: right;
            margin-right: 0.533333rem;
          }
          .right {
            flex: 1;
            text-align: left;
          }
        }
      }
    }

    
  }

  @-webkit-keyframes rotater {
    0% {transform: rotate(0deg);}
    100% {transform: rotate(360deg);}
  }
  .rolling {
    animation: rotater 2s linear infinite;
    -webkit-animation: rotater 2s linear infinite;
  }

  @-webkit-keyframes blink {
    0% {opacity: 1;}
    50% {opacity: 0.35;}
    100% {opacity: 1;}
  }
  .blink {
    animation: blink 2s infinite;
    -webkit-animation: blink 2s infinite;
  }
</style>

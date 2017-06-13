<!-- 随机点名面板 被父组件 remote.vue 引用 -->
<template>
	<div class="random-roll-box">
    <div class="close f18">继续上课&gt;</div>

    <div class="upper">
      <div class="desc f24">
        当前共有 <span class="num f32">96</span> 位学生进入课堂<br>即将开始随机点名
      </div>
      <!-- <div class="desc f24">正在随机筛选...</div> -->
      <!-- <div class="desc f24">就是Ta了</div> -->
      <div class="roll_btn_box" data-step="0">
        <!-- <img src="~images/teacher/light-pause.png" alt="" class="light_box"> -->
        <img src="~images/teacher/light-roll.png" alt="" class="light_box rolling">
        <div class="wenzi f24">开始滚动</div>
      </div>
      <div class="blink f20">当前班级没有学生，不能点名</div>
    </div>

    <div class="down">
      <div class="now ellipsis f24">
        李明<br>
        李明
      </div>
      <ul class="list allowscrollcallback">
        <li class="f16">
          <div class="left ellipsis">静静</div>
          <div class="right ellipsis">201704051101</div>
        </li>
        <li class="f16">
          <div class="left ellipsis">1迪丽热巴</div>
          <div class="right ellipsis">201704051101</div>
        </li>
        <li class="f16">
          <div class="left ellipsis">2迪丽热巴迪丽热巴迪丽热巴迪丽热巴</div>
          <div class="right ellipsis">201704051101</div>
        </li>
        <li class="f16">
          <div class="left ellipsis">3迪丽热巴迪丽热巴迪丽热巴迪丽热巴</div>
          <div class="right ellipsis">201704051101</div>
        </li>
        <li class="f16">
          <div class="left ellipsis">4迪丽热巴迪丽热巴迪丽热巴迪丽热巴</div>
          <div class="right ellipsis">201704051101</div>
        </li>
        <li class="f16">
          <div class="left ellipsis">5迪丽热巴迪丽热巴迪丽热巴迪丽热巴</div>
          <div class="right ellipsis">201704051101</div>
        </li>
      </ul>
    </div>

  </div>
</template>

<script>

  export default {
    name: 'RcMaskRandomcall',
    props: [],
    data () {
      return {
      }
    },
    created () {

    },
    methods: {
      bb () {
        // 随机点名继续上课按钮
        $('[data-role=continue_btn]').tap(function(e){
            stopBubble(e);
            var _this = this;

            remoteNS.exampleSocket.send(JSON.stringify({
                'op':"closemask",
                'lessonid': lessonID,
                'type': 'call'
                }
            ));
        });

        // 随机点名 开始滚动、暂停、继续滚动 按钮
        $('[data-role=roll_btn]').tap(function(e){
            stopBubble(e);
            var _this = this;
            var step = $(_this).data('step')
            var sc = $('[data-role=stu_num]').html()

            if(sc == 0){
              $('.nostuhint').show()
              return
            }

            // 点名状态：-1未点名 0开始点名界面 1正在点名 2点名暂停
            remoteNS.MSGID++
            remoteNS.exampleSocket.send(JSON.stringify({
                'op': step == 1 ? 'callpause': 'callstart',
                'lessonid': lessonID,
                'type': 'call',
                'msgid': remoteNS.MSGID
                }
            ));

            remoteNS.rollBtnTimer = setTimeout(function(){
              if(remoteNS.MSGID_BACK != remoteNS.MSGID){
                myToast('网络不佳')
              }
            }, 2000)
        });
      }
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
        height: 3.506667rem;
        margin-bottom: 1rem;

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

/*
 * @page：学生接收器danmu页面
 * @author: chenzhou
 * @update: 2017.6.9
 * @desc
 *
 */

<template>
  <section class="page-danmu">
    <div :class="['danmu-wrapper', 'animated', opacity ? 'zoomIn': '']">
      <!-- 文字编辑 -->
      <section class="danmu__text">
        <div class="danmu__textarea--wrapper f17">
          <textarea class="danmu-textarea J_feed_content" placeholder="说点啥好~" v-model="text"></textarea>
          <div class="danmu-footer">
            <p class="">(<span class="">{{ count }}</span>/50)</p>
          </div>
        </div>
      </section>

      <!-- 图片 -->
      <section class="danmu__tip f14">
        温馨提示：发送前请自行审查用词
      </section>

      <section :class="['danmu__submit', 'f17', sendStatus === 0 || sendStatus === 3 ? 'disable': '']" @click="handelSend">{{ submitText }}</section>

    </div>

  </section>
</template>
<script>
  import API from '@/util/Api'

  export default {
    name: 'danmu-page',
    data() {
      return {
        index: 0,
        opacity: 0,

        // 0 初始化状态 1可以发送 2发送中 3发送完成
        sendStatus: 0,
        submitText: '确认发送',
        title: '弹幕',
        text: '',
        count: 0
      };
    },
    components: {
    },
    computed: {
    },
    watch: {
      text(newValue, oldValue) {
        // let value = newValue && newValue.replace(/^\s+|\s+$/g, '').substr(0, 50);
        let value = newValue && newValue.substr(0, 50);

        this.count = value && value.length || 0;
        this.text = value;

        if(this.count) {
          this.sendStatus = 1;
        } else {
          this.sendStatus = 0;
        }
      },
      sendStatus(newValue, oldValue) {
        if(newValue === 2) {
          this.submitText = '正在发送';
        } else if(newValue === 3) {
          this.submitText = '发送成功';
        }
      }
    },
    methods: {
      /*
      * @method 发送弹幕
      * @param
      */
      sendDanmu() {
        let self = this;
        let URL = API.student.SEND_DANMU;
        let socket = this.$parent.socket;
        const message = this.text.replace(/^\s+|\s+$/g, '').replace(/(\r\n|\n|\r)/gm, ' ');
        let params = {
          'lessonID': this.lessonID,
          'presentationID': this.$parent.presentationID,
          'message': message
        };

        // 发送中
        this.sendStatus = 2;

        return request.post(URL, params)
          .then(function (res) {
            if(res) {
              // 弹幕返回数据结构 danmuID success
              let data = res;
              self.sendStatus = 3;

              self.$toast({
                message: '发送成功',
                duration: 2000
              });

              setTimeout(() => {
                self.handleBack();
              }, 2000)

              // todo: del 新版接收器去掉此通信socket通信
              // socket.send(JSON.stringify({
              //   op: 'newdanmu',
              //   lessonid: self.lessonID,
              //   danmuid: data.danmuID,
              //   danmu: message
              // }));

              return data;
            }
          });
      },
      /*
      * @method 发送弹幕
      * @param problemID 问题ID
      */
      handelSend() {
        if(this.sendStatus ===1 && this.count) {
          this.sendDanmu();
        }
      },
      handleBack() {
        this.$router.back();
      }
    },
    created() {
      this.lessonID = +this.$route.params.lessonID;
      document.title = '弹幕';
    },
    mounted() {
    },
    beforeDestroy() {
    }
  };
</script>

<style lang="scss">

  /*------------------*\
    $ 文字编辑
  \*------------------*/

  .page-danmu {
    z-index: 1;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;

    background: #EDF2F6;

    overflow-y: scroll;
    -webkit-overflow-scrolling: touch;
  }

  .danmu-wrapper {
    width: 100%;
    height: 100%;
  }


  /*------------------*\
    $ 投稿文字
  \*------------------*/

  .danmu__text {
    padding: 0.266667rem 0.453333rem 0;

    background: #fff;

    .danmu__textarea--wrapper {
      position: relative;
    }

    .danmu-textarea {
      padding: 0.133333rem;

      width: 100%;
      height: 5.066667rem;
      border-width: 0;

      -webkit-user-select: auto;
    }

    .danmu-textarea::-webkit-input-placeholder {
      color: #9B9B9B
    }

    .danmu-footer {
      position: absolute;
      bottom: 0.133333rem;
      right: 0.066667rem;

      color: #9B9B9B
    }

  }

  .danmu__tip {
    padding-top: 0.48rem;
    color: #9B9B9B
  }




  .danmu__submit {
    position: fixed;
    bottom: 1.333333rem;
    left: 0;
    right: 0;
    margin: 0 auto;
    width: 7.733333rem;
    height: 1.173333rem;
    line-height: 1.173333rem;

    color: #fff;
    background: #639EF4;

    border-radius: 0.106667rem;
  }

  .danmu__submit.disable {
    background: #999999;
  }

  .danmu__submit:active:not(.disable) {
    background: rgba(99,158,244,0.7);
  }


</style>





















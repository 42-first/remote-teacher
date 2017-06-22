<!-- 投稿控制页面 被父组件 rc-mask-activity.vue 引用 -->
<template>
	<div class="submission-box allowscrollcallback">
    <div class="gap"></div>
    <section class="list">

      <div class="item-with-gap" v-for="(item, index) in submissionList" :key="item.id">
        <div class="item">
          <div class="detail">
            <img :src="item.user_avatar" class="avatar" alt="">
            <div class="cont f18">
              <span class="author f15">{{item.user_name}}</span><br>
              {{item.content}}<br>
              <img :src="item.pic" class="pic" alt="">
            </div>
          </div>
          <div class="action-box">
            <div class="time f15">{{item.create_time.substring(11)}}</div>
            <div class="action f15">
              <v-touch class="coll" v-show="item.is_collect" v-on:tap="collectSubmission(item.id, index, 0)">已收藏</v-touch>
              <v-touch class="coll" v-show="!item.is_collect" v-on:tap="collectSubmission(item.id, index, 1)">收藏</v-touch>

              <v-touch v-show="postingSubmissionid !== item.id" v-on:tap="postSubmission(item.id)">投屏</v-touch>
              <v-touch class="cancel-post-btn f17" v-show="postingSubmissionid === item.id" v-on:tap="closeSubmissionmask">退出投屏</v-touch>
            </div>
          </div>
        </div>
        <div class="gap"></div>
      </div>

    </section>
    <v-touch class="back-btn f18" v-on:tap="closeSubmissionbox">返回</v-touch>
  </div>
</template>

<script>
  import request from '@/util/request'
  import API from '@/config/api'

  export default {
    name: 'RcMaskActivitySubmission',
    props: ['lessonid', 'socket', 'postingSubmissionid'],
    data () {
      return {
        submissionList: [],    // 投稿列表
      }
    },
    created () {
      let self = this


      // 父组件点击 投稿 按钮时发送事件给本子组件
      self.$on('showSubmission', function (msg) {
        self.refreshSubmissionlist()
      })
    },
    methods: {
      /**
       * 点击 返回 按钮 返回课堂动态
       *
       * @event bindtap
       */
      closeSubmissionbox () {
        this.$emit('closeSubmissionbox')
        this.closeSubmissionmask()
      },
      /**
       * 更新试题详情的数据
       * 点击打开详情时要主动更新一下数据，所以把本方法放在本父组件中
       *
       */
      refreshSubmissionlist(){
        let self = this
        let url = API.submissionlist

        // 单次刷新
        request.get(url, {
          'lesson_id': self.lessonid,
          'start': 10000000000000000000,
          'count': 10000000000000000000,
          'direction': 0
        }).then(jsonData => {
            // 设置试卷详情数据
            self.submissionList = jsonData.data.tougao_list
          })
      },
      /**
       * 投屏
       *
       * @event bindtap
       * @param {number} submissionid
       */
      postSubmission (submissionid) {
        let self = this

        let str = JSON.stringify({
          'op': 'showpost',
          'lessonid': self.lessonid,
          'postid': submissionid,
          'msgid': 1234
        })

        self.socket.send(str)
      },
      /**
       * 退出投稿投屏蒙版
       *
       * @event bindtap
       */
      closeSubmissionmask () {
        let self = this

        let str = JSON.stringify({
          'op': 'closemask',
          'lessonid': self.lessonid,
          'type': 'post',
          'msgid': 1234
        })

        self.socket.send(str)
      },
      /**
       * 收藏投稿
       *
       * @event bindtap
       * @param {number, number, number} submissionid; index序号; status 0 将要取消收藏  1 将要收藏
       */
      collectSubmission (submissionid, index, status) {
        let self = this
        let url = status ? API.collectsubmission : API.collectsubmission_cancel

        let postData = {
          'tougao_id': submissionid
        }

        request.post(url, postData)
          .then(jsonData => {
            // 不需要判断success，在request模块中判断如果success为false，会直接reject
            self.submissionList[index].is_collect = !!status
          })
      },
    }
  }
</script>

<style lang="scss" scoped>
  @import "~@/style/_variables";
  .submission-box {
    position: absolute;
    z-index: 20; /* 遮盖toolbar */
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    background: $white;
    color: #4A4A4A;
    overflow: auto;


    .gap {
      height: 0.266667rem;
      background: #EDF2F6;
    }

    .list {
      padding-bottom: 1.466667rem;
      .item {
        padding: 0 0.4rem;

        .detail {
          display: flex;
          margin-bottom: 0.4rem;
          padding-top: 0.266667rem;

          .avatar {
            margin-right: 0.4rem;
            width: 0.986667rem;
            height: 0.986667rem;
            border-radius: 50%;
          }
          .cont {
            flex: 1;
            word-break: break-word;

            .author {
              color: $blue;
            }

            .pic {
              max-width: 100%;
            }
          }
        }

        .action-box {
          display: flex;
          justify-content: space-between;
          align-items: center;
          height: 1rem;
          margin-left: 1.386667rem;

          .time {
            color: #9B9B9B;
          }

          .action {
            display: flex;
            align-items: center;
            justify-content: space-between;

            .coll {
              margin-right: 0.666667rem;
            }
          }
          .cancel-post-btn {
            background: $blue;
            width: 2.733333rem;
            text-align: center;
            height: 0.826667rem;
            line-height: 0.826667rem;
            color: $white;
          }
        }
      }
    }

    .back-btn {
      position: fixed;
      left: 0;
      right: 0;
      bottom: 0;
      height: 1.466667rem;
      line-height: 1.466667rem;
      text-align: center;
      background: $blue;
      color: $white;
    }
  }
</style>

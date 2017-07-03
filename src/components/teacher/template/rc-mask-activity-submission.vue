<!-- 投稿控制页面 被父组件 rc-mask-activity.vue 引用 -->
<template>
	<div class="submission-box allowscrollcallback">
    <!-- 没有投稿 -->
    <div v-show="!submissionList.length" class="no-paper-box">
      <img src="~images/teacher/no-tougao.png" alt="">
      <div class="hint f12">试试让学生在手机端 <i class="iconfont icon-add f25"></i> 号中投稿吧！</div>
    </div>
    <div v-show="submissionList.length">
      <div class="gap"></div>
      <section class="list">

        <div class="item-with-gap" v-for="(item, index) in submissionList" :key="item.id">
          <div class="item">
            <div class="detail">
              <img :src="item.user_avatar" class="avatar" alt="">
              <div class="cont f18">
                <span class="author f15">{{item.user_name}}</span><br>
                {{item.content}}<br>
                <img :src="item.thumb" class="pic" alt="">
              </div>
            </div>
            <div class="action-box">
              <div class="time f15">{{item.create_time.substring(11)}}</div>
              <div class="action f15">
                <v-touch class="coll" v-show="item.is_collect" v-on:tap="collectSubmission(item.id, index, 0)">
                  <i class="iconfont icon-tougao_shoucang1 f15" style="color: #E1142D;"></i>
                  已收藏
                </v-touch>
                <v-touch class="coll" v-show="!item.is_collect" v-on:tap="collectSubmission(item.id, index, 1)">
                <i class="iconfont icon-tougao_bushoucang f15"></i>
                  收藏
                </v-touch>

                <v-touch v-show="postingSubmissionid !== item.id" v-on:tap="postSubmission(item.id)">
                  <i class="iconfont icon-shiti_touping f18" style="color: #639EF4;"></i>
                  投屏
                </v-touch>
                <v-touch class="cancel-post-btn f17" v-show="postingSubmissionid === item.id" v-on:tap="closeSubmissionmask">退出投屏</v-touch>
              </div>
            </div>
          </div>
          <div class="gap"></div>
        </div>

      </section>
    </div>
    
    <div class="toast-box f15" v-show="isAskingItemStatus || isItemDeleted">
      <span v-show="isAskingItemStatus">正在投屏中...</span>
      <span v-show="isItemDeleted">学生已删除此投稿</span>
    </div>
    <div class="button-box f18">
      <v-touch class="btn" v-on:tap="refreshSubmissionlist">刷新</v-touch>
      <v-touch class="btn f18" v-on:tap="closeSubmissionbox">返回</v-touch>
    </div>
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
        submissionList: [],           // 投稿列表
        isAskingItemStatus: false,    // 正在查询投稿状态
        isItemDeleted: false,         // 投稿已经被删除
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

        // let str = JSON.stringify({
        //   'op': 'showpost',
        //   'lessonid': self.lessonid,
        //   'postid': submissionid,
        //   'msgid': 1234
        // })

        // self.socket.send(str)

        // 因为学生能够删除投稿，修改投屏方式为ajax
        // https://tower.im/projects/ea368aa0284f4fb3ab8993b006579460/todos/5854f6b0dd584a9fac796bba852e5ba1/#043541593c7d442e8921fbf9856a8691
        self.isAskingItemStatus = true
        let url = API.tougaostatus

        let postData = {
          'lesson_id': self.lessonid,
          'tougao_id': submissionid
        }

        request.post(url, postData)
          .then(jsonData => {
            // 不需要判断success，在request模块中判断如果success为false，会直接reject
            self.isAskingItemStatus = false
            if (jsonData.data.is_deleted) {
              self.isItemDeleted = true
              setTimeout(() => {
                self.isItemDeleted = false
              }, 1000)
            }
          })
          .catch(() => {
            self.isAskingItemStatus = false
          })
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

    .no-paper-box {
      box-sizing: border-box;
      height: 100%;
      background: $white;
      text-align: center;
      
      img {
        display: inline-block;
        width: 7.213333rem;
        transform: translateY(50%);
      }
      .hint {
        position: absolute;
        left: 0;
        bottom: 2rem;
        width: 100%;
        color: #9B9B9B;
      }
    }

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
    
    .toast-box {
      position: fixed;
      left: 50%;
      top: 50%;
      width: 4.0rem;
      height: 1.466667rem;
      line-height: 1.466667rem;
      transform: translate(-50%, -50%);
      border-radius: 0.08rem;
      text-align: center;
      background: #333333;
      color: $white;
    }
    .button-box {
      display: flex;
      position: fixed;
      left: 0;
      right: 0;
      bottom: 0;
      height: 1.466667rem;
      text-align: center;

      .btn {
        flex: 1;
        border-radius: 0;
        height: 1.466667rem;
        line-height: 1.466667rem;
      }
    }
  }
</style>

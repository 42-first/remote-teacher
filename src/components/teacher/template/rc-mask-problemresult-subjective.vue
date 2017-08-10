<!--试题结果-主观题结果页面 被父组件 remote.vue 引用-->
<template>
	<div class="problem-root allowscrollcallback">
		<!--试题-主观题面板-->
		<div class="problemresult-box">
			<!-- 关闭按钮 -->
	    <v-touch class="close-box"  v-on:tap="closeProblemSubjective">
	    	<i class="iconfont icon-ykq-shiti-guanbi f24"></i>
	    </v-touch>

			<!-- 上部时钟、人数统计 -->
	    <section class="upper">
	    	<div class="f50" >
		      <img class="jishi" src="~images/teacher/jishi-dao.png" alt="">
		      <span class="time">00:45</span>
		    </div>
		    <div :class="['f18', 'yjy']">
		      已经有 <span>1</span> / <span>5</span> 位同学提交了答案
		    </div>
	    </section>

	    <!-- 中间主观题页面 -->
	    <section class="subjective-box f18">
				<p v-show="!subjectiveList.length" class="hmy">还没有人提交<br>耐心等待一会儿吧~</p>

				<!-- 主观题部分 -->
				<div class="subjective-list">
					<div class="item-with-gap" v-for="(item, index) in subjectiveList" :key="item.problem_result_id">
            <div class="item">
              <div class="detail">
                <img :src="item.user_avatar_46" class="avatar" alt="">
                <div class="cont f18">
               		<div class="time f15">{{item.end_time | formatTime}}</div>
                  <span class="author f15">{{item.user_name}}</span><br>
                  {{item.subj_result.content}}<br>
                  <v-touch :id="'pic' + item.problem_result_id" tag="img" :src="item.subj_result.pics[0].thumb" class="pic" alt="" v-on:tap="showBigpic(item.subj_result.pics[0].pic, item.problem_result_id)"></v-touch>
                </div>
              </div>
              <div class="action-box f14">
                
              	<v-touch  class="gray" v-on:tap="postSubjective(item.problem_result_id)">
                  <i class="iconfont icon-ykq_dafen f20" style="color: #639EF4;"></i>
                  打分
                </v-touch>
                <div class="action f14">

                  <v-touch  class="gray" v-on:tap="postSubjective(item.problem_result_id)">
                    <i class="iconfont icon-shiti_touping f24" style="color: #639EF4;"></i>
                    <span>投屏</span>
                  </v-touch>
                </div>
              </div>
            </div>
            <div class="gap"></div>
          </div>
				</div>
	    </section>
	    
	  </div>

	  <div class="button-box f18">
      <v-touch class="btn f18" v-on:tap="closeProblemSubjective" >返回</v-touch>
    </div>
		
	</div>
</template>

<script>
	import request from '@/util/request'
  import API from '@/config/api'
  import Moment from 'moment'

  let BIG_NUMBER = 10000000000000000000
  let FENYE_COUNT = 10

	export default {
	  name: 'RcMaskProblemresultSubjective',
	  props: ['lessonid', 'pptData', 'current', 'socket', 'postingSubjectiveid', 'problemDurationLeft'],
	  data () {
	    return {
	    	subjectiveList: [],            // 试题的红包名单列表页面隐藏
	    }
	  },
	  computed: {
	    problemid: function () {
	      return this.pptData[this.current - 1].Problem.ProblemID
	    }
	  },
	  created(){
	  	this.refreshSubjectivelist()
	  },
	  filters: {
      formatTime(time) {
        return Moment(time).format('hh:mm')
      }
    },
	  methods: {
	  	/**
	     * 模仿微信小程序的 setData 用法，简易设置data
	     *
	     * @param {object} newData
	     */
	    setData (newData) {
	      let self = this
	      Object.keys(newData).forEach(attr => {
	        self[attr] = newData[attr]
	      })
	    },
	  	/**
	     * 关闭试题主观题页面的按钮
	     * 涉及设置父组件 data，所以传递事件给父组件
	     *
	     * @event bindtap
	     */
	    closeProblemSubjective () {
	    	this.$emit('closeProblemSubjective')
	    },
	    /**
       * 更新试题详情的数据
       * 点击打开详情时要主动更新一下数据，所以把本方法放在本父组件中
       *
       */
      refreshSubjectivelist(){
        let self = this
        let url = API.subjective_problem_result_list

        // 单次刷新
        request.get(url, {
          'start': BIG_NUMBER,
          'count': BIG_NUMBER,
          'problem_id': 123,
          'lesson_id': self.lessonid,
          'direction': 0
        }).then(jsonData => {
            console.log('主观题列表', jsonData)
            self.subjectiveList = jsonData.data.problem_results_list
          })
      },
	    /**
	     * 试题主观题页面页面中的 投屏 按钮
	     *
	     * @event bindtap
	     * @params {string} id 将要投屏的主观题的id
	     */
	    postSubjective (id) {
	      let self = this

	      let str = JSON.stringify({
	        'op': 'showsproblem',
	        'lessonid': self.lessonid,
	        'spid': id,
	        'msgid': 1234
	      })

	      self.socket.send(str)
	    },
	    
	  }
	}
</script>

<style lang="scss" scoped>
	@import "~@/style/_variables";
	.problem-root {
		height: 100%;
		overflow: auto;
	}
	.problemresult-box {
	  position: relative;
	  height: 100%;
	  color: $white;
	  background: #000000;
		
		.close-box {
			position: absolute;
	  	right: 0.386667rem;
	  	top: 0.44rem;
	  	width: 1.066667rem;
	  	height: 1.066667rem;
		}
		
		/* 上部 */
	  .upper {
	  	margin: 0 auto;
	  	width: 8.8rem;
	  	height: 4.0rem;
	  	padding-top: 0.8rem;
	  	border-bottom: 1px solid #cccccc;
	  	text-align: center;
			
			.jishi {
				margin-top: -0.186667rem;
				width: 0.9rem;
				vertical-align: middle;
			}
			.yjy {
				padding-top: 0.5rem;
			}
	  }

	  .gap {
      height: 0.026667rem;
    }
		
		/* 主观题内容区 */
	  .subjective-box {
	  	.hmy {
        margin-top: 2.893333rem;
      }

      .subjective-list {
      	color: #4A4A4A;

      	padding-bottom: 1.8rem;
	      -webkit-overflow-scrolling: touch;
	      
	      .item {
	        padding: 0 0.4rem;
	        background: $white;

	        .detail {
	          display: flex;
	          margin-bottom: 0.346667rem;
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

	            .time {
	            	float: right;
		            color: #9B9B9B;
		          }

	            .author {
	            	display: inline-block;
	            	margin-bottom: 0.2rem;
	              color: #4975B5;
	            }

	            .pic {
	            	margin-top: 0.266667rem;
	              max-width: 7.573333rem;
	              max-height: 7.04rem;
	            }
	          }
	        }

	        .action-box {
	          display: flex;
	          justify-content: space-between;
	          align-items: center;
	          height: 1rem;
	          margin-left: 1.386667rem;
	          
	          .gray {
	            color: #9B9B9B;
	          }

	          .action {
	            display: flex;
	            align-items: center;
	            justify-content: space-between;
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
	  }
	}

	.button-box {
    display: flex;
    position: fixed;
    z-index: 30;
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
</style>

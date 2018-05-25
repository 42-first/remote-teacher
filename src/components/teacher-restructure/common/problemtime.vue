<!--发题选择时间面板 被父组件 home.vue 引用-->
<template>
	<div class="rc-mask">
		<template v-if="problemType !== 'ShortAnswer'">
			<section class="mask-content problemtime-box">
	      <div class="block" style="margin-bottom: 0.133333rem;">
	      	<div class="title f16">{{isYanshi ? $t('qxzycsx')/* '请选择延长时限' */ : $t('timelimit')/* '限时发送' */}}</div>
	      	<div class="btn-box">
	      		<v-touch class="btn normal_btn" v-on:tap="chooseProblemDuration(30)">30{{ $t('sec') }}</v-touch>
	      		<v-touch class="btn normal_btn" v-on:tap="chooseProblemDuration(60)">1{{ $t('min') }}</v-touch>
	      		<v-touch class="btn normal_btn" v-on:tap="chooseProblemDuration(120)">2{{ $t('min') }}</v-touch>
	      		<v-touch class="btn normal_btn" v-on:tap="chooseProblemDuration(180)">3{{ $t('min') }}</v-touch>
	      		<v-touch class="btn normal_btn" v-on:tap="chooseProblemDuration(240)">4{{ $t('min') }}</v-touch>
	      		<v-touch class="btn normal_btn" v-on:tap="chooseProblemDuration(300)">5{{ $t('min') }}</v-touch>
	      	</div>
	      </div>

	      <div class="block">
	      	<div class="title f16" v-show="!isYanshi">{{$t('notimelimit')}}<!-- 不限时发送 --></div>
	      	<v-touch class="btn higher_btn" v-on:tap="chooseProblemDuration(-1)">{{isYanshi ? $t('notimelimit')/*'不限时'*/ : $t('senddirectly')/*'直接发送'*/}}</v-touch>
	      </div>
	    </section>
		</template>
		<template v-else>
			<section class="mask-content problemtime-box shortanswer-mask">
				<div class="tab-box" v-show="!isYanshi">
	        <v-touch :class="['tab','f20', activeTab == 1 ? 'active' : '']" v-on:tap="toggleTab(1)">个人作答</v-touch>
	        <v-touch :class="['tab','f20', activeTab == 2 ? 'active' : '']" v-on:tap="toggleTab(2)">小组作答</v-touch>
	      </div>
	      <div class="teams-info" v-if="activeTab == 2">
	        <template v-if="teams.length">
	          <v-touch class="choose-team" v-on:tap="handlepicker">
	            <p class="team-name f18">{{teams[selectIndex].value}}</p>
	            <i class="iconfont icon-dakai f20"></i>
	          </v-touch>
	          <v-touch class="create-team f17" v-on:tap="handleCreatGroup">创建分组</v-touch>
	        </template>
	        <template v-else>
	          <v-touch class="create-team noteams f17" v-on:tap="handleCreatGroup">创建分组</v-touch>
	          <p class="f15">暂无分组，可将学生分组以小组形式作答</p>
	        </template>
	      </div>
	      <div class="block" :class="{'personal': activeTab == 1 || isYanshi, 'hasteams': activeTab == 2 && !isYanshi}">
					<div class="msg f17">发送时间</div>
	      	<div class="btn-box f17">
						<v-touch class="btn normal_btn" v-on:tap="chooseProblemDuration(60)">1{{ $t('min') }}</v-touch>
	      		<v-touch class="btn normal_btn" v-on:tap="chooseProblemDuration(180)">3{{ $t('min') }}</v-touch>
	      		<v-touch class="btn normal_btn" v-on:tap="chooseProblemDuration(300)">5{{ $t('min') }}</v-touch>
	      		<v-touch class="btn normal_btn" v-on:tap="chooseProblemDuration(600)">10{{ $t('min') }}</v-touch>
	      		<v-touch class="btn normal_btn" v-on:tap="chooseProblemDuration(900)">15{{ $t('min') }}</v-touch>
	      		<v-touch class="btn normal_btn" v-on:tap="chooseProblemDuration(1200)">20{{ $t('min') }}</v-touch>
	      	</div>
	        <v-touch class="btn higher_btn f17" v-on:tap="chooseProblemDuration(-1)">不限时发送</v-touch>
	      </div>
	    </section>
		</template>
    <v-touch class="btn cancel_btn higher_btn" v-on:tap="cancelPublishProblem"></v-touch>
		<section class="picker-box" v-show="showPicker && teams.length">
			<template >
				<div class="picker-bar">
					<v-touch class="picker-btn f16 picker-cancel" v-on:tap="handlepickerclosed">取消</v-touch>
	        <span class="picker-title f14">选择分组</span>
	        <v-touch class="picker-btn f16 picker-confirm" v-on:tap="handlepickerConfirm">确定</v-touch>
				</div>
	      <mt-picker :slots="slots" value-key="value" :item-height="height" @change="onValuesChange"></mt-picker>
			</template>
    </section>
  </div>
</template>

<script>
	import 'mint-ui/lib/picker/style.css'
	import Vue from 'vue'
	import API from '@/pages/teacher/config/api'
	import request from '@/util/request'
	import { Picker } from 'mint-ui';
	import {mapGetters} from 'vuex'

	Vue.component(Picker.name, Picker);
	export default {
	  name: 'Problemtime',
	  props: ['problemType', 'isYanshi'],
	  data () {
	    return {
				activeTab: 1,
        teams: [],
        slots: [{
          values: [{}],
        }],
        showPicker: false,
        height: 30,
        selectTeam: 0,
        team: null,
				index: 0,
				selectIndex: 0,
	    }
	  },
		computed: {
			...mapGetters([
	    	'classroomid',
        'lessonid',
      ])
		},
	  created(){
			this.height = this.height * window.dpr || 70;

	  },
		mounted() {
			this.getGroupList();
		},
	  methods: {
			/**
	     * 获取分组列表
	     *
	     *
	     */
	    getGroupList() {
				let self = this
	      let url = API.get_classroom_group_list

	      return request.get(url,{'classroom_id': self.classroomid})
	        .then(jsonData => {
	        	this.groups = jsonData.data;
						let group = this.groups;
			      group.map((item, i) => {
			        let obj = {
			          value: item.name,
			          id: item.id,
								index: i
			        }
			        this.teams.push(obj);
			      })
			      this.slots[0]['values'] = this.teams;
						this.selectTeam = this.teams[0].id
	        })
	        .catch(() => {
	        	console.error('获取分组列表失败')
	        })
			},
	  	/**
		   * 取消发题
		   * 涉及设置父组件 data，所以传递事件给父组件
		   *
		   * @event tap
		   */
		  cancelPublishProblem () {
		    this.$emit('cancelPublishProblem')
		  },
		  /**
	     * 点击按钮确认发送试题时间，多个按钮均使用，根据data-duration确定时限
	     * 下一步是发题的复杂操作，涉及定时器、显示柱状图等，所以传递事件给父组件
	     *
	     * @event bindtap
	     * @param {number} duration -1为不限时，以秒为单位，60为一分钟
	     */
	    chooseProblemDuration (duration, groupid = this.selectTeam) {
				if(this.activeTab == 1){
					groupid = 0
				}
	      this.$emit('chooseProblemDuration', duration, groupid)
	    },
			/*
       * 切换作答类型
       */
      toggleTab(tab) {
        this.activeTab = tab;
      },

      /*
       * @method 指定分组回答
       * @params
       */
      onValuesChange(picker, values) {
        let team = values[0].id;
				let index = values[0].index;

        this.team = team;
				this.index = index;
      },
      /*
       * @method picker操作
       * @params
       */
      handlepicker() {
        this.showPicker = true;
      },
      handlepickerclosed() {
        this.showPicker = false;
      },
      handlepickerConfirm() {
        this.selectTeam = this.team;
				this.selectIndex = this.index;
        this.handlepickerclosed();
      },

      /*
       * 创建分组
       */
       handleCreatGroup() {
         let self = this;
         location.href = '/team/teacher/' + self.classroomid + '?lessonid=' + self.lessonid;
       }
	  }
	}
</script>

<style lang="scss" scoped>
	@import "~@/style/_variables";
	/*发题蒙版*/
	.problemtime-box {
		transform: translate(-50%, -70%);
	  width: 7.733333rem;

	  .title {
	  	height: 1.04rem;
	  	text-align: left;
	  }
	  .btn-box {
	  	display: flex;
	  	flex-wrap: wrap;
	  	justify-content: space-between;

	  	.btn {
	  		width: 2.4rem;
	  		margin-bottom: 0.666667rem;
	  	}
	  }
	}
	.normal_btn {
		height: 1.106667rem;
		line-height: 1.106667rem;
	}
	.higher_btn {
		height: 1.173333rem;
		line-height: 1.173333rem;
	}
	.cancel_btn {
		position: absolute;
		left: 50%;
		bottom: 1.04rem;
		transform: translateX(-50%);
		width: .72rem;
    height: .72rem;
    background: url(~images/teacher/cancel.png)no-repeat 0 0/contain;
	}

	.rc-mask .shortanswer-mask {
		top: 0;
		transform: translateX(-50%);
	}
	.shortanswer-mask {
		.tab-box {
      margin: 1.053333rem auto 0;
			width: 6.533333rem;
      height: 1.013333rem;
      border: 1px solid #5096F5;
      display: flex;
      justify-content: space-around;
      align-items: center;
      border-radius: .466667rem;
      position: relative;
      padding: .066667rem .08rem;

      &::before {
        content: "";
        position: absolute;
        width: 6.386667rem;
        height: .88rem;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(80,150,245,.3);
        border-radius: .44rem;
      }

      .tab {
        width: 50%;
        height: 100%;
        color: #fff;
        z-index: 66;
      }
      .active {
        background: #5096F5;
        border-radius: .44rem;
      }
    }

		.teams-info {
      width: 7.733333rem;
      margin: 1.493333rem auto 0;

      .choose-team {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-bottom: .24rem;
        border-bottom: 1px solid #fff;

        .team-name, .iconfont {
          color: #fff;
        }
      }

      .create-team {
        color: #5096F5;
        position: relative;
        display: inline-block;
        line-height: 1;
        font-weight: bold;
        margin-top: .533333rem;

        &::after {
          content: "";
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: .053333rem;
          background: #5096F5;
        }
      }

      .noteams {
        margin-top: -.133333rem;
      }

      p {
        color: #aaa;
        margin-top: .4rem;
      }
    }

    .personal {
      top: 5.84rem;
    }

    .hasteams {
      top: 6.746667rem;
    }


   .block {
      position: absolute;

      .msg {
        color: #fff;
        margin-bottom: .533333rem;
      }

      .btn-box {
  	  	display: flex;
  	  	flex-wrap: wrap;
  	  	justify-content: space-between;

  	  	.btn {
  	  		width: 2.4rem;
  	  		margin-bottom: .4rem;
          background: #5096F5;
          color: #fff;
          border-radius: .106667rem;
          height: 1.173333rem;
      		line-height: 1.173333rem;
  	  	}
  	  }

      .higher_btn {
    		background: #5096F5;
        height: 1.173333rem;
        line-height: 1.173333rem;
        color: #fff;
        border-radius: .106667rem;
    	}
    }

	}

	.cancel_btn {
		position: absolute;
		left: 50%;
		bottom: 1.04rem;
		transform: translateX(-50%);
		width: .72rem;
    height: .72rem;
    background: url(~images/teacher/cancel.png)no-repeat 0 0/contain;
	}
	.picker-box {
		width: 100%;
    height: 6.266667rem;
    position: fixed;
    left: 0;
    bottom: 0;
		z-index: 9999;

		.picker-bar {
	    height: 1.2rem;
	    background: #F8F8F8;
	    display: flex;
	    justify-content: space-between;
	    padding: 0 .533333rem;
	    align-items: center;
			z-index: 9999;
	  }

	  .picker-cancel {
	    color: #666;
	  }

	  .picker-confirm {
	    color: #639EF4;
	  }

	  .picker-title {
	    color: #9b9b9b;
	  }
	}

</style>
<style>
  .picker {
    width: 100%;
    height: 5.066667rem;
    position: fixed;
    left: 0;
    bottom: 0;
    background: #fff;
  }



  .picker-item {
    font-size: .48rem;
  }
</style>

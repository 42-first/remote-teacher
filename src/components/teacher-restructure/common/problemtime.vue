<!--发题选择时间面板 被父组件 home.vue 引用-->
<template>
	<div class="rc-mask">
		<template v-if="problemType !== 'ShortAnswer'">
			<section class="problemtime-box">
	      <div class="block">
	      	<div class="btn-box">
	      		<v-touch class="btn f17" :class="sendTime == 30 && !custom ? 'activeSendTime' : ''" v-on:tap="chooseTime(30)">30{{ $t('sec') }}</v-touch>
	      		<v-touch class="btn f17" :class="sendTime == 60 && !custom ? 'activeSendTime' : ''" v-on:tap="chooseTime(60)">1{{ $t('min') }}</v-touch>
	      		<v-touch class="btn f17" :class="sendTime == 120 && !custom ? 'activeSendTime' : ''" v-on:tap="chooseTime(120)">2{{ $t('min') }}</v-touch>
	      		<v-touch class="btn f17" :class="sendTime == 180 && !custom ? 'activeSendTime' : ''" v-on:tap="chooseTime(180)">3{{ $t('min') }}</v-touch>
	      		<v-touch class="btn f17 big_btn" :class="sendTime == -1 ? 'activeSendTime' : ''" v-on:tap="chooseTime(-1)"><!-- 不限时 -->{{$t('no_time_limit')}}</v-touch>
	      		<v-touch v-if="!custom" class="btn f17 big_btn" v-on:tap="handlePicker2"><!-- 自定义 -->{{$t('user_defined')}}</v-touch>
						<v-touch class="btn f17 big_btn" :class="custom ? 'activeSendTime' : ''" v-else v-on:tap="handlePicker2">{{tempTime}}{{ $t('min') }}<i class="iconfont icon-dakai f20"></i>
						</v-touch>
	      	</div>
	      </div>
	    </section>
		</template>
		<template v-else>
			<section class="problemtime-box shortanswer-mask">
				<div class="tab-box" v-show="!isYanshi">
	        <v-touch :class="['tab','f14', activeTab == 1 ? 'active' : '']" v-on:tap="toggleTab(1)">{{$t('team.answertype_person')}}</v-touch>
	        <v-touch :class="['tab','f14', activeTab == 2 ? 'active' : '']" v-on:tap="toggleTab(2)">{{$t('team.answertype_group')}}</v-touch>
	      </div>
	      <div class="teams-info" v-if="activeTab == 2">
	        <template v-if="teams.length">
	          <v-touch class="choose-team" v-on:tap="handlepicker">
							<p class="f17"><!-- 选择小组 -->{{$t('select_group')}}</p>
	            <p class="team-name f18">{{selectTeam ? teams[selectIndex].value : $t('select')}}<i class="iconfont icon-dakai f20"></i></p>
	          </v-touch>
	        </template>
	        <template v-else>
	          <v-touch class="create-team noteams f17" v-on:tap="handleCreatGroup"><!-- 创建分组 -->{{$t('team.creategroup')}}</v-touch>
	          <p class="f15 noteamtips"><!-- 暂无分组，可将学生分组以小组形式作答 -->{{$t('team.nogroup')}}</p>
	        </template>
	      </div>
	      <div class="block" :class="{'personal': activeTab == 1, 'hasteams': activeTab == 2 && !isYanshi , 'isYanshi': isYanshi}">
	      	<div class="btn-box f17">
						<v-touch class="btn f17" :class="sendTime == 120 && !custom ? 'activeSendTime' : ''" v-on:tap="chooseTime(120)">2{{ $t('min') }}</v-touch>
	      		<v-touch class="btn f17" :class="sendTime == 300 && !custom ? 'activeSendTime' : ''" v-on:tap="chooseTime(300)">5{{ $t('min') }}</v-touch>
	      		<v-touch class="btn f17" :class="sendTime == 600 && !custom ? 'activeSendTime' : ''" v-on:tap="chooseTime(600)">10{{ $t('min') }}</v-touch>
	      		<v-touch class="btn f17" :class="sendTime == 900 && !custom ? 'activeSendTime' : ''" v-on:tap="chooseTime(900)">15{{ $t('min') }}</v-touch>
	      		<v-touch class="btn f17 big_btn" :class="sendTime == -1 ? 'activeSendTime' : ''" v-on:tap="chooseTime(-1)"><!-- 不限时 -->{{$t('no_time_limit')}}</v-touch>
	      		<v-touch v-if="!custom" class="btn f17 big_btn" v-on:tap="handlePicker2"><!-- 自定义 -->{{$t('user_defined')}}</v-touch>
						<v-touch class="btn f17 big_btn" :class="custom ? 'activeSendTime' : ''" v-else v-on:tap="handlePicker2">{{tempTime}}{{ $t('min') }}<i class="iconfont icon-dakai f20"></i>
						</v-touch>
	      	</div>
	      </div>
	    </section>
		</template>
		<v-touch class="btn confirm_btn" :class="{'disabled' : activeTab == 2 && !selectTeam}" v-on:tap="chooseProblemDuration">{{$t('confirm')}}<!-- 确定 --></v-touch>
    <v-touch class="cancel_btn" v-on:tap="cancelPublishProblem"></v-touch>
		<section class="picker__wrapper" v-show="showPicker" >
			<v-touch class="picker_mask" v-on:tap="handlepickerclosed"></v-touch>
			<section class="picker__limit">
				<section>
					<div class="picker__header blueColor">
						<v-touch class="picker-btn f16 picker-cancel" v-on:tap="handleCreatGroup"><!-- 创建分组 -->{{$t('team.creategroup')}}</v-touch>
		        <v-touch class="picker-btn f16 picker-confirm" v-on:tap="handlepickerConfirm">{{$t('confirm')}}<!-- 确定 --></v-touch>
					</div>
					<mt-picker :slots="slots" value-key="value" :item-height="height" @change="onValuesChange"></mt-picker>
				</section>
			</section>
		</section>
		<section class="picker__wrapper" v-show="showPicker2" >
			<section class="picker_mask"></section>
			<section class="picker__limit">
				<section>
					<div class="picker__header">
						<v-touch class="f16" v-on:tap="handlepickerclosed2">{{$t('cancel')}}<!-- 取消 --></v-touch>
						<v-touch class="f16" v-on:tap="handlepickerConfirm2">{{$t('confirm')}}<!-- 确定 --></v-touch>
					</div>
					<mt-picker :slots="slots2" :item-height="height" @change="onValuesChange2"></mt-picker>
				</section>
			</section>
		</section>
  </div>
</template>

<script>
	import 'mint-ui/lib/picker/style.css'
	import 'mint-ui/lib/message-box/style.css'
	import Vue from 'vue'
	import API from '@/pages/teacher/config/api'
	import request from '@/util/request'
	import { Picker } from 'mint-ui';
	import {mapGetters} from 'vuex'
	import MessageBox from 'mint-ui/lib/message-box';

	Vue.$messagebox = Vue.prototype.$messagebox = MessageBox;

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
        height: 35,
        selectTeam: 0,
				sendTime: -1,
				tempTime: 0,
        team: null,
				index: 0,
				selectIndex: 0,
				showPicker2: false,
				slots2: [{
          flex: 1,
          values: ['1', '2', '3', '4', '5', '6', '7', '8', '9','10','11','12','13','14','15','16','17','18','19','20','21', '22', '23', '24', '25', '26', '27', '28', '29','30','31','32','33','34','35','36','37','38','39','40','41', '42', '43', '44', '45', '46', '47', '48', '49','50','51', '52', '53', '54', '55', '56', '57', '58', '59','60'],
          className: 'slot1',
          textAlign: 'right'
        },  {
          flex: 1,
          values: [i18n.locale === 'zh_CN' ? '分钟' : 'min'],
          className: 'slot2',
          textAlign: 'left'
        }],
				custom: false,
				isActive: false
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
	        	self.groups = jsonData.data;
						let group = self.groups;
			      group.map((item, i) => {
							let parttern_inclass = /[1-9]{1,2}月[0-9]{1,2}日课堂分组$/g
							let parttern_offclass = /[1-9]{1,2}月[0-9]{1,2}日课下分组$/g
							let parttern_number = /\d+/g
							let arr = []
							let str = null
							while((str = parttern_number.exec(item.name)) != null)
							arr.push(str[0])

							if(parttern_inclass.test(item.name)){
								item.name = i18n.locale === 'zh_CN' ? item.name : 'In-class Grouping on ' + arr[0] + '.' + arr[1]
							}else if(parttern_offclass.test(item.name)) {
								item.name = i18n.locale === 'zh_CN' ? item.name : 'Off-class Grouping on ' + arr[0] + '.' + arr[1]
							}
			        let obj = {
			          value: item.name,
			          id: item.id,
								index: i,
								active: item.active
			        }
			        self.teams.push(obj);
			      })
			      self.slots[0]['values'] = self.teams;
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
	    chooseProblemDuration () {
				let self = this
				let groupid = this.selectTeam
				if(this.activeTab == 1){
					groupid = 0
				}
				if(this.activeTab == 2 && !groupid){
					return false
				}
				let duration = this.sendTime
	      this.$emit('chooseProblemDuration', duration, groupid)
				setTimeout(function () {
					self.sendTime = -1
					self.custom = false
				}, 500);

	    },
			/*
       * 切换作答类型
       */
      toggleTab(tab) {
        this.activeTab = tab;
				this.sendTime = -1;
				this.custom = false;
      },

      /*
       * @method 指定分组回答
       * @params
       */
      onValuesChange(picker, values) {
        let team = values[0].id;
				let index = values[0].index;
				let active = values[0].active

        this.team = team;
				this.index = index;
				this.isActive = active
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
				if(this.isActive){
					let title =  i18n.locale === 'zh_CN' ? '提示' : 'Notice';
					let message = i18n.locale === 'zh_CN' ? '分组未结束' : 'Unfinished';
					this.$messagebox.alert(message, title)
				}else {
					this.selectTeam = this.team;
					this.selectIndex = this.index;
	        this.handlepickerclosed();
				}
      },

      /*
       * 创建分组
       */
       handleCreatGroup() {
         let self = this;
         location.href = '/team/teacher/' + self.classroomid + '?lessonid=' + self.lessonid;
       },

			 chooseTime(time){
				 this.sendTime = time
				 this.custom = false
			 },
			 handlePicker2(){
				 this.showPicker2 = true
			 },
			 handlepickerclosed2() {
         this.showPicker2 = false;
       },
       handlepickerConfirm2() {
         this.sendTime = +this.tempTime * 60;
				 this.custom = true
         this.handlepickerclosed2();
       },
			 onValuesChange2(picker, values){
				 let limit = values[0];
         console.log(values[0]);

         this.tempTime = limit;
			 }
	  }
	}
</script>

<style lang="scss" scoped>
	@import "~@/style/_variables";
	@import "~@/style/mintui.css";
	/*发题蒙版*/
	.problemtime-box {
		width: 100%;

	  .title {
	  	height: 1.04rem;
	  	text-align: left;
	  }
	  .btn-box {
	  	display: flex;
	  	flex-wrap: wrap;
	  	justify-content: space-between;
			margin: 4.4rem .666667rem 0;
	  }
	}
	.btn {
		width: 1.866667rem;
		height: 1.173333rem;
		line-height: 1.173333rem;
		margin-bottom: .533333rem;
		border-radius: .106667rem;
		border: 1px solid #5096F5;
		background: rgba(80,150,245,.2);
		color: #fff;
	}
	.big_btn {
		width: 4.133333rem;
		.iconfont {
			float: right;
    	margin-right: 30px;
		}
	}
	.activeSendTime {
		background: #639EF4;
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
	.confirm_btn {
		width: 8.666667rem;
		background: #639EF4;
		position: absolute;
		left: 50%;
		transform: translateX(-50%);
		bottom: 3.12rem;
		margin-bottom: 0;
	}
	.disabled {
		background: #9b9b9b;
		border: none;
		color: #666;
		margin-bottom: 0;
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
      border-radius: .506667rem;
      position: relative;
      padding: .08rem .08rem;

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
        height: .88rem;
				line-height: .88rem;
        color: #fff;
        z-index: 66;
				text-align: center;
      }
      .active {
        background: #5096F5;
        border-radius: .44rem;
      }
    }

		.teams-info {
      width: 100%;
      margin: 1.493333rem auto 0;
			text-align: center;

      .choose-team {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0 .666667rem;
				height: 1.44rem;
				border-top: 1px solid rgba(80,150,245,.7);
        border-bottom: 1px solid rgba(80,150,245,.7);
				background: rgba(80,150,245,.2);
				position: relative;

				p {
					padding-right: .533333rem;
					color: #fff;
				}
				.iconfont {
					color: #fff;
					position: absolute;
					top: 50%;
					right: .666667rem;
					transform: translateY(-50%);
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
			.noteamtips {
				margin-top: .4rem;
				color: #aaa;
			}

    }
		.btn-box {
			margin-top: 1.333333rem;
		}

    .personal {
      margin-top: 2.933333rem;
    }

		.isYanshi {
			margin-top: 4.426667rem;
		}

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
	.picker__wrapper {
		position: fixed;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
		.picker_mask {
			position: absolute;
			width: 100%;
			height: 100%;
			background: rgba(0,0,0,.7);
			top: 0;
			left: 0;
			z-index: 999;
		}
	}
	.picker__limit {
		height: 6.266667rem;
		width: 100%;
    position: fixed;
    left: 0;
    bottom: 0;
		z-index: 9999;
		background: #fff;
		.picker__header {
			height: 1.173333rem;
			line-height: 1.173333rem;
			padding: 0 .533333rem;
			background: #f8f8f8;
	    display: flex;
	    justify-content: space-between;
			p {
				color: #333;
			}
		}
		.blueColor {
			color: #5096F5;
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
    background: #fff !important;
		display: flex;
		flex-direction: column;
		justify-content: center;
  }



  .picker-item {
    font-size: .48rem;
  }
</style>

<!-- 全部人员名单 -->
<template>
	<div class="member-box" id="member-box">
    <slot name="ykt-msg"></slot>
    <!-- <div class="desc f18">
      {{ $t('totalstudent') }}<span class="f24">{{participantList.length}}</span> {{ $t('ren') }}
    </div> -->
		<div class="tabbar-wrap">
			<div class="tabbar">
				<v-touch :class="['tab-item', activeTab == 1 ? 'active f20' : 'f17']" v-on:tap="toggleTab(1)">
					<span class="label">{{$t('yiqiandao')}}</span>
					<span class="f14 count">({{participantList.length}})</span>
				</v-touch>
				<v-touch :class="['tab-item ml50', activeTab == 2 ? 'active f20' : 'f17']" v-on:tap="toggleTab(2)">
					<span class="label">{{$t('weiqiandao')}}</span>
					<span class="f14 count">({{notParticipantList.length}})</span>
				</v-touch>
			</div>
			<div class="search" @click="goSearch" v-if="studentCount < 500"><i class="iconfont icon-sousuo f19"></i></div>
		</div>
		<div class="fenhint f12" v-if="has_unscored_subj && activeTab == 1">
			* <!-- 当有主观题未批改时，此排名可能不是最终排名 -->{{ $t('behavior.dyzgtwpgs') }}
		</div>

    <section v-show="activeTab == 1" class="participantList list-wrapper"
			v-infinite-scroll="loadBottom"
			infinite-scroll-disabled="isLoading"
			infinite-scroll-distance="10"
			:class="{ 'list-wrapper-active': activeTab == 1 }"
		>
			<template v-if="participantList.length">
				<!-- <div class="order-box">
					<v-touch class="title f14" v-on:tap="openOrder">
						{{orderType === 1 ? $t('behavior.dfygdd') : (orderType === 2 ? $t('behavior.dfyddg') : (orderType === 3 ? $t('behavior.qdsjpx') : $t('behavior.studentId')))}}
						<div :class="['sanjiao', {'sanjiao-rev': isOrderOpen}]"></div>
					</v-touch>
					<ul class="choose-list" v-show="isOrderOpen">
						<v-touch v-if="has_problems" tag="li" :class="['choose-item f15', {'active': orderType === 1}]" v-on:tap="setOrder(1)">{{ $t('behavior.dfygdd') }}</v-touch>
						<v-touch v-if="has_problems" tag="li" :class="['choose-item f15', {'active': orderType === 2}]" v-on:tap="setOrder(2)">{{ $t('behavior.dfyddg') }}</v-touch>
						<v-touch tag="li" :class="['choose-item f15', {'active': orderType === 3}]" v-on:tap="setOrder(3)">{{ $t('behavior.qdsjpx') }}</v-touch>
						<v-touch tag="li" :class="['choose-item f15', {'active': orderType === 4}]" v-on:tap="setOrder(4)">{{ $t('behavior.studentId') }}</v-touch>
					</ul>
				</div> -->
				<div class="item" v-for="(item, index) in participantList" :key="index" @click="goStudentDetail(item.id)">
					<div class="info-box">
						<div :class="['xuhao']">
							<span :class="[{'star-box': item.index <= 3}, 'star'+ (item.index)]">{{item.index}}</span>
						</div>
						<div class="alignCenter">
							<div class="user">
								<span class="user_name ellipsis-2line f17">{{item.profile.name}}</span>
								<span class="user_schoolnumber f14">{{item.profile.school_number ? item.profile.school_number : $t('weishezhixuehao')}}</span>
							</div>
							<div v-if="has_problems" class="score-box f14" :class="item.index < 3 ? 'orange' : ''">
								<span class='f30'>{{item.score}}</span>{{$t('behavior.points')}}
							</div>
							<div class="time-box f14">
								<template v-if="item.attendance_status == 0"><!-- 未出勤-->{{ $t('behavior.absent')}}</template>
								<template v-else>{{item.time}}</template>
								<i class="iconfont icon-jinrucopy f25"></i>
							</div>
						</div>
					</div>
					<div class="tag-box" v-if="item.behavior_score || (item.behavior_tags && item.behavior_tags.length)">
						<span class="score f12" v-if="item.behavior_score"><!-- +{{item.behavior_score}}分 -->{{$t('behavior.addpoints', {count: item.behavior_score})}}</span>
						<template v-if="item.behavior_tags && item.behavior_tags.length">
							<span class="tag f12" 
							:class="tag.length >= 20 && (idx + 1 < item.behavior_tags.length && item.behavior_tags[idx + 1].length >= 20) ? 'nomargin' : ''" 
							v-for="(tag, idx) in item.behavior_tags" :key="idx">{{tag}}</span>
						</template>
					</div>
	      </div>
				<div class="load-wrapper loading-wrapper" v-if="!signLoaded">{{$t('toploading')}}</div>
				<div class="load-wrapper loaded-wrapper" v-else>—— END ——</div>
			</template>
			<template v-else>
				<div class="empty">
					<img :src="qiandaonodata" alt="没有学生签到">
				</div>
			</template>
    </section>
		<section class="notParticipantList list-wrapper"
			v-infinite-scroll="loadBottom"
			infinite-scroll-disabled="isLoading"
			infinite-scroll-distance="10"
			:class="{ 'list-wrapper-active': activeTab == 2 }"
		>
			<template v-if="notParticipantList.length">
				<div class="item" v-for="(item, index) in notParticipantList" :key="index" @click="goStudentDetail(item.id)">
					<div class="info-box">
						<div class="user">
							<span class="name ellipsis-2line f17">{{item.profile.name}}</span>
							<span class="stuid f14">{{item.profile.school_number ? item.profile.school_number : $t('weishezhixuehao')}}</span>
						</div>
						<div class="time-box f14">
							<template v-if="item.attendance_status == 1"><!-- 已出勤-->{{ $t('behavior.present')}}</template>
							<i class="iconfont icon-jinrucopy f25"></i>
						</div>
						
					</div>
					<div class="tag-box" v-if="item.behavior_score || (item.behavior_tags && item.behavior_tags.length)">
						<span class="score f12" v-if="item.behavior_score"><!-- +{{item.behavior_score}}分 -->{{$t('behavior.addpoints', {count: item.behavior_score})}}</span>
						<template v-if="item.behavior_tags && item.behavior_tags.length">
							<span class="tag f12" 
							:class="tag.length >= 20 && (idx + 1 < item.behavior_tags.length && item.behavior_tags[idx + 1].length >= 20) ? 'nomargin' : ''" v-for="(tag, idx) in item.behavior_tags" 
							:key="idx">{{tag}}</span>
						</template>
					</div>
	      </div>
				<div class="load-wrapper loading-wrapper" v-if="!signNoLoaded">{{$t('toploading')}}</div>
				<div class="load-wrapper loaded-wrapper" v-else>—— END ——</div>
			</template>
			<template v-else>
				<div class="empty">
					<img :src="weqiandaonodata" alt="没有学生未签到">
				</div>
			</template>
		</section>
  </div>
</template>

<script>
  import {mapGetters} from 'vuex'
  import request from '@/util/request'
	import API from '@/pages/teacher/config/api'
	import { InfiniteScroll } from 'mint-ui';
	import Vue from "vue";
	Vue.use(InfiniteScroll);

	var timer = null

  // source代表学生签到的来源  1代表扫码  2代表邀请码   3代表我的课程-正在上课
  export default {
    name: 'Member',
    data () {
      return {
				activeTab: 1, //1 已签到， 2 未签到
				qiandaonodata: require(`images/teacher/qiandao${i18n.t('qiandaoafterfix')}.png`),
				weqiandaonodata: require(`images/teacher/weiqiandao${i18n.t('weiqiandaoafterfix')}.png`),
				has_problems: false,
				isOrderOpen: false,
				orderType: 1,
				has_unscored_subj: false,
				oData: {},
				signLoaded: !1, // 已签到数据是否已经拉取完
				signNoLoaded: !1, // 未签到数据是否已经拉取完
				signedPage: 1,    // 已签到页
				notSignedPage: 1, // 未签到页
				participantList: [], // 签到列表
				notParticipantList: [], // 未签到列表
				isLoading: false,
				studentCount: 0,
				uuidSign: null,
				uuidNotSign: null
      }
    },
    computed: {
      ...mapGetters([
				'lessonid',
				'classroomid'
      ])
		},
		mounted() {
		},
    created () {
			this.studentCount = this.$route.query.count - 0 || 0;
      this.fetchList()
			this.not_participant_list()
    },
    methods: {
      /**
       * 获取签到学生名单
       *
       */
      fetchList (page = 1) {
        let self = this

        let url = API.teaching_lesson_participant_list + '/' + self.lessonid

        if (process.env.NODE_ENV === 'production') {
          url = API.teaching_lesson_participant_list + '/' + self.lessonid
        }

        request.get(url, {
					// sort_type,
					'classroomid': self.classroomid,
					page,
					page_size: 20,
					uuid_code: this.uuidSign
				}).then(jsonData => {
						self.has_problems = jsonData.data.has_problems
						self.has_unscored_subj = jsonData.data.has_unscored_subj
						self.fetchListHandle(jsonData.data);
						self.signedPage = page + 1
						// self.orderType = jsonData.data.has_problems && sort_type == 1 ? 1 : (!jsonData.data.has_problems && sort_type == 1 ? 3 : sort_type)
						// if(sort_type == 1){
						// 	self.oData[1] = jsonData.data.students
						// 	self.oData[1].forEach((item, index) => {
						// 		item.index = index + 1
						// 	})
						// 	self.participantList = self.oData[1]
							
						// }else if(sort_type == 3) {
						// 	this.oData[3] = jsonData.data.students
						// 	self.oData[3].forEach((item, index) => {
						// 		item.index = index + 1
						// 	})
            // 	self.participantList = this.oData[3]
						// }else {
						// 	this.oData[4] = jsonData.data.students
						// 	self.oData[4].forEach((item, index) => {
						// 		item.index = index + 1
						// 	})
            // 	self.participantList = this.oData[4]
						// }
          })
			},
			fetchListHandle(jsonData, type) {
				let list = jsonData.students || [];
				const total = jsonData.total - 0 || 0;
				if (!type) {
					this.participantList = this.participantList.concat(list);
					this.signLoaded = list.length === 0 || this.participantList.length >= total;
					this.uuidSign = jsonData.uuid_code
				} else {
					this.notParticipantList = this.notParticipantList.concat(list);
					this.signNoLoaded = list.length === 0 || this.participantList.length >= total;
					this.uuidNotSign = jsonData.uuid_code
				}
			},

			/**
       * 获取未签到学生名单
       *
       */
      not_participant_list(page = 1) {
        let self = this
        let url = API.lesson_not_participant_list
        if (process.env.NODE_ENV === 'production') {
          url = API.lesson_not_participant_list
        }

        request.get(url,{
					'classroomid': self.classroomid,
					'lesson_id': self.lessonid,
					page,
					page_size: 20,
					uuid_code: this.uuidNotSign
					})
          .then(jsonData => {
						self.fetchListHandle(jsonData.data, 1);
						self.notSignedPage = page+1;
          })
			},
			loadBottom() {
				clearTimeout(timer);
				timer = setTimeout(() => {

					if (this.activeTab === 1) {
						!this.signLoaded &&  this.fetchList(this.signedPage)
					} else {
						!this.signNoLoaded && this.not_participant_list(this.notSignedPage)
					}

				}, 500)
			},
			/**
       * 切换签到状态
       *
       */

      toggleTab(type) {
        let self = this
        if (type != self.activeTab) {
					self.activeTab = type;
				}
			},
			/**  
			 * 
			*/
			setOrder(orderType){
				let self = this
				if (orderType === 3) {
					let data3 = this.oData[3]
					data3 ? (this.participantList = data3) : this.fetchList(3)
				} else if(orderType !== 4){
					orderType === 1 && (this.participantList = this.oData[1])
					orderType === 2 && (this.participantList = this.oData[1].filter(() => true).reverse())
				}else {
					let data4 = this.oData[4]
					data4 ? (this.participantList = data4) : this.fetchList(4)
				}

				this.orderType = orderType
				setTimeout(() => {
					self.isOrderOpen = false
				}, 100)

				
			},
			openOrder(){
				// if(!this.has_problems) return false
				this.isOrderOpen = !this.isOrderOpen
			},
			goStudentDetail(userid){
				this.$router.push({
					name: 'stuexpression',
					params: {
						'classroomid': this.classroomid,
						'lessonid': this.lessonid,
						'userid': userid
					}
				})
			},
			goSearch(){
				this.$router.push({
					name: 'search',
					params: {
						'classroomid': this.classroomid,
						'lessonid': this.lessonid
					}
				})
      }

		}
  }
</script>

<style lang="scss" scoped>
  @import "~@/style/_variables";
	@import "~@/style/common_rem";
  .member-box {
    position: relative;
    height: 100%;
		overflow: hidden;
    background: $white;
    color: #4A4A4A;
		padding-top: px2rem(100px);
		.tabbar-wrap {
			position: fixed;
			top: 0;
			left: 0;
			z-index: 666;
      height: 1.33333333rem;
      background: $white;
      width: 100%;
      display: flex;
      justify-content: space-between;
			align-items: center;
			border-bottom: 0.02666667rem solid #eee;
			padding: 0 0.53333333rem;
			.tabbar {
				display: flex;
				align-items: center;
				height: 100%;
				.tab-item {
					height: 100%;
					line-height: 1.2rem;
					color: #666;
					display: flex;
					.label {
						position: relative;
						height: 100%;
					}
					span.count {
						margin-left: .133333rem;
						color: #9b9b9b;
					}
					&.ml50 {
						margin-left: 0.66666667rem;
					}
					&.active {
						.count {
							font-weight: normal;
						}
						.label {
							color: #333;
							font-weight: bold;
							&::after {
								position: absolute;
								content: "";
								bottom: 0;
								left: 0;
								width: 100%;
								height: 0.05333333rem;
								background: #4F95F5;
							}				
						}
						
					} 
					
				}
			} 
		}

    .gap {
      height: .133333rem;
      background: #F6F7F8;
    }
		.fenhint {
			width: 100%;
			height: 0.8rem;
			line-height: .8rem;
			background: #FCF9DC;
			padding: 0 0.53333333rem;
			color: #9B9B9B;
		}
		.list-wrapper{
			height: 100%;
			width: 100%;
			box-sizing: border-box;
			overflow-x: hidden;
			overflow-y: auto;
			-webkit-overflow-scrolling: touch;
			background-color: #fff;
			position: relative;
			z-index: 0;
		}
		.list-wrapper-active{
			z-index: 1;
		}
    .participantList {
      padding: 0 0.4rem px2rem(60px) 0;
			.order-box {
				position: relative;
				margin: 0.37333333rem 0.4rem 0.26666667rem;
				align-self: center;
				.title {
					position: relative;
					color: #5096F5;
					display: flex;
					align-items: center;
					.sanjiao {
						margin-left: 0.13333333rem;
						border: 0.10666667rem solid #5096F5;
						border-color: #5096F5 transparent transparent transparent;
						transform: translateY(25%);
					}
					.sanjiao-rev {
						transform: rotate(180deg) translateY(25%);
					}
				}

				.choose-list {
					position: absolute;
					left: 0;
					top: 0.84rem;
					z-index: 50;
					min-width: 3.46666667rem;
					background: #FFFFFF;
					border-radius: 0.05333333rem;
					box-shadow: 0 0.02666667rem 0.16rem rgba(0,0,0, 0.1);
					&::before, &::after {
						position: absolute;
						top: -0.4rem;
						left: 2.29333333rem;
						content: "";
						border: 0.2rem solid #fff;
						border-color: transparent transparent rgba(0,0,0,.05)  transparent;
					}
					&::after {
						position: absolute;
						top: -0.38666667rem;
						left: 2.29333333rem;
						content: "";
						border: 0.2rem solid #fff;
						border-color: transparent transparent #fff transparent;
					}

					.choose-item {
						line-height: 1.2rem;
						text-align: center;
						border-bottom: 1px solid #EEEEEE;
						padding: 0 0.4rem;
						&:last-child {
							border-bottom: none;
						}
					}

					.active {
						color: #5096F5;
					}
				}
			}

      .item {
				padding: 0.4rem 0;
				position: relative;

				&::after {
					position: absolute;
					content: "";
					width: 8.93333333rem;
					height: 0.026667rem;
					background: #e5e5e5;
					bottom: 0;
					right: -.4rem;
				}
				.info-box {
					display: flex;
        	align-items: flex-start;
				}

				.xuhao {
					width: 1.06666667rem;
					line-height: 0.56rem;
					color: #9b9b9b;
					text-align: center;
					.star-box {
						display: block;
						margin: 0 auto;
            width: 0.56rem;
            color: #FFFFFF;
          }

          .star1 {
            background: url("~images/teacher/star1.png") 0 0 no-repeat;
            background-size: 100%;
          }

          .star2 {
            background: url("~images/teacher/star2.png") 0 0 no-repeat;
            background-size: 100%;
          }

          .star3 {
            background: url("~images/teacher/star3.png") 0 0 no-repeat;
            background-size: 100%;
          }
				}
				.alignCenter {
					display: flex;
					align-items: center;
					flex: 1;
					justify-content: space-between;
					.user {
						display: flex;
						flex-direction: column;
						.user_name {
							color: #333;
							width: 4rem;
							font-weight: bold;
							line-height: 0.56rem;
						}
						.user_schoolnumber {
							color: #666;
							width: 4rem;
							overflow: hidden;
							text-overflow: ellipsis;
							white-space: nowrap;
							margin-top: 0.26666667rem;
							line-height: 0.53333333rem;
						}
					}
					.score-box {
						display: flex;
    				align-items: center;
						color: #639EF4;
						&.orange {
							color: #FEA300;
						}
						span {
							margin-right: 0.24rem;
						}
					}
					.time-box {
						color: #9b9b9b;
						display: flex;
    				align-items: center;
					}
				}

        .hide {
          display: none;
				}
				.tag-box {
					display: flex;
					flex-wrap: wrap;
					margin-left: 1.06666667rem;
					max-height: 1.92rem;
					overflow: hidden;
					span {
						padding: 0.13333333rem 0.26666667rem;
						height: 0.69333333rem;
						line-height: 0.42666667rem;
						border-radius: 0.34666667rem;
						color: #FEA300;
						border: 1px solid rgba(254,163,0,.5);
						margin-top: 0.26666667rem;
						box-sizing: border-box;
						max-width: 100%;
						overflow: hidden;

						&:not(:last-of-type){
							margin-right: 0.26666667rem;
						}
						&.score {
							border-color: rgba(248,79,65,.5);
							color: #F84F41;
						}
						&.nomargin {
							margin-right: 0;
						}
					}
				}
      }

			.empty img {
				display: block;
				margin: 3.973333rem auto 0;
				width: 6.826667rem;
			}
    }
		.notParticipantList {
			padding: 0 0.4rem px2rem(60px);
			.item {
				padding: 0.4rem 0;
				position: relative;
				&::after {
					position: absolute;
					content: "";
					width: 100%;
					height: .026667rem;
					background: #e5e5e5;
					bottom: 0;
					right: 0;
				}
				.info-box {
					display: flex;
					align-items: center;
					justify-content: space-between;
				}
				.user {
					display: flex;
					flex-direction: column;
					span:first-child {
						width: 4rem;
						color: #333;
						font-weight: bold;
						line-height: .56rem;
						text-align: left;
					}

					span:last-child {
						margin-top: 0.28rem;
						color: #666;
						line-height: 0.533333rem;
						max-width: 4rem;
						overflow: hidden;
						white-space: nowrap;
						text-overflow: ellipsis;
					}
				}
				.time-box {
					color: #9b9b9b;
					display: flex;
					align-items: center;
				}
				
				.iconfont {
					color: #9b9b9b;
				}
				.tag-box {
					display: flex;
					flex-wrap: wrap;
					max-height: 1.92rem;
					overflow: hidden;
					span {
						padding: 0.13333333rem 0.26666667rem;
						height: 0.69333333rem;
						line-height: 0.42666667rem;
						border-radius: 0.34666667rem;
						color: #FEA300;
						border: 1px solid rgba(254,163,0,.5);
						margin-top: 0.26666667rem;
						box-sizing: border-box;
						&:not(:last-of-type){
							margin-right: 0.26666667rem;
						}
						&.score {
							border-color: #F84F41;
							color: #F84F41;
						}
						&.nomargin {
							margin-right: 0;
						}
					}
				}
			}
			.ellipsis-2line {
				overflow : hidden;
				text-overflow: ellipsis;
				display: -webkit-box;
				-webkit-line-clamp: 2;
				-webkit-box-orient: vertical;
				word-break: break-all;
			}
			.empty img {
				display: block;
				margin: 3.973333rem auto 0;
				width: 6.826667rem;
			}
		}
		.load-wrapper{
			height: px2rem(80px);
			line-height: px2rem(80px);
			font-size: px2rem(24px);
			color: #c8c8c8;
			text-align: center;
			position: relative;
		}
		@media screen and (max-width: 720px) and (-webkit-min-device-pixel-ratio: 2) {

			[data-dpr="2"] .f12 {
				font-size: 20px;
			}
		}
  }
</style>

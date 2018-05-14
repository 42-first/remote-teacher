<!-- 全部人员名单 -->
<template>
	<div class="member-box">
    <slot name="ykt-msg"></slot>
    <!-- <div class="desc f18">
      {{ $t('totalstudent') }}<span class="f24">{{participantList.length}}</span> {{ $t('ren') }}
    </div> -->
		<div class="tabbar">
			<v-touch :class="['tab-item f16', activeTab == 1 ? 'active' : '']" v-on:tap="toggleTab(1)">
				{{$t('yiqiandao')}}
				<span class="f12">({{participantList.length}})</span>
			</v-touch>
			<v-touch :class="['tab-item f16', activeTab == 2 ? 'active' : '']" v-on:tap="toggleTab(2)">
				{{$t('weiqiandao')}}
				<span class="f12">({{notParticipantList.length}})</span>
			</v-touch>
		</div>
    <div class="gap"></div>
    <section v-show="activeTab == 1" class="participantList">
			<template v-if="participantList.length">
				<div class="item" v-for="(item,index) in participantList" :key="item.id">
					<div class="number f15">{{index + 1}}</div>
	        <div class="info">
						<div class="info-item">
							<span class="name f15">{{item.profile.name}}</span>
							<span class="time f14">{{item.time}}</span>
						</div>
						<div class="info-item f14">
							<span class="stuid ellipsis">{{item.profile.school_number ? item.profile.school_number : '未设置学号'}}</span>
							<span class="ganbei" v-show="item.source === 1"><!-- 扫二维码 -->{{ $t('scancode') }}</span>
		          <span class="ganbei" v-show="item.source === 2"><!-- 课堂暗号 -->{{ $t('classsignal') }}</span>
		          <span class="ganbei" v-show="item.source === 3"><!-- 微信公众号 -->{{ $t('Officalaccount') }}</span>
		          <span class="ganbei" v-show="item.source === 4"><!-- 微信小程序 -->{{ $t('miniprogram') }}</span>
						</div>
	        </div>
	      </div>
			</template>
			<template v-else>
				<div class="empty">
					<img :src="qiandaonodata" alt="没有学生签到">
				</div>
			</template>
    </section>
		<section v-show="activeTab == 2" class="notParticipantList">
			<template v-if="notParticipantList.length">
				<div class="item" v-for="item in notParticipantList" :key="item.id">
					<span class="name ellipsis f15">{{item.profile.name}}</span>
					<span class="stuid f14">{{item.profile.school_number ? item.profile.school_number : '未设置学号'}}</span>
	      </div>
			</template>
			<template v-else>
				<div class="empty">
					<img :src="weiqiandao" alt="没有学生未签到">
				</div>
			</template>
		</section>
  </div>
</template>

<script>
  import {mapGetters} from 'vuex'
  import request from '@/util/request'
  import API from '@/pages/teacher/config/api'

  // source代表学生签到的来源  1代表扫码  2代表邀请码   3代表我的课程-正在上课
  export default {
    name: 'Member',
    data () {
      return {
				activeTab: 1, //1 已签到， 2 未签到
				qiandaonodata: require(`images/teacher/qiandao${i18n.t('qiandaoafterfix')}.png`),
				weqiandaonodata: require(`images/teacher/weiqiandao${i18n.t('weiqiandaoafterfix')}.png`),
      }
    },
    computed: {
      ...mapGetters([
        'lessonid',
        'participantList',
				'notParticipantList'
      ])
    },
    created () {
      this.fetchList()
			this.not_participant_list()
    },
    methods: {
      /**
       * 获取签到学生名单
       *
       */
      fetchList () {
        let self = this

        let url = API.teaching_lesson_participant_list + '/' + self.lessonid

        if (process.env.NODE_ENV === 'production') {
          url = API.teaching_lesson_participant_list + '/' + self.lessonid
        }

        request.get(url)
          .then(jsonData => {
            self.$store.commit('set_participantList', jsonData.data.students)
          })
      },

			/**
       * 获取未签到学生名单
       *
       */
      not_participant_list () {
        let self = this

        let url = API.lesson_not_participant_list + '?lesson_id=' + self.lessonid

        if (process.env.NODE_ENV === 'production') {
          url = API.lesson_not_participant_list + '?lesson_id=' + self.lessonid
        }

        request.get(url)
          .then(jsonData => {
            self.$store.commit('set_notParticipantList', jsonData.data.students)
          })
      },

			/**
       * 切换签到状态
       *
       */

      toggleTab(type) {
        let self = this
        // console.log(type);
        self.activeTab = type
      }
    }
  }
</script>

<style lang="scss" scoped>
  @import "~@/style/_variables";
  .member-box {
    position: relative;
    min-height: 100%;
    background: $white;
    color: #4A4A4A;
    overflow: auto;

		.tabbar {
			position: relative;
      height: 1.373333rem;
      background: $white;
      width: 100%;
			padding-top: .173333rem;
      display: flex;
      justify-content: space-around;
      align-items: center;

      &::after {
        content: "";
        position: absolute;
        width: 1px;
        height: .32rem;
        top: 50%;
        left: 50%;
        background: #c8c8c8;
        transform: translate(-50%, -50%);
      }

      .tab-item {
        height: 100%;
				line-height: 1.2rem;
        color: #666;
        width: 50%;
				text-align: center;

        span {
          margin-left: .133333rem;
        }
      }

      .active {
        color: #639EF4;
        border-bottom: .04rem solid #639EF4;
      }
		}

    .gap {
      height: .133333rem;
      background: #F6F7F8;
    }

    .participantList {
      padding: 0 .4rem 1.466667rem 0;

      .item {
        display: flex;
        align-items: flex-start;
				padding: .413333rem 0 .386667rem;
				position: relative;

				&::after {
					position: absolute;
					content: "";
					width: 8.8rem;
					height: .026667rem;
					background: #e5e5e5;
					bottom: 0;
					right: -.4rem;
				}

				.number {
					width: 1.306667rem;
					line-height: .56rem;
					color: #9b9b9b;
					text-align: center;
				}
        .info {
          width: 8.293333rem;

					.info-item {
						display: flex;
						justify-content: space-between;

						&:last-child {
							margin-top: .28rem;
						}
						.name {
							width: 3.693333rem;
							color: #333;
							font-weight: bold;
							line-height: .56rem;
						}

						.time, .ganbei {
							color: #9b9b9b;
							line-height: .533333rem;
						}

						.stuid {
							width: 3.693333rem;
							color: #666;
						}
					}

        }

        .hide {
          display: none;
        }
      }

			.empty img {
				display: block;
				margin: 3.973333rem auto 0;
				width: 6.826667rem;
			}
    }

		.notParticipantList {
			padding-left: .533333rem;

			.item {
				padding: .413333rem 0 .426667rem;
				position: relative;

				&::after {
					position: absolute;
					content: "";
					width: 9.466667rem;
					height: .026667rem;
					background: #e5e5e5;
					bottom: 0;
					right: 0;
				}

				span:first-child {
					width: 6.4rem;
					color: #333;
					font-weight: bold;
					line-height: .56rem;
					text-align: left;
				}

				span:last-child {
					display: block;
					margin-top: .28rem;
					color: #666;
					line-height: .533333rem;
				}

			}

			.empty img {
				display: block;
				margin: 3.973333rem auto 0;
				width: 6.826667rem;
			}
		}
  }
</style>

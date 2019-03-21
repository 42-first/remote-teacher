<!-- 搜索列表 -->
<template>
	<section class="search-wrapper">
    <div class="search-header flexbetween">
			<div class="search-box">
				<i class="iconfont icon-sousuo search"></i>
				<input class="f14" type="text" v-model="search" placeholder="输入学生姓名">
				<i class="iconfont icon-guanbi delete" v-if="search" @click="handleDelete"></i>
			</div>
			<span class="cancel f16 color6" @click="goback"><!-- 取消 -->{{$t('cancel')}}</span>
		</div>
		<template v-if="search && searched">
			<template v-if="studentList.length">
				<ul class="studentList">
					<template v-for="item in studentList">
						<li class="item" @click="goDetail(item.id)">
							<div class="user-box flexbetween">
								<div class="user-info">
									<span class="name f15 color3 mb10">
										<template v-for="str in item.profile.nameArr">
											<template v-if="str.name == search"><span class="cblue">{{str.name}}</span></template><template v-else>{{str.name}}</template>
										</template>
									</span>
									<span class="school_number f14 color6">{{item.profile.school_number ? item.profile.school_number : $t('cards.wszxh')}}</span>
								</div>
								<div class="user-score f14 cblue" v-if="item.score" v-html="$t('behavior.points', {count: item.score})">
									<!-- <span class="score font30">{{item.score}}</span>分 -->
								</div>
								<div class="time color-9b">
									<span class="mb10" v-if="item.time">{{item.time}}</span>
									<i class="iconfont icon-dakai f14"></i>
								</div>
							</div>
							<div class="tag-box" v-if="item.behavior_score || (item.behavior_tags && item.behavior_tags.length)">
								<span class="score" v-if="item.behavior_score"><!-- +{{item.behavior_score}}分 -->{{$t('behavior.addpoints', {count: item.behavior_score})}}</span>
								<template v-if="item.behavior_tags && item.behavior_tags.length">
									<template v-for="tag in item.behavior_tags">
										<span class="tag">{{tag}}</span>
									</template>
								</template>
								
								
							</div>
						</li>
					</template>
					
				</ul>
			</template>
			<template v-else>
				<img class="empty" src="http://sfe.ykt.io/o_1cmrpffkeq51bteo4m1p7a1epp9.png" alt="">
				<p class="f17 color-9b textcenter"><!-- 没有符合的学生 -->{{$t('behavior.noeligiblestudents')}}</p>
			</template>
		</template>
  </section>
</template>

<script>
	import {mapGetters} from 'vuex'
  import request from '@/util/request'
  import API from '@/pages/teacher/config/api'
	export default {
	  name: 'search',
	  data () {
	    return {
				lessonid: '',
				classroomid: -1,
				search: '',
				studentList: [],
				searched: false
	    }
	  },
	  computed: {
      
    },
	  created(){
			this.lessonid = this.$route.params.lessonid
			this.classroomid = this.$route.params.classroomid
	  },
	  methods: {
			goDetail(user_id){
				this.$router.push({
					name: 'stuexpression',
					params: {
						'classroomid': this.classroomid,
						'lessonid': this.lessonid,
						'userid': user_id
					}
				})
			},
			handleDelete(){
				this.search = ''
				this.searched = false
				this.studentList = []
			},
			goback(){
				window.history.back();
			},
			getStudentS(){
				let self = this
				let URL = API.behavior_tag.search_classroom_student
				let params = {
					classroom_id: this.classroomid,
					lesson_id: this.lessonid,
					search: this.search
				}
				request.get(URL, params).then((res) => {
					if(res.success){
						res.data.forEach((item,index) => {
							let result = []
							let nameArr = []
							if (item.profile.name.match(/\ud83c[\udf00-\udfff]|\ud83d[\udc00-\ude4f]|\ud83d[\ude80-\udeff]/g) != null){
								nameArr = [...item.profile.name]
							}else {
								nameArr = item.profile.name.split('')
							}
							nameArr.forEach((item, index) => {
								result.push({
									name: item,
									id: index
								})
							})
							item.profile.nameArr = result
						})
						self.studentList = res.data
						self.searched = true
					}
				})
			}	
		},
		watch: {
			search(newVal){
				if(newVal){
					this.getStudentS()
				}
			}
		},
	}
</script>

<style lang="scss" scoped>
	.search-wrapper {
		width: 100%;
		height: 100%;
		background: #fff;
		.flexbetween {
			display: flex;
			align-items: center;
			justify-content: space-between;
		}
		.mb10 {
			margin-bottom: 0.26666667rem;
		}
		.cblue {
			color: #5096F5;
		}
		.search-header {
			width: 100%;
			padding: 0 0.4rem;
			height: 1.30666667rem;
			box-sizing: border-box;
			border-bottom: 1px solid #f8f8f8;
			.search-box {
				position: relative;
				width: 8rem;
				display: flex;
				height: 0.93333333rem;
				input {
					width: 100%;
					height: 100%;
					padding: 0 0.8rem 0 1.2rem;
					background: #f8f8f8;
					border-radius: 0.48rem;
					color: #333;
					border: none;
					outline: none;
				}
				.iconfont {
					position: absolute;
					top: 50%;
					transform: translateY(-50%);
					font-size: 0.42666667rem;
					&.search {
						left: 0.4rem;
						color: #666;
					}
					&.delete {
						right: 0.32rem;
						color: #c8c8c8;
						
					}
				}
			}

		}
		.studentList {
			padding: 0 0.4rem;
			.item {
				padding: 0.4rem 0.13333333rem;
				border-bottom: 1px solid #E5E5E5;
				.user-box {
					div {
						display: flex;
						flex-direction: column;
						align-items: center;
						justify-content: center;
					}
					.user-info {
						align-items: flex-start;
						.name {
							font-weight: bold;
							width: 3.69333333rem;
						}
					}
					.user-score {
						flex-direction: row;
						.score {
							margin-right: 0.34666667rem;
						}
					}
					.time {
						min-width: 0.93333333rem;
						align-items: center;
					}
				}
				.tag-box {
					display: flex;
					flex-wrap: wrap;
					span {
						padding: 0 0.34666667rem;
						height: 0.69333333rem;
						line-height: 0.69333333rem;
						border-radius: 0.34666667rem;
						color: #FEA300;
						border: 1px solid #FEA300;
						margin-top: 0.26666667rem;
						box-sizing: border-box;
						&:not(:last-of-type){
							margin-right: 0.26666667rem;
						}
						&.score {
							border-color: #F84F41;
							color: #F84F41;
						}
					}
				}
			}
		}
		.empty {
			width: 2.93333333rem;
			height: 2.93333333rem;
			margin: 2.66666667rem auto 0.8rem;
			display: block;
		}
		.textcenter {
			text-align: center;
		}
	}
</style>

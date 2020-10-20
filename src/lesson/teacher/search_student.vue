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
						<li class="item" @click="goDetail(item.identityId)">
							<div class="user-box flexbetween">
								<div class="user-info">
									<span class="name f15 color3 mb10">
										<template v-for="str in item.nameArr">
											<template v-if="search.indexOf(str.name) >= 0"><span class="cblue">{{str.name}}</span></template><template v-else>{{str.name}}</template>
										</template>
									</span>
									<span class="school_number f14 color6">{{item.schoolNumber ? item.schoolNumber : $t('weishezhixuehao')}}</span>
								</div>
								<div class="user-score f14 cblue" v-if="item.problemScore">
									<span class='f30'>{{item.problemScore/100}}</span>{{$t('behavior.points')}}
								</div>
								<div class="time color-9b f14">
									<span v-if="item.participate">{{item.participate | formatTime}}</span>
									<i class="iconfont icon-jinrucopy f25"></i>
								</div>
							</div>
							<div class="tag-box" v-if="item.assessScore || (item.assessTags && item.assessTags.length)">
								<span class="score" v-if="item.assessScore"><!-- +{{item.assessScore}}分 -->{{$t('behavior.addpoints', {count: item.assessScore})}}</span>
								<template v-if="item.assessTags && item.assessTags.length">
									<template v-for="tag in item.assessTags">
										<span class="tag">{{tag}}</span>
									</template>
								</template>


							</div>
						</li>
					</template>

				</ul>
			</template>
			<template v-else>
				<img class="empty" src="https://qn-sfe.yuketang.cn/o_1cmrpffkeq51bteo4m1p7a1epp9.png" alt="">
				<p class="f17 color-9b textcenter"><!-- 没有符合的学生 -->{{$t('behavior.noeligiblestudents')}}</p>
			</template>
		</template>
  </section>
</template>

<script>
	import {mapGetters} from 'vuex'
  import request from '@/util/request-v3'
  import API from '@/util/api'
	export default {
	  name: 'search',
	  data () {
	    return {
				search: '',
				studentList: [],
				searched: false
	    }
	  },
	  computed: {
			...mapGetters([
        'lessonid',
        'classroomid'
      ])
    },
	  created(){
		},
		filters: {
			formatTime(time){
				let date = new Date(time)
				let hours = date.getHours() > 9 ? date.getHours() : '0' + date.getHours()
				let mins = date.getMinutes() > 9 ? date.getMinutes() : '0' + date.getMinutes()
				return `${hours}:${mins}`
			}
		},
	  methods: {
			goDetail(user_id){
				this.$router.push({
					name: 'stuexpression_v3',
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
				let URL = API.lesson.search_member
				let params = {
					query: this.search
				}
				return request.get(URL, params).then((res) => {
					if(res && res.code === 0 && res.data){
						res.data.items.forEach((item,index) => {
							let result = []
							let nameArr = []
							if (item.name.match(/\ud83c[\udf00-\udfff]|\ud83d[\udc00-\ude4f]|\ud83d[\ude80-\udeff]/g) != null){
								nameArr = [...item.name]
							}else {
								nameArr = item.name.split('')
							}
							nameArr.forEach((item, index) => {
								result.push({
									name: item,
									id: index
								})
							})
							item.nameArr = result
						})
						self.studentList = res.data.items
						self.searched = true
					}
				})
			}
		},
		watch: {
			search(newVal){
				if(newVal){
					this.getStudentS()
				}else {
					this.studentList = []
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
			border-bottom: 1px solid #eee;
			.search-box {
				position: relative;
				width: 8rem;
				display: flex;
				height: 0.93333333rem;
				background: #eee;
				border-radius: 0.48rem;
				input {
					width: 100%;
					height: 100%;
					padding: 0 0.8rem 0 1.2rem;
					background: transparent;
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
						.school_number {
							width: 3.69333333rem;
							overflow: hidden;
              white-space: nowrap;
              text-overflow: ellipsis;
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
						flex-direction: row;
					}
				}
				.tag-box {
					display: flex;
					flex-wrap: wrap;
					max-height: 1.92rem;
					overflow: hidden;
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

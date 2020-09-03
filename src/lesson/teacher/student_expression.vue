<!-- 学生表现页 -->
<template>
	<section class="expression-wrapper">

    <template v-if="isloaded">
      <div class="banner">
        <div class="round1"></div>
        <div class="round2"></div>
      </div>
      <div class="expression-container">
        <div class="user-box">
          <div class="user-avatar">
            <img :src="user_profile.avatar" alt="">
          </div>
          <p class="user-name f17">{{user_profile.name}}</p>
          <p class="school-number f14">{{user_profile.school_number ? user_profile.school_number : $t('weishezhixuehao')}}</p>
          <div class="participant-box flexbetween">
            <div class="participant-info flexcenter">
              <i class="icon mt-2" :class="checkinDetail.source >= 0 ? 'icon-sign' : 'icon-unsign'"></i>
              <span class="status f14" :class="checkinDetail.source >= 0 ? 'cblue' : 'cred'">{{ checkinDetail.source >= 0 ? $t('yiqiandao') : $t('weiqiandao')}}</span>
              <span class="source f12" v-if="checkinDetail.source >= 0">{{checkinDetail.source_name}} {{checkinDetail.participate | formatTime}}</span>
              <span class="source f12" v-else-if="checkinDetail.source == -2">教师手动修改</span>
            </div>
            <div class="participant-option f12" @click="handleChangeStatus">
              <template v-if="checkinDetail.source >= 0">修改为未签到</template>
              <template v-else>修改为已签到</template>
            </div>
          </div>
          <div class="points-box flexbetween">
            <div class="points flexcenter">
              <i class="icon" :class="behavior_score ? 'icon-points' : 'icon-unpoints'"></i>
              <span class="f14 ml20" :class="behavior_score ? 'cred' : ''">
                <template v-if="behavior_score > 0"><!-- +{{behavior_score}}分 -->{{$t('behavior.addpoints', {count: behavior_score})}}</template>
                <template v-else><!-- 暂无加分 -->{{$t('behavior.nobonuspoint')}}</template>
              </span>
            </div>
            <div class="points-option f12" @click="addScoreFlag = true">
              <!-- 加分 -->{{$t('behavior.bonus')}}
            </div>
          </div>
        </div>
        <div class="tag-box">
          <div class="tag-title flexbetween">
            <span class="f14 flexcenter">
              <i class="iconfont icon-biaoqian1 f20"></i><!-- 标签 -->{{$t('behavior.tag')}}
            </span>
            <span v-if="isEdit" class="save f14" @click="handleSave"><!-- 保存 -->{{$t('behavior.save')}}</span>
            <span v-else class="edit f14" @click="handleEdit"><!-- 编辑标签 -->{{$t('behavior.edittag')}}</span>
          </div>
          <div class="tag-list" v-if="!isEdit">
            <template v-for="(item, index) in tagList">
              <div class="tag-item" :class="item.name.length >= 20 && (index + 1 < tagList.length && tagList[index + 1].name.length >= 20) ? 'nomargin' : ''" @click="handleSelect(index)" :key="item.id">
                <span class="tag-label f12" :class="item.visible ? 'active': ''">{{item.name}}</span>
              </div>
            </template>
            <div class="tag-item" @click="addTagFlag = true">
              <span class="tag-label f12">
                + <!-- 添加标签 -->{{$t('behavior.addtag')}}
              </span>
            </div>
          </div>
          <div class="tag-list" v-else>
            <template v-for="(item, index) in tagList">
              <div class="tag-item" :class="item.name.length >= 20 && (index + 1 < tagList.length && tagList[index + 1].name.length >= 20) ? 'nomargin' : ''" @click="handleDelete(index)" :key="item.id">
                <span class="tag-label f12" :class="item.visible ? 'active': ''">{{item.name}}</span>
                <i class="delete-tag iconfont icon-guanbi f16" v-if="isEdit && !item.default"></i>
              </div>
            </template>
            <div class="tag-item" @click="addTagFlag = true">
              <span class="tag-label f12">
                + <!-- 添加标签 -->{{$t('behavior.addtag')}}
              </span>
            </div>

          </div>
        </div>
        <div class="tips f12"><span class="corange">*</span> <!-- 此备注课下可在课后小结中查看 -->{{$t('behavior.afterclasstips')}}</div>
      </div>
      <section class="add-tag-wrapper" v-if="addTagFlag">
        <div class="edit-box">
          <div class="edit-title flexbetween">
            <i class="iconfont icon-shiti_guanbitouping f16" @click="handleCancel"></i>
            <span class="save f18" @click="handleAddTag"><!-- 保存 -->{{$t('behavior.save')}}</span>
          </div>
          <div class="edit-content">
            <p class="f14"><!-- 添加标签 -->{{$t('behavior.addtag')}}</p>
            <div class="input-box">
              <input class="f17" type="text" maxlength="40" :placeholder="$t('behavior.entercontent')" v-model="tagText" @blur="handleBlur">
            </div>
          </div>
        </div>
      </section>
      <section class="add-score-wrapper" v-if="addScoreFlag">
        <div class="score-box">
          <div class="box-title flexbetween">
            <i class="iconfont icon-shiti_guanbitouping f16" @click="handleHideScore"></i>
            <span class="save f18" @click="handleAddScore"><!-- 保存 -->{{$t('behavior.save')}}</span>
          </div>
          <div class="box-content">
            <div class="add-score">
              <span class="f14 c666"><!-- 课堂总加分 --> {{$t('behavior.thepoints')}}</span>
              <div class="box-center f14">
                <div class="input-box">
                  <input class="f24 c333" type="number" :placeholder="$t('behavior.pleaseenterinteger')"  v-model="behavior_score_temp" pattern="[0-9]*" @blur="handleScoreBlur">
                </div>
                <!-- 分 -->{{$t('behavior.points')}}
              </div>
            </div>
            <div class="score flexcenter f14">
              <span class="score-item" @click="changeScore(1)">+1<!-- 分 -->{{$t('behavior.points')}}</span>
              <span class="score-item" @click="changeScore(2)">+2<!-- 分 -->{{$t('behavior.points')}}</span>
              <span class="score-item" @click="changeScore(5)">+5<!-- 分 -->{{$t('behavior.points')}}</span>
              <span class="score-item" @click="changeScore(10)">+10<!-- 分 -->{{$t('behavior.points')}}</span>
            </div>
          </div>
        </div>
      </section>
    </template>

  </section>
</template>

<script>

  import {mapGetters} from 'vuex'
  import request from '@/util/request-v3'
  import { getLength, substr } from '@/util/util'
  import API from '@/util/api'
	export default {
	  name: 'Expression',
	  data () {
	    return {
        userid: 0,
        isEdit: false,
        selectTag: [],
        addTagFlag: false,
        tagText: '',
        tagList: [],
        tagListTemp: [],
        user_profile: {},
        behavior_score: 0,
        participate: {},
        isloaded: false,
        delete_ids: [],
        attendance_status: -1,
        addScoreFlag: false,
        behavior_score_temp: 0,
        checkinDetail: null
	    }
	  },
	  computed: {
      ...mapGetters([
        'lessonid',
        'classroomid'
      ])
    },
	  created(){
      this.userid = this.$route.params.userid
      this.init()
    },
    mounted() {

    },
    filters: {
      formatTime(time){
        let date = new Date(time)
				let hours = date.getHours() > 9 ? date.getHours() : '0' + date.getHours()
				let mins = date.getMinutes() > 9 ? date.getMinutes() : '0' + date.getMinutes()
				return `${hours}:${mins}`
      }
    },
    watch: {
      tagText(newVal){
        if(newVal && newVal.length > 20) {
           let len = getLength(newVal);
           if(len > 40) {
             this.tagText = substr(newVal, 20);
           }
         }
      },
      behavior_score_temp(newVal){
        if(newVal > 100){
          this.behavior_score_temp = 100
        }
        if(typeof newVal !== 'number'){
          this.behavior_score_temp = +(newVal.replace(/\D/g,''))
        }
      }
    },
	  methods: {
      init(){
        this.$nextTick(() => {
          Promise.all([this.getBehaviorStudent(),this.getCheckinDetail()])
          .then((res) => {
            if(res[0] === 0 && res[1] === 0){
              this.isloaded = true
            }
          })
          
        })
      },
      /**
       * @method 获取签到详情
       */
      getCheckinDetail(){
        let URL = API.lesson.get_checkin_detail
        let params = {
          identityId: this.userid
        }
        return request.get(URL,params)
        .then((res) => {
          if(res && res.code === 0 && res.data){
            let source_name = ''
            switch (res.data.source) {
              case 0:
                source_name = i18n.locale === 'zh_CN' ? '其他' : 'Other'
                break;
              case 1:
              case 21:
                source_name = i18n.locale === 'zh_CN' ? '扫二维码' : 'Scan QR code'
                break;
              case 2:
              case 6:
              case 22:
                source_name = i18n.locale === 'zh_CN' ? '课堂暗号' : 'Class Code'
                break;
              case 3:
              case 4:
              case 5:
              case 7:
              case 8:
              case 23:
              case 24:
                source_name = i18n.locale === 'zh_CN' ? '“正在上课”提示' : 'Class Tip'
                break;
              case 9:
                source_name = i18n.locale === 'zh_CN' ? '转发分享' : 'Share'
                break;
              case 25:
                source_name = i18n.locale === 'zh_CN' ? '教师手动修改' : 'Manual mark'
                break;
            }
            res.data['source_name'] = source_name
            this.checkinDetail = res.data
            return res.code
          }
        }).catch(error => {
          console.log('getCheckinDetail:' + error)
        })
      },
      getBehaviorStudent(){
        let self = this
        let url = API.lesson.student_about
        let params = {
          lesson_id: this.lessonid,
          classroom_id: this.classroomid,
          student_id: this.userid
        }
        return request.get(url, params).then(res => {
          if(res && res.code === 0 && res.data){
            self.user_profile = res.data.user_profile
            self.tagList = res.data.assess_tags
            self.tagListTemp = res.data.assess_tags
            self.behavior_score = res.data.assess_score
            self.behavior_score_temp = res.data.assess_score

            return res.code
          }
        })
      },
      handleSelect(index){
        let tag_ids = []
        this.tagList[index].visible = !this.tagList[index].visible
        let id = this.tagList[index].id
        this.tagList.forEach((item, idx) => {
          if(idx < 3 && index < 3){
            if(item.default && idx !== index){
              item.visible = false
            }
          }
          if(item.visible){
            tag_ids.push(item.id)
          }
        })

        let URL = API.lesson.bind_student
        let params = {
          tag_ids: tag_ids,
          lesson_id: this.lessonid,
          classroom_id: this.classroomid,
          student_id: this.userid
        }
        request.post(URL, params).then(res => {
          if(res && res.code === 0 && res.data){

          }
        })

      },
	  	handleChangeStatus(){
        let self = this
        let URL = ''
        let status = this.checkinDetail.source >= 0
        if(status) {
          URL = API.lesson.cancel_checkin
        }else {
          URL = API.lesson.revise_checkin
        }
        let params = {
          identityId: this.userid
        }
        return request.post(URL,params)
        .then((res) => {
          if(res && res.code === 0 && res.data){
            this.getCheckinDetail()
          }
        })
      },
      handleDelete(index){
        if(this.tagList[index].default) return false;
        this.delete_ids.push(this.tagList[index].id)
        this.tagList.splice(index, 1)
      },
      handleAddTag(){
        let self = this
        let URL = API.lesson.created_tag
        let params = {
          name: this.tagText,
          classroom_id: this.classroomid,
          lesson_id: this.lessonid,
          student_id: this.userid
        }
        let canSubmit = true
        this.tagList.forEach(item => {
          if(item.name === this.tagText){
            canSubmit = false
          }
        })
        if(!canSubmit){
          let msg = i18n.locale === 'zh_CN' ? '已存在相同标签' : 'The same tag already exists'
          T_PUBSUB.publish('ykt-msg-toast', msg);
          return
        }
        request.post(URL, params).then(res => {
          if(res && res.code === 0 && res.data){
            this.tagList.push(res.data)
            setTimeout(() => {
              self.addTagFlag = false
              self.tagText = ''
            },300)
          }
        })
      },
      handleSave(){
        let self = this
        if(!this.delete_ids.length) {
          this.isEdit = false
          return
        }
        let URL = API.lesson.deleted_tag
        let params = {
          tag_ids: this.delete_ids,
          classroom_id: this.classroomid,
          lesson_id: this.lessonid
        }
        request.post(URL, params).then(res => {
          if(res && res.code === 0 && res.data){
            self.delete_ids = []
            self.isEdit = false
            self.tagListTemp = [...self.tagList]
            // alert('删除成功')
          }
        }).catch(err => {
          // alert('删除失败')
          self.isEdit = false
          self.tagList = [...self.tagListTemp]
        })
      },
      handleEdit(){
        if(this.tagList.length == 3){
          let msg = i18n.locale === 'zh_CN' ? '系统标签不可编辑' : 'System Labels are not editable'
          T_PUBSUB.publish('ykt-msg-toast', msg);
        }else {
          this.isEdit = true
        }
      },
      handleBlur(e){
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
        e.preventDefault()
      },
      handleCancel(){
        this.addTagFlag = false
        this.tagText = ''
      },
      changeScore(score){
        this.behavior_score_temp += score
      },
      handleAddScore(){
        let self = this
        let URL = API.lesson.change_score
        let params = {
          lesson_id: this.lessonid,
          classroom_id: this.classroomid,
          student_id: this.userid,
          score: this.behavior_score_temp ? this.behavior_score_temp : 0
        }
        request.post(URL, params).then(res => {
          if(res && res.code === 0 && res.data){
            self.behavior_score = res.data.score
            self.addScoreFlag = false
            self.behavior_score_temp = res.data.score
          }
        })
      },
      handleScoreBlur(){
        setTimeout(() => {
          document.body.scrollIntoView(false)
        },80)
      },
      handleHideScore(){
        this.addScoreFlag = false
        this.behavior_score_temp = this.behavior_score
      }

	  }
	}
</script>

<style lang="scss">
	.expression-wrapper {
    width: 100%;
    height: 100%;
    position: fixed;
    top: 0;
    left: 0;
    z-index: 200;
    overflow: auto;
    background: #fff;
    .banner {
      width: 100%;
      height: 4.76rem;
      border-radius: 1px;
      background: #5096F5;
      position: absolute;
      top: 0;
      left: 0;
      .round1 {
        width: 9.16rem;
        height: 6.48rem;
        border-radius: 50%;
        transform: rotate(-21deg);
        background: #fff;
        opacity: .09;
        position: absolute;
        bottom: 77.00000025px;
        left: -28%;
      }
      .round2 {
        width: 6.38666667rem;
        height: 6.48rem;
        border-radius: 50%;
        background: #fff;
        opacity: .09;
        position: absolute;
        bottom: 77.00000025px;
        left: 50%;
        transform: translateX(-50%);
      }
    }
    .icon {
      width: 0.64rem;
      height: 0.64rem;
      background: url('https://qn-sfe.yuketang.cn/o_1d60d5hgm1cloft113n79jf1nbld.png') no-repeat 0 0/contain;
      &.icon-unsign {
        background-image: url('https://qn-sfe.yuketang.cn/o_1d60d5hgm11umdgl1oga50v1tb8f.png');
      }
      &.icon-points {
        background-image: url('https://qn-sfe.yuketang.cn/o_1d60d5hgmv1mbpq1m7oq051s74c.png');
      }
      &.icon-unpoints {
        background-image: url('https://qn-sfe.yuketang.cn/o_1d60d5hgmhj1ioadg5ea31gp2e.png');
      }
      &.mt-2 {
        margin-top: -0.05333333rem;
      }
    }
    .flexbetween {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .flexcenter {
      display: flex;
      align-items: center;
    }
    .box-center {
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .cred {
      color: #F84F41 !important;
    }
    .cblue {
      color: #5096f5 !important;
    }
    .corange {
      color: #FEA300 !important;
    }
    .expression-container {
      position: relative;
      z-index: 20;
      height: 100%;
      box-sizing: border-box;
      padding: 1.64rem 0.53333333rem 0;
      .user-box {
        width: 100%;
        min-height: 6.04rem;
        padding: 0 0.4rem;
        box-sizing: border-box;
        border-radius: 0.26666667rem;
        background: #fff;
        box-shadow: 0 0.05333333rem 0.26666667rem rgba(0, 0, 0, 0.1);
        position: relative;
        .user-avatar {
          height: 1.10666667rem;
          img {
            position: absolute;
            width: 2rem;
            height: 2rem;
            top: -0.89333333rem;
            left: 50%;
            border-radius: 50%;
            transform: translateX(-50%);
            box-shadow: 0 0.02666667rem 0.18666667rem 0 rgba(80, 150, 245, 0.5);
          }

        }
        .user-name {
          margin-top: 0.4rem;
          text-align: center;
          font-weight: bold;
          color: #333;
          line-height: 0.64rem;
          white-space: nowrap;
          text-overflow: ellipsis;
          overflow: hidden;
        }
        .school-number {
          color: #666;
          text-align: center;
          margin-top: 0.10666667rem;
          line-height: 0.53333333rem;
        }
        .participant-box {
          margin-top: 0.8rem;
          .participant-info {
            flex-wrap: wrap;
            .status {
              margin-left: 0.16rem;
            }
            .source {
              color: #9b9b9b;
              margin-left: 0.26666667rem;
            }
          }
          .participant-option {
            text-align: center;
            min-width: 2.58666667rem;
            box-sizing: border-box;
            height: 0.69333333rem;
            line-height: 0.69333333rem;
            color: #666;
            border-radius: 0.34666667rem;
            border: 1px solid #e5e5e5;
          }
        }
        .points-box {
          margin-top: 0.53333333rem;
          span {
            color: #9b9b9b;
          }
          .reduce {
            color: #08BC72;
          }
          .increase {
            color: #F84F41;
          }
          .cred {
            color: #F84F41;
          }
          .ml20 {
            margin-left: 0.26666667rem;
          }
          .points-option {
            width: 2.58666667rem;
            text-align: center;
            box-sizing: border-box;
            height: 0.69333333rem;
            line-height: 0.69333333rem;
            color: #666;
            border-radius: 0.34666667rem;
            border: 1px solid #e5e5e5;
          }
        }
      }
      .tag-box {
        margin-top: 0.66666667rem;
        min-height: 8rem;
        .tag-title {
          color: #9b9b9b;
          .iconfont {
            margin-right: 0.26666667rem;
          }
          .edit {
            color: #666;
          }
          .save {
            color: #5096F5;
          }
        }
        .tag-list {
          margin: 0.53333333rem 0 0 0.16rem;
          display: flex;
          flex-wrap: wrap;
          .tag-item {
            position: relative;
            margin: 0 0.53333333rem 0.42666667rem 0;
            .delete-tag {
              position: absolute;
              top: -0.13333333rem;
              right: -0.13333333rem;
              color: #666;
            }
            &.nomargin {
							margin-right: 0;
						}
          }
          .tag-label {
            display: block;
            padding: 0 0.34666667rem;
            height: 0.69333333rem;
            line-height: 0.69333333rem;
            color: #9B9B9B;
            border-radius: 0.34666667rem;
            border: 1px solid #EEEEEE;
            white-space: nowrap;
            &.active {
              color: #FEA300;
              border-color: #FEA300;
            }
          }
        }
      }
      .tips {
        color: #9b9b9b;
        text-align: center;
        margin-top: 0.26666667rem;
        padding-bottom: 0.26666667rem;
        white-space: nowrap;
      }
    }
    .add-tag-wrapper {
      position: fixed;
      top: 0;
      left: 0;
      z-index: 50;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,.2);
      .edit-box {
        width: 100%;
        position: absolute;
        bottom: 0;
        left: 0;
        background: #fff;
        .edit-title {
          padding: 0 0.4rem;
          height:  1.33333333rem;
          border-bottom: 1px solid #eee;
          color: #333;
          span {
            color: #5096F5;
            width: 30%;
            text-align: right;
          }
        }
        .edit-content {
          padding: 0.53333333rem 0.4rem 0;
          margin-bottom: 0.8rem;

          p {
            line-height: 1.06666667rem;
            padding-left: 0.13333333rem;
            margin-bottom: 0.4rem;
          }
          .input-box {
            border-bottom: 1px solid #eee;
            margin-left: 0.13333333rem;
            input {
              padding: 0.4rem 0;
              width: 100%;
              border: none;
              outline: none;
            }

          }

        }
      }
    }
    .add-score-wrapper {
      position: fixed;
      top: 0;
      left: 0;
      z-index: 50;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,.5);
      .score-box {
        width: 100%;
        position: absolute;
        bottom: 0;
        left: 0;
        background: #fff;
        .box-title  {
          padding: 0 0.4rem;
          height:  1.33333333rem;
          border-bottom: 1px solid #eee;
          color: #333;
          span {
            color: #5096F5;
            width: 30%;
            text-align: right;
          }
        }
        .box-content {
          padding: 1.06666667rem 0.53333333rem 1.06666667rem;

          .add-score {
            margin-bottom: 0.53333333rem;
            display: flex;
            flex-direction: column;
            justify-content: center;
            span {
              text-align: center;
              margin-right: 0.53333333rem;
            }
            .input-box {
              width: 6.4rem;
              padding: 0.26666667rem 0 0.24rem;
              margin-right: 0.24rem;
              border-bottom: 1px solid #eee;
              input {
                text-align: center;
                width: 100%;
                border: none;
                outline: none;
                &::-webkit-input-placeholder{ /*WebKit browsers*/
                  font-size: 0.48rem;
                }
              }
            }

          }
          .score {
            justify-content: space-around;
          }
          .score-item {
            width: 1.6rem;
            height: 0.85333333rem;
            padding: 0.16rem 0;
            text-align: center;
            border: 1px solid rgba(80,150,245,.5);
            border-radius: 0.42666667rem;
            color: #5096F5;
          }

        }
      }
    }
  }
  @media screen and (max-width: 720px) and (-webkit-min-device-pixel-ratio: 2) {
    [data-dpr="2"] .f14 {
      font-size: 26px;
    }
    [data-dpr="2"] .f12 {
      font-size: 20px;
    }
  }
</style>

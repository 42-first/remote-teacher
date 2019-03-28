<!-- 学生表现页 -->
<template>
	<section class="expression-wrapper">
    <slot name="ykt-msg"></slot>
    <template v-if="isloaded">
      <div class="banner">
        <div class="round1"></div>
        <div class="round2"></div>
      </div>
      <div class="expression-container">
        <div class="user-box">
          <div class="user-avatar">
            <img :src="user_profile.avatar_96" alt="">
          </div>
          <p class="user-name f17">{{user_profile.name}}</p>
          <p class="school-number f14">{{user_profile.school_number ? user_profile.school_number : $t('weishezhixuehao')}}</p>
          <div class="participant-box flexbetween">
            <div class="participant-info flexcenter">
              <i class="icon" :class="participate.has_joined ? 'icon-sign' : 'icon-unsign'"></i>
              <span class="status f14" :class="participate.has_joined ? 'cblue' : 'cred'">{{ participate.has_joined ? $t('yiqiandao') : $t('weiqiandao')}}</span>
              <span class="source f12" v-if="participate.has_joined">{{participate.source_name}}{{participate.time}}</span>
            </div>
            <div class="participant-option f12" @click="handleChangeStatus">
              {{ participate.has_joined ? $t('behavior.changethestate2') : $t('behavior.changethestate1')}}
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
            <div class="points-option flexbetween">
              <span><i class="iconfont icon-jiafenjianhao f14 reduce" :class="!behavior_score ? 'disabled' : ''" @click="handleReduce"></i></span>
              <span><i class="iconfont icon-jiafenjiahao f14 increase" :class="behavior_score == 100 ? 'disabled' : ''" @click="handleIncrease"></i></span>
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
              <div class="tag-item" @click="handleSelect(index)">
                <span class="tag-label" :class="item.is_visible ? 'active': ''">{{item.name}}</span>
              </div>
            </template>
            <span class="tag-label" @click="addTagFlag = true">
              + <!-- 添加标签 -->{{$t('behavior.addtag')}}
            </span>
          </div>
          <div class="tag-list" v-else>
            <template v-for="(item, index) in tagList">
              <div class="tag-item" @click="handleDelete(index)">
                <span class="tag-label" :class="item.is_visible ? 'active': ''">{{item.name}}</span>
                <i class="delete-tag iconfont icon-guanbi f16" v-if="isEdit && !item.is_default"></i>
              </div>
            </template>
            <span class="tag-label" @click="addTagFlag = true">
              + <!-- 添加标签 -->{{$t('behavior.addtag')}}
            </span>
          </div>
        </div>
        <div class="tips f12"><span class="corange">*</span> <!-- 此备注课下可在课后小结中查看 -->{{$t('behavior.afterclasstips')}}</div>
      </div>
      <section class="add-tag-wrapper" v-if="addTagFlag">
        <div class="edit-box">
          <div class="edit-title flexbetween">
            <i class="iconfont icon-shiti_guanbitouping f16" @click="addTagFlag = false"></i>
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
    </template>
    
  </section>
</template>

<script>
	
  import {mapGetters} from 'vuex'
  import request from '@/util/request'
  import { getLength, substr } from '@/util/util'
  import API from '@/pages/teacher/config/api'
	export default {
	  name: 'Expression',
	  data () {
	    return {
        userid: 0,
        lessonid: 0,
        classroomid: 0,
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
        delete_ids: []
	    }
	  },
	  computed: {
      
    },
	  created(){
      this.userid = +this.$route.params.userid
      this.lessonid = +this.$route.params.lessonid
      this.classroomid = +this.$route.params.classroomid
      this.init()
    },
    mounted() {
      
    },
    watch: {
      tagText(newVal){
        if(newVal && newVal.length > 20) {
           let len = getLength(newVal);
           if(len > 40) {
             this.tagText = substr(newVal, 20);
           }
         }
      }
    },
	  methods: {
      init(){
        this.$nextTick(() => {
          this.getBehaviorStudent()
        })
      },
      getBehaviorStudent(){
        let self = this
        let url = API.behavior_tag.student_about
        let params = {
          lesson_id: this.lessonid,
          classroom_id: this.classroomid,
          student_id: this.userid
        }
        request.get(url, params).then(res => {
          if(res.success){
            self.user_profile = res.data.user_profile
            self.tagList = res.data.tags
            self.tagListTemp = res.data.tags
            self.behavior_score = res.data.behavior_score
            self.participate = res.data.participate
            self.isloaded = true
          }
        })
      },
      handleSelect(index){
        let tag_ids = []
        this.tagList[index].is_visible = !this.tagList[index].is_visible
        let id = this.tagList[index].id
        this.tagList.forEach((item, idx) => {
          if(idx < 3 && index < 3){
            if(item.is_default && idx !== index){
              item.is_visible = false
            }
          }
          if(item.is_visible){
            tag_ids.push(item.id)
          } 
        })
        
        let URL = API.behavior_tag.bind_student
        let params = {
          tag_ids: tag_ids,
          lesson_id: this.lessonid,
          classroom_id: this.classroomid,
          student_id: this.userid
        }
        request.post(URL, params).then(res => {
          if(res.success){
            
          }
        })

      },
	  	handleChangeStatus(){
        let self = this
        let URL = API.behavior_tag.change_participate
        let params = {
          lesson_id: this.lessonid,
          classroom_id: this.classroomid,
          student_id: this.userid,
          status: this.participate.has_joined ? 0 : 1
        }
        request.post(URL, params).then(res => {
          if(res.success){
            self.participate = res.data
          }
        })
      },
      handleReduce(){
        if(this.behavior_score == 0) return false
        this.behavior_score--
        let self = this
        let URL = API.behavior_tag.change_score
        let params = {
          lesson_id: this.lessonid,
          classroom_id: this.classroomid,
          student_id: this.userid,
          score: this.behavior_score
        }
        request.post(URL, params).then(res => {
          if(res.success){
            self.behavior_score = res.data.score
          }
        })
      },
      handleIncrease(){
        if(this.behavior_score === 100) return false
        this.behavior_score++
        let self = this
        let URL = API.behavior_tag.change_score
        let params = {
          lesson_id: this.lessonid,
          classroom_id: this.classroomid,
          student_id: this.userid,
          score: this.behavior_score
        }
        request.post(URL, params).then(res => {
          if(res.success){
            self.behavior_score = res.data.score
          }
        })
      },
      handleDelete(index){
        if(this.tagList[index].is_default) return false;
        this.delete_ids.push(this.tagList[index].id)
        this.tagList.splice(index, 1)
      },
      handleAddTag(){
        let self = this
        let URL = API.behavior_tag.create_tag
        let params = {
          name: this.tagText,
          classroom_id: this.classroomid,
          lesson_id: this.lessonid,
          student_id: this.userid
        }
        request.post(URL, params).then(res => {
          if(res.success){
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
        let URL = API.behavior_tag.deleted_tag
        let params = {
          tag_ids: this.delete_ids,
          classroom_id: this.classroomid,
          lesson_id: this.lessonid
        }
        request.post(URL, params).then(res => {
          if(res.success){
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
    .banner {
      width: 100%;
      height: 4.76rem;
      border-radius: 0.01333333rem;
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
      background: url('http://sfe.ykt.io/o_1d60d5hgm1cloft113n79jf1nbld.png') no-repeat 0 0/contain;
      &.icon-unsign {
        background-image: url('http://sfe.ykt.io/o_1d60d5hgm11umdgl1oga50v1tb8f.png');
      }
      &.icon-points {
        background-image: url('http://sfe.ykt.io/o_1d60d5hgmv1mbpq1m7oq051s74c.png');
      }
      &.icon-unpoints {
        background-image: url('http://sfe.ykt.io/o_1d60d5hgmhj1ioadg5ea31gp2e.png');
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
    .cred {
      color: #F84F41;
    }
    .cblue {
      color: #5096f5;
    }
    .corange {
      color: #FEA300;
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
            border: 0.01333333rem solid #e5e5e5;
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
            span {
              width: 0.69333333rem;
              height: 0.69333333rem;
              border-radius: 50%;
              border: 0.01333333rem solid #E5E5E5;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .disabled {
              color: #9b9b9b;
            }

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
          }
          .tag-label {
            display: block;
            padding: 0 0.34666667rem;
            height: 0.69333333rem;
            line-height: 0.69333333rem;
            color: #9B9B9B;
            border-radius: 0.34666667rem;
            border: 1px solid #EEEEEE;
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
          border-bottom: 0.01333333rem solid #eee;
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
            border-bottom: 0.01333333rem solid #eee;
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
  }
  @media screen and (max-width: 360px) and (-webkit-min-device-pixel-ratio: 2) {
    .participant-info {
      .source {
        margin-left: 0.8rem !important;
      }
    }
    .participant-box {
      align-items: flex-start !important;
    }
    .user-box {
      padding-bottom: 0.53333333rem !important;
    }
  }
</style>

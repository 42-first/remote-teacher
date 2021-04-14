import request2 from '@/util/request'
let agreementMixin = {
  methods: {
    // 获取是否需要展示用户内容协议
    getUserAgreement(){
      let URL = API.get_agreement
      let params = {
        classroom_id: this.classroom.classroomId
      }

      return request2.get(URL, params).then(res => {
        if(res.success){
          this.is_agreement = res.data.is_agreement
        }
      })

    },
    handleGoIndex(){
      console.log(this.$route)
      let platform = location.href.indexOf('fullscreen') != -1 ? 'pc' : 'phone'
      if(platform == 'pc'){
        location.href = '/v2/web/index'
      }else {
        location.href = '/v/index/course/normalcourse'
      }
    },
    handleConfirm(){
      let URL = API.set_agreement
      let params = {
        classroom_id: this.classroom.classroomId
      }

      return request2.post(URL, params).then(res => {
        if(res.success){
          this.is_agreement = true
        }
      })
    }
  },
}

export default agreementMixin;
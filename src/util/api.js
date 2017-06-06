/**
 * @desc API
 */
let api

if (process.env.NODE_ENV === 'production') {
    api = {
        /*------------------*\
           $ 接收器 start
        \*------------------*/

        student: {
            "GET_PRESENTATION_LIST": "",
            "GET_RED_ENVELOPE_DETAIL": "/api/red/red_envelope_detail/",
            "COURSE_STUDENT_DANMU": "/static/mock/course/student_course_danmu.json"
        }

        /*------------------*\
           $ 接收器 end
        \*------------------*/

    }
}else {
    api = {

        /*------------------*\
           $ 接收器 start
        \*------------------*/

        student: {
            // 课件习题列表
            "GET_PRESENTATION_LIST": "/static/mock/student/presentationList.json",
            // 红包详情
            "GET_RED_ENVELOPE_DETAIL": "/static/mock/student/red_envelope_detail.json",
            "COURSE_STUDENT_DANMU": "/static/mock/course/student_course_danmu.json"
        }

        /*------------------*\
           $ 接收器 end
        \*------------------*/

    }
}

export default api

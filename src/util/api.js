/**
 * @desc API
 */
let api

if (process.env.NODE_ENV === 'production') {
    api = {


    }
}else {
    api = {

        /*------------------*\
           $ 接收器 start
        \*------------------*/

        student: {

            "GET_PRESENTATION_LIST": "/static/mock/student/presentationList.json",
            "COURSE_STUDENT_DANMU": "/static/mock/course/student_course_danmu.json"
        }

        /*------------------*\
           $ 接收器 end
        \*------------------*/

    }
}

export default api

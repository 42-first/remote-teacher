/**
 * @desc API
 */
let api

if (process.env.NODE_ENV === 'production') {
    api = {
        // 用户权限
        'GET_USER_INFO': '/v/lesson/lesson_user_info',

        // 软件版本号
        'GET_SOFT_VERSION': '/v/lesson/lesson_ppt_version',

        /*------------------*\
           $ 接收器 start
        \*------------------*/

        student: {
            // 课件习题列表
            'GET_PRESENTATION_LIST': '/v/lesson/lesson_info_v2',
            // 红包详情
            'GET_RED_ENVELOPE_DETAIL': '/api/red/red_envelope_detail/',
            // 习题提交
            'ANSWER_LESSON_PROBLEM': '/v/lesson/answer_lesson_problem',
            // 习题自动提交
            'RETRY_ANSWER_LESSON_PROBLEM': '/v/lesson/retry_answer_lesson_problem',
            // 更新PPT数据
            'FETCH_PRESENTATION_DATA': '/lesson/fetch_presentation_data/',
            // ppt收藏 不懂
            'SET_LEESON_SILDE_TAG': '/v/lesson/post_studentlessonslide_tag',
            // 发送danmu
            'SEND_DANMU': '/v/api/danmu/send_danmu',
            // 发送投稿
            'SEND_SUBMISSION': '/v/api/tougao/create',
            // 我的投稿列表
            'GET_SUBMISSION_LIST': '/v/api/tougao/student/list',
            // 删除投稿
            'DELETE_SUBMISSION': '/v/api/tougao/delete',
            // 上传图片
            'UPLOAD_PIC': '/v/api/tougao/pic_upload'
        }

        /*------------------*\
          $ 接收器 end
        \*------------------*/

    }
}else {
    api = {

        // 用户权限
        'GET_USER_INFO': '/static/mock/user_info.json',

        /*------------------*\
           $ 接收器 start
        \*------------------*/

        student: {
            // 课件习题列表
            'GET_PRESENTATION_LIST': '/static/mock/student/presentationList.json',
            // 红包详情
            'GET_RED_ENVELOPE_DETAIL': '/static/mock/student/red_envelope_detail.json',
            // 习题提交
            'ANSWER_LESSON_PROBLEM': '/static/mock/student/presentationList.json',
            // 习题自动提交
            'RETRY_ANSWER_LESSON_PROBLEM': '/static/mock/student/presentationList.json',
            // 更新PPT数据
            'FETCH_PRESENTATION_DATA': '/static/mock/student/presentationList.json',
            // ppt收藏 不懂
            'SET_LEESON_SILDE_TAG': '/static/mock/student/presentationList.json',
            // 发送danmu
            'SEND_DANMU': '/static/mock/student/presentationList.json',
            // 发送投稿
            'SEND_SUBMISSION': '/v/tougao/create',
            // 我的投稿列表
            'GET_SUBMISSION_LIST': '/static/mock/student/tougao_list.json',
            // 删除投稿
            'DELETE_SUBMISSION': '/static/mock/student/tougao_list.json',
            // 上传图片
            'UPLOAD_PIC': 'v/tougao/pic_uplaod'
        }

        /*------------------*\
           $ 接收器 end
        \*------------------*/

    }
}

export default api

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

        // 停服务通知
        'HOLD_SERVICE_NOTICE': '/pc/hole_service_notice/',

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
            // 主观题分数获取
            'PROBLEM_SCORE': '/v/lesson/subjective_problem_student_info',
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
            'UPLOAD_PIC': '/v/api/tougao/pic_upload',
            // 单个投稿信息
            'GET_SUBMISSION': '/v/api/tougao/tougao_info',
            // 主观题分享
            'GET_SUBJECTIVE': '/v/lesson/subjective_problem_result_info',
            'AUDIT_CLASSROOM': '/edu_admin/audit_classroom/',
            // 根据lesson返回老师信息
            'GET_TEACHER': '/v/lesson/lesson_teacher',
            // 用户引导设置完成
            'SET_GUIDE': '/v/lesson/set_guide',
            // 学生答题时获取分组作答主观题状态
            'GET_GROUP_STATUS': '/v/lesson/student_group_subj_problem_status/',
            // (学生端)获取小组详情
            'GET_TEAM_DETAIL': '/group/student/get_team_detail/',
            // (学生端)获取互评的详情
            'GET_GROUP_REVIEW': '/v/lesson/get_problem_group_review_detail/',
            // 查看单个主观题答案
            'GET_PROBLEM_RESULT': '/v/lesson/subjective_problem_result_info',
            // (学生端)互评打分
            'SUBMIT_GROUP_REVIEW': '/v/lesson/submit_group_review_score/',

            // 直播相关
            'GET_LIVE_LIST': '/v/lesson/live/get_lesson_live_list/',
            'GET_LIVE_URL': '/v/lesson/live/get_live_url/',

            // 白板收藏不懂
            'SET_BOARD_TAG': '/v/lesson/file_sharing/sharing_file_click_tag',

            // 作答结果
            'GET_PROBLEM_RESULT': '/v/lesson/get_lesson_problem_remark/',

        },

        /*------------------*\
          $ 接收器 end
        \*------------------*/

        /* 雨课件市场 start */
        market: {
          'user_info': '/v/course_meta/user_info',
          'get_rain_courseware_list': '/v/rain_courseware/get_rain_courseware_list/',
          'rain_courseware_list': '/v/rain_courseware/rain_courseware_list/',
          'bind_serial_number': '/v/rain_courseware/bind_serial_number/',
          'logout': '/pc/web_logout/'
        }
      /* 雨课件市场 end */

    }
}else {
    api = {
        // 用户权限
        'GET_USER_INFO': '/static/mock/user_info.json',

        // 停服务通知
        'HOLD_SERVICE_NOTICE': 'http://apimock.xuetangx.com/mock/115/pc/hole_service_notice/',

        /*------------------*\
           $ 接收器 start
        \*------------------*/

        student: {
            // 课件习题列表
            'GET_PRESENTATION_LIST': 'http://apimock.xuetangx.com/mock/115/v/lesson/lesson_info_v2/',
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
            'GET_SUBMISSION_LIST': 'http://apimock.xuetangx.com/mock/115/v/api/tougao/student/list',
            // 删除投稿
            'DELETE_SUBMISSION': '/static/mock/student/tougao_list.json',
            // 上传图片
            'UPLOAD_PIC': 'v/tougao/pic_uplaod',
             // 单个投稿信息
            'GET_SUBMISSION': '/v/api/tougao/tougao_info',
            // 主观题分享
            'GET_SUBJECTIVE': '/v/lesson/subjective_problem_result_info',
            'AUDIT_CLASSROOM': '/edu_admin/audit_classroom/',
            // 根据lesson返回老师信息
            'GET_TEACHER': '/v/lesson/lesson_teacher',
            // 用户引导设置完成
            'SET_GUIDE': '/v/lesson/set_guide',
            // 学生答题时获取分组作答主观题状态
            'GET_GROUP_STATUS': 'http://apimock.xuetangx.com/mock/115/v/lesson/student_group_subj_problem_status/',
            // (学生端)获取小组详情
            'GET_TEAM_DETAIL': 'http://apimock.xuetangx.com/mock/115/group/student/get_team_detail/',
            // (学生端)获取互评的详情
            'GET_GROUP_REVIEW': 'http://apimock.xuetangx.com/mock/115/v/lesson/get_problem_group_review_detail/',
            // 查看单个主观题答案
            'GET_PROBLEM_RESULT': 'http://apimock.xuetangx.com/mock/115/v/lesson/subjective_problem_result_info',
            // (学生端)互评打分
            'SUBMIT_GROUP_REVIEW': 'http://apimock.xuetangx.com/mock/115/v/lesson/submit_group_review_score/',

            // 白板收藏不懂
            'GET_BOARD_TAG': 'http://apimock.xuetangx.com/mock/115/file_sharing/sharing_file_click_tag',

            // 作答结果
            'GET_PROBLEM_RESULT': 'http://apimock.xuetangx.com/mock/115/v/lesson/get_lesson_problem_remark/',
        },

        /*------------------*\
           $ 接收器 end
        \*------------------*/
      /* 雨课件市场 start */
      market: {
        'user_info': '/static/lesson/mock/market/user_info.json',
        'get_rain_courseware_list': 'http://apimock.xuetangx.com/mock/115/v/rain_courseware/get_rain_courseware_list/',
        'rain_courseware_list': '/static/lesson/mock/market/rain_courseware_list.json',
        'bind_serial_number': '/static/lesson/mock/market/bind_serial_number.json',
        'logout': '/static/lesson/mock/logout.json'
      }
      /* 雨课件市场 end */

    }
}

export default api

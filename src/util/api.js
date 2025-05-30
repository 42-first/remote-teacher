/**
 * @desc API
 */
let api

if (process.env.NODE_ENV === 'production' || process.env) {
  api = {
    // 软件版本号
    'GET_SOFT_VERSION': '/v/lesson/lesson_ppt_version',

    // 停服务通知
    'HOLD_SERVICE_NOTICE': '/pc/hole_service_notice/',

    get_agreement: '/train_platform/v1/rain-user/agreement/',
    set_agreement: '/train_platform/v1/rain-user/agreement/',

    // 直播打点
    'HEARTBEAT': '/video-log/heartbeat/',

    /*------------------*\
       $ 接收器 start
    \*------------------*/

    student: {
      // 课件习题列表
      'GET_PRESENTATION_LIST': '/v/lesson/lesson_info_v2',
      // 课程状态
      'GET_LESSON_STATUS': '/v/lesson/status',
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
      // 根据lesson返回老师信息
      'GET_TEACHER': '/v/lesson/lesson_teacher',
      // 用户引导设置完成
      'SET_GUIDE': '/v/lesson/set_guide',
      // 学生答题时获取分组作答主观题状态
      'GET_GROUP_STATUS': '/v/lesson/student_group_subj_problem_status/',
      // 获取小组列表
      'GET_ALL_GROUP_LIST': '/group/student/get_all_group_list/',
      // (学生端)获取小组详情
      'GET_TEAM_DETAIL': '/group/student/get_team_detail/',
      // (学生端)获取互评的详情
      'GET_GROUP_REVIEW': '/v/lesson/get_problem_group_review_detail/',
      // (学生端)互评打分
      'SUBMIT_GROUP_REVIEW': '/v/lesson/submit_group_review_score/',

      // 白板收藏不懂
      'SET_BOARD_TAG': '/v/lesson/file_sharing/sharing_file_click_tag',

      // 作答结果
      'GET_PROBLEM_RESULT': '/v/lesson/get_lesson_problem_remark/',

    },

    /*------------------*\
      $ 接收器 end
    \*------------------*/


    /*------------------*\
      $ v3接口 start
    \*------------------*/

    lesson: {
      // 签到/暗号加入班级
      get_user: '/api/v3/user/basic-info',
      // 获取虚id信息
      get_user_identity: '/api/v3/user/getIdentityBasicInfo',
      // 签到/暗号加入班级
      checkin: '/api/v3/lesson/checkin',
      // 读取课程基本信息
      get_lesson_base: '/api/v3/lesson/basic-info',
      // 拉取Presentation
      get_presentation: '/api/v3/lesson/presentation/fetch',
      // 点击不懂收藏
      post_tag: '/api/v3/lesson/tag',
      // 学生课堂不懂收藏列表
      get_lesson_tag: '/api/v3/lesson/tag/lesson',
      // 班级基本信息
      get_classroom: '/api/v3/classroom/basic-info',
      // 发送弹幕
      send_danmu: '/api/v3/lesson/danmu/send',
      // 答题
      answer_problem: '/api/v3/lesson/problem/answer',
      // 答题重试
      retry_answer_problem: '/api/v3/lesson/problem/retry',
      // 添加投稿
      add_tougao: '/api/v3/lesson/tougao/add',
      // 获取投稿列表
      get_tougao_list: '/api/v3/lesson/tougao/list',
      // 删除投稿
      delete_tougao: '/api/v3/lesson/tougao/delete',
      // 获取投稿详情
      get_tougao: '/api/v3/lesson/tougao/detail',
      get_tougao_by_index: '/api/v3/lesson/tougao/detail/index',
      // 获取某个主观题回答
      get_subj_result: '/api/v3/lesson/problem/subj-result',
      // 获取单个题目答案及解析
      get_problem_answer: '/api/v3/lesson/problem/fetch-answer',
      // 获取直播信息
      get_live_info: '/api/v3/lesson/live/get-info',
      // 获取抢红包信息
      get_redenvelope: '/api/v3/lesson/redenvelope/issue-list',
      // 获取会议信息（加入时使用）
      get_meeting_config: '/api/v3/lesson/meeting/get-config',
      // 学生课上试卷状态
      get_quiz_status: '/api/v3/lesson/quiz/status',
      // 加入会议
      join_meeting: '/api/v3/lesson/meeting/join',
      // 离开会议
      leave_meeting: '/api/v3/lesson/meeting/leave',
      // 音视频管理（当前设备状态）
      manage_device: '/api/v3/lesson/meeting/device',
      // 开启共享屏幕
      start_share: '/api/v3/lesson/meeting/share',
      // 关闭桌面共享
      end_share: '/api/v3/lesson/meeting/share/cancel',
      // 获取发言列表
      get_talk_list: '/api/v3/lesson/meeting/talk-list',
      // 获取成员列表
      get_member_list: '/api/v3/lesson/meeting/member-list',
      // 获取共享屏幕信息
      get_share_config: '/api/v3/lesson/meeting/share-config',
      // 互动打点
      report_meeting: '/api/v3/lesson/meeting/report',
      // 获取禁言状态
      get_speech_state: '/api/v3/lesson/meeting/forbidden-speech/state',

      // 获取分组状态
      get_group_info: '/v/lesson/lesson_group_info',
      // 学生答题时获取分组作答主观题状态
      get_group_status: '/api/v3/lesson/problem/group/subjective/status',
      // 获取team详情
      get_team_detail: '/api/v3/group/team/detail',
      // 学生端-查看互评任务详情
      get_problem_review_detail: '/api/v3/lesson/review/get-problem-review-detail',
      // 学生端-互评打分
      submit_review_score: '/api/v3/lesson/review/submit-review-score',
      // 获取互评状态列表
      get_review_status_list: '/api/v3/lesson/review/status-list',
      // 获取水印
      get_watermark: '/api/v3/lesson/live/get-student-text-watermark',

      // 是否绑定腾讯会议账号
      check_bind: '/api/v3/lesson/meeting/tencent/check-bind',
      get_meet_invitation: '/api/v3/lesson/meeting/tencent/meeting-info',

      // 教师接口
      // 发题
      problem_unlock: '/api/v3/lesson/problem/unlock',
      // 题目延时
      problem_delay: '/api/v3/lesson/problem/delay',
      // 收题
      problem_finish: '/api/v3/lesson/problem/finish',
      // 获取已签到
      get_checkin_list: '/api/v3/lesson/checkin-list',
      // 获取未签到
      get_uncheckin_list: '/api/v3/lesson/uncheckin-list',
      // 结束授课
      end_lesson: '/api/v3/lesson/end',
      // 课堂不懂收藏列表（老师）
      get_presentation_tag: '/api/v3/lesson/tag/lesson/teacher',
      // 查看lesson弹幕列表
      get_danmu_list: '/api/v3/lesson/danmu/lesson/get',
      // 投稿未读数查询
      get_unread: '/api/v3/lesson/tougao/unread',
      // 获取设置
      get_user_config: '/api/v3/user/config',
      // 更新设置
      update_config: '/api/v3/user/update-config',
      // 获取授课详情
      get_lesson_detail: '/api/v3/lesson/detail',
      // 获取授课邀请
      get_invitation: '/api/v3/lesson/get-invitation',
      // 投稿投屏
      share_tougao: '/api/v3/lesson/tougao/share-screen',
      // 获取主观题回答列表
      get_subj_list: '/api/v3/lesson/problem/subj-list',
      // 学生课堂表现加分备注页
      student_about: '/api/v3/lesson/assess/student/about',
      // 修改学生的表现加分值
      change_score: '/api/v3/lesson/assess/score/changed',
      // 老师删除标签
      deleted_tag: '/api/v3/lesson/assess/tag/deleted',
      // 学生绑定标签
      bind_student: '/api/v3/lesson/assess/tag/bind_student',
      // 老师添加标签
      created_tag: '/api/v3/lesson/assess/tag/created',
      // 主观题答案数量（轮询用）
      get_subj_list_count: '/api/v3/lesson/problem/subj-list-count',
      // 课上批改主观题
      post_grade: '/api/v3/lesson/problem/grade',
      // 客观题答题统计
      get_problem_histogram: '/api/v3/lesson/problem/histogram',
      // 课上选择题详情
      get_choice_detail: '/api/v3/lesson/problem/choice-detail',
      // 课上填空题详情
      get_blank_detail: '/api/v3/lesson/problem/blank-detail',
      // 课堂板书不懂列表（老师）
      get_file_sharing: '/api/v3/lesson/tag/lesson/teacher/file-sharing',
      // 获取签到详情
      get_checkin_detail: '/api/v3/lesson/checkin/detail',
      // 取消签到
      cancel_checkin: '/api/v3/lesson/checkin/delete',
      // 补签到
      revise_checkin: '/api/v3/lesson/checkin/revise',
      // 准备红包
      redenvelope_prepare: '/api/v3/lesson/redenvelope/prepare',
      // 发起红包
      redenvelope_create: '/api/v3/lesson/redenvelope/create',
      // 获取抢红包信息
      redenvelope_issue_list: '/api/v3/lesson/redenvelope/issue-list',
      // 代理node支付
      node_proxy: '/api/v3/pay/proxy',
      // 搜索成员列表
      search_member: '/api/v3/lesson/search-member',
      // 试卷列表
      get_quiz_list: '/api/v3/lesson/quiz/list',
      // 获取课上试卷某个文件夹
      quiz_dir: '/api/v3/lesson/quiz/dir',
      // 课上发布旧试卷
      publish_quiz: '/api/v3/lesson/quiz/publish',
      // 成绩统计
      quiz_statistics: '/api/v3/lesson/quiz/statistics',
      // 收卷
      quiz_finish: '/api/v3/lesson/quiz/finish',
      // 成绩详情
      quiz_results_detail: '/api/v3/lesson/quiz/result',
      // 获取分组列表
      get_classroom_group_list: '/group/get_classroom_group_list/',
      // 教师端-查看互评规则
      get_review_config: '/api/v3/lesson/review/config',
      // 教师端-发起主观题互评
      publish_review: '/api/v3/lesson/review/publish-review',
      // 教师端-查看题目打分情况
      review_score_detail: '/api/v3/lesson/problem/teacher/score-detail',

      // 获取连麦参数
      get_live_params: '/api/v3/lesson/live/new/get-params-after-class',

      // 获取克隆班标记弹幕列表
      get_collecton_danmus: '/api/v3/lesson/danmu/collection/list',
      // 查看lesson克隆班所有弹幕列表
      get_danmu_clone_all: '/api/v3/lesson/danmu/clone/all',
      // 收藏克隆班弹幕
      clone_danmu_collect: '/api/v3/lesson/danmu/collect',

      // 获取指令任务状态
      get_ai_task_status_list: '/api/v3/lesson/ai-task/receive-list',
      // 检测当前课程是否在新用户白名单内
      check_course_white_list: '/api/v3/classroom/check-course-white-list',
      // 获取课堂讲稿
      get_records: '/api/v3/ai-lesson-companion/get-records',

      // 分组讨论
      // 获取小组聊天消息
      get_group_chat_message: '/api/v3/lesson/group-event/chat-message',
      // 提交讨论结论
      submit_group_summary: '/api/v3/lesson/group-event/summary',
      // 发送聊天信息
      send_group_message: '/api/v3/lesson/group-event/send-group-message',
      // 获取分组讨论状态
      get_group_discuss_status: '/api/v3/lesson/group-event/student/status',
    },

    /*------------------*\
      $ v3接口 start
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
} else {
  api = {
    // 软件版本号
    'GET_SOFT_VERSION': '/v/lesson/lesson_ppt_version',

    // 停服务通知
    'HOLD_SERVICE_NOTICE': 'http://apimock.xuetangx.com/mock/115/pc/hole_service_notice/',

    get_agreement: '/train_platform/v1/rain-user/agreement/',
    set_agreement: '/train_platform/v1/rain-user/agreement/',

    /*------------------*\
       $ 接收器 start
    \*------------------*/

    student: {
      // 课件习题列表
      // 'GET_PRESENTATION_LIST': 'http://apimock.xuetangx.com/mock/115/v/lesson/lesson_info_v2/',
      'GET_PRESENTATION_LIST': '/v/lesson/lesson_info_v2',
      // 课程状态
      'GET_LESSON_STATUS': '/v/lesson/status',
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
      'SEND_SUBMISSION': '/v/api/tougao/create',
      // 我的投稿列表
      // 'GET_SUBMISSION_LIST': 'http://apimock.xuetangx.com/mock/115/v/api/tougao/student/list',
      'GET_SUBMISSION_LIST': '/v/api/tougao/student/list',
      // 删除投稿
      'DELETE_SUBMISSION': '/static/mock/student/tougao_list.json',
      // 上传图片
      'UPLOAD_PIC': 'v/tougao/pic_uplaod',
      // 单个投稿信息
      'GET_SUBMISSION': '/v/api/tougao/tougao_info',
      // 主观题分享
      'GET_SUBJECTIVE': '/v/lesson/subjective_problem_result_info',
      // 根据lesson返回老师信息
      'GET_TEACHER': '/v/lesson/lesson_teacher',
      // 用户引导设置完成
      'SET_GUIDE': '/v/lesson/set_guide',
      // 学生答题时获取分组作答主观题状态
      'GET_GROUP_STATUS': 'http://apimock.xuetangx.com/mock/115/v/lesson/student_group_subj_problem_status/',
      // 获取小组列表
      // 'GET_ALL_GROUP_LIST': 'http://apimock.xuetangx.com/mock/115/group/student/get_all_group_list/',
      'GET_ALL_GROUP_LIST': '/group/student/get_all_group_list/',
      // (学生端)获取小组详情
      'GET_TEAM_DETAIL': 'http://apimock.xuetangx.com/mock/115/group/student/get_team_detail/',
      // (学生端)获取互评的详情
      'GET_GROUP_REVIEW': 'http://apimock.xuetangx.com/mock/115/v/lesson/get_problem_group_review_detail/',
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

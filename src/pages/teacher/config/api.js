/**
 * api 模块
 * @description production块内是线上接口
 *              else 块内是mock接口
 */

let api
let prefix = ''

/* eslint-disable key-spacing, comma-dangle */
if (process.env.NODE_ENV === 'production') {
  api = {
    reporter:                           prefix + '/reporter/collect',
    lesson_ppt_version:                 prefix + '/v/lesson/lesson_ppt_version',
    lesson_status:                      prefix + '/v/lesson/lesson_status',
    userinfo:                           prefix + '/v/lesson/lesson_user_info',
    remote_control_list:                prefix + '/api/mina/remote_control_list',     // 遥控器列表
    fetch_presentation_data:            prefix + '/v/lesson/fetch_presentation_data',   // ppt数据
    lesson_quiz_list:                   prefix + '/api/mina/lesson_quiz_list',        // 试卷数据（已发布、未发布）
    lesson_paper_quiz:                  prefix + '/v/quiz/lesson_paper_quiz',         // 试卷数据（分文件夹，已发布、未发布）
    lesson_one_directory_paper:         prefix + '/v/quiz/lesson_one_directory_paper',  // 试卷数据（单个文件夹内的试卷）
    presentation_tag:                   prefix + '/v/lesson/presentation_tag',        // 获取缩略图页 不懂 等标志的信息
    teaching_lesson_participant_list:   prefix + '/v/lesson/teaching_lesson_participant_list',  // 获取签到学生名单
    lesson_not_participant_list:        prefix + '/v/lesson/lesson_not_participant_list',       // 获取未签到学生名单
    publish_problem:                    prefix + '/v/lesson/publish_problem/',        // 发布试题
    problem_statistics:                 prefix + '/v/lesson/problem_statistics',      // 试题柱状图数据
    fill_blank_problem_statistics:      prefix + '/v/lesson/fill_blank_problem_statistics',      // 填空题条形图数据
    problem_result_detail:              prefix + '/v/lesson/problem_result_detail',   // 试题详情数据
    delay_problem:                      prefix + '/v/lesson/delay_problem',           // 试题收题
    publish_lesson_paper:               prefix + '/v/lesson/publish_lesson_paper',    // 发布试卷
    quiz_results_statistics:            prefix + '/api/quiz/quiz_results_statistics', // 获取试卷饼图数据
    quiz_results_detail:                prefix + '/api/quiz/quiz_results_detail',     // 获取试卷详情
    quiz_finish:                        prefix + '/api/quiz/quiz_finish',             // 收卷
    prepare_red_envelope:               prefix + '/api/red/prepare_red_envelope/1',   // 查询班级人数、钱包余额等，为发红包做准备
    create_red_envelope:                prefix + '/api/red/create_red_envelope',      // 向django后端发起红包支付
    payquery:                           prefix + '/pay/query',                        // 微信支付后向node后端确认支付金额已经进入小金库
    orderpay:                           prefix + '/pay/mp/order/',                    // 向django下单要进行微信支付
    payquery_proxy:                     prefix + '/api/pay/node_proxy',               // 微信支付后向node后端确认支付金额已经进入小金库-python代理
    orderpay_proxy:                     prefix + '/api/pay/node_proxy',               // 向django下单要进行微信支付-python代理
    red_envelope_detail:                prefix + '/api/red/red_envelope_detail',      // 获取某个红包的详情
    danmulist:                          prefix + '/v/api/danmu/list_danmu_v2',        // 弹幕列表
    danmulist2:                         prefix + '/v/api/danmu/danmu_list',           // 弹幕列表 2.0版（分页）
    submissionlist:                     prefix + '/v/api/tougao/teacher/list',        // 投稿列表
    submission_unread_num:              prefix + '/v/api/tougao/teacher/unread_num',  // 未读的新增投稿的数目
    tougaostatus:                       prefix + '/v/api/tougao/status',              // 查询投稿是否存在（被学生删除）并投屏
    collectsubmission:                  prefix + '/v/api/tougao/collect',             // 收藏投稿
    collectsubmission_cancel:           prefix + '/v/api/tougao/collect_cancel',      // 取消收藏投稿
    end_lesson:                         prefix + '/v/lesson/end_lesson',              // 主动结束课程
    subjective_problem_result_list:     prefix + '/v/lesson/subjective_problem_result_list',    // 主观题答案列表
    subjective_problem_teacher_score:   prefix + '/v/lesson/subjective_problem_teacher_score',  // 主观题老师给答案打分(打星星)
    subjective_problem_teacher_scorev2: prefix + '/v/lesson/subjective_problem_teacher_scorev2',// 主观题老师给答案打分
    //获取用户当前语言设置
    get_current_language: "/v/user/get_current_language",
    //设置语言
    set_lang_en: "/v/user/set_language/en",
    set_lang_zh_cn: "/v/user/set_language/zh_cn",
    // 获取分组列表
    get_classroom_group_list:           prefix + '/group/get_classroom_group_list/',
    // (教师端)发起主观题互评
    publish_subj_problem_group_review:  prefix + '/v/lesson/publish_subj_problem_group_review/',
    // 主观题打分界面获取回答目前打分情况
    get_subj_result_score_detail:       prefix + '/v/lesson/get_subj_result_score_detail/',
    // (教师端) 修改主观题打分比例
    edit_subj_problem_score_proportion: prefix + '/v/lesson/edit_subj_problem_score_proportion',
    // (教师端)获取互评状态
    get_subj_problem_group_review:      prefix + '/v/lesson/get_subj_problem_group_review',
  }
} else {
  api = {
    lesson_ppt_version:                '/static/lesson/mock/lesson_ppt_version.json',
    lesson_status:                      '/static/lesson/mock/lesson_status.json',
    userinfo:                           '/static/lesson/mock/userinfo_teacher.json',
    remote_control_list:                '/static/lesson/mock/remote_control_list.json',        // 遥控器列表
    fetch_presentation_data:            '/static/lesson/mock/fetch_presentation_data.json',    // ppt数据
    lesson_quiz_list:                   '/static/lesson/mock/lesson_quiz_list.json',           // 试卷数据（已发布、未发布）
    lesson_paper_quiz:                  '/static/lesson/mock/lesson_paper_quiz.json',          // 试卷数据（分文件夹，已发布、未发布）
    lesson_one_directory_paper:         '/static/lesson/mock/lesson_one_directory_paper.json', // 试卷数据（单个文件夹内的试卷）
    presentation_tag:                   '/static/lesson/mock/presentation_tag.json',           // 获取缩略图页 不懂 等标志的信息
    teaching_lesson_participant_list:   'http://apimock.xuetangx.com/mock/115/v/lesson/teaching_lesson_participant_list',    // 获取签到学生名单
    lesson_not_participant_list:        'http://apimock.xuetangx.com/mock/115/v/lesson/lesson_not_participant_list',       // 获取未签到学生名单
    publish_problem:                    'http://apimock.xuetangx.com/mock/115/v/lesson/publish_problem/',            // 发布试题
    problem_statistics:                 '/static/lesson/mock/problem_statistics.json',         // 试题柱状图数据
    fill_blank_problem_statistics:      'http://apimock.xuetangx.com/mock/115/v/lesson/fill_blank_problem_statistics/{problem_id}/',         // 填空题条形图数据
    problem_result_detail:              'http://apimock.xuetangx.com/mock/115/v/lesson/problem_result_detail/{{problem_id}}/',      // 试题详情数据
    delay_problem:                      '/static/lesson/mock/delay_problem.json',              // 试题收题
    publish_lesson_paper:               '/static/lesson/mock/publish_lesson_paper.json',       // 发布试卷
    quiz_results_statistics:            '/static/lesson/mock/quiz_results_statistics.json',    // 获取试卷饼图数据
    quiz_results_detail:                '/static/lesson/mock/quiz_results_detail.json',        // 获取试卷详情
    quiz_finish:                        '/static/lesson/mock/quiz_finish.json',                // 收卷
    prepare_red_envelope:               '/static/lesson/mock/prepare_red_envelope.json',       // 查询班级人数、钱包余额等，为发红包做准备
    create_red_envelope:                '/static/lesson/mock/create_red_envelope.json',        // 向django后端发起红包支付
    payquery:                           '/pay/query',                                          // 微信支付后向node后端确认支付金额已经进入小金库
    orderpay:                           '/pay/mp/order/',                                      // 向django下单要进行微信支付
    red_envelope_detail:                '/static/lesson/mock/red_envelope_detail.json',        // 获取某个红包的详情
    danmulist:                          '/static/lesson/mock/danmulist.json',                  // 弹幕列表
    danmulist2:                         '/static/lesson/mock/danmulist2.json',                 // 弹幕列表 2.0版（分页）
    submissionlist:                     '/static/lesson/mock/submissionlist.json',             // 投稿列表
    submission_unread_num:              '/static/lesson/mock/submission_unread_num.json',      // 未读的新增投稿的数目
    tougaostatus:                       '/static/lesson/mock/tougaostatus.json',               // 查询投稿是否存在（被学生删除）并投屏
    collectsubmission:                  '/static/lesson/mock/collectsubmission.json',          // 收藏投稿
    collectsubmission_cancel:           '/static/lesson/mock/collectsubmission_cancel.json',   // 取消收藏投稿
    end_lesson:                         '/static/lesson/mock/end_lesson.json',                 // 主动结束课程
    subjective_problem_result_list:     'http://apimock.xuetangx.com/mock/115/v/lesson/subjective_problem_result_list',     // 主观题答案列表
    subjective_problem_teacher_score:   '/static/lesson/mock/subjective_problem_teacher_score.json',   // 主观题老师给答案打分（打星星）
    subjective_problem_teacher_scorev2: 'http://apimock.xuetangx.com/mock/115/v/lesson/subjective_problem_teacher_scorev2/',   // 主观题老师给答案打分

    // 获取用户当前语言设置
    get_current_language:  'http://apimock.xuetangx.com/mock/115/v/user/get_current_language',
    // 设置语言
    set_lang_en: 'http://apimock.xuetangx.com/mock/115/v/user/set_language/en',
    set_lang_zh_cn: 'http://apimock.xuetangx.com/mock/115/v/user/set_language/zh_cn',
    get_classroom_group_list:           'http://apimock.xuetangx.com/mock/115/group/get_classroom_group_list/',
    publish_subj_problem_group_review:  'http://apimock.xuetangx.com/mock/115/v/lesson/publish_subj_problem_group_review/',
    get_subj_result_score_detail:       'http://apimock.xuetangx.com/mock/115/v/lesson/get_subj_result_score_detail/',
    edit_subj_problem_score_proportion: 'http://apimock.xuetangx.com/mock/115/v/lesson/edit_subj_problem_score_proportion',
    get_subj_problem_group_review:      'http://apimock.xuetangx.com/mock/115/v/lesson/get_subj_problem_group_review',
  }
}

export default api

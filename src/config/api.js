/**
 * api 模块
 * @description production块内是线上接口
 *              else 块内是mock接口
 */

let api
let prefix = ''
let SOCKET_HOST = ''

/* eslint-disable key-spacing, comma-dangle */
if (process.env.NODE_ENV === 'production') {
  api = {
    userinfo:                           prefix + '/v/lesson/lesson_user_info',
    remote_control_list:                prefix + '/api/mina/remote_control_list',     // 遥控器列表
    fetch_presentation_data:            prefix + '/lesson/fetch_presentation_data',   // ppt数据
    lesson_quiz_list:                   prefix + '/api/mina/lesson_quiz_list',        // 试卷数据（已发布、未发布）
    presentation_tag:                   prefix + '/lesson/presentation_tag',          // 获取缩略图页 不懂 等标志的信息
    teaching_lesson_participant_list:   prefix + '/v/lesson/teaching_lesson_participant_list',  // 获取签到学生名单
    publish_problem:                    prefix + '/lesson/publish_problem/',          // 发布试题
    problem_statistics:                 prefix + '/lesson/problem_statistics',        // 试题柱状图数据
    problem_result_detail:              prefix + '/lesson/problem_result_detail',     // 试题详情数据
    publish_lesson_paper:               prefix + '/lesson/publish_lesson_paper',      // 发布试卷
    quiz_results_statistics:            prefix + '/api/quiz/quiz_results_statistics', // 获取试卷饼图数据
    quiz_results_detail:                prefix + '/api/quiz/quiz_results_detail',     // 获取试卷详情
    quiz_finish:                        prefix + '/api/quiz/quiz_finish',             // 收卷
    prepare_red_envelope:               prefix + '/api/red/prepare_red_envelope/1',   // 查询班级人数、钱包余额等，为发红包做准备
    create_red_envelope:                prefix + '/api/red/create_red_envelope',      // 向django后端发起红包支付
    payquery:                           prefix + '/pay/query',                        // 微信支付后向node后端确认支付金额已经进入小金库
    orderpay:                           prefix + '/pay/mp/order/',                    // 向django下单要进行微信支付
    red_envelope_detail:                prefix + '/api/red/red_envelope_detail',      // 获取某个红包的详情
    danmulist:                          prefix + '/v/api/danmu/list_danmu_v2',        // 弹幕列表
  }
} else {
  api = {
    userinfo:                           '/static/mock/userinfo_teacher.json',
    remote_control_list:                '/static/mock/remote_control_list.json',        // 遥控器列表
    fetch_presentation_data:            '/static/mock/fetch_presentation_data.json',    // ppt数据
    lesson_quiz_list:                   '/static/mock/lesson_quiz_list.json',           // 试卷数据（已发布、未发布）
    presentation_tag:                   '/static/mock/presentation_tag.json',           // 获取缩略图页 不懂 等标志的信息
    teaching_lesson_participant_list:   '/static/mock/teaching_lesson_participant_list.json',    // 获取签到学生名单
    publish_problem:                    '/static/mock/publish_problem.json',            // 发布试题
    problem_statistics:                 '/static/mock/problem_statistics.json',         // 试题柱状图数据
    problem_result_detail:              '/static/mock/problem_result_detail.json',      // 试题详情数据
    publish_lesson_paper:               '/static/mock/publish_lesson_paper.json',       // 发布试卷
    quiz_results_statistics:            '/api/quiz/quiz_results_statistics',            // 获取试卷饼图数据
    quiz_results_detail:                '/static/mock/quiz_results_detail.json',        // 获取试卷详情
    quiz_finish:                        '/static/mock/quiz_finish.json',                // 收卷
    prepare_red_envelope:               '/static/mock/prepare_red_envelope.json',       // 查询班级人数、钱包余额等，为发红包做准备
    create_red_envelope:                '/static/mock/create_red_envelope.json',        // 向django后端发起红包支付
    payquery:                           '/pay/query',                                   // 微信支付后向node后端确认支付金额已经进入小金库
    orderpay:                           '/pay/mp/order/',                               // 向django下单要进行微信支付
    red_envelope_detail:                '/static/mock/red_envelope_detail.json',        // 获取某个红包的详情
    danmulist:                          '/static/mock/danmulist.json',                  // 弹幕列表
  }
}

export default api

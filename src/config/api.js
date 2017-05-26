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
  SOCKET_HOST = 'rain.xuetangx.com'
  api = {
    socketurl:                      'ws://' + SOCKET_HOST + '/wsapp/',
    login:                          prefix + '/login',
    remote_control_list:            prefix + '/api/mina/remote_control_list',     // 遥控器列表
    fetch_presentation_data:        prefix + '/lesson/fetch_presentation_data',   // ppt数据
    lesson_quiz_list:               prefix + '/api/mina/lesson_quiz_list',        // 试卷数据（已发布、未发布）
    publish_problem:                prefix + '/lesson/publish_problem/',          // 发布试题
    problem_statistics:             prefix + '/lesson/problem_statistics',        // 试题柱状图数据
    problem_result_detail:          prefix + '/lesson/problem_result_detail',     // 试题详情数据
    publish_lesson_paper:           prefix + '/lesson/publish_lesson_paper',      // 发布试卷
    quiz_results_statistics:        prefix + '/api/quiz/quiz_results_statistics', // 获取试卷饼图数据
    quiz_results_detail:            prefix + '/api/quiz/quiz_results_detail',     // 获取试卷详情
    quiz_finish:                    prefix + '/api/quiz/quiz_finish',             // 收卷
    prepare_red_envelope:           prefix + '/api/red/prepare_red_envelope/1',   // 查询班级人数、钱包余额等，为发红包做准备
    create_red_envelope:            prefix + '/api/red/create_red_envelope',      // 向django后端发起红包支付
    payquery:                       prefix + '/pay/query',                        // 微信支付后向node后端确认支付金额已经进入小金库
    orderpay:                       prefix + '/pay/mp/order/',                    // 向django下单要进行微信支付
    red_envelope_detail:            prefix + '/api/red/red_envelope_detail',      // 获取某个红包的详情
  }
} else {
  SOCKET_HOST = 'b.xuetangx.com'
  api = {
    socketurl:                      'ws://' + SOCKET_HOST + '/wsapp/',
    login:                          '/login',
    remote_control_list:            '/static/mock/remote_control_list.json',        // 遥控器列表
    fetch_presentation_data:        '/static/mock/fetch_presentation_data.json',    // ppt数据
    lesson_quiz_list:               '/api/mina/lesson_quiz_list',                   // 试卷数据（已发布、未发布）
    publish_problem:                '/lesson/publish_problem/',                     // 发布试题
    problem_statistics:             '/lesson/problem_statistics',                   // 试题柱状图数据
    problem_result_detail:          '/lesson/problem_result_detail',                // 试题详情数据
    publish_lesson_paper:           '/lesson/publish_lesson_paper',                 // 发布试卷
    quiz_results_statistics:        '/api/quiz/quiz_results_statistics',            // 获取试卷饼图数据
    quiz_results_detail:            '/api/quiz/quiz_results_detail',                // 获取试卷详情
    quiz_finish:                    '/api/quiz/quiz_finish',                        // 收卷
    prepare_red_envelope:           '/api/red/prepare_red_envelope/1',              // 查询班级人数、钱包余额等，为发红包做准备
    create_red_envelope:            '/api/red/create_red_envelope',                 // 向django后端发起红包支付
    payquery:                       '/pay/query',                                   // 微信支付后向node后端确认支付金额已经进入小金库
    orderpay:                       '/pay/mp/order/',                               // 向django下单要进行微信支付
    red_envelope_detail:            '/api/red/red_envelope_detail',                 // 获取某个红包的详情
  }
}

export default api

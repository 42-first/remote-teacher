// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import VueI18n from 'vue-i18n'
import Cookies from 'js-cookie'

import App from '@/pages/fullscreen/fullscreen.vue'
import router from '@/router/fullscreen'
import store from './store'

import peiBiaoCheck from '@/components/peibiao/check';

// 引入订阅发布解决路由子组件和父组件通信问题
import('pubsub-js').then(res => {
  window.PubSub = res
})

import EnLanguage from '@/language/en'
import ChLanguage from '@/language/zh_CN'

// Cookies.set('__cf_bm', 'OFYXI_b1ZNR.SXmLGR8ykqPH4Rggh6JoobWGnEOGb0Y-1745732805-1.0.1.1-Y5eb3GtQyRQuO1fB5wBszHaGzYnBXSdOFVenaCZ963blsi3L1ZnwS0hPiZWk25rg7zlWWv8As1aEAjqO3dXViTAMNde0zPcoy67G_f.anf4');
// Cookies.set('_did','web_1013325143A3C952')
// Cookies.set('CNZZDATA1281406241','1859636408-1745732802-https%253A%252F%252Fzhktpt.yuketang.cn%252F%7C1745732805')
// Cookies.set('csrftoken', 'NV6yjsTohTi08LeL2JP14DPZldUMlpXW');
// Cookies.set('platform_id', '3');
// Cookies.set('platform_type', '1');
// Cookies.set('sessionid', 'y8w5l1tv2hsh73jt3240xhemjbk8u8cb');
// Cookies.set('UM_distinctid', '19675c8975caef-09a35bf3978cea-1a525636-183990-19675c8975d126a');
// Cookies.set('university_id', '4142');
// Cookies.set('user_name', 'zhktpt@126.com');
// Cookies.set('user_pwd', 'Zhktpt20250415');
// Cookies.set('user_status', '1');
// Cookies.set('xtbz', 'cloud');
// window.localStorage.setItem('API_HEADER', '{"school_new_name":null,"year_terms":[{"year_name":"2024-2025学年","terms":[{"name":"第二学期","value":"202402"}]}],"define_role_id":2,"is_email_user":false,"platform_id":3,"is_assistant_teacher":true,"school_icon":"","school_evaluation":false,"kx_examiner":false,"school_name":"智慧课堂平台","user_role":0,"all_year_terms":[{"year_name":"2024-2025学年","terms":[{"name":"第二学期","value":"202402"}]}],"relationship":"","is_auditor":false,"is_only_read":false,"resource_manage_layout":1,"current_year_term":"202402","user_number":"zhktpt@126.com","is_bind":true,"permissions":["professional.add_professionalpermissions","professional.change_professionalpermissions","professional.data_admin__course","professional.data_admin__course_add","professional.data_admin__course_add_collaborators","professional.data_admin__course_add_student","professional.data_admin__course_change_master","professional.data_admin__course_delete","professional.data_admin__course_edit","professional.data_admin__course_query","professional.data_admin__course_remove_auditor","professional.data_admin__course_remove_collaborator","professional.data_admin__course_remove_student","professional.data_admin__course_set_to_student","professional.data_admin__department","professional.data_admin__department_add","professional.data_admin__department_delete","professional.data_admin__department_edit","professional.data_admin__department_query","professional.data_admin__log","professional.data_admin__log_query","professional.data_admin__tradition_class","professional.data_admin__tradition_class_add","professional.data_admin__tradition_class_add_student","professional.data_admin__tradition_class_add_teacher","professional.data_admin__tradition_class_delete","professional.data_admin__tradition_class_delete_teacher","professional.data_admin__tradition_class_edit","professional.data_admin__tradition_class_exchange_student","professional.data_admin__tradition_class_query","professional.data_admin__tradition_class_remove_student","professional.data_admin__tradition_class_sync_info","professional.data_admin__user_map","professional.data_admin__user_map_add","professional.data_admin__user_map_delete","professional.data_admin__user_map_edit","professional.data_admin__user_map_query","professional.delete_professionalpermissions"],"is_supervisor":null,"anti_brushing":true,"has_parents":false,"school_color_list":["",""],"is_create_president":false,"is_fake":false,"school_official_website":"http://www.tsinghua.edu.cn/publish/newthu/index.html","session_id":"y8w5l1tv2hsh73jt3240xhemjbk8u8cb","department_name":"计算机学院","school_type":1,"user_info":{"phone":"","user_id":89855704,"avatar":"https://qn-sy.yuketang.cn/new_defaultuser.png","has_password":true,"name":"yqt老师"},"define_role_label":2,"school_new_logo":null,"is_has_child":false,"parent_info":{"has_password":true,"user_number":"","user_id":0,"avatar":"","phone":""},"is_edu_support":false,"school_id":4142,"department_id":5062215}');
// window.localStorage.setItem('Authorization', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJsIjoiMTQwODMyNzEzMTQ4OTk4MjMzNiIsInMiOjE3NDU3MjI0NzYsImMiOiIyNjA0NTM2NCIsInUiOiI0MTQyIiwiZCI6IjUwNjIyMTUiLCJpIjoiODk4NTU3MDQiLCJwIjoiMyIsInIiOlsiMTAxIiwiMjAxIiwiMjAzIiwiMjAyIl0sImlhdCI6MTc0NTczMjgwNSwiZXhwIjoxNzQ1NzMyODM1fQ.wEAFjlLr4Tx912_4T_hiHITHtP_fk_X4hJ_FtESDKMk');
// window.localStorage.setItem('TRTC_checkResult', '{"expiresIn":1746329015284,"value":{"ua":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36","checkResult":{"result":true,"detail":{"isBrowserSupported":true,"isWebRTCSupported":true,"isMediaDevicesSupported":true,"isH264EncodeSupported":true,"isVp8EncodeSupported":true,"isH264DecodeSupported":true,"isVp8DecodeSupported":true}}}}');
// window.localStorage.setItem('_uuid', 'f03a6a8218ab1c4a23b65dc59a2196bfa308');
// window.localStorage.setItem('captcha_webworker_supported', '2');
// window.localStorage.setItem('live-status-1408327131489982336', '1');
// window.localStorage.setItem('nhd', '{}');
// window.localStorage.setItem('runtime_xtbz', 'yth');
// window.localStorage.setItem('university_term_time', '{"start":1738339200,"end":1753891200}');
// window.localStorage.setItem('vuex', '{"info":{"self_activation":false,"self_registered":false,"show_app_download":false,"download_leaf_attachment":true,"project_type":[0],"domain_department_id":null,"third_party_login_info":{},"current_year_term":"202402","new_name_pic":"","official_website":null,"is_major_construction":false,"live_cut":false,"is_sec_department":false,"ai_assistant":false,"ykt_host":"www.yuketang.cn","login_hint_pwd":"","min_zoom_ratio":13,"login_type_list":[3],"bind_type_list":[1],"is_data_center_open":true,"is_course_construction":false,"background":null,"center_lng":null,"appid_list":["yktpro","xty","xfk","xbk"],"instance_teacher_required":false,"password_hint":"默认密码为工号/学号的后六位","competition_is_open":false,"platform_type":1,"university_logo":"","customized_hostname":"https://zhktpt.yuketang.cn","system_activation":true,"color_list":["",""],"max_zoom_ratio":18,"is_training_program":false,"site_name":"rain","university_name":"智慧课堂平台","zoom_ratio":16,"logo_pic":"","university_id":4142,"is_continue_study_of_classend":true,"is_relation_course_code":false,"center_lat":null,"is_cs_version":false,"center_lng_lat":"","sec_department_id":null,"university_version":"","login_hint_username":"","command_center":0,"show_pd_auto":false,"instance_department_required":false,"ai_opened":true,"bind_hint_username":"请输入校内工号/学号","is_forum":true,"register_type":[1],"knowledge_graph_on":false,"platform_id":3,"bind_hint_pwd":"请输入校内工号/学号","school_new_name":null,"year_terms":[{"year_name":"2024-2025学年","terms":[{"name":"第二学期","value":"202402"}]}],"define_role_id":2,"is_email_user":false,"is_assistant_teacher":true,"school_icon":"","school_evaluation":false,"kx_examiner":false,"school_name":"智慧课堂平台","user_role":0,"all_year_terms":[{"year_name":"2024-2025学年","terms":[{"name":"第二学期","value":"202402"}]}],"relationship":"","is_auditor":false,"is_only_read":false,"resource_manage_layout":1,"user_number":"zhktpt@126.com","is_bind":true,"permissions":["professional.add_professionalpermissions","professional.change_professionalpermissions","professional.data_admin__course","professional.data_admin__course_add","professional.data_admin__course_add_collaborators","professional.data_admin__course_add_student","professional.data_admin__course_change_master","professional.data_admin__course_delete","professional.data_admin__course_edit","professional.data_admin__course_query","professional.data_admin__course_remove_auditor","professional.data_admin__course_remove_collaborator","professional.data_admin__course_remove_student","professional.data_admin__course_set_to_student","professional.data_admin__department","professional.data_admin__department_add","professional.data_admin__department_delete","professional.data_admin__department_edit","professional.data_admin__department_query","professional.data_admin__log","professional.data_admin__log_query","professional.data_admin__tradition_class","professional.data_admin__tradition_class_add","professional.data_admin__tradition_class_add_student","professional.data_admin__tradition_class_add_teacher","professional.data_admin__tradition_class_delete","professional.data_admin__tradition_class_delete_teacher","professional.data_admin__tradition_class_edit","professional.data_admin__tradition_class_exchange_student","professional.data_admin__tradition_class_query","professional.data_admin__tradition_class_remove_student","professional.data_admin__tradition_class_sync_info","professional.data_admin__user_map","professional.data_admin__user_map_add","professional.data_admin__user_map_delete","professional.data_admin__user_map_edit","professional.data_admin__user_map_query","professional.delete_professionalpermissions"],"is_supervisor":null,"anti_brushing":true,"has_parents":false,"school_color_list":["",""],"is_create_president":false,"is_fake":false,"school_official_website":"http://www.tsinghua.edu.cn/publish/newthu/index.html","session_id":"y8w5l1tv2hsh73jt3240xhemjbk8u8cb","department_name":"计算机学院","school_type":1,"user_info":{"phone":"","user_id":89855704,"avatar":"https://qn-sy.yuketang.cn/new_defaultuser.png","has_password":true,"name":"yqt老师"},"define_role_label":2,"school_new_logo":null,"is_has_child":false,"parent_info":{"has_password":true,"user_number":"","user_id":0,"avatar":"","phone":""},"is_edu_support":false,"school_id":4142,"department_id":5062215},"userInfo":{"phone":"","user_id":89855704,"avatar":"https://qn-sy.yuketang.cn/new_defaultuser.png","has_password":true,"name":"yqt老师"},"educationalAllDepartments":[{"department_name":"计算机学院","department_id":5062215}],"educationalBreadList":[],"educationalAllRoles":[],"educationalAllNewRoles":[],"educationalAllBindStatus":[],"educationalAllYears":[],"educationalAllUserYears":[],"educationalAllTerms":[{"name":"第二学期","value":"202402","year_name":"2024-2025学年","label":"2024-2025学年 undefined"}],"navList":[{"code":"teach_manage","order":8,"name":"teach_manage","label":"教学管理"},{"code":"course_cons","order":15,"name":"course_cons","label":"课程建设"},{"code":"my_resource","order":9,"name":"my_resource","label":"我的资源"},{"code":"ai-workspace","name":"ai-workspace","label":"AI工作台","scope":1,"operation":2,"order":45}],"dashboardDetailQueryData":null,"webDetailData":null,"universityTermTime":{"start":1738339200,"end":1753891200},"noticeBreadList":[],"inspectorBreadList":[],"userMenu":{"is_has_bubbling":true,"menu_list":[{"code":"teach_manage","order":8,"name":"teach_manage","label":"教学管理"},{"code":"course_cons","order":15,"name":"course_cons","label":"课程建设"},{"code":"my_resource","order":9,"name":"my_resource","label":"我的资源"},{"code":"ai-workspace","name":"ai-workspace","label":"AI工作台","scope":1,"operation":2,"order":45}],"role_list":[{"status":0,"code":"school_administrator","id":0,"name":"校级管理员"},{"status":1,"code":"teacher","id":2,"name":"老师"}],"appid_list":["yktpro","xty","xfk","xbk"],"is_has_cc_pop_up":true},"currentRole":2,"routerBase":"/pro","courseTypes":[],"skuId":"","hascloud":true,"isLogin":true,"site_name":"rain","studentNum":0,"courseClassStartTime":"","courseClassEndTime":"","appid_list":["yktpro","xty","xfk","xbk"],"resourcePackageData":{},"noRemindArchive":false,"universityId":4142,"platformId":3,"slideIndex":0,"boardTermTime":{},"kx_explain_show":false,"is_privacy_protect":false,"is_studio_forum_privacy":false,"achievementSelectDetail":{},"data_center_access_control":{"dashboard_report_week":4,"dashboard_portrait_student":4,"dashboard_teach_monitor_lesson":4,"data_download_course":4,"dashboard_report_term":4,"data_download_teacher":4,"data_download_student_video":4,"dashboard_portrait_teacher":4,"data_display_realtime_lesson_classroom_search":5,"large_screen_monitor":4,"dashboard_source":3,"data_download_lesson_user":4,"data_download_classroom_user":4,"dashboard_teach_monitor_overview":4,"dashboard_warning_classroom":4,"data_download_classroom":4,"data_download_department":4,"data_display_realtime_exam":1,"data_download_resource_learning":4,"data_display_overview":1,"ai_empower":4,"dashboard_teach_monitor_credit_course":3,"data_download_instance":4,"dashboard_report_month":4,"data_download_student":4,"data_display_realtime_lesson":1,"dashboard_warning_department":4},"portalStyle":1,"portalTheme":3}');


// 通过插件的形式挂载
Vue.use(VueI18n)

let lng = Cookies.get('django_language') || 'zh-cn';
lng = lng === 'zh-cn' ? 'zh_CN' : 'en';

const i18n = new VueI18n({
  // 语言标识
  locale: lng,
  messages: {
    'zh_CN': ChLanguage,
    'en': EnLanguage
  }
})

window.i18n = i18n;


Vue.config.productionTip = false

// 判断是否为陪标平台，陪标代码要上正式环境，所以只能一开始就加载一些代码
peiBiaoCheck({router, i18n, store})

/* eslint-disable no-new */
new Vue({
  i18n,
  el: '#app',
  router,
  store,
  template: '<App/>',
  components: { App }
})

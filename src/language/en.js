/*
 * 雨课堂 国际化静态文字
 * @author: chenzhou
 * @update: 2017.6.12
 * @desc 国际化 命名空间格式 page-module-lable
 *
 */

let pages = {
  // 学生遥控器
  'student': {
    'nav': {
      'all' : 'all',
      'ppt' : 'PPT',
      'problem' : 'problem',
      'quiz' : 'quiz',
      'hongbao' : 'hongbao'
    }
  }
};



if (typeof define === 'function' && define.amd){
    // AMD. Register as an anonymous module.
    define(['exports'], function(){
        return pages;
    });
}

export default pages;

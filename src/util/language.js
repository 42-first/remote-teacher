/*
 * 雨课堂 国际化静态文字
 * @author: chenzhou
 * @update: 2017.6.14
 * @desc 国际化 命名空间格式 page-module-lable
 *
 */


class Language {
  constructor() {
    this.options = {
      default: 'zh_CN',
      lang: 'zh_CN'
    }

    this.languageRes = null;
  }

  /*
   * @method 请求语言资源
   * @param lang 语言类型
   */
  requireRes(lang) {
    let self = this;

    if(lang) {
      this.options['lang'] = lang;

      switch (lang) {
        case 'zh_CN':
          // 中文资源
          require(['@/language/zh_CN'], function(res) {
            self.languageRes = res && res.default;
          })
          break;
        case 'en':
          // 英文资源
          require(['@/language/en'], function(res) {
            self.languageRes = res && res.default;
          })
          break;
        default:
          break;
      }
    }
  }

  /*
   * @method 翻译当前页面
   * @param pageEl
   */
  translate(pageEl) {
    let self = this;
    // data-language-key
    pageEl = pageEl || document;

    if(!self.languageRes) {
      setTimeout(() => {
        self.translate(pageEl);
      }, 1000)

      return this;
    }

    let allEle = pageEl.querySelectorAll('[data-language-key]');

    allEle.forEach((element) => {
      let key = element.dataset.languageKey;
      let aPath = key.split('.');
      let value = element.innerText;

      aPath.forEach((path, index) => {
        index === 0 && (value = this.languageRes[path]);
        index && (value = value[path]);
      })

      element.innerText = value;
    })

  }
}


if (typeof define === 'function' && define.amd) {
  // AMD. Register as an anonymous module.
  define(['exports'], function(){
    return new Language();
  });
}

export default new Language();

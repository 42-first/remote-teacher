import Picker from 'better-picker'
import axios from 'axios'
import $ from 'jquery'
var mixin = {
  data () {
    return {
      picker: null,
      selectResult: 'all'
    }
  },
  methods: {
    pptShowSet (data) {
      // 设置未在课堂上展示的ppt是否展示给学生
      let arr = [
        {
          value: 0,
          result: 'all',
          text: this.$t('visibleAll') || '全部课件'
        },
        {
          value: 1,
          result: 'film',
          text: this.$t('visibleStu') || '课上讲解的'
        }
      ]
      // 这里写value 和result的区别是： value用来在picker 时作为selectedVal的值； result是用于传递给后端的值
      if (!this.picker) {
        this.picker = new Picker({
          data: [arr],
          title: this.$t('studentsVisible') || '学生可查看'
        })
        $(this.picker.confirmEl).text(this.$t('confirm') || '确定')
        $(this.picker.cancelEl).text(this.$t('cancel') || '取消')
        this.picker.on('picker.select', selectedVal => {
          let result = arr[selectedVal]['result']
          console.log(result)
          this.show_presentation = result
          this.pcSet(result)
        })
        this.picker.on('picker.cancel', function () {
          console.log('cancel')
        })
        $(this.picker.maskEl).on('click', (e) => {
          $(this.picker.cancelEl).click()
        })
        this.picker.pickerEl.style.zIndex = '10000'
        let pickChoose = this.picker.pickerEl.querySelector('.picker-choose')
        let pickCancel = this.picker.cancelEl
        let pickConfirm = this.picker.confirmEl
        pickChoose.style.backgroundColor = '#f8f8f8'
        pickChoose.querySelector('.picker-title').style.color = '#9b9b9b'
        pickChoose.querySelector('.picker-title').style.fontSize = '14px'
        pickChoose.querySelector('.picker-title').style.fontWeight = 'normal'
        pickChoose.style.height = '46px'
        pickCancel.style.paddingLeft = '16px'
        pickCancel.style.color = '#333'
        pickCancel.style.fontSize = '16px'
        pickConfirm.style.color = '#639ef4'
        pickConfirm.style.paddingRight = '16px'
        pickConfirm.style.fontSize = '16px'
        pickCancel.style.top = pickConfirm.style.top = 0
        $(this.picker.pickerEl).find('h1.picker-title').css({
          'overflow': 'hidden',
          'padding-top': '13px',
          'line-height': 'normal'
        })
      }
      // stateSet 调用本函数，传入参数 show_presentation 设置
      this.picker.selectedIndex = [data.show_presentation === 'all' ? 0 : 1]
      this.picker && this.picker.show()
    },
    // 全局设置ppt
    pcSet (name) {
      let url = 'pc/web_ppt_config'
      axios.post(this.urlMock(url), {
        'op': 'set_config',
        'set_data': JSON.stringify({
          'show_presentation': name
        })
      }).then(e => {
      })
    },
    urlMock (url) {
      if (process.env.NODE_ENV !== 'production') {
        return 'http://apimock.xuetangx.com/mock/115/' + url
      }
      return '/' + url
    }
  },
  beforeDestroy () {
    if (this.picker) {
      $('.picker').remove()
    }
  }
}
export {mixin}

<template>
  <div></div>
</template>

<script>
import Picker from 'better-picker'
export default {
  data() {
    return {
      picker: null
    }
  },
  created() {
    this.init()
  },
  methods: {
    init() {
      let arr = [
        {
          value: 0,
          result: 0,
          text: '默认数据1'
        },
        {
          value: 1,
          result: 1,
          text: '默认数据2'
        },
        {
          value: 2,
          result: 2,
          text: '默认数据2'
        },
      ]
      if (!this.picker) {
        this.picker = new Picker({
          data: [arr],
          title: '标题'
        })
        $(this.picker.confirmEl).text('确定')
        $(this.picker.cancelEl).text('取消')
        this.picker.on('picker.select', selectedVal => {
          console.log(selectedVal)
          // let result = arr[selectedVal]['result']
          console.log(result)
        })
        this.picker.on('picker.cancel', function () {
          console.log('cancel')
        })
        $(this.picker.maskEl).on('click', (e) => {
          $(this.picker.cancelEl).click()
        })
        this.picker.pickerEl.style.zIndex = '10000'
        this.picker.pickerEl.style.backgroundColor = 'transparent !important'
        let pickChoose = this.picker.pickerEl.querySelector('.picker-choose')
        let pickCancel = this.picker.cancelEl
        let pickConfirm = this.picker.confirmEl
        this.picker.panelEl.style.height = this.px2rem(486)
        $(this.picker.wheelEl).css({
          height: '3rem',
          fontSize: '0.56rem'
        })
        $(this.picker.wheelEl).find('.wheel-scroll').css({
          'margin-top': '1rem',
          'line-height': '1rem'
        })
        $(this.picker.wheelEl).find('.wheel-item').css({
          'height': '1rem'
        })
        pickCancel.style.padding = pickConfirm.style.padding = 0
        pickCancel.style.height = pickConfirm.style.height = '100%'
        pickChoose.style.backgroundColor = '#f8f8f8'
        pickChoose.querySelector('.picker-title').style.color = '#9b9b9b'
        pickChoose.querySelector('.picker-title').style.fontSize = this.px2rem(28)
        pickChoose.querySelector('.picker-title').style.fontWeight = 'normal'
        pickChoose.querySelector('.picker-title').style.height = '100%'
        pickChoose.querySelector('.picker-title').style.lineHeight = this.px2rem(92)
        pickChoose.style.height = this.px2rem(92)
        pickChoose.style.lineHeight = this.px2rem(92)
        pickCancel.style.paddingLeft = this.px2rem(32)
        pickCancel.style.color = '#333'
        pickCancel.style.fontSize = this.px2rem(32)
        pickConfirm.style.color = '#639ef4'
        pickConfirm.style.paddingRight = this.px2rem(32)
        pickConfirm.style.fontSize = this.px2rem(32)
        pickCancel.style.top = pickConfirm.style.top = 0
        $(this.picker.pickerEl).find('h1.picker-title').css({
          'overflow': 'hidden',
          'padding-top': this.px2rem(28),
          'line-height': 'normal'
        })
      }
      this.picker.selectedIndex = 0
      this.picker && this.picker.show()
    },
    // 像素转rem 
    px2rem(px) {
      return (px/75) + "rem"
    }
  }
}
</script>
<style lang="scss" scoped>
  html,body{
    font-size: 14px;
  }
</style>

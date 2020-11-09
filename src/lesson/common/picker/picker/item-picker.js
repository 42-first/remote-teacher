export function itemTemplate(list) {
  let str =''
  for (let i = 0; i < list.length; i++) {
    let item = list[i]
    str += `<li class="wheel-item" data-val="${item.value}"> ${item.text} </li>`
  }
  return str
}
export function pickerTemplate(pickerData) {
  let str = `<div class="picker"><div class="picker-mask mask-hook"></div><div class="picker-panel panel-hook"><div class="picker-choose choose-hook">`
  + `<span class="cancel cancel-hook">${pickerData.cancel}</span><span class="confirm confirm-hook">${pickerData.confirm}</span><h1 class="picker-title">${pickerData.title}</h1>`
  + `<div class="picker-content">`
  +`<div class="mask-top border-1px"></div>`
  +`<div class="mask-bottom border-1px"></div>`
  +`<div class="wheel-wrapper wheel-wrapper-hook">`
  let list = pickerData.data
  for(let i = 0; i < list.length;i++) {
    let itemList = list[i]
    str += `<div class="wheel wheel-hook"><ul class="wheel-scroll wheel-scroll-hook">`
    for(let j = 0; j < itemList.length; j++) {
      let item = itemList[j]
      str += `<li class="wheel-item" data-val="${item.value}">${item.text}</li>`
    }
    str += `</ul></div>`
  }
  str+= `</div></div><div class="picker-footer footer-hook"></div>`
  return str
}
import { NAVIGATOR_TYPE_ANDROID, NAVIGATOR_TYPE_IOS } from './constants'

/**
 * 判断手机类型.
 * @returns {string} 安卓类型返回Android 苹果类型返回Ios，其他返回other.
 */
export function getNavigatorType() {
  var u = navigator.userAgent
  // alert(u);
  var isAndroid = u.indexOf('Android') > -1 || u.indexOf('Adr') > -1 // android终端
  // var isiOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); // ios终端
  var isiOS = /(iPhone|iPad|iPod|iOS|Mac)/i.test(u)
  if (isAndroid) {
    return NAVIGATOR_TYPE_ANDROID
  } else if (isiOS) {
    return NAVIGATOR_TYPE_IOS
  }
  return ''
}

export function formatDate(date, type) {
  const y = date.getFullYear()
  const m = (date.getMonth() + 1).toString().padStart(2, '0')
  const d = date.getDate().toString().padStart(2, '0')
  const h = date.getHours().toString().padStart(2, '0')
  const _m = date.getHours().toString().padStart(2, '0')
  const s = date.getSeconds().toString().padStart(2, '0')
  if (type === 'year') {
    return [y]
  } else if (type === 'month') {
    return [y, m]
  } else if (type === 'day') {
    return [y, m, d]
  } else if (type === 'hour') {
    return [h, _m]
  } else if (type === 'minute') {
    return [h, _m]
  } else if (type === 'second') {
    return [h, _m, s]
  } else {
    return []
  }
}
/**
 * 高亮搜索关键字
 * @param {string} text 原始文本
 * @param {string} keyword 搜索关键字
 * @returns {string} 带高亮HTML的文本
 */
export function highlightText(text, keyword) {
  if (!keyword || !text) return text
  const keywordLower = keyword.toLowerCase()
  const textLower = text.toLowerCase()
  const index = textLower.indexOf(keywordLower)
  if (index === -1) return text
  const before = text.slice(0, index)
  const match = text.slice(index, index + keyword.length)
  const after = text.slice(index + keyword.length)
  return `${before}<span style="color: #009100; font-weight: 500;">${match}</span>${after}`
}

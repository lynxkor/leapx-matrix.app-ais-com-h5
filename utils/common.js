import { postJson, post } from '../../api/request'
/**
 * 枚举通用接口
 * @param {*} data
 */
export function getEnum(code, size) {
  return postJson('/datacenter/app/common/commonDictValue/getByType', { dictType: code, pageSize: size || 200 })
}
// 销售顾问/交付顾问/交付衍生工程师
export function getSalesConsultantEnum(orgCodeList, salesConfigKey) {
  return post('vr/app/order/common/userList', { orgCodeList, salesConfigKey })
}
// 获取门店
export function getStoreEnum(organization) {
  return post('/leapx/users/scope/type/org', organization)
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

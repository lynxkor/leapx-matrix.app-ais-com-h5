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


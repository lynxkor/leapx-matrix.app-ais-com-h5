import { get } from './request.js'

/**
 * 查询当前登录用户的灰度旗标
 * 返回 data: { [featureCode]: boolean }，key 为灰度平台的功能编码
 */
export function getGrayFlags() {
  return get('/hub/gray/flags')
}

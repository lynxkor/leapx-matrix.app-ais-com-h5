import { get, post, postJson } from './request.js'

/**
 * 车系列表
 * @param {Object} data
 */
export function getVehicleSeriesList(data) {
  return post('/datacenter/app/materials/vehicleSeries/list', data)
}

/**
 * 车型列表
 * @param {Object} data
 */
export function getVehicleModelList(data) {
  return post('/datacenter/app/materials/vehicleModel/list', data)
}

/**
 * 整车主数据-外观列表查询
 * @param {*} data
 */
export function getVehicleExterior(data) {
  return post('/datacenter/app/materials/vehicleExterior/list', data)
}

/**
 * 整车主数据-内饰列表查询
 * @param {*} data
 */
export function getVehicleInterior(data) {
  return post('/datacenter/app/materials/vehicleInterior/list', data)
}

/**
 * 整车主数据-轮毂列表查询
 * @param {*} data
 */
export function getVehicleWheelHub(data) {
  return post('/datacenter/app/materials/vehicleWheelHub/list', data)
}

/**
 * 整车主数据-选装包列表查询
 * @param {*} data
 */
export function getVehicleOptionPackage(data) {
  return post('/datacenter/app/materials/vehicleOptionPackage/list', data)
}

/**
 * 整车主数据-电池电芯列表查询
 * @param {*} data
 */
export function getVehicleBatteryCell(data) {
  return post('/datacenter/app/materials/vehicleBatteryCell/list', data)
}

/**
 * 整车主数据-车顶列表查询
 * @param {*} data
 */
export function getVehicleRoof(data) {
  return post('/datacenter/app/materials/vehicleRoof/list', data)
}

/**
 * 整车主数据-续航里程管理
 * @param {*} data
 */
export function getVehicleDrivingRange(data) {
  return post('/datacenter/app/materials/vehicleDrivingRange/list', data)
}

/**
 * 整车主数据-续配动力列表查询
 * @param {*} data
 */
export function getVehicleRangePower(data) {
  return post('/datacenter/app/materials/vehicleRangePower/list', data)
}

/**
 * 整车主数据-整车物料列表查询
 * @param {*} data
 */
export function getVehicleMaterials(data) {
  return post('/datacenter/app/materials/vehicleMaterials/list', data)
}

/**
 * 车型-年款-关联关系表列表查询
 * @param {*} data
 */
export function getVehicleModelYearTypeRelation(data) {
  return post('/datacenter/app/materials/vehicleModelYearTypeRelation/list', data)
}

/**
 * 车型-年款-关联关系表列表查询
 * @param {*} data
 */
export function getVehicleModelYearTypeRelationDistinctYeayType(data) {
  return post('/datacenter/app/materials/vehicleModelYearTypeRelation/listDistinctYearType', data)
}

/**
 * 查询当前用户拥有的所有资源列表
 * @param {Object} data
 */
export function getOwnerTree(data) {
  return get('/passport/resourceInfo/owner/tree', data)
}

/**
 * 查询网发门店
 * @param {Object} data
 */
export function storePage(data) {
  return postJson('network/app/user/store/page', data)
}

/**
 * 枚举通用接口
  * @param {*} data
  */
export function getEnum(code, size) {
  return postJson('/datacenter/web/common/commonDictValue/get', { dictType: code, pageSize: size || 200 })
}

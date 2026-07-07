import { filePostFormData } from './fileRequest'
import { post } from './request'

// 上传附件配置信息
export function getUploadConfig(data) {
  return post('/file/app/attachment/attachmentConfig/getByCodeWithBusinessData', data)
}
/**
 * 获取附件列表
 * @export
 * @param {Object} params {businessId, attachType}
 * @returns
 */
export function getFileList(params) {
  return post('/file/app/attachment/attachment/list', params)
}

// 上传文件流（走https://aisfile-sit.leapmotor.com）
export function uploadFile(data) {
  return filePostFormData('/app/fileService/uploadMultipartFile', data)
}

// 绑定业务关系
export function bindFile(data) {
  return post('/file/app/attachment/attachment/addOrUpdate', data)
}
// 车主身份证件识别回传
export function idCardOcr(data) {
  return post('/file/app/attachment/attachment/addBatch', data)
}
// 查询附件列表
export function getAttachmentList(data) {
  return post('/file/app/attachment/attachment/list', data)
}
// 上传附件配置明细删除
export function deleteAttachmentConfig(data) {
  return post('/file/app/attachment/attachment/delete', data)
}
// 通过URL上传文件
export function uploadFileByUrl(data) {
  return post('/file/app/fileService/uploadByUrl', data)
}

// 通过URL上传文件 新
export function addFileByUrl(data) {
  return post('/file/app/fileService/addByUrl', data)
}


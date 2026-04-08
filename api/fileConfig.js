import { filePost, filePostFormData } from '../../api/fileRequest'

// 上传附件配置信息
export function getUploadConfig(data) {
  return filePost('/app/attachment/attachmentConfig/getByCodeWithBusinessData', data)
}
/**
 * 获取附件列表
 * @export
 * @param {Object} params {businessId, attachType}
 * @returns
 */
export function getFileList(params) {
  return filePost('/app/attachment/attachment/list', params)
}

// 上传文件流
export function uploadFile(data) {
  return filePostFormData('/fileService/uploadMultipartFile', data)
}

// 绑定业务关系
export function bindFile(data) {
  return filePost('/app/attachment/attachment/addOrUpdate', data)
}
// 车主身份证件识别回传
export function idCardOcr(data) {
  return filePost('/app/attachment/attachment/addBatch', data)
}
// 查询附件列表
export function getAttachmentList(data) {
  return filePost('/app/attachment/attachment/list', data)
}
// 上传附件配置明细删除
export function deleteAttachmentConfig(data) {
  return filePost('/app/attachment/attachment/delete', data)
}
// 通过URL上传文件
export function uploadFileByUrl(data) {
  return filePost('/fileService/uploadByUrl', data)
}


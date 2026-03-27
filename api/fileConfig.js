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
export function getFileList (params) {
  return filePost('/app/attachment/attachment/list', params);
}

// 上传文件流
export function uploadFile (data) {
  return filePostFormData('/fileService/uploadMultipartFile', data)
}

// 绑定业务关系
export function bindFile (data) {
  return filePost('/app/attachment/attachment/addOrUpdate', data)
}
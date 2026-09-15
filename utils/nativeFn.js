import { getNavigatorType } from './index'
import { NAVIGATOR_TYPE_ANDROID, NAVIGATOR_TYPE_IOS } from './constants'
const navigatorType = getNavigatorType()

export function toScan(types = [1, 2, 3]) {
  // 1-vin码 2-钥匙 3-合格证 4-任意二维码
  // 跳转扫码
  const typeArr = Array.isArray(types) ? types : [types]
  if (navigatorType === NAVIGATOR_TYPE_ANDROID) {
    window.Android.toScan(JSON.stringify(typeArr), true)
  } else if (navigatorType === NAVIGATOR_TYPE_IOS) {
    window.webkit.messageHandlers.toScan.postMessage({
      type: typeArr,
      isBack: true
    })
  }
}

export function getAppImg() {
  if (navigatorType === NAVIGATOR_TYPE_ANDROID) {
    window.Android.selectImage()
  } else if (navigatorType === NAVIGATOR_TYPE_IOS) {
    window.webkit.messageHandlers.selectImage.postMessage(null)
  }
}
// 外呼
export function callPhone(phone) {
  if (navigatorType === NAVIGATOR_TYPE_ANDROID) {
    console.log('phone:', phone)
    window.Android.outBoundCall(phone)
  } else if (navigatorType === NAVIGATOR_TYPE_IOS) {
    window.webkit.messageHandlers.outBoundCall.postMessage(phone)
  }
}
// 选择图片支持相册和拍照
export function getAppImgLimit(limitSize, maxNum, hasUploadNumber) {
  if (navigatorType === NAVIGATOR_TYPE_ANDROID) {
    window.Android.selectImageLimit(limitSize)
  } else if (navigatorType === NAVIGATOR_TYPE_IOS) {
    window.webkit.messageHandlers.selectImageLimit.postMessage(limitSize)
  }
}
// 批量上传图片
export function batchUploadImageLimit(limitSize, maxNum, hasUploadNumber = 1) {
  const params = {
    limitSize: String(limitSize),
    limitNumber: String(maxNum),
    hasUploadNumber: String(hasUploadNumber)
  }
  if (navigatorType === NAVIGATOR_TYPE_ANDROID) {
    window.Android.batchUploadImage(JSON.stringify(params))
  } else if (navigatorType === NAVIGATOR_TYPE_IOS) {
    window.webkit.messageHandlers.batchUploadImage.postMessage(JSON.stringify(params))
  }
}

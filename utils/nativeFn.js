import { getNavigatorType } from './index'
import { NAVIGATOR_TYPE_ANDROID, NAVIGATOR_TYPE_IOS } from './constants'
const navigatorType = getNavigatorType()

export function toScan() {
  // 1vin码 2钥匙 3合格证
  // 跳转扫码
  if (navigatorType === NAVIGATOR_TYPE_ANDROID) {
    window.Android.toScan('[1,2,3]', true)
  } else if (navigatorType === NAVIGATOR_TYPE_IOS) {
    window.webkit.messageHandlers.toScan.postMessage({
      type: [1, 2, 3],
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
export function batchUploadImageLimit(limitSize, maxNum, hasUploadNumber) {
  const params = {
    limitSize: String(limitSize),
    limitNumber: String(maxNum),
    hasUploadNumber: String(0)
  }
  if (navigatorType === NAVIGATOR_TYPE_ANDROID) {
    window.Android.batchUploadImage(JSON.stringify(params))
  } else if (navigatorType === NAVIGATOR_TYPE_IOS) {
    window.webkit.messageHandlers.batchUploadImage.postMessage(JSON.stringify(params))
  }
}

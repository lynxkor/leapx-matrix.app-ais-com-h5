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
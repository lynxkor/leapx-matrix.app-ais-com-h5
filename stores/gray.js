import { defineStore } from 'pinia'
import { getGrayFlags } from '@/libs/api/gray'
import { getStoredToken } from '@/libs/utils/authToken'

/**
 * 灰度旗标 store（数据来源 GET /hub/gray/flags）
 * 接入方式：
 * 1. main.js 在 token 就绪挂载后调用 useGrayStore().fetchFlags() 预取
 * 2. 项目自行维护灰度平台的功能编码（featureCode）常量，业务用 useGrayStore().isGray(code) 判断
 * 3. 首屏渲染依赖旗标时，可 await fetchFlags() 或判断 loaded，避免闪烁
 */

// 进行中的请求，用于并发去重
let pending = null

export const useGrayStore = defineStore('gray', {
  state: () => ({
    flags: {}, // 当前用户灰度旗标 { [featureCode]: boolean }
    loaded: false // 旗标请求是否已结束（成功或失败）
  }),
  getters: {
    // 是否命中灰度：未下发/未加载/请求失败均视为未命中
    isGray: (state) => (featureCode) => state.flags[featureCode] === true
  },
  actions: {
    // 拉取灰度旗标：无登录态（外网页面、取 token 超时）不请求，避免触发登录过期弹窗；
    // 请求中重复调用复用同一请求，结束后再调用即刷新
    fetchFlags() {
      if (!getStoredToken()) return Promise.resolve()
      if (!pending) {
        pending = getGrayFlags()
          .then((res) => {
            this.flags = res?.data || {}
          })
          .catch(() => {}) // 错误提示由 request 拦截器统一处理，flags 保持原值
          .finally(() => {
            this.loaded = true
            pending = null
          })
      }
      return pending
    }
  }
})

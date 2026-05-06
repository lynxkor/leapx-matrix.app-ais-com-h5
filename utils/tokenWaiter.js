/**
 * 等待 lxpToken 就绪的工具函数
 * 解决 iOS 首次加载时客户端注入 token 晚于 Vue 应用初始化的问题
 */

/**
 * 等待 lxpToken 就绪
 * @param {Object} options 配置项
 * @param {number} options.maxWait 最大等待时间（毫秒），默认 3000
 * @param {number} options.interval 轮询间隔（毫秒），默认 100
 * @returns {Promise<boolean>} token 是否就绪
 */
export async function waitForToken(options = {}) {
  const { maxWait = 3000, interval = 100 } = options
  const start = Date.now()

  while (!localStorage.getItem('lxpToken')) {
    if (Date.now() - start >= maxWait) {
      return false
    }
    await new Promise(resolve => setTimeout(resolve, interval))
  }
  return true
}

/**
 * 显示加载状态（在 index.html 中预设）
 */
export function showTokenLoading() {
  const loadingEl = document.getElementById('app-loading')
  const errorEl = document.getElementById('app-error')
  if (loadingEl) loadingEl.style.display = 'flex'
  if (errorEl) errorEl.style.display = 'none'
}

/**
 * 显示错误状态（token 获取失败时）
 */
export function showTokenError() {
  const loadingEl = document.getElementById('app-loading')
  const errorEl = document.getElementById('app-error')
  if (loadingEl) loadingEl.style.display = 'none'
  if (errorEl) errorEl.style.display = 'flex'
}

/**
 * 等待 token 并挂载 Vue 应用
 * @param {Object} app Vue 应用实例
 * @param {Object} options 配置项
 * @param {number} options.maxWait 最大等待时间（毫秒），默认 3000
 * @param {number} options.interval 轮询间隔（毫秒），默认 100
 */
export async function mountWithToken(app, options = {}) {
  const tokenReady = await waitForToken(options)

  if (tokenReady) {
    app.mount('#app')
  } else {
    showTokenError()
  }
}

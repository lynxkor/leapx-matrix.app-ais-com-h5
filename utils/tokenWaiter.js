/**
 * 等待 lxpToken 就绪的工具函数
 * 解决 iOS 首次加载时客户端注入 token 晚于 Vue 应用初始化的问题
 */
/**
 * 注入 loading 和 error UI 到 #app 容器
 */
function injectLoadingUI() {
  const appEl = document.getElementById('app')
  if (!appEl) return

  // 注入样式
  const style = document.createElement('style')
  style.textContent = `
    /* loading spinner 样式，参考 Vant Loading 组件 */
    .app-loading-spinner {
      width: 30px;
      height: 30px;
      border: 3px solid #e5e5e5;
      border-top-color: #00AA00;
      border-radius: 50%;
      animation: app-loading-spin 0.8s linear infinite;
    }
    @keyframes app-loading-spin {
      to { transform: rotate(360deg); }
    }
    /* 重新加载按钮样式，参考 RefreshList.vue 重置筛选按钮 */
    .app-reload-btn {
      border-radius: 4px;
      width: 88px;
      height: 32px;
      font-size: 14px;
      color: #009100;
      border: 1px solid #009100;
      background: transparent;
      cursor: pointer;
    }
  `
  document.head.appendChild(style)

  // 注入 loading 元素
  const loadingEl = document.createElement('div')
  loadingEl.id = 'app-loading'
  loadingEl.style.cssText = 'display: flex; align-items: center; justify-content: center; height: 80vh;'
  loadingEl.innerHTML = '<div class="app-loading-spinner"></div>'
  appEl.appendChild(loadingEl)

  // 注入 error 元素
  const errorEl = document.createElement('div')
  errorEl.id = 'app-error'
  errorEl.style.cssText = 'display: none; flex-direction: column; align-items: center; justify-content: center; height: 80vh;'
  errorEl.innerHTML = `
    <div style="font-size: 14px; color: #6c6e6c; font-weight: 400; margin-bottom: 16px;">获取登录信息失败，请重试</div>
    <button onclick="location.reload()" class="app-reload-btn">重新加载</button>
  `
  appEl.appendChild(errorEl)
}

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
 * 显示加载状态
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
  // 注入 loading UI
  injectLoadingUI()

  const tokenReady = await waitForToken(options)

  if (tokenReady) {
    app.mount('#app')
  } else {
    showTokenError()
  }
}

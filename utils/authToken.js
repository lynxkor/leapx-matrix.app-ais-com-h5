const TOKEN_KEY = 'lxpToken'

export const getStoredToken = () => localStorage.getItem(TOKEN_KEY) || ''

export const normalizeBearerToken = (token) => {
  const trimmedToken = `${token || ''}`.trim()

  if (!trimmedToken) {
    return ''
  }

  return trimmedToken.replace(/^Bearer\s+/i, '')
}

export const getAuthorizationToken = (storeToken) => {
  const latestToken = getStoredToken() || storeToken

  return normalizeBearerToken(latestToken)
}

export const applyAuthHeaders = (config, storeToken) => {
  const token = getAuthorizationToken(storeToken)

  if (token) {
    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${token}`
    config.headers.platform = 'leapx'
  }

  config.authToken = token

  return config
}

export const waitForTokenChange = (requestToken, options = {}) => {
  const {
    intervalMs = 500,
    maxAttempts = 20,
    signal = null
  } = options

  let resolvePromise
  const promise = new Promise((resolve) => {
    resolvePromise = resolve
  })

  let attempts = 0
  let interval = null
  let settled = false

  const finish = (value) => {
    if (settled) return
    settled = true
    if (interval) {
      clearInterval(interval)
      interval = null
    }
    if (signal && abortHandler) {
      signal.removeEventListener('abort', abortHandler)
    }
    resolvePromise(value)
  }

  let abortHandler = null
  if (signal) {
    if (signal.aborted) {
      finish('')
      return promise
    }
    abortHandler = () => finish('')
    signal.addEventListener('abort', abortHandler, { once: true })
  }

  const currentToken = getStoredToken()
  if (currentToken && currentToken !== requestToken) {
    finish(currentToken)
    return promise
  }

  interval = setInterval(() => {
    attempts++
    const latest = getStoredToken()
    if (latest && latest !== requestToken) {
      finish(latest)
    } else if (attempts >= maxAttempts) {
      finish('')
    }
  }, intervalMs)

  // 暴露取消方法：调用后停止轮询并立即 resolve('')，
  // 可用于组件卸载 / 用户关闭对话框 / 提前中断等待等场景。
  promise.cancel = () => finish('')

  return promise
}

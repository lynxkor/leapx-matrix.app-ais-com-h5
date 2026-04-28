<template>
  <div class="base-container" :style="{ marginTop: shouldShowSafeIosArea ? safeAreaTop : '0px' }">
    <header style="z-index: 5000;" v-if="!route.meta?.hideHeader">
      <van-nav-bar
        :title="globalStore.title"
        left-arrow
        @click-left="handleBack"
      >
        <template #title>
          <div class="custom-title">
            <span v-html="globalStore.title"></span>
          </div>
        </template>
        <template #right v-if="route.path === '/deliveryAssignment/list'">
          <div @click="goDispatch">自动分派设置</div>
        </template>
      </van-nav-bar>
    </header>
    <div class="layout-content">
      <RouterView #default="{ Component, route }">
        <KeepAlive :include="keepAliveRouteNames">
          <component
            :is="Component"
            :key="route.name"
            v-if="route.meta?.keepAlive"
            ref="currentRouteComponent"
          />
        </KeepAlive>
        <component
          v-if="!route.meta?.keepAlive"
          :is="Component"
          :key="route.name"
          ref="currentRouteComponent"
        />
      </RouterView>
    </div>
  </div>
</template>

<script setup>
import { RouterView, useRouter, useRoute } from 'vue-router'
import { ref, computed, watch, onMounted } from 'vue'
import { useGlobalStore } from '@/stores/global'

const globalStore = useGlobalStore()

const router = useRouter()
const route = useRoute()

// 当前路由组件实例
const currentRouteComponent = ref(null)

// 安全区域顶部距离
const safeAreaTop = ref('0px')

const isIOS = computed(() => {
  const userAgent = navigator.userAgent.toLowerCase()
  return /iphone|ipad|ipod/.test(userAgent)
})
const needsSafeArea = computed(() => {
  const targetRoutes = [
    '/awaitingDeliveryAppointment/list',
    '/soldRegisteredCarInfo/list',
    '/soldRegisteredCarInfo/add'
  ]
  return targetRoutes.includes(route.path)
})
const shouldShowSafeIosArea = computed(() => {
  return isIOS.value && needsSafeArea.value
})

// 获取安全区域信息
onMounted(() => {
  if (shouldShowSafeIosArea.value) {
    // 方法1: 尝试通过CSS环境变量获取
    try {
      const tempDiv = document.createElement('div')
      tempDiv.style.paddingTop = 'env(safe-area-inset-top, 0px)'
      // 确保元素不可见且不影响布局
      tempDiv.style.position = 'absolute'
      tempDiv.style.visibility = 'hidden'
      document.body.appendChild(tempDiv)

      const computedStyle = window.getComputedStyle(tempDiv)
      const envValue = computedStyle.paddingTop
      document.body.removeChild(tempDiv)

      if (envValue && envValue !== '0px') {
        safeAreaTop.value = envValue
        console.log('安全区域顶部距离 (env):', envValue)
        return
      }
    } catch (e) {
      console.log('env方法失败:', e)
    }

    // 方法2: 通过window.visualViewport（现代浏览器）
    if (window.visualViewport) {
      const viewport = window.visualViewport
      // iOS 13+ 支持 visualViewport.offsetTop
      if (viewport.offsetTop > 0) {
        safeAreaTop.value = `${viewport.offsetTop}px`
        console.log('通过visualViewport获取安全区域:', safeAreaTop.value)
        return
      }
    }

    // 方法3: 通过屏幕和窗口尺寸计算（fallback）
    const screenHeight = window.screen.height
    const windowHeight = window.innerHeight
    const addressBarHeight = screenHeight - windowHeight

    // 如果地址栏高度很小，可能是全屏模式，检查是否有刘海
    if (addressBarHeight < 50) {
      const userAgent = navigator.userAgent
      if (userAgent.includes('iPhone')) {
        // 根据设备型号估算
        if (screenHeight >= 812) { // iPhone X及以上
          safeAreaTop.value = '44px'
        } else if (screenHeight >= 896) { // iPhone XR/XS Max及以上
          safeAreaTop.value = '48px'
        }
      }
    }

    console.log('最终安全区域顶部距离:', safeAreaTop.value)
  }
})

// 处理返回按钮点击
const handleBack = () => {
  // 检查当前路由组件是否定义了 onBeforeBack 方法
  if (currentRouteComponent.value && typeof currentRouteComponent.value.onBeforeBack === 'function') {
    const result = currentRouteComponent.value.onBeforeBack()
    // 如果返回 false，阻止默认返回行为
    if (result === false) {
      return
    }
  }
  // 默认返回行为
  if (route.meta?.closeWindow === 1) {
    // 已售上牌车辆单独加判断
    outWebview()
  } else if (window.history.length > 1) {
    window.history.go(-1)
  } else {
    outWebview()
  }
}

// 退出webview
const outWebview = () => {
  const navigatorType = navigator.userAgent.toLowerCase()
  if (navigatorType.includes('android')) {
    if (window.Android && window.Android.goback) {
      window.Android.goback()
    }
  } else if (navigatorType.includes('iphone') || navigatorType.includes('ipad')) {
    if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.revert) {
      window.webkit.messageHandlers.revert.postMessage(null)
    }
  } else {
    window.close()
  }
}

// 监听路由变化，当从隐藏头部的页面返回时恢复标题
watch(
  () => route.fullPath,
  (newPath, oldPath) => {
    // 如果当前路由不隐藏头部，则恢复标题
    if (!route.meta?.hideHeader && route.meta?.title) {
      globalStore.setTitle(route.meta.title)
    }
  },
  { immediate: true }
)
const keepAliveRouteNames = computed(() => {
  return router
    .getRoutes()
    .filter((route) => route.meta?.keepAlive && route.name)
    .map((route) => route.name)
})
// const keepAliveRouteNames = ['PdiListView']
console.log('keep', keepAliveRouteNames, route)
const goDispatch = () => {
  router.push({
    path: '/autoDispatchSetting/index'
    // query: {
    //   id: 'asd14a56s4d56as',
    // },
  })
}
</script>

<style lang="scss" scoped>
.base-container {
  width: 100%;
  height: 100%;
  background: #f7f7f7;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.layout-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;

  &::-webkit-scrollbar {
    display: none;
  }
}
</style>

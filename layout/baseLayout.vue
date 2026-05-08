<template>
  <div class="base-container" :style="baseContainerStyle">
    <header v-if="!route.meta?.hideHeader" class="base-header" :style="headerStyle">
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
  if (route.meta?.hideHeader) {
    return false
  }

  const excludedRoutes = [
    '/settlement-statement/after-sales'
  ]
  const targetRoutes = [
    '/awaitingDeliveryAppointment/list',
    '/soldRegisteredCarInfo/list',
    '/soldRegisteredCarInfo/add',
    // 结算单模块
    '/settlement-statement',
    '/settlement-statement/search',
    '/settlement-statement/after-sales',
    // 预授权模块
    '/pre-authorization/list',
    '/pre-authorization/detail',
    '/pre-authorization/create',
    '/pre-authorization/search',
    // 接车施工单模块
    '/reception/work-order',
    '/reception/work-order-search',
    '/reception/vehicle-search',
    '/reception/work-order/create',
    '/reception/work-order/detail',
    '/reception/work-order/edit',
    '/reception/maintenance-history',
    '/reception/rights-query',
    '/reception/select-package',
    '/reception/add-parts',
    '/reception/sign',
    // 维修作业模块
    '/repairWork/list',
    '/repairWork/search'
  ]

  if (excludedRoutes.some(targetRoute => route.path === targetRoute || route.path.startsWith(targetRoute))) {
    return false
  }

  return targetRoutes.some(targetRoute => route.path === targetRoute || route.path.startsWith(targetRoute))
})

const shouldShowSafeIosArea = computed(() => {
  return isIOS.value && needsSafeArea.value
})

// 计算 base-container 的样式，同时设置 CSS 变量供子组件使用
const baseContainerStyle = computed(() => {
  const safeTop = shouldShowSafeIosArea.value ? safeAreaTop.value : '0px'
  return {
    '--safe-area-top': safeTop,
    '--nav-bar-total-height': `calc(46px + ${safeTop})`
  }
})

// header 的样式，用于添加顶部安全区域内边距
const headerStyle = computed(() => {
  return {
    paddingTop: shouldShowSafeIosArea.value ? safeAreaTop.value : '0px'
  }
})

// 获取安全区域信息。只使用系统真实暴露的值，避免在已内嵌安全区的 WebView 中重复估算 44px。
const updateSafeAreaTop = () => {
  if (!isIOS.value) {
    safeAreaTop.value = '0px'
    return
  }

  try {
    const tempDiv = document.createElement('div')
    tempDiv.style.paddingTop = 'env(safe-area-inset-top, 0px)'
    tempDiv.style.position = 'absolute'
    tempDiv.style.visibility = 'hidden'
    document.body.appendChild(tempDiv)

    const computedStyle = window.getComputedStyle(tempDiv)
    const envValue = computedStyle.paddingTop
    document.body.removeChild(tempDiv)

    if (envValue && envValue !== '0px') {
      safeAreaTop.value = envValue
      return
    }
  } catch (e) {
    console.log('env方法失败:', e)
  }

  if (window.visualViewport && window.visualViewport.offsetTop > 0) {
    safeAreaTop.value = `${window.visualViewport.offsetTop}px`
    return
  }

  safeAreaTop.value = '0px'
}

onMounted(() => {
  updateSafeAreaTop()
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
.base-header {
  position: relative;
  z-index: 100;
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

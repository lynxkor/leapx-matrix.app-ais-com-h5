<template>
  <div class="base-container" :style="baseContainerStyle">
    <header style="z-index: 2008;" v-if="!route.meta?.hideHeader" :style="headerStyle">
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
        <template #right>
          <!-- 子应用通过<Teleport to="#header-right-portal" defer>xxx</Teleport>形式插入 -->
          <div id="header-right-portal"></div>
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
import { ref, computed, watch } from 'vue'
import { useGlobalStore } from '@/stores/global'
import { usePageSafeArea } from '@/utils/safeArea'

const globalStore = useGlobalStore()

const { safeAreaTop, navBarOffsetTop } = usePageSafeArea()

const baseContainerStyle = computed(() => ({
  '--safe-area-top': safeAreaTop.value,
  '--nav-bar-total-height': `${navBarOffsetTop.value}px`
}))

const headerStyle = computed(() => ({
  // paddingTop: safeAreaTop.value
}))

const router = useRouter()
const route = useRoute()

// 当前路由组件实例
const currentRouteComponent = ref(null)

// 处理返回按钮点击
const handleBack = () => {
  // 检查当前路由组件是否定义了 onBeforeBack 方法
  if (currentRouteComponent.value && typeof currentRouteComponent.value.onBeforeBack === 'function') {
    const result = currentRouteComponent.value.onBeforeBack()
    if (result === false) {
      return
    }
  }
  // 默认返回行为
  if (route.meta?.closeWindow === 1) {
    // 已售上牌车辆单独加判断
    outWebview()
  } else if (window.history.length > 1) {
    window.history.back()
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

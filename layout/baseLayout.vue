<template>
  <div class="base-container">
    <header style="z-index: 5000">
      <van-nav-bar :title="globalStore.title" left-arrow @click-left="goBack">
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
          <component :is="Component" :key="route.name" v-if="route.meta?.keepAlive" />
        </KeepAlive>
        <component v-if="!route.meta?.keepAlive" :is="Component" :key="route.name" />
      </RouterView>
    </div>
  </div>
</template>

<script setup lang="ts">
import { RouterView, useRouter, useRoute } from 'vue-router'
import { ref, computed } from 'vue'

import { useGlobalStore } from '@/stores/global'
import { goBack } from '../utils/app'

const globalStore = useGlobalStore()

const router = useRouter()
const route = useRoute()
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
    path: '/autoDispatchSetting/index',
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
}
</style>

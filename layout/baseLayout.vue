<template>
  <div class="base-container">
    <header style="z-index: 5000">
      <van-nav-bar
        :title="globalStore.title"
        left-arrow
        @click-left="goBack"
      >
        <template #title>
          <div class="custom-title">
            <span v-html="globalStore.title"></span>
          </div>
        </template>
      </van-nav-bar>
    </header>
    <div class="layout-content">
      <RouterView #default="{ Component, route }">
        <KeepAlive :include="keepAliveRouteNames">
          <component :is="Component" :key="route.name" />
        </KeepAlive>
        <component v-if="!route.meta?.keepAlive" :is="Component" :key="route.name" />
      </RouterView>
    </div>
  </div>

</template>

<script setup lang="ts">
import { RouterView, useRouter } from 'vue-router'
import { ref, computed } from 'vue'

import { useGlobalStore } from '@/stores/global'
import { goBack } from '../utils/app'

const globalStore = useGlobalStore()

const router = useRouter()
const keepAliveRouteNames = computed(() => {
  return router.getRoutes()
    .filter(route => route.meta?.keepAlive && route.name)
    .map(route => route.name)
})
// const keepAliveRouteNames = ['PdiListView']
console.log('keep', keepAliveRouteNames)

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
  .layout-content{
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
  }
</style>

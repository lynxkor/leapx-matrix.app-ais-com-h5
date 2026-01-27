<template>
  <van-pull-refresh v-model="refreshing" @refresh="onRefresh" class="pull-refresh-content">
    <van-list
      v-model:loading="loading"
      :finished="finished"
      finished-text="没有更多了"
      @load="onLoad"
    >
      <p>刷新次数: {{ count }}</p>
      <van-cell v-for="item in list" :key="item" :title="item" />
      <!-- 后续需要将列表里的item通过slot传入 -->
    </van-list>
  </van-pull-refresh>
</template>

<script setup>
import { ref } from 'vue'

const count = ref(0)

const list = ref([])
// 上拉请求中
const loading = ref(false)
// 是否还有更多数据
const finished = ref(false)
// 下拉刷新中
const refreshing = ref(false)

const onRefresh = () => {
  // 下拉刷新，清空列表数据，重置页码
  setTimeout(() => {
    console.log('刷新成功')
    loading.value = false
    finished.value = false
    count.value++
    list.value = []
    onLoad()
  }, 1000)
}

const onLoad = () => {
  // 下拉加载更多
  // 页码加1
  setTimeout(() => {
    if (refreshing.value) {
      list.value = []
      refreshing.value = false
    }

    for (let i = 0; i < 10; i++) {
      list.value.push(list.value.length + 1)
    }
    loading.value = false

    if (list.value.length >= 40) {
      finished.value = true
    }
  }, 1000)
}

</script>

<style lang="scss">
  .pull-refresh-content{
    height: 100%;
  }
</style>

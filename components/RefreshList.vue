<template>
  <van-pull-refresh v-model="refreshing" @refresh="onRefresh" class="pull-refresh-content">
    <van-list
      v-model:loading="loading"
      :finished="finished"
      finished-text="没有更多了"
      @load="onLoad"
      class="van-list-content"
    >
      <div class="slot-content">
        <slot></slot>
      </div>
    </van-list>
  </van-pull-refresh>
</template>

<script setup>
import { ref, defineProps, defineEmits } from 'vue'

const props = defineProps({

})

const emit = defineEmits(['setData'])

const count = ref(0)

// 上拉请求中
const loading = ref(false)
// 是否还有更多数据
const finished = ref(false)
// 下拉刷新中
const refreshing = ref(false)

const onRefresh = () => {
  // 下拉刷新，清空列表数据，重置页码
  setTimeout(() => {
    loading.value = false
    finished.value = false
    count.value++
    emit('setData', [])
    onLoad()
  }, 1000)
}

const onLoad = () => {
  // 下拉加载更多
  // 页码加1
  setTimeout(() => {
    if (refreshing.value) {
      refreshing.value = false
    }
    const _data = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    loading.value = false
    // 条件判断加载完毕
    finished.value = true
    emit('setData', _data)
  }, 1000)
}

</script>

<style lang="scss">
  .pull-refresh-content{
    height: 100%;
  }
  .van-list-content{
    height: 100%;
    overflow-y: auto
  }
  .slot-content{
    width: 94vw;
    margin: 0 auto;
  }
</style>

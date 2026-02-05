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
import { ref, reactive, defineProps, defineEmits, watch } from 'vue'

const props = defineProps({
  requestData: {
    type: Object,
    default: () => {
      return {}
    }
  }
})

const emit = defineEmits(['setData'])

// 上拉请求中
const loading = ref(false)
// 是否还有更多数据
const finished = ref(false)
// 下拉刷新中
const refreshing = ref(false)
const searchParams = reactive({})
// 接口请求中
const isFetch = ref(false)

const onRefresh = () => {
  finished.value = false
  // 下拉需要手动刷新列表
  getData(true)
}

const onLoad = () => {
  // 上拉加载更多
  if (finished.value || isFetch.value) {
    return
  }
  if (refreshing.value) {
    refreshing.value = false
  }
  getData()
}

const getData = (isRefresh) => {
  if (isRefresh) {
    searchParams.pageNum = 1
  }
  // loading.value = true
  isFetch.value = true
  console.log('搜索项', searchParams)
  props.requestData.api(searchParams).then(res => {
    console.log('res', res)
    if (res.code === 200) {
      const data = res.data
      emit('setData', {
        list: data.records,
        isRefresh: data.current === 1
      })
      if (data.current * data.pageSize >= data.total) {
        // 条件判断加载完毕
        finished.value = true
      } else {
        // 未加载完毕，页码加1
        searchParams.pageNum = searchParams.pageNum + 1
        finished.value = false
      }
      isFetch.value = false
    }
  }).catch(err => {
    loading.value = false
    refreshing.value = false
    isFetch.value = false
    console.log(err)
    emit('setData', [])
  }).finally(() => {
    loading.value = false
    refreshing.value = false
    isFetch.value = false
  })
}

// 标记是否是首次执行
let isFirstWatch = true

watch(
  () => props.requestData,
  newVal => {
    Object.assign(searchParams, { ...newVal.data })
    // 首次不加载数据，后续变化才加载
    if (!isFirstWatch) {
      getData()
    } else {
      isFirstWatch = false
    }
  },
  {
    deep: true,
    immediate: true
  }
)

</script>

<style lang="scss">
  .slot-content{
    width: 94vw;
    margin: 0 auto;
  }
</style>

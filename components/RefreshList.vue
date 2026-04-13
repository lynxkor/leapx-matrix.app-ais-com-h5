<template>
  <van-pull-refresh v-model="refreshing" @refresh="onRefresh" class="pull-refresh-content">
    <van-loading color="#00AA00" class="loading-area" v-if="isLoading" />
    <van-list
      v-model:loading="loading"
      :finished="finished"
      :finished-text="finishedTextWithResetButton"
      @load="onLoad"
      class="van-list-content"
      v-else
    >
      <div class="slot-content">
        <slot></slot>
      </div>
      <div v-if="finished && hasNoData" class="reset-filters-container">
        <img class="no-data-img" src="../assets/image/no-data.png" alt="没有数据" />
        <p class="no-data-text">没有找到相关内容</p>
        <van-button
          plain
          type="primary"
          size="normal"
          @click="$emit('resetFilters')"
          class="reset-filters-btn"
        >
          重置筛选
        </van-button>
      </div>
    </van-list>
  </van-pull-refresh>
</template>

<script setup>
import { ref, reactive, watch, computed } from 'vue'
const props = defineProps({
  requestData: {
    type: Object,
    default: () => {
      return {}
    }
  },
  hasNoData: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['setData', 'resetFilters', 'onError'])

defineExpose({
  reset: () => {
    finished.value = false
    loading.value = false
    isFetch.value = false
    // 重置 isFetch 状态后，确保可以发起请求
    // 使用最新传入的 data 参数
    if (props.requestData && props.requestData.data) {
      const newParams = JSON.parse(JSON.stringify(props.requestData.data))
      Object.assign(searchParams, newParams)
      lastSearchParams.value = newParams
    }
    getData(true)
  },
  // 手动触发搜索，传入参数后执行查询
  search: (params) => {
    finished.value = false
    loading.value = false
    isFetch.value = false
    // 更新搜索参数
    if (params) {
      Object.assign(searchParams, params)
      // 保存当前参数用于下次比较
      lastSearchParams.value = JSON.parse(JSON.stringify(params))
    }
    getData(true)
  }
})

// 上拉请求中
const loading = ref(false)
// 是否还有更多数据
const finished = ref(false)
// 下拉刷新中
const refreshing = ref(false)
const searchParams = reactive({})
// 接口请求中
const isFetch = ref(false)
// 刷新 loading 态
const isLoading = ref(false)

const onRefresh = () => {
  finished.value = false
  // 下拉刷新时同步最新的请求参数（如当前tab状态值）
  if (props.requestData && props.requestData.data) {
    Object.assign(searchParams, JSON.parse(JSON.stringify(props.requestData.data)))
  }
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
  // 如果正在请求中，不重复请求
  if (isFetch.value) {
    return
  }
  if (isRefresh) {
    searchParams.pageNum = 1
    isLoading.value = true
  }
  isFetch.value = true
  console.log('搜索项', searchParams)
  props.requestData
    .api(searchParams)
    .then((res) => {
      console.log('res', res)
      if (res.code === 200) {
        const data = res.data
        let records = []
        let current = 1
        let total = 0
        let hasPagination = false

        // 判断返回数据格式
        if (Array.isArray(data)) {
          // 直接返回数组格式（非分页）
          records = data
          current = 1
          total = data.length
          hasPagination = false
        } else if (data && data.records) {
          // 分页对象格式
          records = data.records
          current = data.current
          total = data.total
          hasPagination = true
        } else if (data && data.historyList) {
          records = data.historyList
          hasPagination = false
        }

        emit('setData', {
          list: records,
          isRefresh: current === 1
        })

        // 判断是否加载完毕
        if (!hasPagination) {
          // 非分页接口，一次加载完毕
          finished.value = true
        } else if (
          records.length === 0 ||
          current * (data.pageSize || searchParams.pageSize) >= total
        ) {
          // 分页接口，判断是否还有更多数据
          finished.value = true
        } else {
          searchParams.pageNum = searchParams.pageNum + 1
          finished.value = false
        }
        isFetch.value = false
        isLoading.value = false
      } else {
        // 接口返回非 200 时也停止加载
        finished.value = true
        isFetch.value = false
        isLoading.value = false
        emit('onError', res.message || res.msg || '请求失败')
        emit('setData', { list: [], isRefresh: true })
      }
    })
    .catch((err) => {
      loading.value = false
      refreshing.value = false
      isFetch.value = false
      isLoading.value = false
      finished.value = true // 接口错误时停止加载
      console.log(err)
      emit('onError', err.message || '请求失败')
      emit('setData', { list: [], isRefresh: true })
    })
    .finally(() => {
      loading.value = false
      refreshing.value = false
      isFetch.value = false
      isLoading.value = false
    })
}

// 标记是否是首次执行 - 使用 ref 确保每个组件实例独立
const isFirstWatch = ref(true)
// 保存上一次的搜索参数，用于对比是否真正发生变化
const lastSearchParams = ref(null)

// 计算完成文本，如果无数据则显示重置按钮
const finishedTextWithResetButton = computed(() => {
  if (props.hasNoData) {
    return ''
  } else {
    return '没有更多了'
  }
})

// 深度比较两个对象是否相等
const isSearchParamsEqual = (oldParams, newParams) => {
  if (!oldParams || !newParams) return false
  const oldKeys = Object.keys(oldParams)
  const newKeys = Object.keys(newParams)
  if (oldKeys.length !== newKeys.length) return false
  for (const key of oldKeys) {
    const oldVal = oldParams[key]
    const newVal = newParams[key]

    // 处理数组类型
    if (Array.isArray(oldVal) && Array.isArray(newVal)) {
      if (oldVal.length !== newVal.length) return false
      // 比较数组内容（假设是基本类型数组）
      for (let i = 0; i < oldVal.length; i++) {
        if (oldVal[i] !== newVal[i]) return false
      }
      continue
    }

    // 处理普通值
    if (oldVal !== newVal) return false
  }
  return true
}

watch(
  () => JSON.parse(JSON.stringify(props.requestData.data)),
  (newSearchParams) => {
    Object.assign(searchParams, newSearchParams)

    // 首次不加载数据，后续变化才加载
    if (!isFirstWatch.value) {
      // 只有当搜索参数真正变化时才触发请求，避免相同参数重复调用
      if (!isSearchParamsEqual(lastSearchParams.value, newSearchParams)) {
        lastSearchParams.value = newSearchParams
        // 参数变化时显示loading效果
        getData(true)
      }
    } else {
      isFirstWatch.value = false
      lastSearchParams.value = newSearchParams
    }
  },
  {
    deep: true,
    immediate: true
  }
)
</script>

<style lang="scss">
.slot-content {
  width: 94vw;
  margin: 0 auto;
}
.loading-area {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 80vh;
}
.reset-filters-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-top: 66px;
  gap: 16px;
  padding: 15px 0;
  .no-data-img {
    width: 230px;
    height: 142px;
  }
}
.no-data-text {
  font-size: 14px;
  color: #6c6e6c;
  font-weight: 400;
}
.reset-filters-btn {
  border-radius: 4px;
  width: 88px;
  height: 32px;
  font-size: 14px;
  color: #009100 !important;
  border: 1px solid #009100 !important;
}
</style>

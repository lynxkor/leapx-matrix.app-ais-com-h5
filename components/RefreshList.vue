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
import { ref, reactive, defineProps, defineEmits, watch, computed } from 'vue'
const props = defineProps({
  requestData: {
    type: Object,
    default: () => {
      return {}
    },
  },
  hasNoData: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['setData', 'resetFilters'])

// 上拉请求中
const loading = ref(false)
// 是否还有更多数据
const finished = ref(false)
// 下拉刷新中
const refreshing = ref(false)
const searchParams = reactive({})
// 接口请求中
const isFetch = ref(false)
// 刷新loading态
const isLoading = ref(false)

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
    isLoading.value = true
  }
  // loading.value = true
  isFetch.value = true
  console.log('搜索项', searchParams)
  props.requestData
    .api(searchParams)
    .then((res) => {
      console.log('res', res)
      if (res.code === 200) {
        const data = res.data
        emit('setData', {
          list: data.records,
          isRefresh: data.current === 1,
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
        isLoading.value = false
      }
    })
    .catch((err) => {
      loading.value = false
      refreshing.value = false
      isFetch.value = false
      isLoading.value = false
      console.log(err)
      emit('setData', [])
    })
    .finally(() => {
      loading.value = false
      refreshing.value = false
      isFetch.value = false
      isLoading.value = false
    })
}

// 标记是否是首次执行
let isFirstWatch = true

// 计算完成文本，如果无数据则显示重置按钮
const finishedTextWithResetButton = computed(() => {
  if (props.hasNoData) {
    return ''
  } else {
    return '没有更多了'
  }
})

watch(
  () => props.requestData,
  (newVal) => {
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
    immediate: true,
  },
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

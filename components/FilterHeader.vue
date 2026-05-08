<template>
  <div style="box-shadow: 0px 1px 0px 0px rgba(210, 216, 223, 0.6)">
    <div class="search-content">
      <form action="/" class="search-input" :class="{ 'with-scan': showScan }">
        <van-search
          shape="round"
          v-model="searchValue"
          :placeholder="placeholder"
          @focus="focusEvent"
          @blur="blurEvent"
          @search="searchEvent"
          :clearable="true"
          clear-trigger="always"
          @clear.stop="clearSearch"
        />
        <img
          class="scan-icon"
          v-if="showScan"
          src="../assets/image/scan_icon.png"
          @click="scanClick"
        />
      </form>
      <div class="toggle-content" v-show="!isInput && showSort" @click="toggleSort">
        <img class="toggle-icon" :src="sortOrder ? sortDownIcon : sortUpIcon" />
        <span class="toggle-span">按照日期{{ sortOrder ? '升序' : '降序' }}</span>
      </div>
      <div v-if="showFilter" class="more-condition-container">
        <img
          :class="
            highlightSerchIcon ? 'more-condition-btn more-condition-btn-hl' : 'more-condition-btn'
          "
          :src="highlightSerchIcon ? moreIconHl : moreIcon"
          @click="showPannel"
        />
        <!-- 筛选条件数量角标 -->
        <div v-if="filterCount > 0" class="filter-count-badge">{{ filterCount }}</div>
      </div>
    </div>
    <van-popup
      position="top"
      v-model:show="popupShow"
      class="top-pop"
      :class="topupClass"
      :style="{ top: popupTop }"
      :z-index="6001"
    >
      <div class="pop-inner-content">
        <div class="pop-scroll-view">
          <div class="pop-scroll-left">
            <p
              v-for="(item, index) in searchList"
              :key="index"
              :class="index == activeIndex ? 'title-text active-title-text' : 'title-text'"
              @click="toggleActiveIndex(index)"
            >
              {{ item.title }}
            </p>
          </div>
          <div class="pop-scroll-right">
            <div
              class="option-view"
              v-for="(item, index) in searchList"
              :key="index"
              :ref="optionRefView"
            >
              <p class="option-title">{{ item.title }}</p>
              <div class="option-list">
                <template v-if="item.nodeType === 'single'">
                  <div v-if="!item.options.length" class="empty-text">
                    {{ item.placeholder }}
                  </div>
                  <p
                    v-else
                    v-for="(optionItem, optionIndex) in item.options"
                    :key="optionIndex"
                    :class="
                      searchForm[item.key] && searchForm[item.key] == optionItem.value
                        ? 'option-text active-option-text'
                        : 'option-text'
                    "
                    @click="
                      toggleOptionValue(item.key, optionItem.value, item.nodeType, item.callBack)
                    "
                  >
                    {{ optionItem.label }}
                  </p>
                </template>

                <template v-if="item.nodeType === 'multiple'">
                  <div v-if="!item.options.length" class="empty-text">
                    {{ item.placeholder }}
                  </div>
                  <p
                    v-else
                    v-for="(optionItem, optionIndex) in item.options"
                    :key="optionIndex"
                    :class="
                      searchForm[item.key] &&
                      Array.isArray(searchForm[item.key]) &&
                      searchForm[item.key].includes(optionItem.value)
                        ? 'option-text active-option-text'
                        : 'option-text'
                    "
                    @click="
                      toggleOptionValue(
                        item.key,
                        optionItem.value,
                        item.nodeType,
                        item.callBack,
                        item.resetDic,
                      )
                    "
                  >
                    {{ optionItem.label }}
                  </p>
                </template>
                <!-- 可输入框搜索下拉选择类型的, 支持输入搜索数据 -->
                <template v-if="item.nodeType === 'search'">
                  <search-dropdown
                    v-model="searchForm[item.key]"
                    v-model:search-keyword="item.searchKeyword"
                    :options="item.options"
                    :placeholder="item.placeholder"
                    @select="handleSearchSelect(item, $event)"
                    @focus="handleSearchFocus(item)"
                    @on-search="handleSearchInput(item, $event)"
                    @clear="handleSearchClear(item)"
                  />
                </template>
                <template
                  v-if="
                    item.nodeType === 'day' || item.nodeType === 'month' || item.nodeType === 'year'
                  "
                >
                  <p
                    v-for="(optionItem, optionIndex) in item.list"
                    :key="optionIndex"
                    :class="
                      searchForm[item.key] && searchForm[item.key] == optionItem.value
                        ? 'option-text active-option-text'
                        : 'option-text'
                    "
                    @click="toggleOptionValue(item.key, optionItem.value, item.nodeType)"
                  >
                    {{ optionItem.label }}
                  </p>
                  <p
                    :class="
                      searchForm[item.key] &&
                      searchForm[item.key].length &&
                      item.list &&
                      !item.list.map((item) => item.value).includes(searchForm[item.key])
                        ? 'option-text user-icon active-option-text'
                        : 'option-text user-icon'
                    "
                    @click="showPick(item)"
                  >
                    {{
                      choiceDic[item.key] == '自选'
                        ? '请选择时间'
                        : choiceDic[item.key][0].join('/') + '~' + choiceDic[item.key][1].join('/')
                    }}
                  </p>
                </template>
                <template
                  v-if="
                    item.nodeType === 'hour' ||
                    item.nodeType === 'minute' ||
                    item.nodeType === 'second'
                  "
                >
                  <p
                    v-for="(optionItem, optionIndex) in item.list"
                    :key="optionIndex"
                    :class="
                      searchForm[item.key] && searchForm[item.key] == optionItem.value
                        ? 'option-text active-option-text'
                        : 'option-text'
                    "
                    @click="toggleOptionValue(item.key, optionItem.value, item.nodeType)"
                  >
                    {{ optionItem.label }}
                  </p>
                  <p
                    :class="
                      searchForm[item.key] &&
                      searchForm[item.key].length &&
                      item.list &&
                      !item.list.map((item) => item.value).includes(searchForm[item.key])
                        ? 'option-text user-icon active-option-text'
                        : 'option-text user-icon'
                    "
                    @click="showPick(item)"
                  >
                    {{
                      choiceDic[item.key] == '自选'
                        ? '自选'
                        : choiceDic[item.key][0].join(':') + '~' + choiceDic[item.key][1].join(':')
                    }}
                  </p>
                </template>
              </div>
            </div>
          </div>
        </div>
        <div class="pop-inner-footer">
          <div class="clear-btn" @click="clearClick">清除全部</div>
          <div class="search-btn" @click="filterClick">开始筛选</div>
        </div>
      </div>
    </van-popup>
    <van-popup v-model:show="pickVisible" class="pick-outter" :close-on-click-overlay="false">
      <div class="pick-content">
        <p class="pick-title">自选时间</p>
        <div class="pick-time-line">
          <p
            :class="
              tempTime.selectType === 'start'
                ? 'pick-time-line-item pick-time-line-item-hl'
                : 'pick-time-line-item'
            "
            @click="timeItemClick('start')"
          >
            {{ dateTimeFilter(tempTime.startTime, tempTime.type) }}
          </p>
          <p class="pick-time-seperator">-</p>
          <p
            :class="
              tempTime.selectType === 'end'
                ? 'pick-time-line-item pick-time-line-item-hl'
                : 'pick-time-line-item'
            "
            @click="timeItemClick('end')"
          >
            {{ dateTimeFilter(tempTime.endTime, tempTime.type) }}
          </p>
        </div>
        <div class="picker-inner">
          <van-date-picker
            v-if="tempTime.type === 'year' || tempTime.type === 'month' || tempTime.type === 'day'"
            v-model="tempTime[`${tempTime.selectType}Time`]"
            :show-toolbar="false"
            :option-height="45"
            :visible-option-num="3"
            :columns-type="tempTime.columnsType"
            title="选择日期"
          />
          <van-time-picker
            v-if="
              tempTime.type === 'hour' || tempTime.type === 'minute' || tempTime.type === 'second'
            "
            v-model="tempTime[`${tempTime.selectType}Time`]"
            :show-toolbar="false"
            :option-height="45"
            :visible-option-num="3"
            :columns-type="tempTime.columnsType"
            title="选择日期"
          />
        </div>
        <p class="pick-btn" @click="pickClick">确定</p>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { ref, defineProps, reactive, watch, onMounted, defineEmits, onBeforeUpdate } from 'vue'
import { useRouter } from 'vue-router'
import { getNavigatorType, formatDate } from '../utils/index'
import { toScan } from '../utils/nativeFn'
import sortDownIcon from '../assets/image/sort_down_icon.svg'
import sortUpIcon from '../assets/image/sort_up_icon.svg'
import moreIcon from '../assets/image/more_condition_icon.png'
import moreIconHl from '../assets/image/more_condition_icon_highlight.png'
import SearchDropdown from './SearchDropdown.vue'

const navigatorType = getNavigatorType()
const router = useRouter()
const emit = defineEmits(['search', 'filterSearch', 'scanCb', 'searchFocus', 'searchChange'])
const props = defineProps({
  placeholder: {
    type: String,
    default: ''
  },
  filterList: {
    type: Array,
    default: () => {
      return []
    }
  },
  showScan: {
    type: Boolean,
    default: true
  },
  showSort: {
    type: Boolean,
    default: true
  },
  isHeaderClick: {
    type: Boolean,
    default: true
  },
  // 搜索页面路由配置 - 支持路由名称(name)或路径(path)
  searchPageRoute: {
    type: [String, Object],
    default: null
  },
  showFilter: { // 是否显示筛选按钮
    type: Boolean,
    default: true
  }
})

watch(
  () => props.isHeaderClick,
  (newVal) => {
    isHeaderScan.value = !newVal
  }
)

const searchList = ref([])
const searchValue = ref('')
const sortOrder = ref(false)
const isInput = ref(false)
const popupShow = ref(false)
const activeIndex = ref(0)
const searchForm = reactive({})
const topupClass = ref(navigatorType === 'Android' ? 'topup-android' : 'topup-ios')
const popupTop = ref('var(--nav-bar-total-height, 46px)')
const isHeaderScan = ref(props.isHeaderClick)
const multipleList = ref([])
const choiceDic = reactive({})
const tempTime = reactive({
  selectType: 'start',
  startTime: [],
  endTime: []
})
const pickVisible = ref(false)
const highlightSerchIcon = ref(false)
const filterCount = ref(0)

const itemRefs = ref([])
const optionRefView = (el) => {
  if (el) {
    itemRefs.value.push(el)
  }
}

onBeforeUpdate(() => {
  itemRefs.value = []
})

const dateTimeFilter = (_arr, type) => {
  if (type === 'year' || type === 'month' || type === 'day') {
    return _arr.join('/')
  } else if (type === 'hour' || type === 'minute' || type === 'second') {
    return _arr.join(':')
  }
}

onMounted(() => {
  if (searchList.value && searchList.value.length > 0) {
    setSearchForm()
  }

  window.getScanResult = (res) => {
    if (res) {
      let _scanValue = JSON.parse(res)[0]
      if (_scanValue.endsWith('-A')) {
        _scanValue = _scanValue.replaceAll('-A', '')
      } else if (_scanValue.endsWith('-B')) {
        _scanValue = _scanValue.replaceAll('-B', '')
      }
      if (!isHeaderScan.value) {
        // 父组件的操作扫码
        emit('scanCb', _scanValue)
      } else {
        // 头部的输入框扫码 - 直接覆盖原有值
        searchValue.value = _scanValue
        searchEvent(_scanValue)
      }
    }
  }
})

const setSearchForm = () => {
  // 先清空 multipleList，确保每次都是重新初始化
  multipleList.value = []
  searchList.value.forEach((item) => {
    let value
    if (item.nodeType === 'single') {
      value = item.default ? item.default : ''
    } else if (item.nodeType === 'multiple') {
      value = item.default ? item.default : []
      multipleList.value.push(item.key)
    } else if (item.nodeType === 'search') {
      value = item.default ? item.default : ''
    } else if (item.nodeType === 'year' || item.nodeType === 'month' || item.nodeType === 'day') {
      if (Array.isArray(item.default) && item.default.length) {
        value = item.default
        const _arr = [...value]
        choiceDic[item.key] = _arr
      } else {
        value = item.default
        choiceDic[item.key] = '自选'
      }
    } else if (
      item.nodeType === 'hour' ||
      item.nodeType === 'minute' ||
      item.nodeType === 'second'
    ) {
      if (Array.isArray(item.default) && item.default.length) {
        value = item.default
        const _arr = [...value]
        choiceDic[item.key] = _arr
      } else {
        value = item.default
        choiceDic[item.key] = '自选'
      }
    }
    searchForm[item.key] = value
  })
}

watch(
  () => props.filterList,
  (newSearchList) => {
    searchList.value = [...newSearchList]
    if (newSearchList && newSearchList.length > 0) {
      setSearchForm()
    }
  },
  { immediate: true }
)

const focusEvent = () => {
  isInput.value = true

  // 如果配置了搜索页面路由，则跳转到搜索页面
  if (props.searchPageRoute) {
    goToSearchPage()
  }
}

// 导航到搜索页面
const goToSearchPage = () => {
  if (!props.searchPageRoute) {
    return
  }

  // 构建路由参数
  let routeConfig = {}

  if (typeof props.searchPageRoute === 'string') {
    // 字符串形式：支持 name 或 path
    if (props.searchPageRoute.startsWith('/')) {
      routeConfig.path = props.searchPageRoute
    } else {
      routeConfig.name = props.searchPageRoute
    }
  } else if (typeof props.searchPageRoute === 'object') {
    // 对象形式，直接使用
    routeConfig = { ...props.searchPageRoute }
  }

  // 将当前搜索值传递给搜索页面
  router.push({
    ...routeConfig,
    params: {
      ...routeConfig.params,
      initialValue: searchValue.value
    },
    query: {
      ...routeConfig.query,
      from: 'filter-header'
    }
  })
}

const blurEvent = () => {
  isInput.value = false
}

// const blurEvent = () => {
//   isInput.value = false
//   searchEvent(searchValue.value)
// }

const searchEvent = (e) => {
  emit('search', {
    sortOrder: sortOrder.value,
    searchValue: e
  })
}

// 清除搜索内容
const clearSearch = () => {
  searchValue.value = ''
  searchEvent('')
  // 当搜索内容被清空时，输入框不再处于输入状态
  isInput.value = false
}

// 清空筛选条件
const resetFilters = () => {
  // 清空搜索框
  searchValue.value = ''

  // 清空所有筛选条件
  clearClick()

  // 重置高亮图标状态
  highlightSerchIcon.value = false

  // 重置筛选条件数量
  filterCount.value = 0
}

// 设置指定筛选条件的值
const setFilterValue = (key, value) => {
  // 找到对应的筛选条件
  const targetFilter = searchList.value.find(item => item.key === key)
  if (targetFilter) {
    targetFilter.default = value
    // 同步更新 searchForm，确保筛选面板能正确显示选中状态
    // 对于 multiple 类型，或者当 targetFilter.nodeType === 'multiple' 时，确保值是数组
    if (targetFilter.nodeType === 'multiple') {
      const arrValue = Array.isArray(value) ? [...value] : value !== undefined && value !== null ? [value] : []
      searchForm[key] = [...arrValue]
      // 确保 multipleList 中有这个 key
      if (!multipleList.value.includes(key)) {
        multipleList.value.push(key)
      }
    } else {
      searchForm[key] = value
    }
    // 更新高亮状态
    highlightSerchIcon.value = true
    // 更新筛选计数
    updateFilterCount()
  } else {
    // 如果没找到对应的筛选条件（可能是还未初始化），先缓存值
    console.warn(`setFilterValue: 未找到 key=${key} 的筛选条件，可能还未初始化`)
  }
}

// 更新筛选计数
const updateFilterCount = () => {
  let count = 0
  searchList.value.forEach(filter => {
    if (filter.nodeType === 'single' || filter.nodeType === 'multiple') {
      if (Array.isArray(filter.default) && filter.default.length > 0) {
        count += filter.default.length
      } else if (filter.default && filter.default !== '') {
        count++
      }
    } else if (filter.nodeType === 'day' || filter.nodeType === 'search') {
      if (filter.default && filter.default.length > 0) {
        count++
      }
    }
  })
  filterCount.value = count
}

defineExpose({
  resetFilters,
  setFilterValue
})

const scanClick = () => {
  isHeaderScan.value = true
  // 1vin码 2钥匙 3合格证
  toScan()
}

const toggleSort = () => {
  // 切换状态然后再调接口
  sortOrder.value = !sortOrder.value
  emit('search', {
    sortOrder: sortOrder.value,
    searchValue: searchValue
  })
}

// 计算筛选条件数量
const calculateFilterCount = () => {
  let count = 0
  const processedKeys = new Set() // 用于跟踪已处理的键，防止重复计算
  console.log('searchList.value', searchForm)
  // 遍历 searchForm 中的所有字段
  for (const key in searchForm) {
    const value = searchForm[key]

    // 检查是否是时间类型的字段
    const isTimeField = searchList.value.some(
      (item) =>
        item.key === key &&
        ['year', 'month', 'day', 'hour', 'minute', 'second'].includes(item.nodeType)
    )

    if (value && isTimeField) {
      // 时间字段特殊处理：只要值存在且不为空，就算作1个条件
      if (Array.isArray(value) && value.length === 2 && value[0] && value[1]) {
        count += 1
        processedKeys.add(key) // 标记这个键已被处理
      }
    } else if (value) {
      // 非时间字段的常规处理
      if (Array.isArray(value)) {
        // 对于普通的数组类型，计算数组长度
        count += value.length
      } else if (typeof value === 'object' && value !== null) {
        // 对于对象类型，计算属性数量
        count += Object.keys(value).length
      } else if (typeof value === 'string') {
        // 对于字符串类型，只要有值就计数为1
        count += 1
      } else if (typeof value === 'number') {
        // 对于数字类型，只要有值就计数为1
        count += 1
      }
    }
  }

  // 检查choiceDic中的时间选择，但跳过已在searchForm中处理过的键
  for (const key in choiceDic) {
    // 如果这个键已经在searchForm中处理过了，跳过
    if (processedKeys.has(key)) {
      continue
    }

    const value = choiceDic[key]
    if (value && value !== '自选') {
      // 检查是否是时间类型的字段
      const isTimeField = searchList.value.some(
        (item) =>
          item.key === key &&
          ['year', 'month', 'day', 'hour', 'minute', 'second'].includes(item.nodeType)
      )

      if (isTimeField) {
        // 时间选择视为1个条件
        count += 1
      }
    }
  }

  filterCount.value = count
}

const updatePopupTop = () => {
  const layoutContent = document.querySelector('.layout-content')
  const baseHeader = document.querySelector('.base-container > header')
  const measuredTop =
    layoutContent?.getBoundingClientRect().top || baseHeader?.getBoundingClientRect().bottom

  popupTop.value = measuredTop
    ? `${Math.max(0, Math.round(measuredTop))}px`
    : 'var(--nav-bar-total-height, 46px)'
}

const showPannel = () => {
  updatePopupTop()
  popupShow.value = true
}

const hidePannel = () => {
  popupShow.value = false
}

const toggleActiveIndex = (_index) => {
  if (activeIndex.value !== _index) {
    activeIndex.value = _index
    // 左边点击，右边对应区块上滑
    itemRefs.value[_index].scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

const toggleOptionValue = (_key, _value, _type, _callBack, _resetDic) => {
  if (_type === 'single') {
    if (searchForm[_key] !== _value) {
      searchForm[_key] = _value
    } else {
      // 如果点击已选中的项，取消选择
      searchForm[_key] = ''
    }
    if (_callBack) {
      _callBack(searchForm[_key])
    }
  } else if (_type === 'multiple') {
    let arr = searchForm[_key]
    if (Array.isArray(arr) && arr.includes(_value)) {
      arr = arr.filter((item) => item !== _value)
    } else {
      arr.push(_value)
    }
    searchForm[_key] = arr
    if (_callBack) {
      _callBack(arr)
    }
    if (_resetDic) {
      Object.keys(_resetDic).map((_resetKey) => {
        // 创建深拷贝以避免引用共享问题
        if (typeof _resetDic[_resetKey] === 'object' && _resetDic[_resetKey] !== null) {
          if (Array.isArray(_resetDic[_resetKey])) {
            searchForm[_resetKey] = [..._resetDic[_resetKey]]
          } else {
            searchForm[_resetKey] = { ..._resetDic[_resetKey] }
          }
        } else {
          searchForm[_resetKey] = _resetDic[_resetKey]
        }
      })
    }
  } else if (_type === 'year' || _type === 'month' || _type === 'day') {
    if (searchForm[_key] !== _value) {
      searchForm[_key] = _value
      choiceDic[_key] = '自选'
    }
  }

  // 更新筛选条件数量
  calculateFilterCount()
}

// 搜索下拉组件 - 选择搜索结果项
const handleSearchSelect = (item, option) => {
  // 设置选中值
  searchForm[item.key] = option.value
  // 同步更新 item.default，避免 filterCount 计算错误
  item.default = option.value
  // 同步更新 searchKeyword 显示选中文本
  item.searchKeyword = option.label

  // 执行回调
  if (item.callBack) {
    item.callBack(option.value)
  }

  // 更新筛选条件数量
  calculateFilterCount()
}

// 搜索下拉组件 - 清空事件
const handleSearchClear = (item) => {
  // searchForm[item.key] 已由 v-model 清空
  // 同步清空 item.default 和 searchKeyword
  item.default = ''
  item.searchKeyword = ''
  searchForm[item.key] = ''
  // 更新筛选条件数量
  calculateFilterCount()
}

// 搜索下拉组件 - 聚焦事件（展示默认数据）
const handleSearchFocus = (item) => {
  // 如果没有数据且有获取默认数据的回调，则触发回调获取默认数据
  if ((!item.options || item.options.length === 0) && item.loadDefaultData) {
    item.loadDefaultData()
  }

  // 向外发出事件，让父组件（页面）可以监听处理
  emit('searchFocus', {
    key: item.key,
    item: item
  })
}

// 搜索下拉组件 - 搜索事件（根据关键词请求新数据）
const handleSearchInput = (item, keyword) => {
  // 1. 先触发 item 配置中的搜索回调（兼容原有方式）
  if (item.onSearch) {
    item.onSearch(keyword)
  }

  // 2. 向外发出事件，让父组件（页面）可以监听处理
  emit('searchChange', {
    key: item.key,
    keyword: keyword,
    item: item
  })
}

const clearClick = () => {
  Object.keys(searchForm).map((item) => {
    if (multipleList.value.includes(item)) {
      searchForm[item] = []
    } else {
      searchForm[item] = ''
    }
  })
  Object.keys(choiceDic).map((item) => {
    choiceDic[item] = '自选'
  })

  // 清空搜索下拉框的输入值
  searchList.value.forEach((item) => {
    if (item.nodeType === 'search') {
      item.searchKeyword = ''
    }
  })

  // 清除车系时，同步清空车型的options数据
  const modelItem = searchList.value.find(
    (item) => item.key === 'modelIdList' || item.key === 'modelId'
  )
  if (modelItem) {
    modelItem.options = []
  }

  // 重新计算筛选条件数量
  calculateFilterCount()

  // 基于筛选条件数量来决定高亮状态
  const _valueList = Object.values(searchForm)
  highlightSerchIcon.value = false
  for (const _value of _valueList) {
    if (typeof _value === 'string') {
      if (_value) {
        highlightSerchIcon.value = true
        break
      }
    } else if (typeof _value === 'object') {
      if (Array.isArray(_value)) {
        if (_value.length) {
          highlightSerchIcon.value = true
          break
        }
      }
    }
  }
}

const filterClick = () => {
  console.log(searchForm)

  // 重新计算筛选条件数量和高亮状态
  calculateFilterCount()

  // 基于筛选条件数量来决定高亮状态
  const _valueList = Object.values(searchForm)
  highlightSerchIcon.value = false
  for (const _value of _valueList) {
    if (typeof _value === 'string') {
      if (_value) {
        console.log('字符串', _value)
        highlightSerchIcon.value = true
        break
      }
    } else if (typeof _value === 'object') {
      if (Array.isArray(_value)) {
        if (_value.length) {
          console.log('数组', _value)
          highlightSerchIcon.value = true
          break
        }
      }
    }
  }

  emit('filterSearch', searchForm)
  hidePannel()
}

const showPick = (item) => {
  const key = item.key
  const type = item.nodeType
  const columnsType = item.columnsType
  if (type === 'year' || type === 'month' || type === 'day') {
    const now = new Date()
    const thirtyDaysBefore = new Date(new Date().valueOf() - 30 * 24 * 60 * 60 * 1000)
    Object.assign(tempTime, {
      key,
      type,
      selectType: 'start',
      columnsType,
      startTime: choiceDic[key] !== '自选' ? choiceDic[key][0] : formatDate(thirtyDaysBefore, type),
      endTime: choiceDic[key] !== '自选' ? choiceDic[key][1] : formatDate(now, type)
    })
  } else if (type === 'hour' || type === 'minute' || type === 'second') {
    const now = new Date()
    Object.assign(tempTime, {
      key,
      type,
      selectType: 'start',
      columnsType,
      startTime: choiceDic[key] !== '自选' ? choiceDic[key][0] : formatDate(now, type),
      endTime: choiceDic[key] !== '自选' ? choiceDic[key][1] : formatDate(now, type)
    })
  }
  pickVisible.value = true
}

const timeItemClick = (type) => {
  console.log(type)
  if (tempTime.selectType !== type) {
    tempTime.selectType = type
    console.log(tempTime)
  }
}

const pickClick = () => {
  const { startTime, endTime } = tempTime
  if (startTime.valueOf() > endTime.valueOf()) {
    const middleTime = startTime
    tempTime.startTime = tempTime.endTime
    tempTime.endTime = middleTime
  }
  pickVisible.value = false
  searchForm[tempTime.key] = [tempTime.startTime, tempTime.endTime]
  choiceDic[tempTime.key] = [tempTime.startTime, tempTime.endTime]

  // 重新计算筛选条件数量
  calculateFilterCount()
}
</script>

<style lang="scss" scoped>
.search-content {
  width: 100%;
  height: 45px;
  display: flex;
  align-items: center;
  padding: 0 12px;
  position: relative;
  background-color: #ffffff;
  .search-input {
    flex: 1;
    border-radius: 15px;
    padding-left: 3px;
    height: 30px;
    margin-right: 10px;
    position: relative;
    .van-search {
      height: 30px;
      padding: 0;
    }
  }
  .scan-icon {
    width: 30px;
    height: 30px;
    position: absolute;
    top: 0px;
    right: 8px;
    z-index: 2;
  }

  .search-input {
    position: relative;
  }

  /* 当显示扫描图标时，调整搜索框的清除按钮位置 */
  .search-input.with-scan {
    :deep(.van-search__content) {
      padding-right: 30px;
    }
  }

  .search-input.with-scan {
    :deep(.van-search__clear) {
      right: 30px;
    }
  }
  .toggle-content {
    display: flex;
    height: 30px;
    align-items: center;
    padding: 0 10px;
    border-radius: 30px;
    border: 1px solid #979797;
    margin-right: 10px;
    .toggle-icon {
      width: 30px;
      height: 30px;
    }
    .toggle-span {
      font-size: 12px;
      font-family:
        PingFangSC-Regular,
        PingFang SC;
      font-weight: 400;
      color: #000000;
      letter-spacing: 1px;
      word-break: keep-all;
    }
  }
  .search-btn {
    height: 26px;
    width: 52px;
    padding: 0 12px;
    background-color: #009100;
    color: #ffffff;
    border-radius: 15px;
    font-size: 12px;
    font-family:
      PingFangSC-Regular,
      PingFang SC;
    font-weight: 400;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .more-condition-container {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .more-condition-btn {
    width: 30px;
    height: 30px;
    border: 1px solid #979797;
    border-radius: 100% 100%;
  }
  .more-condition-btn-hl {
    border: 1px solid #00aa00;
  }
  .filter-count-badge {
    position: absolute;
    top: -5px;
    right: -5px;
    background-color: #009100;
    color: #ffffff;
    font-size: 10px;
    font-weight: bold;
    min-width: 16px;
    height: 16px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 4px;
    line-height: 1;
  }
}

.top-pop {
  border-radius: 0px 0px 32px 32px;
}

.topup-android,
.topup-ios {
  top: var(--nav-bar-total-height, 46px);
}

.pop-inner-content {
  position: relative;
  display: flex;
  flex-direction: column;
  .pop-scroll-view {
    width: 100%;
    height: 65vh;
    overflow-y: hidden;
    display: flex;
    .pop-scroll-left {
      width: 102px;
      overflow-y: auto;
      background: #f7f8fa;
      .title-text {
        width: 100%;
        text-align: left;
        padding: 22px 0;
        font-size: 14px;
        font-family:
          PingFangSC-Regular,
          PingFang SC;
        font-weight: 400;
        color: #191a1b;
        padding-left: 22px;
        line-height: 21px;
      }
      .active-title-text {
        color: #00aa00;
        background: #ffffff;
        position: relative;
        &::after {
          display: inline-block;
          width: 1.5px;
          height: 17px;
          content: '';
          background: #00aa00;
          position: absolute;
          top: 50%;
          left: 0;
          margin-top: -8.5px;
        }
      }
    }
    .pop-scroll-right {
      flex: 1;
      background: #ffffff;
      overflow-y: auto;
      .option-view {
        padding-bottom: 16px;
        margin: 18px 13px 0;
        border-bottom: 1px solid #f2f3f2;
        &:nth-last-of-type(1) {
          border-bottom: 0;
        }
        .option-title {
          font-size: 14px;
          font-family:
            PingFangSC-Medium,
            PingFang SC;
          font-weight: 500;
          color: #191a1b;
          margin-bottom: 12px;
        }
        .option-list {
          display: flex;
          flex-wrap: wrap;
          // justify-content: space-between;
          justify-content: flex-start;
          gap: 8px;
          .option-text {
            min-width: 77px;
            background: #ffffff;
            border-radius: 7px;
            border: 1px solid #dce0e4;
            line-height: 15px;
            text-align: center;
            font-size: 10px;
            font-family:
              PingFangSC-Regular,
              PingFang SC;
            font-weight: 400;
            color: #191a1b;
            word-break: keep-all;
            padding: 7px 4px;
            // margin-right: 8px;
            // margin-bottom: 8px;
          }
          .user-icon {
            // flex: 0 0 100%;
          }
          .active-option-text {
            border: 1px solid #00aa00;
            color: #00aa00;
          }
        }
      }
      .empty-text {
        color: #333;
        font-size: 12px;
      }
    }
  }
  .pop-inner-footer {
    width: 100%;
    height: 76px;
    background: #ffffff;
    display: flex;
    padding: 0 16px;
    align-items: center;
    justify-content: space-between;
    .clear-btn {
      font-size: 16px;
      font-family:
        PingFangSC-Medium,
        PingFang SC;
      font-weight: 500;
      color: #525452;
    }
    .search-btn {
      padding: 10px 32px;
      font-size: 16px;
      font-family:
        PingFangSC-Medium,
        PingFang SC;
      font-weight: 500;
      color: #ffffff;
      background: #00aa00;
      border-radius: 22px;
    }
  }
}

.pick-outter {
  background: transparent;
}

.pick-content {
  padding: 32px 24px 16px;
  background: #ffffff;
  box-shadow: 0px 0px 12px 0px rgba(0, 0, 0, 0.24);
  border-radius: 16px;
  .pick-title {
    font-size: 16px;
    font-family:
      PingFangSC,
      PingFang SC;
    font-weight: 500;
    color: #000000;
    letter-spacing: 1px;
    margin-bottom: 12px;
    text-align: center;
  }
  .pick-time-line {
    display: flex;
    align-items: center;
    margin-bottom: 6px;
    .pick-time-line-item {
      width: 135px;
      height: 28px;
      background: #f6f6f6;
      border-radius: 7px;
      text-align: center;
      line-height: 28px;
      color: #515351;
      font-size: 14px;
    }
    .pick-time-line-item-hl {
      color: #00aa00;
    }
    .pick-time-seperator {
      color: #515351;
      font-size: 16px;
      margin: 0 6px;
    }
  }
  .picker-inner {
    width: 288px;
    height: 150px;
    background: #f6f6f6;
    border-radius: 7px;
    margin-bottom: 16px;
    .van-picker {
      width: 100%;
      height: 100%;
      width: 288px;
      height: 150px;
    }
  }
  .pick-btn {
    width: 288px;
    height: 44px;
    background: #00aa00;
    border-radius: 11px;
    font-size: 14px;
    font-family:
      PingFangSC,
      PingFang SC;
    font-weight: 500;
    color: #ffffff;
    line-height: 44px;
    text-align: center;
  }
}

.search-input .van-search__content {
  background-color: #f7f7f7;
}

.search-input input.van-field__control {
  color: #000;
  font-size: 12px;
}
</style>

<template>
  <div class="search-dropdown-container">
    <van-field
      :model-value="innerKeyword"
      :placeholder="placeholder"
      :left-icon="null"
      clearable
      @focus="handleFocus"
      @blur="handleBlur"
      @update:model-value="handleInput"
      @clear="handleClear"
    />
    <!-- 搜索结果下拉列表 -->
    <div v-if="showDropdown && highlightedOptions.length > 0" class="search-dropdown-list">
      <p
        v-for="(optionItem, optionIndex) in highlightedOptions"
        :key="optionIndex"
        :class="
          isSelected(optionItem.value) ? 'dropdown-item active-dropdown-item' : 'dropdown-item'
        "
        @click="selectOption(optionItem)"
        v-html="optionItem.displayLabel"
      ></p>
    </div>
    <!-- 无搜索结果提示 -->
    <div v-if="showDropdown && options.length === 0 && innerKeyword" class="search-no-result">
      未找到匹配项
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { Field as VanField } from 'vant'

const props = defineProps({
  // 绑定值（支持字符串、数字、数组，兼容不同的使用场景）
  modelValue: {
    type: [String, Number, Array],
    default: '',
  },
  // 搜索关键词（用于显示选中的文本）
  searchKeyword: {
    type: String,
    default: '',
  },
  // 占位符
  placeholder: {
    type: String,
    default: '请输入搜索关键词',
  },
  // 选项列表，格式：[{ label: '显示文本', value: '值' }]
  // 由父组件控制数据，聚焦时父组件传默认10条，搜索时父组件传搜索结果
  options: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits([
  'update:modelValue',
  'update:searchKeyword',
  'select',
  'input',
  'clear',
  'focus', // 聚焦时触发，父组件可加载默认数据
  'onSearch', // 搜索时触发（重命名避免与原生事件冲突），父组件可根据关键词搜索
])

// 内部搜索关键词
const innerKeyword = ref(props.searchKeyword || '')

// 是否显示下拉列表
const showDropdown = ref(false)

// 防抖计时器
let searchDebounceTimer = null

// 监听外部传入的 searchKeyword 变化
watch(
  () => props.searchKeyword,
  (newVal) => {
    innerKeyword.value = newVal || ''
  },
)

// 处理聚焦事件 - 展示下拉列表（默认数据）
const handleFocus = () => {
  showDropdown.value = true
  emit('focus')
}

// 处理失焦事件 - 延迟关闭避免影响点击选择
const handleBlur = () => {
  setTimeout(() => {
    showDropdown.value = false
  }, 200)
}

// 处理输入事件 - 触发搜索，父组件更新 options（带防抖）
const handleInput = (value) => {
  // update:model-value 事件直接传递输入值
  innerKeyword.value = value
  showDropdown.value = true
  emit('input', value)
  emit('update:searchKeyword', value)

  // 清除之前的计时器
  if (searchDebounceTimer) {
    clearTimeout(searchDebounceTimer)
  }

  // 防抖处理：等待用户停止输入300ms后再触发搜索
  searchDebounceTimer = setTimeout(() => {
    emit('onSearch', value) // 通知父组件进行搜索（使用自定义事件名避免冲突）
  }, 300)
}

// 处理清除事件
const handleClear = () => {
  innerKeyword.value = ''
  showDropdown.value = false
  emit('clear')
  emit('update:searchKeyword', '')
}

// 选择选项
const selectOption = (optionItem) => {
  emit('update:modelValue', optionItem.value)
  emit('update:searchKeyword', optionItem.label)
  innerKeyword.value = optionItem.label
  showDropdown.value = false
  emit('select', optionItem)
}

// 判断是否选中（支持字符串、数字、数组类型）
const isSelected = (value) => {
  if (Array.isArray(props.modelValue)) {
    // 数组类型：判断值是否在数组中
    return props.modelValue.includes(value)
  }
  // 非数组类型：直接比较
  return props.modelValue === value
}

// 高亮处理后的选项列表
const highlightedOptions = computed(() => {
  const keyword = innerKeyword.value || ''

  // 没有关键词时直接返回原数据
  if (!keyword.trim()) {
    return props.options.map((item) => ({
      ...item,
      displayLabel: item.label,
    }))
  }

  // 对每个选项的 label 进行高亮处理
  return props.options.map((item) => {
    try {
      const regex = new RegExp(keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')
      const displayLabel = item.label.replace(regex, '<span style="color: #00aa00;">$&</span>')
      return {
        ...item,
        displayLabel,
      }
    } catch (e) {
      return {
        ...item,
        displayLabel: item.label,
      }
    }
  })
})

// 暴露方法
defineExpose({
  // 关闭下拉列表
  closeDropdown: () => {
    showDropdown.value = false
  },
  // 打开下拉列表
  openDropdown: () => {
    if (props.options.length > 0) {
      showDropdown.value = true
    }
  },
})
</script>

<style lang="scss" scoped>
.search-dropdown-container {
  position: relative;
  width: 100%;

  :deep(.van-cell) {
    padding: 0;
    background-color: transparent;
  }

  :deep(.van-field__control) {
    height: 28px;
    line-height: 28px;
    font-size: 14px;
    background: #f7f8fa;
    border-radius: 6px;
    padding: 0 12px;
  }
}

.search-dropdown-list {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  max-height: 200px;
  overflow-y: auto;
  background: #ffffff;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  margin-top: 4px;

  .dropdown-item {
    padding: 10px 12px;
    font-size: 14px;
    color: #191a1b;
    cursor: pointer;
    transition: background-color 0.2s;

    &:hover {
      background-color: #f7f8fa;
    }

    &:first-child {
      border-top-left-radius: 4px;
      border-top-right-radius: 4px;
    }

    &:last-child {
      border-bottom-left-radius: 4px;
      border-bottom-right-radius: 4px;
    }
  }

  .active-dropdown-item {
    background-color: #e6f4e6;
    color: #009100;
  }

  // 搜索关键词高亮
  .highlight-text {
    color: #00aa00;
    font-weight: 400;
  }
}

.search-no-result {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  padding: 20px;
  text-align: center;
  font-size: 14px;
  color: #999;
  background: #ffffff;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  margin-top: 4px;
}
</style>

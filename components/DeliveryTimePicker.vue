<template>
  <ais-popup
    :show="innerShow"
    position="bottom"
    :title="title"
    @close="onClose"
    :style="{ background: '#f4f4f4', height: '70%' }"
  >
    <template #content>
      <div class="delivery-time-picker">
        <div class="date-column">
          <div
            v-for="(item, index) in dates"
            :key="index"
            :class="['picker-item', { active: selectedDate === item.value }]"
            @click="onSelectDate(item)"
          >
            {{ item.label }}
          </div>
        </div>
        <div class="time-column">
          <div
            v-for="(item, index) in times"
            :key="index"
            :class="['picker-item', { active: selectedTime === item.value }]"
            @click="onSelectTime(item)"
          >
            <span class="time-text">{{ item.label }}</span>
            <van-icon
              v-if="selectedTime === item.value"
              name="success"
              size="16"
              color="#009100"
            />
          </div>
        </div>
      </div>
    </template>
  </ais-popup>
</template>

<script setup>
/**
 * DeliveryTimePicker - 通用日期时间选择器组件
 *
 * @property show       - v-model:show 控制弹框显示
 * @property modelValue  - v-model 已选择的日期时间，如 "2026-06-01 14:00:00"
 * @property title      - 弹框标题
 * @property dates      - 日期选项列表 [{value, label}]
 * @property times      - 时间选项列表 [{value, label}]
 *
 * @emits update:show
 * @emits update:modelValue
 * @emits confirm
 */
import { ref, computed, watch } from 'vue'
import AisPopup from '@/libs/components/AisPopup.vue'

const props = defineProps({
  show: { type: Boolean, default: false },
  modelValue: { type: String, default: '' },
  title: { type: String, default: '选择日期时间' },
  dates: { type: Array, default: () => [] },
  times: { type: Array, default: () => [] }
})

const emit = defineEmits(['update:show', 'update:modelValue', 'confirm'])

const innerShow = computed({
  get: () => props.show,
  set: (val) => emit('update:show', val)
})

const selectedDate = ref('')
const selectedTime = ref('')

watch(() => props.show, (val) => {
  if (val) {
    // 解析已有值
    if (props.modelValue) {
      const parts = props.modelValue.split(' ')
      selectedDate.value = parts[0] || ''
      selectedTime.value = parts.slice(1).join(' ') || ''
    } else {
      // 默认选中第一个日期和时间
      selectedDate.value = props.dates[0]?.value || ''
      selectedTime.value = props.times[0]?.value || ''
    }
  }
})

function onSelectDate(item) {
  selectedDate.value = item.value
}

function onSelectTime(item) {
  selectedTime.value = item.value
  const datetime = `${selectedDate.value} ${item.value}`
  emit('update:modelValue', datetime)
  emit('confirm', datetime)
}

function onClose() {
  innerShow.value = false
}
</script>

<style lang="scss" scoped>
.delivery-time-picker {
  display: flex;
  height: 100%;

  .date-column {
    width: 168px;
    background: #f5f5f5;
    overflow-y: auto;

    .picker-item {
      display: flex;
      align-items: center;
      height: 44px;
      padding-left: 16px;
      font-size: 14px;
      color: #191a1b;
      background: #f4f4f4;
      cursor: pointer;

      &.active {
        background: #ffffff;
        color: #009100;
      }
    }
  }

  .time-column {
    flex: 1;
    background: #ffffff;
    overflow-y: auto;

    .picker-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 44px;
      padding-left: 22px;
      padding-right: 16px;
      font-size: 14px;
      color: #191a1b;
      cursor: pointer;

      &.active {
        .time-text {
          color: #009100;
        }
      }
    }
  }
}
</style>

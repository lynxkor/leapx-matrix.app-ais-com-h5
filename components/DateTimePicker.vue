<template>
  <van-popup v-model:show="innerShow" position="bottom" round>
    <van-picker-group
      v-model:active-tab="activeTab"
      :title="title"
      :tabs="['选择日期', '选择时间']"
      @confirm="onConfirm"
      @cancel="onCancel"
    >
      <van-date-picker
        v-model="currentDate"
        :columns-type="['year', 'month', 'day']"
        :min-date="minDate"
        :max-date="maxDate"
      />
      <van-time-picker
        v-model="currentTime"
        :columns-type="['hour', 'minute', 'second']"
        :min-time="minTime"
        :min-hour="minHour"
        :max-hour="maxHour"
        :min-minute="minMinute"
        :max-minute="maxMinute"
      />
    </van-picker-group>
  </van-popup>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { showToast } from 'vant'

const props = defineProps({
  show: { type: Boolean, default: false },
  modelValue: { type: String, default: '' },
  title: { type: String, default: '选择日期时间' },
  minDate: {
    type: Date,
    default: () => new Date()
  },
  maxDate: {
    type: Date,
    default: () => {
      const d = new Date()
      d.setDate(d.getDate() + 100)
      return d
    }
  },
  minTime: { type: String, default: '00:00:00' },
  minHour: { type: Number, default: 8 },
  maxHour: { type: Number, default: 18 },
  minMinute: { type: Number, default: 0 },
  maxMinute: { type: Number, default: 60 }
})

const emit = defineEmits(['update:show', 'update:modelValue', 'confirm'])

const innerShow = computed({
  get: () => props.show,
  set: (val) => emit('update:show', val)
})

const activeTab = ref(0)
const currentDate = ref(['2026', '01', '01'])
const currentTime = ref(['08', '00', '00'])

watch(() => props.show, (val) => {
  if (val) {
    activeTab.value = 0
    if (props.modelValue) {
      const [datePart, timePart] = props.modelValue.split(' ')
      if (datePart) {
        currentDate.value = datePart.split('-')
      }
      if (timePart) {
        currentTime.value = timePart.split(':')
      }
    } else {
      const now = new Date()
      currentDate.value = [
        String(now.getFullYear()),
        String(now.getMonth() + 1).padStart(2, '0'),
        String(now.getDate()).padStart(2, '0')
      ]
      currentTime.value = [
        String(props.minHour).padStart(2, '0'),
        String(props.minMinute).padStart(2, '0'),
        '00'
      ]
    }
  }
})

function onConfirm() {
  const dateStr = currentDate.value.join('-')
  const timeStr = currentTime.value.join(':')
  const selected = new Date(`${dateStr}T${timeStr}`)
  const now = new Date()

  if (selected < now) {
    showToast('不能选择早于当前时间')
    return
  }

  const datetime = `${dateStr} ${timeStr}`
  emit('update:modelValue', datetime)
  emit('confirm', datetime)
  innerShow.value = false
}

function onCancel() {
  innerShow.value = false
}
</script>

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
        :min-time="effectiveMinTime"
        :max-time="effectiveMaxTime"
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

const isToday = computed(() => {
  const [y, m, d] = currentDate.value.map(Number)
  const now = new Date()
  return y === now.getFullYear() && m === now.getMonth() + 1 && d === now.getDate()
})

const effectiveMinHour = computed(() => {
  if (isToday.value) {
    const nowHour = new Date().getHours()
    return Math.min(Math.max(nowHour + 1, props.minHour), props.maxHour)
  }
  return props.minHour
})

const effectiveMinMinute = computed(() => {
  if (isToday.value) {
    const nowHour = new Date().getHours()
    if (effectiveMinHour.value === nowHour + 1) {
      const nowMin = new Date().getMinutes() + 1
      return Math.max(nowMin, props.minMinute)
    }
  }
  return props.minMinute
})

const effectiveMinTime = computed(() => {
  const h = String(effectiveMinHour.value).padStart(2, '0')
  const m = String(effectiveMinMinute.value).padStart(2, '0')
  return `${h}:${m}:00`
})

const effectiveMaxTime = computed(() => {
  const h = String(props.maxHour).padStart(2, '0')
  const m = String(props.maxMinute >= 60 ? 59 : props.maxMinute).padStart(2, '0')
  return `${h}:${m}:59`
})

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
      // 若当前时间已超过 maxHour，默认设为 minHour（用户需选未来日期才能选到）
      currentTime.value = [
        String(effectiveMinHour.value).padStart(2, '0'),
        String(effectiveMinMinute.value).padStart(2, '0'),
        '00'
      ]
    }
  }
})

watch(currentDate, () => {
  const hour = Number(currentTime.value[0])
  if (hour < effectiveMinHour.value || hour > props.maxHour) {
    currentTime.value = [
      String(effectiveMinHour.value).padStart(2, '0'),
      String(props.minMinute).padStart(2, '0'),
      '00'
    ]
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
